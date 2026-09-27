/**
* Unit tests for UiApiLikeListController
* - No SeeAllData
* - Validates ORDER BY handling, paging tokens, search, filterCriteria, and field mapping
*/
@IsTest
private class UiApiLikeListControllerTest {

    @TestSetup
    static void setupData() {
        List<Lead> leads = new List<Lead>();
        for (Integer i = 0; i < 25; i++) {
            Lead l = new Lead(
                LastName = 'Test ' + String.valueOf(i),
                Company = 'Acme ' + String.valueOf(25 - i),
                Status = 'Open - Not Contacted'
            );
            leads.add(l);
        }
        insert leads;
    }

    private static List<String> baseFields() {
        return new List<String>{
            'Lead.Name',
            'Lead.Company',
            'Lead.Status',
            'Lead.Owner.NameOrAlias',
            'Lead.CreatedDate'
        };
    }

    @IsTest
    static void testOrderByCreatedDateAsc() {
        String objectApiName = 'Lead';
        String listViewApiName = 'Unit_Test_View';
        List<String> fields = new List<String>{
            'Lead.Name',
            'Lead.Company',
            'Lead.Status',
            'Lead.CreatedDate'
        };
        Integer pageSize = 10;
        String pageToken = '0';
        String filterCriteria = null;
        String searchTerm = null;
        String sortByJson = '{"fieldApiName":"Lead.CreatedDate","direction":"ASC","nullsPreference":"LAST"}';

        Lead debugLead = [
            SELECT Id, OwnerId
            FROM Lead
            LIMIT 1
        ];

        System.debug(LoggingLevel.ERROR,
            'TEST LEAD OWNER DEBUG → ' +
            'LeadId=' + debugLead.Id +
            ', OwnerId=' + debugLead.OwnerId
        );

        System.assertNotEquals(
            null,
            debugLead.OwnerId,
            'Inserted lead should have an OwnerId assigned. LeadId=' + debugLead.Id
        );

        Test.startTest();
        UiApiLikeListController.ResponseDto res = UiApiLikeListController.getListRecords(
            objectApiName,
            listViewApiName,
            fields,
            pageSize,
            pageToken,
            filterCriteria,
            searchTerm,
            sortByJson, 
            null
        );
        Test.stopTest();

        System.assertNotEquals(null, res, 'Response should not be null');
        System.assertEquals(10, res.pageSize, 'Page size mismatch. Expected: 10, Actual: ' + res.pageSize);
        System.assertEquals('0', res.currentPageToken, 'Current token mismatch. Expected: 0, Actual: ' + res.currentPageToken);
        System.assertEquals('10', res.nextPageToken, 'Next token mismatch. Expected: 10, Actual: ' + res.nextPageToken);
        System.assertEquals(null, res.previousPageToken, 'Previous token mismatch. Expected: null, Actual: ' + res.previousPageToken);
        System.assertEquals(
            true,
            res.records != null && res.records.size() > 0,
            'Expected records but got none. Record count: ' + (res.records == null ? 'null' : String.valueOf(res.records.size()))
        );

        UiApiLikeListController.RecordDto first = res.records[0];

        System.assert(
            first.fields.containsKey('Company'),
            'Company field should be present. Actual field keys: ' + first.fields.keySet()
        );
        System.assert(
            first.fields.containsKey('Name'),
            'Name field should be present. Actual field keys: ' + first.fields.keySet()
        );
        System.assert(
            first.fields.containsKey('Status'),
            'Status field should be present. Actual field keys: ' + first.fields.keySet()
        );
        System.assert(
            first.fields.containsKey('CreatedDate'),
            'CreatedDate field should be present. Actual field keys: ' + first.fields.keySet()
        );

        Datetime previousCreatedDate = null;
        for (UiApiLikeListController.RecordDto rec : res.records) {
            System.assert(
                rec.fields.containsKey('CreatedDate'),
                'Every returned record should include CreatedDate. Record Id: ' + rec.id
            );

            Object createdDateVal = rec.fields.get('CreatedDate').value;
            System.assertNotEquals(
                null,
                createdDateVal,
                'CreatedDate value should not be null. Record Id: ' + rec.id
            );
            System.assertEquals(
                true,
                createdDateVal instanceof Datetime,
                'CreatedDate value should be a Datetime. Record Id: ' + rec.id + ', Actual: ' + String.valueOf(createdDateVal)
            );

            Datetime currentCreatedDate = (Datetime) createdDateVal;

            if (previousCreatedDate != null) {
                System.assertEquals(
                    true,
                    previousCreatedDate.getTime() <= currentCreatedDate.getTime(),
                    'Records are not sorted by CreatedDate ASC. Previous=' + previousCreatedDate + ', Current=' + currentCreatedDate + ', Record Id=' + rec.id
                );
            }

            previousCreatedDate = currentCreatedDate;
        }
    }

