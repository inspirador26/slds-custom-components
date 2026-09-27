import {
    getErrorMessage,
    getCleanMetaDataLabels,
} from 'c/utils';


export function hasNoListViewRecs(cmp, pageToken, records, searchTerm) {
    try {
        if (!searchTerm && pageToken === 0 && !records?.length) {
            cmp._isLoading = false;
            return true;
        }
        return false;
    } catch(error) {
        cmp.showToast('Error in hasNoListViewRecs() of sfListApiLwc.helpers.js', getErrorMessage(error), 'error');
    }
}

const TODAY_LOCAL = (() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
})();

const YEAR_NOW = (() => {
    const d = new Date();
    return d.getFullYear();
})();

function formatMonthYear(date) {
    return date.toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric'
    });
}

const NEXT_MONTH_LOCAL = (() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 1);
})();

const THIS_MONTH_LOCAL = (() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
})();


// ------ Build Help text with filter info for no data scenario ------ \\
const OPERATORS_MAP = {
    Equals: 'equals',
    NotEqual: 'not equals',
    LessThan: 'less than',
    GreaterThan: 'greater than',
    GreaterOrEqual: 'greater or equal to',
    LessOrEqual: 'less or equal to',
};
function getOperandLabel(operand) {
    switch(operand) {
        case 'THIS YEAR':
            return YEAR_NOW; 
        case 'TODAY':
            return TODAY_LOCAL.toLocaleDateString();
        case 'NEXT MONTH':
            return formatMonthYear(NEXT_MONTH_LOCAL);
        case 'THIS MONTH': 
            return formatMonthYear(THIS_MONTH_LOCAL);
        case '0':
            return 'False';
        case '1':
            return 'True'; 
        default:
            return operand;
    }
}
// ------------------------------------------------------------------- \\


// Get metadata for the current selected list view
export function getSelectedMeta(selectedListViewApiName, listViewMeta) {
    if (!selectedListViewApiName || !listViewMeta?.length) return;
    return listViewMeta.find(meta => 
        meta?.result?.listReference?.listViewApiName === selectedListViewApiName
    )?.result;
}
// Columns for the Table Child
export function prepareProductionColumns(tableColumns, childRelationColumnObj, isSfListView = false) {
    const childConfigs = Array.isArray(childRelationColumnObj)
        ? childRelationColumnObj
        : [];

    const childFields = childConfigs.flatMap(rel => {
        const cols = Array.isArray(rel?.columns) ? rel.columns : [];

        return cols.map(relCol => ({
            fieldName: relCol.columnLabel,
            label: relCol.columnLabel,
            dtype: relCol.dtype ?? 'reference',
            objectApiName: rel.childObjectApiName,
            isChildRelation: true,
            editable: false,
            notSortable: true
        }));
    });

    //console.log('here is childFields in prepareProductionColumns() of sfListApiLwc.helpers.js: ', JSON.stringify(childFields));

    if (!isSfListView && childFields.length) {
        return [
            ...tableColumns.map(col => {
                return col.dtype === 'name'
                    ? col
                    : { ...col, dtype: 'text' };
            }),
            ...childFields
        ];
    }

    return tableColumns.map(col => {
        return col.dtype === 'name'
            ? col
            : { ...col, dtype: 'text' };
    });
}
// filter out mru type lists 
// ⚠️ Removed "only show mine" filter
export function filterResponseMrus(listViewMeta) {
    return listViewMeta;
    return listViewMeta?.filter(obj => 
        obj?.result?.listReference?.type !== "mru" &&
        obj?.result?.scope?.apiName === "mine"
    );
}
// Filter out mrus from the list view options combobox 
export function filterOptionMrus(listViewMeta, wiredListViews) {
    return wiredListViews;
    // get all valid list view api names 
    const validApis = listViewMeta?.map(obj => obj?.result?.listReference?.listViewApiName);
    // Filter the List view options retrieved in "Get List Infos By ObjectName"
    return wiredListViews?.filter(lv => validApis.includes(lv?.apiName));
}
// Make label/value array of objects of all list views
export function mapListViewOptions(notMruLists) {
    const listsMapped = notMruLists.map(lv => ({
        label: lv.label,
        value: lv.apiName, // use API name for getListRecordsByName
        id: lv.id
    }));
    
    return [
        {label: 'My List Views', options: listsMapped},
    ]
}

