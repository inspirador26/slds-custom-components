// ★ How to user Where clause in getListRecordsByName()
/* 1 Argument: 
    {
        and: [
            { StageName: {eq: "Prospecting"} }
        ]
    }
*/
/* 2 Arguments:
    { 
        and: [ 
            { StageName: { eq: "Prospecting" } },
            { 
                Account: { 
                    Name: { eq: "Dickenson plc" } 
                }   
            } 
        ] 
    }
*/




import { LightningElement, wire, api } from 'lwc';
import { 
    getListInfosByObjectName, 
    getListRecordsByName, 
    getListInfosByName 
} from 'lightning/uiListsApi';

import { refreshApex } from '@salesforce/apex';
import userId from '@salesforce/user/Id';
import fetchUserDisplaySettingsByField from '@salesforce/apex/UserDisplaySettingsController.fetchUserDisplaySettingsByField';
import saveUserDisplaySettings from '@salesforce/apex/UserDisplaySettingsController.saveUserDisplaySettings';

import { 
    getErrorMessage, 
    IS_SF_ID,  
    isCommunitySetting,
    toPlain,
    publicPropertyToBool,
} from 'c/utils';

import {
    getSelectedMeta,
    prepareProductionColumns,
    filterResponseMrus,
    filterOptionMrus,
    mapListViewOptions,
    handleItemCount,
    updatePageTokens,
    retrieveSelectedListViewMeta,
    getDefaultSortBy,
    buildSoqlFilter,
    handleSortedByInfo,
    hasNoListViewRecs,
} from './helpers';

import getListRecords from '@salesforce/apex/UiApiLikeListController.getListRecords';


const GET_PAGE_LOAD_TIMEOUT = (pageSize) => {
    if (pageSize >= 250) {
        return 12000;
    }
    if (pageSize >= 100) {
        return 9000
    }
    return 6000;
}

import COLUMN_WIDTHS_ALL_JSON_FIELD from "@salesforce/schema/User_Display_Settings__c.Column_Widths_All_JSON__c";
import PAGE_SIZE_ALL_JSON from "@salesforce/schema/User_Display_Settings__c.Page_Size_All_JSON__c";
import DEFAULT_LIST_VIEWS_JSON_FIELD from "@salesforce/schema/User_Display_Settings__c.Default_List_Views_JSON__c";


import LEAD_OBJECT from "@salesforce/schema/Lead";

let KEY_ID = 120;

function removeCustomAppendation(s) {
    if (!s) return '';

    return s?.endsWith('__c')
        ? s?.slice(0, -3)
        : s;
}
function parseJsonResponse(response) {
    return (typeof response === 'string' && response)
        ? JSON.parse(response)
        : (response || {});
}
const DEFAULT_VIEW_BY_OBJECT_API_NAME = {};




// ======================== Handle UI Arguments ======================== \\
function parseJsonProperty(val) {
    try {
        if (val == null) {
            return {};
        }

        if (typeof val !== 'string') {
            return val;
        }

        const trimmed = val.trim();
        if (!trimmed) {
            return {};
        }

        const first = JSON.parse(trimmed);

        return typeof first === 'string'
            ? JSON.parse(first)
            : first;

    } catch (e) {
        console.error('Invalid config JSON', e);
        return {};
    }
}


const SEND_CHECKED_APEX_METHODS = {
};