    @IsTest
    static void testPagingSecondPage() {
        String objectApiName = 'Lead';
        String listViewApiName = 'Unit_Test_View';
        List<String> fields = baseFields();
        Integer pageSize = 10;
        String pageToken = '10';
        String filterCriteria = null;
        String searchTerm = null;
        String sortByJson = '{"fieldApiName":"Lead.CreatedDate","direction":"DESC","nullsPreference":"LAST"}';

        Test.startTest();
        UiApiLikeListController.ResponseDto res = UiApiLikeListController.getListRecords(
            objectApiName, listViewApiName, fields, pageSize, pageToken, filterCriteria, searchTerm, sortByJson, null
        );
        Test.stopTest();

        System.assertEquals('10', res.currentPageToken, 'Current token should match request');
        System.assertEquals('20', res.nextPageToken, 'Next token should be 20 for second page');
        System.assertEquals('0', res.previousPageToken, 'Prev token should be 0 for second page');
        System.assertEquals(10, res.records.size(), 'Second page should return a full page when enough rows exist');
    }

    @IsTest
    static void testSearchTermOnName() {
        String objectApiName = 'Lead';
        String listViewApiName = 'Unit_Test_View';
        List<String> fields = baseFields();
        Integer pageSize = 10;
        String pageToken = '0';
        String filterCriteria = null;
        String searchTerm = 'Test';
        String sortByJson = '{"fieldApiName":"Lead.Name","direction":"ASC","nullsPreference":"LAST"}';

        Test.startTest();
        UiApiLikeListController.ResponseDto res = UiApiLikeListController.getListRecords(
            objectApiName, listViewApiName, fields, pageSize, pageToken, filterCriteria, searchTerm, sortByJson, null
        );
        Test.stopTest();

        System.assertNotEquals(null, res.records, 'Records should not be null');
        System.assertEquals(true, res.records.size() > 0, 'Search should return records');
    }

    @IsTest
    static void testFilterCriteriaEq() {
        String objectApiName = 'Lead';
        String listViewApiName = 'Unit_Test_View';
        List<String> fields = baseFields();
        Integer pageSize = 10;
        String pageToken = '0';
        String filterCriteria = 'Lead.Status = \'Open - Not Contacted\'';
        String searchTerm = null;
        String sortByJson = '{"fieldApiName":"Lead.Name","direction":"ASC","nullsPreference":"LAST"}';

        Test.startTest();
        UiApiLikeListController.ResponseDto res = UiApiLikeListController.getListRecords(
            objectApiName, listViewApiName, fields, pageSize, pageToken, filterCriteria, searchTerm, sortByJson, null
        );
        Test.stopTest();

        System.assert(res.records != null && res.records.size() > 0, 'Filter eq should return records');
        UiApiLikeListController.RecordDto first = res.records[0];
        System.assertEquals('Open - Not Contacted',
            (String) first.fields.get('Status').value,
            'Returned Status should match filter');
    }

