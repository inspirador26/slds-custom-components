/**
 * sldsTreeGrid — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/newRecordLayoutModal, c/utils, c/utils, ./helpers, ./checkboxHelpers.
 * - Salesforce/platform modules: lwc, @salesforce/apex/DynamicSObjectController.resolveEntityPrefixes,
 * @salesforce/apex/DataTableController.saveRows,
 * @salesforce/apex/DynamicSObjectController.deleteRecordsById, lightning/navigation, @salesforce/user/Id,
 * @salesforce/apex/UserDisplaySettingsController.fetchUserDisplaySettingsByField,
 * @salesforce/apex/UserDisplaySettingsController.saveUserDisplaySettings.
 * - Template children (including conditional UI): c-custom-slds-combobox-multi-select-practice,
 * c-dropdown-plain, c-slds-illustration, c-slds-input, c-slds-menu-popover-button, c-slds-modal-slot,
 * c-toast-lwc, c-tree-checkbox, c-wired-picklist-values-lwc, lightning-icon, lightning-spinner.
 * - Bundle template: sldsTreeGrid.html; local styles: sldsTreeGrid.css. Salesforce SLDS styling is
 * expected.
 * - Shared CSS modules: c/sharedStylesGlobal, c/sharedStylesSldsTable.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-tree-grid') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - externalFilterState (external-filter-state): Parent-owned filter indicator metadata; isApplied
 * controls the active-filter indication.
 *   Example: child.externalFilterState = { isApplied: true };
 * - expanded (expanded): Expands tree rows initially. Declared default: false.
 *   Example: child.expanded = true;
 * - showEmptyChildren (show-empty-children): Shows child/grandchild sections even when their record lists
 * are empty. Declared default: false.
 *   Example: child.showEmptyChildren = true;
 * - noDataMessageLevel2 (no-data-message-level2): Message for an empty section at the named tree level.
 * Declared default: 'No Data Available'.
 *   Example: child.noDataMessageLevel2 = "No child records";
 * - noDataMessageLevel3 (no-data-message-level3): Message for an empty section at the named tree level.
 * Declared default: 'No Data Available'.
 *   Example: child.noDataMessageLevel3 = "No child records";
 * - iconTextLevel2 (icon-text-level2): Text shown with the corresponding tree-level icon.
 *   Example: child.iconTextLevel2 = "Related records";
 * - iconTextLevel2Cl (icon-text-level2-cl): CSS classes for the corresponding tree-level icon text.
 * Declared default: ''.
 *   Example: child.iconTextLevel2Cl = "slds-text-color_weak";
 * - iconLevel2 (icon-level2): Semicolon-delimited tree icon configuration; icon-name is required.
 *   Example: child.iconLevel2 = "icon-name:standard:account;icon-title:Accounts;";
 * - iconTextLevel3 (icon-text-level3): Text shown with the corresponding tree-level icon.
 *   Example: child.iconTextLevel3 = "Related records";
 * - iconTextLevel3Cl (icon-text-level3-cl): CSS classes for the corresponding tree-level icon text.
 * Declared default: ''.
 *   Example: child.iconTextLevel3Cl = "slds-text-color_weak";
 * - iconLevel3 (icon-level3): Semicolon-delimited tree icon configuration; icon-name is required.
 *   Example: child.iconLevel3 = "icon-name:standard:account;icon-title:Accounts;";
 * - objectNameLevel1 (object-name-level1): Object API name for records at the corresponding tree depth.
 *   Example: child.objectNameLevel1 = "Account";
 * - objectNameLevel2 (object-name-level2): Object API name for records at the corresponding tree depth.
 *   Example: child.objectNameLevel2 = "Account";
 * - objectNameLevel3 (object-name-level3): Object API name for records at the corresponding tree depth.
 *   Example: child.objectNameLevel3 = "Account";
 * - rowActions1 (row-actions1): Row actions for the corresponding tree depth.
 *   Example: child.rowActions1 = [{ label: 'Edit', value: 'edit' }];
 * - rowActions2 (row-actions2): Row actions for the corresponding tree depth.
 *   Example: child.rowActions2 = [{ label: 'Edit', value: 'edit' }];
 * - rowActions3 (row-actions3): Row actions for the corresponding tree depth.
 *   Example: child.rowActions3 = [{ label: 'Edit', value: 'edit' }];
 * - fontSize (font-size): CSS text size, including units.
 *   Example: child.fontSize = "0.875rem";
 * - tightTable (tight-table): Uses compact row/cell spacing. Declared default: false.
 *   Example: child.tightTable = true;
 * - suppressRowCount (suppress-row-count): Suppresses the row count. Declared default: false.
 *   Example: child.suppressRowCount = true;
 * - suppressResizer (suppress-resizer): Suppresses the column resize handles. Declared default: false.
 *   Example: child.suppressResizer = true;
 * - suppressColActions (suppress-col-actions): Suppresses the column action menus. Declared default:
 * false.
 *   Example: child.suppressColActions = true;
 * - suppressCheckboxes (suppress-checkboxes): Suppresses the row selection checkboxes. Declared default:
 * false.
 *   Example: child.suppressCheckboxes = true;
 * - suppressRowActions (suppress-row-actions): Suppresses the row action menus. Declared default: false.
 *   Example: child.suppressRowActions = true;
 * - suppressResizer2 (suppress-resizer2): Suppresses the column resize handles at tree level 2. Declared
 * default: false.
 *   Example: child.suppressResizer2 = true;
 * - suppressColActions2 (suppress-col-actions2): Suppresses the column action menus at tree level 2.
 * Declared default: false.
 *   Example: child.suppressColActions2 = true;
 * - suppressCheckboxes2 (suppress-checkboxes2): Suppresses the row selection checkboxes at tree level 2.
 * Declared default: false.
 *   Example: child.suppressCheckboxes2 = true;
 * - suppressRowActions2 (suppress-row-actions2): Suppresses the row action menus at tree level 2. Declared
 * default: false.
 *   Example: child.suppressRowActions2 = true;
 * - suppressSort2 (suppress-sort2): Suppresses the sorting at tree level 2. Declared default: false.
 *   Example: child.suppressSort2 = true;
 * - suppressResizer3 (suppress-resizer3): Suppresses the column resize handles at tree level 3. Declared
 * default: false.
 *   Example: child.suppressResizer3 = true;
 * - suppressColActions3 (suppress-col-actions3): Suppresses the column action menus at tree level 3.
 * Declared default: false.
 *   Example: child.suppressColActions3 = true;
 * - suppressCheckboxes3 (suppress-checkboxes3): Suppresses the row selection checkboxes at tree level 3.
 * Declared default: false.
 *   Example: child.suppressCheckboxes3 = true;
 * - suppressRowActions3 (suppress-row-actions3): Suppresses the row action menus at tree level 3. Declared
 * default: false.
 *   Example: child.suppressRowActions3 = true;
 * - suppressSort3 (suppress-sort3): Suppresses the sorting at tree level 3. Declared default: false.
 *   Example: child.suppressSort3 = true;
 * - rowsAndColumns (rows-and-columns): Tree payload: raw rows with Id and nested children; columns keyed
 * by levelOne, levelTwo and levelThree.
 *   Example: child.rowsAndColumns = this.treeData;
 * - maxHeight (max-height): CSS maximum height of the scrollable table.
 *   Example: child.maxHeight = "60vh";
 * - columnsBg (columns-bg): CSS column header background.
 *   Example: child.columnsBg = "#f3f3f3";
 * - colWidthConfigName (col-width-config-name): User display settings key for saved column widths.
 *   Example: child.colWidthConfigName = "accounts";
 * - sortConfigName (sort-config-name): User display settings key for saved sort configuration.
 *   Example: child.sortConfigName = "accounts";
 *
 * Public methods (call on the rendered child):
 * - async saveColumnWidths(inPixels=false): Persist column widths in user display settings.
 * - getColumnWidthsInPixels(): Read current pixel column widths.
 * - getColumnWidths(): Read current percentage column widths.
 * - getRecordById(recordId): Find a loaded record by ID.
 * - getCheckedRows(isObjectApiName=false, level='all'): Read selected rows; tree/auto variants optionally
 * include object names or level filtering.
 * - getRecordIds(level='all'): Read loaded record IDs (optionally restricted to a tree level).
 * - checkRows(level='all'): Select tree rows at the requested level.
 * - clearCheckboxes(level='all'): Clear row selections.
 * - resetColumnWidths(): Restore initial/default column widths.
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-slds-tree-grid rows-and-columns={treeData} expanded={enabled}
 *         suppress-row-actions={enabled} suppress-row-actions2={enabled}
 *         suppress-checkboxes={enabled} suppress-checkboxes2={enabled}>
 *     </c-slds-tree-grid>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     enabled = true;
 *     treeData = {
 *         columns: {
 *             levelOne: [{ fieldName: 'Name', label: 'Account', dtype: 'text' }],
 *             levelTwo: [{ fieldName: 'Name', label: 'Contact', dtype: 'text' }]
 *         },
 *         rows: [{ Id: 'row-1', Name: 'Acme', children: [{ Id: 'child-1', Name: 'Alex' }] }]
 *     };
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Use for hierarchical records with up to three separately configured column levels. Rows contain raw
 * field values plus children, not lightning-tree-grid's _children. Add columns.levelThree and
 * grandchildren under each child's children for the third level. The example uses display-only IDs; real
 * record actions require Salesforce IDs and matching object-name-level1/2/3.
 * - Selection variant: omit suppress-checkboxes flags and call getCheckedRows(false, 'all') or
 * getRecordIds('all'). checkRows/clearCheckboxes accept a level selector. treerefresh asks the parent to
 * reload data; customrowaction.detail is { id, selection }. show-empty-children enables empty nested
 * sections.
 */

import { LightningElement, track, api, wire } from 'lwc';

import resolveEntityPrefixes from "@salesforce/apex/DynamicSObjectController.resolveEntityPrefixes";
import saveRows from '@salesforce/apex/DataTableController.saveRows';
import deleteRecordsById from '@salesforce/apex/DynamicSObjectController.deleteRecordsById';
import newRecordLayoutModal from 'c/newRecordLayoutModal';
import { NavigationMixin } from 'lightning/navigation';