function normalizeChildRelationCondition(condition) {
    const raw = String(condition || '').trim();

    const match = raw.match(/^([A-Za-z0-9_.]+)\s*=\s*(.+)$/);
    if (!match) {
        return raw;
    }

    const fieldName = match[1];
    let fieldValue = match[2].trim();

    if (
        (fieldValue.startsWith("'") && fieldValue.endsWith("'")) ||
        (fieldValue.startsWith('"') && fieldValue.endsWith('"'))
    ) {
        fieldValue = fieldValue.slice(1, -1);
    }

    return fieldName + ' = \'' + fieldValue.replace(/'/g, "\\'") + '\'';
}
// ===================================================================== \\ 

export default class SfListApiLwc extends LightningElement {
    _listByNameQueryArr = undefined;
    _isNewListView = false;
    _userId = userId;

    _objectLoaded = false;
    
    _isCommunity = isCommunitySetting();

    modalConfig = {};

    listViews = [];
    listViewMeta = [];
    records = [];
    
    selectedListViewApiName;
    tableColumns = [];
    productionColumns = [];

    // ===================== Page Header Properties ===================== \\
    tableHeaderConfig = {
        filteredByInfo: null,
        sortedByInfo: null,
        selectedListView: null,
        listViewOptions: [],
        itemCount: 0,
        pageSize: this.pageSize,
        sendCheckedLabel: null,
    }
    // ================================================================== \\
    @api hasFilters = false;
    @api filters = null;
    @api waitToRender = false;

    @api 
    set adminDefaultListView(val) {
        this._adminDefaultListView = val;
    }
    get adminDefaultListView() {
        return this._adminDefaultListView;
    }
    
    @api pluralLabel;
    @api objectLabel;    
    pageSize = 10;

    _userPageSizeField;
    _defaultListViewApiName;
    @api 
    set objectApiName(val) {
        this._objectApiName = val;
        if (val) {
            if (this._defaultListViews && !this.adminDefaultListView) {
                this._defaultListViewApiName = this._defaultListViews?.[val];
            } 
            this._userPageSizeField = PAGE_SIZE_ALL_JSON.fieldApiName;
        }
    }
    get objectApiName() {
        return this._objectApiName;
    }

    @api isTight = false;


    _childRelationColumnObj;
    @api
    set childRelationColumn(val) {
        this._childRelationColumn = null;
        this._childRelationColumnObj = null;

        if (val == null || val === '') return;

        //console.log('here is raw val in set childRelationColumn(): ', val);

        try {
            const parsed = typeof val === 'string'
                ? JSON.parse(val.trim())
                : val;

            const arr = Array.isArray(parsed) ? parsed : [parsed];

            const normalized = arr.map(rel => {
                const cols = Array.isArray(rel?.columns) ? rel.columns : [];

                return {
                    ...rel,
                    columns: cols.map(col => {
                        return {
                            ...col,
                            childFieldApiName: col?.childFieldApiName || 'Name',
                            condition: col?.condition
                                ? normalizeChildRelationCondition(col.condition)
                                : col?.condition
                        };
                    })
                };
            });

            this._childRelationColumn = normalized;
            this._childRelationColumnObj = normalized;

        } catch (error) {
            this.showToast(
                'Error in set childRelationColumn() of sfListApiLwc.js',
                getErrorMessage(error),
                'error'
            );
        }
    }
    get childRelationColumn() {
        return this._childRelationColumn?.length
            ? JSON.stringify(this._childRelationColumn)
            : null;
    }

    @api 
    set borderRadius(val) {
        this._borderRadius = val;
        if (val) {
            this._applyVarsDirect('--c-table-border-radius', val);
        }
    }
    get borderRadius() {
        return this._borderRadius ?? 'var(--slds-g-radius-border-3, 0.75rem)';
    }

    @api 
    set sendCheckedConfig(val) {
        this._didCheck = false;
        if (val) {
            const parsed = parseJsonProperty(val);
            const label = parsed?.label ?? null;

            this._sendCheckedConfig = {
                label: parsed.label || '',
                apexMethod: parsed.apexMethod || '',
                successMsg: parsed.successMsg || ''
            };

            if (SEND_CHECKED_APEX_METHODS[parsed.apexMethod]) {
                this.tableHeaderConfig = {
                    ...this.tableHeaderConfig,
                    sendCheckedLabel: label
                };
            }
            return;
        }

        this._sendCheckedConfig = null;
    }
    get sendCheckedConfig() {
        return this._sendCheckedConfig;
    }
    

    @api 
    set sendCheckedLabel(val) {
        this._sendCheckedLabel = val;
        this.tableHeaderConfig = {
            ...this.tableHeaderConfig,
            sendCheckedLabel: val ?? null
        };

    }
    get sendCheckedLabel() {
        return this._sendCheckedLabel;
    }

    // Display data message if empty records
    noDataHelp; 
    // display help message if not list views
    noListViewHelp;
    // do not initalize wire service until parent says to load
    _waitObjectApiName = undefined;

    // If "Wait to Render" is true, initalize component when parent commands
    @api initialize() {
        try {
            if (this.hasFilters && !this.filters) {
                this.showToast('You specified that this list view has filters but you did not provide any.', 'Fix this before continuing.', 'error');
                return;
            }
            this._objectLoaded = false;
            this._isLoading = true;

            this._waitObjectApiName = this.objectApiName;
            if (this._defaultListViews?.[this._waitObjectApiName]) {
                this.selectedListViewApiName =  this._defaultListViews?.[this._waitObjectApiName];
            } else if (DEFAULT_VIEW_BY_OBJECT_API_NAME?.[this._waitObjectApiName]) {
                this.selectedListViewApiName = DEFAULT_VIEW_BY_OBJECT_API_NAME?.[this._waitObjectApiName];
            }
            this.pageToken = 0;
            this.waitToRender = false;
        } catch(error) {
            this.showToast('Error in initialize() of sfListApiLwc.js', getErrorMessage(error), 'error');
        }
    }

    // Flag when page is loading b/c of page change
    _newPageLoading = false;
    _isDataLoaded = false;
    _isLoading = false;
    _isListViews = true;
    connectedCallback() {
        try {
            if (this.waitToRender) return;
            this._isLoading = true;
            this._waitObjectApiName = this.objectApiName;
        } catch(error) {
            this.showToast('Error in connectedCallback() of sfListApiLwc.js', getErrorMessage(error), 'error');
        }
    }
    disconnectedCallback() {
        window.clearTimeout(this._searchDebounce);
        window.clearTimeout(this._loadTimeoutId);
    }

    // Warn user if apex method not availabled
    _didCheck = false;
    _callBackGuard = {prevMethod: '', cnt: 0};
    renderedCallback() {
        if (
            this.sendCheckedConfig && 
            !SEND_CHECKED_APEX_METHODS[this.sendCheckedConfig?.apexMethod ?? ''] && 
            !this._didCheck
        ) {
            if (
                this.sendCheckedConfig?.apexMethod === this._callBackGuard.prevMethod || 
                this._callBackGuard.cnt >= 7
            ) {
                return;
            }
            this._callBackGuard = {
                prevMethod: this.sendCheckedConfig?.apexMethod ?? '',
                cnt: this._callBackGuard.cnt + 1
            };

            this.showToast(`Apex method "${this.sendCheckedConfig?.apexMethod}" is not imported in sfListApiLwc.js`, 'Please import the Apex Method into sfListApiLwc.js and add the method and parameter name to SEND_CHECKED_APEX_METHODS constant.', 'error');
            this._didCheck = true;
        }
    }

    selectedListViewInfos;

    // Add this reactive property (do not rename your existing ones)
    searchTerm = null;          // value sent to getListRecordsByName
    // Current sort definition(s) for getListRecordsByName: can be an object or an array of objects
    sortBy = [];
    _searchDebounce;          // timer id for debouncing
    async handleSearchTerm(message) {
        const next = message.detail 
            ? message?.detail.toString().trim()
            : null; 

        if (next === this.searchTerm) {
            return;
        }
        this._isLoading = true;

        // Debounce to prevent re-wire on every keystroke
        window.clearTimeout(this._searchDebounce);
        this._searchDebounce = window.setTimeout(() => {
            // Set the reactive param for the wire
            this.searchTerm = next;

            // IMPORTANT: search happens before pagination, so reset paging
            this.pageToken = 0;

            // Optional: if you keep any selection / row-number offsets, reset them here too
            // this._selectedRowIds = new Set();
            // this._currentPageNumber = 1;
        }, 250);
    }


    // Current page number
    pageToken = 0;
    // previous/next token & previous/next disabled tokens
    _pageTokens = {
        currentPageToken: 0,
        nextPageToken: null,
        previousPageToken: null,
        prevDisabled: true,
        nextDisabled: true,
    };
    
    async previousPage() {
        this._isLoading = true;
        this._startLoadCycle();
        await this.handleEditsOnPageChange(this._pageTokens.previousPageToken);
    }
    async nextPage() {
        this._isLoading = true;
        this._startLoadCycle();
        await this.handleEditsOnPageChange(this._pageTokens.nextPageToken);
    }
    async handleEditsOnPageChange(nextToken) {
        try {
            let action = 'changePage';
            this._lastKnownGoodToken = this.pageToken ?? 0;
            this.pageToken = nextToken ?? 0;

            if (this._tableEdited) {
                const isLeave = window.confirm('Unsaved changes will be lost. Continue?');
                action = isLeave ? 'reset' : 'cancel';
            }

            if (action === 'cancel') {
                this._isLoading = false;      
                this._newPageLoading = false; 
                return;
            }

            this._isLoading = true;
            this._newPageLoading = true;

            const tbl = this.template.querySelector('c-slds-table');
            if (tbl) {
                if (action === 'reset') {
                    this._tableEdited = false;
                }
                await tbl.resetTable();                
            }
        } catch(error) {
            this.showToast('Error in handleEditsOnPageChange() of sfListApiLwc.js', getErrorMessage(error), 'error');
            this._isLoading = false;          
            this._newPageLoading = false;     

        }
    }


    _lastKnownGoodToken = 0;
    _loadSeq = 0;
    _loadState = { dataReady: false, uiReady: false };
    _loadTimeoutId;
    _startLoadCycle() {
        this._loadSeq += 1;
        this._loadState = { dataReady: false, uiReady: false };
        this._isLoading = true;

        window.clearTimeout(this._loadTimeoutId);
        const seq = this._loadSeq;

        this._loadTimeoutId = window.setTimeout(() => {
            // Safety: never hang forever
            if (seq === this._loadSeq && this._isLoading) {

                this._isLoading = false;
                this._newPageLoading = false;

                // Roll back to last stable token if available
                if (this._lastKnownGoodToken !== undefined) {
                    this.pageToken = this._lastKnownGoodToken;
                }

                this.showToast(
                    'Page Load Timeout',
                    'This page failed to load. Try going back to the previous page or switching the list view.',
                    'warning',
                );
            }
        }, GET_PAGE_LOAD_TIMEOUT(this.pageSize));

    }
    _finishIfReady() {
        if (this._loadState.dataReady && this._loadState.uiReady) {
            window.clearTimeout(this._loadTimeoutId);
            this._isLoading = false;
            this._objectLoaded = true;
            this._newPageLoading = false;
        }
    }


    handleNewListView() {
        this.modalConfig = {
            header: `New ${this.objectLabel} List View`,
            objectApiName: this._waitObjectApiName
        }
        this._isNewListView = true;
    }
    closeModal() {
        this._isNewListView = false;
    }

    // Handle New List view creation
    justCreated = false;
    async saveListView() {
        try {
            const listCmp = this.template.querySelector('c-new-list-view-lwc');
            if (listCmp) {
                this._isLoading = true;
                const listViewInfo = await listCmp.createListView();
                if (listViewInfo) {
                    this.justCreated = true;
                    await refreshApex(this._wiredListViewsResult);
                    this.showToast('New List view successfully created', '', 'success');
                }
            }
            //this._isNewListView = false;
        } catch(error) {
            this.showToast('Error in saveListView() of sfListApiLwc.js', getErrorMessage(error), 'error');
        } finally {
            this.closeModal();
            this._isLoading = false;
        }
    }


    updatePageSize(message=null, newPageSize=null) {
        try {   
            const pageSize = message.detail ?? newPageSize;
            if (pageSize) {
                const numPageSize = Number(pageSize);
                if (!isNaN(numPageSize)) {
                    this.pageSize = numPageSize;
                }
            }
        } catch(error) {
            this.showToast('Error in updatePageSize() of sfListApiLwc.js', getErrorMessage(error), 'error');
        }
    }
    async refreshPageSize() {   
        this._isLoading = true;
        try {
            await refreshApex(this._wiredUserDisplaySettingsResult);
        } catch(error) {
            this.showToast('Error in refreshPageSize() of sfListApiLwc.js', getErrorMessage(error), 'error');
        }
    }


    get _userDisplayFields() {
        if (!this._waitObjectApiName || !this._userPageSizeField) return undefined;
        return ['Id', this._userPageSizeField, DEFAULT_LIST_VIEWS_JSON_FIELD.fieldApiName];
    }
    _userPageSizeByListView;
    _wiredUserDisplaySettingsResult;
    @wire(fetchUserDisplaySettingsByField, {
        userId: '$_userId',
        fields: '$_userDisplayFields'
    })   
    wiredUserDisplaySettings(result) {
        this._wiredUserDisplaySettingsResult = result;
        const { data, error } = result;
        if (data) {
            try {
                const rawDefaultListView = data?.[DEFAULT_LIST_VIEWS_JSON_FIELD.fieldApiName]   
                    ?? null;
                
                const rawPgSzByLv = data?.[this._userPageSizeField] ?? null;

                this._defaultListViews = parseJsonResponse(rawDefaultListView);
                this._pageSizeByListView = parseJsonResponse(rawPgSzByLv);

                if (!this.selectedListViewApiName) {
                    if (this._defaultListViews && this._defaultListViews?.[this._waitObjectApiName]) {
                        this.selectedListViewApiName = this._defaultListViews[this._waitObjectApiName];
                    } else if(DEFAULT_VIEW_BY_OBJECT_API_NAME?.[this._waitObjectApiName]) {
                        this.selectedListViewApiName = DEFAULT_VIEW_BY_OBJECT_API_NAME[this._waitObjectApiName];
                    }
                }

                this.updatePageSizeByListView();

            } catch(error) {
                this.showToast('Error in parsing in wiredfetchUserDisplaySettings() of sldsTable.js', getErrorMessage(error), 'error');
            }
        } else {
            this._tableConfigsResult = null;
            this._pageSizeByListView = null;
        } 
        if (error) {
            this.showToast('Error in wiredfetchUserDisplaySettings() of sldsTable.js: ', getErrorMessage(error), 'error');
        }
    }
    updatePageSizeByListView() {
        try {
            let wasFound = false;
            if (this.selectedListViewApiName) {
                const match = this._userPageSizeField === PAGE_SIZE_ALL_JSON.fieldApiName
                    ? this._pageSizeByListView?.[this.objectApiName]?.[this.selectedListViewApiName]
                    : this._pageSizeByListView?.[this.selectedListViewApiName];
                    
                if (match) {
                    const pgSz = Number(match);
                    if (!isNaN(pgSz) && this.pageSize !== match) {
                        this.pageSize = pgSz;
                        wasFound = true;
                    }
                }
            }
            if (
                !wasFound && 
                !this._pageSizeByListView?.[this.selectedListViewApiName] &&
                !this._pageSizeByListView?.[this.objectApiName]?.[this.selectedListViewApiName]
            ) {
                this.pageSize = 10;
            }
        } catch(error) {
            this.showToast('Error in updatePageSizeByListView() of sfListApiLwc.js', getErrorMessage(error), 'error');
        }
    }


    
    
    // Get all List View Names/Labels
    _listRecordsPageSize = 100; // Number of list views to grab from API 
    _wiredListViews = [];
    _wiredListViewsResult;
    @wire(getListInfosByObjectName, { 
        objectApiName: '$_waitObjectApiName',
        recentListsOnly: false,
        pageSize: '$_listRecordsPageSize'
    })
    wiredListViews(result) {
        this._wiredListViewsResult = result;
        const {data, error} = result;        
        if (data) {
            //console.log('here is data in getListInfosByObjectName(): ', data);
            try {
                const allListViews = data?.lists ?? [];
                // Build array of list view names for getListInfoByName API
                this._listByNameQueryArr = allListViews.map(lv => `${this._waitObjectApiName}.${lv.apiName}`);
                // Store all list views. 
                this._wiredListViews = allListViews;

                this._isListViews = !!allListViews?.length;
                if (!this._isListViews && this._waitObjectApiName) {
                    this._isLoading = false;
                    this._isDataLoaded = true;
                }
            } catch(error) {
                this.showToast('Error in wiredListViews() of SfListApiLwc.js', getErrorMessage(error), 'error');
            }

        } else if (error) {
            this.showToast('List Views Error', getErrorMessage(error), 'error');
        } 
    }
    // Get all List Views meta data (scope, filteredby, etc.)
    _wiredListInfosByNameResult;
    @wire(getListInfosByName, {names: '$_listByNameQueryArr'})
    wiredListInfoByName(result) {
        this._wiredListInfosByNameResult = result;
        if (!this._listByNameQueryArr?.length) return;
        const { data, error } = result;
        //console.log('here is data in wiredListInfoByName() of sfListApiLwc.js: ', data);
        if (data) {
            try {
                this.listViewMeta = data?.results ?? [];

                // Filter out "mru" type list views
                // ⚠️ Removed "only show mine" filter
                const listViewMeta = filterResponseMrus(this.listViewMeta);

                // Filter out "mru"s from the combobox options
                // ⚠️ Removed "only show mine" filter
                const notMruLists = filterOptionMrus(listViewMeta, this._wiredListViews);
                
                this._isListViews = notMruLists?.length > 0;

                // Create grouped combobox options using Not Mru Lists
                this.listViews = mapListViewOptions(notMruLists);

                if (!this._isListViews) {
                    this._isLoading = false;
                    this._isListViews = false;
                    this.noListViewHelp = `No list views available for ${this.objectLabel}`;
                }
                
                // update list view options for the table component
                this.tableHeaderConfig = {...this.tableHeaderConfig, listViewOptions: this.listViews};

                if (
                    !this.selectedListViewApiName || 
                    ( 
                        this.selectedListViewApiName && 
                        !notMruLists?.some(op => op?.apiName === this.selectedListViewApiName) 
                    )
                ) {
                    const defaultView = notMruLists?.find(op =>
                        op?.apiName === DEFAULT_VIEW_BY_OBJECT_API_NAME?.[this._waitObjectApiName] ||
                        (
                            this.adminDefaultListView &&
                            (
                                op?.label === this.adminDefaultListView ||
                                op?.apiName === this.adminDefaultListView
                            )
                        )
                    )?.apiName ?? null;

                        
                    // selected list view
                    this.selectedListViewApiName = defaultView ?? notMruLists?.[0]?.apiName;

                    this.updatePageSizeByListView();    

                    // update selected list view for the table component
                    this.tableHeaderConfig = {
                        ...this.tableHeaderConfig, 
                        selectedListView: this.selectedListViewApiName
                    };
                } 
                if(this._newListViewName) {
                    // selected list view
                    this.selectedListViewApiName = notMruLists?.find(lv => lv.apiName === this._newListViewName)?.apiName;
                    this.updatePageSizeByListView();
                    // update selected list view for the table component
                    this.tableHeaderConfig = {
                        ...this.tableHeaderConfig, 
                        selectedListView: this.selectedListViewApiName,
                        sortedByInfo: handleSortedByInfo(this)
                    };
                    
                    this._newListViewName = null;
                }
                const selectedMeta = getSelectedMeta(
                    this.selectedListViewApiName,
                    this.listViewMeta
                );

                console.log(
                    'RAW filteredByInfo:',
                    JSON.stringify(selectedMeta?.filteredByInfo, null, 2)
                );

                console.log(
                    'RAW scope:',
                    JSON.stringify(selectedMeta?.scope, null, 2)
                );

                this._filterCriteria = buildSoqlFilter(this);
                console.log(
                    'BUILT SOQL FILTER:',
                    this._filterCriteria
                );
                this.sortBy = getDefaultSortBy(this.selectedListViewApiName, this.listViewMeta);            
                // Get page header meta of selected list view
                retrieveSelectedListViewMeta(this, this.selectedListViewApiName);          
            } catch(err) {
                this.showToast('Error parsing response in wiredListInfoByName() of sfListApiLwc.js', getErrorMessage(err), 'error');
            }

        } else if (error) {
            this.showToast('error in getListInfosByName() of SfListApiLwc.js', getErrorMessage(error), 'error');
        }
    }

    _isEmptyListView = false;
    // ===================== Get List View Records (Custom) ===================== \\
    // Get Selected List View's Records
    get listRecordsByNameColumns() {
        try {
            if (!this._waitObjectApiName || !this.listViewMeta?.length || !this.selectedListViewApiName) return undefined; 
            const listRef = getSelectedMeta(this.selectedListViewApiName, this.listViewMeta);
            
            if (!listRef) {
                return undefined;
            }

            const listRefCols = listRef?.displayColumns;
            return listRefCols?.map(col => `${this._waitObjectApiName}.${col.fieldApiName}`)
        } catch(error) {
            this.showToast('Error in get listRecordsByNameColumns() of sfListApiLwc.js', getErrorMessage(error), 'error');
            return null;
        }
    }
    get _sortByJson() {
        if (!this._waitObjectApiName) return undefined;
        if (this.sortBy && !Array.isArray(this.sortBy) && typeof this.sortBy === 'object') {
            return JSON.stringify([this.sortBy]);
        }
        return this.sortBy?.length 
            ? JSON.stringify(this.sortBy)
            : null;
    }
    get _customListViewObjectApiName() {
        if (!this.selectedListViewApiName) {
            return this._waitObjectApiName;
        }
        return this.selectedListViewApiName === '__Recent'
            ? undefined
            : this._waitObjectApiName;
    }
    _filterCriteria = '';
    // Get List View Records
    _wiredListViewRecordResult;
    @wire(getListRecords, {
        objectApiName: '$_customListViewObjectApiName',
        listViewApiName: '$selectedListViewApiName',
        fields: '$listRecordsByNameColumns',
        pageSize: '$pageSize',
        pageToken: '$pageToken',
        filterCriteria: '$_filterCriteria', 
        searchTerm: '$searchTerm',
        sortByJson: '$_sortByJson', 
        childRelationColumnJson: '$childRelationColumn'
    })
    wiredListViewRecordsCustom(result) {
        if (!this._customListViewObjectApiName) return;
        if (!this.listRecordsByNameColumns?.length) return;
        this._wiredListViewRecordResult = result;
        const {data, error} = result;
        //console.log('here is data in wiredListViewRecordsCustom() of sfListApiLwc.js: ', data);
        if (data) {
            //console.log('here is data in wiredListViewRecordsCustom() of sfListApiLwc.js: ', data);
            try {
                this._pageTokens = updatePageTokens(data);
                this.productionColumns = prepareProductionColumns(this.tableColumns, this._childRelationColumnObj, false);
                const colByRef = new Map(this.tableColumns.map(c => [c.fieldRef, c]));
                this._isEmptyListView = hasNoListViewRecs(this, this.pageToken, data.records ?? [], this.searchTerm);
                //console.log('here is Child relation column obj in wiredListViewRecordsCustom() of sfListApiLwc.js: ', JSON.stringify(this._childRelationColumnObj));
                this.records = (data?.records ?? []).map(r => {
                    const allChildColumns = Array.isArray(this._childRelationColumnObj)
                        ? this._childRelationColumnObj.flatMap(rel => {
                            const cols = Array.isArray(rel?.columns) ? rel.columns : [];
                            return cols.map(col => ({
                                ...col,
                                childObjectApiName: rel.childObjectApiName,
                                relationName: rel.relationName
                            }));
                        })
                        : [];

                    return {
                        Id: r.id,
                        fields: Object.entries(r.fields).map(([f, obj]) => {
                            const normalizedFieldRef = f.includes('.') ? f.split('.')[0] : f;
                            const matchedCol = colByRef.get(normalizedFieldRef);

                            if (!matchedCol && allChildColumns.length) {
                                const relationCol = allChildColumns.find(relCol => relCol.columnLabel === f);
                                //console.log('got relation col in wiredListViewRecordsCustom() of sfListApiLwc.js: ', JSON.stringify(relationCol));

                                if (relationCol) {
                                    const fieldLabel = relationCol.columnLabel;
                                    const fieldName = relationCol.columnLabel;
                                    const objectApiName = relationCol.childObjectApiName;
                                    const displayValue = obj?.displayValue;
                                    const value = obj?.value?.id ?? null;
                                    const dtype = relationCol.dtype ?? 'reference';

                                    const fRes = {
                                        fieldName,
                                        fieldLabel,
                                        value,
                                        objectApiName,
                                        displayValue,
                                        dtype,
                                        keyId: KEY_ID++,
                                    };
                                    //console.log('here if field of child relationship type in sfListApiLwc.js: ', JSON.stringify(fRes));
                                    return fRes;
                                }
                            }

                            const fieldName = matchedCol?.fieldName;
                            const fieldLabel = matchedCol?.label;
                            const isPlain = (!obj.value || typeof obj.value !== 'object') &&
                                matchedCol?.dtype !== 'name';

                            let displayVal;
                            const moreFields = obj?.value?.fields;
                            if (moreFields) {
                                const firstObj = moreFields[Array.from(Object.keys(moreFields))?.[0]];
                                if (firstObj) {
                                    displayVal = firstObj?.displayValue ?? firstObj?.value;
                                }
                            }

                            return isPlain
                                ? {
                                    fieldName,
                                    fieldLabel,
                                    value: obj.value ?? obj.displayValue,
                                    displayValue: obj.displayValue ?? obj.value,
                                    keyId: KEY_ID++,
                                }
                                : {
                                    fieldName,
                                    fieldLabel,
                                    value: matchedCol?.dtype === 'name' ? r.id : obj?.value?.id ?? null,
                                    displayValue: displayVal
                                        ? displayVal
                                        : obj.displayValue
                                            ? obj.displayValue
                                            : !IS_SF_ID(obj.value)
                                                ? obj.value
                                                : null,
                                    keyId: KEY_ID++,
                                };
                        }),
                        recordTypeId: r?.recordTypeId ?? r?.RecordTypeId ?? null
                    };
                });

                // Update item count for the child table
                this.tableHeaderConfig = {
                    ...this.tableHeaderConfig,
                    itemCount: handleItemCount(this.records, this._pageTokens)
                };
            } catch(err) {
                this.showToast('Error parsing data in wiredListViewRecordsCustom() of SfListApiLwc.js', getErrorMessage(err), 'error');
            } finally {
                if (this._customListViewObjectApiName) {
                    if (this._newPageLoading) {
                        this._newPageLoading = false;
                    }
                    this._loadState = { ...this._loadState, dataReady: true };
                    this._finishIfReady();
                    this._isDataLoaded = true;
                }
                this._isEmptyListView = hasNoListViewRecs(this, this.pageToken, this.records, this.searchTerm);
            }
        } else {
            this.records = [];
        } 
        if (error) {
            this.showToast('Error in wiredListViewRecordsCustom() of sfListApiLwc.js.', getErrorMessage(error), 'error');
            console.log('here is filters: ', this._filterCriteria);
            this._loadState = { ...this._loadState, dataReady: true };
            this._finishIfReady(); 
        } 
        this._objectLoaded = true;
        this._isEmptyListView = hasNoListViewRecs(this, this.pageToken, this.records, this.searchTerm);
    }   
    // ========================================================================== \\

    // ==================== Get List View Records (Standard) ==================== \\
    get _sfListViewObjectApiName() {
        return this.selectedListViewApiName === '__Recent'
            ? this._waitObjectApiName
            : undefined;

    }
    get isSfListApi() {
        return this.selectedListViewApiName === '__Recent';
    }

    // Get List View Records
    @wire(getListRecordsByName, {
        objectApiName: '$_sfListViewObjectApiName',
        listViewApiName: '$selectedListViewApiName',
        fields: '$listRecordsByNameColumns',
        pageSize: '$pageSize',
        pageToken: '$pageToken',
        searchTerm: '$searchTerm'
    })
    wiredListViewRecords(result) {
        if (!this._sfListViewObjectApiName) return;
        if (!this.listRecordsByNameColumns?.length) return;
        this._wiredListViewRecordResult = result;
        const {data, error} = result;
        //console.log(`here is data in STANDARD wiredListViewRecords() for OBJECT: ${this.objectApiName} of SfListApiLwc.js: `, data);
        if (data) {
            //this.showToast('The "Recently Viewed" list has limited sorting & search capabilities', '', 'info', 'dismissible');
            try {
                this._pageTokens = updatePageTokens(data);
                this.productionColumns = prepareProductionColumns(this.tableColumns, this._childRelationColumnObj, true);
                const colByRef = new Map(this.tableColumns.map(c => [c.fieldRef, c]));
                this._isEmptyListView = hasNoListViewRecs(this, this.pageToken, data.records ?? [], this.searchTerm);
                this.records = (data?.records ?? []).map(r => {
                    return {
                        Id: r.id,
                        fields: Object.entries(r.fields).map(([f, obj]) => {
                            const matchedCol = colByRef.get(f);
                            const fieldName = matchedCol?.fieldName;
                            const fieldLabel = matchedCol?.label;
                            const isPlain = (!obj.value || typeof obj.value !== 'object') && 
                                matchedCol.dtype !== 'name';

                            let displayVal;
                            const moreFields = obj?.value?.fields;
                            if (moreFields) {
                                const firstObj = moreFields[Array.from(Object.keys(moreFields))?.[0]];
                                if (firstObj) {
                                    displayVal = firstObj?.displayValue ?? firstObj?.value;
                                }
                            }


                            return isPlain
                                ? {
                                    fieldName, 
                                    fieldLabel,
                                    value: obj.value ?? obj.displayValue, 
                                    displayValue: obj.displayValue ?? obj.value,
                                    keyId: KEY_ID++,
                                }
                                : {
                                    fieldName,
                                    fieldLabel,
                                    value: matchedCol.dtype === 'name' ? r.id : obj?.value?.id ?? null,
                                    displayValue: displayVal ? displayVal 
                                        : obj.displayValue ? obj.displayValue 
                                        : !IS_SF_ID(obj.value) ? obj.value 
                                        : null, 
                                    keyId: KEY_ID++,
                                }
                        }),
                        recordTypeId: r.recordTypeId ?? null,
                    }
                }); 

                // Update item count for the child table
                this.tableHeaderConfig = {
                    ...this.tableHeaderConfig,
                    itemCount: handleItemCount(this.records, this._pageTokens)
                };
            } catch(err) {
                this.showToast('Error in wiredListViewRecords() of SfListApiLwc.js', getErrorMessage(err), 'error');
            } finally {
                if (this._sfListViewObjectApiName) {
                    if (this._newPageLoading) {
                        this._newPageLoading = false;
                    }
                    this._loadState = { ...this._loadState, dataReady: true };
                    this._finishIfReady();
                    this._isDataLoaded = true;
                }
                this._isEmptyListView = hasNoListViewRecs(this, this.pageToken, this.records, this.searchTerm);
            }
        } else {
            this.records = [];
            this._isEmptyListView = hasNoListViewRecs(this, this.pageToken, [], this.searchTerm);
        }
            
        if (error) {
            this.showToast('Error in wiredListViewRecords() of sfListApiLwc.js.', getErrorMessage(error), 'error');
            this._loadState = { ...this._loadState, dataReady: true };
            this._finishIfReady(); 
        } 
    } 
    // ========================================================================== \\



    // 📬 loading completed
    handleReady(message) {
        try {
            if (!this._isDataLoaded) return;
            const isEmpty = message.detail === 'empty';
            if (isEmpty && this.records?.length) {
                return;
            }

            this._isLoading = false;

            if (this.justCreated) {
                const tableCmp = this.template.querySelector('c-slds-table');
                if (tableCmp) {
                    tableCmp.handleFilter();
                    this.justCreated = false;
                }
            }
            this._loadState = { ...this._loadState, uiReady: true };
            this._finishIfReady();

        } catch(error) {
            this.showToast('Error in handleReady() of sfListApiLwc.js', getErrorMessage(error), 'error');
            this._isLoading = false;
        }
    }
    // 📬 Change the listview 
    handleListViewChange(message) {
        try {
            this.sortBy = null;
            this._filterCriteria = undefined;
            const newVal = message.detail;
            if (newVal === this.selectedListViewApiName) return;
            const tbl = this.template.querySelector('c-slds-table');
            if (tbl) {
                tbl.resetColumnWidths();
            }
            this._isLoading = true;
            this.pageToken = 0;
            retrieveSelectedListViewMeta(this, newVal);
            this.updatePageSizeByListView();
            this._filterCriteria = buildSoqlFilter(this);
            this.sortBy = getDefaultSortBy(this.selectedListViewApiName, this.listViewMeta);            
        } catch(error) {
            this.showToast('Error in handleListViewChange() of sfListApiLwc.js', getErrorMessage(error), 'error');
        }
    }
    // 📬 Handle "New List View" message from child table component 
    _newListViewName;
    async handleNewListViewMessage(message) {
        try {
            this._newListViewName = message.detail;
            this._isLoading = true;
            await refreshApex(this._wiredListViewsResult);
            await refreshApex(this._wiredListInfosByNameResult);
            this.pageToken = 0;
        } catch(error) {
            this.showToast('Error in handleNewListViewMessage() of sfListApiLwc.js', getErrorMessage(error), 'error');
        } finally {
            this._isLoading = false;
        }
    }
    // 📬 refresh request by child
    async handleRefresh() {
        try {
            this._isLoading = true;
            await refreshApex(this._wiredListViewRecordResult);
        } catch(error) {
            this.showToast('Error in handleRefresh() of SfListApiLwc.js', getErrorMessage(error), 'error');
        } finally {
            this._isLoading = false;
        }
    }   
    // 📬 List view filters updated by child
    async handleFiltersUpdated() {
        try {
            this._isLoading = true;
            await refreshApex(this._wiredListInfosByNameResult);
            retrieveSelectedListViewMeta(this, this.selectedListViewApiName);
            await refreshApex(this._wiredListViewRecordResult);
        } catch(error) {
            this.showToast('Error in handleFiltersUpdated() of sfListApiLwc.js', getErrorMessage(error), 'error');
            this._isLoading = false;
        } 
    }
    // 📬 Handle new default sort (coming from list view definition change)
    async handleSortUpdated() {
        try {
            this._isLoading = true;
            await refreshApex(this._wiredListInfosByNameResult);
            retrieveSelectedListViewMeta(this, this.selectedListViewApiName);
            this.pageToken = 0;
            await refreshApex(this._wiredListViewRecordResult);
        } catch(error) {
            this.showToast('Error in handleFiltersUpdated() of sfListApiLwc.js', getErrorMessage(error), 'error');
            this._isLoading = false;
        } 
    }
    // 📬 Runtime sort change coming from table header clicks
    async handleNewSort(message) {
        try {
            this._startLoadCycle();
            const detail = message?.detail || {};
            //console.log('here is detail in handleNewSort() of SfListApiLwc.js: ', detail);
            const toDir = (val) => (String(val || '').toLowerCase() === 'desc' ? 'DESC' : 'ASC');

            let nextSort = null;

            // Support multi-sort array: { sortBy: [ { fieldName|fieldRef|fieldApiName, type|direction, nulls? }, ... ] }
            if (Array.isArray(detail.sortBy)) {
                nextSort = detail.sortBy
                    .filter(s => s && (s.fieldApiName || s.fieldRef || s.fieldName))
                    .map(s => ({
                        fieldApiName: (s.fieldApiName || s.fieldRef || s.fieldName).includes('.') 
                            ? (s.fieldApiName || s.fieldRef || s.fieldName) 
                            : `${this._waitObjectApiName}.${(s.fieldApiName || s.fieldRef || s.fieldName)}`,
                        direction: s.direction ? toDir(s.direction) : toDir(s.type),
                        nullsPreference: s.nulls || 'LAST'
                    }));
            } else {
                // Single sort payload from table e.g. {"fieldName":"Status","label":"Lead Status","type":"asc","dtype":"picklist"}
                const rawField = detail.fieldApiName || detail.fieldRef || detail.fieldName;
                if (rawField) {
                    const direction = detail.direction ? toDir(detail.direction) : toDir(detail.type);
                    const fieldApiName = rawField.includes('.') ? rawField : `${this._waitObjectApiName}.${rawField}`;
                    nextSort = {
                        fieldApiName,
                        direction,
                        nullsPreference: detail.nulls || 'LAST'
                    };
                }
            }

            // Only proceed if changed
            if (JSON.stringify(this.sortBy || null) === JSON.stringify(nextSort || null)) {
                return;
            }
            this.sortBy = nextSort;
            this.tableHeaderConfig = {
                ...this.tableHeaderConfig,
                sortedByInfo: handleSortedByInfo(this),
                sortedCol: detail
            }

            // Reset pagination because tokens depend on order
            this.pageToken = 0;

        } catch (error) {
            this._isLoading = false;
            this.showToast('Error updating sort', getErrorMessage(error), 'error');
        } 
    }
    // 📬 Save new page size that child component sends
    async savePageSize(message) {
        const newPageSize = Number(message?.detail);
        const listViewApiName = this.selectedListViewApiName;
        this._isLoading = true;

        try {
            if (isNaN(newPageSize) || !listViewApiName) {
                return;
            }

            this.pageToken = 0;
            this.pageSize = newPageSize;

            const fieldApiName = this._userPageSizeField;
            if (!fieldApiName) {
                return;
            }

            const merged = {
                ...(this._pageSizeByListView || {})
            };

            delete merged.listViewApiName;
            delete merged.pageSize;
            delete merged.objectApiName;

            if (fieldApiName === PAGE_SIZE_ALL_JSON.fieldApiName) {
                merged[this.objectApiName] = {
                    ...(merged[this.objectApiName] || {}),
                    [listViewApiName]: newPageSize
                };
            } else {
                merged[listViewApiName] = newPageSize;
            }

            const userSettings = {
                [fieldApiName]: JSON.stringify(merged)
            };

            await saveUserDisplaySettings({
                userId: this._userId,
                userSettings
            });

            this._pageSizeByListView = merged;

            await refreshApex(this._wiredUserDisplaySettingsResult);
            this.updatePageSizeByListView();

            this.showToast(`Page size updated to ${newPageSize}`, '', 'success');
        } catch (error) {
            this.showToast('Error saving page size', getErrorMessage(error), 'error');
        } finally {
            this._isLoading = false;
        }
    }
    // 📬 Save Default List view to User Display Setting
    async saveDefaultListView() {
        const objectApiName = this._waitObjectApiName;
        const listViewApiName = this.selectedListViewApiName;
        const matched = this._wiredListViews?.find(lv => lv?.apiName === listViewApiName);
        this._isLoading = true;
        try {
            if (!matched || !objectApiName) return;

            const fieldApiName = DEFAULT_LIST_VIEWS_JSON_FIELD.fieldApiName;
            if (!fieldApiName) return;

            const merged = {
                ...(this._defaultListViews || {})
            };

            // remove bad keys if ever written
            delete merged.objectApiName;
            delete merged.listViewApiName;

            // store: { "Lead": "__Recent" }
            merged[objectApiName] = listViewApiName;

            await saveUserDisplaySettings({
                userId: this._userId,
                userSettings: {
                    [fieldApiName]: JSON.stringify(merged)
                }
            });

            await refreshApex(this._wiredUserDisplaySettingsResult);
            this.showToast(`Default list view updated to "${matched?.label}"`, '', 'success');
        } catch (error) {
            this.showToast('Error saving default list view', getErrorMessage(error), 'error');
        } finally {
            this._isLoading = false;
        }
    }



    _tableEdited = false;
    // 📬 table is edited (warn user edits will be lost)
    handleEdited() {
        this._tableEdited = true;
    }
    // 📬 table not edited
    handleNotEdited() {
        this._tableEdited = false;
    }
    // 📬 Handle list view label change 
    handleListViewLabelChange(message) {
        if (message.detail?.length) {
            this.tableHeaderConfig = {
                ...this.tableHeaderConfig,
                listViewOptions: message.detail
            };
        }
    }
    // 📬 handle deleted list view 
    async handleDeletedListView(message) {
        try {
            this._isLoading = true;
            this.selectedListViewApiName = null;
            await refreshApex(this._wiredListViewsResult);
            this.pageToken = 0;
        } catch(error) {
            this.showToast('Error in handleDeletedListView() of sfListApiLwc.js', getErrorMessage(error), 'error');
        } finally {
            this._isLoading = false;
        }
    }
    // 📬 Call apex method for send record Ids of checked rows 
    async handleCheckedRows() {
        try {
            const table = this.template.querySelector('c-slds-table');
            const successMsg = this.sendCheckedConfig.successMsg ?? 'Success';
            const method = SEND_CHECKED_APEX_METHODS[this.sendCheckedConfig.apexMethod]?.method;
            const parameter = SEND_CHECKED_APEX_METHODS[this.sendCheckedConfig.apexMethod]?.parameter;
            if (table) {
                const checkedRows = await table.getCheckedRows();
                if (checkedRows?.length) {
                    await method({[parameter]: checkedRows});
                    this.showToast(successMsg, '', 'success');
                }
            }

        } catch(error) {
            this.showToast('Error in handleCheckedRows() of sfListApiLwc.js', getErrorMessage(error), 'error');
        }
    }

    // Tell table component that "new record" is inactive    
    get suppressNewRecord() {
        return this._waitObjectApiName !== LEAD_OBJECT.objectApiName;
    }

    get colWidthConfigJson() {
        return COLUMN_WIDTHS_ALL_JSON_FIELD.fieldApiName;
    }
    
    toastObj;
    showToast(title, message, variant, mode=null) {
        const modeP = mode 
            ? mode 
                : variant === 'success'
            ? 'dismissible'
            : 'sticky';
        
        this.toastObj = { 
            variant: variant, 
            mode: modeP, 
            message: message,
            header: { 
                text: title
            }        
        };
    }


    // Apply Styles to the host 👉 Can pass 1.Array of Arrays   2.Array of Object   3.Strings
    _applyVarsDirect(cssVar, varStyle=null) {
        // Check that CSS var starts with '--' and has a non-null stlye 
        const isValid = (cssVarP, varStyleP) => {
            return typeof cssVarP === 'string' && 
                typeof varStyleP === 'string' &&
                cssVarP?.startsWith('--') && 
                varStyleP;
        }



        const el = this.template.host;
        
        if (Array.isArray(cssVar)) {
            // Handle Array of vars
            cssVar.forEach(hostVar => {
                if (Array.isArray(hostVar) && isValid(hostVar[0], hostVar[1])) {
                    // Handle Array structure  (CSS var at index 0)
                    el.style.setProperty(hostVar[0], hostVar[1]);
                } else if (typeof hostVar === 'object' && isValid(hostVar.cssVar, hostVar.varStyle)) {
                    // Handle Object structure (cssVar & varStyle keys)
                    el.style.setProperty(hostVar.cssVar, hostVar.varStyle)
                }
            });
        } else if (isValid(cssVar, varStyle)) {
            // Handle string arguments
            el.style.setProperty(cssVar,  varStyle);
        }
    }
}