    @IsTest
    static void testMultiSort() {
        String objectApiName = 'Lead';
        String listViewApiName = 'Unit_Test_View';
        List<String> fields = baseFields();
        Integer pageSize = 10;
        String pageToken = '0';
        String filterCriteria = null;
        String searchTerm = null;
        // Multi-sort: Company ASC, CreatedDate DESC
        String sortByJson = '[{"fieldApiName":"Lead.Company","direction":"ASC","nullsPreference":"LAST"},' +
                            '{"fieldApiName":"Lead.CreatedDate","direction":"DESC","nullsPreference":"LAST"}]';

        Test.startTest();
        UiApiLikeListController.ResponseDto res = UiApiLikeListController.getListRecords(
            objectApiName, listViewApiName, fields, pageSize, pageToken, filterCriteria, searchTerm, sortByJson, null
        );
        Test.stopTest();

        System.assertNotEquals(null, res, 'Response should not be null');
        System.assertEquals(10, res.records.size(), 'Should return a full page');
    }
    @IsTest
    static void testInvalidPageTokenDefaultsToZero() {
        Test.startTest();
        UiApiLikeListController.ResponseDto res = UiApiLikeListController.getListRecords(
            'Lead',
            'Unit_Test_View',
            baseFields(),
            10,
            'abc',
            null,
            null,
            '{"fieldApiName":"Lead.CreatedDate","direction":"ASC","nullsPreference":"LAST"}',
            null
        );
        Test.stopTest();

        System.assertEquals('0', res.currentPageToken);
    }
    @IsTest
    static void testBlankSortByJson() {
        Test.startTest();
        UiApiLikeListController.ResponseDto res = UiApiLikeListController.getListRecords(
            'Lead',
            'Unit_Test_View',
            baseFields(),
            10,
            '0',
            null,
            null,
            null, 
            null
        );
        Test.stopTest();

        System.assertNotEquals(null, res);
        System.assertEquals(10, res.records.size());
    }
    @IsTest
    static void testInvalidFieldThrows() {
        try {
            UiApiLikeListController.getListRecords(
                'Lead',
                'Unit_Test_View',
                new List<String>{ 'Name' },
                10,
                '0',
                null,
                null,
                null, 
                null
            );
            System.assert(false, 'Expected AuraHandledException but no exception was thrown.');
        } catch (AuraHandledException e) {
            System.assert(
                e.getMessage().contains('fully qualified'),
                'Expected error message to contain "fully qualified", but actual was: ' + e.getMessage()
            );
        }
    }
    @IsTest
    static void testFilterCriteriaIn() {
        Test.startTest();
        UiApiLikeListController.ResponseDto res = UiApiLikeListController.getListRecords(
            'Lead',
            'Unit_Test_View',
            baseFields(),
            10,
            '0',
            'Lead.Status IN (\'Open - Not Contacted\')',
            null,
            '{"fieldApiName":"Lead.Name","direction":"ASC","nullsPreference":"LAST"}',
            null
        );
        Test.stopTest();

        System.assert(res.records.size() > 0);
    }
    @IsTest
    static void testInvalidSortDirectionFallsBackToAsc() {
        Test.startTest();
        UiApiLikeListController.ResponseDto res = UiApiLikeListController.getListRecords(
            'Lead',
            'Unit_Test_View',
            baseFields(),
            10,
            '0',
            null,
            null,
            '{"fieldApiName":"Lead.Company","direction":"WHATEVER","nullsPreference":"LAST"}', 
            null
        );
        Test.stopTest();

        System.assertEquals(10, res.records.size());
    }

    @IsTest
    static void testBlankObjectApiNameThrows() {
        Boolean threwException = false;

        try {
            UiApiLikeListController.getListRecords(
                '',
                'Unit_Test_View',
                baseFields(),
                10,
                '0',
                null,
                null,
                null,
                null
            );
        } catch (AuraHandledException e) {
            threwException = true;
        }

        System.assertEquals(true, threwException, 'Expected exception for blank objectApiName');
    }