import userId from '@salesforce/user/Id';
import fetchUserDisplaySettingsByField from '@salesforce/apex/UserDisplaySettingsController.fetchUserDisplaySettingsByField';
import saveUserDisplaySettings from '@salesforce/apex/UserDisplaySettingsController.saveUserDisplaySettings';
import { mapPresetsToColWidths } from "c/utils"


import { 
    getErrorMessage, 
    getToastErrorMessage,
    sldsTableUtility,
    isValidProperty, 
    mapRowsToColumnsTree, 
    searchRecordsList,
    iconByDataType, 
    handleDateObjDisplayValue, 
    iconMap as ICON_MAP, 
    formatMultiPicklistVal,
    getCleanMetaDataLabels,
    iconByObjectApiName,
    iconPath, 
    addPageRefsFieldsArr,
    resetColumnWidths,
} from 'c/utils';

import {
    IS_NEED_REF,
    addObjectApiNameToFieldsArr,
    normalizeTree,
    getObjectApiNameByPrefix,
    handleRefFieldIds,
    getAllEntityPrefixes,
    buildRecordIdByObjectMap,
    parseRecordDeleteMessageObject,
    handleLevelIcons,
    getAllChildIds,
    getAllGrandChilIds,
    handleShowEmptyChildren,
} from './helpers';

import {
    getCheckboxesByLevel,
    getCheckboxesByParentId,
    clearAllCheckboxes,
    checkAllCheckboxes,
    clearCheckboxesByLevel,
    checkCheckboxesByLevel,
    getCheckedRowsByLevel,
    buildCheckedRowsByLevel,
} from './checkboxHelpers';

const CELL_TEXT_STYLES = {
    clipText: 'slds-truncate',
    wrapText: 'slds-has-flexi-truncate', 
    clampText: 'slds-line-clamp'
};


function handleRowsActionsValue(value) {
    if (value) {
        if ( Array.isArray(value) && value.every(opt => opt.label && opt.value) ) {
            const filteredActions = value.filter(opt => 
                (opt?.label?.toLowerCase() !== 'edit' && opt?.value?.toLowerCase() !== 'edit') &&
                (opt?.label?.toLowerCase() !== 'delete' && opt?.value?.toLowerCase() !== 'delete') 
            );
            if (filteredActions?.length) {
                return [
                    {label: 'Edit', value: 'edit'}, 
                    {label: 'Delete', value: 'delete'},
                    ...filteredActions
                ];
            }
        }
        return null;
    }
    return null;
}



export default class sldsTreeGrid extends NavigationMixin(LightningElement) {
    utility;
    @track iconMap = ICON_MAP;
    expandedIds = new Set();  // Rows that are expanded (children showing in dropdown)
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

    _onWinResize = null;
        // keep overflow state per element so we don’t thrash styles
    _overflowState = new WeakMap();

    // ---------- Toast ---------- \\
    @track showToastError = false;
    @track toastTitle;
    @track toastError;
    // --------------------------- \\

    _allExpanded = false;
    @api expanded = false;

    @api showEmptyChildren = false;
    @api noDataMessageLevel2 = 'No Data Available';
    @api noDataMessageLevel3 = 'No Data Available';

