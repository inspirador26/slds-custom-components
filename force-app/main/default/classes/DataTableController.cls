
public with sharing class DataTableController {
    // ---------- Result DTO ----------
    public class RowResult {
        @AuraEnabled public String id;
        @AuraEnabled public Boolean success;
        @AuraEnabled public String error;
    }

    // ---------- Save Rows ----------
    @AuraEnabled
    public static List<RowResult> saveRows(List<Map<String, Object>> rows) {
        List<RowResult> out = new List<RowResult>();
        if (rows == null || rows.isEmpty()) return out;

        // Group by sObject type (DML can't mix types)
        Map<String, List<SObject>> byType = new Map<String, List<SObject>>();

        for (Map<String, Object> row : rows) {
            String sObjType = (String) row.get('sObjectType');
            if (String.isBlank(sObjType)) {
                throw new AuraHandledException('Missing sObjectType on one or more rows.');
            }
            Schema.SObjectType sType = Schema.getGlobalDescribe().get(sObjType);
            if (sType == null) {
                throw new AuraHandledException('Unknown sObjectType: ' + sObjType);
            }

            // ---- normalize Id (support "Id" or "id")
            String idStr = null;
            if (row.containsKey('Id'))       idStr = String.valueOf(row.get('Id'));
            else if (row.containsKey('id'))  idStr = String.valueOf(row.get('id'));

            if (String.isBlank(idStr)) {
                // No Id -> we refuse to insert here (prevent accidental new Leads)
                RowResult miss = new RowResult();
                miss.id = null;
                miss.success = false;
                miss.error = 'Missing Id for update (send Id or change method to allow inserts).';
                out.add(miss);
                continue;
            }

            Id recId = (Id) idStr;

            SObject sob = sType.newSObject(recId);
            Map<String, Schema.SObjectField> fmap = sType.getDescribe().fields.getMap();

            // Copy fields with dtype coercion
            // Copy fields; only coerce Date/Datetime; leave everything else as-is
            for (String key : row.keySet()) {
                if (key == 'sObjectType' || key == 'Id' || key == 'id') continue; // don't copy these
                if (!fmap.containsKey(key)) continue; // ignore unknown fields

                Object v = row.get(key);

                // Allow clearing values from UI
                if (v == null || (v instanceof String && String.isBlank((String) v))) {
                    sob.put(key, null);
                    continue;
                }

                Schema.DescribeFieldResult fd = fmap.get(key).getDescribe();
                Schema.DisplayType t = fd.getType();

                if (t == Schema.DisplayType.DATE) {
                    // Accept Date or 'YYYY-MM-DD'
                    sob.put(key, (v instanceof Date) ? (Date) v : Date.valueOf(String.valueOf(v)));
                } else if (t == Schema.DisplayType.DATETIME) {
                    // Accept Datetime or ISO8601 string (e.g., '2025-10-04T12:34:56Z')
                    if (v instanceof Datetime) {
                        sob.put(key, (Datetime) v);
                    } else {
                        try {
                            sob.put(key, (Datetime) JSON.deserialize('"' + String.valueOf(v) + '"', Datetime.class));
                        } catch (Exception e) {
                            // Fallback for 'YYYY-MM-DD HH:MM:SS' (interpreted in org TZ)
                            sob.put(key, Datetime.valueOf(String.valueOf(v)));
                        }
                    }
                } else {
                    // Everything else: leave as-is
                    sob.put(key, v);
                }
            }

            if (!byType.containsKey(sObjType)) byType.put(sObjType, new List<SObject>());
            byType.get(sObjType).add(sob);
        }

        // DML per type — use UPDATE so we don't insert by accident
        for (String sObjType : byType.keySet()) {
            List<SObject> bucket = byType.get(sObjType);
            Database.SaveResult[] res = Database.update(bucket, /* allOrNone */ false);

            for (Integer i = 0; i < res.size(); i++) {
                RowResult rr = new RowResult();
                rr.id = String.valueOf(bucket[i].get('Id'));
                rr.success = res[i].isSuccess();
                if (!rr.success && !res[i].getErrors().isEmpty()) {
                    rr.error = res[i].getErrors()[0].getMessage();
                }
                out.add(rr);
            }
        }
        return out;
    }


    // Get Open Leads and their related Tasks
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getLeadsWithTasks() {
        try {
            // Build your parameters in Apex (like 'conditions', 'fieldsPerObject', etc.)
            Map<String, String> conditions = new Map<String, String>{
                'Lead' => 'isClosed__c = false AND isConverted = false'
            };

            // For example, if you have a list of fields for Lead:
            List<String> leadQueryFields = new List<String>{
                'Lead_Due_Date__c', 
                'Name', 
                'RecordTypeId', 
                'Status', 
                'Account__c', 
                'FAT__c', 
                'Part_Number__c', 
                'Quantity__c', 
                'Est_Value__c', 
                'CreatedDate', 
                'Unit_Price__c',
                'Description',
                'RecordType.Name',
                'Account__r.Name'
            };

            Map<String, List<String>> fieldsPerObject = new Map<String, List<String>>{
                'Lead' => leadQueryFields
            };

            List<String> objectNames = new List<String>{ 'Lead' };

            // Child field names
            Map<String, List<String>> childFieldApiNames = new Map<String, List<String>>{
                'WhoId' => new List<String>{ 'Id','Description','Status','Subject','WhoId' }
            };

            List<String> parentFieldApiNames = new List<String>{ 'WhoId' };

            // Get Leads with Tasks
            Map<String, Object> leadsWithTasks = DynamicSObjectController.fetchMultiParentsConditionallyAndChildrenDynamicV2(
                conditions, 
                '', 
                objectNames,
                fieldsPerObject,
                true,           // isFetchChildren
                'Task',
                childFieldApiNames,
                parentFieldApiNames
            );

            return leadsWithTasks;

        } catch(Exception e) {
            // Decide how you want to handle errors
            // Usually you'd throw an AuraHandledException or just let it bubble up
            throw new AuraHandledException(e.getMessage());
        }
    }

    // Helper method to truncate names to 80 characters
    @TestVisible
    private static String truncateName(String name) {
        if (name.length() > 80) {
            return name.substring(0, 77) + '...'; // Truncate and add ellipsis
        }
        return name;
    }


    // Get All List Views Names
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> fetchListViewsByObject(List<String> objectApiNames) {
        try {
            Set<String> objectApiNamesSet = new Set<String>(objectApiNames);

            List<ListView> listViews = [
                SELECT Id, Name, DeveloperName, SobjectType
                FROM ListView
                WHERE SobjectType IN :objectApiNamesSet
            ];

            // Agrupar por SobjectType
            Map<String, List<ListView>> grouped = new Map<String, List<ListView>>();
            for (ListView lv : listViews) {
                if (!grouped.containsKey(lv.SobjectType)) {
                    grouped.put(lv.SobjectType, new List<ListView>());
                }
                grouped.get(lv.SobjectType).add(lv);
            }

            // Convertir al formato deseado
            List<Map<String, Object>> result = new List<Map<String, Object>>();
            for (String objName : grouped.keySet()) {
                Map<String, Object> entry = new Map<String, Object>();
                entry.put('objectApiName', objName);
                entry.put('listViews', grouped.get(objName));
                result.add(entry);
            }

            return result;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching ListViews: ' + e.getMessage());
        }
    }

    // Check if user is Admin 
    @AuraEnabled(cacheable=true)
    public static Boolean isAdminUser() {
        User u = [
            SELECT Id, Profile.Name, Profile.PermissionsModifyAllData
            FROM User
            WHERE Id = :UserInfo.getUserId()
            LIMIT 1
        ];

        return u.Profile.PermissionsModifyAllData
            || u.Profile.Name == 'System Administrator';
    }


    public class SortDto {
        @AuraEnabled public String fieldName;
        @AuraEnabled public String sortDirection;
    }
    private static List<SortDto> parseSortBy(String sortByJson) {
        if (String.isBlank(sortByJson)) {
            return new List<SortDto>();
        }

        try {
            return (List<SortDto>) JSON.deserialize(sortByJson, List<SortDto>.class);
        } catch (Exception e) {
            return new List<SortDto>();
        }
    }
    private static String buildOrderByClauseDynamic(
        String objectApiName,
        List<String> requestedFields,
        List<SortDto> sortDtos
    ) {
        if (String.isBlank(objectApiName) || requestedFields == null || requestedFields.isEmpty() || sortDtos == null || sortDtos.isEmpty()) {
            return null;
        }

        Set<String> allowedFields = new Set<String>();
        Map<String, Schema.SObjectField> fieldMap =
            Schema.getGlobalDescribe().get(objectApiName).getDescribe().fields.getMap();

        for (String fieldPath : requestedFields) {
            if (String.isBlank(fieldPath)) {
                continue;
            }

            if (!fieldPath.contains('.')) {
                if (fieldMap.containsKey(fieldPath)) {
                    allowedFields.add(fieldPath);
                }
                continue;
            }

            List<String> parts = fieldPath.split('\\.');
            if (parts.size() == 2) {
                allowedFields.add(fieldPath);
            }
        }

        List<String> orderParts = new List<String>();

        for (SortDto dto : sortDtos) {
            if (dto == null || String.isBlank(dto.fieldName)) {
                continue;
            }

            String fieldName = dto.fieldName.trim();
            if (!allowedFields.contains(fieldName)) {
                continue;
            }

            String dir = String.isBlank(dto.sortDirection) ? 'ASC' : dto.sortDirection.trim().toUpperCase();
            if (dir != 'ASC' && dir != 'DESC') {
                dir = 'ASC';
            }

            String nullsPart = dir == 'DESC' ? ' NULLS LAST' : ' NULLS FIRST';
            orderParts.add(fieldName + ' ' + dir + nullsPart);
        }

        return orderParts.isEmpty() ? null : String.join(orderParts, ', ');
    }

    public class TableRecordsDto {
        @AuraEnabled public List<SObject> rows;
        @AuraEnabled public Boolean hasNextPage;
        @AuraEnabled public Integer totalCount;
    }

    @AuraEnabled(cacheable=true)
    public static TableRecordsDto getTableRecords(
        String objectName,
        List<String> fieldApiNames,
        String conditions,
        String searchTerm,
        String sortByJson
    ) {
        if (String.isBlank(objectName)) {
            throw new AuraHandledException('objectName cannot be blank.');
        }
        if (fieldApiNames == null || fieldApiNames.isEmpty()) {
            throw new AuraHandledException('The list of field API names cannot be null or empty.');
        }

        try {
            String query = 'SELECT ' + String.join(fieldApiNames, ',') + ' FROM ' + objectName;

            String filterAndPagingClause = buildWhereClauseForDynamicFetch(
                objectName,
                fieldApiNames,
                conditions,
                searchTerm
            );

            String orderByClause = buildOrderByClauseDynamic(
                objectName,
                fieldApiNames,
                parseSortBy(sortByJson)
            );

            String filterClause = filterAndPagingClause;
            String suffixClause = '';

            if (!String.isBlank(filterAndPagingClause)) {
                String upper = filterAndPagingClause.toUpperCase();
                Integer limitIdx = upper.indexOf(' LIMIT ');
                Integer offsetIdx = upper.indexOf(' OFFSET ');

                Integer splitIdx = -1;
                if (limitIdx >= 0 && offsetIdx >= 0) {
                    splitIdx = Math.min(limitIdx, offsetIdx);
                } else if (limitIdx >= 0) {
                    splitIdx = limitIdx;
                } else if (offsetIdx >= 0) {
                    splitIdx = offsetIdx;
                }

                if (splitIdx >= 0) {
                    filterClause = filterAndPagingClause.substring(0, splitIdx).trim();
                    suffixClause = filterAndPagingClause.substring(splitIdx).trim();
                }
            }

            Integer pageLimit = null;

            if (!String.isBlank(suffixClause)) {
                Matcher limitMatcher = Pattern.compile('(?i)\\bLIMIT\\s+(\\d+)').matcher(suffixClause);
                if (limitMatcher.find()) {
                    pageLimit = Integer.valueOf(limitMatcher.group(1));
                    suffixClause = suffixClause.replaceFirst(
                        '(?i)\\bLIMIT\\s+\\d+',
                        'LIMIT ' + String.valueOf(pageLimit + 1)
                    );
                }
            }

            String countQuery = 'SELECT COUNT() FROM ' + objectName;

            if (!String.isBlank(filterClause)) {
                query += ' WHERE ' + filterClause;
                countQuery += ' WHERE ' + filterClause;
            }

            Integer totalCount = Database.countQuery(countQuery);

            if (String.isBlank(orderByClause)) {
                orderByClause = 'Id ASC';
            }

            query += ' ORDER BY ' + orderByClause;

            if (!String.isBlank(suffixClause)) {
                query += ' ' + suffixClause;
            }

            List<SObject> queriedRows = Database.query(query);

            Boolean hasNextPage = false;
            List<SObject> rows = new List<SObject>();

            if (pageLimit != null && queriedRows.size() > pageLimit) {
                hasNextPage = true;

                for (Integer i = 0; i < pageLimit; i++) {
                    rows.add(queriedRows[i]);
                }
            } else {
                rows.addAll(queriedRows);
            }

            TableRecordsDto res = new TableRecordsDto();
            res.rows = rows;
            res.hasNextPage = hasNextPage;
            res.totalCount = totalCount;
            return res;

        } catch (Exception e) {
            throw new AuraHandledException('Error fetching ' + objectName + ' data: ' + e.getMessage());
        }
    }

    private static String buildWhereClauseForDynamicFetch(
        String objectApiName,
        List<String> fieldApiNames,
        String conditions,
        String searchTerm
    ) {
        String filterClause = null;
        String suffixClause = '';

        if (!String.isBlank(conditions)) {
            String trimmed = conditions.trim();
            String upper = trimmed.toUpperCase();

            Integer limitIdx = upper.indexOf(' LIMIT ');
            Integer offsetIdx = upper.indexOf(' OFFSET ');

            Integer splitIdx = -1;
            if (limitIdx >= 0 && offsetIdx >= 0) {
                splitIdx = Math.min(limitIdx, offsetIdx);
            } else if (limitIdx >= 0) {
                splitIdx = limitIdx;
            } else if (offsetIdx >= 0) {
                splitIdx = offsetIdx;
            }

            if (splitIdx >= 0) {
                filterClause = trimmed.substring(0, splitIdx).trim();
                suffixClause = trimmed.substring(splitIdx).trim();
            } else {
                filterClause = trimmed;
            }
        }

        String searchClause = buildSearchClauseForDynamicFetch(objectApiName, fieldApiNames, searchTerm);

        List<String> clauses = new List<String>();
        if (!String.isBlank(searchClause)) {
            clauses.add(searchClause);
        }
        if (!String.isBlank(filterClause)) {
            clauses.add('(' + filterClause + ')');
        }

        String combined = clauses.isEmpty() ? '' : String.join(clauses, ' AND ');

        if (!String.isBlank(suffixClause)) {
            combined = String.isBlank(combined)
                ? suffixClause
                : combined + ' ' + suffixClause;
        }

        return combined;
    }

    private static String buildSearchClauseForDynamicFetch(
        String objectApiName,
        List<String> requestedFields,
        String searchTerm
    ) {
        if (String.isBlank(searchTerm) || requestedFields == null || requestedFields.isEmpty()) {
            return null;
        }

        Schema.SObjectType sObjType = Schema.getGlobalDescribe().get(objectApiName);
        if (sObjType == null) {
            return null;
        }

        Map<String, Schema.SObjectField> fieldMap = sObjType.getDescribe().fields.getMap();

        String escaped = String.escapeSingleQuotes(searchTerm)
            .replace('%', '\\%')
            .replace('_', '\\_');

        List<String> searchParts = new List<String>();

        for (String fieldPath : requestedFields) {
            if (String.isBlank(fieldPath)) {
                continue;
            }

            if (!fieldPath.contains('.')) {
                Schema.SObjectField fld = fieldMap.get(fieldPath);
                if (fld == null) {
                    continue;
                }

                Schema.DisplayType t = fld.getDescribe().getType();
                if (isLikeSearchableType(t)) {
                    searchParts.add(fieldPath + ' LIKE \'%' + escaped + '%\'');
                }
                continue;
            }

            List<String> parts = fieldPath.split('\\.');
            if (parts.size() != 2) {
                continue;
            }

            String relationshipName = parts[0];
            String relatedFieldName = parts[1];

            Schema.SObjectField relationshipField;
            for (Schema.SObjectField candidate : fieldMap.values()) {
                Schema.DescribeFieldResult d = candidate.getDescribe();
                if (
                    d.getType() == Schema.DisplayType.Reference &&
                    d.getRelationshipName() == relationshipName
                ) {
                    relationshipField = candidate;
                    break;
                }
            }

            if (relationshipField == null) {
                continue;
            }

            List<Schema.SObjectType> refTypes = relationshipField.getDescribe().getReferenceTo();
            if (refTypes == null || refTypes.isEmpty()) {
                continue;
            }

            Map<String, Schema.SObjectField> relatedFieldMap = refTypes[0].getDescribe().fields.getMap();
            Schema.SObjectField relatedFld = relatedFieldMap.get(relatedFieldName);

            if (relatedFld == null) {
                continue;
            }

            Schema.DisplayType relatedType = relatedFld.getDescribe().getType();
            if (isLikeSearchableType(relatedType)) {
                searchParts.add(fieldPath + ' LIKE \'%' + escaped + '%\'');
            }
        }

        return searchParts.isEmpty() ? null : '(' + String.join(searchParts, ' OR ') + ')';
    }

    private static Boolean isLikeSearchableType(Schema.DisplayType t) {
        return
            t == Schema.DisplayType.String ||
            t == Schema.DisplayType.TextArea ||
            t == Schema.DisplayType.Phone ||
            t == Schema.DisplayType.Email ||
            t == Schema.DisplayType.Url ||
            t == Schema.DisplayType.Picklist;
    }
}