    @IsTest
    static void testEmptyFieldsThrows() {
        Boolean threwException = false;

        try {
            UiApiLikeListController.getListRecords(
                'Lead',
                'Unit_Test_View',
                new List<String>(),
                10,
                '0',
                null,
                null,
                null,
                null
            );
        } catch (AuraHandledException e) {
            threwException = true;
        }

        System.assertEquals(true, threwException, 'Expected exception for empty fields');
    }

    @IsTest
    static void testFieldWrongPrefixThrows() {
        Boolean threwException = false;

        try {
            UiApiLikeListController.getListRecords(
                'Lead',
                'Unit_Test_View',
                new List<String>{ 'Account.Name' },
                10,
                '0',
                null,
                null,
                null,
                null
            );
        } catch (AuraHandledException e) {
            threwException = true;
        }

        System.assertEquals(true, threwException, 'Expected exception for wrong field prefix');
    }

    @IsTest
    static void testRangeFilterAddsNullExclusionForDate() {
        Test.startTest();
        UiApiLikeListController.ResponseDto res = UiApiLikeListController.getListRecords(
            'Lead',
            'Unit_Test_View',
            baseFields(),
            10,
            '0',
            'Lead.CreatedDate >= LAST_N_DAYS:30',
            null,
            '{"fieldApiName":"Lead.CreatedDate","direction":"ASC","nullsPreference":"LAST"}',
            null
        );
        Test.stopTest();

        System.assertNotEquals(null, res, 'Response should not be null');
        System.assertEquals(
            'Lead.CreatedDate >= LAST_N_DAYS:30',
            (String) res.filterCriteria,
            'Filter criteria should round-trip'
        );
        System.assert(res.records != null, 'Records should not be null');
    }

    @IsTest
    static void testRangeFilterAddsNullExclusionForDateLiteralToday() {
        Test.startTest();
        UiApiLikeListController.ResponseDto res = UiApiLikeListController.getListRecords(
            'Lead',
            'Unit_Test_View',
            baseFields(),
            10,
            '0',
            'Lead.CreatedDate <= TODAY',
            null,
            '{"fieldApiName":"Lead.CreatedDate","direction":"DESC","nullsPreference":"LAST"}',
            null
        );
        Test.stopTest();

        System.assertNotEquals(null, res, 'Response should not be null');
        System.assertEquals(
            'Lead.CreatedDate <= TODAY',
            (String) res.filterCriteria,
            'Expected TODAY literal filter to be accepted'
        );
    }

    @IsTest
    static void testInOperatorFilter() {
        Test.startTest();
        UiApiLikeListController.ResponseDto res = UiApiLikeListController.getListRecords(
            'Lead',
            'Unit_Test_View',
            baseFields(),
            10,
            '0',
            'Lead.Status IN (\'Open - Not Contacted\')',
            null,
            '{"fieldApiName":"Lead.Name","direction":"ASC","nullsPreference":"LAST"}',
            null
        );
        Test.stopTest();

        System.assert(res.records != null && res.records.size() > 0, 'IN filter should return records');
    }
    
