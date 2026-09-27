public with sharing class UserDisplaySettingsController {

    // Get Dark Mode Boolean field
    @AuraEnabled(cacheable=true)
    public static User_Display_Settings__c getUserDisplaySettings() {
        // Get the current user's ID
        Id currentUserId = UserInfo.getUserId();
        
        // Query the User_Display_Settings__c object for the current user
        List<User_Display_Settings__c> settings = [
            SELECT Id, Dark_Mode__c 
            FROM User_Display_Settings__c 
            WHERE User__c = :currentUserId
            LIMIT 1
        ];

        // If no record is found, return null or a default value
        if (settings.isEmpty()) {
            return null;  // Alternatively, return a default object if desired
        }
        return settings[0];  // Return the first setting found
    }
    


    // ======================== Column Width Settings ========================= \\
    // Get Column Width user settings
    @AuraEnabled(cacheable=true)
    public static User_Display_Settings__c fetchUserDisplaySettings(Id userId) {
        try {
            // Get all user display settings fields
            User_Display_Settings__c userSettings = getUserDisplaySettingFields(new List<String>());

            return userSettings;       

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    // Get Column Width user settings
    @AuraEnabled(cacheable=true)
    public static User_Display_Settings__c fetchUserDisplaySettingsByField(Id userId, List<String> fields) {
        try {
            if (userId == null || fields.isEmpty()) {
                return null;
            }
            // Get all user display settings fields
            User_Display_Settings__c userSettings = getUserDisplaySettingFields(fields);

            return userSettings;       

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    // Create or Update User_Display_Settings__c record
    @AuraEnabled
    public static void saveUserDisplaySettings(Id userId, Map<String, String> userSettings) {
        try {
            if (userId == null) {
                userId = UserInfo.getUserId();
            }

            // Get new or existing record (your helper currently only selects Id)
            User_Display_Settings__c userSettingsRec = getUserDisplayRecordOnCRUD();
            Id settingsId = userSettingsRec.Id;

            // Updatable User_Display_Settings__c fields
            Set<String> updatableFields = new Set<String>{
                'Dark_Mode__c',
                'IsStopRichTextHelp__c',    
                'Column_Widths_All_JSON__c',
                'Page_Size_All_JSON__c',
                'Page_Size_Lead_JSON__c',
                'Page_Size_Opportunity_JSON__c',
                'Default_List_Views_JSON__c',
                'Custom_List_Views__c'
            };

            for (String key : userSettings.keySet()) {
                if (!updatableFields.contains(key)) {
                    continue;
                }

                if (key == 'Dark_Mode__c') {
                    userSettingsRec.put(key, Boolean.valueOf(userSettings.get(key)));
                    continue;
                }
                
                // ⭐️ Best for column widths
                if (key == 'Column_Widths_All_JSON__c') {
                    String incomingJson = userSettings.get(key);
                    if (String.isBlank(incomingJson)) {
                        continue;
                    }

                    Object incomingUntyped = JSON.deserializeUntyped(incomingJson);
                    if (incomingUntyped instanceof Map<String, Object>) {
                        Map<String, Object> incomingMap = (Map<String, Object>) incomingUntyped;

                        // Envelope format: { objectApiName, listViewApiName, colWidths }
                        if (
                            incomingMap.containsKey('objectApiName') &&
                            incomingMap.containsKey('listViewApiName') &&
                            incomingMap.containsKey('colWidths')
                        ) {
                            String objectApiName = (String) incomingMap.get('objectApiName');
                            String listViewApiName = (String) incomingMap.get('listViewApiName');
                            Object colWidthsObj = incomingMap.get('colWidths');

                            if (String.isBlank(objectApiName) || String.isBlank(listViewApiName) || colWidthsObj == null) {
                                continue;
                            }

                            Map<String, Object> existing = new Map<String, Object>();
                            String existingJson = null;

                            if (settingsId != null) {
                                String soql = 'SELECT Id, ' + key + ' FROM User_Display_Settings__c WHERE Id = :settingsId LIMIT 1';
                                User_Display_Settings__c existingRec = Database.query(soql);
                                existingJson = (String) existingRec.get(key);
                            }

                            if (!String.isBlank(existingJson)) {
                                try {
                                    existing = (Map<String, Object>) JSON.deserializeUntyped(existingJson);
                                } catch (Exception e) {
                                    existing = new Map<String, Object>();
                                }
                            }

                            Map<String, Object> existingObjectMap = new Map<String, Object>();
                            if (existing.containsKey(objectApiName) && existing.get(objectApiName) instanceof Map<String, Object>) {
                                existingObjectMap = (Map<String, Object>) existing.get(objectApiName);
                            }

                            existingObjectMap.put(listViewApiName, colWidthsObj);
                            existing.put(objectApiName, existingObjectMap);

                            userSettingsRec.put(key, JSON.serialize(existing));
                            continue;
                        }

                        // Already in final shape:
                        // { "Lead": { "All_Leads": [...], "__Recent": [...] } }
                        userSettingsRec.put(key, JSON.serialize(incomingMap));
                        continue;
                    }

                    continue;
                }
                // ⭐️ Best for page size
                if (key == 'Page_Size_All_JSON__c') {
                    String incomingJson = userSettings.get(key);
                    if (String.isBlank(incomingJson)) {
                        continue;
                    }

                    Object incomingUntyped = JSON.deserializeUntyped(incomingJson);
                    if (incomingUntyped instanceof Map<String, Object>) {
                        Map<String, Object> incomingMap = (Map<String, Object>) incomingUntyped;

                        // Envelope format: { objectApiName, listViewApiName, pageSize }
                        if (
                            incomingMap.containsKey('objectApiName') &&
                            incomingMap.containsKey('listViewApiName') &&
                            incomingMap.containsKey('pageSize')
                        ) {
                            String objectApiName = (String) incomingMap.get('objectApiName');
                            String listViewApiName = (String) incomingMap.get('listViewApiName');
                            Object pageSizeObj = incomingMap.get('pageSize');

                            if (String.isBlank(objectApiName) || String.isBlank(listViewApiName) || pageSizeObj == null) {
                                continue;
                            }

                            Integer pageSize = Integer.valueOf(String.valueOf(pageSizeObj));

                            Map<String, Object> existing = new Map<String, Object>();
                            String existingJson = null;

                            if (settingsId != null) {
                                String soql = 'SELECT Id, ' + key + ' FROM User_Display_Settings__c WHERE Id = :settingsId LIMIT 1';
                                User_Display_Settings__c existingRec = Database.query(soql);
                                existingJson = (String) existingRec.get(key);
                            }

                            if (!String.isBlank(existingJson)) {
                                try {
                                    existing = (Map<String, Object>) JSON.deserializeUntyped(existingJson);
                                } catch (Exception e) {
                                    existing = new Map<String, Object>();
                                }
                            }

                            Map<String, Object> existingObjectMap = new Map<String, Object>();
                            if (existing.containsKey(objectApiName) && existing.get(objectApiName) instanceof Map<String, Object>) {
                                existingObjectMap = (Map<String, Object>) existing.get(objectApiName);
                            }

                            existingObjectMap.put(listViewApiName, pageSize);
                            existing.put(objectApiName, existingObjectMap);

                            userSettingsRec.put(key, JSON.serialize(existing));
                            continue;
                        }

                        // Already in final shape:
                        // { "Lead": { "All_Leads": 50, "__Recent": 20 } }
                        userSettingsRec.put(key, JSON.serialize(incomingMap));
                        continue;
                    }

                    continue;
                }
                // ⭐️ Best for default list views
                if (key == 'Default_List_Views_JSON__c') {
                    String incomingJson = userSettings.get(key);
                    if (String.isBlank(incomingJson)) {
                        continue; 
                    }
                    Object incomingUntyped = JSON.deserializeUntyped(incomingJson);
                    if (incomingUntyped instanceof Map<String, Object>) {
                        Map<String, Object> incomingMap = (Map<String, Object>) incomingUntyped;

                        // Envelope format: { objectApiName, listViewApiName }
                        if (incomingMap.containsKey('objectApiName') && incomingMap.containsKey('listViewApiName')) {
                            String objectApiName = (String) incomingMap.get('objectApiName');
                            String listViewApiName = (String) incomingMap.get('listViewApiName');

                            if (String.isBlank(objectApiName) || String.isBlank(listViewApiName)) {
                                continue;
                            }

                            Map<String, Object> existing = new Map<String, Object>();
                            String existingJson = null;

                            if (settingsId != null) {
                                String soql = 'SELECT Id, ' + key + ' FROM User_Display_Settings__c WHERE Id = :settingsId LIMIT 1';
                                User_Display_Settings__c existingRec = Database.query(soql);
                                existingJson = (String) existingRec.get(key);
                            }

                            if (!String.isBlank(existingJson)) {
                                try {
                                    existing = (Map<String, Object>) JSON.deserializeUntyped(existingJson);
                                } catch (Exception e) {
                                    existing = new Map<String, Object>();
                                }
                            }

                            existing.put(objectApiName, listViewApiName);
                            userSettingsRec.put(key, JSON.serialize(existing));
                            continue;
                        }

                        // Already in final shape: { "Lead": "__Recent", "Opportunity": "All_Opportunities" }
                        userSettingsRec.put(key, JSON.serialize(incomingMap));
                        continue;
                    }

                    continue;
                }
                if (key == 'Custom_List_Views__c') {
                    String incomingJson = userSettings.get(key);
                    if (String.isBlank(incomingJson)) {
                        continue;
                    }

                    Object incomingUntyped = JSON.deserializeUntyped(incomingJson);
                    if (incomingUntyped instanceof Map<String, Object>) {
                        userSettingsRec.put(key, JSON.serialize(incomingUntyped));
                    }
                    continue;
                }
                // Handle JSON width fields: Column_Widths_<Object>_JSON__c
                // Incoming value is: {"listViewApiName":"SomeView","colWidths":[{...},{...}]}
                if (key != null && key.startsWith('Column_Widths_') && key.endsWith('_JSON__c')) {
                    String incomingJson = userSettings.get(key);
                    if (String.isBlank(incomingJson)) {
                        continue;
                    }
                    Object incomingUntyped = JSON.deserializeUntyped(incomingJson);
                    // If JS sent the keyed-by-view map, just store it directly (or merge if you want)
                    if (incomingUntyped instanceof Map<String, Object>) {
                        Map<String, Object> incomingMap = (Map<String, Object>) incomingUntyped;

                        // Envelope format: { listViewApiName, colWidths }
                        if (incomingMap.containsKey('listViewApiName') && incomingMap.containsKey('colWidths')) {
                            String listViewApiName = (String) incomingMap.get('listViewApiName');
                            Object colWidthsObj = incomingMap.get('colWidths');

                            if (String.isBlank(listViewApiName) || colWidthsObj == null) {
                                continue;
                            }

                            Map<String, Object> existing = new Map<String, Object>();
                            String existingJson = null;

                            if (settingsId != null) {
                                String soql = 'SELECT Id, ' + key + ' FROM User_Display_Settings__c WHERE Id = :settingsId LIMIT 1';
                                User_Display_Settings__c existingRec = Database.query(soql);
                                existingJson = (String) existingRec.get(key);
                            }

                            if (!String.isBlank(existingJson)) {
                                try {
                                    existing = (Map<String, Object>) JSON.deserializeUntyped(existingJson);
                                } catch (Exception e) {
                                    existing = new Map<String, Object>();
                                }
                            }

                            existing.put(listViewApiName, colWidthsObj);
                            userSettingsRec.put(key, JSON.serialize(existing));
                            continue;
                        }
                        // Keyed-map format: { "SomeView": [..], "OtherView": [..] }
                        userSettingsRec.put(key, JSON.serialize(incomingMap));
                        continue;
                    }
                    continue;
                }
                if (key != null && key.startsWith('Page_Size_') && key.endsWith('_JSON__c')) {
                    String incomingJson = userSettings.get(key);
                    if (String.isBlank(incomingJson)) {
                        continue;
                    }
                    Object incomingUntyped = JSON.deserializeUntyped(incomingJson);
                    if (incomingUntyped instanceof Map<String, Object>) {
                        Map<String, Object> incomingMap = (Map<String, Object>) incomingUntyped;

                        // Envelope format: { listViewApiName, pageSize }
                        if (incomingMap.containsKey('listViewApiName') && incomingMap.containsKey('pageSize')) {
                            String listViewApiName = (String) incomingMap.get('listViewApiName');
                            Object pageSizeObj = incomingMap.get('pageSize');

                            if (String.isBlank(listViewApiName) || pageSizeObj == null) {
                                continue;
                            }

                            Integer pageSize = Integer.valueOf(String.valueOf(pageSizeObj));

                            Map<String, Object> existing = new Map<String, Object>();
                            String existingJson = null;

                            if (settingsId != null) {
                                String soql = 'SELECT Id, ' + key + ' FROM User_Display_Settings__c WHERE Id = :settingsId LIMIT 1';
                                User_Display_Settings__c existingRec = Database.query(soql);
                                existingJson = (String) existingRec.get(key);
                            }

                            if (!String.isBlank(existingJson)) {
                                try {
                                    existing = (Map<String, Object>) JSON.deserializeUntyped(existingJson);
                                } catch (Exception e) {
                                    existing = new Map<String, Object>();
                                }
                            }

                            existing.put(listViewApiName, pageSize);
                            userSettingsRec.put(key, JSON.serialize(existing));
                            continue;
                        }

                        // Optional: keyed-map format already in desired shape: { "ViewA": 25, "ViewB": 50 }
                        userSettingsRec.put(key, JSON.serialize(incomingMap));
                        continue;
                    }
                    continue;
                }
                // Default: store the incoming string
                userSettingsRec.put(key, userSettings.get(key));
            }

            upsert userSettingsRec;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    // ========================================================================= \\

    // ========================= Custom List Views ========================== \\
    @AuraEnabled(cacheable=true)
    public static String getCustomListViews(String pageName) {
        try {
            User_Display_Settings__c userSettings = getUserDisplaySettingFields(
                new List<String>{ 'Custom_List_Views__c' }
            );

            if (userSettings == null || String.isBlank(userSettings.Custom_List_Views__c)) {
                return null;
            }

            if (String.isBlank(pageName)) {
                return userSettings.Custom_List_Views__c;
            }

            Object storedUntyped = JSON.deserializeUntyped(userSettings.Custom_List_Views__c);
            if (!(storedUntyped instanceof Map<String, Object>)) {
                return null;
            }

            Map<String, Object> stored = (Map<String, Object>) storedUntyped;
            if (!stored.containsKey(pageName) || !(stored.get(pageName) instanceof Map<String, Object>)) {
                return null;
            }

            return JSON.serialize(stored.get(pageName));
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String saveCustomListView(
        String pageName,
        String listViewApiName,
        String listViewLabel,
        String filtersJson,
        Boolean makeDefault
    ) {
        try {
            if (String.isBlank(pageName)) {
                throw new AuraHandledException('pageName is required.');
            }
            if (String.isBlank(listViewApiName)) {
                throw new AuraHandledException('listViewApiName is required.');
            }

            User_Display_Settings__c userSettingsRec = getUserDisplayRecordOnCRUD();
            Id settingsId = userSettingsRec.Id;

            Map<String, Object> existing = new Map<String, Object>();
            if (settingsId != null) {
                User_Display_Settings__c existingRec = Database.query(
                    'SELECT Id, Custom_List_Views__c FROM User_Display_Settings__c WHERE Id = :settingsId LIMIT 1'
                );
                String existingJson = (String) existingRec.get('Custom_List_Views__c');
                if (!String.isBlank(existingJson)) {
                    try {
                        Object existingUntyped = JSON.deserializeUntyped(existingJson);
                        if (existingUntyped instanceof Map<String, Object>) {
                            existing = (Map<String, Object>) existingUntyped;
                        }
                    } catch (Exception e) {
                        existing = new Map<String, Object>();
                    }
                }
            }

            Map<String, Object> pageConfig = new Map<String, Object>();
            if (existing.containsKey(pageName) && existing.get(pageName) instanceof Map<String, Object>) {
                pageConfig = (Map<String, Object>) existing.get(pageName);
            }

            Map<String, Object> listViews = new Map<String, Object>();
            if (pageConfig.containsKey('list_views') && pageConfig.get('list_views') instanceof Map<String, Object>) {
                listViews = (Map<String, Object>) pageConfig.get('list_views');
            }

            Object filtersPayload = new Map<String, Object>();
            if (!String.isBlank(filtersJson)) {
                filtersPayload = JSON.deserializeUntyped(filtersJson);
            }

            Map<String, Object> listViewConfig = new Map<String, Object>{
                'label' => String.isBlank(listViewLabel) ? listViewApiName : listViewLabel,
                'api_name' => listViewApiName,
                'filters' => filtersPayload
            };

            listViews.put(listViewApiName, listViewConfig);
            pageConfig.put('list_views', listViews);

            if (makeDefault == true) {
                pageConfig.put('default', listViewApiName);
            }

            existing.put(pageName, pageConfig);
            String storedJson = JSON.serialize(existing);

            userSettingsRec.put('Custom_List_Views__c', storedJson);
            upsert userSettingsRec;

            return storedJson;
        } catch (AuraHandledException e) {
            throw e;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String updateDefaultCustomListView(String pageName, String listViewApiName) {
        try {
            if (String.isBlank(pageName)) {
                throw new AuraHandledException('pageName is required.');
            }
            User_Display_Settings__c userSettingsRec = getUserDisplayRecordOnCRUD();
            Map<String, Object> existing = getExistingCustomListViews(userSettingsRec.Id);
            Map<String, Object> pageConfig = getPageConfig(existing, pageName);
            Map<String, Object> listViews = getListViews(pageConfig);

            if (!String.isBlank(listViewApiName) && !listViews.containsKey(listViewApiName)) {
                throw new AuraHandledException('List view does not exist.');
            }

            pageConfig.put('default', String.isBlank(listViewApiName) ? null : listViewApiName);
            pageConfig.put('list_views', listViews);
            existing.put(pageName, pageConfig);

            userSettingsRec.put('Custom_List_Views__c', JSON.serialize(existing));
            upsert userSettingsRec;

            return JSON.serialize(pageConfig);
        } catch (AuraHandledException e) {
            throw e;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String deleteCustomListView(String pageName, String listViewApiName) {
        try {
            if (String.isBlank(pageName)) {
                throw new AuraHandledException('pageName is required.');
            }
            if (String.isBlank(listViewApiName)) {
                throw new AuraHandledException('listViewApiName is required.');
            }

            User_Display_Settings__c userSettingsRec = getUserDisplayRecordOnCRUD();
            Map<String, Object> existing = getExistingCustomListViews(userSettingsRec.Id);
            Map<String, Object> pageConfig = getPageConfig(existing, pageName);
            Map<String, Object> listViews = getListViews(pageConfig);

            if (!listViews.containsKey(listViewApiName)) {
                return JSON.serialize(pageConfig);
            }

            listViews.remove(listViewApiName);
            pageConfig.put('list_views', listViews);

            if (String.valueOf(pageConfig.get('default')) == listViewApiName) {
                pageConfig.put('default', null);
            }

            existing.put(pageName, pageConfig);
            userSettingsRec.put('Custom_List_Views__c', JSON.serialize(existing));
            upsert userSettingsRec;

            return JSON.serialize(pageConfig);
        } catch (AuraHandledException e) {
            throw e;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    private static Map<String, Object> getExistingCustomListViews(Id settingsId) {
        Map<String, Object> existing = new Map<String, Object>();
        if (settingsId == null) {
            return existing;
        }

        User_Display_Settings__c existingRec = Database.query(
            'SELECT Id, Custom_List_Views__c FROM User_Display_Settings__c WHERE Id = :settingsId LIMIT 1'
        );
        String existingJson = (String) existingRec.get('Custom_List_Views__c');
        if (String.isBlank(existingJson)) {
            return existing;
        }

        try {
            Object existingUntyped = JSON.deserializeUntyped(existingJson);
            if (existingUntyped instanceof Map<String, Object>) {
                existing = (Map<String, Object>) existingUntyped;
            }
        } catch (Exception e) {
            existing = new Map<String, Object>();
        }

        return existing;
    }

    private static Map<String, Object> getPageConfig(Map<String, Object> existing, String pageName) {
        if (existing.containsKey(pageName) && existing.get(pageName) instanceof Map<String, Object>) {
            return (Map<String, Object>) existing.get(pageName);
        }
        return new Map<String, Object>{
            'default' => null,
            'list_views' => new Map<String, Object>()
        };
    }

    private static Map<String, Object> getListViews(Map<String, Object> pageConfig) {
        if (pageConfig.containsKey('list_views') && pageConfig.get('list_views') instanceof Map<String, Object>) {
            return (Map<String, Object>) pageConfig.get('list_views');
        }
        return new Map<String, Object>();
    }
    // ========================================================================= \\



    // ================================ Helpers ================================ \\
    // Get the user display setting record of the user or create a new one
    private static User_Display_Settings__c getUserDisplayRecordOnCRUD() {
        // Get User Id
        Id userId = UserInfo.getUserId();

        // Initialize User_Display_Settings__c
        User_Display_Settings__c userSettingsRec = new User_Display_Settings__c();

        // Get User's User_Display_Settings__c record
        List<User_Display_Settings__c> userDisplayRecords = [SELECT Id FROM User_Display_Settings__c WHERE User__c = :userId];


        if (userDisplayRecords.isEmpty()) {  // Handle new User_Display_Settings__c record

            // Get User record
            List<User> users = [SELECT Id, UserName FROM User WHERE Id = :userId]; 

            
            // Set unique identifiers (UserName__c/User__c) of User_Display_Settings__c
            userSettingsRec.UserName__c = users[0].UserName;
            userSettingsRec.User__c = users[0].Id;
            return userSettingsRec;  

        } else {                           // Handle updating User_Display_Settings__c record
            userSettingsRec.Id  = userDisplayRecords[0].Id;
        }

        return userSettingsRec;
    } 

    // Get User_Display_Settings__c record along with fields for non-CRUD operation  --> Returns null if no record exists
    private static User_Display_Settings__c getUserDisplaySettingFields(List<String> fields) {
        // Get User Id
        Id userId = UserInfo.getUserId();

        // Ensure Id is present in List
        if (fields != null && !fields.isEmpty() && !fields.contains('Id')) {
            fields.add('Id');
        }

        // Get all fields if none specified
        if (fields == null || fields.isEmpty()) {
            fields = new List<String>();
            Map<String, Schema.SObjectField> fieldMap = Schema.SObjectType.User_Display_Settings__c.fields.getMap();
            for (String fieldName : fieldMap.keySet()) {
                fields.add(fieldName);
            }
        }
    
        // Make List a Field comma-separated String 
        String fieldList = String.join(fields, ', ');
    
        // Construct query
        String soql = 'SELECT ' + fieldList + ' FROM User_Display_Settings__c WHERE User__c = :userId';
    
        // Query the fields dynamically
        List<User_Display_Settings__c> results = Database.query(soql);
    

        if (results.isEmpty()) {
            return null;
        }
    
        return results[0];
    }
    // ========================================================================= \\


}
