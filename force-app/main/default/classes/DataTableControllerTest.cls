

@IsTest
private class DataTableControllerTest {

    @testSetup
    static void setupData() {
        Account testAccount = new Account(
            Name = 'Test Account'
        );
        insert testAccount;

        Contact testContact = new Contact(
            LastName = 'Test Contact',
            AccountId = testAccount.Id
        );
        insert testContact;

        Lead testLead = new Lead(
            LastName = 'Test Lead',
            Company = 'Test Co'
        );
        insert testLead;

        Opportunity testOpp = new Opportunity(
            Name = 'Test Opp',
            AccountId = testAccount.Id,
            CloseDate = Date.today(),
            StageName = 'Prospecting'
        );
        insert testOpp;
    }

    // Helper
    private static List<DataTableController.RowResult> callSaveRows(
        List<Map<String, Object>> rows
    ) {
        return DataTableController.saveRows(rows);
    }

    @IsTest
    static void saveRows_allowsClearingNullableField() {
        Lead l = [
            SELECT Id, Title
            FROM Lead
            LIMIT 1
        ];

        l.Title = 'Will clear';
        update l;

        List<Map<String, Object>> rows = new List<Map<String, Object>>{
            new Map<String, Object>{
                'sObjectType' => 'Lead',
                'Id'          => l.Id,
                'Title'       => ''
            }
        };

        Test.startTest();
        List<DataTableController.RowResult> out =
            DataTableController.saveRows(rows);
        Test.stopTest();

        System.assertEquals(1, out.size());
        System.assert(out[0].success, out[0].error);

        Lead refreshed = [
            SELECT Title
            FROM Lead
            WHERE Id = :l.Id
        ];

        System.assertEquals(null, refreshed.Title);
    }

    @IsTest
    static void saveRows_marksFailure_whenMissingId() {
        List<Map<String, Object>> rows = new List<Map<String, Object>>{
            new Map<String, Object>{
                'sObjectType' => 'Account',
                'Name'        => 'Should Fail'
            }
        };

        Test.startTest();
        List<DataTableController.RowResult> out = callSaveRows(rows);
        Test.stopTest();

        System.assertEquals(1, out.size());
        System.assertEquals(false, out[0].success);
        System.assertEquals(null, out[0].id);
        System.assert(
            out[0].error.contains('Missing Id for update'),
            out[0].error
        );
    }

    @IsTest
    static void saveRows_groupsByType_Account_and_Contact() {
        Account acc = [
            SELECT Id, Name
            FROM Account
            LIMIT 1
        ];

        Contact con = [
            SELECT Id, LastName
            FROM Contact
            LIMIT 1
        ];

        List<Map<String, Object>> rows = new List<Map<String, Object>>{
            new Map<String, Object>{
                'sObjectType' => 'Account',
                'Id'          => acc.Id,
                'Name'        => 'Account Updated'
            },
            new Map<String, Object>{
                'sObjectType' => 'Contact',
                'Id'          => con.Id,
                'LastName'    => 'Contact Updated'
            }
        };

        Test.startTest();
        List<DataTableController.RowResult> out = callSaveRows(rows);
        Test.stopTest();

        System.assertEquals(2, out.size());

        Integer successCount = 0;

        for (DataTableController.RowResult rr : out) {
            if (rr.success) {
                successCount++;
            }
        }

        System.assertEquals(2, successCount);

        acc = [
            SELECT Name
            FROM Account
            WHERE Id = :acc.Id
        ];

        con = [
            SELECT LastName
            FROM Contact
            WHERE Id = :con.Id
        ];

        System.assertEquals('Account Updated', acc.Name);
        System.assertEquals('Contact Updated', con.LastName);
    }

    @IsTest
    static void saveRows_partialFailure_allOrNoneFalse() {
        Lead good = [
            SELECT Id, Title
            FROM Lead
            LIMIT 1
        ];

        Lead bad = new Lead(
            LastName = 'Bad',
            Company = 'Bad Co'
        );
        insert bad;

        List<Map<String, Object>> rows = new List<Map<String, Object>>{
            new Map<String, Object>{
                'sObjectType' => 'Lead',
                'Id'          => good.Id,
                'Title'       => 'Good Title Update'
            },
            new Map<String, Object>{
                'sObjectType' => 'Lead',
                'Id'          => bad.Id,
                'LastName'    => ''
            }
        };

        Test.startTest();
        List<DataTableController.RowResult> out =
            DataTableController.saveRows(rows);
        Test.stopTest();

        System.assertEquals(
            2,
            out.size(),
            'Unexpected response size.\nResponse:\n' +
            JSON.serializePretty(out)
        );

        Map<String, DataTableController.RowResult> byId =
            new Map<String, DataTableController.RowResult>();

        for (DataTableController.RowResult rr : out) {
            byId.put(rr.id, rr);
        }

        System.assertEquals(
            true,
            byId.get(String.valueOf(good.Id)).success,
            'GOOD ROW FAILED.\nResponse:\n' +
            JSON.serializePretty(out)
        );

        System.assertEquals(
            false,
            byId.get(String.valueOf(bad.Id)).success,
            'BAD ROW DID NOT FAIL.\nResponse:\n' +
            JSON.serializePretty(out)
        );

        System.assertNotEquals(
            null,
            byId.get(String.valueOf(bad.Id)).error,
            'BAD ROW HAS NO ERROR.\nResponse:\n' +
            JSON.serializePretty(out)
        );
    }

