public with sharing class DynamicSObjectController {

    // Get a Field's picklist values from any Object
    @AuraEnabled(cacheable=true)
    public static List<String> getSObjectPicklistValues(String objectName, String fieldName) {
        List<String> picklistValues = new List<String>();
        try {
            Schema.SObjectType sObjectType = Schema.getGlobalDescribe().get(objectName);
            Schema.DescribeFieldResult fieldResult = sObjectType.getDescribe().fields.getMap().get(fieldName).getDescribe();
            List<Schema.PicklistEntry> picklistEntries = fieldResult.getPicklistValues();

            for (Schema.PicklistEntry entry : picklistEntries) {
                picklistValues.add(entry.getLabel());
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving picklist values: ' + e.getMessage());
        }
        System.debug(picklistValues);
        return picklistValues;
    }

    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getSObjectPicklistValuesConvertType(String objectName, String fieldName) {
        Map<String, Object> result = new Map<String, Object>();
        List<Map<String, Object>> picklistValues = new List<Map<String, Object>>();
        Map<String, Object> convertedPicklistValue = null;

        try {
            // Describe the object and field
            Schema.SObjectType sObjectType = Schema.getGlobalDescribe().get(objectName);
            Schema.DescribeFieldResult fieldResult = sObjectType.getDescribe().fields.getMap().get(fieldName).getDescribe();
            List<Schema.PicklistEntry> picklistEntries = fieldResult.getPicklistValues();

            // Iterate over picklist entries
            for (Schema.PicklistEntry entry : picklistEntries) {
                Map<String, Object> picklistEntry = new Map<String, Object>();
                picklistEntry.put('label', entry.getLabel());
                picklistEntry.put('value', entry.getValue());
                picklistEntry.put('isDefaultValue', entry.isDefaultValue());
                picklistEntry.put('isActive', entry.isActive());

                // Check if the picklist value is used for conversion based on label (e.g., 'Converted')
                if (entry.getLabel().toLowerCase().contains('qualified') || entry.getLabel().toLowerCase().contains('converted')) {
                    convertedPicklistValue = picklistEntry;
                }

                picklistValues.add(picklistEntry);
            }

            // Populate result map
            result.put('picklistValues', picklistValues);
            result.put('convertedPicklistValue', convertedPicklistValue != null ? convertedPicklistValue : null);

        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving picklist values: ' + e.getMessage());
        }

        return result;
    }


    // Get entity prefix codes by Object API Name
    @AuraEnabled(cacheable=true)
    public static Map<String, String> getEntityPrefix(List<String> objectApiNames) {
        try {
            Map<String, String> prefixMap = new Map<String, String>();

            // Get the global describe map of all objects
            Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe();

            for (String objectApiName : objectApiNames) {
                // Check if the object exists in the global describe map
                if (globalDescribe.containsKey(objectApiName)) {
                    Schema.DescribeSObjectResult describeResult = globalDescribe.get(objectApiName).getDescribe();
                    String entityPrefix = describeResult.getKeyPrefix();
                    System.debug('Entity Prefix for ' + objectApiName + ': ' + entityPrefix);
                    if (!String.isBlank(entityPrefix)) {
                        prefixMap.put(objectApiName, entityPrefix);
                    }
                } else {
                    System.debug('Object not found: ' + objectApiName);
                }
            }

            return prefixMap;

        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving entity prefixes: ' + e.getMessage());
        }
    }

    // Get entity prefix codes by Object API Name
    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getAllEntityPrefixes() {
        try {
            List<Map<String, String>> resultList = new List<Map<String, String>>();

            Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe();

            for (String objectApiName : globalDescribe.keySet()) {
                Schema.DescribeSObjectResult describeResult = globalDescribe.get(objectApiName).getDescribe();
                String prefix = describeResult.getKeyPrefix();

                if (!String.isBlank(prefix)) {
                    resultList.add(new Map<String, String>{
                        'entityPrefix' => prefix,
                        'objectApiName' => objectApiName
                    });
                }
            }

            return resultList;

        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving all entity prefixes: ' + e.getMessage());
        }
    }

    // Get Entity prefix by record Id
    @AuraEnabled(cacheable=true)
    public static Map<String, String> resolveEntityPrefixes(List<Id> recordIds) {
        Map<String, String> result = new Map<String, String>();
        if (recordIds == null || recordIds.isEmpty()) {
            return result;
        }

        // Collect unique prefixes
        Set<String> prefixes = new Set<String>();
        for (Id rid : recordIds) {
            if (rid != null) {
                prefixes.add(String.valueOf(rid).substring(0, 3));
            }
        }

        // Build prefix → object map from global describe
        Map<String, Schema.SObjectType> globalMap = Schema.getGlobalDescribe();
        for (Schema.SObjectType sObjType : globalMap.values()) {
            Schema.DescribeSObjectResult d = sObjType.getDescribe();
            String keyPrefix = d.getKeyPrefix();
            if (keyPrefix != null && prefixes.contains(keyPrefix)) {
                result.put(keyPrefix, d.getName());
            }
        }

        return result;
    }



    @AuraEnabled(cacheable=true)
    public static String getRecordName(String objectApiName, String recordId) {
        try {
            // Construct dynamic SOQL
            String query = 'SELECT Name FROM ' + String.escapeSingleQuotes(objectApiName) + ' WHERE Id = :recordId LIMIT 1';
            
            // Execute the query and retrieve the record
            SObject record = Database.query(query);
            System.debug('here is record: ' + record);
            return (String)record.get('Name'); // Return the Name field
        } catch (Exception ex) {
            // Handle any errors (e.g., invalid object name, record not found)
            System.debug('Error in getRecordName: ' + ex.getMessage());
            throw new AuraHandledException('Error fetching record name: ' + ex.getMessage());
        }
    }

    // Save Records
    @AuraEnabled
    public static void saveRecords(List<SObject> records) {
        try {
            upsert records;
        } catch (Exception e) {
            throw new AuraHandledException('Error saving records: ' + e.getMessage());
        }
    }

    // Delete Records By Id
    @AuraEnabled
    public static String deleteRecordsById(List<Id> recordIds, String objectApiName) {
        Map<String, Object> result = new Map<String, Object>();

        if (recordIds == null || recordIds.isEmpty()) {
            result.put('success', false);
            result.put('errorMessage', 'No record IDs were provided for deletion.');
            return JSON.serialize(result);
        }

        if (String.isBlank(objectApiName)) {
            result.put('success', false);
            result.put('errorMessage', 'No object API name was provided.');
            return JSON.serialize(result);
        }

        try {
            // Use Dynamic SOQL to query and delete the records
            String query = 'SELECT Id FROM ' + objectApiName + ' WHERE Id IN :recordIds';
            List<SObject> recordsToDelete = Database.query(query);

            if (!recordsToDelete.isEmpty()) {
                delete recordsToDelete;
            }

            result.put('success', true);
        } catch (Exception e) {
            result.put('success', false);
            result.put('errorMessage', 'Error during deletion: ' + e.getMessage());
        }

        return JSON.serialize(result);
    }

    // Get record types for a given object
    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getRecordTypeInfosDynamic(String objectName) {
        List<Map<String, String>> recordTypeList = new List<Map<String, String>>();

        try {
            // Query record types for the specified object
            List<RecordType> recordTypes = [
                SELECT Id, Name FROM RecordType WHERE SObjectType = :objectName
            ];

            // Convert each RecordType to a Map<String, String>
            for (RecordType rt : recordTypes) {
                Map<String, String> recordTypeInfo = new Map<String, String>();
                recordTypeInfo.put('Id', String.valueOf(rt.Id)); // Convert Id to String
                recordTypeInfo.put('Name', rt.Name);
                recordTypeList.add(recordTypeInfo);
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching record types: ' + e.getMessage());
        }
        System.debug('here is the recordTypeList: ' + recordTypeList);
        return recordTypeList;
    }


    // Get Records related to a record Id  --->  $recordId: recordId of the Parent, $lookupField: child field that relates it to parent
    // E.g.) {recordId: NSN_Finished_Part.Id, lookupFieldByObjectApiName: 'Parts_and_Services__c.NSN_Finished_Part__c'}
    @AuraEnabled(cacheable=true)
    public static List<SObject> getRelatedRecords(
        List<Id> recordIds, 
        Map<String, String> lookupFieldByObjectApiName, 
        Map<String, List<String>> fieldsByObjectApiName 
    ){
        try {
            // Initialize Return List
            List<SObject> allResults = new List<SObject>();

            // Return null $recordId or $lookupFieldByObjectApiName is empty
            if (recordIds.isEmpty() || lookupFieldByObjectApiName.isEmpty()) {
                return null;
            }

            Set<Id> recordIdsSet = new Set<Id>(recordIds);

            // Populate $fieldsByObjectApiName with Id & Name if empty
            if (fieldsByObjectApiName.isEmpty()) {
                // Re-define <fieldsByObjectApiName>
                fieldsByObjectApiName = new Map<String, List<String>>();

                // Add Id & Name as the fields to query
                for (String objectApiName :  lookupFieldByObjectApiName.keySet()) {
                    fieldsByObjectApiName.put(objectApiName, new List<String>{'Id', 'Name'});
                }
            }

            // Make the query for each objectApiName
            for (String objectApiName : lookupFieldByObjectApiName.keySet()) {

                List<String> fields = fieldsByObjectApiName.get(objectApiName);              // Get the fields to query
                String relationField = lookupFieldByObjectApiName.get(objectApiName);   // Get the lookupField

                // Build field string
                String fieldString = String.join(fields, ', ');
                // Build SOQL query
                String soql = 'SELECT ' + fieldString + ' FROM ' + objectApiName +
                          ' WHERE ' + relationField + ' IN :recordIdsSet';
                
                // Query dynamically
                List<SObject> results = Database.query(soql);
                // Add all results
                allResults.addAll(results);
            }
            
            return allResults;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }




    // Get field values by ObjectName/RecordId
    @AuraEnabled
    public static List<SObject> fetchFieldValuesDynamicByRecordId(String objectName, List<String> recordIds, List<String> fieldApiNames) {
        // Validate input arguments
        if (String.isBlank(objectName)) {
            throw new AuraHandledException('The object name cannot be null or empty.');
        }
        if (recordIds == null || recordIds.isEmpty()) {
            throw new AuraHandledException('The list of record IDs cannot be null or empty.');
        }
        if (fieldApiNames == null || fieldApiNames.isEmpty()) {
            throw new AuraHandledException('The list of field API names cannot be null or empty.');
        }
        
        try {
            // Validate object name to prevent SOQL injection
            if (!isObjectNameValid(objectName)) {
                throw new AuraHandledException('Invalid object name provided.');
            }

            // Split relationship fields and ensure proper syntax
            List<String> validatedFields = new List<String>();
            for (String field : fieldApiNames) {
                if (field.contains('.')) {
                    // Validate relationship fields (e.g., What.Name)
                    String[] relationshipParts = field.split('\\.');
                    if (relationshipParts.size() != 2) {
                        throw new AuraHandledException('Invalid relationship field: ' + field);
                    }
                    validatedFields.add(relationshipParts[0] + '.' + relationshipParts[1]);
                } else {
                    // Add regular fields as is
                    validatedFields.add(field);
                }
            }

            // Construct the dynamic SOQL query
            String query = 'SELECT ' + String.join(validatedFields, ',') + ' FROM ' + objectName + ' WHERE Id IN :recordIds';

            // Execute the query
            List<SObject> result = Database.query(query);
            System.debug(result);

            return result;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching data: ' + e.getMessage());
        }
    }

    // Get field values by ObjectName/RecordId
    @AuraEnabled(cacheable=true)
    public static List<SObject> fetchFieldValuesDynamicByRecordIdCached(String objectName, List<String> recordIds, List<String> fieldApiNames) {
        // Validate input arguments
        if (String.isBlank(objectName)) {
            throw new AuraHandledException('The object name cannot be null or empty.');
        }
        if (recordIds == null || recordIds.isEmpty()) {
            throw new AuraHandledException('The list of record IDs cannot be null or empty.');
        }
        if (fieldApiNames == null || fieldApiNames.isEmpty()) {
            throw new AuraHandledException('The list of field API names cannot be null or empty.');
        }
        
        try {
            // Validate object name to prevent SOQL injection
            if (!isObjectNameValid(objectName)) {
                throw new AuraHandledException('Invalid object name provided.');
            }

            // Split relationship fields and ensure proper syntax
            List<String> validatedFields = new List<String>();
            for (String field : fieldApiNames) {
                if (field.contains('.')) {
                    // Validate relationship fields (e.g., What.Name)
                    String[] relationshipParts = field.split('\\.');
                    if (relationshipParts.size() != 2) {
                        throw new AuraHandledException('Invalid relationship field: ' + field);
                    }
                    validatedFields.add(relationshipParts[0] + '.' + relationshipParts[1]);
                } else {
                    // Add regular fields as is
                    validatedFields.add(field);
                }
            }

            // Construct the dynamic SOQL query
            String query = 'SELECT ' + String.join(validatedFields, ',') + ' FROM ' + objectName + ' WHERE Id IN :recordIds';

            // Execute the query
            List<SObject> result = Database.query(query);
            System.debug(result);

            return result;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching data: ' + e.getMessage());
        }
    }


    @AuraEnabled(cacheable=true)
    public static List<SObject> getRelatedRecordsById(
        String objectApiName, 
        String relationalField, 
        List<String> recordIds, 
        List<String> relatedFields
    ){
        try {
            // 1) Always include "Id" in the SELECT list.
            String fields = 'Id';
            
            // 2) If additional fields are provided, append them in CSV format.
            if (relatedFields != null && !relatedFields.isEmpty()) {
                fields += ', ' + String.join(relatedFields, ', ');
            }
            
            // 3) Build a comma-separated list of escaped IDs for the IN clause.
            //    e.g. 'WHERE relationalField IN (\'001xx000003DGcFAAW\', \'001xx000003DGcGAAW\')'
            List<String> escapedIds = new List<String>();
            if (recordIds != null && !recordIds.isEmpty()) {
                for (String rid : recordIds) {
                    escapedIds.add('\'' + String.escapeSingleQuotes(rid) + '\'');
                }
            } else {
                // If recordIds is null or empty, return an empty list or handle as needed.
                return new List<SObject>();
            }
            String joinedIds = String.join(escapedIds, ', ');
            
            // 4) Construct the dynamic SOQL.
            //    Escape the objectApiName and relationalField to avoid injection if they come from user input.
            String soql = 
                'SELECT ' + fields +
                ' FROM ' + String.escapeSingleQuotes(objectApiName) +
                ' WHERE ' + String.escapeSingleQuotes(relationalField) +
                ' IN (' + joinedIds + ')';

            // 5) Execute the dynamic query.
            return Database.query(soql);

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    // Get field values by any condition
    @AuraEnabled
    public static List<SObject> fetchRecordsDynamicWithCondition(String objectName, List<String> fieldApiNames, String conditions) {
        // Validate input arguments
        if (fieldApiNames == null || fieldApiNames.isEmpty()) {
            throw new AuraHandledException('The list of field API names cannot be null or empty.');
        }

        try {
            // Base query
            String query = 'SELECT ' + String.join(fieldApiNames, ',') + ' FROM ' + objectName + ' ';

            // Append additional conditions if provided
            if (conditions != null && !String.isBlank(conditions)) {
                query += ' WHERE ' + conditions;
            }

            // Execute the query
            List<SObject> result = Database.query(query);
            System.debug(result);

            return result;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching ' + objectName + ' data: ' + e.getMessage());
        }
    }




    /*Fields (multi-SObj) by condition.  
        <queries> parameter: Array of Objects. 
            Keys:
                'objectApiName', ''fieldApiNames', 'conditions', 'mapKey'
            Example: 
                [
                    {
                        "objectApiName":"Contact",
                        "fieldApiNames":["FirstName","LastName"],
                        "conditions":"Name LIKE '%Acme%'", "mapKey":"Contacts"
                    }, 
                ]
    */
    @AuraEnabled
    public static Map<String, List<SObject>> fetchRecordsMultiObjectsWithCondition(List<Map<String, Object>> queries) {
        if (queries == null || queries.isEmpty()) {
            throw new AuraHandledException('The query input list cannot be null or empty.');
        }

        Map<String, List<SObject>> resultMap = new Map<String, List<SObject>>();

        try {
            for (Map<String, Object> queryMap : queries) {
                String objectApiName = (String) queryMap.get('objectApiName');
                // Handle fieldApiNames as a List<Object> and cast to List<String>
                List<Object> rawFieldApiNames = (List<Object>) queryMap.get('fieldApiNames');
                String mapKey = (String) queryMap.get('mapKey');

                List<String> fieldApiNames = new List<String>();
                for (Object fieldName : rawFieldApiNames) {
                    fieldApiNames.add((String) fieldName);
                }

                String conditions = (String) queryMap.get('conditions');

                System.debug('Processing: ' + objectApiName);
                System.debug('Fields: ' + fieldApiNames);
                System.debug('Conditions: ' + conditions);

                if (String.isBlank(objectApiName)) {
                    throw new AuraHandledException('The object API name cannot be null or empty.');
                }
                if (fieldApiNames.isEmpty()) {
                    throw new AuraHandledException('The field API names cannot be null or empty for ' + objectApiName);
                }

                // Build the dynamic query
                String query = 'SELECT ' + String.join(fieldApiNames, ',') + ' FROM ' + objectApiName;
                if (!String.isBlank(conditions)) {
                    query += ' WHERE ' + conditions;
                }

                System.debug('SOQL Query: ' + query);

                List<SObject> queryResults = Database.query(query);
                resultMap.put(mapKey, queryResults);
            }

            return resultMap;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching records: ' + e.getMessage());
        }
    }
    @AuraEnabled
    public static Map<String, List<SObject>> fetchRecordsMultiObjectsWithConditionAndChildren(List<Map<String, Object>> queries) {

        if (queries == null || queries.isEmpty()) {
            return null;
        }

        Map<String, List<SObject>> resultMap = new Map<String, List<SObject>>();

        try {

            for (Map<String, Object> queryMap : queries) {
                String objectApiName = (String) queryMap.get('objectApiName');
                List<Object> rawFieldApiNames = (List<Object>) queryMap.get('fieldApiNames');
                List<String> fieldApiNames = new List<String>();
                for (Object fieldName : rawFieldApiNames) {
                    fieldApiNames.add((String) fieldName);
                }
                String conditions = (String) queryMap.get('conditions');
                String mapKey = (String) queryMap.get('mapKey');

                // Check for child relationships
                List<Map<String, Object>> childRelationships = (List<Map<String, Object>>) queryMap.get('childRelationships');
                List<String> childQueries = new List<String>();

                if (childRelationships != null) {
                    for (Map<String, Object> child : childRelationships) {
                        String childObject = (String) child.get('childObject');
                        List<Object> rawChildFields = (List<Object>) child.get('fields');
                        List<String> childFields = new List<String>();
                        for (Object fieldName : rawChildFields) {
                            childFields.add((String) fieldName);
                        }
                        if (!childFields.isEmpty()) {
                            childQueries.add('(SELECT ' + String.join(childFields, ', ') + ' FROM ' + childObject + ')');
                        }
                    }
                }

                // Build the dynamic query including child subqueries
                String query = 'SELECT ' + String.join(fieldApiNames, ', ') + 
                            (childQueries.isEmpty() ? '' : ', ' + String.join(childQueries, ', ')) + 
                            ' FROM ' + objectApiName;
                if (!String.isBlank(conditions)) {
                    query += ' WHERE ' + conditions;
                }

                System.debug('SOQL Query: ' + query);

                List<SObject> queryResults = Database.query(query);
                resultMap.put(mapKey, queryResults);
            }

            return resultMap;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching records: ' + e.getMessage());
        }
    }


    @AuraEnabled(cacheable=true)
    public static List<String> getRequiredFields(String objectApiName) {
        List<String> requiredFields = new List<String>();
        Boolean isCutomObject = objectApiName.endsWith('__c');
        
        // Get the global describe map
        Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe();
        if (!globalDescribe.containsKey(objectApiName)) {
            return requiredFields; // object not found
        }
        
        // Get the SObject type and describe result
        Schema.SObjectType sObjType = globalDescribe.get(objectApiName);
        Schema.DescribeSObjectResult describeResult = sObjType.getDescribe();
        Map<String, Schema.SObjectField> fieldMap = describeResult.fields.getMap();
        
        // Iterate through fields and add required ones
        for(String fieldName : fieldMap.keySet()){
            Schema.DescribeFieldResult fieldDesc = fieldMap.get(fieldName).getDescribe();
            // Consider a field required if it's not nillable and createable.
            // Exclude auto-number fields.
            if (isCutomObject) {
                if (fieldDesc.isCreateable() && !fieldDesc.isAutoNumber() && !fieldDesc.isCalculated()) {
                    requiredFields.add(fieldName);
                }
            } else {
                if (!fieldDesc.isNillable() && fieldDesc.isCreateable() && !fieldDesc.isAutoNumber()) {
                    requiredFields.add(fieldName);
                }
            }
        }
        return requiredFields;
    }





    // Fetch records based on a condition  -->  As well as the specified children records/fields
    @AuraEnabled
    public static Map<String, List<SObject>> fetchParentsConditionallyAndChildrenDynamic(
        String conditions,
        String objectName,
        List<String> fieldApiNames,
        Boolean isFetchChildren,
        String childObjectName,
        List<String> childFieldApiNames,
        String parentFieldApiName
    ) {
        try {
            // Prepare the result map
            Map<String, List<SObject>> result = new Map<String, List<SObject>>();
            result.put('parents', new List<SObject>());
            result.put('children', new List<SObject>());

            // Step 1: Fetch parent records
            String parentQuery = 'SELECT ' + String.join(fieldApiNames, ',') + ' FROM ' + objectName;
            if (!String.isBlank(conditions)) {
                parentQuery += ' WHERE ' + conditions;
            }

            List<SObject> parentRecords = Database.query(parentQuery);
            result.put('parents', parentRecords);

            // Step 2: Fetch child records if specified
            if (isFetchChildren && !String.isBlank(childObjectName)) {
                if (!childFieldApiNames.contains(parentFieldApiName)) {
                    childFieldApiNames.add(parentFieldApiName);
                }

                // Get parent IDs for child query
                Set<Id> parentIds = new Set<Id>();
                for (SObject parentRecord : parentRecords) {
                    parentIds.add((Id)parentRecord.get('Id'));
                }

                if (!parentIds.isEmpty()) {
                    String childQuery = 'SELECT ' + String.join(childFieldApiNames, ',') +
                                        ' FROM ' + childObjectName +
                                        ' WHERE ' + parentFieldApiName + ' IN :parentIds';

                    List<SObject> childRecords = Database.query(childQuery);
                    result.put('children', childRecords);
                }
            }

            return result;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching records: ' + e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true)
    public static Map<String, List<SObject>> fetchParentsConditionallyAndChildrenDynamicCacheable(
        String conditions,
        String objectName,
        List<String> fieldApiNames,
        Boolean isFetchChildren,
        String childObjectName,
        List<String> childFieldApiNames,
        String parentFieldApiName
    ) {
        try {
            // Prepare the result map
            Map<String, List<SObject>> result = new Map<String, List<SObject>>();
            result.put('parents', new List<SObject>());
            result.put('children', new List<SObject>());

            // Step 1: Fetch parent records
            String parentQuery = 'SELECT ' + String.join(fieldApiNames, ',') + ' FROM ' + objectName;

            if (!String.isBlank(conditions)) {
                parentQuery += ' WHERE ' + conditions;
            }

            System.debug('PARENT QUERY: ' + parentQuery);

            List<SObject> parentRecords = Database.query(parentQuery);
            result.put('parents', parentRecords);

            // Step 2: Fetch child records if specified
            if (isFetchChildren && !String.isBlank(childObjectName)) {
                if (!childFieldApiNames.contains(parentFieldApiName)) {
                    childFieldApiNames.add(parentFieldApiName);
                }

                // Get parent IDs for child query
                Set<Id> parentIds = new Set<Id>();
                for (SObject parentRecord : parentRecords) {
                    parentIds.add((Id)parentRecord.get('Id'));
                }

                if (!parentIds.isEmpty()) {
                    String childQuery = 'SELECT ' + String.join(childFieldApiNames, ',') +
                                        ' FROM ' + childObjectName +
                                        ' WHERE ' + parentFieldApiName + ' IN :parentIds';

                    List<SObject> childRecords = Database.query(childQuery);
                    result.put('children', childRecords);
                }
            }

            return result;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching records: ' + e.getMessage());
        }
    }



    // ========================================================================= \\
    // =========================== CONVERTED RECORDS =========================== \\
    public class SObjectWrapper {
        @AuraEnabled public SObject record { get; set; }
        @AuraEnabled public List<Task> tasks { get; set; }
        
        public SObjectWrapper(SObject r, List<Task> t) {
            this.record = r;
            this.tasks = t;
        }
    }
    // Get Ids in a Set from list of records
    private static Set<Id> recordListToIdsSet(List<SObject> records, String fieldName) {
        // return null if empty
        if (records.isEmpty()) {
            return null;
        }

        // Use 'Id' as default if fieldName is null
        if (String.isBlank(fieldName)) {
            fieldName = 'Id';
        }
    
        Set<Id> recIds = new Set<Id>();
        for (SObject record : records) {
            recIds.add((Id)record.get(fieldName));
        }

        // return null if empty
        if (recIds.isEmpty()) {
            return null;
        }
    
        return recIds;
    }
    // Map the Tasks to the parent Converted Record and store in SobjectWrapper
    private static List<SObjectWrapper> mapTasksToParent(List<SObject> parents, List<Task> tasks) {
        List<SObjectWrapper> resultList = new List<SObjectWrapper>();
    
        Boolean hasTasks = (tasks != null && !tasks.isEmpty());
    
        for (SObject sObj : parents) {
            List<Task> relatedTasks = new List<Task>();
    
            if (hasTasks) {
                for (Task task : tasks) {
                    if (
                        task.WhatId == sObj.Id ||
                        task.WhoId == sObj.Id ||
                        (sObj.getSObjectType() == Lead.SObjectType &&
                         sObj.get('ConvertedContactId') != null &&
                         task.WhoId == (Id)sObj.get('ConvertedContactId'))
                    ) {
                        relatedTasks.add(task);
                    }
                }
            }
    
            resultList.add(new SObjectWrapper(sObj, relatedTasks));
        }
    
        System.debug('resultList before returning:  ' + resultList);
        return resultList;
    }
    
    /*
    // Get Completed Tasks for converted records for Opportunity/Contract Award 
    @AuraEnabled
    public static List<SObjectWrapper>  conversionHistoryFetcherV2(String objectApiName, List<Id> recordIds) {
        try {
            Set<Id> recordIdsSet = new Set<Id>(recordIds);                                // <-recordIds-> parameter as Set

            List<SObjectWrapper> resultList = new List<SObjectWrapper>();               // Results List Wrapper
            List<SObject> parentsResultList = new List<SObject>();                     // Parent Records List
            List<Task> taskResultsList = new List<Task>();                            // Task Results List

            List<Opportunity> opps = new List<Opportunity>();                       // Opportunitity
            List<Lead> leads = new List<Lead>();                                   // Lead
            //List<Contract_Award__c> contracts = new List<Contract_Award__c>();    // Contract_Award__c 


            Set<Id> contractIdsSet = new Set<Id>();                            // Store Contract_Award__c Ids
            Set<Id> oppIdsSet = new Set<Id>();                                // Store Opportunity Ids
            Set<Id> leadIdsSet = new Set<Id>();                              // Store Lead Ids
            Set<Id> convertedContactIdsSet = new Set<Id>();                 // Store Converted Contact 
            Set<Id> taskIdsSet = new Set<Id>();                            // Store Task Ids


            // Handle 'Contract_Award__c' <-objectApiName-> Paramater
            if (objectApiName == 'Contract_Award__c') {

                // Query Contract Award
                contracts = [SELECT Id, Name, Stage__c FROM Contract_Award__c WHERE Id IN :recordIdsSet AND Stage__c = 'Contract Closeout'];
                contractIdsSet = recordListToIdsSet(contracts, 'Id');                                   // Set of Contract_Award__c Ids


                // Query Opportunities
                opps = [SELECT Id, Name, ConvertedContractAwardId__c, isClosed FROM Opportunity WHERE ConvertedContractAwardId__c IN :recordIdsSet];
                oppIdsSet = recordListToIdsSet(opps, 'Id');                                         // Set of opportunity Ids

                // Query Leads
                leads = [SELECT Id, ConvertedContactId, ConvertedOpportunityId, Name, OwnerId, Owner.Name, isDeleted, isClosed__c FROM Lead WHERE ConvertedOpportunityId IN :oppIdsSet];
                leadIdsSet = recordListToIdsSet(leads, 'Id');                                    // Set of Lead Ids
                convertedContactIdsSet = recordListToIdsSet(leads, 'ConvertedContactId');       // Set of Converted Contact Ids from Lead conversion
            }

            // Handle 'Opportunity' <-objectApiName-> Paramater
            if (objectApiName == 'Opportunity') {
                // Query Opportunities
                opps = [SELECT Id, Name, ConvertedContractAwardId__c, isClosed FROM Opportunity WHERE Id IN :recordIdsSet AND isClosed = true];
                oppIdsSet = recordListToIdsSet(opps, 'Id');                                         // Set of opportunity Ids

                if (oppIdsSet != null && !oppIdsSet.isEmpty()) {
                    // Get the Contract Award Record Ids
                    contractIdsSet = recordListToIdsSet(opps, 'ConvertedContractAwardId__c');
                    // Query Contract Award
                    contracts = [SELECT Id, Name, Stage__c FROM Contract_Award__c WHERE Id IN :contractIdsSet];
                    contractIdsSet = recordListToIdsSet(contracts, 'Id');                                   // Set of Contract_Award__c Ids
                }

                // Query Lead with 'ConvertedOpportunityId'
                leads = [SELECT Id, ConvertedContactId, ConvertedOpportunityId, Name, OwnerId, Owner.Name, isDeleted, isClosed__c FROM Lead WHERE ConvertedOpportunityId IN :recordIdsSet];
                leadIdsSet = recordListToIdsSet(leads, 'Id');                                    // Set of Lead Ids
                convertedContactIdsSet = recordListToIdsSet(leads, 'ConvertedContactId');       // Set of Converted Contact Ids from Lead conversion
            } 



            // Lead Tasks Query
            if (leadIdsSet != null &&  !leadIdsSet.isEmpty()) {
                // Query Lead Tasks
                List<Task> leadTasks = [
                    SELECT Id, Subject, Description, WhoId, WhatId, OwnerId, Owner.Name, Status 
                    FROM Task 
                    WHERE (WhoId IN :leadIdsSet OR WhoId IN :convertedContactIdsSet)
                    AND Status = 'Completed'
                ];
                Set<Id> taskIds = recordListToIdsSet(leadTasks, 'Id');
                if (taskIds != null && !taskIds.isEmpty()) {
                    taskIdsSet.addAll(taskIds);
                }
                // Map Tasks to Lead in <SObjectWrapper>
                List<SObjectWrapper> leadRes = mapTasksToParent(leads, leadTasks);
                // Add SObjectWrapper Result to <-resultList->
                resultList.addAll(leadRes);
            }
            
            // Opportunity Tasks Query
            if (oppIdsSet != null && !oppIdsSet.isEmpty()) {
                // Query Opportunity Tasks
                List<Task> oppTasks = [
                    SELECT Id, Subject, Description, WhoId, WhatId, OwnerId, Owner.Name, Status 
                    FROM Task 
                    WHERE Id NOT IN :taskIdsSet
                    AND WhatId IN :oppIdsSet
                    AND Status = 'Completed'
                ];
                Set<Id> taskIds = recordListToIdsSet(oppTasks, 'Id');
                if (taskIds != null && !taskIds.isEmpty()) {
                    taskIdsSet.addAll(taskIds);
                }

                // Map Tasks to Opportunity in <SObjectWrapper>
                List<SObjectWrapper> oppRes = mapTasksToParent(opps, oppTasks);
                // Add SObjectWrapper Result to <-resultList->
                resultList.addAll(oppRes);
            }

            // Contract Award Tasks Query
            if (contractIdsSet != null && !contractIdsSet.isEmpty()) {
                // Query Opportunity Tasks
                List<Task> contractTasks = [
                    SELECT Id, Subject, Description, WhoId, WhatId, OwnerId, Owner.Name, Status 
                    FROM Task 
                    WHERE Id NOT IN :taskIdsSet
                    AND WhatId IN :contractIdsSet
                    AND Status = 'Completed'
                ];

                // Map Tasks to Opportunity in <SObjectWrapper>
                List<SObjectWrapper> contractRes = mapTasksToParent(contracts, contractTasks);
                // Add SObjectWrapper Result to <-resultList->
                resultList.addAll(contractRes);
            }

            return resultList;
            
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching records in DynamicSObjectController.conversionHistoryFetcher(): ' + e.getMessage());
        }
    }
    */

    /*
    @AuraEnabled(cacheable=true)
    public static List<SObject> convertedRecordFetcher(
        String objectApiName,
        List<Id> recordIds,
        String convertedObjectApiName,
        List<String> convertedFields
    ) {
        try {
            if (String.isBlank(objectApiName) || String.isBlank(convertedObjectApiName)) {
                throw new AuraHandledException('objectApiName and convertedObjectApiName are required.');
            }
            if (recordIds == null || recordIds.isEmpty()) {
                return new List<SObject>();
            }
            Set<Id> recordIdsSet = new Set<Id>(recordIds);

            // Always include Id; add requested fields
            Set<String> fieldSet = new Set<String>{ 'Id' };
            if (convertedFields != null) {
                for (String f : convertedFields) if (!String.isBlank(f)) fieldSet.add(f.trim());
            }
            String fieldString = String.join(new List<String>(fieldSet), ', ');

            // ---------- SPECIAL CASE: Contract_Award__c -> Lead (two hops via Opportunity) ----------
            if (objectApiName == 'Contract_Award__c' && convertedObjectApiName == 'Lead') {
                // 1) Find Opps created from these Contract Awards
                List<Opportunity> opps = [
                    SELECT Id
                    FROM Opportunity
                    WHERE ConvertedContractAwardId__c IN :recordIdsSet
                ];
                if (opps.isEmpty()) return new List<SObject>();

                Set<Id> oppIds = new Set<Id>();
                for (Opportunity o : opps) oppIds.add(o.Id);

                // 2) Get Leads converted into those Opps
                String leadSoql =
                    'SELECT ' + fieldString +
                    ' FROM Lead' +
                    ' WHERE IsConverted = TRUE' +
                    ' AND ConvertedOpportunityId IN :oppIds';

                return Database.query(leadSoql);
            }

            // ---------- DEFAULT: single-hop (target holds a field pointing to source) ----------
            String linkField = resolveLinkField(objectApiName, convertedObjectApiName);
            if (String.isBlank(linkField)) {
                throw new AuraHandledException(
                    'Unsupported mapping: ' + objectApiName + ' -> ' + convertedObjectApiName +
                    '. Add a case in resolveLinkField() or handle it explicitly.'
                );
            }

            String whereClause = linkField + ' IN :recordIdsSet';
            if (convertedObjectApiName == 'Lead' && linkField.startsWith('Converted')) {
                whereClause += ' AND IsConverted = TRUE';
            }

            String soql =
                'SELECT ' + fieldString +
                ' FROM ' + convertedObjectApiName +
                ' WHERE ' + whereClause;

            return Database.query(soql);

        } catch (Exception e) {
            throw new AuraHandledException('Error in convertedRecordFetcher: ' + e.getMessage());
        }
    }
    */

    /**
     * Map (sourceObject -> convertedObject) to the linking field that lives on the converted object.
     */
    private static String resolveLinkField(String sourceObj, String convertedObj) {
        // Standard Lead conversions
        if (convertedObj == 'Lead') {
            if (sourceObj == 'Opportunity') {
                return 'ConvertedOpportunityId';
            }
            if (sourceObj == 'Account')     {
                return 'ConvertedAccountId';
            }
            if (sourceObj == 'Contact')     {
                return 'ConvertedContactId';
            }
        }

        // Your custom mapping: Opp created from Contract_Award__c
        if (sourceObj == 'Contract_Award__c' && convertedObj == 'Opportunity') {
            return 'ConvertedContractAwardId__c'; // <-- adjust if your API name differs
        }

        // Add more mappings here as needed…

        return null;
    }
    // ========================================================================= \\
    // ========================================================================= \\



    // Get the Object Api Name from the record id
    @TestVisible
    @AuraEnabled
    public static Map<String, String> getObjectApiNameByRecordId(List<String> recordIds) {
        Map<String, String> recordToObjectMap = new Map<String, String>();

        if (recordIds != null && !recordIds.isEmpty()) {
            for (String recordId : recordIds) {
                try {
                    // Use the getSObjectType method to get the object type
                    SObjectType sObjectType = Id.valueOf(recordId).getSObjectType();
                    String objectApiName = sObjectType.getDescribe().getName();
                    recordToObjectMap.put(recordId, objectApiName);
                } catch (Exception e) {
                    recordToObjectMap.put(recordId, 'Invalid'); // Handle invalid record IDs
                }
            }
        }
        return recordToObjectMap;
    }


    
    /**
     * Returns a map of active Lead record type IDs to the list of picklist values
     * for the Status field. This sample returns the global picklist values for each record type.
     */
    @AuraEnabled(cacheable=true)
    public static void getLeadStatusPicklistValuesByRecordType() {
        Schema.DescribeFieldResult dfr = Opportunity.StageName.getDescribe();
        for (PicklistEntry pe : dfr.getPicklistValues()) {
            if (pe.isActive()) {
                System.debug(pe);
            }
        }

    }


    // Fetch records based on a condition  -->  As well as the specified children records/fields
    @AuraEnabled
    public static Map<String, List<SObject>> fetchMultiParentsConditionallyAndChildrenDynamicV2(
        Map<String, String> conditions, 
        String childConditions, 
        List<String> objectNames, // Parent objects
        Map<String, List<String>> fieldsPerObject, // Fields per parent
        Boolean isFetchChildren, // Fetch children flag
        String childObjectName, // Child object per parent
        Map<String, List<String>> childFieldApiNames, // Fields per child object
        List<String> parentFieldApiNames // Parent-Child relationship fields
    ) {
        try {
            // Prepare the result map
            Map<String, String> relationMap = new Map<String, String>();
            Map<String, List<SObject>> result = new Map<String, List<SObject>>();
            result.put('parents', new List<SObject>());
            result.put('children', new List<SObject>());

            Set<Id> allParentIds = new Set<Id>();


            // Step 1: Fetch Parent Records
            for (String objectName : objectNames) {
                if (!fieldsPerObject.containsKey(objectName)) {
                    throw new AuraHandledException('[ERROR] Missing field list for parent object: ' + objectName);
                }

                String condition = conditions.containsKey(objectName) ? conditions.get(objectName) : null;
                String conditionClause = (!String.isBlank(condition)) ? ' WHERE ' + condition : '';

                String parentQuery = 'SELECT ' + String.join(fieldsPerObject.get(objectName), ',') +
                                    ' FROM ' + objectName + conditionClause;

                // Run Parent Query
                List<SObject> parentRecords = Database.query(parentQuery);
                if (parentRecords == null) {
                    System.debug('No parent records found for ' + objectName);
                    continue;
                }

                result.get('parents').addAll(parentRecords);

                // Collect Parent IDs for Child Query
                for (SObject parentRecord : parentRecords) {
                    if (parentRecord != null && parentRecord.get('Id') != null) {
                        allParentIds.add((Id) parentRecord.get('Id'));
                    }
                }
            }

            System.debug('This is going to the children section now');
            // Step 2: Fetch Child Records
            if (isFetchChildren && !allParentIds.isEmpty()) {
                System.debug('isFetchChildren && !allParentIds.isEmpty');

                for (String relationField : parentFieldApiNames) {                    

                    System.debug('relationField: ' + relationField);

                    if (String.isBlank(childObjectName) || String.isBlank(relationField)) {
                        System.debug('Skipping child query for ' + relationField + ' (Missing child object or relationship field)');
                        continue;
                    }

                    List<String> childFields = childFieldApiNames.containsKey(relationField) 
                        ? childFieldApiNames.get(relationField) 
                        : new List<String>();

                    if (!childFields.contains(relationField)) {
                        childFields.add(relationField);
                    }

                    String childConditionClause = (!String.isBlank(childConditions)) ? ' AND ' + childConditions : '';
                    System.debug('childConditionClause: ');
                    System.debug(childConditionClause);

                    String childQuery = 'SELECT ' + String.join(childFields, ',') +
                                        ' FROM ' + childObjectName +
                                        ' WHERE ' + relationField + ' IN :allParentIds' +
                                        childConditionClause;

                    System.debug('Child Query [' + relationField + ']: ' + childQuery);

                    List<SObject> childRecords = Database.query(childQuery);
                    if (childRecords == null) {
                        System.debug('No child records found for ' + relationField);
                        continue;
                    }

                    result.get('children').addAll(childRecords);
                }
            }

            return result;
        } catch (Exception e) {
            System.debug('ERROR: ' + e.getMessage());
            throw new AuraHandledException('Error fetching records: ' + e.getMessage());
        }
    }






    // ==================================================================================================================================== \\
    // ================================================= OBJECT/FIELD VALIDATION HELPERS ================================================== \\ 
    // Validates the object name to ensure it exists in the org.
    @TestVisible
    private static Boolean isObjectNameValid(String objectName) {
        Map<String, Schema.SObjectType> sobjectTypes = Schema.getGlobalDescribe();
        return sobjectTypes.containsKey(objectName);
    }
    // Validates that all field API names exist on the specified object.
    @TestVisible
    private static Boolean areFieldApiNamesValid(List<String> fieldApiNames, String objectName) {
        Map<String, Schema.SObjectField> fields = Schema.getGlobalDescribe()
            .get(objectName)
            .getDescribe()
            .fields.getMap();
        for (String fieldApiName : fieldApiNames) {
            if (!fields.containsKey(fieldApiName)) {
                return false;
            }
        }
        return true;
    }
    // ==================================================================================================================================== \\
    // ==================================================================================================================================== \\




    // ================================================ Get All Objects in Lookup Fields ================================================== \\ 
    // Get Object API Names of all lookup fields for an Object (excluding system-managed lookup fields)
    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getLookupFields(String objectApiName) {
        // Get the describe result for the given object
        Schema.SObjectType sObjectType = Schema.getGlobalDescribe().get(objectApiName);
        if (sObjectType == null) {
            throw new IllegalArgumentException('Invalid object API name: ' + objectApiName);
        }
    
        Schema.DescribeSObjectResult objectDescribe = sObjectType.getDescribe();
        Map<String, Schema.SObjectField> fieldsMap = objectDescribe.fields.getMap();
        List<Map<String, String>> lookupFields = new List<Map<String, String>>();
    
        // Fields to exclude from the lookup list (converted to lowercase)
        Set<String> excludedFields = new Set<String>{
            'OwnerId', 'CreatedById', 'LastModifiedById', 'RecordTypeId', 'recurrenceactivityid'
        };
        Set<String> excludedFieldsLowerCase = new Set<String>();
        for (String field : excludedFields) {
            excludedFieldsLowerCase.add(field.toLowerCase());
        }
    
        for (String fieldName : fieldsMap.keySet()) {
            Schema.DescribeFieldResult fieldDescribe = fieldsMap.get(fieldName).getDescribe();
    
            // Check if the field is a lookup, not polymorphic, and not in the excluded list (case-insensitive)
            if (fieldDescribe.getType() == Schema.DisplayType.REFERENCE &&
                fieldDescribe.getReferenceTo().size() == 1 && // Ensure it's not polymorphic
                !excludedFieldsLowerCase.contains(fieldName.toLowerCase())) {
                // Add field details to the result list
                Map<String, String> fieldInfo = new Map<String, String>();
                fieldInfo.put('objectApiName', fieldName);
                fieldInfo.put('objectLabel', fieldDescribe.getLabel());
                lookupFields.add(fieldInfo);
            }
        }
        return lookupFields;
    }

    // Get all object api names listed in a polymorphic field
    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getPolymorphicFieldObjects(String objectApiName, String fieldApiName) {
        // Get the describe result for the given object
        Schema.SObjectType sObjectType = Schema.getGlobalDescribe().get(objectApiName);
        if (sObjectType == null) {
            throw new IllegalArgumentException('Invalid object API name: ' + objectApiName);
        }
    
        Schema.DescribeSObjectResult objectDescribe = sObjectType.getDescribe();
        Map<String, Schema.SObjectField> fieldsMap = objectDescribe.fields.getMap();
    
        // Check if the field exists
        if (!fieldsMap.containsKey(fieldApiName)) {
            throw new IllegalArgumentException('Field does not exist on object: ' + fieldApiName);
        }
    
        Schema.DescribeFieldResult fieldDescribe = fieldsMap.get(fieldApiName).getDescribe();
    
        // Check if the field is a reference and polymorphic
        if (fieldDescribe.getType() != Schema.DisplayType.REFERENCE || fieldDescribe.getReferenceTo().size() <= 1) {
            throw new IllegalArgumentException('Field is not a polymorphic field: ' + fieldApiName);
        }
    
        // Extract the API names, labels, and icons of each referenced object
        List<Map<String, String>> referencedObjects = new List<Map<String, String>>();
    
        // Get the base URL dynamically from the request object
        String baseUrl = URL.getOrgDomainUrl().toExternalForm();
    
        for (Schema.SObjectType refType : fieldDescribe.getReferenceTo()) {
            Schema.DescribeSObjectResult refTypeDescribe = refType.getDescribe();
            Map<String, String> objectInfo = new Map<String, String>();
            objectInfo.put('objectApiName', refTypeDescribe.getName());
            objectInfo.put('objectLabel', refTypeDescribe.getLabel());
    
            // Add the icon URL (Standard Object and Custom Object icons)
            objectInfo.put(
                'objectIconUrl',
                baseUrl + '/img/icon/t4v35/standard/' + refTypeDescribe.getName().toLowerCase() + '_120.png'
            );
    
            referencedObjects.add(objectInfo);
        }
    
        return referencedObjects;
    }

    
    /*Fields (multi-SObj) by condition.  
        <queries> parameter: Array of Objects. 
            Keys:
                'objectApiName', ''fieldApiNames', 'conditions', 'mapKey'
            Example: 
                [
                    {
                        "objectApiName":"Contact",
                        "fieldApiNames":["FirstName","LastName"],
                        "conditions":"Name LIKE '%Acme%'", "mapKey":"Contacts"
                    }, 
                ]
    */
    @AuraEnabled(cacheable=true)
    public static Map<String, List<SObject>> fetchRecordsMultiObjectsWithConditionCached(List<Map<String, Object>> queries) {
        if (queries == null || queries.isEmpty()) {
            throw new AuraHandledException('The query input list cannot be null or empty.');
        }

        Map<String, List<SObject>> resultMap = new Map<String, List<SObject>>();

        try {
            for (Map<String, Object> queryMap : queries) {
                String objectApiName = (String) queryMap.get('objectApiName');
                // Handle fieldApiNames as a List<Object> and cast to List<String>
                List<Object> rawFieldApiNames = (List<Object>) queryMap.get('fieldApiNames');
                String mapKey = (String) queryMap.get('mapKey');

                List<String> fieldApiNames = new List<String>();
                for (Object fieldName : rawFieldApiNames) {
                    fieldApiNames.add((String) fieldName);
                }

                String conditions = (String) queryMap.get('conditions');

                if (String.isBlank(objectApiName)) {
                    throw new AuraHandledException('The object API name cannot be null or empty.');
                }
                if (fieldApiNames.isEmpty()) {
                    throw new AuraHandledException('The field API names cannot be null or empty for ' + objectApiName);
                }

                // Build the dynamic query
                String query = 'SELECT ' + String.join(fieldApiNames, ',') + ' FROM ' + objectApiName;
                if (!String.isBlank(conditions)) {
                    query += ' WHERE ' + conditions;
                }

                System.debug('SOQL Query: ' + query);

                List<SObject> queryResults = Database.query(query);
                resultMap.put(mapKey, queryResults);
            }

            return resultMap;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching records: ' + e.getMessage());
        }
    }


    // Get field values by any condition
    @AuraEnabled(cacheable=true)
    public static List<SObject> fetchRecordsDynamicWithConditionCached(
        String objectName, 
        List<String> fieldApiNames, 
        String conditions
    ) {
        // Validate input arguments
        if (fieldApiNames == null || fieldApiNames.isEmpty()) {
            throw new AuraHandledException('The list of field API names cannot be null or empty.');
        }

        // Sanity check the schema in this org/context
        Boolean leadHasUM = Schema.getGlobalDescribe().get('Lead')
            .getDescribe().fields.getMap().containsKey('UM__c');
        System.debug('Lead has UM__c? ' + leadHasUM);


        try {
            // Base query
            String query = 'SELECT ' + String.join(fieldApiNames, ',') + ' FROM ' + objectName + ' ';

            // Append additional conditions if provided
            if (conditions != null && !String.isBlank(conditions)) {
                query += ' WHERE ' + conditions;
            }

            // Execute the query
            List<SObject> result = Database.query(query);
            System.debug(result);

            return result;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching ' + objectName + ' data: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static Integer fetchRecordCountDynamicCached(
        String objectName,
        String conditions
    ) {
        if (String.isBlank(objectName)) {
            throw new AuraHandledException('Object name cannot be null or empty.');
        }

        try {
            // Base COUNT query
            String query = 'SELECT COUNT() FROM ' + objectName;

            // Append WHERE clause if provided
            if (!String.isBlank(conditions)) {
                query += ' WHERE ' + conditions;
            }

            // Execute count query (cheap, no heap usage)
            Integer recordCount = Database.countQuery(query);

            return recordCount;

        } catch (Exception e) {
            throw new AuraHandledException(
                'Error counting ' + objectName + ' records: ' + e.getMessage()
            );
        }
    }

    // ==================================================================================================================================== \\
}





/* Get fieldApiName, Label and Data Type
@AuraEnabled(cacheable=true)
public static List<Map<String, Object>> getFieldMetadata(String objectName, List<String> fieldApiNames) {
    List<Map<String, Object>> fieldMetadataList = new List<Map<String, Object>>();
    try {
        // Describe the object
        Schema.DescribeSObjectResult describeResult = Schema.getGlobalDescribe().get(objectName).getDescribe();
        
        // Get field describe results
        Map<String, Schema.SObjectField> fieldsMap = describeResult.fields.getMap();

        for (String fieldApiName : fieldApiNames) {
            if (fieldsMap.containsKey(fieldApiName)) {
                Schema.DescribeFieldResult fieldDescribe = fieldsMap.get(fieldApiName).getDescribe();

                // Create a map for each field
                Map<String, Object> fieldMetadata = new Map<String, Object>();
                fieldMetadata.put('label', fieldDescribe.getLabel());
                fieldMetadata.put('fieldApiName', fieldApiName);
                fieldMetadata.put('dataType', fieldDescribe.getType());
                fieldMetadataList.add(fieldMetadata);
            }
        }
    } catch (Exception e) {
        throw new AuraHandledException('Error fetching field metadata: ' + e.getMessage());
    }
    System.debug(fieldMetadataList);
    return fieldMetadataList;
}
*/