// prepare columns for the wire service query (field names)
function mapDisplayColumns(selectedListViewApiName, listViewMeta) {
    if (!selectedListViewApiName || !listViewMeta?.length) return [];

    const selectedListViewMeta = getSelectedMeta(selectedListViewApiName, listViewMeta);


    if (selectedListViewMeta?.displayColumns?.length) {
        return selectedListViewMeta.displayColumns.map(col => {
            const lookup = col.lookupId;
            const hasDot = col.fieldApiName.includes('.');
            const isRt = col.fieldApiName.toLowerCase().includes('recordtype');
            const dtype = lookup && lookup === 'Id' ? 'name' 
                : col.lookupId && !isRt ? 'reference' 
                : col.fieldApiName === 'IsUnreadByOwner' ? 'boolean'
                : 'text';


            return {
                fieldName: isRt ? 'RecordTypeId' : hasDot ? lookup : col.fieldApiName, 
                label: col.label,
                fieldRef: col.fieldApiName.includes('.')
                    ? col.fieldApiName.split('.')[0]
                    : col.fieldApiName,
                dtype, 
                editable: !isRt && dtype !== 'boolean'
            };
        });
    }

    return [];
}
// Build filter by info for the Table Child's page header
function handleFilterByInfo(selectedListViewApiName, listViewMeta) {
    if (!selectedListViewApiName || !listViewMeta?.length) return null;

    const selectedListViewMeta = getSelectedMeta(selectedListViewApiName, listViewMeta);

    if (!selectedListViewMeta?.filteredByInfo?.length) {
        return null;
    }
    
    const labels = selectedListViewMeta.filteredByInfo.map(filter => filter.label);
    return `${labels.join(', ')}`;
}
function cleanSortFieldApiName(fieldApiName) {
    if (!fieldApiName) return null;
    if (fieldApiName?.includes('.')) {
        const parts = fieldApiName.split('.');
        return getCleanMetaDataLabels(parts[parts?.length -1]);
    }
    return getCleanMetaDataLabels(fieldApiName);
}
function handleSortedByInfoNew(selectedListViewApiName, listViewMeta) {
    if (!selectedListViewApiName || !listViewMeta?.length) return '';

    const selectedListViewMeta = getSelectedMeta(selectedListViewApiName, listViewMeta);

    if (!selectedListViewMeta?.orderedByInfo?.length) {
        return '';
    }
    
    const labels = selectedListViewMeta.orderedByInfo.map(obj => obj.label);
    return ` • Sorted by  ${labels.join(', ')}`;
}
function handleSortedCol(selectedListViewApiName, listViewMeta) {
    if (!selectedListViewApiName || !listViewMeta?.length) return '';

    const selectedListViewMeta = getSelectedMeta(selectedListViewApiName, listViewMeta);

    if (!selectedListViewMeta?.orderedByInfo?.length) {
        return '';
    }
    
    const orderedByFirst = selectedListViewMeta.orderedByInfo?.[0];
    //console.log('here is orderedByFirst in handleSortedCol() of sfListApiLwc: ', JSON.stringify(orderedByFirst));

    if (!orderedByFirst) {
        return null;
    }

    return {
        fieldName: orderedByFirst.fieldApiName,
        label: orderedByFirst.label,
        type: orderedByFirst.isAscending ? 'asc' : 'desc'
    }

}
// Build sorted by info for the Child Table's page header
export function handleSortedByInfo(cmp) {
    try {
        const sortBy = cmp?.sortBy ?? [];
        if (!sortBy) {
            return '';
        }
        
        if (Array.isArray(sortBy) && sortBy?.length) {
            const newSort = ` • Sorted by ${sortBy.map(obj => cleanSortFieldApiName(obj.fieldApiName)).join(', ')}`;
            return newSort;
        }
        if (typeof sortBy === 'object') {
            const newSort = ` • Sorted by ${cleanSortFieldApiName(sortBy?.fieldApiName)}`;
            return newSort;
        }
        return '';
    } catch(error) {
        this.showToast('Error in handleSortedByInfo() of sfListApi2.helpers.js', getErrorMessage(error), 'error');
    }
}
// Build Item Count for the Child Table's page header
export function handleItemCount(records, pageTokens) {
    if (!records?.length) return '0';
    const nextDisabled = pageTokens?.nextDisabled;
    return `${records.length}${nextDisabled ? '' : '+'}`;
}

