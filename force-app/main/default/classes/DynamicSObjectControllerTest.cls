@isTest
public class DynamicSObjectControllerTest {
    
    
    // =========================== CONVERTED RECORDS =========================== \\
    /*
    @IsTest
    static void test_Opp_to_Lead_singleHop_local() {
        // --- Setup (local to this test) ---
        LeadStatus openSt  = [SELECT MasterLabel FROM LeadStatus WHERE IsConverted = FALSE LIMIT 1];
        LeadStatus convSt  = [SELECT MasterLabel FROM LeadStatus WHERE IsConverted = TRUE  LIMIT 1];

        Lead l = new Lead(LastName = 'OppToLead L', Company = 'Acme', Status = openSt.MasterLabel);
        insert l;

        Database.LeadConvert lc = new Database.LeadConvert();
        lc.setLeadId(l.Id);
        lc.setConvertedStatus(convSt.MasterLabel);
        lc.setDoNotCreateOpportunity(false);
        lc.setOpportunityName('Opp From Lead');
        Database.LeadConvertResult lcr = Database.convertLead(lc);
        System.assert(lcr.isSuccess(), 'Lead conversion should succeed');

        Opportunity opp = [SELECT Id, Name FROM Opportunity WHERE Id = :lcr.getOpportunityId() LIMIT 1];

        // --- Exercise ---
        Test.startTest();
        List<SObject> leads = DynamicSObjectController.convertedRecordFetcher(
            'Opportunity',
            new List<Id>{ opp.Id },
            'Lead',
            new List<String>{ 'Name', 'Status', 'ConvertedOpportunityId' }
        );
        Test.stopTest();

        // --- Verify ---
        System.assertEquals(1, leads.size(), 'Should return the Lead converted into this Opportunity');
        Lead got = (Lead)leads[0];
        System.assertEquals(opp.Id, got.ConvertedOpportunityId, 'Lead should reference the Opportunity');
        System.assertNotEquals(null, got.Name, 'Lead Name should be populated');
    }
    @IsTest
    static void test_CA_to_Lead_twoHop_local() {
        // --- Setup (local) ---
        LeadStatus openSt  = [SELECT MasterLabel FROM LeadStatus WHERE IsConverted = FALSE LIMIT 1];
        LeadStatus convSt  = [SELECT MasterLabel FROM LeadStatus WHERE IsConverted = TRUE  LIMIT 1];

        // Convert a Lead to produce an Opportunity
        Lead l = new Lead(LastName = 'CA→Opp→Lead L', Company = 'Acme', Status = openSt.MasterLabel);
        insert l;

        Database.LeadConvert lc = new Database.LeadConvert();
        lc.setLeadId(l.Id);
        lc.setConvertedStatus(convSt.MasterLabel);
        lc.setDoNotCreateOpportunity(false);
        lc.setOpportunityName('Opp From Lead (CA link)');
        Database.LeadConvertResult lcr = Database.convertLead(lc);
        System.assert(lcr.isSuccess(), 'Lead conversion should succeed');
        Opportunity opp = [SELECT Id, Name FROM Opportunity WHERE Id = :lcr.getOpportunityId() LIMIT 1];

        // Create a Contract Award and link it to the created Opp
        Contract_Award__c ca = new Contract_Award__c(
            Name = 'CA-Local-001',
            Stage__c = 'Contract Closeout'
        );
        insert ca;

        opp.put('ConvertedContractAwardId__c', ca.Id);
        update opp;

        // --- Exercise ---
        Test.startTest();
        List<SObject> leads = DynamicSObjectController.convertedRecordFetcher(
            'Contract_Award__c',
            new List<Id>{ ca.Id },
            'Lead',
            new List<String>{ 'Name', 'ConvertedOpportunityId', 'Status' }
        );
        Test.stopTest();

        // --- Verify ---
        System.assertEquals(1, leads.size(), 'Should return the Lead linked via Opp for this Contract Award');
        Lead got = (Lead)leads[0];
        System.assertEquals(opp.Id, got.ConvertedOpportunityId, 'Lead should point to the Opportunity linked to CA');
    }
    
    @IsTest
    static void test_CA_to_Opp_singleHop_local() {
        // --- Setup (local) ---
        // Create CA
        Contract_Award__c ca = new Contract_Award__c(
            Name = 'CA-Local-002',
            Stage__c = 'Contract Closeout'
        );
        insert ca;

        // Create Opp that references CA via your custom link
        Opportunity opp = new Opportunity(
            Name = 'Opp Linked To CA',
            StageName = 'Prospecting',
            CloseDate = System.today().addDays(30)
        );
        insert opp;
        opp.put('ConvertedContractAwardId__c', ca.Id);
        update opp;

        // --- Exercise ---
        Test.startTest();
        List<SObject> opps = DynamicSObjectController.convertedRecordFetcher(
            'Contract_Award__c',
            new List<Id>{ ca.Id },
            'Opportunity',
            new List<String>{ 'Name', 'StageName' }
        );
        Test.stopTest();

        // --- Verify ---
        System.assertEquals(1, opps.size(), 'Should return the Opportunity linked to the Contract Award');
        Opportunity got = (Opportunity)opps[0];
        System.assertEquals(opp.Id, got.Id, 'Should be the same Opportunity');
    }
    @IsTest
    static void test_unsupported_mapping_throws_local() {
        Test.startTest();
        try {
            DynamicSObjectController.convertedRecordFetcher(
                'Case',
                new List<Id>{ UserInfo.getUserId() }, // value irrelevant; should fail before query
                'Lead',
                new List<String>{ 'Id' }
            );
            System.assert(false, 'Expected AuraHandledException for unsupported mapping but none was thrown.');
        } catch (AuraHandledException e) {
            Boolean ok = e.getMessage() != null && e.getMessage().contains('Script-thrown exception');
            System.assert(
                ok,
                'Expected message to contain "Unsupported mapping", but was: ' + e.getMessage()
            );
        } finally {
            Test.stopTest();
        }
    }
    // ========================================================================= \\
    */