    @api iconTextLevel2;
    @api iconTextLevel2Cl = '';
    @api 
    set iconLevel2(val) {
        try {
            this._iconLevel2 = handleLevelIcons(val);
        } catch(error) {
            this.showToast('Error in set iconLevel2() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }
    get iconLevel2() {
        return this._iconLevel2;
    }
    @api iconTextLevel3;
    @api iconTextLevel3Cl = '';
    @api 
    set iconLevel3(val) {
        try {
            this._iconLevel3 = handleLevelIcons(val);
        } catch(error) {
            this.showToast('Error in set iconLevel3() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }
    get iconLevel3() {
        return this._iconLevel3;
    }
    
    // Object Api Names of the data at each level
    @api objectNameLevel1;
    @api objectNameLevel2;
    @api objectNameLevel3;

    // ------- Pagination -------- \\
    @track paginatedRows = {};
    @track pageInfo = {pageCount: 1, activePage: null};
    @track _isNewPage = false;
    @track crntHeight;
    // --------------------------- \\

    @track relativecontainer;
    @api 
    set rowActions1(value) {
        this._rowActions1 = handleRowsActionsValue(value);
    }
    get rowActions1() {
        return this._rowActions1 || [{label: 'Edit', value: 'edit'}, {label: 'Delete', value: 'delete'}]
    }
    @api 
    set rowActions2(value) {
        this._rowActions2 = handleRowsActionsValue(value);
    }
    get rowActions2() {
        return this._rowActions2 || [{label: 'Edit', value: 'edit'}, {label: 'Delete', value: 'delete'}]
    }
    @api 
    set rowActions3(value) {
        this._rowActions3 = handleRowsActionsValue(value);
    }
    get rowActions3() {
        return this._rowActions3 || [{label: 'Edit', value: 'edit'}, {label: 'Delete', value: 'delete'}]
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


    @track colsCnt = 9000;
    @track rowKeys = 100;
    @track isLoading=false;

    @track _popoverEdit = {};        // Reacitively update as <popoverEdit> changes within <sldsTableUtility> 
    @track _picklistOptions = [];   // Reacitively update as <picklistOptions> changes within <sldsTableUtility> 

    @track expandedRows = [];
    @track isDataLoaded = false;
    @track isInitialized = false;

    @track _tableThColumn = null;
    @track _pageX = null;
    @track _tableThWidth = null;
    _bodyCells = null;
    _allThs = null;

    @track _parentInitWidths = null;
    @track _childInitWidths = null;
    @track _initWidths = null;
    _parentResetSnapshot = null;
    _pendingParentResetSnapshot = false;

    @track localRows = [];
    @track levelOneColumns = [];
    @track levelTwoColumns = [];
    @track levelThreeColumns = [];

    @track isPaginator = false;
    @track _parentContainer;


    // ---- Table Properties ----- \\
    @api suppressRowCount = false;
    @api suppressResizer = false;
    @api suppressColActions = false;
    @api suppressCheckboxes = false;
    @api suppressRowActions = false;
    // --------------------------- \\

    // ---- Level 2 Properties --- \\
    @api suppressResizer2 = false;
    @api suppressColActions2 = false; 
    @api suppressCheckboxes2 = false;
    @api suppressRowActions2 = false;
    @api suppressSort2 = false
    // --------------------------- \\

    // ---- Level 3 Properties --- \\
    @api suppressResizer3 = false;
    @api suppressColActions3 = false; 
    @api suppressCheckboxes3 = false;
    @api suppressRowActions3 = false;
    @api suppressSort3 = false
    // --------------------------- \\


    // Store all recordIds to get object api names
    _allRecordIds = undefined;

    @api 
    set rowsAndColumns(value) {
        try {
            console.log('here is rows and columns in set rowsAndColumns() of sldsTreeGrid.js: ', JSON.stringify(value));
            this.paginatedRows  = {};
            this.pageInfo = {pageCount: 1, activePage: 1};
            this.localRows = [];
            this._rowsAndColumns = {};
            this.isLoading = true;
            this._rowsAndColumns = value;
            this.parseData(value);   

        }catch(err) {
            getToastErrorMessage(
                'sldsTreeGridNestedHeader --> set rowsAndColumns(value)', 
                'sldsTreeGrid.js',
                err);
            }    
    }
    get rowsAndColumns() {
        return this._rowsAndColumns;
    }

    @api 
    set maxHeight(value) {
        if (value) {
            this._maxHeight = value ? value : '70vh';
            this.template.host.style.setProperty('--max-height', `${this._maxHeight}`);
        }
        Promise.resolve().then(() => this.updateOverflowYSimple());
    }
    get maxHeight() {
        return this._maxHeight || 'calc(70vh - 50px)'; // Default if not set
    }   

    @api // Header columns background-color
    set columnsBg(val) {
        this._columnsBg = val;
        if (val) {
            this._applyVarsDirect('--vg-color-bg-tree-columns', val);
        }
    }
    get columnsBg() {
        return this._columnsBg;
    }


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
                this.evalPresetsToColumns();
            } catch(error) {
                this.showToast('Error in parsing in wiredfetchUserDisplaySettings() of sldsTreeGrid.js', getErrorMessage(error), 'error');
            }
        } else {
            this._tableConfigsResult = null;
        } 
         
        if (error) {
            this.showToast('Error in wiredfetchUserDisplaySettings() of sldsTreeGrid.js: ', getErrorMessage(error), 'error');
        }
    } 
    evalPresetsToColumns() {
        try {
            if (!this._tableConfigsResult || !this.levelOneColumns?.length) return;
            if (isValidProperty(this.colWidthConfigName, this._tableConfigsResult))  {
                this.levelOneColumns = mapPresetsToColWidths(this._tableConfigsResult, this.levelOneColumns, this.colWidthConfigName);
                this._syncRenderedParentColumnWidths();
            } 
            this._scheduleParentResetSnapshot();
            if (isValidProperty(this.sortConfigName, this._tableConfigsResult)) { 
                const onLoadSort = this._tableConfigsResult[this.sortConfigName];
                //console.log('here is onLoadSort in evalPresetsToColumns() in sldsTreeGrid.js: ', JSON.stringify(onLoadSort));
            }
        } catch(error) {
            this.showToast('Error in evalPresetsToColumns() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }

    // Save the Column Widths
    @api async saveColumnWidths(inPixels=false) {
        this.isLoading = true;
        try {
            // Call the data table for the current columnn widths
            const colWidths = inPixels ? this.getColumnWidthsInPixels() : this.getColumnWidths();
            
            if (colWidths && colWidths.length > 1) {

                const refCols = this.levelOneColumns.filter(col => col.isReference);
                // Update the column widths before saving so user does not have to reload the page
                this.levelOneColumns = mapPresetsToColWidths(colWidths, this.levelOneColumns.filter(col => !col.isReference));
                this.levelOneColumns = [
                    ...this.levelOneColumns,
                    ...refCols
                ].filter(Boolean);
                this._syncRenderedParentColumnWidths();
                this._scheduleParentResetSnapshot();

                // Store the current column widths as a JSON object in the Apex method argument 
                const userSettings = {[this.colWidthConfigName]: JSON.stringify(colWidths)};
                
                // Save the column widths to the User Settings
                await saveUserDisplaySettings({userId: this._userId, userSettings: userSettings});

                // Succesful Save
                this.showToast('Columns widths successfully saved', '', 'success');

            } else {
                this.showToast('Error Saving Column Widths', 'Failed to retrieve the column widths, please try again or contact an administrator', 'error');
            }
        } catch(error) {
            this.showToast('Error in saveColumnWidths() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        } finally {
            this.isLoading = false;
        }
    }

    _scheduleParentResetSnapshot() {
        this._pendingParentResetSnapshot = true;
    }

    _syncRenderedParentColumnWidths() {
        requestAnimationFrame(() => {
            const tableElement = this.template.querySelector('table.parent-table');
            if (!tableElement) {
                return;
            }

            tableElement.style.width = '';

            const allThs = Array.from(tableElement.querySelectorAll('thead th[data-col-type="parent"]'));
            allThs.forEach(th => {
                th.style.width = '';
                th.style.minWidth = '';
                th.style.maxWidth = '';
            });

            const parentRows = Array.from(
                tableElement.querySelectorAll('tbody > tr:not([data-is-nested-row="true"])')
            );
            parentRows.forEach(row => {
                Array.from(row.children).forEach(cell => {
                    if (cell?.dataset?.isFixedWidth === 'true') {
                        return;
                    }
                    cell.style.width = '';
                    cell.style.minWidth = '';
                    cell.style.maxWidth = '';
                });
            });
        });
    }

    _captureParentResetSnapshot() {
        const tableElement = this.template.querySelector('table.parent-table');
        if (!tableElement) {
            return;
        }

        const allThs = Array.from(tableElement.querySelectorAll('thead th'));
        if (!allThs.length) {
            return;
        }

        this._parentResetSnapshot = allThs.map(th => Math.round(th.getBoundingClientRect().width));
        this._pendingParentResetSnapshot = false;
    }

    _resetParentTableToRenderedWidths() {
        const tableElement = this.template.querySelector('table.parent-table');
        const widths = this._parentResetSnapshot;
        if (!tableElement || !widths?.length) {
            return;
        }

        const allThs = Array.from(tableElement.querySelectorAll('thead th'));
        allThs.forEach((th, index) => {
            const widthPx = widths[index];
            if (th && widthPx) {
                th.style.width = `${widthPx}px`;
                th.style.minWidth = `${widthPx}px`;
                th.style.maxWidth = `${widthPx}px`;
            }
        });

        const parentRows = Array.from(
            tableElement.querySelectorAll('tbody > tr:not([data-is-nested-row="true"])')
        );
        parentRows.forEach(row => {
            Array.from(row.children).forEach((cell, index) => {
                const widthPx = widths[index];
                if (cell && widthPx) {
                    cell.style.width = `${widthPx}px`;
                    cell.style.minWidth = `${widthPx}px`;
                    cell.style.maxWidth = `${widthPx}px`;
                }
            });
        });

        const totalWidth = widths.reduce((sum, width) => sum + width, 0);
        tableElement.style.width = totalWidth ? `${totalWidth}px` : '';
    }

    _resetChildTablesToDefaultWidths() {
        const nestedTables = this.template.querySelectorAll(
            'table[data-table-type="child"], table[data-table-type="grandchild"]'
        );

        nestedTables.forEach(table => {
            table.style.width = '';
            table.querySelectorAll('thead th, tbody th, tbody td').forEach(cell => {
                cell.style.width = '';
                cell.style.minWidth = '';
                cell.style.maxWidth = '';
            });
        });
    }

    _resetParentTableToDefaultWidths() {
        this.levelOneColumns = (this.levelOneColumns ?? []).map(col => ({
            ...col,
            width: col.isReference ? col.width : undefined
        }));

        requestAnimationFrame(() => {
            const tableElement = this.template.querySelector('table.parent-table');
            if (!tableElement) {
                return;
            }

            tableElement.style.width = '';

            tableElement.querySelectorAll('thead th[data-col-type="parent"]').forEach(th => {
                th.style.width = '';
                th.style.minWidth = '';
                th.style.maxWidth = '';
            });

            const parentRows = Array.from(
                tableElement.querySelectorAll('tbody > tr:not([data-is-nested-row="true"])')
            );
            parentRows.forEach(row => {
                Array.from(row.children).forEach(cell => {
                    if (cell?.dataset?.isFixedWidth === 'true') {
                        return;
                    }
                    cell.style.width = '';
                    cell.style.minWidth = '';
                    cell.style.maxWidth = '';
                });
            });
        });
    }

    @api getColumnWidthsInPixels() {
        const tableElement = this.template.querySelector('table.parent-table');
        if (!tableElement) return [];

        const allThs = tableElement.querySelectorAll('[data-col-type="parent"]');

        const currentWidths = [];

        allThs.forEach((th, index) => {
            const widthPx = th.getBoundingClientRect().width; // true rendered width
            const fieldName = th.dataset.fieldName || `col${index + 1}`;

            currentWidths.push({
                fieldName,
                width: Math.round(widthPx) + 'px'
            });
        });

        return currentWidths;
    }

    // Return the current column widths as %.  Structure: [ {fieldName: "<col.fieldName>", width: "x%"} ]
    @api getColumnWidths() {
        // Get the table element and ensure it exists
        const tableElement = this.template.querySelector('table.parent-table');
        if (!tableElement) {
            return [];
        }
    
        // Retrieve all header cells
        const allThs = tableElement.querySelectorAll('[data-col-type="parent"]');
        const totalTableWidth = tableElement.offsetWidth;
    
        // Build an array of column configurations
        const currentWidths = [];
        allThs.forEach((th, index) => {
            // Use the style width if available; otherwise, fallback to the offsetWidth
            const colWidth = parseFloat(th.style.width || th.offsetWidth);
            const percent = (colWidth / totalTableWidth) * 100;
    
            // Use a data attribute for fieldName if available, otherwise generate one (e.g., 'col1')
            const fieldName = th.dataset.fieldName || `col${index + 1}`;
    
            currentWidths.push({
                fieldName: fieldName,
                width: percent.toFixed(2) + "%"  // Store the percentage as a string with 2 decimal places
            });
        });
    
        return currentWidths.filter(Boolean);
    }


    get tableCls() {
        let baseCl = 'slds-table slds-table_bordered slds-table_edit slds-table_fixed-layout slds-tree slds-table_tree slds-table_resizable-cols slds-table_resizable-cols'
        if (this.tightTable) baseCl = baseCl + ' tight-table';
        return {
            parent: `${baseCl} parent-table`,
            child: `${baseCl} nested-table`
        }
    }
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
    

    // Initialize the <sldsTableUtilityPractice> Class. 
    connectedCallback() {
        try {
            // debounce window resize a bit
            let t;
            this._onWinResize = () => {
                clearTimeout(t);
                t = setTimeout(() => this.updateOverflowYSimple(), 50);
            };
            window.addEventListener('resize', this._onWinResize);

            if (!this.utility) {
                this.utility = new sldsTableUtility(this);
                this.utility.init();
            }   
            
            const host = this.template.host;
            if (this.suppressRowCount) {
                host.style.setProperty('--indent-td-width',  '1.625rem');
                host.style.setProperty('--indent-td-width-small',  '1.625rem');
            } else {
                host.style.setProperty('--indent-td-width', '3.625rem');
                host.style.setProperty('--indent-td-width-small', '1.625rem');
            }

            const utilsFns = [
                'focusCell','focusEditButton','blurEditButton','blurCell','handleEditClick', 'sortCol',
                'handleInputMessage','inputEleBlur', 'cancelEdits','resetClasses', 'clearDrafts',
            ];
            // Attach the utility functions directly to the Class
            for (const utilFn of utilsFns) {
                this[utilFn] = this.utility[utilFn];
            }
        } catch(error) {
            this.showToast('Error in connectedCallback() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }
    // Remove event listener
    disconnectedCallback() {
        window.removeEventListener('resize', this._onWinResize);
    }


    _wiredEntityPrefixes;
    @wire(resolveEntityPrefixes, { recordIds: "$_allRecordIds"})
    wiredEntityPrefixes({ error, data }) {
        if (!this._allRecordIds || !this._allRecordIds?.length) return;
        if (data) {
            this._wiredEntityPrefixes = data;
            this.addRecordLinksToRows();
        } else if (error) {
            return;
            this.showToast('Error in wiredEntityPrefixes() of sldsTreeGrid.js:', getErrorMessage(error), 'error');
        }
    }


    // ======================= Height/OverFlow Handlers ======================= \\
    _prevOverflowY = null;
    _onWinResize = null;
    // Update the overflow-y property on table container
    updateOverflowYSimple() {
        try {
            const el = this.template.querySelector('.tree-table-container');
            if (!el) return;

            // if a horizontal scrollbar is visible, it reduces clientHeight;
            // add a tiny tolerance so we don't flip for sub-pixel differences.
            const needsScroll = (el.scrollHeight - el.clientHeight) > 1;

            const next = needsScroll ? 'auto' : 'hidden'; // or 'visible' if you prefer
            if (this._prevOverflowY !== next) {
                el.style.overflowY = next;
                this._prevOverflowY = next;
            }
            this.updateResizerHeight();
        } catch(error) {
            this.showToast('Error in updateOverflowYSimple() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }

    updateResizerHeight() {
        try {
            const el = this.template.querySelector('.tree-table-container');
            if (!el) return;

            // If we're scrolling vertically, cap to the visible area.
            // Otherwise let it be full height (100%).
            const h = `${el.clientHeight - 1}px`;  // minus 1px to avoid off-by-one bleed
            this.template.host.style.setProperty('--vg-table-height', h);
        } catch(error) {
            this.showToast('Error in updateResizerHeight() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }

    }

    // Toggle overflow-y: auto / overflow: y: hidden based on maxHeight/tableHeight
    handleTableOverflow() {
        try {
            // make sure --max-height is set before we measure
            if (!this._maxHeight) {
                this.template.host.style.setProperty('--max-height', '70vh');
            }
            // subtract header once if you have one
            if (!this.suppressHeader) {
                const hdr = this.template.querySelector('[data-id="pageHeader"]');
                if (hdr) {
                const newMax = `calc(${this.maxHeight} - ${hdr.clientHeight}px)`;
                this.template.host.style.setProperty('--max-height', newMax);
                }
            }
            // now do the simple check
            this.updateOverflowYSimple();
        } catch(error) {
            this.showToast('Error in handleTableOverflow() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }            
    }
    // ====================================================================== \\

    @api getRecordById(recordId) {
        const rows = this.rowsAndColumns?.rows || [];
        if (rows.some(rec => rec?.Id === recordId)) {
            return rows.find(rec => rec?.Id === recordId);
        }

        const children = rows.flatMap(rec?.children ?? []).filter(Boolean);
        if (children?.length) {
            if (children.some(c => c.Id === recordId)) {
                return children.find(child => child?.Id === recordId);
            }
            const grandChildren = children.flatMap(rec?.children ?? []).filter(Boolean);
            return grandChildren?.length 
                ? grandChildren.find(gc => gc?.Id === recordId)
                : null;
        }
        return null;
    }

    // Return the checked rows
    @api getCheckedRows(isObjectApiName=false, level='all') {
        const checkedRows = getCheckedRowsByLevel(level, this);
        switch(level) {
            case 'all': 
                return isObjectApiName 
                    ? {
                        level1: {objectApiName: this.objectNameLevel1, checkedRows: checkedRows.level1},
                        level2: {objectApiName: this.objectNameLevel2, checkedRows: checkedRows.level2},
                        level3: {objectApiName: this.objectNameLevel3, checkedRows: checkedRows.level3},
                    }
                    : checkedRows;
            case '1':
                return isObjectApiName ? {objectApiName: this.objectNameLevel1, checkedRows } : checkedRows;
            case '2':
                return isObjectApiName ? {objectApiName: this.objectNameLevel2, checkedRows } : checkedRows;
            case '3':
                return isObjectApiName ? {objectApiName: this.objectNameLevel3, checkedRows } : checkedRows;
            default:
                this.showToast("You did send a valid level ('all', '1', '2', '3') to getCheckedRows() in sldsTreeGrid", '', 'warning');
                return;
        } 
        
        return isObjectApiName 
            ? {objectApiName, checkedRows} 
            : checkedRows;
    }
    // Return all record ids in the table 
    @api getRecordIds(level='all') {
        switch(level) {
            case '1':
            case 'parent':
                return this.localRows.map(rec => rec?.Id);
            case '2':
            case 'child':
                return this.localRows.flatMap(rec => rec?.children?.map(c => c?.Id).filter(Boolean) ?? []);
            case '3':
            case 'grandChild':
                return this.localRows.flatMap(rec =>
                    rec?.children?.flatMap(c =>
                        c?.children?.map(gc => gc?.Id).filter(Boolean) ?? []
                    ) ?? []
                );
            case 'all':
                return this._allRecordIds;
            default:
                this.showToast("You did send a valid level ('all', '1', '2', '3') to getRecordIds() in sldsTreeGrid", '', 'warning');
                return [];
        }
    }
    // Public method to check all row checkboxes 
    @api checkRows(level='all') {
        checkCheckboxesByLevel(level, this);
        this._checkedByLevel = buildCheckedRowsByLevel(level, this);
    }
    // Remove all the checked Rows 
    @api clearCheckboxes(level='all') {
        try {
            clearCheckboxesByLevel(level, this);
            switch(level) {
                case 'all':
                    this._checkedByLevel = {};
                    return;
                case '1':
                    this._checkedByLevel = {};
                    return;
                case '2': 
                    const newCheckedByLevel = {};
                    Object.keys(this._checkedByLevel).forEach(parentId => {
                        newCheckedByLevel[parentId] = []
                    });
                    this._checkedByLevel = newCheckedByLevel;
                    return;
                case '3':
                    this.showToast('clearCheckboxes() for Level 3 not yet configured in sldsTreeGrid', '', 'info');
                    return;
                default:
                    this.showToast("You did send a valid level ('all', '1', '2', '3') to clearCheckboxes() in sldsTreeGrid", '', 'warning');
                    return;
            }
        } catch(error) {
            this.showToast('Error in clearChecboxes() of sldsTreeGrid.js: ', getErrorMessage(error), 'error');
        }
    }


    get checkThCl() {
        return this.suppressRowCount
            ? 'slds-cell_action-mode slds-text-align_right action-col check-th-normal'
            : 'slds-cell_action-mode slds-text-align_right action-col check-th-small'
    }

    _picklistsChecked = false;
    // Trigger y-scroll if table content exceeds max-height ---++ subtract footer height if in edit mode
    renderedCallback() {
        try {
            if (this._isNewPage) {
                // If content loading do not update the components being passed to <x-custom-spinner>
                //return;
            }
            
            this.syncExpandedState();
            this.handleTableOverflow();

            // inside the parent component
            const allEditableCells = this.template.querySelectorAll('td.slds-cell-edit, th.slds-cell-edit');
            if (allEditableCells) this._allEditableCells = allEditableCells;

            // Track the parent element to send to <x-custom-spinner>
            if (!this._parentContainer) {
                this._parentContainer = this.template.querySelector('.tree-table-container');
            }

            // Track the table element ("loaded-content") to pass to <x-custom-spinner>
            this._loadedContentDiv = this.template.querySelector('[data-id="loaded-content"]');

            if (!this.relativecontainer) {
                this.relativecontainer =  this.template.querySelector('.slds-table_edit_container');
            }

            if (this.expanded && !this._allExpanded) {
                if (this.localRows?.length) {
                    const allToggles = this.template.querySelectorAll('.collapse-toggle-button');
                    if (allToggles) {
                        allToggles.forEach(toggle => {
                            if (toggle) toggle.click();
                        });
                        this._allExpanded = true;
                    }
                }
            }

            if (this.localRows?.length && this.levelOneColumns?.length && !this._picklistsChecked) {
                Promise.resolve().then(async () => {
                    this.levelOneColumns = await this.getPicklists(this.levelOneColumns, this.objectNameLevel1);
                    this.levelTwoColumns = await this.getPicklists(this.levelTwoColumns, this.objectNameLevel2);
                    this.levelThreeColumns = await this.getPicklists(this.levelThreeColumns, this.objectNameLevel3);
                    this._picklistsChecked = true;
                });
            }

            if (this._pendingParentResetSnapshot) {
                this._captureParentResetSnapshot();
            }

        } catch(error) {
            this.showToast('Error in handleTableOverflow() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }


    _isFlatTable = false;
    _levelOneTreeThCl = 'slds-tree__item slds-cell-edit slds-cell-wrap';
    // Process the data the parent sent
    parseData(val) {
        try {
            this.isLoading = true;

            // normalize once
            const normRows = normalizeTree(val.rows || []);
            const columns  = val.columns || {};
            this.isPaginator = normRows.length > 30;

            if (columns.levelOne) {
                if (!this.levelOneColumns?.length) {
                    this.levelOneColumns = this.getStarterCols(columns.levelOne, 'levelOne');
                    this.evalPresetsToColumns();
                }

                let starterRows = this.handleRowToColsMappings(normRows, columns.levelOne, null, 'levelOne');

                const hasChildren = this.isRowsChildren(starterRows, columns);
                const hasGrandchildren = this.isRowsGrandChildren(starterRows, columns);

                if (hasChildren || (this.showEmptyChildren && columns?.levelTwo?.length)) {
                    if (!this.levelTwoColumns?.length) {
                        this.levelTwoColumns = this.getStarterCols(columns.levelTwo, 'levelTwo');
                    }
                    starterRows = starterRows.map(parent =>
                        this.isParentWithChildren(parent)
                            ? this.handleRowToColsMappings(parent, columns.levelTwo, parent.Id, 'levelTwo')
                            : parent
                    );
                }

                if (hasGrandchildren || (this.showEmptyChildren && columns?.levelThree?.length)) {
                    if (!this.levelThreeColumns?.length) {
                        this.levelThreeColumns = this.getStarterCols(columns.levelThree, 'levelThree');
                    }
                    starterRows = starterRows.map(parent => {
                        if (!this.isParentWithGrandChildren(parent)) return parent;
                        return {
                            ...parent,
                            children: parent.children.map(child =>
                                child.children
                                    ? this.handleRowToColsMappings(child, columns.levelThree, `${parent.Id}-${child.Id}`, 'levelThree')
                                    : child
                            )
                        };
                    });
                }

                if (this.isPaginator) {
                    const paginatedObj = paginateRows(starterRows, 30);
                    this.pageInfo      = paginatedObj.pageInfo;
                    this.paginatedRows = paginatedObj.paginatedRows;
                    this.localRows     = paginatedObj.paginatedRows['1'];
                } else {
                    // assing tree rows to template variable
                    this.localRows = this.showEmptyChildren
                        ? handleShowEmptyChildren(starterRows, this.levelTwoColumns, this.levelThreeColumns)
                        : starterRows;
                }

                this._scheduleParentResetSnapshot();

            }

            if (this.localRows?.length) {
                // Get all Record Ids for entity prefixes
                this._allRecordIds = this.localRows.flatMap(rec => {
                    // Get record Id 
                    const ids = [rec?.Id];

                    // Check for Reference field record Ids
                    const refFieldIds = handleRefFieldIds(rec);
                    if (refFieldIds) {
                        ids.push(...refFieldIds)
                    }

                    if (rec?.children?.length) {
                        const childIds = rec.children.map(child => child?.Id).filter(Boolean);
                        const childRefIds = handleRefFieldIds(rec.children);
                        ids.push(...childIds, ...childRefIds);

                        const cWithGc = rec.children
                            ?.filter(child => child?.children?.length)
                            ?.flatMap(child => child.children);
                        if (cWithGc?.length) {  
                            const gcIds = cWithGc.map(gc => gc?.Id);
                            const gcRefs = handleRefFieldIds(cWithGc);
                            const allGcIds = [...gcIds, gcRefs];
                            ids.push(...allGcIds);
                        }
                    }

                    return ids.filter(Boolean);
                });
            }

            // Flag flat tables (records with no children)
            const hasNoChildren = !this.localRows.some(r => r?.children?.length);
            this._isFlatTable = hasNoChildren && !this.showEmptyChildren;
            // If flat table  --->  Remove "slds-tree__item" class from the <th> class of the <tbody> 
            this._levelOneTreeThCl = hasNoChildren 
                ? 'slds-cell-edit slds-cell-wrap'
                : 'slds-tree__item slds-cell-edit slds-cell-wrap';

            this.addRecordLinksToRows();


        } catch(error) {
            this.showToast('Error in parseData() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        } finally {
            this.isDataLoaded = true;
            this.isLoading = false;
        }
    }

    // Find all record Ids in the array of records (including reference field record ids)
    buildRecordIdsArr() {
        try {
            if (this.localRows?.length) {
                // Get all record Ids
                this._allRecordIds = this.localRows.flatMap((rec) => {
                    const ids = [];

                    if (rec?.Id) ids.push(rec.Id);
                    ids.push(...handleRefFieldIds(rec));

                    const children = rec?.children ?? [];
                    if (children.length) {
                        ids.push(...children.map(c => c?.Id).filter(Boolean));
                        ids.push(...handleRefFieldIds(children));

                        const grandChildren = children.flatMap(c => c?.children ?? []);
                        if (grandChildren.length) {
                            ids.push(...grandChildren.map(gc => gc?.Id).filter(Boolean));
                            ids.push(...handleRefFieldIds(grandChildren));
                        }
                    }

                    // de-dupe per parent row if desired
                    return [...new Set(ids)].filter(Boolean);
                });
                // De-duplicate
                this._allRecordIds = [...new Set(this._allRecordIds)];
            }
        } catch(error) {
            this.showToast('Error in buildRecordIdsArr() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }   

    // Add 'url' properties (along with object api name) for reference fields 
    async addRecordLinksToRows() {
        try {
            if (!this.localRows?.length || !this._wiredEntityPrefixes) return;

            const needsRefs = this.localRows.some(rec => 
                // Check for parent ref/name fields
                rec?.fields?.some(f => IS_NEED_REF(f, this._wiredEntityPrefixes)) || 
                // Check for child/grandchild ref/name fields
                rec?.children?.some(child => 
                    // child
                    child?.fields?.some(cf => IS_NEED_REF(cf, this._wiredEntityPrefixes)) ||
                    // grandchild
                    child?.children?.some(gChild => gChild?.fields?.some(gf => IS_NEED_REF(gf, this._wiredEntityPrefixes))) 
                )
            );

            if (!needsRefs) return;
        
            const linkedRows = [];
            for (const parent of this.localRows) {
                // Add linka to parent reference fields
                const parentFields = await this.addLinksToRecFields(parent);
                if (!parent?.children?.length) {
                    if (this.showEmptyChildren && this.levelTwoColumns?.length) {
                        linkedRows.push({...parent, fields: parentFields, children: []});
                    } else {
                        linkedRows.push({...parent, fields: parentFields});
                    }
                    continue;
                }
                // new array to store linked records
                const newChildren = [];

                for (const child of parent.children) {
                    // Add links to child reference fields
                    const childFields = await this.addLinksToRecFields(child);
                    if (!child?.grandChildren?.length) {
                        newChildren.push({...child, fields: childFields});
                        continue;
                    }

                    // new array to store linked records
                    const newGrandChildren = [];
                    for (const gc of child.grandChildren) {
                        // Add links to grandChild reference fields
                        const gcFields = await this.addLinksToRecFields(gc);
                        newGrandChildren.push({...gc, fields: gcFields});
                    }
                    newChildren.push({
                        ...child,
                        fields: childFields,
                        children: newGrandChildren
                    });
                }

                linkedRows.push({
                    ...parent, 
                    fields: parentFields, 
                    children: newChildren
                })
            }
            
            this.localRows = linkedRows;
        } catch(error) {
            this.showToast('Error in addRecordLinks() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }
    // Loop the fields of the record and add refs 
    async addLinksToRecFields(rec) {
        try {
            const fields = rec.fields;
            if (!fields?.length) return [];
            if (fields.some(f => f && IS_NEED_REF(f, this._wiredEntityPrefixes))) {
                // Add object api name to reference fields
                const fieldsEnriched = addObjectApiNameToFieldsArr(fields, this._wiredEntityPrefixes);
                // Add links to reference fields
                const linkedFields = await addPageRefsFieldsArr(fieldsEnriched, this);
                return linkedFields;
            }
            // return original fields array
            return fields;

        } catch(error) {
            this.showToast('Error in addLinksToRecFields() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }

    // Get all picklist options for each Table Level
    async getPicklists(levelCols, levelObjectApiName) {
        if (!levelCols?.length || !levelObjectApiName) {
            return levelCols;
        }

        const picklistCols = levelCols.filter(col => 
            (col?.dtype === 'picklist' || col?.dtype === 'multipicklist') && 
            col?.fieldName
        );
        if (!picklistCols?.length) {
            return levelCols;
        }

        const picklistComponent = this.template.querySelector('c-wired-picklist-values-lwc');
        if (picklistComponent) {
            const picklistFields = await picklistComponent.getPicklistValues(levelObjectApiName);
            if (picklistFields) {
                return levelCols.map(col => {
                    const options = picklistFields?.[col.fieldName];
                    return options?.length 
                        ? {...col, options}
                        : col;
                });
            }
        }
        return levelCols;
    }

    // ======================== Pagination Handlers ========================= \\
    // Get the meta for  the paginator combobox options is <isPaginator> is true
    get paginatedRowsMeta() {
        try {
            if (this.isPaginator) {

                if (this.utility.sortedCol.hasOwnProperty('fieldName') && this._sortedCol.fieldName) {

                    // Get the combobox options' icon by referencing the sorted column's data type
                    const optionIcon = iconByDataType[this.utility.sortedCol.dtype];

                    return Object.keys(this.paginatedRows).map(page => {
                        // Get the fieldName's value of the first row 
                        let metaOne = this.paginatedRows[page][0].fields.find(f => 
                            f.fieldName === this.utility.sortedCol.fieldName
                        )?.label;
                        // Get the fieldName's value of the last row
                        let metaTwo = this.paginatedRows[page][this.paginatedRows[page].length-1].fields.find(f => 
                            f.fieldName === this.utility.sortedCol.fieldName
                        )?.label;

                        // Flag strike through if no metaOne available
                        let isMetaOneStrike = false;
                        // Flag strike through if no metaTwo available
                        let isMetaTwoStrike = false;

                        if (!metaOne) {
                            metaOne = this.utility.sortedCol.label;
                            isMetaOneStrike = true;
                        }
                        if (!metaTwo) {
                            metaTwo = this.utility.sortedCol.label;
                            isMetaTwoStrike = true;
                        }

                        // Add <metaOne> as the second meta if sort type is Descending  (first if ascending)
                        return {
                            label: `Page ${page} - ${this.utility.sortedCol?.label ?? ''}`,
                            value: page,
                            icon: optionIcon,
                            metaOne: this.utility.sortedCol.type === 'asc' ? metaOne || '' : metaTwo || '',
                            metaTwo: this.utility.sortedCol.type === 'asc' ? metaTwo || '' : metaOne || '',
                            isMetaOneStrike: isMetaOneStrike,
                            isMetaTwoStrike: isMetaTwoStrike
                        };
                    });
                }
            }
        } catch(error) {
            this.showToast('Error in get paginatedRowsMeta() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }
    // <x-slds-table-paginator>/<x-slds-combobox-search> Event --> Update <localRows> to active page
    handlePageChange(message) {
        try {
            const page = message.detail;
            if (page) {
                // Trigger a spinner
                this._isNewPage = true;
                requestAnimationFrame(() => {
                    // Store the current page's rows
                    this.paginatedRows[this.pageInfo.activePage] = this.localRows.map(row => ({...row}));

                    // Prepare the new rows
                    const newRows = this.paginatedRows[page].map(row => {
                        const parent = {...row};
                        if (parent.children) {
                            parent.children = parent.children.map(child => {
                                const childCopy = {...child};
                                if (childCopy.children) {
                                    childCopy.children = childCopy.children.map(g => ({...g}));
                                }
                                return childCopy;
                            });
                        }
                        return parent;
                    });
                    // Force full DOM rehydration
                    this.localRows = [];
                    setTimeout(() => {
                        this.localRows = newRows;
                        this.pageInfo.activePage = page;
                    }, 0);
                });
                
            }
        } catch(error) {
            this.showToast('Error in handlePageChange() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        } finally {
            this._isNewPage = false;
            //setTimeout(() => {this._isNewPage = false;})
        }
    }
    // ====================================================================== \\
    // =================== Row/Column Custom Table Properties =================== \\
    // Map the newly recieved columns with a 'colId' and 'keyId' property
    getStarterCols(cols, lvl) {
        try {
            return cols.map(col => {
                // Check for "wrapText", "clipText", "clampText" in 'textStyle' property
                const textStyle = isValidProperty('textStyle', col) && Object.keys(CELL_TEXT_STYLES).some(val => col.textStyle === val)
                    ? col.textStyle 
                    : 'clipText';
                    

                let colIcon = null;
                const icon = col.colIcon;
                if (icon) {
                    //console.log('here is icon in sldsTreeGrid.js: ', JSON.stringify(icon));
                    const iconCl = typeof icon === 'object' && icon.cl ? icon.cl : '';
                    const iconSize = typeof icon === 'object' && icon.size ? icon.size : 'x-small';
                    const clndIcon = typeof icon === 'object' ? icon.icon : icon;

                    colIcon = iconPath(clndIcon, true);
                    
                    if (colIcon) {
                        //console.log('here is colIcon in sldsTreeGrid.js: ', JSON.stringify(colIcon));
                        colIcon.container = `${colIcon.container} slds-m-right_xx-small`;
                        colIcon.svg = `slds-icon slds-icon_${iconSize} ${iconCl}`;
                    }
                }
                return {
                    ...col, 
                    colId: `${lvl}-${col.fieldName}`, 
                    keyId: this.colsCnt++, textStyle,
                    colIcon
                }
            });
        } catch(error) {
            this.showToast('Error in getStarterCols() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }
    // Add the Custom Table properties by calling "tableUtils.mapRowsToColumnsTree()"
    handleRowToColsMappings(entity, cols, childAccessor=null) {
        try {
            // Get the new properties and increment the key counter
            const resObj = childAccessor 
                ? mapRowsToColumnsTree(entity.children, cols)
                : mapRowsToColumnsTree(entity, cols)

            this.rowKeys = resObj.count;

            return childAccessor 
                ? {...entity, children: resObj.rows.map(row => ({...row, childAccessor: childAccessor}))}
                : resObj.rows;

       } catch(error) {
            this.showToast('Error in handleRowToColsMappings() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }
    // =========================================================================== \\
    // ======================= Flag Children/Grandchildren ======================= \\
    // Check if the dataset has grandchildren
    isRowsGrandChildren(rows, cols=null) {
        try {
            if (cols) {
                return rows?.some(stRw => stRw?.children?.some(child => child?.children?.length > 0) ) &&
                    (cols?.levelThree?.length > 0);
            } 
            return rows?.some(stRw => stRw?.children?.some(child => child?.children?.length > 0) );
        } catch(error) {
            this.showToast('Error in isRowsGrandChildren() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }
    // Check if the dataset has children
    isRowsChildren(rows, cols=null) {
        try {
            if (cols) {
                return rows?.some(row => row?.children && row?.children?.length > 0) && 
                    (cols.hasOwnProperty('levelTwo') && cols?.levelTwo?.length > 0);
            }
            return rows.some(row => row?.children && row?.children?.length > 0); 
        } catch(error) {
            this.showToast('Error in isRowsChildren() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }
    // Check if single parent has children
    isParentWithChildren(rowP) { 
        return rowP.children && rowP.children.length > 0
    }
    // Check if single parent has grandchildren
    isParentWithGrandChildren(rowP) {
        try {
            if (!(rowP.hasOwnProperty('children') && rowP.children.length > 0))  {
                return false;
            }
            return rowP?.children?.some(child => child.hasOwnProperty('children') && child.children.length > 0);
        } catch(error) {
            this.showToast('Error in isParentWithGrandChildren() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }
    // =========================================================================== \\

    // Handle Text Style of Columns
    handleColAction(event) {
        try {
            const table = event.currentTarget.closest('table');
            const d = event?.detail ?? {};

            // Accept both shapes:
            let level, fieldName;
            if (Array.isArray(d.id)) {
                [level, fieldName] = d.id;
            } else {
                if (typeof d.id === 'string' && d.id.includes('-')) {
                    // Split on '-'
                    const parts = d.id.split('-');
                    level = parts[0];
                    fieldName = parts[1];
                }
            }
            const newTextStyle = d.selection ?? d.value ?? null;
            if (!fieldName || !level || !newTextStyle) return;

            // update column model
            const colsKey = `${level}Columns`;
            const colList = this[colsKey] || [];
            const colEntry = colList.find(c => c.fieldName === fieldName);
            if (!colEntry || colEntry.textStyle === newTextStyle) return;

            this[colsKey] = colList.map(c =>
                c.fieldName === fieldName ? { ...c, textStyle: newTextStyle } : c
            );

            // swap classes in the DOM
            const currentClass = CELL_TEXT_STYLES[colEntry.textStyle];  
            const nextClass = CELL_TEXT_STYLES[newTextStyle];

            if (currentClass && nextClass) {
                // Use your boolean flags instead of data-table-level
                const selector = `[data-table-level="${level}"][data-cell-field-name="${fieldName}"]`;
                const cells = this.template.querySelectorAll(selector);
                cells.forEach(cell => {
                    if (cell.classList.contains(currentClass)) {
                        cell.classList.replace(currentClass, nextClass);
                    } else {
                        // in case the class wasn't there (fresh render)
                        cell.classList.add(nextClass);
                        cell.classList.remove(currentClass);
                    }
                });
            }
       } catch(error) {
            this.showToast('Error in handleColAction() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }

    
    /*
        w/ suppressCheckboxes:
            extraThAmt = 1
            toAdd = 0

        w/o suppressCheckboxes:
            extraThAmt = 2
            toAdd = 2

        difference = 3
    */
   
    // Track Level 1 column amount to define the <colAmout> in the <td> wrapper of the level 2 table 
    get colAmount() { 
        let extraThAmt = 2; 

        if (this.suppressColActions) extraThAmt -= 1; 
        if (this.suppressRowCount) extraThAmt -= 1; 


        // outer parent table has: 1 checkbox col + N data cols + 1 actions col 
        const totalParentCols = 2 + this.levelOneColumns.length; 
        
        const toAdd = this.suppressRowCount ? 0 : 2;

        // Subtract the 1 indent <td> 
        return totalParentCols - extraThAmt + toAdd; 
    }
    

    // Track Level 2 column amount to define the <colAmout> in the <td> wrapper of the level 3 table
    get childColAmount() {
        const totalChildCols =  1 + this.levelTwoColumns.length + 1;
        // Subtract the 2 indent <td>
        return totalChildCols - 1;
    }

    // Expand the tree grid  when the user clicks the Dropdown Chevron
    toggleExpandRow = (event) => {
        try {
            const button = event.currentTarget;
            const rowId = String(button.dataset.rowId);

            // 1) Scope to the actual parent TR that owns this button
            const parentTr = button.closest('tr[data-element="fieldRow"][data-row-id]');
            if (!parentTr) return;

            // 2) Prefer the *adjacent* nested row (your markup renders it right after the parent)
            let childTr = parentTr.nextElementSibling;

            const isChildControl = childTr?.nodeType === 1 &&
                childTr?.getAttribute('data-element') === 'childRowControl';

            const matchesParent = childTr?.getAttribute('data-parent-id') === rowId;

            if (!(isChildControl && matchesParent)) {
                // 3) Fallback: only search within THIS tbody, not the whole template
                const tbody = parentTr.parentElement; // <tbody>
                childTr = tbody?.querySelector(
                    `tr[data-element="childRowControl"][data-parent-id="${rowId}"]`
                );
            }

            if (!childTr) return;

            // 4) Toggle expanded state (by id, not index)
            const willOpen = childTr.classList.contains('slds-hide');
            childTr.classList.toggle('slds-hide', !willOpen);
            childTr.classList.toggle('custom-show', willOpen);

            parentTr.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
            button.setAttribute('aria-expanded', willOpen ? 'true' : 'false');

            if (willOpen) {
                this.expandedIds.add(rowId);
            }
            else {
                this.expandedIds.delete(rowId);
            }

            this.updateOverflowYSimple();

        } catch(error) {
            this.showToast('Error in toggleExpandRow() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    };

    syncExpandedState() {
        try {
            this.template.querySelectorAll('tr[data-element="childRowControl"]').forEach((tr) => {
                const pid = String(tr.getAttribute('data-parent-id') || '');
                const open = this.expandedIds.has(pid);
                tr.classList.toggle('slds-hide', !open);
                tr.classList.toggle('custom-show', open);

                // update the matching toggle button aria-expanded
                const btn = this.template.querySelector(
                    `button.collapse-toggle-button[data-row-id="${pid}"]`
                );
                btn?.setAttribute('aria-expanded', open ? 'true' : 'false');

                // and the parent row aria-expanded
                const parentRow = this.template.querySelector(
                    `tr[data-element="fieldRow"][data-row-id="${pid}"]`
                );
                parentRow?.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        } catch(error) {
            this.showToast('Error in syncExpandedState() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }

    // If hovers over level 2 or 3 table highlight the elbows of the nested table
    handleMouseEnter(event) {
        try {
            if (event.currentTarget.classList.contains('slds-resizable__handle')) {
                event.stopPropagation();
                return;
            }
            const id = event.currentTarget.dataset.tdWrapperParent;
            // Remove ALL existing highlights
            const allIndents = this.template.querySelectorAll('[data-style="treeHighlight"]');
            allIndents.forEach(indent => {
                indent.classList.remove('indent-td-active', 'nested-table-active');
            });

            // Highlight only the current level
            const matching = this.template.querySelectorAll(`[data-indent-id="${id}"][data-style="treeHighlight"]`);
            matching.forEach(el => {
                if (el.classList.contains('nested-table')) {
                    el.classList.add('nested-table-active');
                } else {
                    el.classList.add('indent-td-active');
                }
            });
        } catch(error) {
            this.showToast('Error in handleMouseEnter() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }
    // If mouse leaves level 3: highlight level 2 elbows --> if mouse leaves level 2 table: remove all elbow highlights
    handleMouseLeave(event) {
        try {
            const childId = event.currentTarget.dataset.tdWrapperParent;
            const parentId = event.currentTarget.dataset.parent;
            // Remove highlight from current child
            const currentElements = this.template.querySelectorAll(`[data-indent-id="${childId}"][data-style="treeHighlight"]`);

            currentElements.forEach(el => {
                el.classList.remove('indent-td-active', 'nested-table-active');
            });

            if (!parentId) return;

            // Re-highlight parent
            const parentElements = this.template.querySelectorAll(`[data-indent-id="${parentId}"][data-style="treeHighlight"]`);
            parentElements.forEach(el => {
                if (el.classList.contains('nested-table')) {
                    el.classList.add('nested-table-active');
                } else {
                    el.classList.add('indent-td-active');
                }
            });
        } catch(error) {
            this.showToast('Error in handleMouseLeave() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }



    // ====================== Handle Column Resizing ======================= \\
    // Find the Column that is being resized and the column widths that follow  ---++  track the total table width
    handlemousedown(event) {
        try {
            event.preventDefault();
            event.stopPropagation();
            // Disable text selection during resizing
            const container = this.template.querySelector('.tree-table-container');
            if (container) {
                container.style.userSelect = 'none';
            }

            // Identify the column (th) being resized
            this._tableThColumn = event.target.closest('th');
            if (!this._tableThColumn) return; 

            // Store initial mouse position and column width
            this._pageX = event.pageX;
            this._tableThWidth = this._tableThColumn.offsetWidth;

            // Determine if this is a parent or child column
            const colType = this._tableThColumn.getAttribute('data-col-type');

            if (colType === 'parent') {
                // ============== ORIGINAL PARENT LOGIC (EXACT) ============= //
                const tableElement = this.template.querySelector('[data-table-type="parent"]');
                const allThs = tableElement.querySelectorAll('[data-col-type="parent"]');
                const totalTableWidth = tableElement.offsetWidth;

                try {
                    if (!this._initWidths) {

                        this._initWidths = [];
                        allThs.forEach((th) => {
                            const colWidth = th.offsetWidth;
                            const widthPercentage = (colWidth / totalTableWidth) * 100;
                            if (widthPercentage > 0) {
                                this._initWidths.push(widthPercentage);
                            }
                        });
                    }
                } catch (error) {
                    getToastErrorMessage(
                        'sldsTreeGridNestedHeader --> Error storing original column widths',
                        'sldsTreeGrid.js',
                        error
                    );
                }
                allThs.forEach((th) => {
                    th.style.width = `${th.offsetWidth}px`;
                });
                // =========== END ORIGINAL PARENT LOGIC (EXACT) ============ //

            } else if (colType === 'child') {
                // ============== CHILD TABLE LOGIC ============== //
                // Get the nested table containing this column
                const tableElement = this._tableThColumn.closest('table');
                // Select all child headers in this table
                const allThs = tableElement.querySelectorAll('[data-col-type="child"]');
                const totalTableWidth = tableElement.offsetWidth;

                try {
                    if (!this._initWidths) {
                        this._initWidths = [];
                        allThs.forEach((th) => {
                            const colWidth = th.offsetWidth;
                            const widthPercentage = (colWidth / totalTableWidth) * 100;
                            this._initWidths.push(widthPercentage);
                        });
                    }
                } catch (error) {
                    getToastErrorMessage(
                        'sldsTreeGridNestedHeader --> Error storing original column widths', 
                        'sldsTreeGrid.js',
                        error);
                    }

                // Freeze all column widths for the current child table
                allThs.forEach((th) => {
                    th.style.width = `${th.offsetWidth}px`;
                });
                // ============ END CHILD TABLE LOGIC ============= //
            }  else if (colType === 'grandchild') {
                // ============== CHILD TABLE LOGIC ============== //
                // Get the nested table containing this column
                const tableElement = this._tableThColumn.closest('table');
                // Select all child headers in this table
                const allThs = tableElement.querySelectorAll('[data-col-type="grandchild"]');
                const totalTableWidth = tableElement.offsetWidth;

                try {
                    if (!this._initWidths) {
                        this._initWidths = [];
                        allThs.forEach((th) => {
                            const colWidth = th.offsetWidth;
                            const widthPercentage = (colWidth / totalTableWidth) * 100;
                            this._initWidths.push(widthPercentage);
                        });
                    }
                } catch (error) {
                    getToastErrorMessage(
                        'sldsTreeGridNestedHeader --> Error storing original column widths', 
                        'sldsTreeGrid.js',
                        error);
                    }

                // Freeze all column widths for the current child table
                allThs.forEach((th) => {
                    th.style.width = `${th.offsetWidth}px`;
                });
                // ============ END CHILD TABLE LOGIC ============= //
            }

            // Add global event listeners for resizing
            document.addEventListener('mousemove', this.handlemousemove.bind(this));
            document.addEventListener('mouseup', this.handlemouseup.bind(this));

        } catch(error) {
            this.showToast('Error in handlemousedown() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }
    // Column resizing drag adjustment
    handlemousemove(event) {
        try {
            event.preventDefault();
            event.stopPropagation();
            if (!this._tableThColumn) return;

            const diffX = event.pageX - this._pageX;
            let newWidth = this._tableThWidth + diffX;

            // Enforce a minimum width
            newWidth = Math.max(newWidth, 80);

            // Update the header column width
            this._tableThColumn.style.width = `${newWidth}px`;

            // Determine if this is a parent or child column
            const colType = this._tableThColumn.getAttribute('data-col-type');

            if (colType === 'parent') {
                // ============== ORIGINAL PARENT LOGIC (EXACT) ============= //
                const tableElement = this.template.querySelector('[data-table-type="parent"]');
                if (!this._allThs) this._allThs = tableElement.querySelectorAll('[data-col-type="parent"]');

                // Recalculate total table width
                const totalTableWidth = Array.from(this._allThs).reduce(
                    (sum, th) => sum + parseFloat(th.style.width || th.offsetWidth),
                    0
                );
                tableElement.style.width = `${totalTableWidth}px`;

                // Adjust corresponding body cells
                const columnIndex = Array.from(this._tableThColumn.parentNode.children).indexOf(this._tableThColumn);
                if (!this._bodyCells) {
                    this._bodyCells = this.template.querySelectorAll(
                        `table tbody tr:not([data-is-nested-row="true"]) td:nth-child(${columnIndex + 1})`
                    );
                }
                this._bodyCells.forEach((cell) => {
                    cell.style.width = `${newWidth}px`;
                });
                // =========== END ORIGINAL PARENT LOGIC (EXACT) ============ //

            } else if (colType === 'child') {
                // ============== CHILD TABLE LOGIC ============== //
                const tableElement = this._tableThColumn.closest('table');
                if (!this._allThs) this._allThs = tableElement.querySelectorAll('[data-col-type="child"]');

                // Recalculate total table width
                const totalTableWidth = Array.from(this._allThs).reduce(
                    (sum, th) => sum + parseFloat(th.style.width || th.offsetWidth),
                    0
                );
                tableElement.style.width = `${totalTableWidth}px`;

                // Find column index and update only the child table's body cells
                const headerRow = this._tableThColumn.parentNode;
                const columnIndex = Array.from(headerRow.children).indexOf(this._tableThColumn);
                if (!this._bodyCells) {
                    this._bodyCells = this.template.querySelectorAll(
                        `tbody tr td:nth-child(${columnIndex + 1})`
                    );
                }
                this._bodyCells.forEach((cell) => {
                    cell.style.width = `${newWidth}px`;
                });
                // ============ END CHILD TABLE LOGIC ============= //
            } else if (colType === 'grandchild') {
                // ============== CHILD TABLE LOGIC ============== //
                const tableElement = this._tableThColumn.closest('table');
                if (!this._allThs) this._allThs = tableElement.querySelectorAll('[data-col-type="grandchild"]');

                // Recalculate total table width
                const totalTableWidth = Array.from(this._allThs).reduce(
                    (sum, th) => sum + parseFloat(th.style.width || th.offsetWidth),
                    0
                );
                tableElement.style.width = `${totalTableWidth}px`;

                // Find column index and update only the child table's body cells
                const headerRow = this._tableThColumn.parentNode;
                const columnIndex = Array.from(headerRow.children).indexOf(this._tableThColumn);
                if (!this._bodyCells) {
                    this._bodyCells = this.template.querySelectorAll(
                        `tbody tr td:nth-child(${columnIndex + 1})`
                    );
                }
                this._bodyCells.forEach((cell) => {
                    cell.style.width = `${newWidth}px`;
                });
                // ============ END CHILD TABLE LOGIC ============= //
            }
        } catch(error) {
            this.showToast('Error in handlemousemove() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }
    // Store new column widths on drag completion
    handlemouseup() {
        try {
            // Remove global event listeners
            document.removeEventListener('mousemove', this.handlemousemove.bind(this));
            document.removeEventListener('mouseup', this.handlemouseup.bind(this));

            // Reactivate text selection
            const container = this.template.querySelector('.tree-table-container');
            if (container) {
                container.style.userSelect = '';
            }
            this._allThs = null;
            this._bodyCells = null;

            // Reset references
            this._tableThColumn = null;
            this._pageX = null;
            this._tableThWidth = null;
        } catch(error) {
            this.showToast('Error in handlemouseup() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }
    
    // -- Main -- Reset Table Column Widths
    @api resetColumnWidths() {
        this._parentResetSnapshot = null;
        this._pendingParentResetSnapshot = false;
        this._initWidths = null;
        this._resetParentTableToDefaultWidths();
        this._resetChildTablesToDefaultWidths();
    }
    
    // ===================================================================== \\

    // Track isTableEdited in <sldsTableUtilityPractice>
    get isTableEdited() {
        return this.utility ? this.utility.isTableEdited : false;
    }
    // Alter the color of the edit footer if <isPaginator>
    get footerBgClass() {
        return this.isPaginator
            ? 'slds-docked-form-footer footer-light-medium'
            : 'slds-docked-form-footer';
    }

    // =========================== Save/Cancel Drafts ========================== \\
    // Remove tabIndex=0 & slds-is-edited 
    resetCellClasses() {
        try {
            const allCells = this.template.querySelectorAll('.slds-cell-edit');
            if (allCells) {
                allCells.forEach(cell => {
                    cell.classList.remove('slds-is-edited');
                    cell.setAttribute("tabIndex", "-1");
                });
            }

            // **TODO** once you cconfigure the checkbox logic add this
            //const checkboxes = this.template.querySelectorAll('[data-element="rowCheckbox"]');
            //if (checkboxes) {
            //    checkboxes.forEach(checkbox => {
            //        checkbox.checked = false;
            //    });
            //}
            this.template.querySelectorAll('[data-element="fieldRow"]').forEach(row => row.classList.remove('slds-is-selected'));
            this.checkboxArray = [];
        } catch(error) {
            this.showToast('Error in resetCellClasses() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }

    // ------------------ Save Edits ------------------ \\
    // Save the edits to the database ---++ Reset cell styling classes
    async saveEdits() {
        this.isLoading = true;
        try {   
            const drafts = this.utility.draftValues;
            if (this._wiredEntityPrefixes) {
                const sObjRecs = drafts.map(draftRec => {
                    // Get object api name
                    const sObjectType = getObjectApiNameByPrefix(draftRec?.Id, this._wiredEntityPrefixes);
                    if (sObjectType) {
                        return {
                            sObjectType, 
                            ...draftRec
                        };
                    }
                }).filter(Boolean);

                if (sObjRecs?.length) {
                    const recsLength = sObjRecs.length;
                    await saveRows({ rows: sObjRecs });
                    this.showToast(`${recsLength} records successfully updated.`, '', 'success');
                    this.resetEditState();
                    this._tableSaved = true;
                    this.dispatchEvent(new CustomEvent('treerefresh', { detail: 'treerefresh' } ));
                }
            }

        } catch(error) {
            this.showToast('Error in saveEdits() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        } finally{
            this.isLoading = false;
        }
    }
    resetEditState() {
        this.utility._clearDrafts();
        this.resetCellClasses();
        this.utility.isTableEdited = false;

    }
    // ================================================ \\


    // ===============Row Action Handlers============== \\
    checkboxArray = [];
    _levelOneCheckedArr = [];
    _levelTwoCheckedArr = [];
    _levelThreeCheckArr = [];
    _checkedByLevel = {}
    // Add the record id from the level's checked arrays
    handleChecked(event, tableP=null) {
        try {
            // get the table level of the reocrd (parent/child/grandchild)
            const level = event.detail.level;
            // get record id 
            const id = event.detail.recordId; 

            // closest table element of the checkbox (parent has only 1 table)
            const table = tableP ?? event.target.closest('table');
            
            // Get the parent id  --->  Set as 'parent' record's id as 'parent'
            const parentId = tableP || level === 'parent' 
                ? 'parent' 
                : table.dataset.parentId ?? 'parent';

            // get all record ids for the table 
            const allCheckboxes = tableP ? getCheckboxesByLevel('parent', this) 
                : getCheckboxesByParentId(table.dataset.parentId, this);

            // Get all record ids 
            const allRecordIds = Array.from(allCheckboxes).map(check => check?.dataset?.recordId ?? null)
                .filter(Boolean);
            
            const isAll = id.startsWith('select all');

            if (parentId && id) {    
                if (isAll) {
                    // Update checkbox Array
                    this._checkedByLevel = {...this._checkedByLevel, [parentId]: allRecordIds};
                    // Query the template for the checkboxes (excluding select all checkbox)
                    allCheckboxes.forEach(check => {if (check) check.checkMe();})
                    
                } else {
                    if (!this._checkedByLevel[parentId]) {
                        this._checkedByLevel[parentId] = [];
                    }
                    // Get the level's Ids array
                    const newLvlMapped = [...this._checkedByLevel[parentId], id];

                    // update the ids array
                    this._checkedByLevel = {...this._checkedByLevel, [parentId]: newLvlMapped};
                    
                    if (newLvlMapped.length === allRecordIds.length) {
                        // Set select all to true for level 
                        // get all record ids for the table 
                        const selectAll = level === 'parent' 
                            ? this.template.querySelector('input[data-is-select-all="true"][data-level="parent"]')
                            : this.template.querySelector(`c-tree-checkbox[data-parent-id="${parentId}"][data-is-select-all="true"]`);
                        
                        if (selectAll) {
                            if (level === 'parent') {
                                selectAll.checked = true;
                            } else {
                                try {
                                    selectAll.checkMe();
                                } catch (error) {
                                    this.showToast('Error handling selectAll in handleChecked() of sldsTreeGrid.js: ', getErrorMessage(error), 'error');
                                }
                            }
                        }
                    }
                }
            }
        } catch(error) {
            this.showToast('Error in handleChecked() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }
    // Remove the record id from the level's checked arrays
    handleUnChecked(event, tableP=null) {
        try {
            const level = event.detail.level;
            const id = event.detail.recordId;
            const isAll = id.startsWith('select all');

            // closest table element of the checkbox (parent has only 1 table)
            const table = tableP ?? event.target.closest('table');

            // Get the parent id  --->  Set as 'parent' record's id as 'parent'
            const parentId = tableP ? 'parent' : table.dataset.parentId;

            // get all record ids for the table     
            const allCheckboxes = tableP ? getCheckboxesByLevel('parent', this) 
                : getCheckboxesByParentId(table.dataset.parentId, this);

            // Get all record ids 
            const allRecordIds = Array.from(allCheckboxes).map(check => check?.dataset?.recordId ?? null)
                .filter(Boolean);



            if (parentId && id) {
                
                if (isAll) {
                    if (allCheckboxes) {
                        // uncheck the elements
                        allCheckboxes.forEach(check => {if (check) check.uncheckMe();});
                        // clear the parentId's checkbox array 
                        this._checkedByLevel = { ...this._checkedByLevel, [parentId]: [] }; 
                    }
                    
                } else {
                    // Remove the id from the level's checkbox array
                    const newLvlMapped = this._checkedByLevel[parentId].filter(recId => recId !== id);
                    // Clear the child record from the parent (or Id if table is parent table)
                    this._checkedByLevel = { ...this._checkedByLevel, [parentId]: newLvlMapped}; 

                    if (newLvlMapped.length !== allRecordIds.length) {
                        // Get the select all element
                        const selectAll = level === 'parent' 
                            ? this.template.querySelector('input[data-is-select-all="true"][data-level="parent"]')
                            : this.template.querySelector(`c-tree-checkbox[data-parent-id="${parentId}"][data-is-select-all="true"]`);
                        
                        if (level === 'parent') {
                            // uncheck select all element
                            selectAll.checked = false;
                        } else {
                            // uncheck select all element
                            selectAll.uncheckMe();
                        }
                    }
                }
            
            }
        } catch(error) {
            this.showToast('Error in handleChecked() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }
    handleLevelOneSelectAll(event) {
        try {
            const checked = event.target.checked;
            const level = 'parent';
            const recordId = 'select all parents';
                
            const message = { detail: {level, recordId} };
            const table = event.target.closest('table');
            if (checked) {
                this.handleChecked(message, table);
            } else {
                this.handleUnChecked(message, table);
            }
        } catch(error) {
            this.showToast('Error in handleLevelOneSelectAll() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }

    modalConfig;
    // ⬅️ your original code moved here (unchanged except the refresh event)
    async _handleRowAction(event) {
        try {
            const { id = null, selection = null } = event?.detail || {};

            if (id && selection) {
                switch (selection) {
                    case 'delete':
                        if (this.checkboxArray.length) {
                            this.modalConfig = {
                                columns: 1,
                                modalTitle: 'Delete Record',
                                okLabel: 'Delete',
                                recordIds: [id, ...this.checkboxArray]
                            };
                        } else {
                            this.modalConfig = {
                                columns: 1,
                                modalTitle: 'Delete Record',
                                okLabel: 'Delete',
                                recordIds: [id]
                            };
                        }
                        return;

                    case 'edit':
                        const objectApiName = getObjectApiNameByPrefix(id, this._wiredEntityPrefixes);
                        if (objectApiName) {
                            const objectLabel = getCleanMetaDataLabels(objectApiName);
                            const result = await newRecordLayoutModal.open({
                                size: 'small',
                                description: 'edit',
                                label: `Edit ${objectLabel} Record`,
                                objectApiName,
                                recordId: id
                            });
                            // undefined → saved
                            if (result?.result === 'success') {
                                this.dispatchEvent(new CustomEvent('treerefresh', { detail: 'treerefresh' } ));
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
                            return;
                        }

                    default:
                        this.dispatchEvent(new CustomEvent('customrowaction', { detail: {id, selection} } ));
                        return;
                }
            }
        } catch(error) {
            this.showToast('Error in handleRowAction() of sldsTreeGrid.js: ', getErrorMessage(error), 'error');
        }
    }

    // Handle "Cancel" modal action
    closeModal() {
        this.modalConfig = null;
    }
    // Handle "Delete" modal action 
    async handleDeleteRecordModal() {
        try {
            let isRefresh = false;
            const recordIds = this.modalConfig?.recordIds ?? [];
            this.closeModal();

            if (Array.isArray(recordIds) && recordIds?.length) {

                // Store all record Ids by object api name
                const recordIdsByObjectApiName = buildRecordIdByObjectMap(recordIds, this._wiredEntityPrefixes);
                if (recordIdsByObjectApiName) {
                    // Prepare a toast to display number of records deleted by object api name 
                    const deletedByObjectApiName = {};
                    // Store failures to delete 
                    const deleteFailures = {};

                    for (const [objectApiName, recordIds] of Object.entries(recordIdsByObjectApiName)) {
                        // Get label of object
                        const objectLabel = getCleanMetaDataLabels(objectApiName);
                        try {
                            // Delete record ids for each object api name
                            await deleteRecordsById({ recordIds, objectApiName});
                            // Store number of deleted records for the current object
                            deletedByObjectApiName[objectLabel] = recordIds.length;

                        } catch(error) {
                            // Unsuccessful deletion
                            deleteFailures[objectLabel] = recordIds.length;
                            this.showToast(`Error deleting ${recordIds.length} ${objectLabel} records`, '', 'error');
                        }
                    }

                    // Check for errors/successes
                    const hasErrors = Object.values(deleteFailures)?.some(cnt => !!cnt);
                    const hasSuccess = Object.values(deletedByObjectApiName)?.some(cnt => !!cnt);
                    const successMsg = hasSuccess ? parseRecordDeleteMessageObject(deletedByObjectApiName, 'Successfully deleted')
                        : '';
                    const errMsg = hasErrors ? parseRecordDeleteMessageObject(deleteFailures, 'Failed to delete')
                        : '';

                    if (!hasSuccess) {
                        this.showToast(errMsg, '', 'error');
                    } else {
                        isRefresh = true;
                        this.showToast(successMsg, errMsg, 'success');
                    }
                    if (isRefresh) {
                        this.dispatchEvent(new CustomEvent('treerefresh', { detail: 'treerefresh' } ));
                    }
                }
            }
        } catch(error) {
            this.showToast('Error in handleDeleteRecordModal() of sldsTreeGrid.js', getErrorMessage(error), 'error');
        }
    }
    // ================================================ \\

    async handleRecordLinks() {
        if (!this.localRows || !this._wiredEntityPrefixes) {
            return;
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



    // ===================== Toast ===================== \\
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
    // ================================================= \\


}