// Build Help text with filter info for no data scenario
function getAdditionalHelpText(selectedListViewApiName, listViewMeta, pluralLabel) {
    if (!selectedListViewApiName || !listViewMeta?.length) return null;

    const selectedListViewMeta = getSelectedMeta(selectedListViewApiName, listViewMeta);

    if (!selectedListViewMeta?.filteredByInfo?.length) {
        return null;
    }   
    const helpArr = selectedListViewMeta.filteredByInfo?.map(info => {
        const fieldLabel = info.label;
        const operator = OPERATORS_MAP[info.operator];
        const operandLabels = info.operandLabels?.map(oper => getOperandLabel(oper))
            ?.filter(Boolean)
            ?.join(', ')
            ?? null;

        if (!operandLabels) return fieldLabel
        return `${fieldLabel} ${operator} ${operandLabels}`;
    })?.filter(Boolean);

    if (!helpArr?.length) {
        return `No ${pluralLabel} matched the filter criteria`;
    }
    return `No ${pluralLabel} matching filters: ${helpArr.join(' • ')}`
}

export function updatePageTokens(response) {
    const currentPageToken = response?.currentPageToken;
    const nextPageToken = response?.nextPageToken;
    const previousPageToken = response?.previousPageToken;
    const nextDisabled = !nextPageToken;
    const prevDisabled = !previousPageToken;

    return {
        currentPageToken,
        nextPageToken,
        previousPageToken,
        nextDisabled,
        prevDisabled,
    }
}


// Get page header meta of selected list view
export function retrieveSelectedListViewMeta(cmp, selectedListView) {
    try {
        if (!selectedListView) return;  

        // Get the fields for the list view 
        cmp.tableColumns = mapDisplayColumns(selectedListView, cmp.listViewMeta);
        // Assign selected list view
        cmp.selectedListViewApiName = selectedListView; 

        // Add list view meta for the list view header
        cmp.tableHeaderConfig = {
            ...cmp.tableHeaderConfig,
            selectedListView: selectedListView,
            filteredByInfo: handleFilterByInfo(selectedListView, cmp.listViewMeta),
            sortedByInfo: handleSortedByInfoNew(selectedListView, cmp.listViewMeta),
            sortedCol: handleSortedCol(selectedListView, cmp.listViewMeta)
        }

        // Get the meta from getListInfosByName api response of the current list view
        cmp.selectedListViewInfos = cmp.listViewMeta.find(lv => 
            lv?.result?.listReference?.listViewApiName === cmp.selectedListViewApiName
        )?.result;
        console.log('here is selectedListViewMeta in retrieveSelectedListViewMeta() of sfListApiLwc.helpers.js: ', cmp.selectedListViewInfos);
        // Retrieve "no records" message
        cmp.noDataHelp = getAdditionalHelpText(selectedListView, cmp.listViewMeta, cmp.pluralLabel);
        
    } catch(error) {
        cmp.showToast('Error in retrieveSelectedListViewMeta() of sfListApiLwc.js', getErrorMessage(error), 'error');
    }
}


// ========================= Build Order By Info for Apex ========================== \\
export function getDefaultSortBy(selectedListViewApiName, listViewMeta) {
    const selectedListViewMeta = getSelectedMeta(selectedListViewApiName, listViewMeta);
    const orderedByInfo = selectedListViewMeta?.result?.orderedByInfo
        ?? selectedListViewMeta?.orderedByInfo 
        ?? [];

    if (!orderedByInfo?.length) {
        return [];
    }

    const sort = orderedByInfo.map(obj => {
        return {
            fieldApiName: obj.fieldApiName,
            direction: obj.isAscending ? 'ASC' : 'DESC', 
            nullsPreference: 'LAST'
        }
    });
    return sort;
}
// ================================================================================= \\


