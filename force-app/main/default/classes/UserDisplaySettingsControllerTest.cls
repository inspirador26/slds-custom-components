@isTest
private class UserDisplaySettingsControllerTest {

    private static User createTestUser() {
        Profile p = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1];
        User u = new User(
            Alias = 'tuser',
            Email = 'testuser@example.com',
            EmailEncodingKey = 'UTF-8',
            LastName = 'User',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = p.Id,
            TimeZoneSidKey = 'America/Los_Angeles',
            UserName = 'testuser' + DateTime.now().getTime() + '@example.com'
        );
        insert u;
        return u;
    }

    @isTest
    static void testGetUserDisplaySettings_NoRecord() {
        User testUser = createTestUser();
        System.runAs(testUser) {
            Test.startTest();
            User_Display_Settings__c result = UserDisplaySettingsController.getUserDisplaySettings();
            Test.stopTest();
            System.assertEquals(null, result, 'Should return null when no record exists');
        }
    }

    @isTest
    static void testGetUserDisplaySettings_WithRecord() {
        User testUser = createTestUser();
        insert new User_Display_Settings__c(
            User__c = testUser.Id,
            UserName__c = testUser.UserName,
            Dark_Mode__c = true
        );
        System.runAs(testUser) {
            Test.startTest();
            User_Display_Settings__c result = UserDisplaySettingsController.getUserDisplaySettings();
            Test.stopTest();
            System.assertNotEquals(null, result);
            System.assertEquals(true, result.Dark_Mode__c);
        }
    }

    @isTest
    static void testFetchUserDisplaySettings_NoRecord() {
        User testUser = createTestUser();
        System.runAs(testUser) {
            Test.startTest();
            User_Display_Settings__c result = UserDisplaySettingsController.fetchUserDisplaySettings(testUser.Id);
            Test.stopTest();
            System.assertEquals(null, result);
        }
    }


    @isTest
    static void testFetchUserDisplaySettingsByField_Guards() {
        User testUser = createTestUser();
        System.runAs(testUser) {
            Test.startTest();

            // userId null => null
            User_Display_Settings__c r1 = UserDisplaySettingsController.fetchUserDisplaySettingsByField(
                null,
                new List<String>{ 'Dark_Mode__c' }
            );
            System.assertEquals(null, r1);

            // fields empty => null
            User_Display_Settings__c r2 = UserDisplaySettingsController.fetchUserDisplaySettingsByField(
                testUser.Id,
                new List<String>()
            );
            System.assertEquals(null, r2);

            Test.stopTest();
        }
    }

    @isTest
    static void testSaveUserDisplaySettings_UpdateScenario_BasicBoolean() {
        User testUser = createTestUser();
        User_Display_Settings__c existing = new User_Display_Settings__c(
            User__c = testUser.Id,
            UserName__c = testUser.UserName,
            Dark_Mode__c = false
        );
        insert existing;

        Map<String, String> settings = new Map<String, String>{
            'Dark_Mode__c' => 'true'
        };

        System.runAs(testUser) {
            Test.startTest();
            UserDisplaySettingsController.saveUserDisplaySettings(testUser.Id, settings);
            Test.stopTest();
        }

        User_Display_Settings__c updated = [
            SELECT Dark_Mode__c
            FROM User_Display_Settings__c
            WHERE Id = :existing.Id
        ];
        System.assertEquals(true, updated.Dark_Mode__c);
    }
    
    @isTest
    static void testSaveUserDisplaySettings_ColumnWidthsAllJson_Envelope_MergesByObjectAndListView() {
        User testUser = createTestUser();
    
        Map<String, Object> envA = new Map<String, Object>{
            'objectApiName' => 'Lead',
            'listViewApiName' => 'All_Leads',
            'colWidths' => new List<Object>{
                new Map<String, Object>{ 'fieldName' => 'Name', 'width' => '120px' }
            }
        };
    
        Map<String, Object> envB = new Map<String, Object>{
            'objectApiName' => 'Lead',
            'listViewApiName' => '__Recent',
            'colWidths' => new List<Object>{
                new Map<String, Object>{ 'fieldName' => 'Status', 'width' => '90px' }
            }
        };
    
        Map<String, Object> envC = new Map<String, Object>{
            'objectApiName' => 'Opportunity',
            'listViewApiName' => 'All_Opportunities',
            'colWidths' => new List<Object>{
                new Map<String, Object>{ 'fieldName' => 'Name', 'width' => '150px' }
            }
        };
    
        System.runAs(testUser) {
            Test.startTest();
            UserDisplaySettingsController.saveUserDisplaySettings(null, new Map<String, String>{
                'Column_Widths_All_JSON__c' => JSON.serialize(envA)
            });
            UserDisplaySettingsController.saveUserDisplaySettings(null, new Map<String, String>{
                'Column_Widths_All_JSON__c' => JSON.serialize(envB)
            });
            UserDisplaySettingsController.saveUserDisplaySettings(null, new Map<String, String>{
                'Column_Widths_All_JSON__c' => JSON.serialize(envC)
            });
            Test.stopTest();
        }
    
        User_Display_Settings__c rec = [
            SELECT Column_Widths_All_JSON__c
            FROM User_Display_Settings__c
            WHERE User__c = :testUser.Id
            LIMIT 1
        ];
    
        Map<String, Object> stored = (Map<String, Object>) JSON.deserializeUntyped(rec.Column_Widths_All_JSON__c);
        Map<String, Object> leadMap = (Map<String, Object>) stored.get('Lead');
        Map<String, Object> oppMap = (Map<String, Object>) stored.get('Opportunity');
    
        System.assertNotEquals(null, leadMap);
        System.assertNotEquals(null, oppMap);
        System.assertEquals(true, leadMap.containsKey('All_Leads'));
        System.assertEquals(true, leadMap.containsKey('__Recent'));
        System.assertEquals(true, oppMap.containsKey('All_Opportunities'));
    }
    
    @isTest
    static void testSaveUserDisplaySettings_PageSizeAllJson_Envelope_MergesByObjectAndListView() {
        User testUser = createTestUser();
    
        Map<String, Object> envA = new Map<String, Object>{
            'objectApiName' => 'Lead',
            'listViewApiName' => 'All_Leads',
            'pageSize' => 25
        };
    
        Map<String, Object> envB = new Map<String, Object>{
            'objectApiName' => 'Lead',
            'listViewApiName' => '__Recent',
            'pageSize' => 50
        };
    
        System.runAs(testUser) {
            Test.startTest();
            UserDisplaySettingsController.saveUserDisplaySettings(null, new Map<String, String>{
                'Page_Size_All_JSON__c' => JSON.serialize(envA)
            });
            UserDisplaySettingsController.saveUserDisplaySettings(null, new Map<String, String>{
                'Page_Size_All_JSON__c' => JSON.serialize(envB)
            });
            Test.stopTest();
        }
    
        User_Display_Settings__c rec = [
            SELECT Page_Size_All_JSON__c
            FROM User_Display_Settings__c
            WHERE User__c = :testUser.Id
            LIMIT 1
        ];
    
        Map<String, Object> stored = (Map<String, Object>) JSON.deserializeUntyped(rec.Page_Size_All_JSON__c);
        Map<String, Object> leadMap = (Map<String, Object>) stored.get('Lead');
    
        System.assertEquals(25, Integer.valueOf(String.valueOf(leadMap.get('All_Leads'))));
        System.assertEquals(50, Integer.valueOf(String.valueOf(leadMap.get('__Recent'))));
    }
    
    @isTest
    static void testSaveUserDisplaySettings_DefaultListViewsJson_Envelope_MergesByObject() {
        User testUser = createTestUser();
    
        Map<String, Object> envA = new Map<String, Object>{
            'objectApiName' => 'Lead',
            'listViewApiName' => 'All_Leads'
        };
    
        Map<String, Object> envB = new Map<String, Object>{
            'objectApiName' => 'Opportunity',
            'listViewApiName' => 'All_Opportunities'
        };
    
        System.runAs(testUser) {
            Test.startTest();
            UserDisplaySettingsController.saveUserDisplaySettings(null, new Map<String, String>{
                'Default_List_Views_JSON__c' => JSON.serialize(envA)
            });
            UserDisplaySettingsController.saveUserDisplaySettings(null, new Map<String, String>{
                'Default_List_Views_JSON__c' => JSON.serialize(envB)
            });
            Test.stopTest();
        }
    
        User_Display_Settings__c rec = [
            SELECT Default_List_Views_JSON__c
            FROM User_Display_Settings__c
            WHERE User__c = :testUser.Id
            LIMIT 1
        ];
    
        Map<String, Object> stored = (Map<String, Object>) JSON.deserializeUntyped(rec.Default_List_Views_JSON__c);
    
        System.assertEquals('All_Leads', String.valueOf(stored.get('Lead')));
        System.assertEquals('All_Opportunities', String.valueOf(stored.get('Opportunity')));
    }
    
    @isTest
    static void testSaveUserDisplaySettings_DefaultListViewsJson_FinalShape() {
        User testUser = createTestUser();
    
        Map<String, Object> finalShape = new Map<String, Object>{
            'Lead' => '__Recent',
            'Opportunity' => 'All_Opportunities'
        };
    
        System.runAs(testUser) {
            Test.startTest();
            UserDisplaySettingsController.saveUserDisplaySettings(null, new Map<String, String>{
                'Default_List_Views_JSON__c' => JSON.serialize(finalShape)
            });
            Test.stopTest();
        }
    
        User_Display_Settings__c rec = [
            SELECT Default_List_Views_JSON__c
            FROM User_Display_Settings__c
            WHERE User__c = :testUser.Id
            LIMIT 1
        ];
    
        Map<String, Object> stored = (Map<String, Object>) JSON.deserializeUntyped(rec.Default_List_Views_JSON__c);
        System.assertEquals('__Recent', String.valueOf(stored.get('Lead')));
        System.assertEquals('All_Opportunities', String.valueOf(stored.get('Opportunity')));
    }

    @isTest
    static void testSaveCustomListView_MergesByPageAndListView() {
        User testUser = createTestUser();

        Map<String, Object> filtersA = new Map<String, Object>{
            'version' => 1,
            'source' => 'builder',
            'isApplied' => true,
            'filters' => new List<Object>{
                new Map<String, Object>{
                    'group' => 'production',
                    'fieldApiName' => 'Material__c',
                    'operator' => 'eq',
                    'dtype' => 'picklist',
                    'operandLabels' => new List<Object>{ 'Aluminum' }
                }
            },
            'logicByGroup' => new Map<String, Object>{ 'production' => '1' },
            'visibleGroups' => new List<Object>()
        };
        Map<String, Object> filtersB = new Map<String, Object>{
            'version' => 1,
            'source' => 'builder',
            'isApplied' => true,
            'filters' => new List<Object>{
                new Map<String, Object>{
                    'group' => 'casting',
                    'fieldApiName' => 'Cost__c',
                    'operator' => 'gt',
                    'dtype' => 'number',
                    'operandLabels' => new List<Object>{ '100' }
                }
            },
            'logicByGroup' => new Map<String, Object>{ 'casting' => '1' },
            'visibleGroups' => new List<Object>()
        };

        System.runAs(testUser) {
            Test.startTest();
            UserDisplaySettingsController.saveCustomListView(
                'Bill_of_Materials',
                'bom_filter_a',
                'BOM Filter A',
                JSON.serialize(filtersA),
                true
            );
            String savedJson = UserDisplaySettingsController.saveCustomListView(
                'Bill_of_Materials',
                'bom_filter_b',
                'BOM Filter B',
                JSON.serialize(filtersB),
                true
            );
            Test.stopTest();

            Map<String, Object> saved = (Map<String, Object>) JSON.deserializeUntyped(savedJson);
            Map<String, Object> pageConfig = (Map<String, Object>) saved.get('Bill_of_Materials');
            Map<String, Object> listViews = (Map<String, Object>) pageConfig.get('list_views');

            System.assertEquals('bom_filter_b', String.valueOf(pageConfig.get('default')));
            System.assertEquals(true, listViews.containsKey('bom_filter_a'));
            System.assertEquals(true, listViews.containsKey('bom_filter_b'));

            Map<String, Object> viewB = (Map<String, Object>) listViews.get('bom_filter_b');
            Map<String, Object> storedFilters = (Map<String, Object>) viewB.get('filters');
            Map<String, Object> storedLogic = (Map<String, Object>) storedFilters.get('logicByGroup');

            System.assertEquals('BOM Filter B', String.valueOf(viewB.get('label')));
            System.assertEquals('bom_filter_b', String.valueOf(viewB.get('api_name')));
            System.assertEquals('1', String.valueOf(storedLogic.get('casting')));
        }

        Id testUserId = testUser.Id;
        List<SObject> settingsRows = Database.query(
            'SELECT Custom_List_Views__c FROM User_Display_Settings__c WHERE User__c = :testUserId LIMIT 1'
        );
        System.assertEquals(1, settingsRows.size());
        System.assertNotEquals(null, settingsRows[0].get('Custom_List_Views__c'));
    }

    @isTest
    static void testGetCustomListViews_ReturnsPageConfig() {
        User testUser = createTestUser();

        Map<String, Object> filters = new Map<String, Object>{
            'version' => 1,
            'source' => 'builder',
            'isApplied' => true,
            'filters' => new List<Object>{
                new Map<String, Object>{
                    'group' => 'production',
                    'fieldApiName' => 'Material__c',
                    'operator' => 'eq',
                    'dtype' => 'picklist',
                    'operandLabels' => new List<Object>{ 'Steel' }
                }
            },
            'logicByGroup' => new Map<String, Object>{ 'production' => '1' },
            'visibleGroups' => new List<Object>{ 'production' }
        };

        System.runAs(testUser) {
            UserDisplaySettingsController.saveCustomListView(
                'Bill_of_Materials',
                'steel_parts',
                'Steel Parts',
                JSON.serialize(filters),
                true
            );

            Test.startTest();
            String pageJson = UserDisplaySettingsController.getCustomListViews('Bill_of_Materials');
            String missingPageJson = UserDisplaySettingsController.getCustomListViews('Missing_Page');
            Test.stopTest();

            System.assertEquals(null, missingPageJson);
            System.assertNotEquals(null, pageJson);

            Map<String, Object> pageConfig = (Map<String, Object>) JSON.deserializeUntyped(pageJson);
            Map<String, Object> listViews = (Map<String, Object>) pageConfig.get('list_views');
            Map<String, Object> steelView = (Map<String, Object>) listViews.get('steel_parts');
            Map<String, Object> storedFilters = (Map<String, Object>) steelView.get('filters');

            System.assertEquals('steel_parts', String.valueOf(pageConfig.get('default')));
            System.assertEquals('Steel Parts', String.valueOf(steelView.get('label')));
            System.assertEquals(true, (Boolean) storedFilters.get('isApplied'));
        }
    }

    @isTest
    static void testSaveCustomListViewDoesNotSetDefaultWhenNotRequested() {
        User testUser = createTestUser();

        Map<String, Object> filters = new Map<String, Object>{
            'version' => 1,
            'source' => 'builder',
            'isApplied' => true,
            'filters' => new List<Object>(),
            'logicByGroup' => new Map<String, Object>(),
            'visibleGroups' => new List<Object>{ 'production' }
        };

        System.runAs(testUser) {
            Test.startTest();
            String savedJson = UserDisplaySettingsController.saveCustomListView(
                'Bill_of_Materials',
                'steel_parts',
                'Steel Parts',
                JSON.serialize(filters),
                false
            );
            Test.stopTest();

            Map<String, Object> saved = (Map<String, Object>) JSON.deserializeUntyped(savedJson);
            Map<String, Object> pageConfig = (Map<String, Object>) saved.get('Bill_of_Materials');
            Map<String, Object> listViews = (Map<String, Object>) pageConfig.get('list_views');

            System.assertEquals(true, listViews.containsKey('steel_parts'));
            System.assertEquals(null, pageConfig.get('default'));
        }
    }

    @isTest
    static void testUpdateDefaultCustomListView() {
        User testUser = createTestUser();

        Map<String, Object> filters = new Map<String, Object>{
            'version' => 1,
            'source' => 'builder',
            'isApplied' => true,
            'filters' => new List<Object>(),
            'logicByGroup' => new Map<String, Object>(),
            'visibleGroups' => new List<Object>{ 'production' }
        };

        System.runAs(testUser) {
            UserDisplaySettingsController.saveCustomListView(
                'Bill_of_Materials',
                'view_a',
                'View A',
                JSON.serialize(filters),
                true
            );
            UserDisplaySettingsController.saveCustomListView(
                'Bill_of_Materials',
                'view_b',
                'View B',
                JSON.serialize(filters),
                false
            );

            Test.startTest();
            String pageJson = UserDisplaySettingsController.updateDefaultCustomListView(
                'Bill_of_Materials',
                'view_b'
            );
            Test.stopTest();

            Map<String, Object> pageConfig = (Map<String, Object>) JSON.deserializeUntyped(pageJson);
            System.assertEquals('view_b', String.valueOf(pageConfig.get('default')));
        }
    }

    @isTest
    static void testUpdateDefaultCustomListViewClearsDefault() {
        User testUser = createTestUser();

        Map<String, Object> filters = new Map<String, Object>{
            'version' => 1,
            'source' => 'builder',
            'isApplied' => true,
            'filters' => new List<Object>(),
            'logicByGroup' => new Map<String, Object>(),
            'visibleGroups' => new List<Object>{ 'production' }
        };

        System.runAs(testUser) {
            UserDisplaySettingsController.saveCustomListView(
                'Bill_of_Materials',
                'view_a',
                'View A',
                JSON.serialize(filters),
                true
            );

            Test.startTest();
            String pageJson = UserDisplaySettingsController.updateDefaultCustomListView(
                'Bill_of_Materials',
                null
            );
            Test.stopTest();

            Map<String, Object> pageConfig = (Map<String, Object>) JSON.deserializeUntyped(pageJson);
            System.assertEquals(null, pageConfig.get('default'));
        }
    }

    @isTest
    static void testDeleteCustomListViewClearsDefault() {
        User testUser = createTestUser();

        Map<String, Object> filters = new Map<String, Object>{
            'version' => 1,
            'source' => 'builder',
            'isApplied' => true,
            'filters' => new List<Object>(),
            'logicByGroup' => new Map<String, Object>(),
            'visibleGroups' => new List<Object>{ 'production' }
        };

        System.runAs(testUser) {
            UserDisplaySettingsController.saveCustomListView(
                'Bill_of_Materials',
                'delete_me',
                'Delete Me',
                JSON.serialize(filters),
                true
            );

            Test.startTest();
            String pageJson = UserDisplaySettingsController.deleteCustomListView(
                'Bill_of_Materials',
                'delete_me'
            );
            Test.stopTest();

            Map<String, Object> pageConfig = (Map<String, Object>) JSON.deserializeUntyped(pageJson);
            Map<String, Object> listViews = (Map<String, Object>) pageConfig.get('list_views');

            System.assertEquals(false, listViews.containsKey('delete_me'));
            System.assertEquals(null, pageConfig.get('default'));
        }
    }
    
}