    @IsTest
    static void testChildRelationColumnJson_WithMatchingChild() {
        Account acc = new Account(Name = 'Acme Parent');
        insert acc;

        Contact con = new Contact(
            FirstName = 'Gov',
            LastName = 'POC',
            Email = 'gov@test.com',
            AccountId = acc.Id
        );
        insert con;

        String childRelationColumnJson = JSON.serialize(
            new List<Object>{
                new Map<String, Object>{
                    'relationName' => 'Contacts',
                    'childObjectApiName' => 'Contact',
                    'columns' => new List<Object>{
                        new Map<String, Object>{
                            'columnLabel' => 'Government POC',
                            'childFieldApiName' => 'Email',
                            'dtype' => 'text',
                            'condition' => 'FirstName = \'Gov\''
                        }
                    }
                }
            }
        );

        Test.startTest();
        UiApiLikeListController.ResponseDto res = UiApiLikeListController.getListRecords(
            'Account',
            'Unit_Test_View',
            new List<String>{
                'Account.Name',
                'Account.Owner.Name'
            },
            10,
            '0',
            'Account.Id = \'' + acc.Id + '\'',
            null,
            '{"fieldApiName":"Account.Name","direction":"ASC","nullsPreference":"LAST"}',
            childRelationColumnJson
        );
        Test.stopTest();

        System.assertNotEquals(null, res);
        System.assertEquals(1, res.records.size());

        UiApiLikeListController.RecordDto rec = res.records[0];

        System.assert(
            rec.fields.containsKey('Government POC'),
            'Expected child field keyed by columnLabel. Keys: ' + rec.fields.keySet()
        );

        System.assertNotEquals(
            null,
            rec.fields.get('Government POC'),
            'Expected Government POC wrapper to exist'
        );

        System.assertEquals(
            'gov@test.com',
            (String) rec.fields.get('Government POC').displayValue,
            'Expected displayValue to be Email'
        );

        Map<String, Object> childMini = (Map<String, Object>) rec.fields.get('Government POC').value;
        System.assertNotEquals(null, childMini, 'Expected child mini object');
        System.assertEquals(con.Id, (String) childMini.get('id'));
        System.assertEquals('gov@test.com', (String) childMini.get('Email'));
    }
    
    @IsTest
    static void testChildRelationColumnJson_NoMatchingChild() {
        Account acc = new Account(Name = 'No Child Match');
        insert acc;

        Contact con = new Contact(
            FirstName = 'Other',
            LastName = 'Person',
            Email = 'other@test.com',
            AccountId = acc.Id
        );
        insert con;

        String childRelationColumnJson = JSON.serialize(
            new List<Object>{
                new Map<String, Object>{
                    'relationName' => 'Contacts',
                    'childObjectApiName' => 'Contact',
                    'columns' => new List<Object>{
                        new Map<String, Object>{
                            'columnLabel' => 'Government POC',
                            'childFieldApiName' => 'Email',
                            'dtype' => 'text',
                            'condition' => 'FirstName = \'DoesNotMatch\''
                        }
                    }
                }
            }
        );

        Test.startTest();
        UiApiLikeListController.ResponseDto res = UiApiLikeListController.getListRecords(
            'Account',
            'Unit_Test_View',
            new List<String>{
                'Account.Name',
                'Account.Owner.Name'
            },
            10,
            '0',
            'Account.Id = \'' + acc.Id + '\'',
            null,
            '{"fieldApiName":"Account.Name","direction":"ASC","nullsPreference":"LAST"}',
            childRelationColumnJson
        );
        Test.stopTest();

        System.assertNotEquals(null, res);
        System.assertEquals(1, res.records.size());

        UiApiLikeListController.RecordDto rec = res.records[0];

        System.assert(
            rec.fields.containsKey('Government POC'),
            'Expected child field to be present even when no child matches'
        );
        System.assertEquals(null, rec.fields.get('Government POC').value);
        System.assertEquals(null, rec.fields.get('Government POC').displayValue);
    }
    