// ========================== Build Filter Query for Apex ========================== \\
// --MAIN-- build the SOQL query
export function buildSoqlFilter(cmp) {
    try {
        if (!cmp?.selectedListViewApiName || !cmp?.listViewMeta) return '';
        const selectedListViewMeta = getSelectedMeta(cmp.selectedListViewApiName, cmp.listViewMeta);
        const filteredByInfo = selectedListViewMeta?.filteredByInfo;
        const scope = selectedListViewMeta?.scope;

        const hasOwnerFilter = scope?.apiName === 'mine';
        console.log('here is filteredByInfo in buildSoqlFilter() of sfListApiLwc.js: ', JSON.stringify(filteredByInfo));
        if ((!Array.isArray(filteredByInfo) || !filteredByInfo.length) && !hasOwnerFilter) {
            return '';
        }



        let filters = (Array.isArray(filteredByInfo) ? filteredByInfo : [])
            .map(buildClause)
            .filter(Boolean)
            .join(' AND ');

        
        if (cmp._waitObjectApiName === 'Lead') {
            const leadClause = 'IsConverted = FALSE';
            filters = filters ? `${filters} AND ${leadClause}` : leadClause;
            console.log('cmp._waitObjectApiName is LEAD, applying new logic.  Here are filters: ', filters);
        }

        if (hasOwnerFilter) {
            const ownerClause = `OwnerId = '${cmp._userId}'`;
            return filters ? `${filters} AND ${ownerClause}` : ownerClause;
        }

        return filters;
    } catch(error) {
        cmp.showToast('Error in buildSoqlFilter() of sfListApi2.helpers.js', getErrorMessage(error), 'error');
    }
}
const OPERATOR_TO_SOQL = {
    Contains: 'LIKE',
    Excludes: 'EXCLUDES',
    GreaterOrEqual: '>=',
    GreaterThan: '>',
    Includes: 'INCLUDES',
    LessOrEqual: '<=',
    LessThan: '<',
    StartsWith: 'LIKE'
};
const DATE_LITERALS = new Set([
    'YESTERDAY', 'TODAY', 'TOMORROW',
    'LAST WEEK', 'THIS WEEK', 'NEXT WEEK',
    'LAST MONTH', 'THIS MONTH', 'NEXT MONTH',
    'LAST 90 DAYS', 'NEXT 90 DAYS',
    'THIS QUARTER', 'LAST QUARTER', 'NEXT QUARTER',
    'THIS YEAR', 'LAST YEAR', 'NEXT YEAR',
    'THIS FISCAL QUARTER', 'LAST FISCAL QUARTER', 'NEXT FISCAL QUARTER',
    'THIS FISCAL YEAR', 'LAST FISCAL YEAR', 'NEXT FISCAL YEAR'
]);
function buildClause(filter) {
    const fieldApiName = filter?.fieldApiName;
    const operator = filter?.operator;
    const operandLabels = Array.isArray(filter?.operandLabels)
        ? filter.operandLabels.filter((val) => val !== null && val !== undefined && String(val).trim() !== '')
        : [];

    if (!fieldApiName || !operator || !operandLabels.length) {
        return '';
    }

    if (operator === 'Equals') {
        if (operandLabels.length === 1) {
            return `${fieldApiName} = ${formatValue(operandLabels[0])}`;
        }
        return `${fieldApiName} IN (${operandLabels.map(formatValue).join(', ')})`;
    }

    if (operator === 'NotEqual') {
        if (operandLabels.length === 1) {
            return `${fieldApiName} != ${formatValue(operandLabels[0])}`;
        }
        return `${fieldApiName} NOT IN (${operandLabels.map(formatValue).join(', ')})`;
    }

    if (operator === 'Contains') {
        return `${fieldApiName} LIKE ${quote('%' + escapeSoqlLike(operandLabels[0]) + '%')}`;
    }
    if (operator === 'NotContain') {
        return `${fieldApiName} NOT_CONTAIN ${formatValue(operandLabels[0])}`;
    }

    if (operator === 'StartsWith') {
        return `${fieldApiName} LIKE ${quote(escapeSoqlLike(operandLabels[0]) + '%')}`;
    }

    if (operator === 'Includes' || operator === 'Excludes') {
        return `${fieldApiName} ${OPERATOR_TO_SOQL[operator]} (${operandLabels.map(formatValue).join(', ')})`;
    }

    if (operator === 'Within') {
        if (operandLabels.length === 1) {
            return `${fieldApiName} = ${formatValue(operandLabels[0])}`;
        }
        return `${fieldApiName} IN (${operandLabels.map(formatValue).join(', ')})`;
    }

    if (OPERATOR_TO_SOQL[operator]) {
        return `${fieldApiName} ${OPERATOR_TO_SOQL[operator]} ${formatValue(operandLabels[0])}`;
    }

    throw new Error(`Unsupported operator: ${operator}`);
}
function formatValue(value) {
    if (value === null || value === undefined) {
        return 'NULL';
    }

    const raw = String(value).trim();
    const upper = raw.toUpperCase();

    if (DATE_LITERALS.has(upper)) {
        return upper;
    }
    if (raw === '0') {
        return 'FALSE';
    }
    if (raw === '1') {
        return 'TRUE';
    }

    if (upper === 'TRUE' || upper === 'FALSE') {
        return upper.toLowerCase();
    }

    if (/^-?\d+(\.\d+)?$/.test(raw)) {
        return raw;
    }

    return quote(raw);
}
function quote(value) {
    return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}
function escapeSoqlLike(value) {
    return String(value)
        .replace(/\\/g, '\\\\')
        .replace(/%/g, '\\%')
        .replace(/_/g, '\\_')
        .replace(/'/g, "\\'");
}
// ================================================================================= \\