    @isTest
    static void testGetSObjectPicklistValues_ValidInputs() {
        // Act
        List<String> picklistValues = DynamicSObjectController.getSObjectPicklistValues('Task', 'Status');

        // Assert
        System.debug('Picklist Values Retrieved: ' + picklistValues);
        System.assert(picklistValues.size() > 0, 'Picklist values should be retrieved');
        System.assert(!picklistValues.contains('Script-thrown exception'), 'Unexpected "Script-thrown exception" found');
    }
    @isTest
    static void testGetSObjectPicklistValues_InvalidObjectName() {
        // Act & Assert
        try {
            DynamicSObjectController.getSObjectPicklistValues('InvalidObject', 'Status');
            System.assert(false, 'Expected exception not thrown');
        } catch (AuraHandledException e) {
            System.debug('Caught Exception: ' + e.getMessage());
            System.assert(e.getMessage().contains('Script-thrown exception'), 'Expected "Script-thrown exception" in the error message');
        }
    }

    
    @isTest
    static void testSaveRecords_ValidRecords() {
        // Arrange
        List<Task> tasks = new List<Task>();
        tasks.add(new Task(Subject = 'Test Task 1', Status = 'Not Started', Priority = 'Normal'));
        tasks.add(new Task(Subject = 'Test Task 2', Status = 'Completed', Priority = 'High'));
    
        // Act
        Test.startTest();
        DynamicSObjectController.saveRecords(tasks);
        Test.stopTest();
    
        // Assert
        List<Task> insertedTasks = [SELECT Id, Subject, Status FROM Task WHERE Subject LIKE 'Test Task%'];
        System.assertEquals(2, insertedTasks.size(), 'Two tasks should be saved');
        System.assertEquals('Not Started', insertedTasks[0].Status, 'First task should have the correct status');
        System.assertEquals('Completed', insertedTasks[1].Status, 'Second task should have the correct status');
    }
    @isTest
    static void testSaveRecords_InvalidRecords() {
        // Arrange
        List<Account> invalidAccounts = new List<Account>();
        invalidAccounts.add(new Account()); // Missing required fields like Name
    
        // Act & Assert
        try {
            Test.startTest();
            DynamicSObjectController.saveRecords(invalidAccounts);
            Test.stopTest();
            System.assert(false, 'Expected exception not thrown');
        } catch (AuraHandledException e) {
            System.debug('Caught Exception: ' + e.getMessage());
            System.assert(e.getMessage().contains('Script-thrown exception'), 'Expected "Script-thrown exception" in the error message');
        }
    }
    
    
    @isTest
    static void testSaveRecords_MixedSuccessRecords() {
        // Arrange
        List<SObject> mixedRecords = new List<SObject>();
        mixedRecords.add(new Account(Name = 'Valid Account')); // Valid record
        mixedRecords.add(new Account()); // Invalid record (missing required fields)
    
        // Act & Assert
        try {
            Test.startTest();
            DynamicSObjectController.saveRecords(mixedRecords);
            Test.stopTest();
            System.assert(false, 'Expected exception not thrown');
        } catch (AuraHandledException e) {
            System.debug('Caught Exception: ' + e.getMessage());
            System.assert(e.getMessage().contains('Script-thrown exception'), 'Expected "Script-thrown exception" in the error message');
        }
    }
   	@isTest
    static void testFetchFieldValuesDynamicByRecordId_ValidInputs_WithLookup() {
        // Arrange
        Account acc = new Account(Name = 'Test Account');
        insert acc;
    
        // Create a Contact with the Account relationship
        Contact con = new Contact(LastName = 'Test Contact', AccountId = acc.Id);
        insert con;
    
        // Act
        List<SObject> results = DynamicSObjectController.fetchFieldValuesDynamicByRecordId(
            'Contact',
            new List<Id>{ con.Id },
            new List<String>{ 'LastName', 'AccountId' } // Query AccountId instead of Account.Name
        );
    
        // Fetch Account Name using AccountId
        Id accountId = (Id) results[0].get('AccountId');
		Account relatedAccount = [SELECT Name FROM Account WHERE Id = :accountId];

    
        // Assert
        System.assertEquals(1, results.size(), 'One Contact should be returned');
        
        // Check that the LastName field is correctly returned
        System.assertEquals('Test Contact', (String)results[0].get('LastName'), 'LastName should match the inserted Contact');
    
        // Check that the related Account's Name is correctly fetched
        System.assertEquals('Test Account', relatedAccount.Name, 'Account.Name should match the inserted Account');
    }
    @isTest
    static void testFetchFieldValuesDynamicByRecordId_InvalidRelationshipField() {
        // Arrange
        Account acc = new Account(Name = 'Test Account');
        insert acc;
    
        // Act & Assert
        try {
            DynamicSObjectController.fetchFieldValuesDynamicByRecordId(
                'Account',
                new List<Id>{ acc.Id },
                new List<String>{ 'Invalid.Relationship' } // Invalid relationship field
            );
            System.assert(false, 'Expected exception not thrown');
        } catch (AuraHandledException e) {
            System.assert(e.getMessage().contains('Script-thrown exception'), 'Expected error message for invalid relationship field');
        }
    }
  
    
    @isTest
    static void testFetchFieldValuesDynamicByRecordIdCached_ValidInputs_WithLookup() {
        // Arrange
        Account acc = new Account(Name = 'Test Account');
        insert acc;
    
        // Create a Contact with the Account relationship
        Contact con = new Contact(LastName = 'Test Contact', AccountId = acc.Id);
        insert con;
    
        // Act
        List<SObject> results = DynamicSObjectController.fetchFieldValuesDynamicByRecordIdCached(
            'Contact',
            new List<Id>{ con.Id },
            new List<String>{ 'LastName', 'AccountId' } // Query AccountId instead of Account.Name
        );
    
        // Fetch Account Name using AccountId
        Id accountId = (Id) results[0].get('AccountId');
		Account relatedAccount = [SELECT Name FROM Account WHERE Id = :accountId];
    
        // Assert
        System.assertEquals(1, results.size(), 'One Contact should be returned');
        
        // Check that the LastName field is correctly returned
        System.assertEquals('Test Contact', (String)results[0].get('LastName'), 'LastName should match the inserted Contact');
    
        // Check that the related Account's Name is correctly fetched
        System.assertEquals('Test Account', relatedAccount.Name, 'Account.Name should match the inserted Account');
    }
    @isTest
    static void testFetchFieldValuesDynamicByRecordIdCached_InvalidRelationshipField() {
        // Arrange
        Account acc = new Account(Name = 'Test Account');
        insert acc;
    
        // Act & Assert
        try {
            DynamicSObjectController.fetchFieldValuesDynamicByRecordIdCached(
                'Account',
                new List<Id>{ acc.Id },
                new List<String>{ 'Invalid.Relationship' } // Invalid relationship field
            );
            System.assert(false, 'Expected exception not thrown');
        } catch (AuraHandledException e) {
            System.assert(e.getMessage().contains('Script-thrown exception'), 'Expected error message for invalid relationship field');
        }
    }
    
    
    
