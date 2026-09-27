/**
 * sldsTable — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/newRecordLayoutModal, c/utils, c/utils, ./constants.
 * - Salesforce/platform modules: lwc, lightning/navigation,
 * @salesforce/apex/DynamicSObjectController.resolveEntityPrefixes, @salesforce/apex, @salesforce/user/Id,
 * @salesforce/apex/UserDisplaySettingsController.fetchUserDisplaySettingsByField,
 * @salesforce/apex/UserDisplaySettingsController.saveUserDisplaySettings,
 * @salesforce/apex/DataTableController.isAdminUser,
 * @salesforce/schema/User_Display_Settings__c.Column_Widths_All_JSON__c, lightning/uiObjectInfoApi,
 * @salesforce/apex/DataTableController.saveRows,
 * @salesforce/apex/DynamicSObjectController.deleteRecordsById.
 * - Template children (including conditional UI): c-custom-slds-combobox-multi-select-practice,
 * c-dropdown-plain, c-new-list-view-lwc, c-slds-illustration, c-slds-input, c-slds-menu-popover-button,
 * c-slds-modal, c-slds-modal-slot, c-slds-page-header-list-view, c-slds-table-filter-panel-ui-lists-api,
 * c-toast-lwc, lightning-button, lightning-formatted-email, lightning-formatted-rich-text,
 * lightning-spinner.
 * - Bundle template: sldsTable.html; local styles: sldsTable.css. Salesforce SLDS styling is expected.
 * - Shared CSS modules: c/sharedStylesGlobal, c/sharedStylesSldsTable.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-table') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - externalFilterState (external-filter-state): Parent-owned filter indicator metadata; isApplied
 * controls the active-filter indication.
 *   Example: child.externalFilterState = { isApplied: true };
 * - loadingMinHeight (loading-min-height): CSS minimum table height while loading.
 *   Example: child.loadingMinHeight = "12rem";
 * - hasPageHeaderExtension (has-page-header-extension): Reserves the table page-header extension layout.
 * Declared default: false.
 *   Example: child.hasPageHeaderExtension = true;
 * - suppressCharts (suppress-charts): Suppresses the chart controls. Declared default: false.
 *   Example: child.suppressCharts = true;
 * - suppressFilter (suppress-filter): Suppresses the filter controls. Declared default: false.
 *   Example: child.suppressFilter = true;
 * - suppressSettings (suppress-settings): Suppresses the settings menu. Declared default: false.
 *   Example: child.suppressSettings = true;
 * - suppressViewOptions (suppress-view-options): Suppresses the view options. Declared default: false.
 *   Example: child.suppressViewOptions = true;
 * - suppressOverflowMenu (suppress-overflow-menu): Suppresses the overflow menu. Declared default: false.
 *   Example: child.suppressOverflowMenu = true;
 * - suppressEdit (suppress-edit): Suppresses the edit action. Declared default: false.
 *   Example: child.suppressEdit = true;
 * - suppressNewRecord (suppress-new-record): Suppresses the new record action. Declared default: false.
 *   Example: child.suppressNewRecord = true;
 * - forceShow (force-show): Forces the table's show/layout behavior.
 *   Example: child.forceShow = true;
 * - columnsBg (columns-bg): CSS column header background.
 *   Example: child.columnsBg = "#f3f3f3";
 * - rowsBg (rows-bg): CSS row background.
 *   Example: child.rowsBg = "#ffffff";
 * - stripedBg (striped-bg): CSS alternate-row background.
 *   Example: child.stripedBg = "#f3f3f3";
 * - stripedTable (striped-table): Enables alternating row backgrounds. Declared default: false.
 *   Example: child.stripedTable = true;
 * - suppressBorderedTable (suppress-bordered-table): Removes the table's outer border treatment. Declared
 * default: false.
 *   Example: child.suppressBorderedTable = true;
 * - colBorders (col-borders): Adds vertical column borders. Declared default: false.
 *   Example: child.colBorders = true;
 * - isSimpleTable (is-simple-table): Uses the simplified row-action/layout variant.
 *   Example: child.isSimpleTable = true;
 * - suppressHeader (suppress-header): Hides the standard header.
 *   Example: child.suppressHeader = true;
 * - fontSize (font-size): CSS text size, including units.
 *   Example: child.fontSize = "0.875rem";
 * - tightTable (tight-table): Uses compact row/cell spacing. Declared default: false.
 *   Example: child.tightTable = true;
 * - suppressColActions (suppress-col-actions): Suppresses the column action menus. Declared default:
 * false.
 *   Example: child.suppressColActions = true;
 * - suppressSort (suppress-sort): Suppresses the sorting. Declared default: false.
 *   Example: child.suppressSort = true;
 * - suppressCheckboxes (suppress-checkboxes): Suppresses the row selection checkboxes. Declared default:
 * false.
 *   Example: child.suppressCheckboxes = true;
 * - radio (radio): Uses single-row radio selection and emits radioselection. Declared default: false.
 *   Example: child.radio = true;
 * - suppressRowActions (suppress-row-actions): Suppresses the row action menus. Declared default: false.
 *   Example: child.suppressRowActions = true;
 * - suppressResizableCols (suppress-resizable-cols): Suppresses the column resizing. Declared default:
 * false.
 *   Example: child.suppressResizableCols = true;
 * - suppressRowCount (suppress-row-count): Suppresses the row count. Declared default: false.
 *   Example: child.suppressRowCount = true;
 * - suppressPageHeaderSort (suppress-page-header-sort): Suppresses the page-header sort control. Declared
 * default: false.
 *   Example: child.suppressPageHeaderSort = true;
 * - isDbControlled (is-db-controlled): Delegates data/filter operations to the parent/database-backed
 * workflow. Declared default: false.
 *   Example: child.isDbControlled = true;
 * - selectedListViewMeta (selected-list-view-meta): Selected Salesforce list-view metadata used for
 * filters and sorting.
 *   Example: child.selectedListViewMeta = this.listViewMetadata;
 * - listViewName (list-view-name): List-view API/configuration name used for settings.
 *   Example: child.listViewName = "AllAccounts";
 * - objectLabel (object-label): Singular object label displayed in headings/messages.
 *   Example: child.objectLabel = "Account";
 * - pluralLabel (plural-label): Plural object label displayed in headings/messages.
 *   Example: child.pluralLabel = "Accounts";
 * - pageHeaderConfig (page-header-config): Configuration forwarded to the list-view page header.
 *   Example: child.pageHeaderConfig = { objectLabel: 'Account', pluralLabel: 'Accounts', listViewTitle:
 * 'All Accounts' };
 * - settingsOptions (settings-options): Page-header settings menu options.
 *   Example: child.settingsOptions = [{ label: 'Reset column widths', value: 'Reset column widths' }];
 * - borderRadius (border-radius): CSS corner radius, including units.
 *   Example: child.borderRadius = "0.25rem";
 * - isSfListApi (is-sf-list-api): Enables the Salesforce list API integration path.
 *   Example: child.isSfListApi = true;
 * - additionalHelpText (additional-help-text): Additional message string or array of message strings.
 *   Example: child.additionalHelpText = "Try changing your filters.";
 * - colWidthConfigName (col-width-config-name): User display settings key for saved column widths.
 *   Example: child.colWidthConfigName = "accounts";
 * - sortConfigName (sort-config-name): User display settings key for saved sort configuration.
 *   Example: child.sortConfigName = "accounts";
 * - smallTable (small-table): Compatibility property: uses the small-table sizing behavior; currently
 * stored/exposed but not consumed by this implementation. Declared default: false.
 *   Example: child.smallTable = true;
 * - pageToken (page-token): Current page token/index supplied by the parent.
 *   Example: child.pageToken = 0;
 * - pageSize (page-size): Number of rows per page.
 *   Example: child.pageSize = 25;
 * - objectName (object-name): Salesforce object API name used for metadata, navigation or record
 * operations.
 *   Example: child.objectName = "Account";
 * - tableAttributes (table-attributes): Compatibility property: table behavior/class overrides; see
 * TABLE_ATTRIBUTE_DEFAULTS in constants.js; currently stored/exposed but not consumed by this
 * implementation.
 *   Example: child.tableAttributes = {};
 * - rowActions (row-actions): Row action option array with label and value.
 *   Example: child.rowActions = [{ label: 'Edit', value: 'edit' }];
 * - columns (columns): Column descriptors with fieldName/fieldApiName, label and dtype; schema-driven
 * components instead require field references.
 *   Example: child.columns = [{ fieldName: 'Name', fieldApiName: 'Name', label: 'Name', dtype: 'text' }];
 * - isNoData (is-no-data): Marks the table as loaded with no data and clears its current rows.
 *   Example: child.isNoData = true;
 * - rows (rows): Parent-supplied records with field values keyed by fieldName; Id identifies each row.
 *   Example: child.rows = [{ Id: 'row-1', Name: 'Acme' }];
 * - maxHeight (max-height): CSS maximum height of the scrollable table.
 *   Example: child.maxHeight = "60vh";
 * - sortedCol (sorted-col): Initial sort descriptor matched to a column's fieldName.
 *   Example: child.sortedCol = { fieldName: 'Name', isAsc: true };
 *
 * Public methods (call on the rendered child):
 * - async saveColumnWidths(): Persist column widths in user display settings.
 * - async saveColumnWidthsListViewApi(isPct=false): Persist widths for the Salesforce list API variant.
 * - resetColumnWidths(resetTable=false): Restore initial/default column widths.
 * - async resetTable(): Reset the table state.
 * - getColumnWidths(): Read current percentage column widths.
 * - getColumnWidthsInPixels(): Read current pixel column widths.
 * - async getCheckedRows(): Read selected rows; tree/auto variants optionally include object names or
 * level filtering.
 * - async clearCheckboxes(): Clear row selections.
 * - handleFilter(): Open/handle the table filter workflow.
 * - handleEditSort(): Open/handle the table sort workflow.
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-slds-table object-name="Account" columns={columns} rows={rows}
 *         suppress-header={enabled} suppress-row-actions={enabled}
 *         suppress-checkboxes={enabled} max-height="24rem"></c-slds-table>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     enabled = true;
 *     columns = [{ fieldName: 'Name', label: 'Account', dtype: 'text' },
 *         { fieldName: 'Phone', label: 'Phone', dtype: 'text' }];
 *     rows = [{ Id: 'row-1', Name: 'Acme', Phone: '555-0100' }];
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Use when the parent owns the record query and supplies raw rows and column descriptors. The example is
 * display-only; use real Salesforce IDs before enabling record actions or navigation. ready signals
 * completed initialization (detail ready or empty).
 * - Selectable variant: omit suppress-checkboxes and call await
 * this.template.querySelector('c-slds-table').getCheckedRows(). For one selection use radio={enabled} and
 * handle radioselection.detail = { id, record }. Listen for refresh after edits/deletions and reload the
 * parent data.
 * - List-view variant: supply page-header-config, selected-list-view-meta, list-view-name, page-size and
 * page-token from the parent list API/controller; handle newlistview, search, newsort and updatepagesize
 * as appropriate. is-db-controlled delegates relevant operations to that workflow.
 * - Slots: pageHeaderExtension.
 */

import { LightningElement, track, api, wire } from 'lwc';
import newRecordLayoutModal from 'c/newRecordLayoutModal';
import { NavigationMixin } from 'lightning/navigation';
import resolveEntityPrefixes from "@salesforce/apex/DynamicSObjectController.resolveEntityPrefixes";
import { refreshApex } from '@salesforce/apex';
import userId from '@salesforce/user/Id';
import fetchUserDisplaySettingsByField from '@salesforce/apex/UserDisplaySettingsController.fetchUserDisplaySettingsByField';
import saveUserDisplaySettings from '@salesforce/apex/UserDisplaySettingsController.saveUserDisplaySettings';
import isAdminUser from '@salesforce/apex/DataTableController.isAdminUser';
import { mapPresetsToColWidths } from "c/utils"

import COLUMN_WIDTHS_ALL_JSON_FIELD from "@salesforce/schema/User_Display_Settings__c.Column_Widths_All_JSON__c";

