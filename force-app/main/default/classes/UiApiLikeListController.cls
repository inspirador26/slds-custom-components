/**
 * UiApiLikeListController
 * Mimics lightning/uiListsApi.getListRecordsByName response shape but guarantees honoring sortBy.
 *
 * Security:
 * - Queries use WITH SECURITY_ENFORCED.
 * - Class declared with sharing to respect org sharing.
 *
 * Notes:
 * - v1 implements OFFSET-based pagination using numeric tokens: "0", "10", ...
 * - v1 supports simple WHERE operators over flat fields: eq, ne, in, nin, isNull, isNotNull, contains, startsWith.
 * - v1 supports single-level relationship display (e.g., Lead.Owner.Name) when provided in fields.
 * - sortBy supports object or array; we use the first element as primary, and append remaining as secondary ORDER BY entries.
 */
public with sharing class UiApiLikeListController {

    // ========================= DTOs =========================
    public class SortDto {
        @AuraEnabled public String fieldApiName;
        @AuraEnabled public String direction;
        @AuraEnabled public String nullsPreference;
    }
    public class RequestDto {
        @AuraEnabled public String objectApiName;
        @AuraEnabled public String listViewApiName;
        @AuraEnabled public List<String> fields;
        @AuraEnabled public Integer pageSize;
        @AuraEnabled public String pageToken;
        @AuraEnabled public String filterCriteria;
        @AuraEnabled public String searchTerm;
        @AuraEnabled public Object sortBy;
    }
    public class FieldValueDto {
        @AuraEnabled public Object value;
        @AuraEnabled public Object displayValue;
        public FieldValueDto() {}
        public FieldValueDto(Object v, Object d) { value = v; displayValue = d; }
    }
    public class RecordDto {
        @AuraEnabled public String id;
        @AuraEnabled public Map<String, FieldValueDto> fields;
        @AuraEnabled public String recordTypeId;
    }
    public class ListReferenceDto {
        @AuraEnabled public String id;
        @AuraEnabled public String listViewApiName;
        @AuraEnabled public String objectApiName;
        @AuraEnabled public String type;
    }
    public class ResponseDto {
        @AuraEnabled public Integer count;
        @AuraEnabled public String currentPageToken;
        @AuraEnabled public String nextPageToken;
        @AuraEnabled public String previousPageToken;
        @AuraEnabled public Integer pageSize;
        @AuraEnabled public String objectApiName;
        @AuraEnabled public ListReferenceDto listReference;
        @AuraEnabled public List<String> fields;
        @AuraEnabled public List<String> optionalFields;
        @AuraEnabled public String searchTerm;
        @AuraEnabled public Object filterCriteria;
        @AuraEnabled public Object sortBy;
        @AuraEnabled public List<RecordDto> records;
    }
    public class RelatedRecordDto {
        @AuraEnabled public String apiName;
        @AuraEnabled public String id;
        @AuraEnabled public Map<String, FieldValueDto> fields;
    }

    // ========================= API =========================
    @AuraEnabled(cacheable=true)
    public static ResponseDto getListRecords(
        String objectApiName,
        String listViewApiName,
        List<String> fields,
        Integer pageSize,
        String pageToken,
        String filterCriteria,
        String searchTerm,
        String sortByJson,
        String childRelationColumnJson
    ) {
        RequestDto req = new RequestDto();
        req.objectApiName = objectApiName;
        req.listViewApiName = listViewApiName;
        req.fields = fields;
        req.pageSize = pageSize;
        req.pageToken = pageToken;
        req.filterCriteria = filterCriteria;
        req.searchTerm = searchTerm;
        req.sortBy = parseSortBy(sortByJson);

        validate(req);
        
        Schema.SObjectType sObjType = Schema.getGlobalDescribe().get(req.objectApiName);
        Schema.DescribeSObjectResult describe = sObjType.getDescribe();
        Boolean hasRecordTypes = describe.fields.getMap().containsKey('RecordTypeId');

        Integer offsetVal = 0;
        if (req.pageToken != null) {
            try {
                offsetVal = Integer.valueOf(req.pageToken);
            } catch (Exception e) {
                offsetVal = 0;
            }
        }

        Integer pageSizeP = (req.pageSize == null || req.pageSize <= 0)
            ? 10
            : Math.min(req.pageSize, 500);

        Integer queryLimit = pageSizeP + 1;

        Set<String> selectSet = new Set<String>();
        selectSet.add(req.objectApiName + '.Id');

        if (hasRecordTypes) {
            selectSet.add(req.objectApiName + '.RecordTypeId');
        }

        for (String f : req.fields) {
            if (String.isBlank(f) || !f.contains('.')) {
                continue;
            }

            selectSet.add(f);

            List<String> parts = f.split('\\.');
            if (parts.size() == 3) {
                selectSet.add(parts[0] + '.' + parts[1] + '.Id');
            }
        }

        List<String> normalizedFields = new List<String>();
        String prefix = req.objectApiName + '.';
        for (String f : selectSet) {
            normalizedFields.add(
                f.startsWith(prefix)
                    ? f.substring(prefix.length())
                    : f
            );
        }

        List<Object> childRelationColumns;
        if (!String.isBlank(childRelationColumnJson)) {
            childRelationColumns = (List<Object>) JSON.deserializeUntyped(childRelationColumnJson);
        }


        List<String> childSubqueries = new List<String>();
        List<Map<String, Object>> childRelationConfigs = new List<Map<String, Object>>();

        if (childRelationColumns != null) {
            for (Object obj : childRelationColumns) {
                Map<String, Object> relConfig = (Map<String, Object>) obj;

                String relationName = (String) relConfig.get('relationName');
                if (String.isBlank(relationName)) {
                    continue;
                }

                List<String> childSelectFields = new List<String>();
                childSelectFields.add('Id');

                List<Object> columns = (List<Object>) relConfig.get('columns');
                if (columns != null) {
                    for (Object colObj : columns) {
                        Map<String, Object> col = (Map<String, Object>) colObj;

                        String childFieldApiName = String.isBlank((String) col.get('childFieldApiName'))
                            ? 'Name'
                            : (String) col.get('childFieldApiName');

                        if (!childSelectFields.contains(childFieldApiName)) {
                            childSelectFields.add(childFieldApiName);
                        }

                        String condition = (String) col.get('condition');
                        if (!String.isBlank(condition)) {
                            Matcher m = Pattern.compile('^([A-Za-z0-9_.]+)\\s*=\\s*.+$').matcher(condition);
                            if (m.matches()) {
                                String conditionField = m.group(1);
                                if (!childSelectFields.contains(conditionField)) {
                                    childSelectFields.add(conditionField);
                                }
                            }
                        }
                    }
                }

                String subquery =
                    '(SELECT ' + String.join(childSelectFields, ', ') +
                    ' FROM ' + relationName + ')';

                childSubqueries.add(subquery);
                childRelationConfigs.add(relConfig);
            }
        }

        if (!childSubqueries.isEmpty()) {
            normalizedFields.addAll(childSubqueries);
        }

        String whereClause = buildWhereClause(req);
        List<SortDto> sorts = normalizeSorts(req.sortBy);
        String orderByClause = buildOrderByClause(req.objectApiName, sorts);

        String soql = 'SELECT ' + String.join(normalizedFields, ', ') +
            ' FROM ' + objectApiName;

        if (!String.isBlank(whereClause)) {
            soql += ' WHERE ' + whereClause;
        }

        soql += ' WITH SECURITY_ENFORCED';

        if (!String.isBlank(orderByClause)) {
            soql += ' ORDER BY ' + orderByClause;
        }

        soql += ' LIMIT :queryLimit OFFSET :offsetVal';

        System.debug('FINAL SOQL >>> ' + soql);

        List<sObject> queriedRows = Database.query(soql);
        Boolean hasNextPage = queriedRows.size() > pageSizeP;

        List<sObject> rows = new List<sObject>();
        Integer rowsToKeep = hasNextPage ? pageSizeP : queriedRows.size();

        for (Integer i = 0; i < rowsToKeep; i++) {
            rows.add(queriedRows[i]);
        }

        ResponseDto res = new ResponseDto();
        res.count = rows.size();
        res.currentPageToken = String.valueOf(offsetVal);
        res.nextPageToken = hasNextPage ? String.valueOf(offsetVal + pageSizeP) : null;
        res.previousPageToken = (offsetVal > 0) ? String.valueOf(Math.max(0, offsetVal - pageSizeP)) : null;
        res.pageSize = pageSizeP;
        res.objectApiName = req.objectApiName;
        res.listReference = new ListReferenceDto();
        res.listReference.id = null;
        res.listReference.listViewApiName = req.listViewApiName;
        res.listReference.objectApiName = req.objectApiName;
        res.listReference.type = 'listView';
        res.fields = new List<String>(req.fields);
        res.optionalFields = new List<String>();
        res.searchTerm = req.searchTerm;
        res.filterCriteria = req.filterCriteria;
        res.sortBy = req.sortBy;
        res.records = mapRecords(
            req.objectApiName,
            rows,
            req.fields,
            hasRecordTypes,
            childRelationConfigs
        );

        return res;
    }

    private static Object parseSortBy(String sortByJson) {
        if (String.isBlank(sortByJson)) {
            return null;
        }
        return JSON.deserializeUntyped(sortByJson);
    }

    private static List<SortDto> normalizeSorts(Object sortByAny) {
        List<SortDto> out = new List<SortDto>();

        if (sortByAny == null) {
            return out;
        }

        if (sortByAny instanceof Map<String, Object>) {
            out.add(mapToSortDto((Map<String, Object>) sortByAny));
            return pruneEmptySorts(out);
        }

        if (sortByAny instanceof List<Object>) {
            for (Object item : (List<Object>) sortByAny) {
                if (item instanceof Map<String, Object>) {
                    out.add(mapToSortDto((Map<String, Object>) item));
                }
            }
        }

        return pruneEmptySorts(out);
    }

    private static SortDto mapToSortDto(Map<String, Object> sortMap) {
        SortDto s = new SortDto();
        s.fieldApiName = (String) sortMap.get('fieldApiName');
        s.direction = (String) sortMap.get('direction');
        s.nullsPreference = (String) sortMap.get('nullsPreference');
        return s;
    }

    private static List<SortDto> pruneEmptySorts(List<SortDto> sorts) {
        List<SortDto> out = new List<SortDto>();

        for (SortDto s : sorts) {
            if (s != null && !String.isBlank(s.fieldApiName)) {
                out.add(s);
            }
        }

        return out;
    }

    private static String buildOrderByClause(String objectApiName, List<SortDto> sorts) {
        if (sorts == null || sorts.isEmpty()) {
            return null;
        }

        List<String> parts = new List<String>();
        String prefix = objectApiName + '.';

        for (SortDto s : sorts) {
            String field = s.fieldApiName;

            if (field.startsWith(prefix)) {
                field = field.substring(prefix.length());
            }

            String dir = String.isBlank(s.direction) ? 'ASC' : s.direction.toUpperCase();
            if (dir != 'ASC' && dir != 'DESC') {
                dir = 'ASC';
            }

            String nullsClause = (dir == 'DESC') ? ' NULLS LAST' : ' NULLS FIRST';
            parts.add(field + ' ' + dir + nullsClause);
        }

        return parts.isEmpty() ? null : String.join(parts, ', ');
    }

    // ========================= Helpers =========================
    private static void validate(RequestDto req) {
        if (req == null) {
            throw new AuraHandledException('Request cannot be null');
        }
        if (String.isBlank(req.objectApiName)) {
            throw new AuraHandledException('objectApiName is required');
        }
        if (req.fields == null || req.fields.isEmpty()) {
            throw new AuraHandledException('fields cannot be empty');
        }
        for (String f : req.fields) {
            if (String.isBlank(f) || !f.contains('.')) {
                AuraHandledException ex = new AuraHandledException('Each field must be fully qualified, e.g., Lead.Name');
                ex.setMessage('Each field must be fully qualified, e.g., Lead.Name');
                throw ex;
            }

            if (!f.startsWith(req.objectApiName + '.')) {
                throw new AuraHandledException('Field ' + f + ' must start with ' + req.objectApiName + '.');
            }
        }
    }
    private static String escapeLike(String s) {
        // Escape %, _, \ for LIKE
        return s == null ? null : s.replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_');
    }

    private static String buildWhereClause(RequestDto req) {
        List<String> clauses = new List<String>();

        if (!String.isBlank(req.searchTerm)) {
            String searchClause = buildSearchClause(req.objectApiName, req.fields, req.searchTerm);
            if (!String.isBlank(searchClause)) {
                clauses.add(searchClause);
            }
        }


        if (!String.isBlank(req.filterCriteria)) {
            clauses.add(normalizeFilterCriteria(req.objectApiName, req.filterCriteria));
        }

        return clauses.isEmpty() ? null : String.join(clauses, ' AND ');
    }
    private static String buildSearchClause(
        String objectApiName,
        List<String> requestedFields,
        String searchTerm
    ) {
        if (String.isBlank(searchTerm) || requestedFields == null || requestedFields.isEmpty()) {
            return null;
        }

        Map<String, Schema.SObjectField> fieldMap =
            Schema.getGlobalDescribe().get(objectApiName).getDescribe().fields.getMap();

        String escaped = String.escapeSingleQuotes(searchTerm).replace('%', '\\%').replace('_', '\\_');

        List<String> searchParts = new List<String>();

        for (String fq : requestedFields) {
            if (String.isBlank(fq) || !fq.startsWith(objectApiName + '.')) {
                continue;
            }

            String localField = fq.substring((objectApiName + '.').length());

            if (!localField.contains('.')) {
                Schema.SObjectField fld = fieldMap.get(localField);
                if (fld == null) {
                    continue;
                }

                Schema.DisplayType t = fld.getDescribe().getType();

                if (
                    t == Schema.DisplayType.String ||
                    t == Schema.DisplayType.TextArea ||
                    t == Schema.DisplayType.Phone ||
                    t == Schema.DisplayType.Email ||
                    t == Schema.DisplayType.Url ||
                    t == Schema.DisplayType.Picklist
                ) {
                    searchParts.add(localField + ' LIKE \'%' + escaped + '%\'');
                }

                continue;
            }

            List<String> parts = localField.split('\\.');
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

            Map<String, Schema.SObjectField> relatedFieldMap =
                refTypes[0].getDescribe().fields.getMap();

            Schema.SObjectField relatedFld = relatedFieldMap.get(relatedFieldName);
            if (relatedFld == null) {
                continue;
            }

            Schema.DisplayType relatedType = relatedFld.getDescribe().getType();

            if (
                relatedType == Schema.DisplayType.String ||
                relatedType == Schema.DisplayType.TextArea ||
                relatedType == Schema.DisplayType.Phone ||
                relatedType == Schema.DisplayType.Email ||
                relatedType == Schema.DisplayType.Url ||
                relatedType == Schema.DisplayType.Picklist
            ) {
                searchParts.add(localField + ' LIKE \'%' + escaped + '%\'');
            }
        }

        return searchParts.isEmpty() ? null : '(' + String.join(searchParts, ' OR ') + ')';
    }
    private static String normalizeFilterCriteria(String objectApiName, String filterCriteria) {
        if (String.isBlank(filterCriteria)) {
            return filterCriteria;
        }

        Map<String, Schema.SObjectField> fieldMap =
            Schema.getGlobalDescribe().get(objectApiName).getDescribe().fields.getMap();

        List<String> normalizedClauses = new List<String>();

        for (String rawClause : splitByAnd(filterCriteria)) {
            String clause = rawClause == null ? null : rawClause.trim();
            if (String.isBlank(clause)) {
                continue;
            }

            normalizedClauses.add(normalizeSingleClause(objectApiName, fieldMap, clause));
        }

        return String.join(normalizedClauses, ' AND ');
    }
    private static List<String> splitByAnd(String filterCriteria) {
        return filterCriteria.split('(?i)\\s+AND\\s+');
    }
    private static String normalizeSingleClause(
        String objectApiName,
        Map<String, Schema.SObjectField> fieldMap,
        String clause
    ) {
        Pattern p = Pattern.compile(
            '(?i)^([A-Za-z0-9_\\.]+)\\s*(NOT_CONTAIN|NOT IN|LIKE|IN|!=|>=|<=|=|>|<)\\s*(.+)$'
        );

        Matcher m = p.matcher(clause);

        if (!m.matches()) {
            return clause;
        }

        String fieldPath = m.group(1);
        String operator = m.group(2).toUpperCase();
        String rawValue = m.group(3) == null ? null : m.group(3).trim();

        String localFieldPath = fieldPath;
        String prefix = objectApiName + '.';

        if (localFieldPath.startsWith(prefix)) {
            localFieldPath = localFieldPath.substring(prefix.length());
        }

        if (localFieldPath.contains('.')) {
            return clause;
        }

        Schema.SObjectField fld = fieldMap.get(localFieldPath);

        if (fld == null) {
            return clause;
        }

        Schema.DescribeFieldResult dfr = fld.getDescribe();
        Schema.DisplayType fieldType = dfr.getType();

        // Salesforce UI API "NotContain" has no direct SOQL equivalent.
        // For picklists, convert it to an IN clause containing every
        // picklist value that does NOT contain the requested text.
        if (operator == 'NOT_CONTAIN') {
            if (fieldType != Schema.DisplayType.Picklist) {
                throw new AuraHandledException(
                    'NOT_CONTAIN is currently supported only for picklist fields: ' +
                    localFieldPath
                );
            }

            String searchValue = stripQuotes(rawValue).toLowerCase();

            List<String> allowedValues = new List<String>();

            for (Schema.PicklistEntry entry : dfr.getPicklistValues()) {
                if (
                    entry.isActive() &&
                    !entry.getValue().toLowerCase().contains(searchValue)
                ) {
                    allowedValues.add(
                        '\'' + String.escapeSingleQuotes(entry.getValue()) + '\''
                    );
                }
            }

            if (allowedValues.isEmpty()) {
                return localFieldPath + ' = NULL';
            }

            return localFieldPath + ' IN (' +
                String.join(allowedValues, ', ') +
                ')';
        }

        if (operator == 'IN' || operator == 'NOT IN') {
            return localFieldPath + ' ' + operator + ' ' +
                normalizeInList(dfr, rawValue);
        }

        Boolean isRangeComparison =
            operator == '>' ||
            operator == '>=' ||
            operator == '<' ||
            operator == '<=';

        Boolean shouldExcludeNulls =
            isRangeComparison && (
                fieldType == Schema.DisplayType.Currency ||
                fieldType == Schema.DisplayType.Double ||
                fieldType == Schema.DisplayType.Integer ||
                fieldType == Schema.DisplayType.Long ||
                fieldType == Schema.DisplayType.Percent ||
                fieldType == Schema.DisplayType.Date ||
                fieldType == Schema.DisplayType.DateTime
            );

        String normalizedLiteral =
            normalizeLiteralForField(dfr, rawValue);

        if (shouldExcludeNulls) {
            return '(' +
                localFieldPath + ' != NULL AND ' +
                localFieldPath + ' ' + operator + ' ' + normalizedLiteral +
                ')';
        }

        return localFieldPath + ' ' + operator + ' ' + normalizedLiteral;
    }

    private static String stripQuotes(String value) {
        if (String.isBlank(value)) {
            return '';
        }

        value = value.trim();

        if (
            value.length() >= 2 &&
            value.startsWith('\'') &&
            value.endsWith('\'')
        ) {
            return value.substring(1, value.length() - 1);
        }

        return value;
    }
    private static String normalizeInList(Schema.DescribeFieldResult dfr, String rawValue) {
        String trimmed = rawValue == null ? null : rawValue.trim();
        if (String.isBlank(trimmed)) {
            return rawValue;
        }

        if (!trimmed.startsWith('(') || !trimmed.endsWith(')')) {
            return rawValue;
        }

        String innerVal = trimmed.substring(1, trimmed.length() - 1);
        List<String> parts = splitCommaRespectingQuotes(innerVal);
        List<String> normalized = new List<String>();

        for (String part : parts) {
            normalized.add(normalizeLiteralForField(dfr, part));
        }

        return '(' + String.join(normalized, ', ') + ')';
    }
    private static List<String> splitCommaRespectingQuotes(String input) {
        List<String> out = new List<String>();
        if (input == null) {
            return out;
        }

        String current = '';
        Boolean inQuotes = false;

        for (Integer i = 0; i < input.length(); i++) {
            String ch = input.substring(i, i + 1);

            if (ch == '\'') {
                inQuotes = !inQuotes;
                current += ch;
            } else if (ch == ',' && !inQuotes) {
                out.add(current.trim());
                current = '';
            } else {
                current += ch;
            }
        }

        if (!String.isBlank(current)) {
            out.add(current.trim());
        }

        return out;
    }
    private static String normalizeLiteralForField(Schema.DescribeFieldResult dfr, String rawValue) {
        if (String.isBlank(rawValue)) {
            return 'NULL';
        }

        String cleaned = rawValue.trim().replace('"', '').replace('\'', '').trim();

        if (String.isBlank(cleaned) || cleaned.equalsIgnoreCase('null')) {
            return 'NULL';
        }

        Schema.DisplayType t = dfr.getType();

        if (
            t == Schema.DisplayType.Currency ||
            t == Schema.DisplayType.Double ||
            t == Schema.DisplayType.Integer ||
            t == Schema.DisplayType.Long ||
            t == Schema.DisplayType.Percent
        ) {
            String numeric = cleaned.replace(',', '');
            Decimal val = Decimal.valueOf(numeric);
            return String.valueOf(val);
        }

        if (t == Schema.DisplayType.Boolean) {
            return cleaned.toLowerCase() == 'true' ? 'TRUE' : 'FALSE';
        }

        if (t == Schema.DisplayType.Date) {
            String upper = cleaned.toUpperCase().replace(' ', '_');

            if (isSoqlDateLiteral(upper)) {
                return upper;
            }

            Date dt = Date.valueOf(cleaned);
            return String.valueOf(dt);
        }


        if (t == Schema.DisplayType.DateTime) {
            String upper = cleaned.toUpperCase().replace(' ', '_');
            if (isSoqlDateLiteral(upper)) {
                return upper;
            }

            Datetime dtm = Datetime.valueOfGmt(cleaned.replace('T', ' ').replace('Z', ''));
            return '\'' + String.valueOf(dtm) + '\'';
        }


        return '\'' + String.escapeSingleQuotes(cleaned) + '\'';
    }
    private static Boolean isSoqlDateLiteral(String val) {
        if (String.isBlank(val)) {
            return false;
        }

        String upperVal = val.trim().toUpperCase();

        Set<String> simpleLiterals = new Set<String>{
            'YESTERDAY',
            'TODAY',
            'TOMORROW',
            'LAST_WEEK',
            'THIS_WEEK',
            'NEXT_WEEK',
            'LAST_MONTH',
            'THIS_MONTH',
            'NEXT_MONTH',
            'LAST_90_DAYS',
            'NEXT_90_DAYS',
            'LAST_N_DAYS',
            'NEXT_N_DAYS',
            'N_DAYS_AGO',
            'NEXT_N_WEEKS',
            'LAST_N_WEEKS',
            'N_WEEKS_AGO',
            'NEXT_N_MONTHS',
            'LAST_N_MONTHS',
            'N_MONTHS_AGO',
            'THIS_QUARTER',
            'LAST_QUARTER',
            'NEXT_QUARTER',
            'NEXT_N_QUARTERS',
            'LAST_N_QUARTERS',
            'THIS_YEAR',
            'LAST_YEAR',
            'NEXT_YEAR',
            'NEXT_N_YEARS',
            'LAST_N_YEARS',
            'N_YEARS_AGO',
            'THIS_FISCAL_QUARTER',
            'LAST_FISCAL_QUARTER',
            'NEXT_FISCAL_QUARTER',
            'THIS_FISCAL_YEAR',
            'LAST_FISCAL_YEAR',
            'NEXT_FISCAL_YEAR'
        };

        if (simpleLiterals.contains(upperVal)) {
            return true;
        }

        return upperVal.startsWith('LAST_N_DAYS:') ||
            upperVal.startsWith('NEXT_N_DAYS:') ||
            upperVal.startsWith('N_DAYS_AGO:') ||
            upperVal.startsWith('LAST_N_WEEKS:') ||
            upperVal.startsWith('NEXT_N_WEEKS:') ||
            upperVal.startsWith('N_WEEKS_AGO:') ||
            upperVal.startsWith('LAST_N_MONTHS:') ||
            upperVal.startsWith('NEXT_N_MONTHS:') ||
            upperVal.startsWith('N_MONTHS_AGO:') ||
            upperVal.startsWith('LAST_N_QUARTERS:') ||
            upperVal.startsWith('NEXT_N_QUARTERS:') ||
            upperVal.startsWith('LAST_N_YEARS:') ||
            upperVal.startsWith('NEXT_N_YEARS:') ||
            upperVal.startsWith('N_YEARS_AGO:');
    }
    private static List<RecordDto> mapRecords(
        String objectApiName,
        List<sObject> rows,
        List<String> requestedFields,
        Boolean hasRecordTypes,
        List<Map<String, Object>> childRelationConfigs
    ) {
        List<RecordDto> out = new List<RecordDto>();

        for (sObject sob : rows) {
            RecordDto rd = new RecordDto();
            rd.id = (String) sob.get('Id');
            rd.fields = new Map<String, FieldValueDto>();
            rd.recordTypeId = hasRecordTypes ? (String) sob.get('RecordTypeId') : null;

            Map<String, RelatedRecordDto> relationshipDtos = new Map<String, RelatedRecordDto>();

            for (String fq : requestedFields) {
                if (!fq.startsWith(objectApiName + '.')) {
                    continue;
                }

                String rel = fq.substring((objectApiName + '.').length());

                if (rel.contains('.')) {
                    List<String> parts = rel.split('\\.');
                    if (parts.size() == 2) {
                        String relationshipName = parts[0];
                        String childFieldName = parts[1];

                        sObject parentRec = sob.getSObject(relationshipName);
                        if (parentRec == null) {
                            continue;
                        }

                        RelatedRecordDto relatedDto = relationshipDtos.get(relationshipName);

                        if (relatedDto == null) {
                            relatedDto = new RelatedRecordDto();
                            relatedDto.apiName = String.valueOf(parentRec.getSObjectType());
                            relatedDto.id = (String) parentRec.get('Id');
                            relatedDto.fields = new Map<String, FieldValueDto>();
                            relationshipDtos.put(relationshipName, relatedDto);
                        }

                        Object childValue = parentRec.get(childFieldName);
                        Object childDisplayValue = null;

                        relatedDto.fields.put(
                            childFieldName,
                            new FieldValueDto(childValue, childDisplayValue)
                        );

                        Object relationshipDisplayValue = null;
                        if (relatedDto.fields.containsKey('Name')) {
                            relationshipDisplayValue = relatedDto.fields.get('Name').value;
                        }

                        rd.fields.put(
                            relationshipName,
                            new FieldValueDto(relatedDto, relationshipDisplayValue)
                        );
                    }
                } else {
                    Object value = sob.get(rel);
                    Object displayVal = null;

                    if (rel == 'Name') {
                        displayVal = value;
                    }

                    rd.fields.put(rel, new FieldValueDto(value, displayVal));
                }
            }


            if (childRelationConfigs != null && !childRelationConfigs.isEmpty()) {
                for (Map<String, Object> relConfig : childRelationConfigs) {
                    String relationName = (String) relConfig.get('relationName');
                    if (String.isBlank(relationName)) {
                        continue;
                    }

                    List<SObject> childRows = sob.getSObjects(relationName);
                    List<Object> columns = (List<Object>) relConfig.get('columns');

                    if (columns == null || columns.isEmpty()) {
                        continue;
                    }

                    for (Object colObj : columns) {
                        Map<String, Object> col = (Map<String, Object>) colObj;

                        String columnLabel = (String) col.get('columnLabel');
                        String fieldToUse = String.isBlank((String) col.get('childFieldApiName'))
                            ? 'Name'
                            : (String) col.get('childFieldApiName');
                        String condition = (String) col.get('condition');

                        SObject matchedRow = null;

                        if (childRows != null && !childRows.isEmpty()) {
                            for (SObject childRow : childRows) {
                                if (matchesChildCondition(childRow, condition)) {
                                    matchedRow = childRow;
                                    break;
                                }
                            }
                        }

                        if (matchedRow != null) {
                            Object val = matchedRow.get(fieldToUse);

                            Map<String, Object> childMini = new Map<String, Object>{
                                'id' => (String) matchedRow.get('Id'),
                                fieldToUse => val
                            };

                            rd.fields.put(
                                columnLabel,
                                new FieldValueDto(childMini, val)
                            );
                        } else {
                            rd.fields.put(
                                columnLabel,
                                new FieldValueDto(null, null)
                            );
                        }
                    }
                }
            }

            out.add(rd);
        }

        return out;
    }


    private static Boolean matchesChildCondition(SObject childRow, String condition) {
        if (String.isBlank(condition)) {
            return true;
        }

        Matcher m = Pattern.compile('^([A-Za-z0-9_.]+)\\s*=\\s*[\'"]?(.*?)[\'"]?$').matcher(condition.trim());
        if (!m.matches()) {
            return false;
        }

        String fieldName = m.group(1);
        String expectedValue = m.group(2);

        Object actualValue = childRow.get(fieldName);
        return String.valueOf(actualValue) == expectedValue;
    }
}