    @IsTest
    static void test_getRelatedRecordsById_valid() {
        // Setup data
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;

        Contact testContact = new Contact(
            LastName = 'Related Contact',
            AccountId = testAccount.Id
        );
        insert testContact;

        // Prepare parameters
        String objectApiName = 'Contact';
        String relationalField = 'AccountId';
        List<String> recordIds = new List<String>{ testAccount.Id };
        List<String> relatedFields = new List<String>{ 'LastName', 'AccountId' };

        // Call method
        Test.startTest();
        List<SObject> result = DynamicSObjectController.getRelatedRecordsById(
            objectApiName,
            relationalField,
            recordIds,
            relatedFields
        );
        Test.stopTest();

        // Validate result
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertEquals(1, result.size(), 'Should return 1 related Contact');
        Contact returnedContact = (Contact) result[0];
        System.assertEquals(testContact.Id, returnedContact.Id, 'Returned contact should match the inserted one');
    }
    @IsTest
    static void test_getRelatedRecordsById_emptyIds() {
        // Should return empty list if recordIds is empty
        Test.startTest();
        List<SObject> result = DynamicSObjectController.getRelatedRecordsById(
            'Contact',
            'AccountId',
            new List<String>(), // empty
            new List<String>{ 'LastName' }
        );
        Test.stopTest();

        System.assertNotEquals(null, result);
        System.assertEquals(0, result.size(), 'Should return empty list if no recordIds');
    }
    
    
    
    @isTest
    static void testGetObjectApiNameByRecordId_ValidRecordIds() {
        // Arrange
        Account acc = new Account(Name = 'Test Account');
        Contact con = new Contact(LastName = 'Test Contact', AccountId = acc.Id);
        insert acc;
        insert con;
    
        List<String> recordIds = new List<String>{ acc.Id, con.Id };
    
        // Act
        Map<String, String> recordToObjectMap = DynamicSObjectController.getObjectApiNameByRecordId(recordIds);
    
        // Assert
        System.assertEquals('Account', recordToObjectMap.get(acc.Id), 'Account ID should map to Account');
        System.assertEquals('Contact', recordToObjectMap.get(con.Id), 'Contact ID should map to Contact');
    }
    @isTest
    static void testGetObjectApiNameByRecordId_InvalidRecordIds() {
        // Arrange
        List<String> recordIds = new List<String>{ '001000000000001AAA', 'InvalidId' }; // One valid prefix, one invalid
    
        // Act
        Map<String, String> recordToObjectMap = DynamicSObjectController.getObjectApiNameByRecordId(recordIds);
    
        // Assert
        System.assertEquals('Account', recordToObjectMap.get('001000000000001AAA'), 'Valid ID should map to Account');
        System.assertEquals('Invalid', recordToObjectMap.get('InvalidId'), 'Invalid ID should map to Invalid');
    }
    @isTest
    static void testGetObjectApiNameByRecordId_EmptyList() {
        // Act
        Map<String, String> recordToObjectMap = DynamicSObjectController.getObjectApiNameByRecordId(new List<String>());
    
        // Assert
        System.assertEquals(0, recordToObjectMap.size(), 'No mappings should be returned for an empty list');
    }


    @isTest
    static void testFetchRecordsDynamicWithCondition_ValidInputs() {
        // Arrange
        Account acc = new Account(Name = 'Test Account');
        insert acc;

        // Act
        List<SObject> results = DynamicSObjectController.fetchRecordsDynamicWithCondition(
            'Account',
            new List<String>{ 'Name', 'Id' },
            'Name = \'Test Account\''
        );

        // Assert
        System.assertEquals(1, results.size(), 'One account should be returned');
        System.assertEquals('Test Account', (String)results[0].get('Name'), 'Name should match the inserted account');
    }
    @isTest
    static void testFetchRecordsDynamicWithCondition_InvalidCondition() {
        // Act & Assert
        try {
            DynamicSObjectController.fetchRecordsDynamicWithCondition(
                'Account',
                new List<String>{ 'Name', 'Id' },
                'Invalid SOQL Condition'
            );
            System.assert(false, 'Expected exception not thrown');
        } catch (AuraHandledException e) {
            System.assert(e.getMessage().contains('Script-thrown exception'), 'Expected error message for invalid condition');
        }
    }
    
    
    @isTest
    static void testGetRecordTypeInfosDynamic_ValidInputs() {
        // Act
        List<Map<String, String>> results = DynamicSObjectController.getRecordTypeInfosDynamic('Parts_And_Services__c');

        // Assert
        System.assert(results.size() > 0, 'Record types for the Account object should be returned');
        System.debug('Record Type Infos: ' + results);
    }
    @isTest
    static void testGetRecordTypeInfosDynamic_InvalidObjectName() {
        // Act
        List<Map<String, String>> results = DynamicSObjectController.getRecordTypeInfosDynamic('InvalidObject');
        System.debug('Response for invalid object: ' + results);
    
        // Assert
        System.assertEquals(0, results.size(), 'Expected no record types to be returned for an invalid object name');
    }
    
    
    @isTest
    static void testGetRecordName_ValidRecord() {
        // Arrange
        Account account = new Account(Name = 'Test Account');
        insert account;

        // Act
        String recordName = DynamicSObjectController.getRecordName('Account', account.Id);

        // Assert
        System.assertEquals('Test Account', recordName, 'The record name should match the inserted account');
    }
    @isTest
    static void testGetRecordName_InvalidRecordId() {
        // Act & Assert
        try {
            DynamicSObjectController.getRecordName('Account', '001000000000001AAA'); // Invalid Id
            System.assert(false, 'Expected exception not thrown');
        } catch (AuraHandledException e) {
            System.debug('Caught Exception: ' + e.getMessage());
            System.assert(e.getMessage().contains('Script-thrown exception'), 'Expected "Error fetching record name" in the error message');
        }
    }
    @isTest
    static void testGetRecordName_InvalidObjectName() {
        // Act & Assert
        try {
            DynamicSObjectController.getRecordName('InvalidObject', '001000000000001AAA');
            System.assert(false, 'Expected exception not thrown');
        } catch (AuraHandledException e) {
            System.debug('Caught Exception: ' + e.getMessage());
            System.assert(e.getMessage().contains('Script-thrown exception'), 'Expected "Error fetching record name" in the error message');
        }
    }
    
    
    