import { getObjectInfo, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';                

import { 
    getErrorMessage, 
    isValidProperty, 
    mapRowsToColumns, 
    iconByDataType, 
    handleDateObjDisplayValue, 
    iconMap as ICON_MAP, 
    formatMultiPicklistVal,
    iconPath, 
    getCleanMetaDataLabels,
    addPageRefsFieldsArr, 
    IS_SF_ID,
    handleSearchFilter,
    handleEveryFilter,
    updateOverflowYSimple,
    handleTableOverflow,
    resetColumnWidths,
    handlemousedown,
    handlemousemove,
    handlemouseup,
    iconByObjectApiName,
    handleIconResult,
    normalizeBlank,
    applyRowNumbers,
    coerceByDtype,
    NON_NAV_TARGETS,
    NOT_NAV_TARGET_HANDLERS,
    handleRevertFields,
    persistSort,
    persistSearchTerm,
    persistCheckedRows,
    persistEditedFields,
    openExternalUrl,
    handleSelectAllRows,
    handleCheckboxChange,
    clearCheckboxes,
    focusListHeader,
    isCommunitySetting,
    getNotSortableFieldNames,
    getNotFilterableFieldNames,
} from 'c/utils';

import {
    SETTINGS_OPTIONS,
    VALID_DTYPES,
    CELL_TEXT_STYLES,
    TO_LOCAL_DTYPE,
    TABLE_ATTRIBUTE_DEFAULTS,
} from './constants';




import saveRows from '@salesforce/apex/DataTableController.saveRows';
import deleteRecordsById from '@salesforce/apex/DynamicSObjectController.deleteRecordsById';

function prepareProductionColumns(cmp, tableColumns, objectInfos, picklistOptions) {

    const fields = objectInfos?.data?.fields;

    const visibilityPrivate = cmp.selectedListViewMeta?.visibility?.toLowerCase() === 'private';
    
    const notSortableFieldNames = getNotSortableFieldNames(
        tableColumns, 
        cmp.isDbControlled, 
        cmp.isSfListApi, 
    );
    const notFilterableFieldNames = getNotFilterableFieldNames(
        tableColumns, 
        cmp.isDbControlled, 
        cmp.isSfListApi, 
        cmp._isCommunity,
        visibilityPrivate
    );

    const cols = tableColumns.map(col => {
        if (col.dtype === 'name' || !fields?.[col.fieldName]) {
            return col;
        }
        const colInfos = fields?.[col.fieldName];

        const notSortable = !col.fieldName || notSortableFieldNames.includes(col.fieldName);
        const notFilterable = !col.fieldName || notFilterableFieldNames.includes(col.fieldName);

        // Check if editable
        const editableFalse = col?.editable === false || 
            col?.isEditable === false;

        let editable = !editableFalse && 
            colInfos?.updateable && 
            !colInfos.calculated;

        if (!colInfos.updateable) {
            editable = false;
        }

        const rawDtype = colInfos?.dataType?.toLowerCase() ?? 'text';
        let dtype = TO_LOCAL_DTYPE(colInfos);

        if (!VALID_DTYPES.includes(dtype)) {
            dtype = 'text';
        }

        if (dtype.includes('picklist') && picklistOptions?.[col.fieldName]) {
            const options = picklistOptions[col.fieldName] ?? [];
            return { ...col,  dtype,  options, editable, notSortable, notFilterable}
        }
        return {
            ...col, 
            dtype, 
            editable, 
            rawDtype, 
            notSortable, 
            notFilterable
        };
    });

    return cols;
}

function configureDisabledSettingsOptions(cmp, pageHeaderConfig, selectedListViewMeta, pageSize) {
    try {
        if (!pageHeaderConfig) { 
            return null;
        }
        if (!selectedListViewMeta || !pageHeaderConfig?.settingsOptions?.length) { 
            return pageHeaderConfig;
        }
        // Check if is a community setting
        const isCommunity = cmp._isCommunity;
        // Get list view api name
        const listViewApiName = selectedListViewMeta?.result?.listReference?.listViewApiName
            ?? selectedListViewMeta?.listReference?.listViewApiName;

        /* Disabled: 
            ☑️ !listViewApiName
            ☑️ isCommunity and visibility !== private 
            ☑️ !isCommunity and listViewApiName = __Recent
        */
        const disabled = !listViewApiName || 
            isCommunity && selectedListViewMeta?.visibility?.toLowerCase() !== 'private' || 
            listViewApiName === '__Recent';

        const notCommunityAndNotRecent = !isCommunity && 
            listViewApiName && 
            listViewApiName !== '__Recent';

        if (
            pageSize && 
            pageHeaderConfig?.settingsOptions?.length &&
            !pageHeaderConfig.settingsOptions.some(op => op?.value === 'pageSize')
        ) {
            pageHeaderConfig.settingsOptions = [
                ...pageHeaderConfig.settingsOptions,
                {label: 'Results Per Page', value: 'pageSize'}
            ];
        }

        if (!pageHeaderConfig.settingsOptions?.some(opt => opt.value === 'updateColumnWidthsPct')) {
            pageHeaderConfig.settingsOptions = [
                ...pageHeaderConfig.settingsOptions,
                {label: 'Save Column Widths', value: 'updateColumnWidthsPx'}
            ];
        }

        const stngOptVals = new Set();
        const settingOptions = (pageHeaderConfig.settingsOptions ?? []).map(stOp => {
            if (stOp.value && !stngOptVals.has(stOp.value)) {
                stngOptVals.add(stOp.value);
                return stOp;
            }
            return null;
        }).filter(Boolean);

        return {
            ...pageHeaderConfig,
            settingsOptions: settingOptions.map(opt => {
                if (cmp._isAdminUser) {
                    if (listViewApiName === '__Recent' && opt.restricted) {
                        return opt.label === 'Select Fields to Display' 
                            ? {...opt, disabed: false}
                            : {...opt, disabled: true};
                    }
                    return {...opt, disabled: false};
                }
                if (notCommunityAndNotRecent && listViewApiName) {
                    return {...opt, disabed: false}
                }
                return opt.restricted 
                    ? {...opt, disabled}
                    : opt;
            })
        };
    } catch(error) {
        cmp.showToast('Error in configureDisabledSettingsOptions() of sldsTable.js', getErrorMessage(error), 'error');
    }
}
// Return object api name by first 3 characters of record Id
export function getObjectApiNameByPrefix(recordId, entityPrefixes) {
    try {
        if (!recordId || !entityPrefixes) return;
        const firstThree = recordId.slice(0, 3);
        return entityPrefixes?.[firstThree];
    } catch(error) {
        console.error('Error in getObjectApiNameByPrefix() of sldsTreeGrid.js', getErrorMessage(error), 'error');
    }
}

// Remove slds-is-sort and set aria-sort to none
function removeSort(tableCols, th=null, justSaved=false) {
    if (justSaved) return;
    if (tableCols) {
        tableCols.forEach(col => {
            if (col) {
                if (th) {
                    if (col.classList.contains('slds-is-sorted') && col.dataset.id !== th.dataset.id) {
                        col.classList.remove('slds-is-sorted', 'slds-is-sorted_asc', 'slds-is-sorted_desc');
                        col.setAttribute('aria-sort', 'none');
                    }
                } else {
                    if (col.classList.contains('slds-is-sorted')) {
                        col.classList.remove('slds-is-sorted', 'slds-is-sorted_asc', 'slds-is-sorted_desc');
                        col.setAttribute('aria-sort', 'none');
                    }
                }
            }
        });
    } 
}
// Add slds-is-sorted_desc and set aria-sort to descending
function sortColDesc(col) {
    if (!col) return;
    if (!col.classList.contains('slds-is-sorted')) { col.classList.add('slds-is-sorted'); }
    col.classList.remove('slds-is-sorted_asc');
    col.setAttribute('aria-sort', 'descending');
    col.classList.add('slds-is-sorted_desc');
}
// Add slds-is-sorted_asc and set aria-sort to ascending
function sortColAsc(col) {
    if (!col) return;
    if (!col.classList.contains('slds-is-sorted')) { col.classList.add('slds-is-sorted'); }
    col.setAttribute('aria-sort', 'ascending');
    col.classList.remove('slds-is-sorted_asc');
    col.classList.add('slds-is-sorted_asc');
}


export default class SldsTable extends NavigationMixin(LightningElement) {
    _externalFilterState;
    @api
    set externalFilterState(value) {
        this._externalFilterState = value ? { ...value } : null;
    }
    get externalFilterState() {
        return this._externalFilterState;
    }
    get hasExternalFilters() {
        return !!this._externalFilterState?.isApplied;
    }
    @track colTextOptions = [
        {label: 'Clip Text', value: 'clipText'},
        {label: 'Wrap Text', value: 'wrapText'},
        {label: 'Clamp Text', value: 'clampText'},
    ];                        // For Column Actions Button (clip/wrap/clamp)
    savedColProperties = []; // Maintain Column Properties after save event

    @api 
    set loadingMinHeight(val) {
        this._loadingMinHeight = val;
        if (val) {
            this._applyVarsDirect('--vg-loading-min-height', val);
        }
    }
    get loadingMinHeight() {
        return this._loadingMinHeight;
    }

    @api hasPageHeaderExtension = false;

    @api suppressCharts = false;
    @api suppressFilter = false;
    @api suppressSettings = false;
    @api suppressViewOptions = false;
    @api suppressOverflowMenu = false;
    @api suppressEdit = false;
    @api suppressNewRecord = false;

    @api 
    set forceShow(val) {
        this._forceShow = val;
        if (val) {
            this.isDataLoaded = true;
        }
    }
    get forceShow() {
        return this._forceShow;
    }
    

    _columnsBg  = 'var(--slds-g-color-neutral-base-95)';
    _rowsBg    = 'var(--slds-g-color-neutral-base-100)';
    _stripedBg = 'var(--slds-g-color-neutral-base-95)';
    @api get columnsBg() { return this._columnsBg; }
    set columnsBg(v) { this._columnsBg = v; this._applyVarsDirect('--vg-color-columns-bg-table', v); }
    @api get rowsBg() { return this._rowsBg; }
    set rowsBg(v) { this._rowsBg = v; this._applyVarsDirect('--vg-color-rows-bg-table', v); }
    @api get stripedBg() { return this._stripedBg; }
    set stripedBg(v) { this._stripedBg = v; this._applyVarsDirect('--vg-color-striped-bg-table', v); }

    // ----- Table Attributes -----\\
    @api stripedTable = false;
    @api suppressBorderedTable = false;
    @api colBorders = false;
    _rowActionClsObj = {
        th: 'slds-cell-fixed row-action-small', 
        td: 'row-action-cell row-action-small'
    }
    @api 
    set isSimpleTable(val) {
        this._isSimpleTable = val;
        if (val) {
            this._rowActionClsObj = {
                th: 'slds-cell-fixed row-action-small',
                td: 'row-action-cell row-action-small'
            }
            //this.suppressResizableCols = true;
            //this.suppressSort = true;
            this.suppressRowCount = true;
        }
    }
    get isSimpleTable() {
        return this._isSimpleTable;
    }
    @api 
    set suppressHeader(val) {
        this._suppressHeader = val;
        if (val) {
            this._applyVarsDirect('--vg-table-border', 'none');
            this._applyVarsDirect('--vg-table-border_no-header', 'solid 1px var(--slds-g-color-border-base-1)');
        } else {
            this._applyVarsDirect('--vg-table-border', 'solid 1px var(--slds-g-color-border-base-1)');
            this._applyVarsDirect('--vg-table-border_no-header', 'none');
        }
    }
    get suppressHeader() {
        return this._suppressHeader ?? false;
    }
    @api 
    set fontSize(val) {
        this._fontSize = val;
        if (val) {
            this._applyVarsDirect('--c-font-size', val);
        }
    }
    get fontSize() {
        return this._fontSize;
    }

    @api tightTable = false;
    @api suppressColActions = false;
    @api suppressSort = false;
    @api suppressCheckboxes = false;
    @api radio = false;
    @api suppressRowActions = false;
    @api suppressResizableCols = false;
    @api suppressRowCount = false;
    @api suppressPageHeaderSort = false;
    // --------------------------- \\

    // ------- Page Header -------\\
    _pageHeaderConfig = {}; 
    
    // Send search string and sort infos to parent if uses uiListsApi
    @api isDbControlled = false;

    // only allow private list view to be edited
    listViewEditable = false;
    _listViewApiName;
    _listViewName;
    _listViewChanged = false;
    @api 
    set selectedListViewMeta(val) {
        if (this.filterDetails && !this._filterOnRender) {
            this.filterDetails = null;
        }
        this._selectedListViewMeta = val;
        if (!this._newDbSort) {
            const tableCols = this.template.querySelectorAll('[data-element="tableColumn"]');
            removeSort(tableCols, null, this._justSaved);
        }
        this._listViewChanged = val?.listReference?.listViewApiName !== this._listViewApiName;
        
        this._listViewApiName = val?.listReference?.listViewApiName;
        
        if (val?.visibility) {
            
            this.listViewEditable = (!this._isCommunity || this._isAdminUser) && 
                this._listViewApiName !== '__Recent' 
                ? true
                : val?.visibility?.toLowerCase() === 'private';
        }
        this._pageHeaderConfig = configureDisabledSettingsOptions(this, this._pageHeaderConfig, val, this.pageSize);

        if (this._filterOnRender) {
            this.handleFilter();
        }

    }
    get selectedListViewMeta() {
        return this._selectedListViewMeta;
    }   

    @api
    set listViewName(val) {
        this._listViewName = val;
        if (this._columns?.length) {
            this.evalPresetsToColumns();
        }
    }
    get listViewName() {
        return this._listViewName;
    }

    get _effectiveListViewKey() {
        return this._listViewApiName || this._listViewName || null;
    }

    @api 
    set objectLabel(val) {
        this._objectLabel = val;
        if (val) {
            this._pageHeaderConfig = {...this._pageHeaderConfig, objectLabel: val};
        }
    }
    get objectLabel() {
        return this._objectLabel;
    }
    @api 
    set pluralLabel(val) {
        this._pluralLabel = val;
        if (val) {
            this.noDataMsg = `No ${val}`;
            this._pageHeaderConfig = {...this._pageHeaderConfig, pluralLabel: val};
        }
    }
    get pluralLabel() {
        return this._pluralLabel;
    }

    
    _pageHeaderConfig;
    @api 
    set pageHeaderConfig(val) {
        if (!this._pageHeaderConfig) {
            this._pageHeaderConfig = {
                settingsOptions: val?.listViewOptions?.length ? SETTINGS_OPTIONS : [],
                ...val
            }
        } else {
            this._pageHeaderConfig = {
                ...this._pageHeaderConfig, 
                settingsOptions: val?.listViewOptions?.length ? SETTINGS_OPTIONS : [],
                ...val
            };
        }
        this._pageHeaderConfig = configureDisabledSettingsOptions(this, this._pageHeaderConfig, this.selectedListViewMeta, this.pageSize);
        this._sortedCol = val?.sortedCol ?? null;
        this.handleDisplayOnlySortedCol();
    }
    get pageHeaderConfig() {
        return this._pageHeaderConfig;
    }
    @api 
    set settingsOptions(val) {
        this._settingsOptions = val;
        this._pageHeaderConfig = {
            ...this._pageHeaderConfig,
            settingsOptions: val
        };
        this._pageHeaderConfig = configureDisabledSettingsOptions(this, this._pageHeaderConfig, this.selectedListViewMeta, this.pageSize);
    
    }
    get settingsOptions() {
        return this._settingsOptions;
    }
    // --------------------------- \\

    @api 
    set borderRadius(val) {
        this._borderRadius = val;
        if (val) {
            this._applyVarsDirect('--vg-c-table-border-radius', val);
        }
    }
    get borderRadius() {
        return this._borderRadius;
    }

    @api 
    set isSfListApi(val) {
        this._isSfListApi = val;
    }
    get isSfListApi() {
        return this._isSfListApi;
    }

    @api additionalHelpText;
    noDataMsg;

    @track iconMap = ICON_MAP;
    // Show spinner while loading
    @track isLoading = false;

    
    // ------- Modal Config ------- \\
    modalConfig = {
        tableModalMessage: null,
        modalCancelLabel: null,
        modalOkayLabel: null,
        tableModalHandler: null
    };
    @track popoverEditCopy = {};
    // --------------------------- \\

    // ------ Checkbox Vars ------ \\
    checkboxArray = [];
    _shiftHeld = false;
    _lastChecked;
    // --------------------------- \\

    // ------ Menu Dropdown ------ \\
    relativeContainer;
    // --------------------------- \\

    // Track when user clicks escape to not save their edit
    isEscape = false;
    isPreventBlur = false;

    // ------- Resize Cols ------- \\
    _tableThColumn = null;
    _pageX = null;
    _tableThWidth = null;
    _initWidths = null;
    // --------------------------- \\

    // ---------- Toast ---------- \\
    toastTitle;
    toastError;
    // --------------------------- \\

    _isCommunity = isCommunitySetting();

    isDataLoaded=false;
    isTableEdited = false;

    // --------- Drafts ---------- \\
    draftOriginalValues = [];  // Store the original value of each field that was edited
    draftValues = [];         // Store all current values of each edited field 
    popoverEdit = {};
    picklistOptions = [];   // if is a picklist type with editing popover ---> store the options
    // --------------------------- \\

    // ------- Table Data -------- \\
    localRows = [];
    stableRows = [];
    localColumns = [];
    _rows = [];  // Private variable for the records array data
    _columns = [];  // Private variable for the columns
    // --------------------------- \\

    _userId = userId;
    // Get user presets using the list view api name
    @api 
    set colWidthConfigName(val) {
        this._colWidthConfigName = val;
    }
    get colWidthConfigName() {
        return this._colWidthConfigName ?? undefined;
    }
    @api 
    set sortConfigName(val) {
        this._sortConfigName = val;
    }
    get sortConfigName() {
        return this._sortConfigName ?? undefined;
    }

    @api smallTable = false;

    @api 
    set pageToken(val) {
        this._pageToken = val;
    }
    get pageToken() {
        return this._pageToken || 0;
    }
    
    @api 
    set pageSize(val) {
        this._pageSize = val;
        if (val) {
            this.resetMaxHeight();
            this._pageHeaderConfig = configureDisabledSettingsOptions(this, this._pageHeaderConfig, this.selectedListViewMeta, this.pageSize);
        }
    }
    get pageSize() {
        return this._pageSize;
    }

    // ======================== Public Properties ========================== \\
    _wiredObjectName = undefined;
    @api 
    set objectName(val) {
        this._objectName = val;
        if (val) {
            this._wiredObjectName = val;
            const iconObj = iconByObjectApiName(val, null, true);
            const iconRes = handleIconResult(iconObj);
            this._pageHeaderConfig = {...this._pageHeaderConfig, iconConfig: iconRes};
        }
    }
    get objectName() {
        return this._objectName;
    }
    @api tableAttributes;
    
    @api // Actions for the row-action buttons
    set rowActions(value) {
        if (value) {
            if ( Array.isArray(value) && value.every(opt => opt.label && opt.value) ) {
                const filteredActions = value.filter(opt => 
                    (opt?.label?.toLowerCase() !== 'edit' && opt?.value?.toLowerCase() !== 'edit') &&
                    (opt?.label?.toLowerCase() !== 'delete' && opt?.value?.toLowerCase() !== 'delete') 
                );
                if (filteredActions?.length) {
                    this._rowActions = [
                        {label: 'Edit', value: 'edit'}, 
                        {label: 'Delete', value: 'delete'},
                        ...filteredActions
                    ];
                    return;
                }
            }
            this._rowActions = null;
        }
        this._rowActions = null;
    }
    get rowActions() {
        return this._rowActions || [{label: 'Edit', value: 'edit'}, {label: 'Delete', value: 'delete'}]
    }

    _parseScheduled = false;
    _hasRows = false;
    _hasCols = false;
    _baseColumns;
    @api // Columns for the table
    set columns(value) {
        this._baseColumns = (value ?? []).map(c => ({ ...c, width: undefined }));
        this._columns = this._baseColumns.map(c => ({ ...c }));
        //this._sortedCol = null;
        this._initWidths = null;
        if (this._newDbSort) {
            this.evalPresetsToColumns();
        } 

        this._hasCols = (this._columns?.length ?? 0) > 0;
        this._scheduleParseRowsAndColumns();
    }
    get columns() {
        return this._columns;
    }

    @api 
    set isNoData(val) {
        this._isNoData = val;
        if (val) {
            this._rows = [];
            this.noResultsFound = false;
            this.isDataLoaded = true;
            this.dispatchEvent(new CustomEvent('ready', { detail: 'ready' } ));
        }
    }
    get isNoData() {
        return this._isNoData ?? false;
    }

    _noResultsColSpan;
    @api // Rows for the table
    set rows(value) {
        this._rows = value ?? [];
        if (!value?.length && this._uncommittedSearchTerm) {
            this._rows = ['i'];
            const extras = [this.suppressRowActions, this.suppressCheckboxes, this.suppressRowCount]
                .filter(v => v === false).length;
            this._noResultsColSpan = this.localColumns?.length + extras;
            this.noResultsFound = true;
        } else {
            this.noResultsFound = false;
        }
        this.stableRows = value ?? []; // you can remove later if you deprecate it
        this._hasRows = (this._rows?.length ?? 0) > 0;
        this.resetMaxHeight();
        this._scheduleParseRowsAndColumns();
    }
    get rows() {
        return this._rows;
    }
    
    // Parse rows and columns once per render-cylce
    _scheduleParseRowsAndColumns() {
        if (this._parseScheduled) return;
        this._parseScheduled = true;
        Promise.resolve().then(() => {
            this._parseScheduled = false;
            if (!this._hasCols) {
                return;
            }
            // If your columns depend on picklists and you want to avoid a “double build”
            if (this._objectInfos && !this._picklistsReady) {
                return;
            }
            this._gotRadio = false;
            this.parseRowsAndColumns();
            this._newDbSort = false;
            if (this._listViewChanged) {
                requestAnimationFrame(() => {
                    this.resetWidthsToDefault();
                })
            }
            requestAnimationFrame(() => {
                updateOverflowYSimple(this);
                this.evalPresetsToColumns();
                this._listViewChanged = false;
                this._justSaved = false;
            })
        });
    }


    // height at which y-scroll is triggered
    isMaxHeightRendered = false;
    @api 
    set maxHeight(value) {
        if (value) {
            this._maxHeight = value ? value : '70vh';
            this._applyVarsDirect('--vg-max-height', value);
        }
        Promise.resolve().then(() => updateOverflowYSimple(this));
    }
    get maxHeight() {
        return this._maxHeight || 'calc(70vh - 50px)'; // Default if not set
    }


    _sortedCol;
    @api // Set the initial sortedByColumn when a list view loads
    set sortedCol(val) { 
        this._sortedCol = val; 
    }
    get sortedCol() { return this._sortedCol ?? null; }
    // ===================================================================== \\


    // Check if user can edit the list view in community setting
    _isAdminUser = false;
    @wire(isAdminUser)   
    wiredisAdminUser(result) {
        const { data, error } = result;
        if (data) {
            try {
                this._isAdminUser = data;
            } catch(error) {
                this.showToast('Error in parsing in wiredisAdminUser() of sldsTable.js', getErrorMessage(error), 'error');
            }
        } else if (error) {
            this.showToast('Error in wiredisAdminUser() of sldsTable.js: ', getErrorMessage(error), 'error');
        }
    } 


    _isLoading = false;
    // Refresh Apex 
    async handleRefresh() {
        this._isLoading = true;
        try {
            await refreshApex(this._wiredisAdminUserResult);
        }catch(error) {
            this.showToast('Error in handleRefresh() of sldsTable.js: ', getErrorMessage(error), 'error');
        } finally {
            this._isLoading = false;
        }
    }

    
    @wire(getObjectInfo, { objectApiName: '$_wiredObjectName' })
    _objectInfos;

    // Fetch Picklist Values by Record Type
    _picklistsReady = false;
    _picklistHash = '';
    @wire(getPicklistValuesByRecordType, {
        objectApiName: "$_wiredObjectName",
        recordTypeId: "$_objectInfos.data.defaultRecordTypeId"
    })
    wiredPicklistValues({ error, data }) {
        if (data) {
            //console.log('Got the picklist values in wiredPicklist() of sldsTable.js: ', data);
            const picklistVals = {};
            for (const key of Object.keys(data.picklistFieldValues)) {
                const info = data.picklistFieldValues[key];
                picklistVals[key] = info.values.map(v => ({
                    value: v.value,
                    label: v.label,
                    attributes: v.attributes
                }));
            }

            // Optional: cheap change detection so we don’t reparse for identical payloads
            const nextHash = `${Object.keys(picklistVals).length}:${Object.keys(picklistVals).join('|')}`;

            this._wiredPicklistVals = picklistVals;
            this._picklistsReady = true;

            if (nextHash !== this._picklistHash) {
                this._picklistHash = nextHash;
                this._scheduleParseRowsAndColumns();
            }
            return;
        }

        if (error) {
            console.error('Error fetching picklist values:', error);
        }
    }


    // Add refs to fields when wiredEntity prefixes ran
    _isAddingRefs = false;
    _lastRefsAllIdsKey = '';
    _scheduleAddRefsToFields() {
        if (this._refsScheduled) return;
        this._refsScheduled = true;

        Promise.resolve().then(() => {
            this._refsScheduled = false;
            this.addRefsToFields();
            if (this.isDbControlled) {
                this.handleDisplayOnlySortedCol();
            }
        });
    }
    _allRecordIds = undefined;
    _wiredEntityPrefixes;
    @wire(resolveEntityPrefixes, { recordIds: "$_allRecordIds"})
    wiredEntityPrefixes({ error, data }) {
        if (!this._allRecordIds?.length) return;

        if (data) {
            this._wiredEntityPrefixes = data;

            // Only run if this page’s ids changed
            const idsKey = this._allRecordIds.join('|');
            if (idsKey !== this._lastRefsAllIdsKey) {
                this._lastRefsAllIdsKey = idsKey;
                //this.addRefsToFields(); // runs once per Page
                this._scheduleAddRefsToFields();
            }
            return;
        }

        if (error) {
            console.error('Error fetching entity prefixes:', getErrorMessage(error));
        }
    }


    get checkboxThCl() {
        return 'slds-cell_action-mode ' + `${
            this.suppressRowCount 
                ? 'slds-text-align_right check-th-normal' 
                : 'slds-text-align_right check-th-small'
        }`;
    }   

    get _isMultiEditPopover() {
        return this.checkboxArray?.length > 0;
    }
    get _isPopover() {
        return this.checkboxArray?.length < 1;
    }

    _isApplyToAll = false;
    _isApplyClicked = false;
    handleEditAllSelectedRows() {
        this._isApplyToAll = !this._isApplyToAll;
    }



    get _userDisplayFields() {
        if (this.colWidthConfigName || this.sortConfigName) {

            if (this.colWidthConfigName && this.sortConfigName) {
                return ['Id', this.colWidthConfigName, this.sortConfigName];
            } 

            return this.colWidthConfigName 
                ? ['Id', this.colWidthConfigName]
                : ['Id', this.sortConfigName];
        }

        return undefined;
    }
    
    _currentTableConfig;
    _currentColConfig;
    _tableConfigsResult;
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
                this._tableConfigsResult = data;

                const raw = data?.[this.colWidthConfigName];
                const effectiveListViewKey = this._effectiveListViewKey;

                this._currentTableConfig = (typeof raw === 'string' && raw)
                    ? JSON.parse(raw)
                    : (raw || null);

                if (effectiveListViewKey) {
                    this._currentColConfig = this.colWidthConfigName === COLUMN_WIDTHS_ALL_JSON_FIELD.fieldApiName 
                        ? this._currentTableConfig?.[this.objectName]?.[effectiveListViewKey] ?? null
                        : this._currentTableConfig?.[effectiveListViewKey] ?? null;
                }
                this.evalPresetsToColumns();
            } catch(error) {
                this.showToast('Error in parsing in wiredfetchUserDisplaySettings() of sldsTable.js', getErrorMessage(error), 'error');
            }
        } else {
            this._tableConfigsResult = null;
        } 
         
        if (error) {
            this.showToast('Error in wiredfetchUserDisplaySettings() of sldsTable.js: ', getErrorMessage(error), 'error');
        }
    } 
    evalPresetsToColumns() {
        try {
            if (!this._tableConfigsResult || !this._columns?.length) return;
            const effectiveListViewKey = this._effectiveListViewKey;
            this._currentColConfig = this.colWidthConfigName === COLUMN_WIDTHS_ALL_JSON_FIELD.fieldApiName 
                ? this._currentTableConfig?.[this.objectName]?.[effectiveListViewKey] ?? null
                : this._currentTableConfig?.[effectiveListViewKey] ?? null;

            if (this._currentColConfig) {
                this._columns = mapPresetsToColWidths(this._currentColConfig, this._columns);
                if (this.localColumns?.length) {
                    this.localColumns = mapPresetsToColWidths(this._currentColConfig, this.localColumns);
                }
                return;
            } 

            if (isValidProperty(this.colWidthConfigName, this._tableConfigsResult)) {
                const raw = this._tableConfigsResult[this.colWidthConfigName];

                // raw could already be an object, or it could be a JSON string
                const presetsByView = (typeof raw === 'string' && raw)
                    ? JSON.parse(raw)
                    : (raw || null);

                const presetsForThisView = this.colWidthConfigName === COLUMN_WIDTHS_ALL_JSON_FIELD.fieldApiName
                    ? presetsByView?.[this.objectName]?.[effectiveListViewKey] ?? null
                    : presetsByView?.[effectiveListViewKey] ?? null;


                if (Array.isArray(presetsForThisView) && presetsForThisView.length) {
                    this._columns = mapPresetsToColWidths(presetsForThisView, this._columns);
                    if (this.localColumns?.length) {
                        this.localColumns = mapPresetsToColWidths(presetsForThisView, this.localColumns);
                    }
                } else {
                    this._columns = (this._columns ?? []).map(col => ({...col, width: null}));
                    this.localColumns = (this.localColumns ?? []).map(col => ({...col, width: null}));
                }
            }

            if (isValidProperty(this.sortConfigName, this._tableConfigsResult)) {
                //const onLoadSort = this._tableConfigsResult[this.sortConfigName];
            }
        } catch (error) {
            this.showToast('Error in evalPresetsToColumns() of sldsTable.js', getErrorMessage(error), 'error');
        }
    }
    resetWidthsToDefault() {
        this._columns = (this._columns ?? []).map(c => ({...c, width: undefined}));
        this.localColumns = (this.localColumns ?? []).map(c => ({...c, width: undefined}));
    }
    // Save the Column Widths
    @api async saveColumnWidths() {
        this.isLoading = true;
        try {
            // Call the data table for the current columnn widths
            const colWidths = this.getColumnWidths();
            const effectiveListViewKey = this._effectiveListViewKey;

            if (colWidths && colWidths.length > 1) {
                // Update the column widths before saving so user does not have to reload the page
                this._columns = mapPresetsToColWidths(colWidths, this._columns);
                this.localColumns = mapPresetsToColWidths(colWidths, this.localColumns);

                let userSettings;
                if (effectiveListViewKey) {
                    const raw = this._tableConfigsResult?.[this.colWidthConfigName];
                    const presetsByView = (typeof raw === 'string' && raw)
                        ? JSON.parse(raw)
                        : (raw || {});

                    if (this.colWidthConfigName === COLUMN_WIDTHS_ALL_JSON_FIELD.fieldApiName) {
                        presetsByView[this.objectName] = {
                            ...(presetsByView[this.objectName] || {}),
                            [effectiveListViewKey]: colWidths
                        };
                    } else {
                        presetsByView[effectiveListViewKey] = colWidths;
                    }

                    userSettings = {[this.colWidthConfigName]: JSON.stringify(presetsByView)};
                    await saveUserDisplaySettings({userId: this._userId, userSettings: userSettings});
                    await this.clearColWidthsOnSave(effectiveListViewKey, colWidths, userSettings, presetsByView);
                } else {
                    // Store the current column widths as a JSON object in the Apex method argument 
                    userSettings = {[this.colWidthConfigName]: JSON.stringify(colWidths)};
                    
                    // Save the column widths to the User Settings
                    await saveUserDisplaySettings({userId: this._userId, userSettings: userSettings});
                }

                // Succesful Save
                this.showToast('Columns widths successfully saved', '', 'success');

                await refreshApex(this._wiredUserDisplaySettingsResult);

            } else {
                this.showToast('Error Saving Column Widths', 'Failed to retrieve the column widths, please try again or contact an administrator', 'error');
            }
        } catch(error) {
            this.showToast('Error in saveColumnWidths() of sldsTable.js', getErrorMessage(error), 'error');
        } finally {
            this.isLoading = false;
        }
    }  
    _lastSavedColWidthsJson;
    _lastSavedViewApiName;
    // Save widths under a list-view key inside one JSON field
    @api async saveColumnWidthsListViewApi(isPct=false) {
        this.isLoading = true;

        // ✅ pin the view at the moment user clicked save
        const viewApiName = this._effectiveListViewKey;

        try {
            if (!viewApiName) {
                this.showToast('Error Saving Column Widths', 'No list view name was provided.', 'error');
                return;
            }

            const colWidths = isPct 
                ? this.getColumnWidths() 
                : this.getColumnWidthsInPixels();

            this._lastSavedColWidthsJson = JSON.stringify(colWidths);
            this._lastSavedViewApiName = viewApiName;
            if (!colWidths || colWidths.length <= 1) {
                this.showToast('Error Saving Column Widths', 'Failed to retrieve the column widths.', 'error');
                return;
            }

            const raw = this._tableConfigsResult?.[this.colWidthConfigName];
            const presetsByObject = (typeof raw === 'string' && raw)
                ? JSON.parse(raw)
                : (raw || {});

            if (this.colWidthConfigName === COLUMN_WIDTHS_ALL_JSON_FIELD.fieldApiName) {
                presetsByObject[this.objectName] = {
                    ...(presetsByObject[this.objectName] || {}),
                    [viewApiName]: colWidths
                };
            } else {
                presetsByObject[viewApiName] = colWidths;
            }

            const userSettings = { [this.colWidthConfigName]: JSON.stringify(presetsByObject) };

            await saveUserDisplaySettings({
                userId: this._userId,
                userSettings: userSettings
            });

            await this.clearColWidthsOnSave(viewApiName, colWidths, userSettings, presetsByObject);


            // refresh wire cache (server truth)
            await refreshApex(this._wiredUserDisplaySettingsResult);

            this.showToast('Columns widths successfully saved', '', 'success');
        } catch (error) {
            this.showToast('Error in saveColumnWidthsListViewApi() of sldsTable.js', getErrorMessage(error), 'error');
        } finally {
            this.isLoading = false;
        }
    }
    // Clear all <th> styles after saving the config
    async clearColWidthsOnSave(viewApiName, colWidths, userSettings, presetsByView) {
        
        // ✅ keep local state consistent with what evalPresetsToColumns() actually reads
        this._tableConfigsResult = {
            ...(this._tableConfigsResult || {}),
            [this.colWidthConfigName]: userSettings[this.colWidthConfigName]
        };
    
        this._currentTableConfig = presetsByView;
        this._currentColConfig = this.colWidthConfigName === COLUMN_WIDTHS_ALL_JSON_FIELD.fieldApiName
            ? presetsByView?.[this.objectName]?.[viewApiName] ?? null
            : presetsByView?.[viewApiName] ?? null;


        // ✅ IMPORTANT for SLDS <table>: clear any inline widths already applied in the DOM
        const table = this.template.querySelector('table');
        if (table) {
            // clear TH widths
            const ths = Array.from(table.querySelectorAll('thead th'));
            ths.forEach(th => {
                if (th) {
                    if (th?.dataset?.isFixedWith !== 'true') {
                        th.style.width = '';
                        th.style.minWidth = '';
                        th.style.maxWidth = '';
                    }
                }
            });

            // clear COLGROUP widths (if you use colgroup anywhere)
            const cols = Array.from(table.querySelectorAll('colgroup col'));
            cols.forEach(col => {
                if (!col?.dataset?.isFixedWith === "true") {
                    col.style.width = '';
                    col.style.minWidth = '';
                    col.style.maxWidth = '';
                }
            });
        }

        // ✅ if you have any cached baseline widths logic, invalidate it
        this._initWidths = null;

        // ✅ force header rebuild so the browser reflows with the new widths
        const prevColumns = this._columns;
        const prevLocalColumns = this.localColumns;

        this._columns = [];
        this.localColumns = [];

        await new Promise(resolve => requestAnimationFrame(resolve));

        this._columns = prevColumns;
        this.localColumns = prevLocalColumns;

        // apply using the pinned view
        const currentView = this._listViewApiName;
        const currentListViewName = this._listViewName;
        if (this._listViewApiName) {
            this._listViewApiName = viewApiName;
        } else {
            this._listViewName = viewApiName;
        }
        this.evalPresetsToColumns();
        this._listViewApiName = currentView;
        this._listViewName = currentListViewName;
    }


    // ========================= Public Methods ============================ \\
    // Reset the column widths back to their original config  ---> 
    // ...If already have _initWidths % per column, also store px
    _initFixedPx = null;
    @api resetColumnWidths(resetTable=false) {
        resetColumnWidths(this);
        if (resetTable) {
            const table = this.template.querySelector('table');
            table.style.width = '100%';
        }
    }

    // Clear draft values and remove edited classes 
    @api async resetTable() {
        try {
            this.isTableEdited = false;
            await this.clearDrafts();
            await this.resetCellClasses();
            clearCheckboxes(this);
        } catch(error) {
            this.showToast('Error in resetTable() of sldsTable.js', getErrorMessage(error), 'error');
        }
    }

    // Return the current column widths as %.  Structure: [ {fieldName: "<col.fieldName>", width: "x%"} ]
    @api getColumnWidths() {
        // Get the table element and ensure it exists
        const tableElement = this.template.querySelector('table');
        if (!tableElement) {
            return [];
        }
    
        // Retrieve all header cells
        const allThs = tableElement.querySelectorAll('thead th[data-element="tableColumn"]');
        const totalTableWidth = tableElement.offsetWidth;
    
        // Build an array of column configurations
        const currentWidths = [];
        allThs.forEach((th, index) => {
            if (th) {
                // Use the style width if available; otherwise, fallback to the offsetWidth
                const colWidth = parseFloat(th.style.width || th.offsetWidth);
                const percent = (colWidth / totalTableWidth) * 100;
        
                // Use a data attribute for fieldName if available, otherwise generate one (e.g., 'col1')
                const fieldName = th.dataset.fieldName || `col${index + 1}`;
        
                currentWidths.push({
                    fieldName: fieldName,
                    width: percent.toFixed(2) + "%"  // Store the percentage as a string with 2 decimal places
                });
            }
        });
    
        return currentWidths;
    }
    @api getColumnWidthsInPixels() {
        const tableElement = this.template.querySelector('table');
        if (!tableElement) return [];

        const allThs = tableElement.querySelectorAll('thead th[data-element="tableColumn"]');

        const currentWidths = [];

        allThs.forEach((th, index) => {
            if (th) {
                const widthPx = th.getBoundingClientRect().width; // true rendered width
                const fieldName = th.dataset.fieldName || `col${index + 1}`;

                currentWidths.push({
                    fieldName,
                    width: Math.round(widthPx) + 'px'
                });
            }
        });

        return currentWidths;
    }

    // Return the checked rows
    @api async getCheckedRows() {
        return this.checkboxArray;
    }
    // Remove all the checked Rows
    @api async clearCheckboxes() {
        try {
            clearCheckboxes(this);
        } catch(error) {
            this.showToastError('clearCheckboxes()', 'sldsTable.js', error);
        }
    }
    // ====================================================================== \\
    
    // Trigger overflow-y/maxHeight recalibration
    resetMaxHeight() {
        this.isMaxHeightRendered = false;   // Trigger maxHeight recalibration
    }

    

    _gotRadio = false;
    // Trigger Scrolling if the height of the table exceedes @api maxHeight
    // ---++ Track the table's <relativeContainer> for popover positioning (x-slds-menu-popover-button)
    renderedCallback() {
        if (this.radio && !this._gotRadio) {
            const firstRadio = this.template .querySelector('[data-element="rowRadio"]');
             if (firstRadio) {
                requestAnimationFrame(() => {
                    firstRadio.click();
                    this._gotRadio = true;
                })
            }
        }
        // Get the table container to pass to <x-slds-menu-popover-button>   
        if (!this.relativeContainer) {
            // Get Relative container (outer div of the table) for SldsMenuButton
            const tableContainer = this.template.querySelector('.slds-table_edit_container');
            if (tableContainer) this.relativeContainer = tableContainer; 
        }
        handleTableOverflow(this);
    }

    // ======================= Parse Rows And Columns ======================= \\
    // Format the rows such that the row's fields are in the same order as the columns ---++ Add custom Atrributes to the <columns> & <rows>
    parseRowsAndColumns() {
        try {
            if (!this._rows?.length && this._columns?.length) {
                if (this._objectInfos) {
                    this._columns = prepareProductionColumns(this, this.columns, this._objectInfos, this._wiredPicklistVals);
                }
                this.localRows = [];
                this.stableRows = [];
                this._rows = [];
                this.localColumns = this._columns.map(col => {
                    const textStyle = isValidProperty('textStyle', col) &&
                        Object.keys(CELL_TEXT_STYLES).some(val => col.textStyle === val)
                        ? col.textStyle
                        : 'clipText';
                    return { ...col, colId: `${col.fieldName}-col`, textStyle };
                }) ?? [];
                this.dispatchEvent(new CustomEvent('ready', { detail: 'empty' } ));
                return;
            }
            if (this._rows?.length && this._columns?.length) {
                if (this._objectInfos) {
                    this._columns = prepareProductionColumns(this, this.columns, this._objectInfos, this._wiredPicklistVals);
                }
                // Map the fields from <rows> so that that each <row.fields> is in the same order as the <column.fieldName>s
                const rowsObj = mapRowsToColumns(
                    this._rows, 
                    this._columns, 
                    0, 
                    false, 
                    this.isSfListApi
                );
                const idxdRows = applyRowNumbers(rowsObj?.rows ?? [], this.pageToken);

                // Get all record ids (related and table object)
                const allRecIds = new Set(
                    rowsObj?.rows?.flatMap(r => {
                        const otherRecIds = r?.fields?.filter(f => IS_SF_ID(f?.value) || IS_SF_ID(f?.recordId))
                            ?.map(f => IS_SF_ID(f.value) ? f.value : f.recordId) 
                            ?? [];
                        return [r.id, ...otherRecIds]
                    }).filter(Boolean)
                );
                const nextAllIds = Array.from(allRecIds);
                const nextKey = nextAllIds.join('|');

                // Map the columns to localColumns and add a 'colId' property
                this.localColumns = this._columns.map(col => {
                    // Check for "wrapText", "clipText", "clampText" in 'textStyle' property
                    const textStyle = isValidProperty('textStyle', col) && 
                        Object.keys(CELL_TEXT_STYLES).some(val => col.textStyle === val)
                        ? col.textStyle 
                        : 'clipText';
                    return { ...col, colId: `${col.fieldName}-col`, textStyle: textStyle };
                }) ?? [];
                
                if (nextKey !== this._allRecordIdsKey) {
                    this._allRecordIdsKey = nextKey;
                    this._allRecordIds = nextAllIds;
                }
                
                this.localRows = idxdRows ?? [];    // Get <rows> from response object (keys: 'rows' & 'count')
                this.stableRows = idxdRows ?? [];    // Store the original rows

            } 
            this._scheduleAddRefsToFields();
            Promise.resolve().then(async () => {
                //await this.addRefsToFields();
                if (!this.isDbControlled) {
                    await persistSearchTerm(this);
                    await persistSort(this);
                }
                this.dispatchEvent(new CustomEvent('ready', { detail: 'ready' } ));
                this.isDataLoaded = true;
            });

        } catch(error) {
            this.showToastError('parseRowsAndColumns', 'sldsTable.js', error);
        }
    }
    async addRefsToFields() {
        if (this._isAddingRefs) return;

        try {
            if (!this.localRows?.length) {
                return;
            }

            // If already has urls everywhere, skip fast
            const anyNeeds = this.localRows.some(row =>
                row?.fields?.some(f =>
                    f?.isClickable &&
                    (f?.dtype === 'reference' || f?.dtype === 'name') &&
                    !f?.url
                )
            );
            if (!anyNeeds) return;

            this._isAddingRefs = true;

            // Patch-only version is safer than Promise.all over all rows
            const nextRows = [...this.localRows];

            for (let i = 0; i < nextRows.length; i++) {
                const row = nextRows[i];

                const needsRefs = row?.fields?.some(f =>
                    f?.isClickable &&
                    (f?.dtype === 'reference' || f?.dtype === 'name') &&
                    !f?.url
                );
                if (!needsRefs) continue;

                const enrichedFields = row.fields.map(f => {
                    if (!f?.isClickable) return f;

                    if (f?.dtype === 'name') {
                        return { ...f, objectApiName: this.objectName, recordId: row?.Id ?? row?.id };
                    }
                    if (f?.dtype === 'reference' && f?.value && IS_SF_ID(f.value) && this._wiredEntityPrefixes) {
                        const objectApiName = getObjectApiNameByPrefix(f.value, this._wiredEntityPrefixes);
                        return { ...f, objectApiName };
                    }
                    return f;
                });

                const reffedFields = await addPageRefsFieldsArr(enrichedFields, this);
                nextRows[i] = { ...row, fields: reffedFields };

                // yield occasionally so UI never freezes
                if (i % 20 === 0) {
                    await new Promise(resolve => requestAnimationFrame(resolve));
                }
            }

            this.localRows = nextRows;
            this.stableRows = this.localRows;
        } catch (error) {
            this.showToastError('addRefsToFields', 'sldsTable.js', error);
        } finally {
            this._isAddingRefs = false;
        }
    }
    // ====================================================================== \\

    // Open external urls
    openExternalLink(event) {
        try {
            event.preventDefault(); 
            const link = event.currentTarget.getAttribute('value');
            if (link) {
                openExternalUrl(link, this);
            }
        } catch(error) {
            this.showToast('Error in openExternalLink() of sldsFormElementStatic.js', getErrorMessage(error), 'error');
        }
    }

    // ===================== Search List View Handlers ======================= \\
    noResultsFound = false;
    _searchTerm;
    _uncommittedSearchTerm;
    async handleSearchFilter(message) {
        this._searchTerm = message.detail;
        this._uncommittedSearchTerm = message.detail;
        if (this.isDbControlled) {
            this.noResultMsg = `No results matching "${message.detail}"`;
            this.dispatchEvent(new CustomEvent('search', { detail: message.detail } ));
            return;
        }

        // updates localRows (data only)
        handleSearchFilter(message, this); 

        // Wait for DOM to reflect the new localRows
        await new Promise(requestAnimationFrame);

        // Now it is safe to touch DOM
        if (!this.isDbControlled) {
            persistCheckedRows(this);
            persistEditedFields(this);
            await persistSort(this);
        }

        // And only now run highlight/reset against the actual cells
        handleEveryFilter({ detail: this._uncommittedSearchTerm || '' }, this);
    }
    handleEveryFilter(message) {
        this._uncommittedSearchTerm = message.detail;
        handleEveryFilter(message, this);
        Promise.resolve().then(() => {
            persistCheckedRows(this);
            persistEditedFields(this);  
        })
    }
    // ======================================================================= \\


    // ======================= Height/OverFlow Handlers ======================= \\
    _onWinResize = null;
    _prevOverflowY = null;
    _onKeyDown;
    _onKeyUp;
    connectedCallback() {
        let t;
        this._onWinResize = () => {
            clearTimeout(t);
            t = setTimeout(() => updateOverflowYSimple(this), 50);
        };
        window.addEventListener('resize', this._onWinResize);

        // ================= Mutli-checkbox "Shift" Listeners ================= \\
        this._onKeyDown = (e) => {
            if (e.key === 'Shift' && !this._shiftHeld) {
                this._shiftHeld = true;
                this.template.querySelector('[data-element="tableRoot"]')?.classList.add('no-select');
            }
        };
        this._onKeyUp = (e) => {
            if (e.key === 'Shift' && this._shiftHeld) {
                this._shiftHeld = false;
                this.template.querySelector('[data-element="tableRoot"]')?.classList.remove('no-select');
            }
        };
        window.addEventListener('keydown', this._onKeyDown, true);
        window.addEventListener('keyup', this._onKeyUp, true);
        // ==================================================================== \\
    }
    disconnectedCallback() {
        if (this._onWinResize) {
            window.removeEventListener('resize', this._onWinResize);
            this._onWinResize = null;
        }
        this.cleanupOutsideClick();
    }
    // ====================================================================== \\


    // Table-level click delegation
    handleTableClick(event) {
        try {
            const target = event.target;

            const checkbox = target
                ?.closest('.slds-checkbox')
                ?.querySelector('[data-element="rowCheckbox"]');

            // Not a row checkbox → ignore
            if (!checkbox || checkbox.dataset.element !== 'rowCheckbox') {
                this._lastChecked = null;
                return;
            }

            // Native checkbox clicks and Space keypresses already update checked.
            // Use that post-toggle state here so delegated row selection does not flip it back.
            if (target !== checkbox) return;

            // This is the element that replaces event.currentTarget
            const recordId    = checkbox.value;
            const shouldCheck = checkbox.checked;           // post-click state
            const isShift     = event.shiftKey === true;    // shift state at click

            // All visible row checkboxes in DOM order (respects current sort/filter)
            const checkboxes = Array.from(
                this.template.querySelectorAll('[data-element="rowCheckbox"]')
            );

            // Keep a fast set of selected ids to add/remove without dupes
            const selected = new Set(this.checkboxArray);

            // ---- CLICKED ROW: update visual + model state ----
            {
                const rowEl = this.template.querySelector(
                    `[data-id="${checkbox.dataset.parentId}"]`
                );
                if (rowEl) {
                    if (shouldCheck) {
                        rowEl.classList.add('slds-is-selected');
                    } else {
                        rowEl.classList.remove('slds-is-selected');
                    }
                }

                if (shouldCheck) {
                    selected.add(recordId);
                } else {
                    selected.delete(recordId);
                }
            }

            // ---- SHIFT RANGE (anchor = this._lastChecked) ----
            if (isShift && this._lastChecked) {
                const lastIdx = checkboxes.findIndex(cb => cb.value === this._lastChecked);
                const currIdx = checkboxes.findIndex(cb => cb.value === recordId);

                if (lastIdx !== -1 && currIdx !== -1) {
                    const [lo, hi] =
                        lastIdx <= currIdx ? [lastIdx, currIdx] : [currIdx, lastIdx];

                    // Include both endpoints (anchor and current)
                    for (let i = lo; i <= hi; i++) {
                        const cb = checkboxes[i];

                        // Set checkbox and row visual state to match current click
                        cb.checked = shouldCheck;

                        const rowEl = this.template.querySelector(
                            `[data-id="${cb.dataset.parentId}"]`
                        );
                        if (rowEl) {
                            rowEl.classList.toggle('slds-is-selected', shouldCheck);
                        }

                        // Update selection model
                        if (shouldCheck) {
                            selected.add(cb.value);
                        } else {
                            selected.delete(cb.value);
                        }
                    }
                }

                // Move anchor to the *last clicked* item
                this._lastChecked = recordId;
            } else {
                // Single click: update anchor to the last clicked
                this._lastChecked = recordId;
            }

            // Commit selection array (stable order not required; Set prevents dupes)
            this.checkboxArray = Array.from(selected);

            // ---- Focus the *last clicked* checkbox (keeps focus at the end) ----
            requestAnimationFrame(() => {
                // In delegated handler, "checkbox" is our clicked element
                checkbox?.focus({ preventScroll: true });
            });

            this.evalSelectAllAfterCheck();

        } catch (error) {
            this.showToast(
                'Error in handleTableClick() of sldsTable.js: ',
                getErrorMessage(error),
                'error'
            );
        }
    }

    // Automatically edit checkbox cells
    handleBooleanCellClick(event) {
        try {
            event.stopPropagation();
            const btn = event.currentTarget ?? event.target;
            // if <isPressed> is true then value is currently "true"
            const isPressed = btn.checked;

            // Get the FieldName and Record Id
            const [fieldName, recordId] = btn.value.split('-');

            // Create a draft entry with the new value 
            const newDraft = {id: recordId, fieldName: fieldName, displayValue: `${isPressed}`, value: isPressed};

            // Check if record is current in drafts
            const matchedDraft = this.draftOriginalValues?.find(rec => rec?.id === recordId);

            // Check if value was edited back to its original value
            const isNotEdited = (matchedDraft && matchedDraft.hasOwnProperty(fieldName)) && 
                ( (!matchedDraft[fieldName]?.value && isPressed) || (matchedDraft[fieldName]?.value === isPressed) ) || false;

            // Cell that contains the button
            const cell = this.template.querySelector(`td[data-id="${btn.value}"]`);

            if (isNotEdited) {
                // Remove the field from Draft Values
                this.draftValues = this.draftValues.map(draft => {
                    if (draft.id === recordId) {
                        // Clear the Value from Drafts  
                        delete draft[fieldName];
                        // Remove the entire draft if the value is the same as the original
                        return Object.keys(draft).length > 1 
                            ? draft 
                            : null;
                    }
                    return draft;

                }).filter(Boolean);
            } else {
                this.updateDraftValueOnEdit(newDraft); // Store the current value in Drafts 
            }
        
            // Store the original value
            if (!matchedDraft) this.storeOriginalDraftValue(recordId, fieldName, !isPressed, `${!isPressed}`);

             // Update the field's value/label of the record that was edited
            this.assignPopOverValueToField(newDraft);        

            if (this.checkboxArray.length) {
                this.popoverEditCopy = newDraft;
                this.renderApplyEditsModal();
            }

            if (cell) {
                const isEdited = !cell.classList.contains('slds-is-edited');
                // Toggle 'slds-is-edited' class on the cell
                cell.classList.toggle('slds-is-edited');
                cell.classList.toggle('slds-no-row-hover');
                
                if (isEdited && !this.isTableEdited) {
                    this.isTableEdited = true;
                    this.dispatchEvent(new CustomEvent('edited', { detail: 'edited' } ));
                }

                if (!isEdited && this.draftValues?.length < 1) {
                    this.isTableEdited = false;
                }

            }

        } catch(error) {
            this.showToast('Error in handleBooleanCellClick() of sldsTable.js: ', getErrorMessage(error), 'error');
        }
    }


    // ~*~*~*~~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~ \\
    // ~*~*~*~~*~*~*~*~*~*~*~*~*~* Popover Edit / Draft Values ~*~*~*~*~*~*~*~*~*~*~~*~*~*~ \\
    // ~*~*~*~~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~ \\
    // +++ Helper +++  --> Cell Popover positioning helper 
    positionPopoverToCell(referenceEle, popoverSelector, isSide = false) {
        try {
            const cell = referenceEle.closest('td, th');
            if (!cell) return;

            const pop = this.template.querySelector(popoverSelector);
            if (!pop || !this.relativeContainer) return;

            // make measurable
            pop.classList.remove('slds-hide');
            pop.classList.add('slds-show');
            pop.style.visibility = 'hidden';
            pop.style.left = '0px';
            pop.style.top  = '0px';
            pop.offsetWidth; // force reflow

            const cRect = this.relativeContainer.getBoundingClientRect();
            const r = cell.getBoundingClientRect();
            const gutter = 8;

            // container-relative coordinates
            const cellLeft   = r.left  - cRect.left + this.relativeContainer.scrollLeft;
            const cellRight  = r.right - cRect.left + this.relativeContainer.scrollLeft;
            const cellTop    = r.top   - cRect.top  + this.relativeContainer.scrollTop;
            const cellBottom = r.bottom- cRect.top  + this.relativeContainer.scrollTop;

            const popW = pop.offsetWidth;
            const popH = pop.offsetHeight;

            // Flag whether popover is to left of cell ---> when isSide is true 
            let left, top;

            if (isSide) {
                // --- Side positioning ---
                top = cellTop - 24; // align to top of the cell
                // prefer right side
                if (cellRight + popW + gutter <= this.relativeContainer.scrollLeft + this.relativeContainer.clientWidth) {
                    left = cellRight + gutter; // to the right of cell
                    this.nubbin = 'left-top';
                } else {
                    left = cellLeft - popW - gutter; // fallback left of cell
                    this.nubbin = 'right-top';
                }
            } else {
                // --- Your existing "overlay-ish" logic ---
                left = cellLeft;
                if (cellRight + popW > this.relativeContainer.scrollLeft + this.relativeContainer.clientWidth - gutter) {
                    left = cellRight - popW;
                }
                left = Math.max(this.relativeContainer.scrollLeft + gutter,
                                Math.min(left, this.relativeContainer.scrollLeft + this.relativeContainer.clientWidth - gutter - popW));

                top = cellTop;
                if (cellBottom + popH > this.relativeContainer.scrollTop + this.relativeContainer.clientHeight - gutter) {
                    top = cellBottom - popH;
                }
                top = Math.max(this.relativeContainer.scrollTop + gutter,
                    Math.min(top, this.relativeContainer.scrollTop + this.relativeContainer.clientHeight - gutter - popH));
            }

            pop.style.left = `${left}px`;
            pop.style.top  = `${top}px`;
            pop.style.visibility = 'visible';

        } catch(error) {
            this.showToast('Error in positionPopoverToCell() of sldsTable.js: ', getErrorMessage(error), 'error');
        }
    }
    // ====================== Initialize Edit Popover ======================= \\
    // Display edit popover when cell is clicked
    handleEditClick(event) {
        try  {
            const button = event.currentTarget;
            const cell = button.closest('td, th');

            // Get the field name and record id of the clicked cell
            const currentRecordField = button.dataset.fieldId;
            if (!currentRecordField) return;

            // Initiate the <popoverEdit> Object
            this.fieldIdToPopoverEdit(currentRecordField);

            this.positionPopoverToCell(button, '.slds-popover_edit');

            // Focus the popover input element
            setTimeout(() => {
                switch(true) {
                    case this.popoverEdit.dtype === 'picklist': 
                        const picklist = this.template.querySelector('c-dropdown-plain');
                        if (picklist) {
                            picklist.focusMe();
                        }
                        break;
                    
                    case this.popoverEdit.dtype === 'multipicklist':
                        this.template.querySelector('c-custom-slds-combobox-multi-select-practice').focusMe();
                        break;

                    case this.popoverEdit.dtype === 'reference':
                        break;

                    default:
                        this.template.querySelector('c-slds-input').focusMe();
                        break;
                }
            }, 30);

            if (this._isMultiEditPopover && !this._outsideClickHandler) {
                this._outsideClickHandler = this.handleOutsideClick.bind(this);
            }
            // capture phase so we see the click before LWC stops propagation
            window.addEventListener('mousedown', this._outsideClickHandler, true);
                
        
        }catch(error) {
            this.showToastError('handleEditClick', 'sldsTable.js', error);
        }
    }
    // Find the record whose field was edit-clicked
    fieldIdToPopoverEdit(fieldId) {
        try  {
            // Split the dataset.fieldId from the button to get the recordId/fieldName
            const fieldName = fieldId.split('-')[0];
            const recordId = fieldId.split('-')[1];
            // Find the record in the <rows> array
            const record = this.localRows.find(rec => rec.id === recordId || rec.Id === recordId);
    
            if (record) {
                // Find the field in the <record.fields> array
                const fieldEntry = record.fields.find(f => f.fieldName === fieldName);

                const boolProp = fieldEntry.dtype === 'name' ? 'istext'
                    :`is${fieldEntry.dtype}` || 'istext';

                const colMatch = this.localColumns.find(col => col.fieldName === fieldEntry.fieldName);

                const fMeta = this._objectInfos?.data?.fields?.[fieldEntry.fieldName];
                const refInfos = fMeta?.referenceToInfos;
                const objectApiName = refInfos[0]?.apiName;

                if (fieldEntry.dtype === 'picklist' || fieldEntry.dtype === 'multipicklist') {
                    this.picklistOptions = colMatch.options;
                }

                // use the record.field properties to initiate the <popoverEdit> Object
                this.popoverEdit = {
                    id: recordId,
                    fieldName: fieldEntry.fieldName, 
                    displayValue: fieldEntry.displayValue, 
                    fieldLabel: colMatch?.label,
                    value: fieldEntry.value, 
                    dtype: fieldEntry?.dtype ?? colMatch?.dtype ?? 'text',
                    fieldId: fieldId,
                    objectApiName: fieldEntry.objectApiName ?? objectApiName,
                    [boolProp]:  true,
                }
                this.popoverEditCopy = {id: recordId, fieldName: fieldEntry.fieldName};
            } 
        }catch(error) {
            this.showToastError('fieldIdToPopoverEdit', 'sldsTable.js', error);
        }
    }
    // ====================================================================== \\
    
    // ==================== Apply Edit To All Rows Modal ==================== \\
    // Render the modal with the correct messaging
    renderApplyEditsModal() {
        //return;
        this.modalConfig = {
            tableModalMessage: `Apply edit to the ${this.checkboxArray.length} selected rows?`,
            modalCancelLabel: 'Cancel',
            modalOkayLabel: 'Okay',
            tableModalHandler: this.applyAllEdits.bind(this)
        }
        setTimeout(() =>  {
            const modalEle = this.template.querySelector('[data-id="checkboxModal"]');
            if (modalEle) {
                modalEle.showMe();
            }   
        })
    }
    
    // Accept the response from the child modal component  --->  apply the changes to all the rows if confirmed
    applyAllEdits(message) {
        try {
            const result = message?.detail;

            // Cancel path
            if (result === 'cancel') {
                this.popoverEditCopy = {};
                return;
            }

            this.isLoading = true;

            const popoverCopy = this.popoverEditCopy || {};
            const fieldName = popoverCopy.fieldName;
            const triggerId = popoverCopy.id;

            // Hard guard: if modal returned "confirm" but we lost state
            if (!fieldName || !triggerId) {
                this.popoverEditCopy = {};
                this.modalConfig = {};
                this.isLoading = false;
                return;
            }

            const triggerRecFieldId = `${fieldName}-${triggerId}`;

            // Get dtype for coercion
            const dtype = this._columns?.find(col => col.fieldName === fieldName)?.dtype;

            // Pre-coerce the value once
            const coercedValue = coerceByDtype(popoverCopy.value, dtype);

            // Apply to all checked records except the trigger record
            for (const recId of (this.checkboxArray || [])) {
                if (!recId || recId === triggerId) continue;

                // Find the record in localRows 
                const origRec = this.localRows?.find(r => r?.id === recId)
                    ?? this.stableRows?.find(r => r?.id === recId);

                if (!origRec || !Array.isArray(origRec.fields)) {
                    // Nothing to edit for this row
                    continue;
                }

                // Find field within the record
                const origField = origRec.fields.find(f => f?.fieldName === fieldName);
                if (!origField) {
                    // Row doesn't have that field
                    continue;
                }

                // Use value if present; otherwise fall back to displayValue
                // (your logged origField objects sometimes omit `value`)
                const originalValue = Object.prototype.hasOwnProperty.call(origField, 'value')
                    ? origField.value
                    : origField.displayValue;

                const original = {
                    id: recId,
                    fieldName,
                    displayValue: origField.displayValue ?? null,
                    value: originalValue
                };

                const newDraft = {
                    id: recId,
                    fieldName,
                    displayValue: popoverCopy.displayValue ?? null,
                    value: coercedValue
                };

                const fieldId = `${fieldName}-${recId}`;

                // Store original values (must never create an undefined field entry)
                this.storeOriginalDraftValue(original.id, original.fieldName, original.value, original.displayValue);

                // Update drafts + UI
                this.updateDraftValueOnEdit(newDraft);
                this.assignPopOverValueToField(newDraft);

                // Safely compare original vs new to decide edited styling
                const origDraftRec = this.draftOriginalValues?.find(d => d?.id === recId);
                const origEntry = origDraftRec?.[fieldName];

                const isReverted =
                    origEntry &&
                    (
                        origEntry.value === newDraft.value ||
                        (!origEntry.value && !newDraft.value)
                    );

                if (isReverted) {
                    this.removeIsEdited(fieldId);
                } else {
                    this.focusCellOnEdit(fieldId, true, false);
                }
            }

            // Now handle the trigger record's "edited" styling
            const triggerOrigDraftRec = this.draftOriginalValues?.find(d => d?.id === triggerId);
            const triggerEntry = triggerOrigDraftRec?.[fieldName];

            const triggerIsReverted =
                triggerEntry &&
                triggerEntry.value === popoverCopy.value;

            if (triggerIsReverted) {
                this.removeIsEdited(triggerRecFieldId);
            } else {
                // add slds-is-edited
                this.focusCellOnEdit(triggerRecFieldId, true);
            }

            // Cleanup
            this.popoverEditCopy = {};
            this.modalConfig = {};
            this.isLoading = false;
            this._isApplyToAll = false;
            this._isApplyClicked = false;

        } catch (error) {
            this.isLoading = false;
            this.showToast('Error in applyAllEdits() of sldsTable.js: ', getErrorMessage(error), 'error');
        }
    }

    handleApplyAllCancel() {
        try {
            this.popoverEdit = {};
            this.template.querySelector('[data-id="popoverEdit"]')?.classList?.replace('slds-show', 'slds-hide');
            if (this._outsideClickHandler) {
                window.removeEventListener('mousedown', this._outsideClickHandler, true);
            }
            this._isApplyToAll = false;
        } catch(error) {
            this.showToast('Error in handleApplyAllCancel() of sldsTable.js', getErrorMessage(error), 'error');
        }
    }

    handleApplyAllOkay() {
        try {
            // Assign the value to the drafts ---++  Clear the popoverEdit
            this._isApplyClicked = true;
            const dtype = this.popoverEdit.dtype;

            let ele;
            switch(dtype) {
                case 'multipicklist': 
                    ele = this.template.querySelector('c-custom-slds-combobox-multi-select-practice');
                    break;
                case 'picklist': 
                    ele = this.template.querySelector('[data-id="picklistEdit"]'); 
                    break;
                default:
                    ele = this.template.querySelector('c-slds-input'); 
                    break;
            }
            if (!ele) return;

            let val;
            let displayVal;
            const response = ele.getValue();

            if (dtype === 'multipicklist') {
                const {label, value} = formatMultiPicklistVal(response.map(obj => obj?.value));
                val = value;
                displayVal = label;

            } else if (typeof response === 'object' && response.displayVal) {
                val = response.value;
                displayVal = response.displayVal;
            } else {
                val = response;
                val = coerceByDtype(val, dtype);
            }

            // Store the original value if the cell was edited
            if (this.popoverEdit && !this.popoverEdit.isEdited && this.popoverEdit.value != val) {
                this.popoverEditCopy.id = this.popoverEditCopy.id;
                // Store the original value of the Record's field
                this.popoverEdit.isEdited = true;
                this.storeOriginalDraftValue(
                    this.popoverEdit.id, 
                    this.popoverEdit.fieldName, 
                    this.popoverEdit.value, 
                    this.popoverEdit.displayValue
                );
            }   

            if (val !== undefined) {
                if (dtype === 'multipicklist' && val) {
                    this.popoverEdit.displayValue = displayVal;
                    this.popoverEdit.value = val;
                    this.popoverEditCopy.displayValue = displayVal;
                    this.popoverEditCopy.value = val;

                } else if (dtype === "reference") {
                    this.popoverEdit.displayValue = displayVal;
                    this.popoverEdit.value = val;
                    this.popoverEditCopy.displayValue = displayVal;
                    this.popoverEditCopy.value = val; 

                } else if (NON_NAV_TARGETS.has(this.popoverEdit.fieldName)) {
                    if (Array.from(NOT_NAV_TARGET_HANDLERS).filter(nav => nav.toLowerCase().startsWith('recordtype'))) {
                        // Get the label from the Column's Picklist Options 
                        const matchedOption = this.localColumns
                            .find(col => col.fieldName === this.popoverEdit.fieldName)?.options
                            ?.find(option => option.value === val);

                        this.popoverEdit.value = val; 
                        this.popoverEdit.displayValue = matchedOption?.displayValue ?? `${val}`;
                        this.popoverEditCopy.value = val; 
                        this.popoverEditCopy.displayValue = matchedOption?.displayValue ?? `${val}`;

                    }
                } else {
                    // Update the popoverEdit's value 
                    this.popoverEdit.value = dtype === 'multipicklist' ? val.join(';') : val;
                    this.popoverEdit.displayValue = `${val}` || '';
                    this.popoverEditCopy.value = val;
                    this.popoverEditCopy.displayValue = `${val}` || '';   
                }
            }

            // Assign the value to the drafts ---++  Clear the popoverEdit
            this.finishLocalEdit();
            this.removeEditPopover(true);
            this._isApplyToAll = false;

        } catch(error) {
            this.showToast('Error in applyAllOkay() of sldsTable.js: ', getErrorMessage(error), 'error');
        }
    }
    // ====================================================================== \\



    _outsideClickHandler;
    // Close Edit Popover when in Multi-Edit Mode on outside click 
    handleOutsideClick(event) {
        try {
            const popover = this.template.querySelector('[data-id="popoverEdit"]');
            if (!popover) return;

            const clientX = event.clientX;
            const clientY = event.clientY;
            const popRect = popover.getBoundingClientRect();

            // Check if user clicked inside the popover
            const clickInside = clientX >= popRect.left && clientX <= popRect.right &&
                clientY >= popRect.top && clientY <= popRect.bottom;

            if (clickInside) return; // 🚫 Abort if click inside

            // Defer to let focus move first
            setTimeout(() => {
                // Get the active element
                const activeElement = this.template.activeElement;
                if (activeElement?.dataset?.isPopoverEdit === 'true') {
                    return; // 🚫 Abort if active element is part of popover edit
                }

                // clicked outside popover + focus not in edit ➡️ close
                this.removeEditPopover(true);
                this.cleanupOutsideClick();
            }, 0);

        } catch (error) {
            this.showToast(
                'Error in handleOutsideClick() of sldsTable.js: ',
                getErrorMessage(error),
                'error'
            );
        }
    }
    handlePopoverEditKeydown(event) {
        if (!this._isMultiEditPopover) return;
        if (event && event.key === 'Escape') {
            event.preventDefault();
            this.removeEditPopover(true);
        }
    }
    cleanupOutsideClick() {
        if (this._outsideClickHandler) {
            window.removeEventListener('mousedown', this._outsideClickHandler, true);
        }
    }
    // =================== Handle Edit Popover Attributes =================== \\
    // --------------- Local Input Element --------------- \\
    // Get the value sent by the child component (<x-slds-input> / <x-dropdown-plain> / <x-slds-rich-text-editor>)
    handleInputMessage(event) {
        try  {
            if (!this._isPopover) return;
            // Get the updated value
            const details = event.detail;
            // Get the name of the component that sent the edits
            const dataId = event?.currentTarget?.dataset?.id; 

            const val = details !== null && typeof details === 'object' && !Array.isArray(details)
                ? details[Object.keys(details)[0]]
                : details;

            const newDisplayValue = details?.displayVal ?? '';
        
            // Store the original value if the cell was edited
            if (this.popoverEdit && !this.popoverEdit.isEdited && this.popoverEdit.value != val) {
                this.popoverEditCopy.id = this.popoverEditCopy.id;
                // Store the original value of the Record's field
                this.popoverEdit.isEdited = true;
                this.storeOriginalDraftValue(
                    this.popoverEdit.id, 
                    this.popoverEdit.fieldName, 
                    this.popoverEdit.value, 
                    this.popoverEdit.displayValue
                );
            }   

            if (val !== undefined) {
                if (dataId === 'multiPicklistEdit' && val) {
                    const {label, value} = formatMultiPicklistVal(val.map(obj => obj?.value));
                    this.popoverEdit.displayValue = label;
                    this.popoverEdit.value = value;
                    this.popoverEditCopy.displayValue = label;
                    this.popoverEditCopy.value = value;
                } else if (this.popoverEdit.dtype === 'reference') {
                    this.popoverEdit.value = val;
                    this.popoverEdit.displayValue = newDisplayValue;
                    this.popoverEditCopy.value = val;
                    this.popoverEditCopy.displayValue = newDisplayValue;
                } else {
                    // Update the popoverEdit's value 
                    this.popoverEdit.value = dataId === 'multiPicklistEdit' ? val.join(';') : val;
                    this.popoverEdit.displayValue = `${val}` || '';
                    this.popoverEditCopy.value = val;
                    this.popoverEditCopy.displayValue = `${val}` || '';   
                }
            }

            // Assign the value to the drafts ---++  Clear the popoverEdit
            this.finishLocalEdit();
            this.removeEditPopover(true);

        }catch(error) {
            this.showToastError('handleEditInputChange', 'sldsTable.js', error);
        }
    }
    // If Escape was not pressed --> save the value in editPopover if it differs from the orginal draft
    inputEleBlur(message=null) {
        try {
            if (!this._isPopover) return;
            if (message) {
                this.removeEditPopover(true);
                return;
            }
            
            if (!this.isEscape && this.popoverEdit && this.popoverEdit.isEdited) {
                // If was edited --> Store the new values
                this.popoverEditCopy = JSON.parse(JSON.stringify(this.popoverEdit));
                this.finishLocalEdit();
                return;
            }

            // Clear the popover without adding any edits
            this.removeEditPopover(true);
        }catch(error) {
            this.showToastError('handlePopoverBlur', 'sldsTable.js', error);
        }
    }
    // Flag 'Escape' keydowns ---++ force blur on 'Enter' click
    inputEleKeyDown(event) {
        try {
            // Check if is a number edit so that user can increment with arrow keys
            if (
                ['isnumber', 'ispercent', 'iscurrency', 'isdecimal'].some(typeBool => this.popoverEdit[typeBool])  
                && ['ArrowUp', 'ArrowDown'].some(arw => event.key === arw) 
            ) {
                this.isPreventBlur = true;
            } 

            if (event.key === 'Escape') {
                this.isEscape = true;
                event.target.blur();

            } else if (event.key === 'Enter') {
                if (this.popoverEdit.isEdited) {
                    this.finishLocalEdit();
                }
                this.isEscape = false;
                event.target.blur();
            } 
        
        }catch(error) {
            this.showToastError('editPopoverKeyDown', 'sldsTable.js', error);
        }
    }
    // Prevent blurring if the input element is clicked
    inputEleMouseDown() {
        this.isPreventBlur = true;
    }
    // --------------------------------------------------- \\
    // ====================================================================== \\

    // ======================= Finalize Edit Popover ======================== \\
    // Remove the popover from the DOM
    removeEditPopover(isClearPopoverEdit=false) {
        try {
            const popover = this.template.querySelector('[data-id="popoverEdit"]'); 
            if (popover) {
                popover.classList.add('slds-hide');
                popover.classList.remove('slds-show');
            }
            if (isClearPopoverEdit) {
                this.popoverEdit.isEdited = false;
                this.finishLocalEdit();
                this.popoverEdit = {};
            }
        
        }catch(error) {
            this.showToastError('removeEditPopover', 'sldsTable.js', error);
        }
    }
    // Finalize the popoverEdit process --> set the cell to isEdited (if edited) & focus the cell that was clicked
    finishLocalEdit() {
        try {
            if (this._isApplyClicked && this.popoverEdit.isEdited && this._isApplyToAll) {
                if (this.popoverEdit && (!this.checkboxArray.every(id => id === this.popoverEdit.id))) {
                    this.applyAllEdits('okay');
                }
            }
            // Get the fieldId to focus the edited cell
            const fieldId = this.popoverEdit.fieldId;
            const isEdited = this.popoverEdit.isEdited || false;

            if (this.popoverEdit.isEdited) {

                if (!this.popoverEdit.fieldId || this.popoverEdit.value === undefined) {
                    this.removeEditPopover(true);
                    return;
                }

                this.updateDraftValueOnEdit();             // Add the edited field's value to the <draftValues> array
                this.assignPopOverValueToField();         // Update the field's value/label of the record that was edited
            }
            // Clear the popoverEdit properties
            this.popoverEdit = {};

            // Focus the cell/editbutton and add class 'slds-is-edited' to the edited cell
            this.focusCellOnEdit(fieldId, isEdited);
                
        
        }catch(error) {
            this.showToastError('finishLocalEdit', 'sldsTable.js', error);
        }
    } 
    // Focus the cell that was clicked and set the cell's class to 'slds-is-edited' if the field was edited
    focusCellOnEdit(fieldId, isEdited, isFocus=true) {
        try {
            // Get the cell by the fieldId (i.e. <fieldName-recordId>)
            const editedCell = this.template.querySelector(`[data-id="${fieldId}"]`);
            if (!editedCell) return;

            // For multi-edit situations
            if (!isFocus) {
                // Only mark the cell as slds-is-edited if isFocus=false
                editedCell.classList.add('slds-is-edited');
                return;
            }

            setTimeout(() => {    
                if (editedCell) {
                    // If not edited, just apply the focus
                    isEdited 
                        ? editedCell.classList.add('slds-is-edited', 'slds-has-focus') 
                        : editedCell.classList.add('slds-has-focus');
                }
                // Always return focus to the first real control in the cell after an edit.
                this.focusCellControl(editedCell);
            }, 30);

            if (isEdited && !this.isTableEdited) {
                // Display the save/cancel buttons below the table
                this.isTableEdited = true;
                // Let parent know table is in edit mode 
                this.dispatchEvent(new CustomEvent('edited', { detail: 'edited' } ));
            }
        
        }catch(error) {
            this.showToastError('focusCellOnEdit', 'sldsTable.js', error);
        }
    }
    focusCellControl(cell) {
        if (!cell) return false;

        const control = cell.querySelector(
            '.slds-cell-edit__button:not([disabled]), ' +
            'input:not([disabled]), ' +
            'button:not([disabled]), ' +
            'a[href], ' +
            '[tabindex]:not([tabindex="-1"]):not([disabled])'
        );

        if (control && typeof control.focus === 'function') {
            control.focus();
            return true;
        }

        return false;
    }
    // ====================================================================== \\

    // ================== Handle Edit Popover Draft Values ================== \\
    // Store the editing field's Original Value
    storeOriginalDraftValue(recordId, fieldName, value, displayValue) {
        try {
            // Abort if not required information
            if (!recordId || !fieldName) return;

            // Create the new draft entry
            const draftFieldEntry = { value, displayValue };

            // Get the record if it exists already in <draft OriginalValues> 
            const existingDraftEntry = this.draftOriginalValues.find(draft => draft.id === recordId);

            // Add the object directly to the <draft OriginalValues>
            if (!existingDraftEntry) {
                this.draftOriginalValues.push( {id: recordId, [fieldName]: draftFieldEntry} ); // push to array
                return; // Abort
            }

            // Get the existing fieldName entry from <draft OriginalValues> if exists
            const existingFieldEntry = existingDraftEntry[fieldName];

            if (!existingFieldEntry) {
                // Add the field values to the <draftEntry> if not already a key with that fieldName
                existingDraftEntry[fieldName] = draftFieldEntry;
            }

        }catch(error) {
            this.showToastError('storeOriginalDraftValue', 'sldsTable.js', error);
        }
    }
    // Store the new Edited Value in Draft Values
    updateDraftValueOnEdit(customDraft=null) {
        try {
            // Enable a custom draft to be sent
            const currentEdit = customDraft ? customDraft : this.popoverEdit;
            
            // Starter entry
            if (this.draftValues.length < 1 || !this.draftValues.some(rec => rec.id === currentEdit.id)) {
                this.draftValues.push({id: currentEdit.id, [currentEdit.fieldName]: currentEdit.value });
                return;
            }
            this.draftValues.forEach(draft => {
                if (draft.id === currentEdit.id) {
                    draft[currentEdit.fieldName] = currentEdit.value;
                }
            });
        }catch(error) {
            this.showToastError('updateDraftValueOnEdit', 'sldsTable.js', error);
        }
    }
    // Update the field with the popoverEdit's value
    assignPopOverValueToField(customDraft = null) {
        const currentEdit = customDraft || this.popoverEdit;
        try {
            const updateRecord = rec => ({
                ...rec,
                fields: rec.fields.map(field => {
                    if (field.fieldName === currentEdit.fieldName) {
                        const rawDisplay = this.popoverEdit.isdatetime || this.popoverEdit.isdate
                            ? handleDateObjDisplayValue(currentEdit.value) ?? ''
                            : currentEdit.displayValue ? currentEdit.displayValue ?? ''
                            : `${currentEdit.value ?? ''}`;
                            
                        const displayValue = normalizeBlank(rawDisplay);

                        return {...field, value: currentEdit.value, displayValue}
                    }
                    return field;
                })
            });
    
            if (this.localRows.some(rec => rec.id === currentEdit.id)) {
                this.localRows = this.localRows.map(rec =>
                    rec.id === currentEdit.id ? updateRecord(rec) : { ...rec }
                );
            } 
        } catch (error) {
            this.showToastError('assignPopOverValueToField', 'sldsTable.js', error);
        }
    }
    // ====================================================================== \\

    // ~*~*~*~~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~ \\
    // ~*~*~*~~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~ \\
    // ~*~*~*~~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~ \\




    // =========================== Row Checkboxes =========================== \\
    // Hanlde "Select All" checkbox
    handleSelectAllRows(event) {
        handleSelectAllRows(this, event);
    }
    // Handle Record-Row Checkbox Click
    handleCheckboxChange(event) {
        try {
            if (this._shiftHeld) { 
                return;
            }
            handleCheckboxChange(this, event); 
        } catch (error) {
          this.showToastError('handleCheckboxChange', 'sldsTable.js', error);
        }
    }
    evalSelectAllAfterCheck() {
        // --------------- Handle Select all checkbox --------------- \\
        // Case 1: remove select all 
        if (
            (this.checkboxArray?.length  < this.localRows.length) || 
            (this.checkboxArray?.length < this?._rows?.length)
        ) {
            // Case 1A: "Select All" check AND checked.length < rows.length
            const selectAll = this.template.querySelector('[data-element="selectAllCheckbox"]'); 
            if (selectAll.checked) {
                selectAll.checked = false;
            }
            if (this.checkboxArray?.length) {
                selectAll.indeterminate = true;
            } else {
                selectAll.indeterminate = false;
            }
            return;
        }
        // check select all
        if (
            (this.checkboxArray?.length === this.localRows?.length) ||
            (this.checkboxArray?.length === this._rows?.length)
        ) {
            // Case 1B: "Select All" not checked AND checked rows equals rows Length
            const selectAll = this.template.querySelector('[data-element="selectAllCheckbox"]'); 
            if (!selectAll.checked) {
                selectAll.indeterminate = false;
                selectAll.checked = true;
            }
        }
        // ---------------------------------------------------------- \\
    }
    // ====================================================================== \\

    handleRadioChange(event) {
        try {
            const id = event.target.value;
            // Get the parent <tr> element
            const rowId = event.currentTarget.dataset.parentId;

            const allRows = this.template.querySelectorAll('[data-element="fieldRow"]');
            allRows.forEach(tr => {
                if (tr?.dataset?.id === rowId) {
                    tr.classList.add('slds-is-selected');
                } else if (tr.classList.contains('slds-is-selected')) {
                    tr.classList.remove('slds-is-selected');
                }
            });
            if (id) {
                const record = this._rows.find(r => r?.id === id || r?.Id === id);
                this.dispatchEvent(new CustomEvent('radioselection', { 
                    detail: {id: id ?? null, record: record ?? null}
                } ));
            }
        } catch(error) {
            this.showToast('Error in handleRadioChange() of sldsTable.js', getErrorMessage(error), 'error');
        }
    }


    // ==================== Handle Focus/Blur of Cells ====================== \\
    // Apply cell focus styling when a child control receives focus
    focusCell(event=null, cellParam=null) {
        try {
            const cell = event ? event.currentTarget : cellParam;
            if (cell) {
                cell.classList.add('slds-has-focus');
            }
        }catch(error) {
            this.showToastError('focusCell', 'sldsTable.js', error);
        }
    }
    // Remove slds-has-focus on Blur of Cell
    blurCell(event) {
        try  {
            const cell = event.currentTarget;
            if (event.relatedTarget && cell.contains(event.relatedTarget)) {
                // Focus is still within the cell; do nothing.
                return;
            }
            if (cell) {
                cell.classList.remove('slds-has-focus');
            }
        }catch(error) {
            this.showToastError('blurCell', 'sldsTable.js', error);
        }
    }
    // Focus both the cell and the button 
    focusEditButton(event=null, btnParam=null) {
        try {
            const button = event ? event.currentTarget : btnParam;          // Get the button
            const cell = button?.closest('td, th');                         // Get the cell
            if (cell) {
                cell.classList.add('slds-has-focus');                       // Add focus to the cell
            }
        }catch(error) {
            this.showToastError('focusEditButton', 'sldsTable.js', error);
        }
    }
    // Blur both the cell and the button 
    blurEditButton(event) {
        try {
            const cell = event.currentTarget.closest('td, th');
            if (cell) {
                if (event.relatedTarget && cell.contains(event.relatedTarget)) {
                    // Focus is still within the cell; do nothing.
                    return;
                }
                cell.classList.remove('slds-has-focus');
            }
        }catch(error) {
            this.showToastError('blurEditButton', 'sldsTable.js', error);
        }
    }
    // ======================================================================= \\



    // ====================== Handle Column Resizing ========================= \\
    _onDocMouseMove;
    _onDocMouseUp;
    handlemousedown(event) {
        handlemousedown(event, this);
    }
    handlemousemove(event) {
        handlemousemove(event, this);
    }
    handlemouseup(event) {
        handlemouseup(event, this);
    }
    // ======================================================================= \\

    // =========================== Save/Cancel Drafts ========================== \\
    // Remove edited/focus styling from cells
    async resetCellClasses() {
        try {
            const allCells = this.template.querySelectorAll('.slds-cell-edit');
            if (allCells) {
                allCells.forEach(cell => {
                    if (cell) {
                        cell.classList.remove('slds-is-edited', 'slds-has-focus');
                    }
                });
            }
        }catch(error) {
            this.showToastError('resetCellClasses', 'sldsTable.js', error);
        }
    }
    // Clear the drafts
    async clearDrafts() {
        try {
            this.draftOriginalValues = [];
            this.draftValues = [];
            if (this.popoverEdit) {
                this.popoverEdit = {};
            }

        }catch(error) {
            this.showToastError('clearDrafts', 'sldsTable.js', error)
        }
    }
    // Map the original values back to all the rows ---++ Reset the <td> and <th> cell styling classes
    async cancelEdits() {
        this.isLoading = true;
        try {
            // Remap original draft values to the rows 
            this.localRows = handleRevertFields(this.localRows, this.draftOriginalValues);
            // Remap original Draft values to the stable rows 
            this.stableRows = handleRevertFields(this.stableRows, this.draftOriginalValues);

            // Reset the datatable attributes cell styles
            await this.clearDrafts();
            await this.resetCellClasses();

            if (!this.isDbControlled) {
                await persistSearchTerm(this);
                await persistSort(this); 
            }

            this.isTableEdited = false;
            this.dispatchEvent(new CustomEvent('notedited', { detail: 'notedited' } ));

        }catch(error) {
            this.showToastError('cancelEdits', 'sldsTable.js', error);
            this.isLoading = false;
        }
        this.isLoading = false;
    }
    
    // Save edits when user clicks "Save"
    // Map the drafts to a record-format --> Save the record-formats to the database ---++ Reset the <td> and <th> cell styling classes
    _justSaved = false;
    async saveEdits() {
        this.isLoading = true;
        try {   
            // Save the edited fields to Apex 
            // Structure Requirement: [
            // { sObjectType:'Material__c', Id:'a0k...', Name:'New Material', Alloys__c:'204;318' }
            // ,]
            if (!this.objectName) {
                // objectName property not presesnt --> Abort
                this.showToast(
                    'Implementation Error: ', 
                    'Public Property, "objectName" was not provided. The component requires this property to save records.', 
                    'error'
                );
                return;
            }
            // Add 'sObjectType' property to each record in the Array
            const formattedRecs = this.draftValues.map(draft => {
                return {...draft, sObjectType: this.objectName}
            });
            this._justSaved = true;
            await saveRows({rows: formattedRecs});
            // Reset the datatable attributes cell styles
            await this.clearDrafts();
            await this.resetCellClasses();
            clearCheckboxes(this);

            this.isTableEdited = false;
            this.dispatchEvent(new CustomEvent('notedited', { detail: 'notedited' } ));
            this.dispatchEvent(new CustomEvent('refresh', { detail: 'refresh' } ));
            this.showToast('Save Successful', 'Your edits were committed.', 'success');

        } catch(error) {
            this.showToastError('saveEdits()', 'sldsTable.js', error);
        } finally {
            this.isLoading = false;
        }
    }
    // ========================================================================= \\

    get pageTokenAdjustable() {
        return !!this.pageToken;
    }

    // ======================== Footer Handler ======================= \\
    // Handle the message in the parent
    handleToggle(message) {
        if (message.detail === 'on') {
            //console.log('on');
        } else if (message.detail === 'off') {
            //console.log('off');
        }
    }
    // Handle clicks
    changePage(event) {
        //console.log('changing page');
    }
    handleDumb(message) {
        //console.log(message);
    }
    // ========================================================================= \\
    // ✅ DOM handler: NO async, NO promise returned
    applyRowAction(event) {
        // fire-and-forget; swallow any stray rejection here
        this._applyRowAction(event).catch(e => {
            this.showToastError('applyRowAction()', 'sldsTable.js', e);
        });
    }

    async _applyRowAction(message) {
        let isRefresh = false;
        let toastMessage = null;
        let toFocus = this.modalConfig?.active;
        this.isLoading = true;
        try {
            const recordId = this.modalConfig?.recordId;
            const details  = message?.detail;

            if (typeof details === 'string') {
            if (details === 'cancel') { 
                this.modalConfig = null; 
                return; 
            }
            if (details === 'okay') {
                await deleteRecordsById({ recordIds: [recordId], objectApiName: this.objectName });
                toastMessage = 'Record Successfully Deleted';
                isRefresh = true;
                toFocus = null;
            }
            } else if (details && typeof details === 'object') {
                if (details.delete) {
                    const recordIds = Array.from(new Set([...this.checkboxArray, recordId]));
                    await deleteRecordsById({ recordIds, objectApiName: this.objectName });
                    toastMessage = `${recordIds.length} Successfully Deleted`;
                    isRefresh = true;
                    toFocus = null;
                }
                clearCheckboxes(this);
            }
        } catch (error) {
            this.showToastError('applyRowAction()', 'sldsTable.js', error);
            isRefresh = false;
            toastMessage = null;

        } finally {
            this.isLoading = false;
            this.modalConfig = null;
            if (isRefresh && toastMessage) {
                this.dispatchEvent(new CustomEvent('refresh', {
                    detail: 'refresh', bubbles: true, composed: true
                }));
                this.showToast('Success!', toastMessage, 'success');
            }
            if (toFocus) toFocus.focus();
        }
    }


    // Call Modal on Row Action
    // ⬅️ DOM handler must be sync so it never returns a Promise
    handleRowAction(event) {
        this._handleRowAction(event).catch(e => {
            this.showToastError('handleRowAction()', 'sldsTable.js', e);
        });
    }

    // ⬅️ your original code moved here (unchanged except the refresh event)
    _lastFocusedEle;
    async _handleRowAction(event) {
        try {
            const { id = null, selection = null } = event?.detail || {};

            switch (selection) {
                case 'delete':
                    const active = this.template.querySelector(`[data-row-action-id="${id}"]`);
                    if (this.checkboxArray.length) {
                        this.modalConfig = {
                            columns: 1,
                            modalTitle: 'Delete Record',
                            fields: [{ fieldName: 'delete', label: 'Delete all select rows', value: false, dtype: 'boolean' }],
                            modalMessage: 'Are you sure you want to delete this record?',
                            cancelButtonLabel: 'Cancel',
                            okayButtonLabel: 'Delete',
                            recordId: id,
                            active,
                        };
                    } else {
                        this.modalConfig = {
                            columns: 1,
                            modalTitle: 'Delete Record',
                            modalMessage: 'Are you sure you want to delete this record?',
                            cancelButtonLabel: 'Cancel',
                            okayButtonLabel: 'Delete',
                            fields: null,
                            recordId: id, 
                            active
                        };
                    }
                    setTimeout(() => {
                    const modalEle = this.template.querySelector('[data-id="deleteRecordsModal"]');
                    if (modalEle) modalEle.showMe();
                    });
                    return;

                case 'edit': {
                    const result = await newRecordLayoutModal.open({
                        size: 'small',
                        label: '',
                        description: 'Accessible description of modal\'s purpose',
                        objectApiName: this.objectName, 
                        borderRadius: 'var(--slds-g-radius-border-4, 1.25rem)',
                        objectLabel: this.objectLabel,
                        recordId: id, 
                    });

                    // undefined → saved
                    if (result?.result === 'success') {
                        await this.handleRefresh();
                        const toastMessage = result?.toastInfo;
                        if (toastMessage) {
                            this.showLinkedRecordToast(
                                toastMessage.action, 
                                toastMessage.objectApiName,
                                toastMessage.objectLabel,
                                toastMessage.recordId,
                                toastMessage.linkLabel
                            );
                        }
                    }
                    const lastFocused = this.template.querySelector(`[data-row-action-id="${id}"]`);
                    if (lastFocused) lastFocused.focus();
                    break;
                }
                default:
                    break;
            }
        } catch (error) {
            this.showToastError('handleRowAction()', 'sldsTable.js', error);
        }
    }

    // Create new record when "New" clicked on Page Header Child
    async handleNewRecord() {
        try {

            const result = await newRecordLayoutModal.open({
                size: 'small',
                description: 'Accessible description of modal\'s purpose',
                objectApiName: this.objectName, 
                borderRadius: 'var(--slds-g-radius-border-4, 1.25rem)',
                label: '',
                objectLabel: this.objectLabel
            });

            if (result?.result === 'success') {
                // Get to Linked toast from the modal response
                const toastMessage = result.toastInfo;

                // Display toast with link to record
                this.showLinkedRecordToast(
                    toastMessage.action, 
                    toastMessage.objectApiName,
                    toastMessage.objectLabel,
                    toastMessage.recordId,
                    toastMessage.linkLabel
                );
                // Tell parent to refresh
                this.dispatchEvent(new CustomEvent('refresh', { detail: 'refresh' } ));
            }
            focusListHeader(this, true);

        } catch(error) {
            this.showToast('Error in handleNewRecord() of sldsTable.js: ', getErrorMessage(error), 'error');
        }
    }

    // Handle Text Style of Columns
    handleColAction(message) {
        try {
            this.resetMaxHeight();
            const msgDetail = message?.detail;
            if (msgDetail) {
                // Get Col Details (fieldName, textStyle)
                const fieldName = msgDetail.id;
                const newTextStyle = msgDetail.selection;

                // find the column entry 
                const colEntry = this.localColumns.find(col => col.fieldName === fieldName);

                // ********** CELL_TEXT_STYLES
                // Check if style was unchanged or invalid
                if (!newTextStyle || colEntry.textStyle === newTextStyle) return;

                // Update the column 'textStyle' attribute 
                this.localColumns = this.localColumns.map(col => {
                    return col.fieldName === fieldName
                        ? {...col, textStyle: newTextStyle}
                        : col;
                });

                // Get the current cell style class 
                const crntCl = CELL_TEXT_STYLES[colEntry.textStyle];
                // Get the next text stlye 
                const newCl = CELL_TEXT_STYLES[newTextStyle];

                // Replace the cell text classes
                const fieldCells = this.template.querySelectorAll(`[data-cell-field-name="${fieldName}"]`);
                if (fieldCells) {
                    fieldCells.forEach(cell => {
                        if (cell) cell.classList.replace(crntCl, newCl)
                    });
                }
            }
        } catch(error) {
            this.showToastError('handleColAction()', 'sldsTable.js', error);
        }
    }

    // =================================================================== Column Sorting Handlers =================================================================== \\
    handleDisplayOnlySortedCol() {
        try {
            // Remove Sorting Atribute from all other cols
            const tableCols = this.template.querySelectorAll('[data-element="tableColumn"]');
            const th = Array.from(tableCols ?? []).find(obj => obj.dataset.fieldName === this._sortedCol?.fieldName);
            removeSort(tableCols, th, this._justSaved);
            if (th) {
                if (th) {
                    if (this._sortedCol?.type === 'asc') {
                        sortColAsc(th);
                    } else if (this._sortedCol?.type === 'desc') {
                        sortColDesc(th);
                    }
                }
            }
        } catch(error) {
            this.showToast('Error in handleDisplayOnlySortedCol() of sldsTable.js', getErrorMessage(error), 'error');
        }
    }
    // Handle Sort-Button of Column
    _newDbSort = false;
    sortCol(event) {
        try {
            //console.log('here this.localColumns in sldsTable.js: ', JSON.stringify(this.localColumns));
            event.preventDefault();
            const button = event.currentTarget;
            const notSortable = button?.dataset?.notSortable === "true";

            if (notSortable) {
                this.showToast('This column is not sortable', '', 'info');
                return
            }
            const fieldName = button.dataset.colFieldName;

            const field = this.localColumns.find(col => col.fieldName === fieldName);
            const th = button.closest('th');
            const isAsc = th && !th.classList.contains('slds-is-sorted_asc');
            
            try {
                if (th) { 
                    this._sortedCol = {fieldName: field.fieldName, label: field.label, type: isAsc ? 'asc' : 'desc', dtype: field.dtype || 'text'};

                    if (this.isDbControlled) {
                        this.dispatchEvent(new CustomEvent('newsort', { detail: this._sortedCol } ));
                        return;
                    }
                    // Remove Sorting Atribute from all other cols
                    const tableCols = this.template.querySelectorAll('[data-element="tableColumn"]');
                    removeSort(tableCols, th, this._justSaved);

                    if (isAsc) {
                        sortColAsc(th);
                    } else {
                        sortColDesc(th);
                    }

                    this.isLoading = true;
                    // Perform the sort
                    Promise.resolve().then(async () => {
                        await this.performSort(isAsc, fieldName);
                    })

                } else {
                    console.warn('Could not find <th> from button');
                }

            } catch(error) {
                this.showToast('Error in sortCol() of sldsTable.js', getErrorMessage(error), 'error');
            } finally {
                this.isLoading = false;
            }
        
        } catch(error) {
            this.showToast('Error in sortCol() of sldsTable.js', getErrorMessage(error), 'error');
        } finally {
            this.isLoading = false;
        }
    }
    // Sort the columns after changes detected
    async performSort(isAsc, fieldName, rows=null, isReturn=false) {
        try {
            let sortingRows = rows ?? this.localRows;

            let picklistOptions = [];
            const dtype = this.localColumns.find(col => col.fieldName === fieldName).dtype;

            if (dtype === 'picklist' || dtype==='multipicklist') {
                picklistOptions = this.localColumns.find(col => col.fieldName === fieldName).options
                    .map(option => option.value);
            }

            // Perform Sorting
            sortingRows = sortingRows.sort((a, b) => {
                const fieldA = a.fields.find(field => field.fieldName === fieldName);
                const fieldB = b.fields.find(field => field.fieldName === fieldName);
                
                const valueA = fieldA?.value || '';
                const valueB = fieldB?.value || '';
        
                const dtype = fieldA?.dtype || 'text';
        
                // Blank text handling
                if (!valueA && !valueB) return 0;
                if (!valueA) return isAsc ? -1 : 1;
                if (!valueB) return isAsc ? 1 : -1;
        
                if ((dtype === 'picklist' || dtype === 'multipicklist') && picklistOptions) {
                    // Sort picklist by options order
                    const indexA = picklistOptions.indexOf(valueA);
                    const indexB = picklistOptions.indexOf(valueB);
        
                    return isAsc ? indexA - indexB : indexB - indexA;
                } else if (dtype === 'number' || dtype === 'decimal' || dtype === 'currency' || dtype === 'percent') {
                    // Numeric sorting
                    return isAsc ? valueA - valueB : valueB - valueA;
                } else if (dtype === 'date') {
                    // Date sorting
                    return isAsc
                        ? new Date(valueA) - new Date(valueB)
                        : new Date(valueB) - new Date(valueA);
                
                 // datetime
                } else if (dtype === 'datetime') {
                    const tA = Date.parse(valueA);
                    const tB = Date.parse(valueB);
                    if (isNaN(tA) && isNaN(tB)) return 0;
                    if (isNaN(tA)) return isAsc ? -1 : 1;
                    if (isNaN(tB)) return isAsc ? 1 : -1;
                    return isAsc
                    ? tA - tB
                    : tB - tA;
                
                } else if (dtype === 'boolean') {
                    // Boolean sorting
                    const boolA = valueA === 'true';
                    const boolB = valueB === 'true';

                    if (boolA === boolB) return 0;
                    if (isAsc) {
                        return boolA ? 1 : -1;
                    } else {
                        return boolA ? -1 : 1;
                    }

                } else {
                    // Default alphabetical sorting with tie-breaker
                    const splitA = valueA.split(' ');
                    const splitB = valueB.split(' ');
        
                    for (let i = 0; i < Math.max(splitA.length, splitB.length); i++) {
                        const wordA = splitA[i] || '';
                        const wordB = splitB[i] || '';
                        const comparison = wordA.localeCompare(wordB);
                        if (comparison !== 0) {
                            return isAsc ? comparison : -comparison;
                        }
                    }
                    return 0;
                }
            });
            
            if (isReturn) {
                return sortingRows;
            }

            this.localRows = sortingRows;
            this.localRows = applyRowNumbers(this.localRows, this.pageToken);

        }catch(error) {
            this.showToastError('performSort()' ,'sldsTable.js', error);
        }
    }
    // ================================================================================================================================================================ \\


    filterDetails;
    @api handleFilter() {
        this.filterDetails = { tableName: this._pageHeaderConfig.selectedListView };
        //const tableContainer = this?.refs?.tableContainer;
        // Let DOM apply the new grid classes first
        //requestAnimationFrame(() => {
        //    //resetColumnWidths(this); // recompute against new container width
        //    if (tableContainer) {
        //        tableContainer.classList.add('max-width-table-container');
        //    }
        //});
    }
    closeFilterPanel() {
        this.filterDetails = null;
        this._filterOnRender = false;
        focusListHeader(this, false);
    }
    handleFiltersUpdated() {
        this.filterDetails = null;
        this._filterOnRender = false;
        requestAnimationFrame(() => {
            this.dispatchEvent(new CustomEvent('filtersupdated', { detail: 'filtersupdated' } ));
        });
        this.showToast('List view filters successfully updated', '', 'success');
        focusListHeader(this, true);
    }


    showToastError(fnName, fileName, error) {
        const mode = 'sticky';

        const message = `Error in ${fnName} of ${fileName}`;
        
        this.toastObj = { 
            variant: 'error', 
            mode, 
            message,
            header: { 
                text: getErrorMessage(error)
            }        
        };
    }

    // Show Toast
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
    /* Show toast that has a link to a record.  IF NOT DONE YET ADD 👉 toastObj 
        Action variant instructions:
            📝 3 action options:
                • 'new' = new record  --> set linkLabel as the record name.
                • 'edit' = edited record   -->  set linkLabel as record name. 
                • 'converted' = converted record  --> set 🚩linkLabel as New Object's label.
            ➕Example ('new'):
                const action = 'new';
                const objectApiName = OPPORTUNITY_OBJECT.objectApiName;
                const recordId = this.oppId;
                const linkLabel = this.oppName; 

            ➕Example ('converted'):

        this.showLinkedRecordToast(objectApiName, recordId, beforeLinkText, this.oppName, postLinkText)
    */ 
    showLinkedRecordToast(action, objectApiName, objectLabel, recordId, linkLabel) {
        const getLinkMessage = () => {
            switch(action) {
                case 'new': 
                    return linkLabel && linkLabel !== objectLabel
                        ? {before: `New ${ objectLabel}`, linkLabel: linkLabel, after: 'was successfully created.'}
                        : {before: null, linkLabel: `New ${ objectLabel}`, after: 'was successfully created.'};
                        
                case 'edit': 
                    return linkLabel && linkLabel !== objectLabel
                        ? {before: `${ objectLabel}`, linkLabel: linkLabel, after: 'was successfully updated.'}
                        : {before: null, linkLabel: `${ objectLabel}`, after: 'was successfully updated.'};
                case 'converted':
                    return {
                        before: `${ objectLabel} was successfully converted. View`, 
                        linkLabel: `new ${ linkLabel}`, 
                        after: '.'
                    };
                default:
                    return null;
            }
        }

        if (!objectApiName || !recordId) {
            // Warning if no recordId/objectApiName configured
            this.toastObj = {
                variant: 'warning',
                mode: 'sticky',
                objectApiName: null,
                message: 'No Record Id or Object Api Name was provided.',
                header: {
                    text: 'Misconfiguration of showLinkedRecordToast() in commLeadStageLwc.js'
                }
            }
        } else {
            const toastMessage = getLinkMessage();
            // Linked Toast
            this.toastObj = { 
                variant: 'success', 
                mode: 'sticky', 
                objectApiName,
                message: null,
                header: { 
                    recordId, 
                    linkPrefix: toastMessage.before,
                    recordName: toastMessage.linkLabel,
                    objectApiName,
                    text: toastMessage.after
                }        
            };
        }
    }


    // Table Colors
    _applyVars() {
        const el = this.template.host; // or a wrapper: this.template.querySelector('.root')
        el.style.setProperty('--vg-color-columns-bg-table',  this._columnsBg);
        el.style.setProperty('--vg-color-rows-bg-table',    this._rowsBg);
        el.style.setProperty('--vg-color-striped-bg-table', this._stripedBg);
        if (this.suppressHeader) {
            el.style.setProperty('--vg-table-border', 'none');
            el.style.setProperty('--vg-table-border_no-header', 'solid 1px var(--slds-g-color-border-base-1)');
        }
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

    // Table Style
    get tableCl() {
        if (this.isSimpleTable) {
            let simpleCl = 'classic-table slds-table slds-no-row-hover slds-table_bordered slds-table_fixed-layout';
            if (this.colBorders) simpleCl = simpleCl + ' slds-table_col-bordered';
            if (this.tightTable) simpleCl = simpleCl + ' tight-table';
            if (!this.suppressResizableCols) simpleCl = simpleCl + ' slds-table-resizable-cols no-actions-table';
            return simpleCl;
        }
        // slds-table slds-table_fixed-layout slds-table_edit classic-table
        let baseCl = 'slds-table slds-table_fixed-layout slds-table_edit classic-table';
        if (this.suppressRowActions) baseCl = baseCl + ' no-actions-table';
        if (this.stripedTable) baseCl = baseCl + ' slds-table_striped';
        if (!this.suppressResizableCols) baseCl = baseCl + ' slds-table-resizable-cols';
        if (!this.suppressBorderedTable) baseCl = baseCl + ' slds-table_bordered';
        if (this.colBorders) baseCl = baseCl + ' slds-table_col-bordered';
        if (this.tightTable) baseCl = baseCl + ' tight-table';
        return baseCl;
    }
    get colsCl() {
        if (this.isSimpleTable) {
            let simpleColCl = ''
            if (!this.suppressResizableCols) simpleColCl = 'slds-is-resizable dv-dynamic-width'
            return this.suppressColActions ? simpleColCl : `${simpleColCl} slds-has-button-menu`;
        }
        let colCl = '';
        if (!this.suppressResizableCols) {
            colCl = colCl + ' slds-is-resizable dv-dynamic-width';
        }
        if (!this.suppressSort) {
            colCl = colCl + ' slds-is-sortable';
        }
        if (!this.suppressColActions) {
            colCl = colCl + ' slds-has-button-menu';
        }
        return colCl ?  colCl : 'empty-cols';
    }


    pageSizeModalConfig;
    createListViewConfig;
    updateDisplayColumnsConfig;
    updateListViewConfig;
    deleteListViewConfig;
    handleSettingsSelected(message) {
        try {
            const selection = message?.detail; 
            switch(selection) {
                case 'New List View':  
                    this.createListViewConfig = {objectApiName: this.objectName};
                    return;
                case 'Rename List View':
                    this.updateListViewConfig = {
                        headerTitle: `Update ${this.selectedListViewMeta?.label}`
                    };
                    return;
                case 'Select Fields to Display':
                    // Get field available to display in the list view
                    if (this._objectInfos) {
                        
                        const fields = this._objectInfos?.data?.fields;
                        if (!fields) return;
                        const options = Object.values(fields)?.map(meta => {
                            return {
                                label: meta?.label,
                                value: meta?.apiName,
                                dtype: meta?.dataType
                            }
                        });
                        this.updateDisplayColumnsConfig = {
                            headerTitle: `Update ${this.selectedListViewMeta?.label} Displayed Fields`,
                            options,
                            currentValue: this._columns.map(col => col.fieldName),
                        };
                    }
                    return;
                case 'Delete List View':
                    this.deleteListViewConfig = {apiName: this.selectedListViewMeta?.listReference.listViewApiName};
                    return;
                case 'pageSize':
                    this.pageSizeModalConfig = {
                        headerTitle: 'Update List View Page Size',
                        currentValue: this.pageSize,
                        inputLabel: 'Page Size',
                        okLabel: 'Update',
                        slotFooter: true, 
                        newPageSize: null
                    }
                    return;
                case 'updateColumnWidthsPct': 
                    this.saveColumnWidthsListViewApi(true);
                    return;
                case 'updateColumnWidthsPx': 
                    this.saveColumnWidthsListViewApi(false);
                    return;
                case 'Set as Default List View': 
                    this.dispatchEvent(new CustomEvent('defaultlistview', { detail: selection } ));
                    return;
                default:
                    return;
            }
        } catch(error) {
            this.showToast('Error in handleSettingsSelection() of sldsTable.js', getErrorMessage(error), 'error');
        }
    }

    // ======================== Page Size Setting Handlers ======================== \\
    updatePageSize() {
        try {
            let val = this.pageSizeModalConfig?.newPageSize;

            if (!val) {
                const input = this.template.querySelector('c-slds-input[data-id="page-size-input"]')
                val = input.getValue();
            }
            
            if (val) {
                const numVal = Number(val);
                if (numVal !== this.pageSize) {
                    this.dispatchEvent(new CustomEvent('updatepagesize', { detail: numVal } ));
                }
            }
        } catch(error) {
            this.showToast('Error in updatePageSize() of sldsTable.js', getErrorMessage(error), 'error');
        } finally {
            this.closePageSizeModal();
        }
    }
    closePageSizeModal() {
        this.pageSizeModalConfig = null;
        focusListHeader(this, true);
    }
    savePageSize() {
        try {
            const input = this.template.querySelector('c-slds-input[data-id="page-size-input"]')
            const val = input.getValue();
            if (val) {
                const numVal = Number(val);
                this.dispatchEvent(new CustomEvent('savepagesize', { detail: numVal } ));
            }
        } catch(error) {
            this.showToast('Error in savePageSize() of sldsTable.js', getErrorMessage(error), 'error');
        } finally {
            this.closePageSizeModal();
        }
        
    }
    // ============================================================================ \\

    // ====================== Default Sort Setting Handlers ====================== \\
    sortDetailsConfig;
    @api handleEditSort() {
        this.sortDetailsConfig = {
            listViewApiName: this._pageHeaderConfig.selectedListView,
            headerTitle: 'Column Sort',
            variant: 'sort',
            applyDisabled: true
        };
    }
    closeEditSort() {
        this.sortDetailsConfig = null;
        focusListHeader(this);
    }
    updateSortFooterState(message) {
        const applyDisabled = message.detail !== 'changed';
        this.sortDetailsConfig = {
            ...this.sortDetailsConfig,
            applyDisabled
        }
    }
    handleClearSorts() {
        const listCmp = this.template.querySelector('c-new-list-view-lwc');
        if (listCmp) {
            listCmp.clearAllSort();
        }
    }
    async updateDefaultSort() {
        try {
            const newListViewCmp = this.template.querySelector('c-new-list-view-lwc');
            if (newListViewCmp) {
                const listViewInfo = await newListViewCmp.updateListView();
                if (listViewInfo) {
                    // close the modal
                    this.sortDetailsConfig = null;
                    this.dispatchEvent(new CustomEvent('sortupdated', { detail: 'sortupdated' } ));
                    this.showToast('Column Sort successfully updated.', '', 'success');
                }
            }
            focusListHeader(this, true);
        } catch(error) {
            this.showToast('Error in updateDefaultSort() of sldsTable.js', getErrorMessage(error), 'error');
        }
    }
    // ============================================================================ \\


    _filterOnRender = false;
    async createListView() {
        try {
            const listViewCmp = this.template.querySelector('c-new-list-view-lwc');
            if (listViewCmp) {
                const listViewInfo = await listViewCmp.createListView();
                if (listViewInfo) {
                    const newApiName = listViewInfo?.listReference?.listViewApiName;
                    // close the modal
                    this.showToast('List view successfully created.', '', 'success');
                    this.createListViewConfig = null;
                    this._filterOnRender = true;
                    this.dispatchEvent(new CustomEvent('newlistview', { detail: newApiName } ));
                    focusListHeader(this, true);
                }
            } else {
                this.showToast('Failed retrieve component from template in createListView() of sldsTable.js', '', 'warning');
            }
        } catch(error) {
            this.showToast('Error in createListView() of sldsTable.js', getErrorMessage(error), 'error');
        } finally {
            this._isLoading = false;
        }
    }
    cancelNewListView() {
        this.createListViewConfig = null;
        focusListHeader(this);
    }

    async deleteListView() {
        try {
            const listViewCmp = this.template.querySelector('c-new-list-view-lwc');
            if (listViewCmp) {
                const listViewInfo = await listViewCmp.deleteListView();
                if (!listViewInfo) {
                    const deletedListView = this.deleteListViewConfig.apiName;
                    // close the modal
                    this.cancelDeleteListView();
                    this.showToast('List view successfully deleted.', '', 'success');
                    this.dispatchEvent(new CustomEvent('deletelistview', { detail: deletedListView } ));
                    focusListHeader(this, true);
                }
            } else {
                this.showToast('Failed retrieve component from template in deleteListView() of sldsTable.js', '', 'warning');
            }
        } catch(error) {
            this.showToast('Error in deleteListView() of sldsTable.js', getErrorMessage(error), 'error');
        } finally {
            this._isLoading = false;
        }
    }
    cancelDeleteListView() {
        this.deleteListViewConfig = false;
        focusListHeader(this, false);
    }

    async updateDisplayColumns() {
        try {
            const listViewCmp = this.template.querySelector('c-new-list-view-lwc');
            if (listViewCmp) {
                this._isLoading = true;
                const listViewInfo = await listViewCmp.updateListView();
                if (listViewInfo) {
                    // close the modal
                    this.showToast('List view display columns successfully updated.', '', 'success');
                    this.updateDisplayColumnsConfig = null;
                }
            } else {
                this.showToast('Failed retrieve component from template in updateDisplayColumns() of sldsTable.js', '', 'warning');
            }
        } catch(error) {
            this.showToast('Error in updateDisplayColumns() of sldsTable.js', getErrorMessage(error), 'error');
        } finally {
            this._isLoading = false;
            focusListHeader(this, true);
        }
    }
    cancelUpdateDisplayColumns() {
        this.updateDisplayColumnsConfig = null;
        focusListHeader(this, true);
    }

    // Change list view labels
    async updateListViewLabel() {
        try {
            const listCmp = this.template.querySelector('c-new-list-view-lwc');
            if (listCmp) {
                this._isLoading = true;
                const listViewInfo = await listCmp.updateListView();
                // get the new label 
                const newLabel = listViewInfo?.label;
                // Get the listview api name 
                const listViewApiName = listViewInfo?.listReference?.listViewApiName;
                // get current list view options 
                const listViewOptions = this._pageHeaderConfig.listViewOptions;
                // replace old label with new label
                const newListViewOptions = listViewOptions.map(obj => {
                    if (obj.options.some(opt => opt.value === listViewApiName)) {
                        return {
                            ...obj,
                            options: obj.options.map(op => {
                                return op.value === listViewApiName
                                    ? {...op, label: newLabel}
                                    : op 
                            })
                        }
                    }
                    return obj;
                });
                this.dispatchEvent(new CustomEvent('newlistviewlabel', { detail: newListViewOptions } ));
               
                if (listViewInfo) {
                    // close the modal
                    this.showToast('List view label successfully updated.', '', 'success');
                    this.updateListViewConfig = null;
                }
                focusListHeader(this, true);
            }
        } catch(error) {
            this.showToast('Error in updateListViewLabel() of sldsTable.js', getErrorMessage(error), 'error');
        } finally {
            this._isLoading = false;
        }
    }   
    // cancel list view label change
    cancelUpdateListView() {
        this.updateListViewConfig = null;
        focusListHeader(this, false);
    }



    get tableGridCls() {
        if (this.filterDetails) {
            return {
                one: 'slds-grid slds-nowrap',
                two: 'slds-col slds-grow max-width-table-container',
                three: 'slds-col slds-shrink filter-col'
            };
        }
        return { one:'', two:'', three:'' };
    }

}