    @IsTest
    static void testChildRelationColumnJson_BlankCondition_StillReturnsFirstChild() {
        Account acc = new Account(Name = 'Blank Condition Parent');
        insert acc;

        Contact con = new Contact(
            FirstName = 'First',
            LastName = 'Child',
            Email = 'first@test.com',
            AccountId = acc.Id
        );
        insert con;

        String childRelationColumnJson = JSON.serialize(
            new List<Object>{
                new Map<String, Object>{
                    'relationName' => 'Contacts',
                    'childObjectApiName' => 'Contact',
                    'columns' => new List<Object>{
                        new Map<String, Object>{
                            'columnLabel' => 'Government POC',
                            'childFieldApiName' => 'Email',
                            'dtype' => 'text',
                            'condition' => ''
                        }
                    }
                }
            }
        );

        Test.startTest();
        UiApiLikeListController.ResponseDto res = UiApiLikeListController.getListRecords(
            'Account',
            'Unit_Test_View',
            new List<String>{
                'Account.Name'
            },
            10,
            '0',
            'Account.Id = \'' + acc.Id + '\'',
            null,
            '{"fieldApiName":"Account.Name","direction":"ASC","nullsPreference":"LAST"}',
            childRelationColumnJson
        );
        Test.stopTest();

        System.assertEquals(1, res.records.size());

        UiApiLikeListController.RecordDto rec = res.records[0];

        System.assert(rec.fields.containsKey('Government POC'));
        System.assertNotEquals(null, rec.fields.get('Government POC').value);
        System.assertEquals('first@test.com', (String) rec.fields.get('Government POC').displayValue);

        Map<String, Object> childMini = (Map<String, Object>) rec.fields.get('Government POC').value;
        System.assertEquals(con.Id, (String) childMini.get('id'));
        System.assertEquals('first@test.com', (String) childMini.get('Email'));
    }

    @IsTest
    static void testChildRelationColumnJson_MultipleColumnsSameRelation() {
        Account acc = new Account(Name = 'Multi Child Parent');
        insert acc;

        insert new List<Contact>{
            new Contact(
                FirstName = 'Gov',
                LastName = 'Person',
                Email = 'gov@test.com',
                AccountId = acc.Id
            ),
            new Contact(
                FirstName = 'Electronic',
                LastName = 'Person',
                Email = 'electronic@test.com',
                AccountId = acc.Id
            )
        };

        String childRelationColumnJson = JSON.serialize(
            new List<Object>{
                new Map<String, Object>{
                    'relationName' => 'Contacts',
                    'childObjectApiName' => 'Contact',
                    'columns' => new List<Object>{
                        new Map<String, Object>{
                            'columnLabel' => 'Government POC',
                            'childFieldApiName' => 'Email',
                            'dtype' => 'text',
                            'condition' => 'FirstName = \'Gov\''
                        },
                        new Map<String, Object>{
                            'columnLabel' => 'Electronic POC',
                            'childFieldApiName' => 'Email',
                            'dtype' => 'text',
                            'condition' => 'FirstName = \'Electronic\''
                        }
                    }
                }
            }
        );

        Test.startTest();
        UiApiLikeListController.ResponseDto res = UiApiLikeListController.getListRecords(
            'Account',
            'Unit_Test_View',
            new List<String>{ 'Account.Name' },
            10,
            '0',
            'Account.Id = \'' + acc.Id + '\'',
            null,
            '{"fieldApiName":"Account.Name","direction":"ASC","nullsPreference":"LAST"}',
            childRelationColumnJson
        );
        Test.stopTest();

        System.assertEquals(1, res.records.size());

        UiApiLikeListController.RecordDto rec = res.records[0];

        System.assert(rec.fields.containsKey('Government POC'));
        System.assert(rec.fields.containsKey('Electronic POC'));

        System.assertEquals('gov@test.com', (String) rec.fields.get('Government POC').displayValue);
        System.assertEquals('electronic@test.com', (String) rec.fields.get('Electronic POC').displayValue);
    }

    @IsTest
    static void testDateLiteralPrefixVariant() {
        Test.startTest();
        UiApiLikeListController.ResponseDto res = UiApiLikeListController.getListRecords(
            'Lead',
            'Unit_Test_View',
            baseFields(),
            10,
            '0',
            'Lead.CreatedDate >= NEXT_N_DAYS:7',
            null,
            '{"fieldApiName":"Lead.CreatedDate","direction":"ASC","nullsPreference":"LAST"}',
            null
        );
        Test.stopTest();

        System.assertNotEquals(null, res, 'Response should not be null');
        System.assertEquals(
            'Lead.CreatedDate >= NEXT_N_DAYS:7',
            (String) res.filterCriteria,
            'Expected NEXT_N_DAYS literal filter to be accepted'
        );
    }
    
}