    @isTest
    static void testFetchRecordsMultiObjectsWithConditionCached() {
        // Arrange
        Account testAccount = new Account(Name = 'Test Account');
        Contact testContact = new Contact(LastName = 'Test Contact', AccountId = null);
        insert testAccount;
        insert testContact;
    
        List<Map<String, Object>> queries = new List<Map<String, Object>>();
        
        // Query for Accounts
        Map<String, Object> accountQuery = new Map<String, Object>{
            'objectApiName' => 'Account',
            'fieldApiNames' => new List<String>{'Id', 'Name'},
            'conditions' => 'Name = \'Test Account\'',
            'mapKey' => 'accounts'
        };
        queries.add(accountQuery);
    
        // Query for Contacts
        Map<String, Object> contactQuery = new Map<String, Object>{
            'objectApiName' => 'Contact',
            'fieldApiNames' => new List<String>{'Id', 'LastName'},
            'conditions' => 'LastName = \'Test Contact\'',
            'mapKey' => 'contacts'
        };
        queries.add(contactQuery);
    
        // Act
        Map<String, List<SObject>> result;
        Test.startTest();
        result = DynamicSObjectController.fetchRecordsMultiObjectsWithConditionCached(queries);
        Test.stopTest();
    
        // Assert
        System.assert(result.containsKey('accounts'), 'Result should contain accounts key');
        System.assert(result.containsKey('contacts'), 'Result should contain contacts key');
    
        List<SObject> accountResults = result.get('accounts');
        List<SObject> contactResults = result.get('contacts');
    
        System.assertEquals(1, accountResults.size(), 'There should be one account result');
        System.assertEquals(1, contactResults.size(), 'There should be one contact result');
    
        System.assertEquals('Test Account', accountResults[0].get('Name'), 'Account name should match');
        System.assertEquals('Test Contact', contactResults[0].get('LastName'), 'Contact last name should match');
    }
    @isTest
    static void testFetchRecordsMultiObjectsWithConditionCached_InvalidObjectApiName() {
        // Arrange
        List<Map<String, Object>> queries = new List<Map<String, Object>>();
        Map<String, Object> invalidQuery = new Map<String, Object>{
            'objectApiName' => null,
            'fieldApiNames' => new List<String>{'Id', 'Name'},
            'conditions' => null,
            'mapKey' => 'invalid'
        };
        queries.add(invalidQuery);
    
        // Act & Assert
        try {
            Test.startTest();
            DynamicSObjectController.fetchRecordsMultiObjectsWithConditionCached(queries);
            Test.stopTest();
            System.assert(false, 'Expected exception not thrown for invalid object API name');
        } catch (AuraHandledException e) {
            System.assert(e.getMessage().contains('Script-thrown exception'), 'Expected error message for invalid object API name');
        }
    }
    @isTest
    static void testFetchRecordsMultiObjectsWithConditionCached_InvalidFieldApiNames() {
        // Arrange
        List<Map<String, Object>> queries = new List<Map<String, Object>>();
        Map<String, Object> invalidQuery = new Map<String, Object>{
            'objectApiName' => 'Account',
            'fieldApiNames' => new List<String>{},
            'conditions' => null,
            'mapKey' => 'invalid'
        };
        queries.add(invalidQuery);
    
        // Act & Assert
        try {
            Test.startTest();
            DynamicSObjectController.fetchRecordsMultiObjectsWithConditionCached(queries);
            Test.stopTest();
            System.assert(false, 'Expected exception not thrown for invalid field API names');
        } catch (AuraHandledException e) {
            System.assert(e.getMessage().contains('Script-thrown exception'), 'Expected error message for invalid field API names');
        }
    }
    
    
        
    @isTest
    static void testFetchRecordsMultiObjectsWithCondition() {
        // Arrange
        Account testAccount = new Account(Name = 'Test Account');
        Contact testContact = new Contact(LastName = 'Test Contact', AccountId = null);
        insert testAccount;
        insert testContact;
    
        List<Map<String, Object>> queries = new List<Map<String, Object>>();
        
        // Query for Accounts
        Map<String, Object> accountQuery = new Map<String, Object>{
            'objectApiName' => 'Account',
            'fieldApiNames' => new List<String>{'Id', 'Name'},
            'conditions' => 'Name = \'Test Account\'',
            'mapKey' => 'accounts'
        };
        queries.add(accountQuery);
    
        // Query for Contacts
        Map<String, Object> contactQuery = new Map<String, Object>{
            'objectApiName' => 'Contact',
            'fieldApiNames' => new List<String>{'Id', 'LastName'},
            'conditions' => 'LastName = \'Test Contact\'',
            'mapKey' => 'contacts'
        };
        queries.add(contactQuery);
    
        // Act
        Map<String, List<SObject>> result;
        Test.startTest();
        result = DynamicSObjectController.fetchRecordsMultiObjectsWithCondition(queries);
        Test.stopTest();
    
        // Assert
        System.assert(result.containsKey('accounts'), 'Result should contain accounts key');
        System.assert(result.containsKey('contacts'), 'Result should contain contacts key');
    
        List<SObject> accountResults = result.get('accounts');
        List<SObject> contactResults = result.get('contacts');
    
        System.assertEquals(1, accountResults.size(), 'There should be one account result');
        System.assertEquals(1, contactResults.size(), 'There should be one contact result');
    
        System.assertEquals('Test Account', accountResults[0].get('Name'), 'Account name should match');
        System.assertEquals('Test Contact', contactResults[0].get('LastName'), 'Contact last name should match');
    }
    @isTest
    static void testFetchRecordsMultiObjectsWithCondition_InvalidObjectApiName() {
        // Arrange
        List<Map<String, Object>> queries = new List<Map<String, Object>>();
        Map<String, Object> invalidQuery = new Map<String, Object>{
            'objectApiName' => null,
            'fieldApiNames' => new List<String>{'Id', 'Name'},
            'conditions' => null,
            'mapKey' => 'invalid'
        };
        queries.add(invalidQuery);
    
        // Act & Assert
        try {
            Test.startTest();
            DynamicSObjectController.fetchRecordsMultiObjectsWithCondition(queries);
            Test.stopTest();
            System.assert(false, 'Expected exception not thrown for invalid object API name');
        } catch (AuraHandledException e) {
            System.assert(e.getMessage().contains('Script-thrown exception'), 'Expected error message for invalid object API name');
        }
    }
    @isTest
    static void testFetchRecordsMultiObjectsWithCondition_InvalidFieldApiNames() {
        // Arrange
        List<Map<String, Object>> queries = new List<Map<String, Object>>();
        Map<String, Object> invalidQuery = new Map<String, Object>{
            'objectApiName' => 'Account',
            'fieldApiNames' => new List<String>{},
            'conditions' => null,
            'mapKey' => 'invalid'
        };
        queries.add(invalidQuery);
    
        // Act & Assert
        try {
            Test.startTest();
            DynamicSObjectController.fetchRecordsMultiObjectsWithCondition(queries);
            Test.stopTest();
            System.assert(false, 'Expected exception not thrown for invalid field API names');
        } catch (AuraHandledException e) {
            System.assert(e.getMessage().contains('Script-thrown exception'), 'Expected error message for invalid field API names');
        }
    }
    
    
    