    @IsTest
    static void fetchListViewsByObject_returnsGroupedResults() {
        Test.startTest();

        List<Map<String, Object>> result =
            DataTableController.fetchListViewsByObject(
                new List<String>{ 'Lead' }
            );

        Test.stopTest();

        System.assertNotEquals(null, result);

        if (!result.isEmpty()) {
            System.assertEquals(
                'Lead',
                (String) result[0].get('objectApiName')
            );

            System.assertNotEquals(
                null,
                result[0].get('listViews')
            );
        }
    }

    @IsTest
    static void isAdminUser_matchesCurrentUserProfilePermissions() {
        User runningUser = [
            SELECT Id,
                   Profile.Name,
                   Profile.PermissionsModifyAllData
            FROM User
            WHERE Id = :UserInfo.getUserId()
            LIMIT 1
        ];

        Boolean expected =
            runningUser.Profile.PermissionsModifyAllData ||
            runningUser.Profile.Name == 'System Administrator';

        Test.startTest();
        Boolean actual = DataTableController.isAdminUser();
        Test.stopTest();

        System.assertEquals(expected, actual);
    }

    @IsTest
    static void getTableRecords_returnsPagedSortedRowsAndTotalCount() {
        insert new List<Lead>{
            new Lead(
                LastName = 'Alpha Paging',
                Company = 'Paging Co',
                Status = 'Open - Not Contacted'
            ),
            new Lead(
                LastName = 'Zulu Paging',
                Company = 'Paging Co',
                Status = 'Open - Not Contacted'
            )
        };

        List<String> fieldApiNames =
            new List<String>{ 'Id', 'LastName', 'Company' };

        String conditions = 'Company = \'Paging Co\' LIMIT 1';

        String sortByJson =
            '[{"fieldName":"LastName","sortDirection":"DESC"}]';

        Test.startTest();

        DataTableController.TableRecordsDto result =
            DataTableController.getTableRecords(
                'Lead',
                fieldApiNames,
                conditions,
                null,
                sortByJson
            );

        Test.stopTest();

        System.assertEquals(1, result.rows.size());
        System.assertEquals(true, result.hasNextPage);
        System.assertEquals(2, result.totalCount);

        System.assertEquals(
            'Zulu Paging',
            (String) result.rows[0].get('LastName')
        );
    }

    @IsTest
    static void getTableRecords_appliesSearchTermAcrossRequestedFields() {
        insert new List<Lead>{
            new Lead(
                LastName = 'Needle Match',
                Company = 'Searchable Co',
                Status = 'Open - Not Contacted'
            ),
            new Lead(
                LastName = 'Haystack Miss',
                Company = 'Different Co',
                Status = 'Open - Not Contacted'
            )
        };

        Test.startTest();

        DataTableController.TableRecordsDto result =
            DataTableController.getTableRecords(
                'Lead',
                new List<String>{ 'Id', 'LastName', 'Company' },
                null,
                'Searchable Co',
                null
            );

        Test.stopTest();

        System.assertEquals(1, result.rows.size());

        System.assertEquals(
            'Needle Match',
            (String) result.rows[0].get('LastName')
        );

        System.assertEquals(false, result.hasNextPage);
        System.assertEquals(1, result.totalCount);
    }

    @IsTest
    static void getTableRecords_throwsWhenObjectNameBlank() {
        Test.startTest();

        try {
            DataTableController.getTableRecords(
                '',
                new List<String>{ 'Id' },
                null,
                null,
                null
            );

            System.assert(false, 'Expected blank objectName to throw');

        } catch (Exception e) {
            System.assertNotEquals(null, e);
        }

        Test.stopTest();
    }

    @IsTest
    static void getTableRecords_throwsWhenFieldsMissing() {
        Test.startTest();

        try {
            DataTableController.getTableRecords(
                'Lead',
                new List<String>(),
                null,
                null,
                null
            );

            System.assert(false, 'Expected empty field list to throw');

        } catch (Exception e) {
            System.assertNotEquals(null, e);
        }

        Test.stopTest();
    }
}