/* ---OLD SETUP---
public with sharing class DataTableController {

    // rows example:
    // [
    //   { sObjectType:'Material__c', Id:'a0k...', Name:'New Material', Alloys__c:'204;318' },
    //   { sObjectType:'Account',     Id:'001...', Name:'Acme Corp' }
    // ]
    
    // ---------- Result DTO ----------
    public class RowResult {
        @AuraEnabled public String id;
        @AuraEnabled public Boolean success;
        @AuraEnabled public String error;
    }

    // ---------- Save Rows ----------
    @AuraEnabled
    public static List<RowResult> saveRows(List<Map<String, Object>> rows) {
        List<RowResult> out = new List<RowResult>();
        if (rows == null || rows.isEmpty()) return out;

        // Group by sObject type (DML can't mix types)
        Map<String, List<SObject>> byType = new Map<String, List<SObject>>();

        for (Map<String, Object> row : rows) {
            String sObjType = (String) row.get('sObjectType');
            if (String.isBlank(sObjType)) {
                throw new AuraHandledException('Missing sObjectType on one or more rows.');
            }
            Schema.SObjectType sType = Schema.getGlobalDescribe().get(sObjType);
            if (sType == null) {
                throw new AuraHandledException('Unknown sObjectType: ' + sObjType);
            }

            // ---- normalize Id (support "Id" or "id")
            String idStr = null;
            if (row.containsKey('Id'))       idStr = String.valueOf(row.get('Id'));
            else if (row.containsKey('id'))  idStr = String.valueOf(row.get('id'));

            if (String.isBlank(idStr)) {
                // No Id -> we refuse to insert here (prevent accidental new Leads)
                RowResult miss = new RowResult();
                miss.id = null;
                miss.success = false;
                miss.error = 'Missing Id for update (send Id or change method to allow inserts).';
                out.add(miss);
                continue;
            }

            Id recId = (Id) idStr;

            SObject sob = sType.newSObject(recId);
            Map<String, Schema.SObjectField> fmap = sType.getDescribe().fields.getMap();

            // Copy fields with dtype coercion
            // Copy fields; only coerce Date/Datetime; leave everything else as-is
            for (String key : row.keySet()) {
                if (key == 'sObjectType' || key == 'Id' || key == 'id') continue; // don't copy these
                if (!fmap.containsKey(key)) continue; // ignore unknown fields

                Object v = row.get(key);

                // Allow clearing values from UI
                if (v == null || (v instanceof String && String.isBlank((String) v))) {
                    sob.put(key, null);
                    continue;
                }

                Schema.DescribeFieldResult fd = fmap.get(key).getDescribe();
                Schema.DisplayType t = fd.getType();

                if (t == Schema.DisplayType.DATE) {
                    // Accept Date or 'YYYY-MM-DD'
                    sob.put(key, (v instanceof Date) ? (Date) v : Date.valueOf(String.valueOf(v)));
                } else if (t == Schema.DisplayType.DATETIME) {
                    // Accept Datetime or ISO8601 string (e.g., '2025-10-04T12:34:56Z')
                    if (v instanceof Datetime) {
                        sob.put(key, (Datetime) v);
                    } else {
                        try {
                            sob.put(key, (Datetime) JSON.deserialize('"' + String.valueOf(v) + '"', Datetime.class));
                        } catch (Exception e) {
                            // Fallback for 'YYYY-MM-DD HH:MM:SS' (interpreted in org TZ)
                            sob.put(key, Datetime.valueOf(String.valueOf(v)));
                        }
                    }
                } else {
                    // Everything else: leave as-is
                    sob.put(key, v);
                }
            }

            if (!byType.containsKey(sObjType)) byType.put(sObjType, new List<SObject>());
            byType.get(sObjType).add(sob);
        }

        // DML per type — use UPDATE so we don't insert by accident
        for (String sObjType : byType.keySet()) {
            List<SObject> bucket = byType.get(sObjType);
            // All or none = False
            Database.SaveResult[] res = Database.update(bucket, false);

            for (Integer i = 0; i < res.size(); i++) {
                RowResult rr = new RowResult();
                rr.id = String.valueOf(bucket[i].get('Id'));
                rr.success = res[i].isSuccess();
                if (!rr.success && !res[i].getErrors().isEmpty()) {
                    rr.error = res[i].getErrors()[0].getMessage();
                }
                out.add(rr);
            }
        }
        return out;
    }


    // Get Open Leads and their related Tasks
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getLeadsWithTasks() {
        try {
            // Build your parameters in Apex (like 'conditions', 'fieldsPerObject', etc.)
            Map<String, String> conditions = new Map<String, String>{
                'Lead' => 'isClosed__c = false AND isConverted = false'
            };

            // For example, if you have a list of fields for Lead:
            List<String> leadQueryFields = new List<String>{
                'Lead_Due_Date__c', 
                'Name', 
                'RecordTypeId', 
                'Status', 
                'Account__c', 
                'FAT__c', 
                'Part_Number__c', 
                'Quantity__c', 
                'Est_Value__c', 
                'CreatedDate', 
                'Unit_Price__c',
                'Description',
                'RecordType.Name',
                'Account__r.Name'
            };

            Map<String, List<String>> fieldsPerObject = new Map<String, List<String>>{
                'Lead' => leadQueryFields
            };

            List<String> objectNames = new List<String>{ 'Lead' };

            // Child field names
            Map<String, List<String>> childFieldApiNames = new Map<String, List<String>>{
                'WhoId' => new List<String>{ 'Id','Description','Status','Subject','WhoId' }
            };

            List<String> parentFieldApiNames = new List<String>{ 'WhoId' };

            // Get Leads with Tasks
            Map<String, Object> leadsWithTasks = DynamicSObjectController.fetchMultiParentsConditionallyAndChildrenDynamicV2(
                conditions, 
                '', 
                objectNames,
                fieldsPerObject,
                true,           // isFetchChildren
                'Task',
                childFieldApiNames,
                parentFieldApiNames
            );

            return leadsWithTasks;

        } catch(Exception e) {
            // Decide how you want to handle errors
            // Usually you'd throw an AuraHandledException or just let it bubble up
            throw new AuraHandledException(e.getMessage());
        }
    }

    // Helper method to truncate names to 80 characters
    @TestVisible
    private static String truncateName(String name) {
        if (name.length() > 80) {
            return name.substring(0, 77) + '...'; // Truncate and add ellipsis
        }
        return name;
    }


    // Get All List Views Names
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> fetchListViewsByObject(List<String> objectApiNames) {
        try {
            Set<String> objectApiNamesSet = new Set<String>(objectApiNames);

            List<ListView> listViews = [
                SELECT Id, Name, DeveloperName, SobjectType
                FROM ListView
                WHERE SobjectType IN :objectApiNamesSet
            ];

            // Agrupar por SobjectType
            Map<String, List<ListView>> grouped = new Map<String, List<ListView>>();
            for (ListView lv : listViews) {
                if (!grouped.containsKey(lv.SobjectType)) {
                    grouped.put(lv.SobjectType, new List<ListView>());
                }
                grouped.get(lv.SobjectType).add(lv);
            }

            // Convertir al formato deseado
            List<Map<String, Object>> result = new List<Map<String, Object>>();
            for (String objName : grouped.keySet()) {
                Map<String, Object> entry = new Map<String, Object>();
                entry.put('objectApiName', objName);
                entry.put('listViews', grouped.get(objName));
                result.add(entry);
            }

            return result;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching ListViews: ' + e.getMessage());
        }
    }

    // Check if user is Admin 
    @AuraEnabled(cacheable=true)
    public static Boolean isAdminUser() {
        User u = [
            SELECT Id, Profile.Name, Profile.PermissionsModifyAllData
            FROM User
            WHERE Id = :UserInfo.getUserId()
            LIMIT 1
        ];

        return u.Profile.PermissionsModifyAllData
            || u.Profile.Name == 'System Administrator';
    }


    public class SortDto {
        @AuraEnabled public String fieldName;
        @AuraEnabled public String sortDirection;
    }
    private static List<SortDto> parseSortBy(String sortByJson) {
        if (String.isBlank(sortByJson)) {
            return new List<SortDto>();
        }

        try {
            return (List<SortDto>) JSON.deserialize(sortByJson, List<SortDto>.class);
        } catch (Exception e) {
            return new List<SortDto>();
        }
    }
    private static String buildOrderByClauseDynamic(
        String objectApiName,
        List<String> requestedFields,
        List<SortDto> sortDtos
    ) {
        if (String.isBlank(objectApiName) || requestedFields == null || requestedFields.isEmpty() || sortDtos == null || sortDtos.isEmpty()) {
            return null;
        }

        Set<String> allowedFields = new Set<String>();
        Map<String, Schema.SObjectField> fieldMap =
            Schema.getGlobalDescribe().get(objectApiName).getDescribe().fields.getMap();

        for (String fieldPath : requestedFields) {
            if (String.isBlank(fieldPath)) {
                continue;
            }

            if (!fieldPath.contains('.')) {
                if (fieldMap.containsKey(fieldPath)) {
                    allowedFields.add(fieldPath);
                }
                continue;
            }

            List<String> parts = fieldPath.split('\\.');
            if (parts.size() == 2) {
                allowedFields.add(fieldPath);
            }
        }

        List<String> orderParts = new List<String>();

        for (SortDto dto : sortDtos) {
            if (dto == null || String.isBlank(dto.fieldName)) {
                continue;
            }

            String fieldName = dto.fieldName.trim();
            if (!allowedFields.contains(fieldName)) {
                continue;
            }

            String dir = String.isBlank(dto.sortDirection) ? 'ASC' : dto.sortDirection.trim().toUpperCase();
            if (dir != 'ASC' && dir != 'DESC') {
                dir = 'ASC';
            }

            String nullsPart = dir == 'DESC' ? ' NULLS LAST' : ' NULLS FIRST';
            orderParts.add(fieldName + ' ' + dir + nullsPart);
        }

        return orderParts.isEmpty() ? null : String.join(orderParts, ', ');
    }

    public class TableRecordsDto {
        @AuraEnabled public List<SObject> rows;
        @AuraEnabled public Boolean hasNextPage;
        @AuraEnabled public Integer totalCount;
    }

    @AuraEnabled(cacheable=true)
    public static TableRecordsDto getTableRecords(
        String objectName,
        List<String> fieldApiNames,
        String conditions,
        String searchTerm,
        String sortByJson
    ) {
        if (String.isBlank(objectName)) {
            throw new AuraHandledException('objectName cannot be blank.');
        }
        if (fieldApiNames == null || fieldApiNames.isEmpty()) {
            throw new AuraHandledException('The list of field API names cannot be null or empty.');
        }

        try {
            String query = 'SELECT ' + String.join(fieldApiNames, ',') + ' FROM ' + objectName;

            String filterAndPagingClause = buildWhereClauseForDynamicFetch(
                objectName,
                fieldApiNames,
                conditions,
                searchTerm
            );

            String orderByClause = buildOrderByClauseDynamic(
                objectName,
                fieldApiNames,
                parseSortBy(sortByJson)
            );

            String filterClause = filterAndPagingClause;
            String suffixClause = '';

            if (!String.isBlank(filterAndPagingClause)) {
                String upper = filterAndPagingClause.toUpperCase();
                Integer limitIdx = upper.indexOf(' LIMIT ');
                Integer offsetIdx = upper.indexOf(' OFFSET ');

                Integer splitIdx = -1;
                if (limitIdx >= 0 && offsetIdx >= 0) {
                    splitIdx = Math.min(limitIdx, offsetIdx);
                } else if (limitIdx >= 0) {
                    splitIdx = limitIdx;
                } else if (offsetIdx >= 0) {
                    splitIdx = offsetIdx;
                }

                if (splitIdx >= 0) {
                    filterClause = filterAndPagingClause.substring(0, splitIdx).trim();
                    suffixClause = filterAndPagingClause.substring(splitIdx).trim();
                }
            }

            Integer pageLimit = null;

            if (!String.isBlank(suffixClause)) {
                Matcher limitMatcher = Pattern.compile('(?i)\\bLIMIT\\s+(\\d+)').matcher(suffixClause);
                if (limitMatcher.find()) {
                    pageLimit = Integer.valueOf(limitMatcher.group(1));
                    suffixClause = suffixClause.replaceFirst(
                        '(?i)\\bLIMIT\\s+\\d+',
                        'LIMIT ' + String.valueOf(pageLimit + 1)
                    );
                }
            }

            String countQuery = 'SELECT COUNT() FROM ' + objectName;

            if (!String.isBlank(filterClause)) {
                query += ' WHERE ' + filterClause;
                countQuery += ' WHERE ' + filterClause;
            }

            Integer totalCount = Database.countQuery(countQuery);

            if (String.isBlank(orderByClause)) {
                orderByClause = 'Id ASC';
            }

            query += ' ORDER BY ' + orderByClause;

            if (!String.isBlank(suffixClause)) {
                query += ' ' + suffixClause;
            }

            List<SObject> queriedRows = Database.query(query);

            Boolean hasNextPage = false;
            List<SObject> rows = new List<SObject>();

            if (pageLimit != null && queriedRows.size() > pageLimit) {
                hasNextPage = true;

                for (Integer i = 0; i < pageLimit; i++) {
                    rows.add(queriedRows[i]);
                }
            } else {
                rows.addAll(queriedRows);
            }

            TableRecordsDto res = new TableRecordsDto();
            res.rows = rows;
            res.hasNextPage = hasNextPage;
            res.totalCount = totalCount;
            return res;

        } catch (Exception e) {
            throw new AuraHandledException('Error fetching ' + objectName + ' data: ' + e.getMessage());
        }
    }

    private static String buildWhereClauseForDynamicFetch(
        String objectApiName,
        List<String> fieldApiNames,
        String conditions,
        String searchTerm
    ) {
        String filterClause = null;
        String suffixClause = '';

        if (!String.isBlank(conditions)) {
            String trimmed = conditions.trim();
            String upper = trimmed.toUpperCase();

            Integer limitIdx = upper.indexOf(' LIMIT ');
            Integer offsetIdx = upper.indexOf(' OFFSET ');

            Integer splitIdx = -1;
            if (limitIdx >= 0 && offsetIdx >= 0) {
                splitIdx = Math.min(limitIdx, offsetIdx);
            } else if (limitIdx >= 0) {
                splitIdx = limitIdx;
            } else if (offsetIdx >= 0) {
                splitIdx = offsetIdx;
            }

            if (splitIdx >= 0) {
                filterClause = trimmed.substring(0, splitIdx).trim();
                suffixClause = trimmed.substring(splitIdx).trim();
            } else {
                filterClause = trimmed;
            }
        }

        String searchClause = buildSearchClauseForDynamicFetch(objectApiName, fieldApiNames, searchTerm);

        List<String> clauses = new List<String>();
        if (!String.isBlank(searchClause)) {
            clauses.add(searchClause);
        }
        if (!String.isBlank(filterClause)) {
            clauses.add('(' + filterClause + ')');
        }

        String combined = clauses.isEmpty() ? '' : String.join(clauses, ' AND ');

        if (!String.isBlank(suffixClause)) {
            combined = String.isBlank(combined)
                ? suffixClause
                : combined + ' ' + suffixClause;
        }

        return combined;
    }

    private static String buildSearchClauseForDynamicFetch(
        String objectApiName,
        List<String> requestedFields,
        String searchTerm
    ) {
        if (String.isBlank(searchTerm) || requestedFields == null || requestedFields.isEmpty()) {
            return null;
        }

        Schema.SObjectType sObjType = Schema.getGlobalDescribe().get(objectApiName);
        if (sObjType == null) {
            return null;
        }

        Map<String, Schema.SObjectField> fieldMap = sObjType.getDescribe().fields.getMap();

        String escaped = String.escapeSingleQuotes(searchTerm)
            .replace('%', '\\%')
            .replace('_', '\\_');

        List<String> searchParts = new List<String>();

        for (String fieldPath : requestedFields) {
            if (String.isBlank(fieldPath)) {
                continue;
            }

            if (!fieldPath.contains('.')) {
                Schema.SObjectField fld = fieldMap.get(fieldPath);
                if (fld == null) {
                    continue;
                }

                Schema.DisplayType t = fld.getDescribe().getType();
                if (isLikeSearchableType(t)) {
                    searchParts.add(fieldPath + ' LIKE \'%' + escaped + '%\'');
                }
                continue;
            }

            List<String> parts = fieldPath.split('\\.');
            if (parts.size() != 2) {
                continue;
            }

            String relationshipName = parts[0];
            String relatedFieldName = parts[1];

            Schema.SObjectField relationshipField;
            for (Schema.SObjectField candidate : fieldMap.values()) {
                Schema.DescribeFieldResult d = candidate.getDescribe();
                if (
                    d.getType() == Schema.DisplayType.Reference &&
                    d.getRelationshipName() == relationshipName
                ) {
                    relationshipField = candidate;
                    break;
                }
            }

            if (relationshipField == null) {
                continue;
            }

            List<Schema.SObjectType> refTypes = relationshipField.getDescribe().getReferenceTo();
            if (refTypes == null || refTypes.isEmpty()) {
                continue;
            }

            Map<String, Schema.SObjectField> relatedFieldMap = refTypes[0].getDescribe().fields.getMap();
            Schema.SObjectField relatedFld = relatedFieldMap.get(relatedFieldName);

            if (relatedFld == null) {
                continue;
            }

            Schema.DisplayType relatedType = relatedFld.getDescribe().getType();
            if (isLikeSearchableType(relatedType)) {
                searchParts.add(fieldPath + ' LIKE \'%' + escaped + '%\'');
            }
        }

        return searchParts.isEmpty() ? null : '(' + String.join(searchParts, ' OR ') + ')';
    }

    private static Boolean isLikeSearchableType(Schema.DisplayType t) {
        return
            t == Schema.DisplayType.String ||
            t == Schema.DisplayType.TextArea ||
            t == Schema.DisplayType.Phone ||
            t == Schema.DisplayType.Email ||
            t == Schema.DisplayType.Url ||
            t == Schema.DisplayType.Picklist;
    }






    /*
    // Get all RFQ records and their RFQ_Line_Item__c children
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getAllRfqsAndLineItems(Id recordId, String objectApiName) {
        try {
            // Build your parameters in Apex (like 'conditions', 'fieldsPerObject', etc.)
            String conditions = '';
            if (recordId != null) {
                
                switch on objectApiName {
                    when 'Lead' {
                        conditions = 'NSN_Finished_Part__r.Lead__c = \'' + recordId + '\'';

                    }
                    when 'Opportunity' {
                        conditions = 'NSN_Finished_Part__r.Opportunity__c = \'' + recordId + '\'';
                        
                    }
                    when 'Contract_Award__c' {
                        conditions = 'NSN_Finished_Part__r.Contract_Award__c = \'' + recordId + '\'';
                        
                    }  
                }
            }
            String objectName = 'RFQ__c';

            // For example, if you have a list of fields for Lead:
            List<String> fieldApiNames = new List<String>{
                'Id',
                'Name',
                'Account__r.Name', 
                'Contact__r.Name', 
                'Status__c',
                'NSN_Finished_Part__r.Name',
                'Delivery__c',
                'Cost__c',
                'Sell_Price__c'
            };

            Boolean isFetchChildren = true;

            String childObjectName = 'RFQ_Line_Item__c';

            List<String> childFieldApiNames = new List<String> {
                'Id', 'Name', 'Component__r.Name', 'RFQ__c', 
                'FAT__r.Name', 
                'Service__r.Name', 
                'NSN_Finished_Part__r.Name', 'RFQ__r.Name', 'Cost__c', 
                'Delivery__c', 'Status__c', 'Sell_Price__c'
            };

            String parentFieldApiName = 'RFQ__c';

            // Get Leads with Tasks
            Map<String, Object> rfqAndLineItems = DynamicSObjectController.fetchParentsConditionallyAndChildrenDynamicCacheable(
                conditions,
                objectName,
                fieldApiNames,
                isFetchChildren,
                childObjectName,
                childFieldApiNames,
                parentFieldApiName
            );

            return rfqAndLineItems;

        } catch(Exception e) {
            // Decide how you want to handle errors
            // Usually you'd throw an AuraHandledException or just let it bubble up
            throw new AuraHandledException(e.getMessage());
        }
    }
    // Get all NSN_Finished_Part__c recoords
    @AuraEnabled(cacheable=true)
    public static List<NSN_Finished_Part__c> fetchAllFinishedParts() {
        List<NSN_Finished_Part__c> finishedParts = [
            SELECT Id, Name, Lead__r.Name, Opportunity__r.Name, Contract_Award__r.Name, Part_Number__c, Account__r.Name
            FROM NSN_Finished_Part__c
            WHERE (Lead__r.isClosed__c != true AND Lead__r.isConverted != true)
            OR Opportunity__r.isClosed != true
            OR Contract_Award__r.isClosed__c != true
        ];

        return finishedParts;
    }
    // Get Service__c, FAT__c, Component__c (Parts_and_Services__c) records related to NSN_Finished_Part__c
    @AuraEnabled(cacheable=true)
    public static List<SObject> getRelatedPartItems(List<Id> nsnFinishedPartIds) {
        List<SObject> combinedList = new List<SObject>();

        Set<Id> finishedPartIdsSet = new Set<Id>();

        for (Id partId : nsnFinishedPartIds) {
            finishedPartIdsSet.add(partId);
        }
        
        List<SObject> fats = [
            SELECT Id, Name, Account__r.Name, NSN_Finished_Part__c
            FROM FAT__c 
            WHERE NSN_Finished_Part__c IN :finishedPartIdsSet
        ];

        List<SObject> services = [
            SELECT Id, Name, Part__r.Name, Service_Type__c, NSN_Finished_Part__c 
            FROM Service__c 
            WHERE NSN_Finished_Part__c IN :finishedPartIdsSet
        ];

        List<SObject> components = [
            SELECT Id, Name, Account__r.Name, Part_Number__c, NSN_Finished_Part__c
            FROM Parts_and_Services__c 
            WHERE NSN_Finished_Part__c IN :finishedPartIdsSet
        ];

        if (fats != null && !fats.isEmpty()) {
            combinedList.addAll(fats);
        }
        if (services != null && !services.isEmpty()) {
            combinedList.addAll(services);
        }
        if (components != null && !components.isEmpty()) {
            combinedList.addAll(components);
        }

        return combinedList;
    }
    // Get NSN finished part records related using Lead__c, Opportunity__c or Contract_Award__c lookup field
    @AuraEnabled(cacheable=true)
    public static List<NSN_Finished_Part__c> getListViewFinishedParts(String lookupField, List<Id> relatedRecordIds) {
        try {
            if (String.isBlank(lookupField) || relatedRecordIds == null || relatedRecordIds.isEmpty()) {
                return new List<NSN_Finished_Part__c>();
            }

            String baseQuery = 'SELECT Name, NSN__c, Part_Number__c, Quantity__c, Account__c, Account__r.Name, Cost__c, Sell_Price__c, Material__c, Dimension__c ' +
                            'FROM NSN_Finished_Part__c WHERE ' + lookupField + ' IN :relatedRecordIds';

            return Database.query(baseQuery);

        } catch (Exception e) {
            throw new AuraHandledException('getFinishedParts error: ' + e.getMessage());
        }
    }
    // Get RFQ__c and Line_items by RFQ__c Id
    @AuraEnabled(cacheable=true)
    public static List<RFQ__c> getRfqsAndRelatedItemsByRecordId(List<Id> rfqIds) {
        try {

            Set<Id> rfqIdsSet = new Set<Id>();

            for (Id rfqId : rfqIds) {
                rfqIdsSet.add(rfqId);
            }

            
            // Query the RFQ__c records along with their child RFQ_Line_Item__c records.
            List<RFQ__c> rfqList = [
                SELECT Id,
                       Name,
                       Account__r.Name,
                       Contact__r.Name,
                       Owner.Name,
                       Status__c,
                       NSN_Finished_Part__r.Name,
                       (
                           SELECT Id,
                                  Name,
                                  Type__c,
                                  Component__r.Name,
                                  FAT__r.Name,
                                  Service__r.Name,
                                  NSN_Finished_Part__r.Name
                           FROM RFQ_Line_Item__r
                       )
                FROM RFQ__c
                WHERE Id IN :rfqIdsSet
            ];
            
            return rfqList;
            
        } catch (Exception ex) {
            // Raise exception
            throw new AuraHandledException('Error retrieving RFQs and line items: ' + ex.getMessage());
        }
    }

    /* Create a new RFQ__c along with RFQ_Line_Item__c Array
    @AuraEnabled
    public static Id createRfq(Map<String, String> newRfq, Map<String, String> nsnFinishedPart, List<Map<String, String>> selectRelatedItems) {
        Boolean isRequiredFields = false;

        // Check that each key exists and is non-null
        if (
            newRfq.get('NSN_Finished_Part__c') != null &&
            newRfq.get('Account__c') != null &&
            newRfq.get('Name') != null &&
            newRfq.get('Contact__c') != null
        ) {
            isRequiredFields = true;
        }

        if (!isRequiredFields) {
            return null;
        }

        RFQ__c rfq = new RFQ__c();

        rfq.NSN_Finished_Part__c = newRfq.get('NSN_Finished_Part__c');
        rfq.Account__c = newRfq.get('Account__c');
        rfq.Name = newRfq.get('Name');
        rfq.Contact__c = newRfq.get('Contact__c');
        String statusVal = newRfq.get('Status__c');

        if (statusVal != null) {
            rfq.Status__c = statusVal;
        }

        try {
            insert rfq;

        } catch(Exception e) {
            throw new AuraHandledException('Error inserting RFQ: ' + e.getMessage());
        }
        
        try {
            List<RFQ_Line_Item__c> lineItems = new List<RFQ_Line_Item__c>();

            // Add NSN_Finished_Part__c as a line item
            RFQ_Line_Item__c nsnLineItem = new RFQ_Line_Item__c(
                Name = nsnFinishedPart.get('Name'),
                RFQ__c = rfq.Id,
                NSN_Finished_Part__c = nsnFinishedPart.get('Id'),
                Type__c = 'Finished Part'
            );
            lineItems.add(nsnLineItem);
            

            for (Map<String, String> item : selectRelatedItems) {
                
                String itemType = item.get('objectApiName');
                RFQ_Line_Item__c lineItem = new RFQ_Line_Item__c();
                
                switch on itemType {
                    when 'Parts_and_Services__c' {
                        lineItem.Name = truncateName('Component: ' + item.get('Name'));
                        lineItem.RFQ__c = rfq.Id;
                        lineItem.Component__c = item.get('Id');
                        lineItem.Type__c = 'Component';
                    }
                    when 'FAT__c' {
                        lineItem.Name = truncateName('FAT: ' + item.get('Name'));
                        lineItem.RFQ__c = rfq.Id;
                        lineItem.FAT__c = item.get('Id');
                        lineItem.Type__c = 'FAT';
                    }
                    when 'Service__c' {
                        lineItem.Name = truncateName('Service: ' + item.get('Name'));
                        lineItem.RFQ__c = rfq.Id;
                        lineItem.Service__c = item.get('Id');
                        lineItem.Type__c = 'Service';
                    }  
                }
                lineItems.add(lineItem); // Add the Line item
            }

            if (!lineItems.isEmpty()) {
                try  {
                    insert lineItems; // Insert the line item
                }catch(Exception e) {
                    throw new AuraHandledException('Error inserting RFQ Line Items: ' + e.getMessage());
                }
            }

            return rfq.Id;

        }catch(Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    // Update RFQ Record
    @AuraEnabled
    public static void updateRfq(Map<String, String> rfq, List<Map<String, String>> newRfqLineItems, List<String> deletedRfqLineItems) {
        try {

            // 1. Instantiate the record
            RFQ__c updatedRfq = new RFQ__c();

            // 2. If you’re truly updating, make sure to set the Id
            if (rfq.containsKey('Id')) {
                updatedRfq.Id = rfq.get('Id');
            }

            // 3. Dynamically assign fields
            for (String key : rfq.keySet()) {
                // Skip Id or any read-only fields you don’t want to assign
                if (key != 'Id') {
                    updatedRfq.put(key, rfq.get(key));
                }
            }

            if (rfq.keySet().size() > 1) {
                // 4. Update the parent record
                update updatedRfq;
            }

            // Handle Deletion of RFQ Line items
            if (!deletedRfqLineItems.isEmpty()) {
                DynamicSObjectController.deleteRecordsById(deletedRfqLineItems, 'RFQ_Line_Item__c');
            }

            // Handle new RFQ Line items
            if (!newRfqLineItems.isEmpty()) {
                // Initialize RFQ Line Items List
                List<RFQ_Line_Item__c> lineItems = new List<RFQ_Line_Item__c>();
                
                // Loop the new RFQ Line Items
                for (Map<String, String> item : newRfqLineItems) {
                    
                    String itemType = item.get('objectApiName');
                    RFQ_Line_Item__c lineItem = new RFQ_Line_Item__c();
                    
                    // Create RFQ Line Items from the Related Parts/Services Array
                    switch on itemType {
                        when 'NSN_Finished_Part__c' {
                            lineItem.Name = truncateName('Finished Part: ' + item.get('Name'));
                            lineItem.RFQ__c = rfq.get('Id');
                            lineItem.NSN_Finished_Part__c = item.get('Id');
                            lineItem.Type__c = 'Finished Part';
                        }
                        when 'Parts_and_Services__c' {
                            lineItem.Name = truncateName('Component: ' + item.get('Name'));
                            lineItem.RFQ__c = rfq.get('Id');
                            lineItem.Component__c = item.get('Id');
                            lineItem.Type__c = 'Component';
                        }
                        when 'FAT__c' {
                            lineItem.Name = truncateName('FAT: ' + item.get('Name'));
                            lineItem.RFQ__c = rfq.get('Id');
                            lineItem.FAT__c = item.get('Id');
                            lineItem.Type__c = 'FAT';
                        }
                        when 'Service__c' {
                            lineItem.Name = truncateName('Service: ' + item.get('Name'));
                            lineItem.RFQ__c = rfq.get('Id');
                            lineItem.Service__c = item.get('Id');
                            lineItem.Type__c = 'Service';
                        }  
                    }
                    lineItems.add(lineItem); // Add the Line item
                }

                if (!lineItems.isEmpty()) {
                    insert lineItems; // Insert the line item
                }
            }

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
*/