    @isTest
    static void testFetchParentsConditionallyAndChildrenDynamic_ValidInputs() {
        // Arrange
        Account parent1 = new Account(Name = 'Parent Account 1');
        Account parent2 = new Account(Name = 'Parent Account 2');
        insert new List<Account>{parent1, parent2};

        Contact child1 = new Contact(LastName = 'Child Contact 1', AccountId = parent1.Id);
        Contact child2 = new Contact(LastName = 'Child Contact 2', AccountId = parent2.Id);
        insert new List<Contact>{child1, child2};

        List<String> parentFields = new List<String>{'Id', 'Name'};
        String parentCondition = 'Name LIKE \'Parent Account%\'';
        Boolean isFetchChildren = true;
        String childObjectName = 'Contact';
        List<String> childFieldApiNames = new List<String>{'Id', 'LastName', 'AccountId'};
        String parentFieldApiName = 'AccountId';

        // Act
        Map<String, List<SObject>> result;
        Test.startTest();
        result = DynamicSObjectController.fetchParentsConditionallyAndChildrenDynamic(
            parentCondition,
            'Account',
            parentFields,
            isFetchChildren,
            childObjectName,
            childFieldApiNames,
            parentFieldApiName
        );
        Test.stopTest();

        // Assert
        System.assert(result.containsKey('parents'), 'Result should contain parents key');
        System.assert(result.containsKey('children'), 'Result should contain children key');

        List<SObject> parentRecords = result.get('parents');
        List<SObject> childRecords = result.get('children');

        System.assertEquals(2, parentRecords.size(), 'There should be two parent records');
        System.assertEquals(2, childRecords.size(), 'There should be two child records');

        Set<Id> parentIds = new Set<Id>();
        for (SObject parent : parentRecords) {
            parentIds.add((Id)parent.get('Id'));
        }
        System.assert(parentIds.contains(parent1.Id), 'Parent records should include Parent Account 1');
        System.assert(parentIds.contains(parent2.Id), 'Parent records should include Parent Account 2');

        Set<Id> childParentIds = new Set<Id>();
        for (SObject child : childRecords) {
            childParentIds.add((Id)child.get('AccountId'));
        }
        System.assert(childParentIds.contains(parent1.Id), 'Child records should include contacts for Parent Account 1');
        System.assert(childParentIds.contains(parent2.Id), 'Child records should include contacts for Parent Account 2');
    }
    @isTest
    static void testFetchParentsConditionallyAndChildrenDynamic_NoChildRecords() {
        // Arrange
        Account parent = new Account(Name = 'Parent Account');
        insert parent;

        List<String> parentFields = new List<String>{'Id', 'Name'};
        String parentCondition = 'Name = \'Parent Account\'';
        Boolean isFetchChildren = true;
        String childObjectName = 'Contact';
        List<String> childFieldApiNames = new List<String>{'Id', 'LastName', 'AccountId'};
        String parentFieldApiName = 'AccountId';

        // Act
        Map<String, List<SObject>> result;
        Test.startTest();
        result = DynamicSObjectController.fetchParentsConditionallyAndChildrenDynamic(
            parentCondition,
            'Account',
            parentFields,
            isFetchChildren,
            childObjectName,
            childFieldApiNames,
            parentFieldApiName
        );
        Test.stopTest();

        // Assert
        System.assert(result.containsKey('parents'), 'Result should contain parents key');
        System.assert(result.containsKey('children'), 'Result should contain children key');

        List<SObject> parentRecords = result.get('parents');
        List<SObject> childRecords = result.get('children');

        System.assertEquals(1, parentRecords.size(), 'There should be one parent record');
        System.assertEquals(0, childRecords.size(), 'There should be no child records');

        System.assertEquals('Parent Account', parentRecords[0].get('Name'), 'Parent record name should match');
    }
    @isTest
    static void testFetchParentsConditionallyAndChildrenDynamic_InvalidCondition() {
        // Arrange
        List<String> parentFields = new List<String>{'Id', 'Name'};
        String invalidCondition = 'InvalidField = \'Value\'';
        Boolean isFetchChildren = true;
        String childObjectName = 'Contact';
        List<String> childFieldApiNames = new List<String>{'Id', 'LastName', 'AccountId'};
        String parentFieldApiName = 'AccountId';

        // Act & Assert
        try {
            Test.startTest();
            DynamicSObjectController.fetchParentsConditionallyAndChildrenDynamic(
                invalidCondition,
                'Account',
                parentFields,
                isFetchChildren,
                childObjectName,
                childFieldApiNames,
                parentFieldApiName
            );
            Test.stopTest();
            System.assert(false, 'Expected exception not thrown');
        } catch (AuraHandledException e) {
            System.assert(e.getMessage().contains('Script-thrown exception'), 'Expected error message for invalid condition');
        }
    }
    
    
    @isTest
    static void testFetchParentsConditionallyAndChildrenDynamicCacheable_ValidInputs() {
        // Arrange
        Account parent1 = new Account(Name = 'Parent Account 1');
        Account parent2 = new Account(Name = 'Parent Account 2');
        insert new List<Account>{parent1, parent2};

        Contact child1 = new Contact(LastName = 'Child Contact 1', AccountId = parent1.Id);
        Contact child2 = new Contact(LastName = 'Child Contact 2', AccountId = parent2.Id);
        insert new List<Contact>{child1, child2};

        List<String> parentFields = new List<String>{'Id', 'Name'};
        String parentCondition = 'Name LIKE \'Parent Account%\'';
        Boolean isFetchChildren = true;
        String childObjectName = 'Contact';
        List<String> childFieldApiNames = new List<String>{'Id', 'LastName', 'AccountId'};
        String parentFieldApiName = 'AccountId';

        // Act
        Map<String, List<SObject>> result;
        Test.startTest();
        result = DynamicSObjectController.fetchParentsConditionallyAndChildrenDynamicCacheable(
            parentCondition,
            'Account',
            parentFields,
            isFetchChildren,
            childObjectName,
            childFieldApiNames,
            parentFieldApiName
        );
        Test.stopTest();

        // Assert
        System.assert(result.containsKey('parents'), 'Result should contain parents key');
        System.assert(result.containsKey('children'), 'Result should contain children key');

        List<SObject> parentRecords = result.get('parents');
        List<SObject> childRecords = result.get('children');

        System.assertEquals(2, parentRecords.size(), 'There should be two parent records');
        System.assertEquals(2, childRecords.size(), 'There should be two child records');

        Set<Id> parentIds = new Set<Id>();
        for (SObject parent : parentRecords) {
            parentIds.add((Id)parent.get('Id'));
        }
        System.assert(parentIds.contains(parent1.Id), 'Parent records should include Parent Account 1');
        System.assert(parentIds.contains(parent2.Id), 'Parent records should include Parent Account 2');

        Set<Id> childParentIds = new Set<Id>();
        for (SObject child : childRecords) {
            childParentIds.add((Id)child.get('AccountId'));
        }
        System.assert(childParentIds.contains(parent1.Id), 'Child records should include contacts for Parent Account 1');
        System.assert(childParentIds.contains(parent2.Id), 'Child records should include contacts for Parent Account 2');
    }
    @isTest
    static void testFetchParentsConditionallyAndChildrenDynamicCacheable_NoChildRecords() {
        // Arrange
        Account parent = new Account(Name = 'Parent Account');
        insert parent;

        List<String> parentFields = new List<String>{'Id', 'Name'};
        String parentCondition = 'Name = \'Parent Account\'';
        Boolean isFetchChildren = true;
        String childObjectName = 'Contact';
        List<String> childFieldApiNames = new List<String>{'Id', 'LastName', 'AccountId'};
        String parentFieldApiName = 'AccountId';

        // Act
        Map<String, List<SObject>> result;
        Test.startTest();
        result = DynamicSObjectController.fetchParentsConditionallyAndChildrenDynamicCacheable(
            parentCondition,
            'Account',
            parentFields,
            isFetchChildren,
            childObjectName,
            childFieldApiNames,
            parentFieldApiName
        );
        Test.stopTest();

        // Assert
        System.assert(result.containsKey('parents'), 'Result should contain parents key');
        System.assert(result.containsKey('children'), 'Result should contain children key');

        List<SObject> parentRecords = result.get('parents');
        List<SObject> childRecords = result.get('children');

        System.assertEquals(1, parentRecords.size(), 'There should be one parent record');
        System.assertEquals(0, childRecords.size(), 'There should be no child records');

        System.assertEquals('Parent Account', parentRecords[0].get('Name'), 'Parent record name should match');
    }
    @isTest
    static void testFetchParentsConditionallyAndChildrenDynamicCacheable_InvalidCondition() {
        // Arrange
        List<String> parentFields = new List<String>{'Id', 'Name'};
        String invalidCondition = 'InvalidField = \'Value\'';
        Boolean isFetchChildren = true;
        String childObjectName = 'Contact';
        List<String> childFieldApiNames = new List<String>{'Id', 'LastName', 'AccountId'};
        String parentFieldApiName = 'AccountId';

        // Act & Assert
        try {
            Test.startTest();
            DynamicSObjectController.fetchParentsConditionallyAndChildrenDynamicCacheable(
                invalidCondition,
                'Account',
                parentFields,
                isFetchChildren,
                childObjectName,
                childFieldApiNames,
                parentFieldApiName
            );
            Test.stopTest();
            System.assert(false, 'Expected exception not thrown');
        } catch (AuraHandledException e) {
            System.assert(e.getMessage().contains('Script-thrown exception'), 'Expected error message for invalid condition');
        }
    }
    
    
    