/* ---OLD SETUP---
@isTest
private class DataTableControllerTest {
    
    @testSetup
    static void setupData() {
        // Create test Lead
        Lead testLead = new Lead(LastName = 'Test Lead', Company = 'Test Co', isConverted = false);
        insert testLead;

        // Create test Opportunity
        Opportunity testOpp = new Opportunity(Name = 'Test Opp', CloseDate = Date.today(), StageName = 'Prospecting');
        insert testOpp;

        // Create test Contract Award
        Contract_Award__c testAward = new Contract_Award__c(Name = 'Test Award');
        insert testAward;

        // Create test NSN Finished Part for each
        NSN_Finished_Part__c nsnLead = new NSN_Finished_Part__c(Name = 'NSN for Lead', Lead__c = testLead.Id);
        NSN_Finished_Part__c nsnOpp = new NSN_Finished_Part__c(Name = 'NSN for Opp', Opportunity__c = testOpp.Id);
        NSN_Finished_Part__c nsnAward = new NSN_Finished_Part__c(Name = 'NSN for Award', Contract_Award__c = testAward.Id);
        insert new List<NSN_Finished_Part__c>{ nsnLead, nsnOpp, nsnAward };

        // Create RFQs
        RFQ__c rfq1 = new RFQ__c(Name = 'RFQ Lead', NSN_Finished_Part__c = nsnLead.Id);
        RFQ__c rfq2 = new RFQ__c(Name = 'RFQ Opp', NSN_Finished_Part__c = nsnOpp.Id);
        RFQ__c rfq3 = new RFQ__c(Name = 'RFQ Award', NSN_Finished_Part__c = nsnAward.Id);
        insert new List<RFQ__c>{ rfq1, rfq2, rfq3 };

        // Create Line Items
        insert new List<RFQ_Line_Item__c>{
            new RFQ_Line_Item__c(Name = 'Line 1', RFQ__c = rfq1.Id),
            new RFQ_Line_Item__c(Name = 'Line 2', RFQ__c = rfq2.Id),
            new RFQ_Line_Item__c(Name = 'Line 3', RFQ__c = rfq3.Id)
        };
    }

    /*
    @isTest
    static void testGetAllRfqsAndLineItems_Lead() {
        Lead l = [SELECT Id FROM Lead LIMIT 1];
        Test.startTest();
        Map<String, Object> result = DataTableController.getAllRfqsAndLineItems(l.Id, 'Lead');
        Test.stopTest();
        System.assertNotEquals(null, result);
        System.assert(result.containsKey('parents'));
        System.assert(result.containsKey('children'));
    }

    @isTest
    static void testGetAllRfqsAndLineItems_Opportunity() {
        Opportunity o = [SELECT Id FROM Opportunity LIMIT 1];
        Test.startTest();
        Map<String, Object> result = DataTableController.getAllRfqsAndLineItems(o.Id, 'Opportunity');
        Test.stopTest();
        System.assertNotEquals(null, result);
        System.assert(result.containsKey('parents'));
        System.assert(result.containsKey('children'));
    }

    @isTest
    static void testGetAllRfqsAndLineItems_ContractAward() {
        Contract_Award__c ca = [SELECT Id FROM Contract_Award__c LIMIT 1];
        Test.startTest();
        Map<String, Object> result = DataTableController.getAllRfqsAndLineItems(ca.Id, 'Contract_Award__c');
        Test.stopTest();
        System.assertNotEquals(null, result);
        System.assert(result.containsKey('parents'));
        System.assert(result.containsKey('children'));
    }

    @isTest
    static void testGetAllRfqsAndLineItems_NoRecordId() {
        Test.startTest();
        Map<String, Object> result = DataTableController.getAllRfqsAndLineItems(null, 'Lead');
        Test.stopTest();
        System.assertNotEquals(null, result);
        System.assert(result.containsKey('parents'));
    }
    
    
    @isTest
    static void testGetLeadsWithTasks() {
        // Create Account
        Account acct = new Account(Name = 'Test Account');
        insert acct;

        // Create a Lead
        Lead testLead = new Lead(
            LastName = 'Test Lead',
            Company = 'Test Company',
            Status = 'Open - Not Contacted',
            isConverted = false,
            isClosed__c = false,
            Account__c = acct.Id
        );
        insert testLead;

        // Create a Task related to the Lead
        Task task = new Task(
            Subject = 'Follow up',
            WhoId = testLead.Id,
            Status = 'Not Started'
        );
        insert task;

        Test.startTest();
        Map<String, Object> result = DataTableController.getLeadsWithTasks();
        Test.stopTest();

        System.assertNotEquals(null, result, 'Result should not be null');
        System.assert(result.containsKey('parents'), 'Should contain key: parents');
        System.assert(result.containsKey('children'), 'Should contain key: children');

        List<SObject> parents = (List<SObject>)result.get('parents');
        List<SObject> children = (List<SObject>)result.get('children');

        System.assertNotEquals(0, parents.size(), 'Should return at least one Lead');
        System.assertNotEquals(0, children.size(), 'Should return at least one Task');
    }
    */
    /*
    @isTest
    static void testGetRelatedPartItems() {
        // Create an NSN Finished Part
        NSN_Finished_Part__c part = new NSN_Finished_Part__c(Name = 'Test Part');
        insert part;

        // Create related FAT
        FAT__c fat = new FAT__c(
            Name = 'Test FAT',
            NSN_Finished_Part__c = part.Id
        );
        insert fat;

        // Create related Service
        Service__c service = new Service__c(
            Name = 'Test Service',
            NSN_Finished_Part__c = part.Id,
            Service_Type__c = 'Repair'
        );
        insert service;

        // Create related Component
        Parts_and_Services__c component = new Parts_and_Services__c(
            Name = 'Test Component',
            NSN_Finished_Part__c = part.Id,
            Part_Number__c = '123-ABC',
            Type__c = 'Make'
        );
        insert component;

        Test.startTest();
        List<SObject> result = DataTableController.getRelatedPartItems(new List<Id>{ part.Id });
        Test.stopTest();

        System.assertNotEquals(null, result, 'Result should not be null');
        //System.assertEquals(3, result.size(), 'Should return 3 related SObjects (1 FAT, 1 Service, 1 Component)');
        System.assertEquals(3, result.size(), 'Should return 3 related SObjects (1 Service, 1 Component)');
    }
    */
	/*   
    static testMethod void testCreateRfq() {
        // Setup
        Account acct = new Account(Name = 'Test Account');
        insert acct;

        Contact contact = new Contact(LastName = 'Tester', AccountId = acct.Id);
        insert contact;

        Lead lead = new Lead(LastName = 'Tester', Company = 'ABC Corp', Status = 'Open');
        insert lead;

        NSN_Finished_Part__c part = new NSN_Finished_Part__c(Name = 'Finished Part A', Lead__c = lead.Id);
        insert part;

        FAT__c fat = new FAT__c(Name = 'FAT One', Type__c = 'X', NSN_Finished_Part__c = part.Id);
        insert fat;

        Service__c service = new Service__c(Name = 'Service One', Service_Type__c = 'Y', NSN_Finished_Part__c = part.Id);
        insert service;

        Parts_and_Services__c component = new Parts_and_Services__c(Name = 'Component One', Part_Number__c = 'ABC123', NSN_Finished_Part__c = part.Id);
        insert component;

        // Prepare input maps
        Map<String, String> rfq = new Map<String, String>{
            'NSN_Finished_Part__c' => part.Id,
            'Account__c' => acct.Id,
            'Contact__c' => contact.Id,
            'Name' => 'New RFQ'
        };

        Map<String, String> finishedPart = new Map<String, String>{
            'Id' => part.Id,
            'Name' => part.Name
        };

        List<Map<String, String>> relatedItems = new List<Map<String, String>>{
            new Map<String, String>{
                'Id' => fat.Id,
                'Name' => fat.Name,
                'objectApiName' => 'FAT__c'
            },
            new Map<String, String>{
                'Id' => service.Id,
                'Name' => service.Name,
                'objectApiName' => 'Service__c'
            },
            new Map<String, String>{
                'Id' => component.Id,
                'Name' => component.Name,
                'objectApiName' => 'Parts_and_Services__c'
            }
        };

        // Act
        Test.startTest();
        Id createdRfqId = DataTableController.createRfq(rfq, finishedPart, relatedItems);
        Test.stopTest();

        // Assert
        System.assertNotEquals(null, createdRfqId, 'RFQ Id should not be null');
        RFQ__c resultRfq = [SELECT Id, Account__c, Contact__c, NSN_Finished_Part__c FROM RFQ__c WHERE Id = :createdRfqId LIMIT 1];
        System.assertEquals(acct.Id, resultRfq.Account__c, 'Account should match');
        System.assertEquals(contact.Id, resultRfq.Contact__c, 'Contact should match');
        System.assertEquals(part.Id, resultRfq.NSN_Finished_Part__c, 'NSN Finished Part should match');

        List<RFQ_Line_Item__c> items = [
            SELECT Name, Type__c, NSN_Finished_Part__c, Component__c, FAT__c, Service__c 
            FROM RFQ_Line_Item__c 
            WHERE RFQ__c = :createdRfqId
        ];

        System.assertEquals(4, items.size(), 'Should create 4 line items');

        // Confirm each expected item is present (name logic follows truncateName)
        Boolean foundFinished = false, foundFAT = false, foundService = false, foundComponent = false;
        for (RFQ_Line_Item__c item : items) {
            if (item.Type__c == 'Finished Part' && item.NSN_Finished_Part__c == part.Id) {
                foundFinished = true;
            } else if (item.Type__c == 'FAT' && item.FAT__c == fat.Id && item.Name == DataTableController.truncateName('FAT: ' + fat.Name)) {
                foundFAT = true;
            } else if (item.Type__c == 'Service' && item.Service__c == service.Id && item.Name == DataTableController.truncateName('Service: ' + service.Name)) {
                foundService = true;
            } else if (item.Type__c == 'Component' && item.Component__c == component.Id && item.Name == DataTableController.truncateName('Component: ' + component.Name)) {
                foundComponent = true;
            }
        }

        System.assert(foundFinished, 'Finished part line item should exist');
        System.assert(foundFAT, 'FAT line item should exist');
        System.assert(foundService, 'Service line item should exist');
        System.assert(foundComponent, 'Component line item should exist');
    }
	
    @isTest
    static void testCreateRfq_withMissingFields_shouldReturnNull() {
        Map<String, String> newRfq = new Map<String, String>{
            'NSN_Finished_Part__c' => null,
            'Account__c' => null,
            'Name' => null,
            'Contact__c' => null
        };

        Map<String, String> dummyPart = new Map<String, String>{};
        List<Map<String, String>> dummyItems = new List<Map<String, String>>();

        Test.startTest();
        Id result = DataTableController.createRfq(newRfq, dummyPart, dummyItems);
        Test.stopTest();

        System.assertEquals(null, result, 'Should return null if required fields are missing');
    }
    */

    /*
    @isTest
    static void testGetRfqsAndRelatedItemsByRecordId() {
        // Setup test data
        Account acct = new Account(Name = 'Test Account');
        insert acct;
    
        Contact contact = new Contact(FirstName = 'Test', LastName = 'Contact', AccountId = acct.Id);
        insert contact;
    
        Lead lead = new Lead(LastName = 'Lead', Company = 'Company', Status = 'Open');
        insert lead;
    
        NSN_Finished_Part__c part = new NSN_Finished_Part__c(Name = 'Test Part', Lead__c = lead.Id);
        insert part;
    
        RFQ__c rfq = new RFQ__c(
            Name = 'Test RFQ',
            Account__c = acct.Id,
            Contact__c = contact.Id,
            NSN_Finished_Part__c = part.Id
        );
        insert rfq;
    
        RFQ_Line_Item__c item = new RFQ_Line_Item__c(
            Name = 'Line Item',
            RFQ__c = rfq.Id,
            NSN_Finished_Part__c = part.Id
        );
        insert item;
    
        // Test method
        Test.startTest();
        List<RFQ__c> results = DataTableController.getRfqsAndRelatedItemsByRecordId(new List<Id>{ rfq.Id });
        Test.stopTest();
    
        System.assertEquals(1, results.size(), 'Should return one RFQ');
        System.assertEquals(rfq.Id, results[0].Id, 'Returned RFQ ID should match');
        System.assertEquals(1, results[0].RFQ_Line_Item__r.size(), 'Should return one related line item');
        System.assertEquals(item.Id, results[0].RFQ_Line_Item__r[0].Id, 'Related line item should match');
    }
    */

    /*
    @isTest
    static void testUpdateRfq() {
        // SETUP — Create required data
        Account acct = new Account(Name = 'Test Account');
        insert acct;
    
        Contact contact = new Contact(LastName = 'Tester', AccountId = acct.Id);
        insert contact;
    
        Lead lead = new Lead(LastName = 'Test Lead', Company = 'Company', Status = 'Open');
        insert lead;
    
        NSN_Finished_Part__c part = new NSN_Finished_Part__c(Name = 'Test Part', Lead__c = lead.Id);
        insert part;
    
        // Initial RFQ
        RFQ__c rfq = new RFQ__c(
            Name = 'Initial RFQ',
            Account__c = acct.Id,
            Contact__c = contact.Id,
            NSN_Finished_Part__c = part.Id
        );
        insert rfq;
    
        // Existing Line Item to delete
        RFQ_Line_Item__c oldLineItem = new RFQ_Line_Item__c(
            Name = 'Old Line Item',
            RFQ__c = rfq.Id,
            Type__c = 'Finished Part',
            NSN_Finished_Part__c = part.Id
        );
        insert oldLineItem;
    
        // Create related items
        FAT__c fat = new FAT__c(Name = 'My FAT Item', Type__c = 'SomeType', NSN_Finished_Part__c = part.Id);
        Service__c service = new Service__c(Name = 'My Service Item', Service_Type__c = 'X', NSN_Finished_Part__c = part.Id);
        Parts_and_Services__c component = new Parts_and_Services__c(Name = 'My Component Item', Part_Number__c = 'XYZ', NSN_Finished_Part__c = part.Id);
        insert new List<SObject>{ fat, service, component };
    
        // Build rfq update map
        Map<String, String> rfqUpdate = new Map<String, String>{
            'Id' => rfq.Id,
            'Name' => 'Updated RFQ'
        };
    
        // Related line items to insert
        List<Map<String, String>> newItems = new List<Map<String, String>>{
            new Map<String, String>{
                'Id' => fat.Id,
                'Name' => fat.Name,
                'objectApiName' => 'FAT__c'
            },
            new Map<String, String>{
                'Id' => service.Id,
                'Name' => service.Name,
                'objectApiName' => 'Service__c'
            },
            new Map<String, String>{
                'Id' => component.Id,
                'Name' => component.Name,
                'objectApiName' => 'Parts_and_Services__c'
            }
        };
    
        List<String> toDelete = new List<String>{ oldLineItem.Id };
    
        Test.startTest();
        DataTableController.updateRfq(rfqUpdate, newItems, toDelete);
        Test.stopTest();
    
        // ASSERTIONS
    
        // Parent should be updated
        RFQ__c updatedRfq = [SELECT Name FROM RFQ__c WHERE Id = :rfq.Id];
        System.assertEquals('Updated RFQ', updatedRfq.Name, 'RFQ should be updated');
    
        // Deleted item should be gone
        System.assertEquals(0, [SELECT COUNT() FROM RFQ_Line_Item__c WHERE Id = :oldLineItem.Id], 'Old line item should be deleted');
    
        // New line items should exist
        List<RFQ_Line_Item__c> insertedItems = [
            SELECT Name, Type__c FROM RFQ_Line_Item__c WHERE RFQ__c = :rfq.Id
        ];
        System.assertEquals(3, insertedItems.size(), '3 new line items should be inserted');
    }
	
    
    // Helper
    private static List<DataTableController.RowResult> callSaveRows(List<Map<String, Object>> rows) {
        return DataTableController.saveRows(rows);
    }

    /*
    @IsTest
    static void saveRows_updatesRFQ_success() {
        RFQ__c rfq = [
            SELECT Id, Name
            FROM RFQ__c
            LIMIT 1
        ];

        List<Map<String, Object>> rows = new List<Map<String, Object>>{
            new Map<String, Object>{
                'sObjectType' => 'RFQ__c',
                'Id'          => rfq.Id,
                'Name'        => 'Updated RFQ Name'
            }
        };

        Test.startTest();
        List<DataTableController.RowResult> out = callSaveRows(rows);
        Test.stopTest();

        System.assertEquals(1, out.size());
        System.assert(out[0].success, out[0].error);

        RFQ__c updated = [SELECT Name FROM RFQ__c WHERE Id = :rfq.Id];
        System.assertEquals('Updated RFQ Name', updated.Name);
    }
    */

    /*
    @IsTest
    static void saveRows_allowsClearingNullableField() {
        Lead l = [
            SELECT Id, Title
            FROM Lead
            LIMIT 1
        ];
    
        // set a value first
        l.Title = 'Will clear';
        update l;
    
        List<Map<String, Object>> rows = new List<Map<String, Object>>{
            new Map<String, Object>{
                'sObjectType' => 'Lead',
                'Id'          => l.Id,
                'Title'       => ''   // blank -> should clear to null
            }
        };
    
        Test.startTest();
        List<DataTableController.RowResult> out = DataTableController.saveRows(rows);
        Test.stopTest();
    
        System.assertEquals(1, out.size());
        System.assert(out[0].success, out[0].error);
    
        Lead refreshed = [SELECT Title FROM Lead WHERE Id = :l.Id];
        System.assertEquals(null, refreshed.Title);

    }

    @IsTest
    static void saveRows_marksFailure_whenMissingId() {
        List<Map<String, Object>> rows = new List<Map<String, Object>>{
            new Map<String, Object>{
                'sObjectType' => 'RFQ__c',
                'Name'        => 'Should Fail'
            }
        };

        Test.startTest();
        List<DataTableController.RowResult> out = callSaveRows(rows);
        Test.stopTest();

        System.assertEquals(1, out.size());
        System.assertEquals(false, out[0].success);
        System.assertEquals(null, out[0].id);
        System.assert(
            out[0].error.contains('Missing Id for update'),
            out[0].error
        );
    }

    @IsTest
    static void saveRows_groupsByType_RFQ_and_LineItem() {
        RFQ__c rfq = [SELECT Id, Name FROM RFQ__c LIMIT 1];
        RFQ_Line_Item__c li = [SELECT Id, Name FROM RFQ_Line_Item__c LIMIT 1];

        List<Map<String, Object>> rows = new List<Map<String, Object>>{
            new Map<String, Object>{
                'sObjectType' => 'RFQ__c',
                'Id'          => rfq.Id,
                'Name'        => 'RFQ Updated'
            },
            new Map<String, Object>{
                'sObjectType' => 'RFQ_Line_Item__c',
                'Id'          => li.Id,
                'Name'        => 'Line Updated'
            }
        };

        Test.startTest();
        List<DataTableController.RowResult> out = callSaveRows(rows);
        Test.stopTest();

        System.assertEquals(2, out.size());

        Integer successCount = 0;
        for (DataTableController.RowResult rr : out) {
            if (rr.success) successCount++;
        }
        System.assertEquals(2, successCount);

        rfq = [SELECT Name FROM RFQ__c WHERE Id = :rfq.Id];
        li  = [SELECT Name FROM RFQ_Line_Item__c WHERE Id = :li.Id];

        System.assertEquals('RFQ Updated', rfq.Name);
        System.assertEquals('Line Updated', li.Name);
    }

    @IsTest
    static void saveRows_partialFailure_allOrNoneFalse() {
        Lead good = [
            SELECT Id, Title
            FROM Lead
            LIMIT 1
        ];
    
        Lead bad = new Lead(LastName = 'Bad', Company = 'Bad Co');
        insert bad;
    
        List<Map<String, Object>> rows = new List<Map<String, Object>>{
            new Map<String, Object>{
                'sObjectType' => 'Lead',
                'Id'          => good.Id,
                'Title'       => 'Good Title Update'
            },
            new Map<String, Object>{
                'sObjectType' => 'Lead',
                'Id'          => bad.Id,
                'LastName'    => '' // blank -> coerced to null -> required -> FAIL
            }
        };
    
        Test.startTest();
        List<DataTableController.RowResult> out =
            DataTableController.saveRows(rows);
        Test.stopTest();
    
        // ---- DEBUG OUTPUT ----
        System.debug('saveRows response (raw): ' + JSON.serializePretty(out));
    
        String dump = '';
        for (DataTableController.RowResult rr : out) {
            dump +=
                '\nId=' + rr.id +
                ' success=' + rr.success +
                ' error=' + rr.error;
        }
        System.debug('saveRows parsed rows:' + dump);
        // ----------------------
    
        System.assertEquals(
            2,
            out.size(),
            'Unexpected response size.\nResponse:\n' + JSON.serializePretty(out)
        );
    
        Map<String, DataTableController.RowResult> byId =
            new Map<String, DataTableController.RowResult>();
        for (DataTableController.RowResult rr : out) {
            byId.put(rr.id, rr);
        }
    
        System.assertEquals(
            true,
            byId.get(String.valueOf(good.Id)).success,
            'GOOD ROW FAILED.\nResponse:\n' + JSON.serializePretty(out)
        );
    
        System.assertEquals(
            false,
            byId.get(String.valueOf(bad.Id)).success,
            'BAD ROW DID NOT FAIL.\nResponse:\n' + JSON.serializePretty(out)
        );
    
        System.assertNotEquals(
            null,
            byId.get(String.valueOf(bad.Id)).error,
            'BAD ROW HAS NO ERROR.\nResponse:\n' + JSON.serializePretty(out)
        );
    }
    
    
    /*
    @IsTest
    static void getListViewFinishedParts_returnsEmpty_whenBlankInputs() {
        Lead l = [SELECT Id FROM Lead LIMIT 1];
    
        Test.startTest();
        List<NSN_Finished_Part__c> a = DataTableController.getListViewFinishedParts(null, new List<Id>{ l.Id });
        List<NSN_Finished_Part__c> b = DataTableController.getListViewFinishedParts('',   new List<Id>{ l.Id });
        List<NSN_Finished_Part__c> c = DataTableController.getListViewFinishedParts('Lead__c', null);
        List<NSN_Finished_Part__c> d = DataTableController.getListViewFinishedParts('Lead__c', new List<Id>());
        Test.stopTest();
    
        System.assertEquals(0, a.size());
        System.assertEquals(0, b.size());
        System.assertEquals(0, c.size());
        System.assertEquals(0, d.size());
    }
    
    @IsTest
    static void getListViewFinishedParts_byLead_returnsOnlyMatching() {
        // should exist from your @testSetup
        Lead lead1 = [SELECT Id FROM Lead LIMIT 1];
    
        // add a second lead + nsn to prove filtering is correct
        Lead lead2 = new Lead(LastName='Other', Company='Other Co', isConverted=false);
        insert lead2;
    
        NSN_Finished_Part__c nsn2 = new NSN_Finished_Part__c(
            Name   = 'NSN Other Lead',
            Lead__c = lead2.Id
        );
        insert nsn2;
    
        Test.startTest();
        List<NSN_Finished_Part__c> rows =
            DataTableController.getListViewFinishedParts('Lead__c', new List<Id>{ lead2.Id });
        Test.stopTest();
    
        System.assertEquals(
            1,
            rows.size(),
            'Expected exactly 1 record.\nResponse:\n' + JSON.serializePretty(rows)
        );
        System.assertEquals(nsn2.Id, rows[0].Id);
    }
    
    @IsTest
    static void getListViewFinishedParts_supportsMultipleIds() {
        Lead l1 = new Lead(LastName='L1', Company='C1', isConverted=false);
        Lead l2 = new Lead(LastName='L2', Company='C2', isConverted=false);
        insert new List<Lead>{ l1, l2 };
    
        NSN_Finished_Part__c n1 = new NSN_Finished_Part__c(Name='NSN L1', Lead__c=l1.Id);
        NSN_Finished_Part__c n2 = new NSN_Finished_Part__c(Name='NSN L2', Lead__c=l2.Id);
        insert new List<NSN_Finished_Part__c>{ n1, n2 };
    
        Test.startTest();
        List<NSN_Finished_Part__c> rows =
            DataTableController.getListViewFinishedParts('Lead__c', new List<Id>{ l1.Id, l2.Id });
        Test.stopTest();
    
        System.assertEquals(
            2,
            rows.size(),
            'Expected 2 records.\nResponse:\n' + JSON.serializePretty(rows)
        );
    
        Set<Id> got = new Set<Id>();
        for (NSN_Finished_Part__c r : rows) got.add(r.Id);
    
        System.assert(got.contains(n1.Id));
        System.assert(got.contains(n2.Id));
    }
    
    @IsTest
    static void getListViewFinishedParts_throws_onBadLookupField() {
        Lead l = [SELECT Id FROM Lead LIMIT 1];
    
        Test.startTest();
        try {
            DataTableController.getListViewFinishedParts(
                'NotAField__c',
                new List<Id>{ l.Id }
            );
            System.assert(false, 'Expected an exception to be thrown');
        } catch (Exception e) {
            System.debug('Exception message: ' + e.getMessage());
    
            System.assert(
                e.getMessage().contains('Script'),
                'Expected script-thrown exception but got:\n' + e.getMessage()
            );
        }
        Test.stopTest();
    }
    */
    
    /*
    @IsTest
    static void fetchAllFinishedParts_returnsOnlyOpenRelatedRecords() {
        Lead openLead = new Lead(
            LastName = 'Open Lead',
            Company = 'Open Co',
            isConverted = false,
            isClosed__c = false
        );
        Lead closedLead = new Lead(
            LastName = 'Closed Lead',
            Company = 'Closed Co',
            isConverted = false,
            isClosed__c = true
        );
        insert new List<Lead>{ openLead, closedLead };

        Opportunity openOpp = new Opportunity(
            Name = 'Open Opportunity',
            CloseDate = Date.today().addDays(10),
            StageName = 'Prospecting'
        );
        Opportunity closedOpp = new Opportunity(
            Name = 'Closed Opportunity',
            CloseDate = Date.today().addDays(10),
            StageName = 'Closed Won'
        );
        insert new List<Opportunity>{ openOpp, closedOpp };

        Contract_Award__c openAward = new Contract_Award__c(
            Name = 'Open Award',
            isClosed__c = false
        );
        Contract_Award__c closedAward = new Contract_Award__c(
            Name = 'Closed Award',
            isClosed__c = true
        );
        insert new List<Contract_Award__c>{ openAward, closedAward };

        NSN_Finished_Part__c openPart = new NSN_Finished_Part__c(
            Name = 'Open Related Part',
            Lead__c = openLead.Id,
            Opportunity__c = openOpp.Id,
            Contract_Award__c = openAward.Id
        );
        NSN_Finished_Part__c fullyClosedPart = new NSN_Finished_Part__c(
            Name = 'Fully Closed Related Part',
            Lead__c = closedLead.Id,
            Opportunity__c = closedOpp.Id,
            Contract_Award__c = closedAward.Id
        );
        insert new List<NSN_Finished_Part__c>{
            openPart,
            fullyClosedPart
        };

        Test.startTest();
        List<NSN_Finished_Part__c> results = DataTableController.fetchAllFinishedParts();
        Test.stopTest();

        Set<Id> resultIds = new Set<Id>();
        for (NSN_Finished_Part__c row : results) {
            resultIds.add(row.Id);
        }

        System.assert(resultIds.contains(openPart.Id), 'Part with open related records should be returned');
        System.assert(
            !resultIds.contains(fullyClosedPart.Id),
            'Part with all related records closed should be filtered out'
        );
    }
    */

    /*
    @IsTest
    static void fetchListViewsByObject_returnsGroupedResults() {
        Test.startTest();
        List<Map<String, Object>> result =
            DataTableController.fetchListViewsByObject(new List<String>{ 'Lead' });
        Test.stopTest();

        System.assertNotEquals(null, result, 'Result should not be null');

        if (!result.isEmpty()) {
            System.assertEquals(
                'Lead',
                (String) result[0].get('objectApiName'),
                'Grouping should preserve the requested object API name'
            );
            System.assertNotEquals(
                null,
                result[0].get('listViews'),
                'Each grouped result should include list views'
            );
        }
    }

    @IsTest
    static void isAdminUser_matchesCurrentUserProfilePermissions() {
        User runningUser = [
            SELECT Id, Profile.Name, Profile.PermissionsModifyAllData
            FROM User
            WHERE Id = :UserInfo.getUserId()
            LIMIT 1
        ];

        Boolean expected =
            runningUser.Profile.PermissionsModifyAllData ||
            runningUser.Profile.Name == 'System Administrator';

        Test.startTest();
        Boolean actual = DataTableController.isAdminUser();
        Test.stopTest();

        System.assertEquals(expected, actual);
    }

    @IsTest
    static void getTableRecords_returnsPagedSortedRowsAndTotalCount() {
        insert new List<Lead>{
            new Lead(LastName = 'Alpha Paging', Company = 'Paging Co', Status = 'Open - Not Contacted'),
            new Lead(LastName = 'Zulu Paging', Company = 'Paging Co', Status = 'Open - Not Contacted')
        };

        List<String> fieldApiNames = new List<String>{ 'Id', 'LastName', 'Company' };
        String conditions = 'Company = \'Paging Co\' LIMIT 1';
        String sortByJson =
            '[{"fieldName":"LastName","sortDirection":"DESC"}]';

        Test.startTest();
        DataTableController.TableRecordsDto result = DataTableController.getTableRecords(
            'Lead',
            fieldApiNames,
            conditions,
            null,
            sortByJson
        );
        Test.stopTest();

        System.assertEquals(1, result.rows.size(), 'Page size should honor the requested LIMIT');
        System.assertEquals(true, result.hasNextPage, 'A second matching record should set hasNextPage');
        System.assertEquals(2, result.totalCount, 'Total count should ignore pagination');
        System.assertEquals(
            'Zulu Paging',
            (String) result.rows[0].get('LastName'),
            'Rows should respect the requested sort order'
        );
    }

    @IsTest
    static void getTableRecords_appliesSearchTermAcrossRequestedFields() {
        insert new List<Lead>{
            new Lead(LastName = 'Needle Match', Company = 'Searchable Co', Status = 'Open - Not Contacted'),
            new Lead(LastName = 'Haystack Miss', Company = 'Different Co', Status = 'Open - Not Contacted')
        };

        Test.startTest();
        DataTableController.TableRecordsDto result = DataTableController.getTableRecords(
            'Lead',
            new List<String>{ 'Id', 'LastName', 'Company' },
            null,
            'Searchable Co',
            null
        );
        Test.stopTest();

        System.assertEquals(1, result.rows.size(), 'Search should narrow results to matching rows');
        System.assertEquals('Needle Match', (String) result.rows[0].get('LastName'));
        System.assertEquals(false, result.hasNextPage);
        System.assertEquals(1, result.totalCount);
    }

    @IsTest
    static void getTableRecords_throwsWhenObjectNameBlank() {
        Test.startTest();
        try {
            DataTableController.getTableRecords(
                '',
                new List<String>{ 'Id' },
                null,
                null,
                null
            );
            System.assert(false, 'Expected blank objectName to throw');
        } catch (Exception e) {
            System.assertNotEquals(null, e, 'Any exception here is acceptable for this guard clause');
        }
        Test.stopTest();
    }

    @IsTest
    static void getTableRecords_throwsWhenFieldsMissing() {
        Test.startTest();
        try {
            DataTableController.getTableRecords(
                'Lead',
                new List<String>(),
                null,
                null,
                null
            );
            System.assert(false, 'Expected empty field list to throw');
        } catch (Exception e) {
            System.assertNotEquals(null, e, 'Any exception here is acceptable for this guard clause');
        }
        Test.stopTest();
    }
}
*/