    @isTest
    static void testDeleteRecordsById_ValidDeletion() {
        // Arrange
        Account acc1 = new Account(Name = 'Test Account 1');
        Account acc2 = new Account(Name = 'Test Account 2');
        insert new List<Account>{ acc1, acc2 };
    
        List<Id> recordIds = new List<Id>{ acc1.Id, acc2.Id };
    
        // Act
        Test.startTest();
        String response = DynamicSObjectController.deleteRecordsById(recordIds, 'Account');
        Test.stopTest();
    
        // Assert
        Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(response);
        System.assertEquals(true, result.get('success'), 'Expected successful deletion');
    
        // Verify records were deleted
        List<Account> remainingAccounts = [SELECT Id FROM Account WHERE Id IN :recordIds];
        System.assertEquals(0, remainingAccounts.size(), 'No accounts should remain');
    }
    @isTest
    static void testDeleteRecordsById_NoRecordIdsProvided() {
        // Act
        Test.startTest();
        String response = DynamicSObjectController.deleteRecordsById(new List<Id>(), 'Account');
        Test.stopTest();
    
        // Assert
        Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(response);
        System.assertEquals(false, result.get('success'), 'Expected failure due to missing record IDs');
        System.assert(result.containsKey('errorMessage'), 'Error message should be present');
    }
    @isTest
    static void testDeleteRecordsById_InvalidObjectName() {
        // Act
        Test.startTest();
        String response = DynamicSObjectController.deleteRecordsById(new List<Id>{'001000000000001AAA'}, '');
        Test.stopTest();
    
        // Assert
        Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(response);
        System.assertEquals(false, result.get('success'), 'Expected failure due to invalid object name');
        System.assert(result.containsKey('errorMessage'), 'Error message should be present');
    }
    
    
    @isTest
    static void testAreFieldApiNamesValid_ValidFields() {
        List<String> validFields = new List<String>{ 'Name', 'Industry' };
    
        // Directly call the method
        Boolean result = DynamicSObjectController.areFieldApiNamesValid(validFields, 'Account');
    
        System.assert(result, 'Expected valid fields to return true');
    }
    @isTest
    static void testAreFieldApiNamesValid_InvalidFields() {
        List<String> invalidFields = new List<String>{ 'InvalidField' };
    
        // Directly call the method
        Boolean result = DynamicSObjectController.areFieldApiNamesValid(invalidFields, 'Account');
    
        System.assertEquals(false, result, 'Expected invalid fields to return false');
    }


    @isTest
    static void testGetLookupFields_ValidObject() {
        List<Map<String, String>> lookupFields = DynamicSObjectController.getLookupFields('Contact');
    
        System.assert(lookupFields.size() > 0, 'Expected at least one lookup field for Contact');
    }
    @isTest
    static void testGetLookupFields_InvalidObject() {
        try {
            DynamicSObjectController.getLookupFields('InvalidObject');
            System.assert(false, 'Expected exception for invalid object');
        } catch (IllegalArgumentException e) {
            System.assert(e.getMessage().contains('Invalid object API name'), 'Expected error message for invalid object name');
        }
    }

    
    @isTest
    static void testGetPolymorphicFieldObjects_ValidField() {
        List<Map<String, String>> results = DynamicSObjectController.getPolymorphicFieldObjects('Task', 'WhatId');
    
        System.assert(results.size() > 0, 'Expected at least one referenced object for WhatId');
    }
    @isTest
    static void testGetPolymorphicFieldObjects_InvalidField() {
        try {
            DynamicSObjectController.getPolymorphicFieldObjects('Task', 'InvalidField');
            System.assert(false, 'Expected exception for invalid field');
        } catch (IllegalArgumentException e) {
            System.assert(e.getMessage().contains('Field does not exist'), 'Expected error message for invalid field');
        }
    }
    
    
    
    @isTest
    static void testFetchRecordsDynamicWithConditionCached() {
        // Arrange
        Account acc = new Account(Name = 'Cached Dynamic Account');
        insert acc;
    
        // Act
        Test.startTest();
        List<SObject> results = DynamicSObjectController.fetchRecordsDynamicWithConditionCached(
            'Account',
            new List<String>{ 'Id', 'Name' },
            'Name = \'Cached Dynamic Account\''
        );
        Test.stopTest();
    
        // Assert
        System.assertEquals(1, results.size(), 'Expected one cached account');
        System.assertEquals('Cached Dynamic Account', results[0].get('Name'), 'Account name should match');
    }
    
    
     @IsTest
    static void testGetAllEntityPrefixesSuccess() {
        // Call the method
        List<Map<String, String>> result = DynamicSObjectController.getAllEntityPrefixes();

        // Assert we got some results (shouldn't be empty in real orgs)
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assert(!result.isEmpty(), 'Result should not be empty');

        // Check that each map contains required keys
        for (Map<String, String> entry : result) {
            System.assert(entry.containsKey('entityPrefix'), 'Each entry should contain entityPrefix');
            System.assert(entry.containsKey('objectApiName'), 'Each entry should contain objectApiName');
        }
    }
    
    
    
    @IsTest
    static void test_getRelatedRecords() {
        // Step 1: Create test records
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;

        Contact testContact = new Contact(
            LastName = 'Test Contact',
            AccountId = testAccount.Id
        );
        insert testContact;

        // Step 2: Build params for the method
        Map<String, String> lookupMap = new Map<String, String>{
            'Contact' => 'AccountId'
        };

        Map<String, List<String>> fieldsMap = new Map<String, List<String>>{
            'Contact' => new List<String>{'Id', 'LastName', 'AccountId'}
        };

        // Step 3: Call the method
        Test.startTest();
        List<SObject> result = DynamicSObjectController.getRelatedRecords(
            new List<Id>{testAccount.Id},
            lookupMap,
            fieldsMap
        );
        Test.stopTest();

        // Step 4: Verify results
        System.assertNotEquals(null, result);
        System.assertEquals(1, result.size(), 'Should return the related contact');
        Contact returnedContact = (Contact) result[0];
        System.assertEquals(testContact.Id, returnedContact.Id, 'Should match the inserted contact');
    }
    @IsTest
    static void test_getRelatedRecords_nullParams() {
        // Should return null if recordId or lookup map is invalid
        Test.startTest();
        List<SObject> result = DynamicSObjectController.getRelatedRecords(new List<Id>{}, new Map<String, String>(), new Map<String, List<String>>());
        Test.stopTest();

        System.assertEquals(null, result, 'Should return null for null recordId and empty lookup map');
    }
    
    
    
    @IsTest
    static void test_fetchRecordsMultiObjectsWithConditionAndChildren_basic() {
        // Create test data
        Account acc = new Account(Name = 'Test Parent Account');
        insert acc;

        Contact c = new Contact(LastName = 'Test Contact', AccountId = acc.Id);
        insert c;

        // Build query input
        Map<String, Object> accountQuery = new Map<String, Object>{
            'objectApiName' => 'Account',
            'fieldApiNames' => new List<String>{ 'Id', 'Name' },
            'conditions' => 'Name = \'Test Parent Account\'',
            'mapKey' => 'accounts',
            'childRelationships' => new List<Map<String, Object>>{
                new Map<String, Object>{
                    'childObject' => 'Contacts',
                    'fields' => new List<String>{ 'Id', 'LastName' }
                }
            }
        };

        List<Map<String, Object>> queries = new List<Map<String, Object>>{ accountQuery };

        Test.startTest();
        Map<String, List<SObject>> result = DynamicSObjectController.fetchRecordsMultiObjectsWithConditionAndChildren(queries);
        Test.stopTest();

        // Assertions
        System.assertNotEquals(null, result);
        System.assert(result.containsKey('accounts'), 'Result should include key "accounts"');
        List<SObject> accounts = result.get('accounts');
        System.assertEquals(1, accounts.size(), 'Should return 1 account');

        // Check child relationship
        Account returned = (Account) accounts[0];
        List<Contact> contacts = (List<Contact>) returned.getSObjects('Contacts');
        System.assertEquals(1, contacts.size(), 'Should return 1 related contact');
    }
    @IsTest
    static void test_fetchRecordsMultiObjectsWithConditionAndChildren_emptyInput_returnsNull() {
        Map<String, List<SObject>> result = DynamicSObjectController.fetchRecordsMultiObjectsWithConditionAndChildren(new List<Map<String, Object>>());
        System.assertEquals(null, result, 'Should return null when input list is empty');
    }
    
    
    
    @IsTest
    static void test_getRequiredFields_standardObject() {
        // Use a known standard object
        String objectApiName = 'Contact';

        Test.startTest();
        List<String> requiredFields = DynamicSObjectController.getRequiredFields(objectApiName);
        Test.stopTest();

        System.assertNotEquals(null, requiredFields, 'Returned list should not be null');
        System.assert(!requiredFields.isEmpty(), 'Expected required fields for Contact');

        // Confirm that all returned fields meet the logic criteria
        Map<String, Schema.SObjectField> fieldMap = Schema.SObjectType.Contact.fields.getMap();

        for (String fieldName : requiredFields) {
            Schema.DescribeFieldResult fieldDesc = fieldMap.get(fieldName).getDescribe();

            System.assertEquals(true, fieldDesc.isCreateable(), fieldName + ' should be createable');
            System.assertEquals(false, fieldDesc.isNillable(), fieldName + ' should not be nillable');
            System.assertEquals(false, fieldDesc.isAutoNumber(), fieldName + ' should not be autoNumber');
        }
    }
    @IsTest
    static void test_getRequiredFields_unknownObject() {
        // Should return an empty list if object doesn't exist
        Test.startTest();
        List<String> result = DynamicSObjectController.getRequiredFields('FakeObject__c');
        Test.stopTest();

        System.assertNotEquals(null, result, 'Returned value should not be null');
        System.assertEquals(0, result.size(), 'Expected empty list for unknown object');
    }
    
    
    /*
    @IsTest
    static void test_conversionHistoryFetcherV2_withLeadAndNSNPart() {
        // Step 1: Create Account
        Account acc = new Account(Name = 'Test Account');
        insert acc;
        
        // Step 2: Create Lead (must be linked later through NSN Finished Part)
        Lead lead = new Lead(LastName = 'Test Lead', Company = 'LeadCo');
        insert lead;
        
        // Step 3: Create NSN_Finished_Part__c linked to Lead and Account
        NSN_Finished_Part__c part = new NSN_Finished_Part__c(
            Name = 'NSN-001',
            Lead__c = lead.Id,
            Account__c = acc.Id
        );
        insert part;
        
        // Step 4: Convert the lead using standard process
        Database.LeadConvert lc = new Database.LeadConvert();
        lc.setLeadId(lead.Id);
        lc.setConvertedStatus('Qualified'); // must match your org's status picklist
        lc.setDoNotCreateOpportunity(false); // allow opportunity to be created
        Database.LeadConvertResult lcr = Database.convertLead(lc);
        System.assert(lcr.isSuccess(), 'Lead conversion should succeed.');
        
        // Step 5: Query converted Lead for related fields
        Lead convertedLead = [SELECT Id, ConvertedOpportunityId FROM Lead WHERE Id = :lead.Id];
        Id oppId = convertedLead.ConvertedOpportunityId;
        System.assertNotEquals(null, oppId, 'Converted Lead should have an Opportunity');
        
        // Step 6: Create a Completed Task linked to the Lead
        Task task = new Task(
            Subject = 'Converted Lead Task',
            WhoId = convertedLead.Id,
            Status = 'Completed'
        );
        insert task;
        
        // Step 7: Call the method
        Test.startTest();
        List<DynamicSObjectController.SObjectWrapper> results = 
            DynamicSObjectController.conversionHistoryFetcherV2('Opportunity', new List<Id>{ oppId });
        Test.stopTest();
        
        // Step 8: Validate
        System.assertNotEquals(null, results, 'Results should not be null');
        System.assert(results.size() > 0, 'Expected at least one wrapper returned');
        
        Boolean foundTask = false;
        for (DynamicSObjectController.SObjectWrapper wrap : results) {
            if (wrap.tasks != null && !wrap.tasks.isEmpty()) {
                foundTask = true;
            }
        }
        System.assert(foundTask, 'Expected the wrapper to contain at least one completed Task');
    }
    */
    
    
    @isTest
    static void test_fetchMultiParentsConditionallyAndChildrenDynamicV2() {
        // Create parent records (Accounts)
        Account a1 = new Account(Name = 'Parent A');
        Account a2 = new Account(Name = 'Parent B');
        insert new List<Account>{ a1, a2 };

        // Create child records (Contacts)
        Contact c1 = new Contact(LastName = 'Child A', AccountId = a1.Id);
        Contact c2 = new Contact(LastName = 'Child B', AccountId = a2.Id);
        insert new List<Contact>{ c1, c2 };

        // Define inputs
        Map<String, String> conditions = new Map<String, String>{
            'Account' => 'Name LIKE \'Parent%\''
        };

        String childConditions = 'LastName LIKE \'Child%\'';

        List<String> objectNames = new List<String>{ 'Account' };

        Map<String, List<String>> fieldsPerObject = new Map<String, List<String>>{
            'Account' => new List<String>{ 'Id', 'Name' }
        };

        Boolean isFetchChildren = true;

        String childObjectName = 'Contact';

        Map<String, List<String>> childFieldApiNames = new Map<String, List<String>>{
            'AccountId' => new List<String>{ 'Id', 'LastName', 'AccountId' }
        };

        List<String> parentFieldApiNames = new List<String>{ 'AccountId' };

        // Call method
        Test.startTest();
        Map<String, List<SObject>> result = DynamicSObjectController.fetchMultiParentsConditionallyAndChildrenDynamicV2(
            conditions,
            childConditions,
            objectNames,
            fieldsPerObject,
            isFetchChildren,
            childObjectName,
            childFieldApiNames,
            parentFieldApiNames
        );
        Test.stopTest();

        // Assertions
        System.assert(result != null, 'Result map should not be null');
        System.assert(result.containsKey('parents'), 'Result should contain "parents" key');
        System.assert(result.containsKey('children'), 'Result should contain "children" key');
        System.assertEquals(2, result.get('parents').size(), 'Should fetch 2 parent records');
        System.assertEquals(2, result.get('children').size(), 'Should fetch 2 child records');
    }





}