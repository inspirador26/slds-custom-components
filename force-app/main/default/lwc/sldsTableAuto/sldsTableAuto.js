


/**
 * sldsTableAuto — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/newRecordLayoutModal, ./tableConstants, ./recordPreviewHelpers, ./helpers,
 * c/utils, c/utils.
 * - Salesforce/platform modules: lwc, lightning/navigation, @salesforce/user/Id,
 * @salesforce/apex/UserDisplaySettingsController.fetchUserDisplaySettingsByField,
 * @salesforce/apex/UserDisplaySettingsController.saveUserDisplaySettings,
 * @salesforce/schema/User_Display_Settings__c.Column_Widths_All_JSON__c,
 * @salesforce/schema/User_Display_Settings__c.Page_Size_All_JSON__c,
 * @salesforce/apex/DataTableController.saveRows,
 * @salesforce/apex/DynamicSObjectController.deleteRecordsById.
 * - Template children (including conditional UI): c-custom-slds-combobox-multi-select-practice,
 * c-dropdown-plain, c-object-infos-lwc, c-slds-combobox, c-slds-illustration, c-slds-input,
 * c-slds-menu-popover-button, c-slds-modal, c-slds-modal-slot, c-slds-page-header-list-view,
 * c-slds-record-view-panel, c-toast-lwc, c-wired-picklist-values-lwc, c-wired-records-lwc, lightning-card,
 * lightning-formatted-email, lightning-formatted-rich-text.
 * - Bundle template: sldsTableAuto.html; local styles: sldsTableAuto.css. Salesforce SLDS styling is
 * expected.
 * - Shared CSS modules: c/sharedStylesGlobal, c/sharedStylesSldsTable.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-table-auto') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - externalFilterState (external-filter-state): Parent-owned filter indicator metadata; isApplied
 * controls the active-filter indication.
 *   Example: child.externalFilterState = { isApplied: true };
 * - colWidthConfigName (col-width-config-name): User display settings key for saved column widths.
 *   Example: child.colWidthConfigName = "accounts";
 * - sortConfigName (sort-config-name): User display settings key for saved sort configuration.
 *   Example: child.sortConfigName = "accounts";
 * - pageSizeConfigName (page-size-config-name): User display settings key for saved page size.
 *   Example: child.pageSizeConfigName = "accounts";
 * - borderRadius (border-radius): CSS corner radius, including units.
 *   Example: child.borderRadius = "0.25rem";
 * - columnsBg (columns-bg): CSS column header background.
 *   Example: child.columnsBg = "#f3f3f3";
 * - rowsBg (rows-bg): CSS row background.
 *   Example: child.rowsBg = "#ffffff";
 * - stripedBg (striped-bg): CSS alternate-row background.
 *   Example: child.stripedBg = "#f3f3f3";
 * - objectLabel (object-label): Singular object label displayed in headings/messages.
 *   Example: child.objectLabel = "Account";
 * - noDataTitle (no-data-title): Heading shown when there are no records.
 *   Example: child.noDataTitle = "No accounts";
 * - missingDataHelpText (missing-data-help-text): Supporting text shown when data is missing.
 *   Example: child.missingDataHelpText = "Try changing the filters.";
 * - suppressIllustration (suppress-illustration): Suppresses the illustration presentation when data is
 * missing. Declared default: false.
 *   Example: child.suppressIllustration = true;
 * - illustrationSize (illustration-size): SLDS illustration size token. Declared default: "small".
 *   Example: child.illustrationSize = "small";
 * - suppressIllustrationImage (suppress-illustration-image): Hides the empty-state illustration image.
 *   Example: child.suppressIllustrationImage = true;
 * - suppressIllustrationBorder (suppress-illustration-border): Removes the illustration border.
 *   Example: child.suppressIllustrationBorder = true;
 * - fontSize (font-size): CSS text size, including units.
 *   Example: child.fontSize = "0.875rem";
 * - tightTable (tight-table): Uses compact row/cell spacing. Declared default: false.
 *   Example: child.tightTable = true;
 * - stripedTable (striped-table): Enables alternating row backgrounds. Declared default: false.
 *   Example: child.stripedTable = true;
 * - suppressBorderedTable (suppress-bordered-table): Removes the table's outer border treatment. Declared
 * default: false.
 *   Example: child.suppressBorderedTable = true;
 * - colBorders (col-borders): Adds vertical column borders. Declared default: false.
 *   Example: child.colBorders = true;
 * - suppressFilterMeta (suppress-filter-meta): Compatibility property: suppresses the filter summary
 * metadata; currently stored/exposed but not consumed by this implementation. Declared default: false.
 *   Example: child.suppressFilterMeta = true;
 * - suppressColActions (suppress-col-actions): Suppresses the column action menus. Declared default:
 * false.
 *   Example: child.suppressColActions = true;
 * - suppressSortButton (suppress-sort-button): Suppresses the sort button. Declared default: false.
 *   Example: child.suppressSortButton = true;
 * - suppressCheckboxes (suppress-checkboxes): Suppresses the row selection checkboxes. Declared default:
 * false.
 *   Example: child.suppressCheckboxes = true;
 * - suppressRowActions (suppress-row-actions): Suppresses the row action menus. Declared default: false.
 *   Example: child.suppressRowActions = true;
 * - suppressResizableCols (suppress-resizable-cols): Suppresses the column resizing. Declared default:
 * false.
 *   Example: child.suppressResizableCols = true;
 * - suppressResetColumnWidths (suppress-reset-column-widths): Suppresses the reset column widths action.
 * Declared default: false.
 *   Example: child.suppressResetColumnWidths = true;
 * - suppressRowCount (suppress-row-count): Suppresses the row count.
 *   Example: child.suppressRowCount = true;
 * - suppressSort (suppress-sort): Suppresses the sorting.
 *   Example: child.suppressSort = true;
 * - isSimpleTable (is-simple-table): Uses the simplified row-action/layout variant.
 *   Example: child.isSimpleTable = true;
 * - listSubTitle (list-sub-title): Main list-view subtitle/name in the page header.
 *   Example: child.listSubTitle = "All Accounts";
 * - listTitle (list-title): Smaller object/list title above the list-view name.
 *   Example: child.listTitle = "Accounts";
 * - suppressHeader (suppress-header): Hides the standard header. Declared default: false.
 *   Example: child.suppressHeader = true;
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
 * - suppressListViewChange (suppress-list-view-change): Suppresses the list-view switching. Declared
 * default: false.
 *   Example: child.suppressListViewChange = true;
 * - notifyDeletion (notify-deletion): Emits the table's deletion notification when records are deleted.
 * Declared default: false.
 *   Example: child.notifyDeletion = true;
 * - rowActions (row-actions): Row action option array with label and value.
 *   Example: child.rowActions = [{ label: 'Edit', value: 'edit' }];
 * - columns (columns): Schema-driven columns; each field contains objectApiName/fieldApiName (normally an
 * @salesforce/schema import); first field determines the queried object.
 *   Example: child.columns = [{ field: ACCOUNT_NAME, label: 'Account' }];
 * - listViewName (list-view-name): List-view API/configuration name used for settings.
 *   Example: child.listViewName = "AllAccounts";
 * - conditions (conditions): Query conditions: structured buildWhereClause configuration or SOQL predicate
 * (without WHERE), optionally followed by LIMIT.
 *   Example: child.conditions = { cond1: [{ fieldName: 'Name', isValues: ['Acme'] }], limit: 25 };
 * - maxHeight (max-height): CSS maximum height of the scrollable table.
 *   Example: child.maxHeight = "60vh";
 * - sortedCol (sorted-col): Initial sort descriptor matched to a column's fieldName.
 *   Example: child.sortedCol = { fieldName: 'Name', isAsc: true };
 * - sendPicklists (send-picklists): Emits sendpicklists after picklist metadata is available. Declared
 * default: false.
 *   Example: child.sendPicklists = true;
 * - sendRows (send-rows): Emits sendrows with loaded record data. Declared default: false.
 *   Example: child.sendRows = true;
 * - sendRowsLength (send-rows-length): Emits rowslength with the loaded row count. Declared default:
 * false.
 *   Example: child.sendRowsLength = true;
 * - masterDetailField (master-detail-field): Master-detail field used by the table's new-record logic.
 * Declared default: null.
 *   Example: child.masterDetailField = "Account__c";
 *
 * Public methods (call on the rendered child):
 * - async saveColumnWidths(inPixels = false): Persist column widths in user display settings.
 * - getColumnWidthsInPixels(): Read current pixel column widths.
 * - getColumnWidths(): Read current percentage column widths.
 * - async handleRefresh(suppressSpinner = false): Reload backing records; await completion where
 * asynchronous.
 * - resetColumnWidths(): Restore initial/default column widths.
 * - getCheckedRows(isObjectApiName = false): Read selected rows; tree/auto variants optionally include
 * object names or level filtering.
 * - getRecordIds(): Read loaded record IDs (optionally restricted to a tree level).
 * - checkAllRows(): Select all current rows.
 * - async clearCheckboxes(): Clear row selections.
 * - getRecordById(recordId): Find a loaded record by ID.
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-slds-table-auto columns={columns} conditions={conditions}
 *         send-rows-length={enabled} onrowslength={handleCount}></c-slds-table-auto>
 *     <p>Loaded records: {count}</p>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * import ACCOUNT_NAME from '@salesforce/schema/Account.Name';
 * import ACCOUNT_PHONE from '@salesforce/schema/Account.Phone';
 * export default class Parent extends LightningElement {
 *     enabled = true;
 *     count = 0;
 *     columns = [{ field: ACCOUNT_NAME, label: 'Account' }, { field: ACCOUNT_PHONE, label: 'Phone' }];
 *     conditions = { cond1: [{ fieldName: 'Name', notValues: [''] }], limit: 25 };
 *     handleCount(event) { this.count = event.detail; }
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Use for an org-backed list/table that loads its own records and metadata. The first column's
 * field.objectApiName determines the object; schema imports supply that shape. This requires object/field
 * access and the Apex/child dependencies listed above.
 * - Filtering variant: conditions = { cond1: [{ fieldName: 'Name', isValues: ['Acme'] }], limit: 25 }.
 * Supply a predicate when using a limit with the tile query, since its Apex method prepends WHERE.
 * Conditions are translated by the repository's query helpers; separate condition groups use AND and
 * entries within a group use OR. send-rows enables sendrows; send-rows-length enables rowslength. Call
 * handleRefresh() on the rendered component after external changes. Column metadata can also configure
 * reference previews and dynamic fields; see buildRowsAndColumns/addMetaDataToColFields for those advanced
 * descriptors. Use sldsTable when the parent owns the rows.
 */



import { LightningElement, wire, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import newRecordLayoutModal from "c/newRecordLayoutModal";
import userId from "@salesforce/user/Id";

import {
  SAVED_LIST_VIEW_OPTIONS,
  DISPLAY_OPTIONS,
  SETTINGS_OPTIONS,
  getFilteredByInfo,
  FIELD_API_NAME_EXCEPTIONS,
  coerceByDtype,
  TO_LOCAL_DTYPE,
  CELL_TEXT_STYLES
} from "./tableConstants";

import {
  BUILD_PREVIEW_QUERY,
  FIND_NAME_FIELD,
  IS_PARENT_OBJECT,
  IS_CHILD_OBJECT,
  BUILD_CHILD_OBJ_INFOS,
  BUILD_PARENT_OBJ_INFOS,
  BUILD_MAIN_REF_INFOS
} from "./recordPreviewHelpers";

import { objectHasRecordTypes, handleGetTableRecordsRes } from "./helpers";

import {
  getErrorMessage,
  isValidProperty,
  mapRowsToColumns,
  handleDateObjDisplayValue,
  iconMap as ICON_MAP,
  iconPath,
  formatMultiPicklistVal,
  NON_NAV_TARGETS,
  NOT_NAV_TARGET_HANDLERS,
  getCleanMetaDataLabels,
  iconByObjectApiName,
  createUniqueKeyIds,
  addPageRefsFieldsArr,
  handleSearchFilter,
  handleEveryFilter,
  resetColumnWidths,
  updateOverflowYSimple,
  handleTableOverflow,
  handlemousedown,
  handlemousemove,
  handlemouseup,
  handleRevertFields,
  persistSort,
  persistSearchTerm,
  persistCheckedRows,
  persistEditedFields,
  handleSelectAllRows,
  handleCheckboxChange,
  evalSelectAllAfterCheck,
  clearCheckboxes,
  selectAllCheckboxes,
  applyRowNumbers,
  focusListHeader
} from "c/utils";

import fetchUserDisplaySettingsByField from "@salesforce/apex/UserDisplaySettingsController.fetchUserDisplaySettingsByField";
import saveUserDisplaySettings from "@salesforce/apex/UserDisplaySettingsController.saveUserDisplaySettings";
import { mapPresetsToColWidths } from "c/utils";

import COLUMN_WIDTHS_ALL_JSON_FIELD from "@salesforce/schema/User_Display_Settings__c.Column_Widths_All_JSON__c";
import PAGE_SIZE_ALL_JSON_FIELD from "@salesforce/schema/User_Display_Settings__c.Page_Size_All_JSON__c";

import saveRows from "@salesforce/apex/DataTableController.saveRows";
import deleteRecordsById from "@salesforce/apex/DynamicSObjectController.deleteRecordsById";

export default class SldsTableAuto extends NavigationMixin(LightningElement) {
  colTextOptions = [
    { label: "Clip Text", value: "clipText" },
    { label: "Wrap Text", value: "wrapText" },
    { label: "Clamp Text", value: "clampText" }
  ]; // For Column Actions Button (clip/wrap/clamp)
  savedColProperties = []; // Maintain Column Properties after save event

  headerConfig = {
    // Plural Object label of the Table (e.g. 'Leads')
    pageLabel: "",
    // Picklist value of selected List View  (e.g. 'Open Leads')
    listViewTitle: "",
    // Ex: {iconType: 'standard', iconName: 'metric'}
    iconConfig: { iconType: "", iconName: "" },
    // Ex: {label: 'Activity Date', type: 'desc', fieldName: 'activity_date', dtype: 'date'}
    sortedByObj: { label: "", type: "", fieldName: "", dtype: "" },
    // Strcture: `${currentListView} - ${filteredField}`  --->  Ex: 'All Open Leads - Status'
    filteredBy: "",
    // List Views Picklist --> Ex: [{label: 'All Lead', value: 'All Leads'}, {label: 'Recently Viewed', value: 'Recently Viewed'}]
    savedListViewOptions: [],
    // Type of table  --> Ex: [ {label: 'Table', value: 'Table'}, {label: 'Kanban', value: 'Kanban'} ]
    displayOptions: DISPLAY_OPTIONS,
    // Settings Menu  --> Ex: [ {label: 'New', value: 'New'}, {label: 'Rename', value: 'Rename'} ]
    settingsOptions: SETTINGS_OPTIONS
  };
  filterDetails = { isFilter: false };
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
  @api
  set pageSizeConfigName(val) {
    this._pageSizeConfigName = val;
  }
  get pageSizeConfigName() {
    return this._pageSizeConfigName ?? undefined;
  }

  @api
  set borderRadius(val) {
    this._borderRadius = val;
    if (val) {
      this._applyVarsDirect("--c-footer-border-radius", val);
    }
  }
  get borderRadius() {
    return this._borderRadius ?? "var(--slds-g-radius-border-1, 0.25rem)";
  }

  panelQuery = [];
  panelColumns = [];
  nubbin = "left-top"; // Position of <c-record-view-panel> nubbin
  _anchorEl; // Anchor the preview panel to the cell that was clicked
  _previewTrigger;
  _isSide = false;
  _onReposition;
  _scrollers;

  // ------- Table Colors ------ \\
  _columnsBg = "var(--slds-g-color-neutral-base-95)";
  _rowsBg = "var(--slds-g-color-neutral-base-100)";
  _stripedBg = "var(--vg-color-default-stripe-table)";
  @api
  set columnsBg(v) {
    this._columnsBg = v;
    if (v) {
      this._applyVarsDirect("--vg-color-columns-bg-table", v);
    }
  }
  get columnsBg() {
    return this._columnsBg;
  }
  @api
  set rowsBg(v) {
    this._rowsBg = v;
    if (v) {
      this._applyVarsDirect("--vg-color-rows-bg-table", v);
    }
  }
  get rowsBg() {
    return this._rowsBg;
  }
  @api
  set stripedBg(v) {
    this._stripedBg = v;
    if (v) {
      this._applyVarsDirect("--vg-color-striped-bg-table", v);
    }
  }
  get stripedBg() {
    return this._stripedBg;
  }
  // --------------------------- \\

  // -------- Object Info ------ \\
  // Add custom object label if desired
  _objectLabel;
  @api set objectLabel(val) {
    this._objectLabel = val;
  }
  get objectLabel() {
    return this._objectLabel;
  }
  objectName;
  isRecordTypes = false;
  // --------------------------- \\

  // ----- Error Properties ---- \\
  @api noDataTitle; // Main "No data" title
  @api missingDataHelpText; // Message when there is no data, default: "No <objectLabel> data available"
  @api suppressIllustration = false; // no image when error/missing data, only the message
  @api illustrationSize = "small"; // size of the image when error or missing data
  _isNoData = true;
  @api // only suppress the  image  not the missing  data  message
  set suppressIllustrationImage(value) {
    if (value) {
      this._isNoData = false;
    }
    this._suppressIllustrationImage = value;
  }
  get suppressIllustrationImage() {
    return this._suppressIllustrationImage;
  }
  @api
  set suppressIllustrationBorder(value) {
    this._suppressIllustrationBorder = value;
    if (value) this._applyVarsDirect("--vg-border-illustration", "none");
  }
  get suppressIllustrationBorder() {
    return this._suppressIllustrationBorder;
  }
  // --------------------------- \\

  // ----- Table Attributes -----\\
  @api
  set fontSize(val) {
    this._fontSize = val;
    if (val) {
      this._applyVarsDirect("--c-font-size", val);
    }
  }
  get fontSize() {
    return this._fontSize;
  }

  @api tightTable = false;

  @api stripedTable = false;
  @api suppressBorderedTable = false;
  @api colBorders = false;

  @api suppressFilterMeta = false;
  @api suppressColActions = false;
  @api suppressSortButton = false;
  @api suppressCheckboxes = false;
  @api suppressRowActions = false;
  @api suppressResizableCols = false;
  @api suppressResetColumnWidths = false;
  _suppressRowCount = false;
  _suppressSort = false;
  @api set suppressRowCount(val) {
    this._suppressRowCount = val;
  }
  get suppressRowCount() {
    return this._suppressRowCount;
  }
  @api set suppressSort(val) {
    this._suppressSort = val;
  }
  get suppressSort() {
    return this._suppressSort;
  }
  // --------------------------- \\

  // For Button at end of row (Edit/Delete)
  _rowActionClsObj = {
    th: "slds-cell-fixed row-action-small",
    td: "row-action-cell row-action-small"
  };
  @api
  set isSimpleTable(value) {
    this._isSimpleTable = value;
    if (value) {
      this._rowActionClsObj = {
        th: "slds-cell-fixed row-action-small",
        td: "row-action-cell row-action-small"
      };
      //this.suppressResizableCols = true;
      this._suppressRowCount = true;
      this._suppressSort = true;
      //this.suppressColActions = true;
    }
  }
  get isSimpleTable() {
    return this._isSimpleTable;
  }

  // ----- Header Attributes -----\\
  // (bottom) larger text label of List View Header
  @api
  set listSubTitle(value) {
    this._listSubTitle = value;
    if (this.headerConfig) {
      this.headerConfig = { ...this.headerConfig, listViewTitle: value };
    }
  }
  get listSubTitle() {
    return this._listSubTitle;
  }
  @api listTitle; // (top) smaller text label on the List View Header

  @api suppressHeader = false;
  @api suppressCharts = false;
  @api suppressFilter = false;
  @api suppressSettings = false;
  @api suppressViewOptions = false;
  @api suppressOverflowMenu = false;
  @api suppressEdit = false;
  @api suppressNewRecord = false;
  @api suppressListViewChange = false;
  // --------------------------- \\

  // Store field names of picklist values
  fieldPicklists;
  // Icon resource for <svg> style icons
  iconMap = ICON_MAP;
  // Show spinner while loading
  isLoading = false;

  // ------- Modal Config ------- \\
  modalConfig = {
    tableModalMessage: null,
    modalCancelLabel: null,
    modalOkayLabel: null,
    tableModalHandler: null
  };
  popoverEditCopy = {};
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

  @api notifyDeletion = false;

  // ------- Resize Cols ------- \\
  _tableThColumn;
  _pageX;
  _tableThWidth;
  _initWidths;

  _bodyCells;
  _allThs;
  _tableEle;
  // --------------------------- \\

  isDataLoaded = false;

  // ------ Drafts/Edits ------- \\
  draftOriginalValues = []; // Store the original value of each field that was edited
  draftValues = []; // Store all current values of each edited field
  popoverEdit = {};
  picklistOptions = []; // if is a picklist type with editing popover ---> store the options
  _outsideClickHandler; // Handle outside click of Edit Popover when Multi-Edit is enabled
  _isMultiEditPopover = false; // Multi-Edit Flag
  isApplyClicked = false; // Apply cell actions to all selected rows when true
  // --------------------------- \\

  // ------- Table Data -------- \\
  noResultsFound = false;
  localRows = [];
  stableRows = [];
  localColumns = [];
  _rows = []; // Private variable for the records array data
  _columns = []; // Private variable for the columns
  // --------------------------- \\

  // ======================== Public Properties ========================== \\
  @api // Actions for the row-action buttons
  set rowActions(value) {
    if (value) {
      if (
        Array.isArray(value) &&
        value.every((opt) => opt.label && opt.value)
      ) {
        const filteredActions = value.filter(
          (opt) =>
            opt?.label?.toLowerCase() !== "edit" &&
            opt?.value?.toLowerCase() !== "edit" &&
            opt?.label?.toLowerCase() !== "delete" &&
            opt?.value?.toLowerCase() !== "delete"
        );
        if (filteredActions?.length) {
          this._rowActions = [
            { label: "Edit", value: "edit" },
            { label: "Delete", value: "delete" },
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
    return (
      this._rowActions || [
        { label: "Edit", value: "edit" },
        { label: "Delete", value: "delete" }
      ]
    );
  }

  _objectInfos; // Will Store all Object Data for all Objects mentioned in the Columns
  @api // Columns for the table
  set columns(value) {
    this._initWidths = null;
    this._columns = value;
    this.localColumns = null; // force a full re-init next time
    this._initDone = false; // if you’re using this flag
    this.evalPresetsToColumns();
  }
  get columns() {
    return this._columns;
  }

  // Check if conditions set Rows Limit on the Apex Query
  _isInitLimit = false;
  _isRowsLimit = false;
  _originalLimit;
  /* Filter apex results with a condition. Nullable property defaults to false.  Unfold for more info...
        • for AND condition add a new property, in the example below the condition is cond1 AND cond2
            AND Ex: conditions = { cond1: [ {fieldName: LEAD_STATUS_FIELD.fieldApiName, notValues: ['Qualified'], nullable: false} ], cond2: [...] }
        • for OR conitions put the conditions in the same array.  In the example below the  condition is "Status !== 'Qualified' OR Due_Date > '2025-01-01'"
            OR Ex: [ {fieldName: LEAD_STATUS_FIELD.fieldApiName, notValues: ['Qualified'], nullable: false}, {fieldName: LEAD_DUE_DATE_FIELD.fieldApiName, greaterThan: ['2025-01-01']} ]
    */
  _isConditionsDefined = false;

  _paginated = false;

  settingsOptions = [];
  @api // allows table to save setting
  set listViewName(val) {
    this._listViewName = val;
    if (val) {
      this.settingsOptions = SETTINGS_OPTIONS.filter(
        (opt) => opt.value !== "Select fields to display"
      );
    }
    this._currentColConfig = this._getCurrentColConfigFromPresets(
      this._currentTableConfig
    );
    this._applySavedPageSizeConfig();
    if (this._columns?.length) {
      this.evalPresetsToColumns();
    }
  }
  get listViewName() {
    return this._listViewName;
  }

  get _effectiveColWidthConfigName() {
    return this._listViewName
      ? COLUMN_WIDTHS_ALL_JSON_FIELD.fieldApiName
      : this.colWidthConfigName;
  }
  get _effectivePageSizeConfigName() {
    return this._listViewName
      ? PAGE_SIZE_ALL_JSON_FIELD.fieldApiName
      : this.pageSizeConfigName;
  }

  _currentTableConfig;
  _currentColConfig;
  _pageSizeConfigsResult;
  _currentPageSizeConfig;

  _getCurrentColConfigFromPresets(presetsByObject) {
    if (!this._listViewName) {
      return null;
    }

    return this.objectName
      ? (presetsByObject?.[this.objectName]?.[this._listViewName] ?? null)
      : null;
  }
  _getCurrentPageSizeConfig(savedPageSizes) {
    if (!this._listViewName) {
      return null;
    }

    const val = this.objectName
      ? (savedPageSizes?.[this.objectName]?.[this._listViewName] ?? null)
      : null;
    const numVal = Number(val);

    return !isNaN(numVal) && numVal > 0 ? numVal : null;
  }
  _applyPageSizeState(newPageSize) {
    const numVal = Number(newPageSize);
    if (isNaN(numVal) || numVal <= 0) {
      return false;
    }

    this._pageSize = numVal;
    this._currentPage = 1;
    this._paginated = true;
    this._conditions = {
      ...(this._conditions || {}),
      limit: numVal,
      offset: 0
    };

    return true;
  }
  _applySavedPageSizeConfig() {
    this._currentPageSizeConfig = this._getCurrentPageSizeConfig(
      this._pageSizeConfigsResult
    );
    if (this._currentPageSizeConfig) {
      this._applyPageSizeState(this._currentPageSizeConfig);
    }
  }

  _conditons = undefined;
  @api
  set conditions(value) {
    this._conditions = value;
    if (!this._paginated) {
      this._paginated = !!value?.limit;
    }
    this._pageSize = value?.limit ?? 50;

    this._isConditionsDefined = value !== undefined;
    if (this._initDone) {
      this.initializeTableQuery();
    }
  }
  get conditions() {
    return this._conditions || undefined;
  }
  // height at which y-scroll is triggered
  isMaxHeightRendered = false;
  @api
  set maxHeight(value) {
    if (value) {
      this._maxHeight = value ? value : "70vh";
      this.template.host.style.setProperty(
        "--vg-max-height",
        `${this._maxHeight}`
      );
    }
    Promise.resolve().then(() => updateOverflowYSimple(this));
  }
  get maxHeight() {
    return this._maxHeight || "calc(70vh - 50px)"; // Default if not set
  }
  _sortedCol;
  @api // Set the initial sortedByColumn when a list view loads
  set sortedCol(val) {
    this._sortedCol = val
      ? {
          ...val,
          isAsc: val.isAsc ?? val.type?.toLowerCase() === "asc"
        }
      : val;
  }
  get sortedCol() {
    return this._sortedCol;
  }

  // Send the parent a copy of the rows when ready if true
  @api sendPicklists = false;
  @api sendRows = false;
  @api sendRowsLength = false;
  @api masterDetailField = null;
  // ===================================================================== \\

  get _userDisplayFields() {
    const effectiveColWidthConfigName = this._effectiveColWidthConfigName;
    const effectivePageSizeConfigName = this._effectivePageSizeConfigName;
    const fields = ["Id"];

    if (effectiveColWidthConfigName) {
      fields.push(effectiveColWidthConfigName);
    }
    if (
      effectivePageSizeConfigName &&
      !fields.includes(effectivePageSizeConfigName)
    ) {
      fields.push(effectivePageSizeConfigName);
    }
    if (this.sortConfigName) {
      fields.push(this.sortConfigName);
    }

    if (fields.length > 1) {
      return fields;
    }
    return undefined;
  }
  _tableConfigsResult;
  _wiredUserDisplaySettingsResult;
  @wire(fetchUserDisplaySettingsByField, {
    userId: "$_userId",
    fields: "$_userDisplayFields"
  })
  wiredUserDisplaySettings(result) {
    this._wiredUserDisplaySettingsResult = result;
    const { data, error } = result;
    if (data) {
      try {
        this._tableConfigsResult = data;
        const colWidthFieldName = this._effectiveColWidthConfigName;
        const raw = colWidthFieldName ? data?.[colWidthFieldName] : null;
        const pageSizeFieldName = this._effectivePageSizeConfigName;
        const rawPageSizes = pageSizeFieldName
          ? data?.[pageSizeFieldName]
          : null;

        this._currentTableConfig =
          typeof raw === "string" && raw ? JSON.parse(raw) : raw || null;
        this._pageSizeConfigsResult =
          typeof rawPageSizes === "string" && rawPageSizes
            ? JSON.parse(rawPageSizes)
            : rawPageSizes || null;

        this._currentColConfig = this._getCurrentColConfigFromPresets(
          this._currentTableConfig
        );
        this._applySavedPageSizeConfig();
        this.evalPresetsToColumns();
      } catch (err) {
        this.showToast(
          "Error in parsing in wiredfetchUserDisplaySettings() of sldsTableAuto.js",
          getErrorMessage(err),
          "error"
        );
      }
    } else {
      this._tableConfigsResult = null;
    }

    if (error) {
      this.showToast(
        "Error in wiredfetchUserDisplaySettings() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  evalPresetsToColumns() {
    try {
      if (!this._tableConfigsResult || !this._columns?.length) return;
      const colWidthFieldName = this._effectiveColWidthConfigName;

      this._currentColConfig = this._getCurrentColConfigFromPresets(
        this._currentTableConfig
      );

      if (this._currentColConfig) {
        this._columns = mapPresetsToColWidths(
          this._currentColConfig,
          this._columns
        );
        if (this.localColumns?.length) {
          this.localColumns = mapPresetsToColWidths(
            this._currentColConfig,
            this.localColumns
          );
        }
      } else if (
        !this._listViewName &&
        isValidProperty(colWidthFieldName, this._tableConfigsResult)
      ) {
        this._columns = mapPresetsToColWidths(
          this._tableConfigsResult,
          this._columns,
          colWidthFieldName
        );
        if (this.localColumns?.length) {
          this.localColumns = mapPresetsToColWidths(
            this._tableConfigsResult,
            this.localColumns,
            colWidthFieldName
          );
        }
      }
      //if (isValidProperty(this.sortConfigName, this._tableConfigsResult)) {
      //    //const onLoadSort = this._tableConfigsResult[this.sortConfigName];
      //    //console.log('here is onLoadSort in evalPresetsToColumns() in sldsTableAuto.js: ', JSON.stringify(onLoadSort));
      //}
    } catch (error) {
      this.showToast(
        "Error in evalPresetsToColumns() of sldsTableAuto.js",
        getErrorMessage(error),
        "error"
      );
    }
  }
  // Save the Column Widths
  @api async saveColumnWidths(inPixels = false) {
    this.isLoading = true;
    try {
      // Call the data table for the current columnn widths
      const colWidths = inPixels
        ? this.getColumnWidthsInPixels()
        : this.getColumnWidths();

      if (colWidths && colWidths.length > 1) {
        // Update the column widths before saving so user does not have to reload the page
        this._columns = mapPresetsToColWidths(colWidths, this._columns);
        this.localColumns = mapPresetsToColWidths(colWidths, this.localColumns);

        const colWidthFieldName = this._effectiveColWidthConfigName;
        let userSettings;

        if (this._listViewName) {
          const raw = this._tableConfigsResult?.[colWidthFieldName];
          const presetsByObject =
            typeof raw === "string" && raw ? JSON.parse(raw) : raw || {};

          presetsByObject[this.objectName] = {
            ...(presetsByObject[this.objectName] || {}),
            [this._listViewName]: colWidths
          };

          userSettings = {
            [colWidthFieldName]: JSON.stringify(presetsByObject)
          };

          await saveUserDisplaySettings({
            userId: this._userId,
            userSettings: userSettings
          });
          await this.clearColWidthsOnSave(
            this._listViewName,
            userSettings,
            presetsByObject
          );
        } else {
          // Store the current column widths as a JSON object in the Apex method argument
          userSettings = { [colWidthFieldName]: JSON.stringify(colWidths) };

          // Save the column widths to the User Settings
          await saveUserDisplaySettings({
            userId: this._userId,
            userSettings: userSettings
          });
        }

        // Succesful Save
        this.showToast("Columns widths successfully saved", "", "success");
      } else {
        this.showToast(
          "Error Saving Column Widths",
          "Failed to retrieve the column widths, please try again or contact an administrator",
          "error"
        );
      }
    } catch (error) {
      this.showToast(
        "Error in saveColumnWidths() of sldsTableAuto.js",
        getErrorMessage(error),
        "error"
      );
    } finally {
      this.isLoading = false;
    }
  }

  async clearColWidthsOnSave(listViewName, userSettings, presetsByObject) {
    this._tableConfigsResult = {
      ...(this._tableConfigsResult || {}),
      [this._effectiveColWidthConfigName]:
        userSettings[this._effectiveColWidthConfigName]
    };

    this._currentTableConfig = presetsByObject;
    this._currentColConfig = this.objectName
      ? (presetsByObject?.[this.objectName]?.[listViewName] ?? null)
      : null;

    const table = this.template.querySelector("table");
    if (table) {
      const ths = Array.from(table.querySelectorAll("thead th"));
      ths.forEach((th) => {
        if (th?.dataset?.isFixedWith !== "true") {
          th.style.width = "";
          th.style.minWidth = "";
          th.style.maxWidth = "";
        }
      });

      const cols = Array.from(table.querySelectorAll("colgroup col"));
      cols.forEach((col) => {
        if (col?.dataset?.isFixedWith !== "true") {
          col.style.width = "";
          col.style.minWidth = "";
          col.style.maxWidth = "";
        }
      });
    }

    this._initWidths = null;

    const prevColumns = this._columns;
    const prevLocalColumns = this.localColumns;

    this._columns = [];
    this.localColumns = [];

    await new Promise((resolve) => requestAnimationFrame(resolve));

    this._columns = prevColumns;
    this.localColumns = prevLocalColumns;
    this.evalPresetsToColumns();
  }

  @api getColumnWidthsInPixels() {
    const tableElement = this.template.querySelector("table");
    if (!tableElement) return [];

    const allThs = tableElement.querySelectorAll(
      'thead th[data-element="tableColumn"]'
    );

    const currentWidths = [];

    allThs.forEach((th, index) => {
      const widthPx = th.getBoundingClientRect().width; // true rendered width
      const fieldName = th.dataset.fieldName || `col${index + 1}`;

      currentWidths.push({
        fieldName,
        width: Math.round(widthPx) + "px"
      });
    });

    return currentWidths;
  }
  // Return the current column widths as %.  Structure: [ {fieldName: "<col.fieldName>", width: "x%"} ]
  @api getColumnWidths() {
    // Get the table element and ensure it exists
    const tableElement = this.template.querySelector("table");
    if (!tableElement) {
      return [];
    }

    // Retrieve all header cells
    const allThs = tableElement.querySelectorAll(
      'thead th[data-element="tableColumn"]'
    );
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
        width: percent.toFixed(2) + "%" // Store the percentage as a string with 2 decimal places
      });
    });

    return currentWidths;
  }

  // ======================= Parse Rows And Columns ======================= \\
  _initDone = false;
  // Trigger Scrolling if the height of the table exceedes @api maxHeight
  // ---++ Track the table's <relativeContainer> for popover positioning (x-slds-menu-popover-button)
  renderedCallback() {
    try {
      // Only run after we know columns and objectName
      if (!this._initDone) {
        if (this._columns?.length) {
          this.initializeTableQuery();
        }
      }

      // Get the table container to pass to <x-slds-menu-popover-button>  (for menu positioning)
      if (!this.relativeContainer) {
        // Get Relative container (outer div of the table) for SldsMenuButton
        const tableContainer = this.template.querySelector(
          ".slds-table_edit_container"
        );
        if (tableContainer) this.relativeContainer = tableContainer;
      }

      handleTableOverflow(this);
    } catch (error) {
      this.showToast(
        "Error in renderedCallback() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  // Initialize table
  initializeTableQuery() {
    try {
      if (this._columns && this._columns.length) {
        if (this.localColumns && this.localColumns.length) {
          this.parseRowsAndColumns();
          return;
        }
        const mainObjectName = this._columns.find(
          (c) => c?.field?.objectApiName
        )?.field?.objectApiName;

        if (!mainObjectName) return;

        this.objectName = mainObjectName; // Object API Name of Main Rows
        this._initDone = true;
        this._applySavedPageSizeConfig();

        // Defer heavy work to avoid sync re-render churn
        Promise.resolve().then(async () => {
          try {
            this.isLoading = true;
            await this._ensurePicklists(mainObjectName);
            await this.buildRowsAndColumns();
            if (this.sendPicklists) {
              this.dispatchEvent(
                new CustomEvent("sendpicklists", {
                  detail: this.fieldPicklists
                })
              );
            }
          } catch (error) {
            this.showToast(
              "Error in initializeTableQuery()/init of sldsTableAuto.js: ",
              getErrorMessage(error),
              "error"
            );
          } finally {
            this.isLoading = false;
          }
        });
      }
    } catch (error) {
      this.showToast(
        "Error in initializeTableQuery() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  // Get the picklist values for the columns
  _picklistsFor = null;
  async _ensurePicklists(objApi) {
    if (!objApi) return;
    if (this._picklistsFor === objApi) return; // already fetched for this object

    const picklistComponent = this.template.querySelector(
      "c-wired-picklist-values-lwc"
    );
    if (!picklistComponent) {
      // Child not stamped yet; allow retry on next render
      this._initDone = false;
      return;
    }

    this.fieldPicklists = await picklistComponent.getPicklistValues({
      objectApiName: objApi
    });
    this._picklistsFor = objApi;
  }
  // Query Picklist Options for the Object Api Name
  async getPicklistValues() {
    try {
      const picklistComponent = this.template.querySelector(
        "c-wired-picklist-values-lwc"
      );
      if (picklistComponent) {
        this.fieldPicklists = await picklistComponent.getPicklistValues({
          objectApiName: this.objectName
        });
      }
    } catch (error) {
      this.showToast(
        "Error in getPicklistValues() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  // Get col infos of Object ---++ Query Main Rows
  async buildRowsAndColumns() {
    try {
      const mainObjectName = this.objectName;
      if (!mainObjectName) return;

      const refObjects = this.findPopoverObjReferences(mainObjectName) || [];
      const objInfosCmp = this.template.querySelector("c-object-infos-lwc");
      if (!objInfosCmp) return;

      // 1) Object metadata
      const apiNames = [mainObjectName, ...refObjects];
      const objMetas = await objInfosCmp.queryObjects(apiNames);
      if (!objMetas || !objMetas.size) return;

      // Add label if not configured by the user
      if (!this._objectLabel) {
        this._objectLabel =
          objMetas.get(mainObjectName)?.label ??
          getCleanMetaDataLabels(mainObjectName);
      }

      this._objectInfos = objMetas;

      // 2) Enrich visible (non-dynamic) columns only; leave dynamic as virtual
      const enrichedCols = this.addMetaDataToColFields(mainObjectName);

      // 3) Build SOQL field list (immutable; do not mutate any col/field constants)
      const mainInfo = this._objectInfos.get(mainObjectName);
      const mainFieldsMap = mainInfo?.fields || {}; // map keyed by apiName

      // Flag if the object uses record types
      this.isRecordTypes = objectHasRecordTypes(mainInfo);

      // Base fields from visible, non-dynamic columns
      const baseFields = enrichedCols
        .filter((c) => !c.isDynamic)
        .map((col) => {
          if (col.isReference && col.relationshipName && col.nameReference) {
            return `${col.relationshipName}.${col.nameReference}`;
          }
          return col?.field?.fieldApiName || null;
        })
        .filter(Boolean);

      if (this.masterDetailField) {
        baseFields.push(this.masterDetailField);
      }

      // Dynamic candidates: compute a parallel, enriched list WITHOUT mutating originals
      const dynQueryFields = [];

      const firstNameFieldOf = (refToInfos) => {
        if (!Array.isArray(refToInfos) || !refToInfos.length) return "Name";
        const first = refToInfos[0];
        return Array.isArray(first?.nameFields) && first.nameFields.length
          ? first.nameFields[0]
          : "Name";
      };

      // Build a new columns array with dynFields attached immutably
      const newColumns = enrichedCols.map((col) => {
        if (!col.isDynamic) return col; // already enriched

        // Enrich each candidate into a plain object; collect fields to query
        const dynFields = (col.fields || []).map((dyn) => {
          const meta = mainFieldsMap[dyn.fieldApiName];
          if (!meta) return { ...dyn }; // no extra info available

          const isRef = meta.dataType === "Reference";
          const nameField = firstNameFieldOf(meta.referenceToInfos);
          const relName = meta.relationshipName || null;
          const dtype = TO_LOCAL_DTYPE(meta.dataType);

          // Query pieces for this candidate (raw + name if reference)
          dynQueryFields.push(dyn.fieldApiName);
          if (isRef && relName && nameField) {
            dynQueryFields.push(`${relName}.${nameField}`);
          }

          return {
            ...dyn,
            // enriched metadata for renderer/formatter
            dtype,
            isReference: isRef,
            relationshipName: relName,
            nameReference: nameField,
            label:
              dyn.label ||
              meta.label ||
              getCleanMetaDataLabels(dyn.fieldApiName)
          };
        });

        // Return a NEW column object carrying the enriched candidates
        return {
          ...col,
          dtype: col.dtype || "reference",
          isReference: true,
          dynFields // <-- use these at render time; DO NOT mutate originals
        };
      });

      // Final deduped SOQL list
      const mainFieldsQuery = Array.from(
        new Set([...baseFields, ...dynQueryFields])
      );
      this._mainFieldsQuery = mainFieldsQuery;

      // 4) Fetch records
      const wiredRecordsComponent = this.template.querySelector(
        "c-wired-records-lwc"
      );
      if (!wiredRecordsComponent) {
        return;
      }

      if (this._conditions === undefined) {
        this._rows = [];
      } else {
        const rowsObj = await wiredRecordsComponent.fetchRecords(
          mainObjectName,
          mainFieldsQuery,
          this._conditions
        );
        handleGetTableRecordsRes(this, rowsObj);
      }

      if (this.sendRows) {
        this.dispatchEvent(new CustomEvent("sendrows", { detail: this._rows }));
      }

      if (this.sendRowsLength) {
        this.dispatchEvent(
          new CustomEvent("rowslength", { detail: this._rows.length })
        );
      }

      // 5) Header config (unchanged)
      if (!this.suppressHeader) {
        const iconObj = iconByObjectApiName(mainObjectName, null, true);
        const listViewOptions = SAVED_LIST_VIEW_OPTIONS.find(
          (obj) => obj.objectApiName === this.objectName
        );
        const listViewSubTitle = this.listSubTitle
          ? this.listSubTitle
          : listViewOptions && listViewOptions.length
            ? listViewOptions[0].value
            : null;

        const mainListTitle =
          this.listTitle ??
          `${
            objMetas.get(mainObjectName)?.labelPlural ??
            getCleanMetaDataLabels(mainObjectName)
          }`;

        this.headerConfig = {
          pageLabel: mainListTitle,
          iconConfig: {
            iconType: iconObj.iconName.split(":")[0],
            iconName: iconObj.iconName.split(":")[1],
            iconClass: iconObj?.iconClass ?? ""
          },
          sortedByObj: { label: "", type: "", fieldName: "", dtype: "" },
          filteredBy: this._rows.length ? getFilteredByInfo(this) : "",
          savedListViewOptions: this.suppressListViewChange
            ? []
            : (listViewOptions?.options ?? []),
          displayOptions: DISPLAY_OPTIONS,
          settingsOptions: this.settingsOptions,
          listViewTitle: listViewSubTitle
        };
      }

      // 6) Commit columns immutably and continue pipeline
      this._columns = newColumns;
      this.parseRowsAndColumns();
    } catch (error) {
      this.showToast(
        "Error in buildRowsAndColumns() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  // Get all other Objects that are mentions in 'references' of 'popover' property
  // Returns array<string> of object API names referenced in popover.references (excluding main)
  findPopoverObjReferences(mainObjectName) {
    try {
      const subCols = this._columns.filter((col) => col?.popover?.references);
      if (!subCols.length) return [];

      const set = new Set(
        subCols
          .flatMap((col) => col.popover.references) // arrays of field refs
          .flatMap((list) => list) // flatten to field refs
          .map((f) => f?.objectApiName)
          .filter((apiNm) => !!apiNm && apiNm !== mainObjectName)
      );
      return [...set];
    } catch (error) {
      this.showToast(
        "Error in findPopoverObjReferences() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
      return [];
    }
  }
  // Filter out the field metadata such that only fields relevant to the columns are there
  // Rewrites popover.references into [{ queryObj, columns }] per reference group
  addMetaDataToColFields(mainObjName) {
    try {
      if (!this._objectInfos?.size) return this._columns;

      const mainObjMeta = this._objectInfos.get(mainObjName);
      if (!mainObjMeta) return this._columns;

      // --- Normalize field info collections ---
      const mainFieldsArr = Object.values(mainObjMeta.fields || {});
      const isValidFieldRef = (f) => !!(f && f.fieldApiName && f.objectApiName);

      // -- Builder for main-object columns (incl. dynamic passthrough) --
      const buildMainObjCol = (colObj) => {
        try {
          // Dynamic virtual column – don’t touch its fields list, just give it dtype/flags
          if (colObj?.isDynamic) {
            return {
              ...colObj,
              dtype: colObj.dtype || "reference",
              fieldName: colObj.fieldName || "Related Part", // identity for header/sort
              isReference: true
            };
          }

          const fieldName = colObj?.field?.fieldApiName;
          const isException = NON_NAV_TARGETS.has(fieldName);
          if (
            !fieldName ||
            (isException && !NOT_NAV_TARGET_HANDLERS[fieldName])
          ) {
            return null;
          }

          const fieldInfo = mainFieldsArr.find(
            (mainF) => mainF?.apiName === fieldName
          );

          if (!fieldInfo) return colObj;

          const referenceInfos = fieldInfo.referenceToInfos?.length
            ? FIND_NAME_FIELD(fieldInfo.referenceToInfos)
            : null;

          const dtype = isException
            ? NOT_NAV_TARGET_HANDLERS[fieldName].dtype
            : TO_LOCAL_DTYPE(fieldInfo?.dataType, fieldInfo);

          const isMainObjName = (mainObjMeta?.nameFields || []).some(
            (nm) => nm === fieldName
          );

          let newCol = {
            ...colObj,
            dtype,
            fieldName,
            isMainObjName,
            isReference: fieldInfo?.dataType === "Reference",
            unique: !!fieldInfo?.unique,
            label:
              colObj?.label ??
              fieldInfo?.label ??
              getCleanMetaDataLabels(fieldName),
            updateable: !!fieldInfo?.updateable,
            calculated: !!fieldInfo?.calculated,
            nameReference: referenceInfos ? referenceInfos.nameFields[0] : null,
            relatedObjectApiName: referenceInfos
              ? referenceInfos.apiName
              : null,
            relationshipName: fieldInfo?.relationshipName ?? null
          };

          if (isException && dtype === "picklist") {
            const matchedHandler = NOT_NAV_TARGET_HANDLERS[fieldName];
            const source = matchedHandler?.optionsInfo?.source;
            newCol.options =
              source === "objectInfo"
                ? matchedHandler?.optionsInfo?.handlerFn(mainObjMeta)
                : [];
            return newCol;
          }

          const isPicklist = ["picklist", "multipicklist"].includes(
            (fieldInfo?.dataType || "").toLowerCase()
          );
          if (isPicklist) {
            const options = this.fieldPicklists?.[fieldInfo.apiName];
            if (options) newCol.options = options;
          }
          return newCol;
        } catch (error) {
          this.showToast(
            "Error in buildMainObjCol() of sldsTableAuto.js: ",
            getErrorMessage(error),
            "error"
          );
          return null;
        }
      };

      // ——— Enrich core columns first (preserve your original order) ———
      const enrichedOrdered = this._columns
        .map((c) => buildMainObjCol(c))
        .filter(Boolean);

      // ——— Popover/references enrichment (same logic you had, fixed locals) ———
      const enrichedWithRefs = enrichedOrdered.map((enrichedCol) => {
        // no popover => return as-is
        let refs = enrichedCol?.popover?.references;
        if (!Array.isArray(refs) || !refs.length) return enrichedCol;

        // if parent not specified, default to the table object and prepend its Name
        if (!isValidProperty("parent", enrichedCol?.popover)) {
          const tblNameField = FIND_NAME_FIELD(mainObjMeta.nameFields);
          const nameFieldMeta = mainFieldsArr.find(
            (f) => f.apiName === tblNameField
          );
          if (nameFieldMeta) {
            const nameFieldApi = {
              fieldApiName: nameFieldMeta.apiName,
              objectApiName: this.objectName
            };
            refs = [[nameFieldApi], ...refs];
          }
        }

        const refParent = isValidProperty("parent", enrichedCol.popover)
          ? enrichedCol.popover.parent
          : this.objectName;

        let mainRefLookup;

        const parentObjMeta = this._objectInfos.get(refParent);
        const popMainArr = Object.values(parentObjMeta?.fields || {});
        const popParentsArr = popMainArr.filter(
          (f) => f.dataType === "Reference"
        );
        const popChildren = parentObjMeta?.childRelationships || [];

        const newReferences = refs.map((fieldsArr) => {
          const valid =
            Array.isArray(fieldsArr) &&
            fieldsArr.length &&
            fieldsArr.every(isValidFieldRef);
          if (!valid) return { queryObj: null, columns: [] };

          if (fieldsArr[0].objectApiName === refParent) {
            const built = BUILD_MAIN_REF_INFOS(
              mainObjName,
              fieldsArr,
              this._objectInfos,
              refParent
            );
            mainRefLookup = built.queryObj.tableReference;
            return built ?? { queryObj: null, columns: [] };
          }

          if (IS_PARENT_OBJECT(popParentsArr, fieldsArr)) {
            const built = BUILD_PARENT_OBJ_INFOS(
              popParentsArr,
              fieldsArr,
              this._objectInfos,
              refParent
            );
            return built ?? { queryObj: null, columns: [] };
          }

          if (IS_CHILD_OBJECT(popChildren, fieldsArr)) {
            const built = BUILD_CHILD_OBJ_INFOS(
              parentObjMeta,
              fieldsArr,
              this._objectInfos,
              mainRefLookup
            );
            return built ?? { queryObj: null, columns: [] };
          }

          // fields on the same (refParent) object
          return {
            queryObj: {
              fieldNames: fieldsArr.map((f) => f.fieldApiName),
              objectApiName: refParent,
              isChild: false,
              isParent: false,
              relationName: null
            },
            columns: fieldsArr
          };
        });

        return {
          ...enrichedCol,
          popover: { ...enrichedCol.popover, references: newReferences }
        };
      });

      return enrichedWithRefs;
    } catch (error) {
      this.showToast(
        "Error in addMetaDataToColFields() of sldsTableAuto.js",
        getErrorMessage(error),
        "error"
      );
      return this._columns;
    }
  }
  // Format the rows such that the row's fields are in the same order as the columns ---++ Add custom Atrributes to the <columns> & <rows>
  parseRowsAndColumns() {
    try {
      if (this._rows && this._columns) {
        this.evalPresetsToColumns();
        // Map the fields from <rows> so that that each <row.fields> is in the same order as the <column.fieldName>s
        const rowsObj = mapRowsToColumns(
          this._rows,
          this._columns,
          0,
          this.isRecordTypes
        );

        const limit = this._conditions?.limit ?? this._pageSize ?? 50;
        const page = this._currentPage ?? 1;
        const offset = (page - 1) * limit;
        const idxdRows = applyRowNumbers(rowsObj?.rows ?? [], offset);

        this.stableRows = idxdRows; // Store the original rows
        this.localRows = idxdRows; // Get <rows> from response object (keys: 'rows' & 'count')

        // Map the columns to localColumns and add a 'colId' property
        this.localColumns = this._columns.map((col) => {
          // Check for "wrapText", "clipText", "clampText" in 'textStyle' property
          const textStyle =
            isValidProperty("textStyle", col) &&
            Object.keys(CELL_TEXT_STYLES).some((val) => col.textStyle === val)
              ? col.textStyle
              : "clipText";

          let colIcon = null;
          if (col.colIcon) {
            const icon = col.colIcon;
            const iconCl = typeof icon === "object" && icon.cl ? icon.cl : "";
            const iconSize =
              typeof icon === "object" && icon.size ? icon.size : "x-small";
            const clndIcon = typeof icon === "object" ? icon.icon : icon;

            colIcon = iconPath(clndIcon, true);
            if (colIcon) {
              colIcon.container = `${colIcon.container} slds-m-right_xx-small`;
              colIcon.svg = `slds-icon slds-icon_${iconSize} ${iconCl}`;
            }
          }
          return {
            ...col,
            colId: `${col.fieldName}-col`,
            textStyle: textStyle,
            colIcon,
            notFilterable: true
          };
        });

        // Preload Record References into the rows
        this.addRefsToFields();
      }
    } catch (error) {
      this.showToast(
        "Error in parseRowsAndColumns() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    } finally {
      this.isDataLoaded = true;
    }
  }
  async addRefsToFields() {
    if (!this.localRows?.length) return;

    const mainNameField = this._columns.find(
      (col) => col?.isMainObjName
    )?.fieldName;
    const mainObjFields = (this._objectInfos?.get(this.objectName) ?? {})
      ?.fields;

    this.localRows = await Promise.all(
      this.localRows.map(async (row) => {
        const needsRefs = row?.fields?.some(
          (f) =>
            f?.fieldName === mainNameField ||
            (f?.isClickable && f?.dtype === "reference" && !f?.url)
        );

        if (!needsRefs) return row;

        const enrichedFields = (row?.fields ?? []).map((f) => {
          if (!f?.isClickable) return f;

          if (f?.fieldName === mainNameField) {
            return {
              ...f,
              objectApiName: this.objectName,
              recordId: row?.Id ?? row?.id
            };
          }

          const fieldName = f?.apiName ?? f.fieldName;
          const objectApiName =
            mainObjFields?.[fieldName]?.referenceToInfos?.[0]?.apiName ?? null;

          return objectApiName ? { ...f, objectApiName } : f;
        });

        const reffedFields = await addPageRefsFieldsArr(enrichedFields, this);
        return { ...row, fields: reffedFields };
      })
    );
    this.stableRows = this.localRows;

    if (this._sortedCol) {
      await new Promise(requestAnimationFrame);
      const isAsc =
        this._sortedCol.isAsc ?? this._sortedCol.type?.toLowerCase() === "asc";
      await this.performSort(isAsc, this._sortedCol.fieldName);
      if (this._searchTerm || this._uncommittedSearchTerm) {
        requestAnimationFrame(() => {
          if (this._searchTerm) {
            handleSearchFilter(this._searchTerm);
            if (this._uncommittedSearchTerm) {
              requestAnimationFrame(() => {
                handleEveryFilter(this._uncommittedSearchTerm);
              });
            }
          } else {
            handleEveryFilter(this._uncommittedSearchTerm);
          }
        });
      }
    }
  }
  // ====================================================================== \\

  // ========================= Public Methods ============================ \\
  // Refresh Wired Rows
  @api async handleRefresh(suppressSpinner = false) {
    try {
      if (!suppressSpinner) {
        this.isLoading = true;
      }

      // Let DOM settle before calling refresh  --->  ensure wired records child is available in the DOM
      await new Promise(requestAnimationFrame);

      if (this._paginated) {
        await this.refreshCurrentPage();
      } else if (this._isConditionsDefined || this._conditions !== undefined) {
        const wired = this.template.querySelector("c-wired-records-lwc");
        if (wired && this.objectName && this._mainFieldsQuery?.length) {
          wired.objectApiName = this.objectName;
          wired.fieldApiNames = [...this._mainFieldsQuery];
          wired.conditions = this._conditions;
          wired.searchTerm = this._searchTerm;
          wired.sortBy = this._sortBy ? JSON.stringify(this._sortBy) : null;

          const rowsObj = await wired.refreshMe();
          handleGetTableRecordsRes(this, rowsObj);
          this.parseRowsAndColumns();
        } else {
          this.initializeTableQuery();
        }
      } else {
        this.initializeTableQuery();
      }

      // Tell parent to refresh
      this.dispatchEvent(
        new CustomEvent("refresh", { detail: this.objectName })
      );

      if (this.sendRows) {
        // Send Apex query result to parent
        this.dispatchEvent(new CustomEvent("sendrows", { detail: this._rows }));
      }
      if (this.sendRowsLength) {
        this.dispatchEvent(
          new CustomEvent("rowslength", { detail: this._rows.length })
        );
      }
    } catch (error) {
      this.showToast(
        "Error in handleRefresh() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    } finally {
      this.isLoading = false;
    }
  }

  // Reset the column widths back to their original config  --->  If already have _initWidths % per column, also store px
  _initFixedPx = null;
  @api resetColumnWidths() {
    resetColumnWidths(this);
  }
  // Return the checked rows
  @api getCheckedRows(isObjectApiName = false) {
    if (isObjectApiName) {
      return {
        objectApiName: this.objectName,
        checkedRows: this.checkboxArray
      };
    }
    return this.checkboxArray;
  }
  // Return all record ids in the table
  @api getRecordIds() {
    return this._rows?.length
      ? this._rows?.map((rec) => rec?.id ?? rec?.Id)
      : [];
  }
  // Public method to check all row checkboxes
  @api checkAllRows() {
    try {
      if (this._rows?.length) {
        selectAllCheckboxes(this);
      }
    } catch (error) {
      this.showToast(
        "Error in checkAllRows() of sldsTableAuto.js",
        getErrorMessage(error),
        "error"
      );
    }
  }
  // Remove all the checked Rows
  @api async clearCheckboxes() {
    try {
      if (this._rows?.length) {
        clearCheckboxes(this);
      }
    } catch (error) {
      this.showToast(
        "Error in clearCheckboxes() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  // Send record by Id
  @api getRecordById(recordId) {
    try {
      return this._rows.find((r) => r?.id === recordId || r?.Id === recordId);
    } catch (error) {
      this.showToast(
        "Error in sendRecInfo() of sldsTableAuto.js",
        getErrorMessage(error),
        "error"
      );
      return null;
    }
  }
  // ====================================================================== \\

  // Add event listeners
  _prevOverflowY = null;
  _onWinResize = null;
  _onKeyDown;
  _onKeyUp;
  connectedCallback() {
    // ================== Trigger Overflow-y Listeners  ================== \\
    // debounce window resize a bit
    let t;
    this._onWinResize = () => {
      clearTimeout(t);
      t = setTimeout(() => updateOverflowYSimple(this), 50);
    };
    window.addEventListener("resize", this._onWinResize);
    // ==================================================================== \\

    // ================= Mutli-checkbox "Shift" Listeners ================= \\
    this._onKeyDown = (e) => {
      if (e.key === "Shift" && !this._shiftHeld) {
        this._shiftHeld = true;
        this.template
          .querySelector('[data-element="tableRoot"]')
          ?.classList.add("no-select");
      }
    };
    this._onKeyUp = (e) => {
      if (e.key === "Shift" && this._shiftHeld) {
        this._shiftHeld = false;
        this.template
          .querySelector('[data-element="tableRoot"]')
          ?.classList.remove("no-select");
      }
    };
    window.addEventListener("keydown", this._onKeyDown, true);
    window.addEventListener("keyup", this._onKeyUp, true);
    // ==================================================================== \\
  }
  // Remove event listener
  disconnectedCallback() {
    if (this._onWinResize) {
      window.removeEventListener("resize", this._onWinResize);
      this._onWinResize = null;
    }
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);
    window.removeEventListener("mousedown", this._outsideClickHandler, true);
  }

  // Trigger overflow-y/maxHeight recalibration
  resetMaxHeight() {
    this.isMaxHeightRendered = false; // Trigger maxHeight recalibration
    this.isNewPage = true; // Trigger overflow-y recalibration
  }

  get totalPagesLabel() {
    return `Page ${this._currentPage} of ${this._totalPages && String(this._totalPages) !== 0 ? this._totalPages : 1}`;
  }
  get pageInputDisabled() {
    return this._totalPages <= 1;
  }
    get _editContainerCl() {
        return this._paginated
            ? 'slds-table_edit_container has-footer slds-is-relative'
            : 'slds-table_edit_container slds-is-relative';
    }
  _totalPages = 1;
  _rowsCount = 0;
  _isLastPage = true;
  _currentPage = 1;
  _pageSize = 50;
  _totalRows = 0;
  get _nextPageCl() {
    return this._isLastPage
      ? "slds-button slds-button_icon slds-button_icon-current-color slds-is-disabled"
      : "slds-button slds-button_icon slds-button_icon-current-color";
  }
  get _previousPageCl() {
    return this._currentPage === 1
      ? "slds-button slds-button_icon slds-button_icon-current-color slds-is-disabled"
      : "slds-button slds-button_icon slds-button_icon-current-color";
  }
  // ======================= Paginate Rows ======================== \\
  async refreshCurrentPage() {
    const wired = this.template.querySelector("c-wired-records-lwc");
    if (!wired) return;

    // The child wire already holds the active page's limit, offset, search, and sort parameters.
    const rowsObj = await wired.refreshMe();

    handleGetTableRecordsRes(this, rowsObj);
    this.parseRowsAndColumns();
  }
  async loadPage(pageNumber) {
    try {
      this.isLoading = true;

      const wired = this.template.querySelector("c-wired-records-lwc");
      if (!wired) return;

      const limit = this._conditions?.limit ?? this._pageSize ?? 50;
      const page = pageNumber ?? 1;
      const offset = (page - 1) * limit;

      const conditions = {
        ...this._conditions,
        limit,
        offset
      };

      const rowsObj = await wired.fetchRecords(
        this.objectName,
        this._mainFieldsQuery,
        conditions,
        false,
        this._searchTerm,
        this._sortBy
      );

      handleGetTableRecordsRes(this, rowsObj);
      this._currentPage = page;
      this.parseRowsAndColumns();
    } catch (error) {
      this.showToast(
        "Error in loadPage() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    } finally {
      this.isLoading = false;
    }
  }
  async handleNextPage() {
    await this.loadPage(this._currentPage + 1);
  }
  async handlePreviousPage() {
    if (this._currentPage <= 1) {
      return;
    }
    await this.loadPage(this._currentPage - 1);
  }
  async handlePageInput(message) {
    const val = message.detail;
    if (val && val !== this._currentPage) {
      await this.loadPage(val);
    }
  }
  get pageOptions() {
    const max = this._totalPages ?? 1;
    const options = [];
    for (let i = 1; i <= max; i++) {
      options.push({ label: `Page ${i}`, value: i });
    }
    return options;
  }
  // ============================================================== \\

  // ========================= Load Rows ========================== \\
  // Load all rows when LIMIT specified in Conditions
  async loadAll(event) {
    try {
      event.preventDefault();
      this._originalLimit = this._conditions?.limit;

      if (this._conditions?.limit) {
        this._conditions = { ...this._conditions, limit: null };
      }
      this._isRowsLimit = false;

      await this.refreshRowsWithCurrentConditions();
    } catch (error) {
      this.showToast(
        "Error in loadAll() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  // Fetch the rows without LIMIT
  async refreshRowsWithCurrentConditions() {
    try {
      this.isLoading = true;
      const wired = this.template.querySelector("c-wired-records-lwc");
      if (!wired) return;

      // Reuse same fields you computed in buildRowsAndColumns.
      // If needed, stash them in this._mainFieldsQuery when you first build them.
      const rowsObj = await wired.fetchRecords(
        this.objectName,
        this._mainFieldsQuery,
        this._conditions
      );

      handleGetTableRecordsRes(this, rowsObj);

      this.parseRowsAndColumns();

      // sendrows / rowslength events if you still want them
      if (this.sendRows) {
        this.dispatchEvent(new CustomEvent("sendrows", { detail: this._rows }));
      }
      if (this.sendRowsLength) {
        this.dispatchEvent(
          new CustomEvent("rowslength", { detail: this._rows.length })
        );
      }
    } catch (error) {
      this.showToast(
        "Error in refreshRowsWithCurrentConditions() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    } finally {
      this.isLoading = false;
    }
  }
  // Hide rows after "Show All" is called
  async limitRows(event) {
    try {
      event.preventDefault();

      if (this._conditions && this._originalLimit) {
        this._conditions = {
          ...this._conditions,
          limit: this._originalLimit
        };
      }
      this._isRowsLimit = true;
      await this.handleRefresh();
    } catch (error) {
      this.showToast(
        "Error in limitRows() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  // ============================================================== \\

  // Create New Record of the objectName
  async handleNewRecord() {
    try {
      const result = await newRecordLayoutModal.open({
        size: "small",
        description: "Accessible description of modal's purpose",
        objectApiName: this.objectName,
        objectLabel: this._objectLabel
      });

      if (result?.result === "success") {
        this.isLoading = true;
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
        await this.handleRefresh(true);
      }
    } catch (error) {
      this.showToast(
        "Error in handleNewRecord() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    } finally {
      this.isLoading = false;
    }
  }

  // Navigate to record on cell click
  handleCellLinkClick(event) {
    try {
      event.preventDefault();

      const closestA = event.target.closest("a");

      // Check if the field is the Main Object's 'Name' field
      const fieldName = closestA?.dataset?.cellFieldName;
      const isMainObjName = fieldName
        ? this.localColumns.find((col) => col.fieldName === fieldName)
            ?.isMainObjName
        : false;

      const recordId = isMainObjName
        ? closestA.dataset.recordId
        : closestA.getAttribute("value");

      if (recordId) {
        this[NavigationMixin.GenerateUrl]({
          type: "standard__recordPage",
          attributes: {
            recordId: recordId,
            actionName: "view"
          }
        }).then((url) => {
          try {
            window.open(url, "_blank");
          } catch (error) {
            this.showToast(
              "Error in handleRecordClickPromise() of sldsTableAuto.js: ",
              error
            );
          }
        });
      }
    } catch (error) {
      this.showToast(
        "Error in handleCellLinkClick() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }

  // Table-level click delegation
  handleTableClick(event) {
    try {
      const target = event.target;

      const checkbox = target
        ?.closest(".slds-checkbox")
        ?.querySelector('[data-element="rowCheckbox"]');

      // Not a row checkbox → ignore
      if (!checkbox || checkbox.dataset.element !== "rowCheckbox") {
        this._lastChecked = null;
        return;
      }

      // Native checkbox clicks and Space keypresses already update checked.
      // Use that post-toggle state here so delegated row selection does not flip it back.
      if (target !== checkbox) return;

      // This is the element that replaces event.currentTarget
      const recordId = checkbox.value;
      const shouldCheck = checkbox.checked; // post-click state
      const isShift = event.shiftKey === true; // shift state at click

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
          rowEl.classList.toggle("slds-is-selected", shouldCheck);
        }

        if (shouldCheck) {
          selected.add(recordId);
        } else {
          selected.delete(recordId);
        }
      }

      // ---- SHIFT RANGE (anchor = this._lastChecked) ----
      if (isShift && this._lastChecked) {
        const lastIdx = checkboxes.findIndex(
          (cb) => cb.value === this._lastChecked
        );
        const currIdx = checkboxes.findIndex((cb) => cb.value === recordId);

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
              rowEl.classList.toggle("slds-is-selected", shouldCheck);
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

      // ---- keep your existing select-all logic ----
      evalSelectAllAfterCheck(this);
      // ---- Focus the *last clicked* checkbox (keeps focus at the end) ----
      requestAnimationFrame(() => {
        // In delegated handler, "checkbox" is our clicked element
        checkbox?.focus({ preventScroll: true });
      });
    } catch (error) {
      this.showToast(
        "Error in handleTableClick() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
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
      const [fieldName, recordId] = btn.value.split("-");

      // Create a draft entry with the new value
      const newDraft = {
        id: recordId,
        fieldName: fieldName,
        displayValue: `${isPressed}`,
        value: isPressed
      };

      // Check if record is current in drafts
      const matchedDraft = this.draftOriginalValues?.find(
        (rec) => rec?.id === recordId
      );

      // Check if value was edited back to its original value
      const isNotEdited =
        (matchedDraft &&
          !!matchedDraft?.[fieldName] &&
          ((!matchedDraft[fieldName]?.value && isPressed) ||
            matchedDraft[fieldName]?.value === isPressed)) ||
        false;

      // Cell that contains the button
      const cell = this.template.querySelector(`td[data-id="${btn.value}"]`);

      if (isNotEdited) {
        // Remove the field from Draft Values
        this.draftValues = this.draftValues
          .map((draft) => {
            if (draft.id === recordId) {
              // Clear the Value from Drafts
              delete draft[fieldName];
              // Remove the entire draft if the value is the same as the original
              return Object.keys(draft).length > 1 ? draft : null;
            }
            return draft;
          })
          .filter(Boolean);
      } else {
        this.updateDraftValueOnEdit(newDraft); // Store the current value in Drafts
      }

      // Store the original value
      if (!matchedDraft)
        this.storeOriginalDraftValue(
          recordId,
          fieldName,
          !isPressed,
          `${!isPressed}`
        );

      // Update the field's value/label of the record that was edited
      this.assignPopOverValueToField(newDraft);

      if (!this.isPopover && this.checkboxArray.length) {
        this.popoverEditCopy = newDraft;
        this.renderApplyEditsModal();
      }

      if (cell) {
        // Toggle 'slds-is-edited' class on the cell
        cell.classList.toggle("slds-is-edited");
        cell.classList.toggle("slds-no-row-hover");
      }
    } catch (error) {
      this.showToast(
        "Error in handleBooleanCellClick() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  // Edit/RecordPreviewPanel popover positioner
  positionPopoverToCellFixed() {
    const pop = this.template.querySelector('[data-id="recordsPreview"]');
    const cell = this._anchorEl;
    if (!pop || !cell) return;

    // make measurable
    const wasHidden = pop.classList.contains("slds-hide");
    pop.style.visibility = "hidden";
    pop.classList.remove("slds-hide");

    // measure cell in viewport coords
    const r = cell.getBoundingClientRect();
    const gutter = 8;

    // measure pop (fallback width if newly shown)
    const popW = pop.offsetWidth || 420;
    const popH = pop.offsetHeight || 360;

    // prefer right-of-cell, flip to left if overflow
    const preferRight = r.right + gutter + popW <= window.innerWidth;
    let left = preferRight
      ? r.right + gutter
      : Math.max(gutter, r.left - popW - gutter);
    let top = r.top + cell.offsetHeight / 2 - (24 + 11); // align to cell top

    // clamp vertically inside viewport
    if (top + popH > window.innerHeight - gutter)
      top = window.innerHeight - gutter - popH;
    if (top < gutter) top = gutter;

    // write styles (SF writes inline left/top)
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
    pop.style.visibility = "visible";

    // set nubbin (your child panel reads this)
    this.nubbin = preferRight ? "left-top" : "right-top";

    // if it was hidden before and you intend to keep it hidden (not our case), re-hide it
    if (wasHidden) {
      /* no-op; we just opened it */
    }
  }

  // ================== Record Preview Popover Handlers =================== \\
  // Bind record preview popover Anchor Position Listeners
  bindRepositionListeners() {
    if (this._onReposition) return;

    this._onReposition = () => {
      // rAF to avoid jank during fast scroll
      window.requestAnimationFrame(() => this.positionPopoverToCellFixed());
    };

    window.addEventListener("resize", this._onReposition, { passive: true });
    window.addEventListener("scroll", this._onReposition, {
      passive: true,
      capture: true
    });

    // Also watch nearest known scrollers inside the component (optional but helpful)
    const scrollers = this.template.querySelectorAll(".custom-table-container");

    scrollers?.forEach((el) =>
      el?.addEventListener("scroll", this._onReposition, { passive: true })
    );
    this._scrollers = scrollers;
  }

  // Unbind record preview popover Anchor Position Listeners
  unbindRepositionListeners() {
    if (!this._onReposition) return;
    window.removeEventListener("resize", this._onReposition);
    window.removeEventListener("scroll", this._onReposition, { capture: true });
    this._scrollers?.forEach((el) =>
      el.removeEventListener("scroll", this._onReposition)
    );
    this._scrollers = null;
    this._onReposition = null;
  }

  // Build popover of related records when "preview" icon is clicked
  async handlePreviewClick(event) {
    try {
      // Get recordId/fieldName of Clicked Cell
      const recordId = event?.currentTarget?.dataset?.recordId;
      const fieldName = event?.currentTarget?.dataset?.fieldName;
      const fieldValue = event?.currentTarget?.dataset?.value;

      // Build the query to get records related to the
      const panelQuery = BUILD_PREVIEW_QUERY(
        this.localColumns,
        recordId,
        fieldName,
        fieldValue,
        this.objectName
      );

      if (panelQuery?.error) {
        this.showToast(
          "Error in BUILD_PREVIEW_QUERY() of sldsTableAuto.js",
          getErrorMessage(panelQuery?.error),
          "error"
        );
        return;
      }
      this.panelQuery = panelQuery;

      this.panelColumns = this.localColumns
        .find((col) => col.fieldName === fieldName)
        ?.popover?.references?.map((refObj) => {
          return {
            columns: refObj.columns,
            isHeaderSection: isValidProperty("isHeaderSection", refObj),
            isParent: refObj.isParent
          };
        });

      const cell = event.currentTarget.closest("td, th");
      this._anchorEl = cell;
      this._previewTrigger = event.currentTarget;
      this._isSide = true; // or false – whatever you use
      const viewPanel = this.template.querySelector(
        '[data-id="recordsPreview"]'
      );
      viewPanel?.classList?.replace("slds-hide", "slds-show");
      // initial placement
      this.positionPopoverToCellFixed();

      // follow scroll/resize like SF
      this.bindRepositionListeners();
    } catch (error) {
      this.showToast(
        "Error in handlePreviewClick() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  handlePreviewTriggerKeydown(event) {
    try {
      if (event.key !== "Tab" || event.shiftKey) return;

      const viewPanel = this.template.querySelector(
        '[data-id="recordsPreview"]'
      );
      if (!viewPanel || viewPanel.classList.contains("slds-hide")) return;
      if (this._previewTrigger && event.currentTarget !== this._previewTrigger)
        return;

      const recordViewPanel = viewPanel.querySelector(
        "c-slds-record-view-panel"
      );
      if (
        !recordViewPanel ||
        typeof recordViewPanel.focusFirstTabbable !== "function"
      )
        return;

      event.preventDefault();
      recordViewPanel.focusFirstTabbable();
    } catch (error) {
      this.showToast(
        "Error in handlePreviewTriggerKeydown() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  handlePreviewPanelTabout(event) {
    try {
      event.stopPropagation();

      if (event.detail?.direction === "backward") {
        this.focusPreviewTrigger();
        requestAnimationFrame(() => {
          this.closeRecordViewPanel();
        });
        return;
      }

      this.focusNextAfterPreviewTrigger();
      requestAnimationFrame(() => {
        this.closeRecordViewPanel();
      });
    } catch (error) {
      this.showToast(
        "Error in handlePreviewPanelTabout() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  focusPreviewTrigger() {
    if (
      this._previewTrigger &&
      typeof this._previewTrigger.focus === "function"
    ) {
      this._previewTrigger.focus();
      return true;
    }

    return false;
  }
  focusNextAfterPreviewTrigger() {
    if (!this._previewTrigger) return false;

    const focusableElements = this.getTableTabbableElements();
    const triggerIdx = focusableElements.indexOf(this._previewTrigger);
    const nextElement =
      triggerIdx > -1 ? focusableElements[triggerIdx + 1] : null;

    if (nextElement && typeof nextElement.focus === "function") {
      nextElement.focus();
      return true;
    }

    return false;
  }
  getTableTabbableElements() {
    const selector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex="0"]:not([disabled])'
    ].join(",");

    return Array.from(this.template.querySelectorAll(selector)).filter((el) =>
      this.isTableTabbableElement(el)
    );
  }
  isTableTabbableElement(el) {
    if (!el) return false;
    if (el.closest('[data-id="recordsPreview"]')) return false;
    if (el.closest(".slds-hide")) return false;
    if (el.getAttribute("aria-hidden") === "true") return false;
    if (el.tabIndex < 0) return false;

    const rects = el.getClientRects?.();
    return !rects || rects.length > 0;
  }
  // Hide the Record  Preview Popover
  closeRecordViewPanel() {
    const viewPanel = this.template.querySelector('[data-id="recordsPreview"]');
    this._anchorEl = null;
    this._previewTrigger = null;
    this.panelQuery = [];

    this.panelColumns = [];
    this.unbindRepositionListeners();

    if (viewPanel) {
      viewPanel.classList.replace("slds-show", "slds-hide");
    }
  }
  // ====================================================================== \\

  // +++ Helper +++  --> Cell Popover positioning helper
  positionPopoverToCell(referenceEle, popoverSelector, isSide = false) {
    try {
      const cell = referenceEle.closest("td, th");
      if (!cell) return;

      const pop = this.template.querySelector(popoverSelector);
      if (!pop || !this.relativeContainer) return;

      // make measurable
      pop.classList.remove("slds-hide");
      pop.classList.add("slds-show");
      pop.style.visibility = "hidden";
      pop.style.left = "0px";
      pop.style.top = "0px";
      //pop.offsetWidth = pop?.offsetWidth ?? null; // force reflow

      const cRect = this.relativeContainer.getBoundingClientRect();
      const r = cell.getBoundingClientRect();
      const gutter = 8;

      // container-relative coordinates
      const cellLeft = r.left - cRect.left + this.relativeContainer.scrollLeft;
      const cellRight =
        r.right - cRect.left + this.relativeContainer.scrollLeft;
      const cellTop = r.top - cRect.top + this.relativeContainer.scrollTop;
      const cellBottom =
        r.bottom - cRect.top + this.relativeContainer.scrollTop;

      const popW = pop.offsetWidth ?? 0;
      const popH = pop.offsetHeight;

      // Flag whether popover is to left of cell ---> when isSide is true
      let left, top;

      if (isSide) {
        // --- Side positioning ---
        top = cellTop - 24; // align to top of the cell
        // prefer right side
        if (
          cellRight + popW + gutter <=
          this.relativeContainer.scrollLeft + this.relativeContainer.clientWidth
        ) {
          left = cellRight + gutter; // to the right of cell
          this.nubbin = "left-top";
        } else {
          left = cellLeft - popW - gutter; // fallback left of cell
          this.nubbin = "right-top";
        }
      } else {
        // --- Your existing "overlay-ish" logic ---
        left = cellLeft;
        if (
          cellRight + popW >
          this.relativeContainer.scrollLeft +
            this.relativeContainer.clientWidth -
            gutter
        ) {
          left = cellRight - popW;
        }
        left = Math.max(
          this.relativeContainer.scrollLeft + gutter,
          Math.min(
            left,
            this.relativeContainer.scrollLeft +
              this.relativeContainer.clientWidth -
              gutter -
              popW
          )
        );

        top = cellTop;
        if (
          cellBottom + popH >
          this.relativeContainer.scrollTop +
            this.relativeContainer.clientHeight -
            gutter
        ) {
          top = cellBottom - popH;
        }
        top = Math.max(
          this.relativeContainer.scrollTop + gutter,
          Math.min(
            top,
            this.relativeContainer.scrollTop +
              this.relativeContainer.clientHeight -
              gutter -
              popH
          )
        );
      }

      pop.style.left = `${left}px`;
      pop.style.top = `${top}px`;
      pop.style.visibility = "visible";
    } catch (error) {
      this.showToast(
        "Error in positionPopoverToCell() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }

  // ~*~*~*~~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~ \\
  // ~*~*~*~~*~*~*~*~*~*~*~*~*~* Popover Edit / Draft Values ~*~*~*~*~*~*~*~*~*~*~~*~*~*~ \\
  // ~*~*~*~~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~ \\

  // ====================== Initialize Edit Popover ======================= \\
  // Display edit popover when cell is clicked
  handleEditClick(event) {
    try {
      const btn = event.currentTarget;
      const fieldId = btn.dataset.fieldId;
      const recordTypeId = btn?.dataset?.recordTypeId;

      if (!fieldId) return;

      // Find the record in <localRows> to get record info (id, etc.)
      this.fieldIdToPopoverEdit(fieldId, recordTypeId);

      // Position the popover next to the cell
      this.positionPopoverToCell(btn, ".slds-popover_edit");

      if (this._isMultiEditPopover) {
        if (!this._outsideClickHandler)
          this._outsideClickHandler = this.handleOutsideClick.bind(this);
        // capture phase so we see the click before LWC stops propagation
        window.addEventListener("mousedown", this._outsideClickHandler, true);
      }

      // focus your input (your existing logic)
      setTimeout(() => {
        switch (true) {
          case this.popoverEdit.dtype === "picklist": {
            const childCmp = this.template.querySelector("c-dropdown-plain");
            if (childCmp && typeof childCmp.focusMe === "function") {
              childCmp.focusMe();
            }
            break;
          }
          case this.popoverEdit.dtype === "multipicklist":
            this.template
              .querySelector("c-custom-slds-combobox-multi-select-practice")
              ?.focusMe();
            break;
          case this.popoverEdit.dtype === "reference":
            break;
          default: {
            const childCmp = this.template.querySelector("c-slds-input");
            if (childCmp && typeof childCmp.focusMe === "function") {
              childCmp.focusMe();
            }
            break;
          }
        }
      });
    } catch (error) {
      this.showToast(
        "Error in handleEditClick() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }

  // Find the record whose field was edit-clicked
  fieldIdToPopoverEdit(fieldId, recordTypeId = null) {
    try {
      // Split the dataset.fieldId from the button to get the recordId/fieldName
      const fieldName = fieldId.split("-")[0];
      const recordId = fieldId.split("-")[1];

      // Find the record in the <rows> array
      const record = this.localRows.find((rec) => rec.id === recordId);

      if (record) {
        // Trigger multi-edit popover by finding recordId in checkbox Array
        this._isMultiEditPopover =
          this.checkboxArray?.length &&
          this.checkboxArray?.some((id) => id === recordId);

        // Find the field in the <record.fields> array
        const fieldEntry = record.fields.find((f) => f.fieldName === fieldName);
        const colEntry = this.columns.find(
          (col) => col.fieldName === fieldEntry.fieldName
        );

        const boolProp = `is${fieldEntry.dtype ?? "text"}`;
        //console.log('here is fieldEntry.dtype in fieldIdToPopoverEdit() of sldsTableAuto.js: ', fieldEntry.dtype);
        //console.log('here is colEntry.dtype in fieldIdToPopoverEdit() of sldsTableAuto.js: ', colEntry.dtype);
        // use the record.field properties to initiate the <popoverEdit> Object
        this.popoverEdit = {
          id: recordId,
          fieldName: fieldEntry.fieldName,
          label: colEntry.label,
          relatedObjectApiName:
            fieldEntry?.objectApiName ?? colEntry?.relatedObjectApiName ?? null,
          objectApiName: this.objectName ?? null,
          nameReference: colEntry?.nameReference ?? null,
          value: fieldEntry.value,
          displayValue: fieldEntry.displayValue,
          dtype: fieldEntry.dtype ?? colEntry.dtype ?? "text",
          fieldId: fieldId,
          [boolProp]: true,
          recordTypeId
        };

        this.popoverEditCopy = {
          id: recordId,
          fieldName: fieldEntry.fieldName
        };
        if (
          fieldEntry.dtype === "picklist" ||
          fieldEntry.dtype === "multipicklist"
        ) {
          this.picklistOptions = this.localColumns.find(
            (col) => col.fieldName === fieldEntry.fieldName
          ).options;
        }
      }
    } catch (error) {
      this.showToast(
        "Error in fieldIdToPopoverEdit() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  // Close Edit Popover when in Multi-Edit Mode on outside click
  handleOutsideClick(event) {
    try {
      const popover = this.template.querySelector('[data-id="popoverEdit"]');
      if (!popover) return;

      const clientX = event.clientX;
      const clientY = event.clientY;
      const popRect = popover.getBoundingClientRect();

      // Check if user clicked inside the popover
      const clickInside =
        clientX >= popRect.left &&
        clientX <= popRect.right &&
        clientY >= popRect.top &&
        clientY <= popRect.bottom;

      if (clickInside) return; // 🚫 Abort if click inside

      // Defer to let focus move first
      setTimeout(() => {
        // Get the active element
        const activeElement = this.template.activeElement;
        if (activeElement?.dataset?.isPopoverEdit === "true") {
          return; // 🚫 Abort if active element is part of popover edit
        }

        // clicked outside popover + focus not in edit ➡️ close
        this.removeEditPopover(true);
        window.removeEventListener(
          "mousedown",
          this._outsideClickHandler,
          true
        );
      }, 0);
    } catch (error) {
      this.showToast(
        "Error in handleOutsideClick() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }

  handlePopoverEditKeydown(event) {
    if (!this._isMultiEditPopover) return;
    if (event && event.key === "Escape") {
      event.preventDefault();
      this.removeEditPopover(true);
    }
  }
  // ====================================================================== \\

  // ==================== Apply Edit To All Rows Modal ==================== \\
  // Render the modal with the correct messaging
  renderApplyEditsModal() {
    this.modalConfig = {
      tableModalMessage: `Apply edit to the ${this.checkboxArray.length} selected rows?`,
      modalCancelLabel: "Cancel",
      modalOkayLabel: "Okay",
      tableModalHandler: this.applyAllEdits.bind(this)
    };
    setTimeout(() => {
      const modalEle = this.template.querySelector('[data-id="checkboxModal"]');
      if (modalEle) {
        modalEle.showMe();
      }
    });
  }
  // Accept the response from the child modal component  --->  apply the changes to all the rows if confirmed
  applyAllEdits(message) {
    try {
      const result = message?.detail;

      // Cancel path
      if (result === "cancel") {
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
      const dtype = this._columns?.find(
        (col) => col.fieldName === fieldName
      )?.dtype;

      // Pre-coerce the value once
      const coercedValue = coerceByDtype(popoverCopy.value, dtype);

      // Apply to all checked records except the trigger record
      for (const recId of this.checkboxArray || []) {
        if (!recId || recId === triggerId) continue;

        // Find the record in localRows
        let origRec =
          this.localRows?.find((r) => r?.id === recId) ??
          this.stableRows?.find((r) => r?.id === recId);

        if (!origRec || !Array.isArray(origRec.fields)) {
          // Nothing to edit for this row
          continue;
        }

        // Find field within the record
        const origField = origRec.fields.find(
          (f) => f?.fieldName === fieldName
        );
        if (!origField) {
          // Row doesn't have that field
          continue;
        }

        // Use value if present; otherwise fall back to displayValue
        // (your logged origField objects sometimes omit `value`)
        const originalValue = Object.prototype.hasOwnProperty.call(
          origField,
          "value"
        )
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
        this.storeOriginalDraftValue(
          original.id,
          original.fieldName,
          original.value,
          original.displayValue
        );

        // Update drafts + UI
        this.updateDraftValueOnEdit(newDraft);
        this.assignPopOverValueToField(newDraft);

        // Safely compare original vs new to decide edited styling
        const origDraftRec = this.draftOriginalValues?.find(
          (d) => d?.id === recId
        );
        const origEntry = origDraftRec?.[fieldName];

        const isReverted =
          origEntry &&
          (origEntry.value === newDraft.value ||
            (!origEntry.value && !newDraft.value));

        if (isReverted) {
          this.removeIsEdited(fieldId);
        } else {
          this.focusCellOnEdit(fieldId, true, false);
        }
      }

      // Now handle the trigger record's "edited" styling
      const triggerOrigDraftRec = this.draftOriginalValues?.find(
        (d) => d?.id === triggerId
      );
      const triggerEntry = triggerOrigDraftRec?.[fieldName];

      const triggerIsReverted =
        triggerEntry && triggerEntry.value === popoverCopy.value;

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
    } catch (error) {
      this.isLoading = false;
      this.showToast(
        "Error in applyAllEdits() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  // ====================================================================== \\

  // ---------------------------
  // Helpers (add near the class methods)
  // ---------------------------
  extractInputPayload(detail) {
    const isObj =
      detail !== null && typeof detail === "object" && !Array.isArray(detail);

    // If child sends { someKey: someVal } OR { value: x, displayVal: y } etc.
    let value = detail;
    let displayValue = null;

    if (isObj) {
      // Prefer explicit conventions first
      if (Object.prototype.hasOwnProperty.call(detail, "value")) {
        value = detail.value;
      } else if (Object.prototype.hasOwnProperty.call(detail, "val")) {
        value = detail.val;
      } else {
        // Fall back to "first key"
        const keys = Object.keys(detail);
        value = keys.length ? detail[keys[0]] : undefined;
      }

      // Prefer explicit display
      if (Object.prototype.hasOwnProperty.call(detail, "displayVal")) {
        displayValue = detail.displayVal;
      } else if (Object.prototype.hasOwnProperty.call(detail, "displayValue")) {
        displayValue = detail.displayValue;
      }
    }

    return { value, displayValue };
  }

  markEditedIfNeeded(nextValue) {
    const valNullOtherValZero = (val1, val2) => {
      return (
        (val1 === 0 && (val2 === undefined || val2 === null || val2 === "")) ||
        (val2 === 0 && (val1 === undefined || val1 === null || val1 === ""))
      );
    };
    // Store original value once, the first time the cell changes
    if (!this.popoverEdit || this.popoverEdit.isEdited) return;

    // Important: compare against the *current* popover value, not displayValue
    if (
      this.popoverEdit.value === nextValue ||
      (!this.popoverEdit.value &&
        !nextValue &&
        !valNullOtherValZero(this.popoverEdit.value, nextValue))
    )
      return;

    this.popoverEdit.isEdited = true;
    this.storeOriginalDraftValue(
      this.popoverEdit.id,
      this.popoverEdit.fieldName,
      this.popoverEdit.value,
      this.popoverEdit.displayValue
    );
  }

  setPopoverValue(value, displayValue) {
    // Keep both popover objects in sync in one place
    this.popoverEdit.value = value;
    this.popoverEdit.displayValue = displayValue;

    // If popoverEditCopy exists, mirror it too
    if (this.popoverEditCopy) {
      this.popoverEditCopy.value = value;
      this.popoverEditCopy.displayValue = displayValue;
    }
  }

  cleanupOutsideClick() {
    if (this._outsideClickHandler) {
      window.removeEventListener("mousedown", this._outsideClickHandler, true);
    }
  }

  // ---------------------------
  // Refactored main handler
  // ---------------------------
  handleRecordTypeKeyDown(event) {
    if (event.key === "Escape" || event.key === "Tab") {
      if (event.key === "Escape") {
        event.preventDefault();
      }
    }
  }
  handleInputMessage(event) {
    try {
      if (!this.isPopover) return;

      const dataId = event?.currentTarget?.dataset?.id;
      const { value: rawVal, displayValue: rawDisplay } =
        this.extractInputPayload(event?.detail);
      // If child emitted nothing meaningful, do nothing
      if (rawVal === undefined) return;

      // Mark edited (store original) once
      this.markEditedIfNeeded(rawVal);

      const fieldName = this.popoverEdit?.fieldName;
      const dtype = this.popoverEdit?.dtype || "text";

      // Compute final { value, displayValue } once
      let nextValue;
      let nextDisplay;

      // 1) Multi-picklist editor
      if (dataId === "multiPicklistEdit" && Array.isArray(rawVal)) {
        const { displayVal, value } = formatMultiPicklistVal(
          rawVal.map((o) => o?.value)
        );
        nextValue = value;
        nextDisplay = displayVal;

        // 2) Record picker emits a separate display label
      } else if (dataId === "recordPicker") {
        nextValue = rawVal;
        nextDisplay = rawDisplay ?? null;

        // 3) Special non-nav targets (record type, etc.)
      } else if (fieldName && NON_NAV_TARGETS.has(fieldName)) {
        // Your existing logic only runs if any handler starts with recordtype
        const hasRecordTypeHandler = Array.from(NOT_NAV_TARGET_HANDLERS).some(
          (h) => String(h).toLowerCase().startsWith("recordtype")
        );

        if (hasRecordTypeHandler) {
          const matchedOption = this.localColumns
            ?.find((col) => col.fieldName === fieldName)
            ?.options?.find((opt) => opt.value === rawVal);

          nextValue = rawVal;
          nextDisplay = matchedOption?.displayValue ?? `${rawVal ?? ""}`;
        } else {
          // default fallback if no handler actually applies
          nextValue = rawVal;
          nextDisplay = rawDisplay ?? `${rawVal ?? ""}`;
        }

        // 4) Default: coerce by dtype
      } else {
        nextValue = coerceByDtype(rawVal, dtype);
        nextDisplay = rawDisplay ?? `${rawVal ?? ""}`;
      }

      // Apply to popover state
      this.setPopoverValue(nextValue, nextDisplay);

      // Cleanup outside click listener regardless
      this.cleanupOutsideClick();

      // If popover got closed elsewhere and apply wasn't clicked, stop
      if (!this.isPopover && !this.isApplyClicked) return;

      // Finalize draft + UI + close popover
      this.finishLocalEdit();
      this.removeEditPopover(true);
    } catch (error) {
      this.showToast(
        "Error in handleInputMessage() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }

  // ---------------------------
  // Light cleanup of blur: remove branching noise
  // ---------------------------
  inputEleBlur(message = null) {
    try {
      if (!this.isPopover && !this.popoverEdit?.ispicklist) return;

      if (message) {
        this.removeEditPopover(true);
        return;
      }

      // If Escape not pressed and it was edited, persist draft + close
      if (!this.isEscape && this.popoverEdit?.isEdited) {
        this.popoverEditCopy = { ...this.popoverEdit };
        this.finishLocalEdit();
        return;
      }

      // Otherwise just clear
      this.removeEditPopover(true);
    } catch (error) {
      this.showToast(
        "Error in handlePopoverBlur() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }

  // ---------------------------
  // Minor cleanup: do not call finishLocalEdit() twice
  // ---------------------------
  removeEditPopover(isClearPopoverEdit = false) {
    try {
      const popover = this.template.querySelector('[data-id="popoverEdit"]');
      if (popover) {
        popover.classList.add("slds-hide");
        popover.classList.remove("slds-show");
      }

      if (isClearPopoverEdit) {
        if (this.popoverEdit) this.popoverEdit.isEdited = false;
        // Only clear state; do NOT re-run finishLocalEdit here
        this.popoverEdit = {};
      }

      this.cleanupOutsideClick();
    } catch (error) {
      this.showToast(
        "Error in removeEditPopover() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }

  // Finalize the popoverEdit process --> set the cell to isEdited (if edited) & focus the cell that was clicked
  finishLocalEdit() {
    try {
      if (
        this._isMultiEditPopover &&
        this.popoverEdit.isEdited &&
        this.isApplyToAll
      ) {
        if (
          this.popoverEdit &&
          !this.checkboxArray.every((id) => id === this.popoverEdit.id)
        ) {
          this.applyAllEdits("okay");
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

        this.updateDraftValueOnEdit(); // Add the edited field's value to the <draftValues> array
        this.assignPopOverValueToField(); // Update the field's value/label of the record that was edited
      }
      // Clear the popoverEdit properties
      this.popoverEdit = {};

      // Focus the cell/editbutton and add class 'slds-is-edited' to the edited cell
      this.focusCellOnEdit(fieldId, isEdited);
    } catch (error) {
      this.showToast(
        "Error in finishLocalEdit() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  // Focus the cell that was clicked and set the cell's class to 'slds-is-edited' if the field was edited
  focusCellOnEdit(fieldId, isEdited, isFocus = true) {
    try {
      // Get the cell by the fieldId (i.e. <fieldName-recordId>)
      const editedCell = this.template.querySelector(`[data-id="${fieldId}"]`);
      if (!editedCell) return;

      // For multi-edit situations
      if (!isFocus) {
        // Only mark the cell as slds-is-edited if isFocus=false
        editedCell.classList.add("slds-is-edited");
        editedCell.classList.add("slds-no-row-hover");
        return;
      }

      setTimeout(() => {
        if (isEdited) {
          editedCell.classList.add(
            "slds-is-edited",
            "slds-has-focus",
            "slds-no-row-hover"
          );
        } else {
          editedCell.classList.add("slds-has-focus");
        }
        this.focusCellControl(editedCell);
      }, 10);
    } catch (error) {
      this.showToast(
        "Error in focusCellOnEdit() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  focusCellControl(cell) {
    if (!cell) return false;

    const control = cell.querySelector(
      ".slds-cell-edit__button:not([disabled]), " +
        "input:not([disabled]), " +
        "button:not([disabled]), " +
        "a[href], " +
        '[tabindex]:not([tabindex="-1"]):not([disabled])'
    );

    if (control && typeof control.focus === "function") {
      control.focus();
      return true;
    }

    return false;
  }
  removeIsEdited(fieldId) {
    const editedCell = this.template.querySelector(`[data-id="${fieldId}"]`);
    if (!editedCell) return;
    editedCell.classList.remove("slds-is-edited");
    editedCell.classList.remove("slds-no-row-hover");
  }
  // ====================================================================== \\

  // ================== Handle Edit Popover Draft Values ================== \\
  // Store the editing field's Original Value
  // Store the editing field's Original Value
  storeOriginalDraftValue(recordId, fieldName, value, displayValue) {
    try {
      if (!recordId || !fieldName) return;

      // Always store an object shape so callers can do: entry.value / entry.displayValue
      const draftFieldEntry = { value, displayValue };

      // Find existing record entry
      const existingDraftEntry = this.draftOriginalValues.find(
        (d) => d.id === recordId
      );

      // Create new record entry
      if (!existingDraftEntry) {
        this.draftOriginalValues.push({
          id: recordId,
          [fieldName]: draftFieldEntry
        });
        return;
      }

      // Only set if not already stored (keep the true "original" value)
      if (!existingDraftEntry[fieldName]) {
        existingDraftEntry[fieldName] = draftFieldEntry;
      }
    } catch (error) {
      this.showToast(
        "Error in storeOriginalDraftValue() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  // Store the new Edited Value in Draft Values
  updateDraftValueOnEdit(customDraft = null) {
    try {
      // Enable a custom draft to be sent
      const currentEdit = customDraft ? customDraft : this.popoverEdit;
      // Starter entry
      if (
        this.draftValues.length < 1 ||
        !this.draftValues.some((rec) => rec.id === currentEdit.id)
      ) {
        this.draftValues.push({
          id: currentEdit.id,
          [currentEdit.fieldName]: currentEdit.value
        });
        return;
      }
      this.draftValues.forEach((draft) => {
        if (draft.id === currentEdit.id) {
          draft[currentEdit.fieldName] = currentEdit.value;
        }
      });
    } catch (error) {
      this.showToast(
        "Error in updateDraftValueOnEdit() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  // Update the field with the popoverEdit's value
  assignPopOverValueToField(customDraft = null) {
    const currentEdit = customDraft ? customDraft : this.popoverEdit;

    try {
      const updateRecord = (rec) => ({
        ...rec,
        fields: rec.fields.map((field) => {
          if (field.fieldName === currentEdit.fieldName) {
            const displayValue =
              currentEdit.isdatetime || currentEdit.isdate
                ? handleDateObjDisplayValue(currentEdit.value)
                : (currentEdit.displayValue ?? `${currentEdit.value}`);
            return { ...field, value: currentEdit.value, displayValue };
          }
          return field;
        })
      });
      if (
        this.stableRows.some(
          (rec) => rec.id === currentEdit.id || rec.Id === currentEdit.id
        )
      ) {
        this.stableRows = this.stableRows.map((rec) => {
          if (rec.id === currentEdit.id) {
            const editedRec = updateRecord(rec);
            return editedRec;
          }
          return rec;
        });
      }
      if (this.localRows.some((rec) => rec.id === currentEdit.id)) {
        this.localRows = this.localRows.map((rec) => {
          if (rec.id === currentEdit.id) {
            const editedRec = updateRecord(rec);
            return editedRec;
          }
          return rec;
        });
      }
      if (this._uncommittedSearchTerm) {
        Promise.resolve().then(() => {
          // Ensure the DOM has had a chance to update dataset attributes
          handleEveryFilter({ detail: this._uncommittedSearchTerm }, this);
        });
      }
    } catch (error) {
      this.showToast(
        "Error in assignPopOverValueToField() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  // ====================================================================== \\

  // ~*~*~*~~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~ \\
  // ~*~*~*~~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~ \\
  // ~*~*~*~~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~ \\

  handleEditAllSelectedRows() {
    this.isApplyToAll = !this.isApplyToAll;
  }
  handleApplyAllCancel() {
    this.popoverEdit = {};
    this.template
      .querySelector('[data-id="popoverEdit"]')
      ?.classList?.replace("slds-show", "slds-hide");
    if (this._outsideClickHandler) {
      window.removeEventListener("mousedown", this._outsideClickHandler, true);
    }
    this.isApplyToAll = false;
  }
  handleApplyAllOkay() {
    try {
      // Assign the value to the drafts ---++  Clear the popoverEdit
      this.isApplyClicked = true;
      const dtype = this.popoverEdit.dtype;

      let ele;
      switch (dtype) {
        case "multipicklist":
          ele = this.template.querySelector(
            "c-custom-slds-combobox-multi-select-practice"
          );
          break;
        case "picklist":
          ele = this.template.querySelector('[data-id="picklistEdit"]');
          break;
        default:
          ele = this.template.querySelector("c-slds-input");
          break;
      }
      if (!ele) return;

      let val;
      let displayVal;
      const response = ele.getValue();

      if (dtype === "multipicklist") {
        const { label, value } = formatMultiPicklistVal(
          response.map((obj) => obj?.value)
        );
        val = value;
        displayVal = label;
      } else if (typeof response === "object" && response.displayVal) {
        val = response.value;
        displayVal = response.displayVal;
      } else {
        val = response;
        val = coerceByDtype(val, dtype);
      }

      // Store the original value if the cell was edited
      if (
        this.popoverEdit &&
        !this.popoverEdit.isEdited &&
        this.popoverEdit.value !== val
      ) {
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
        if (dtype === "multipicklist" && val) {
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
          if (
            Array.from(NOT_NAV_TARGET_HANDLERS).filter((nav) =>
              nav.toLowerCase().startsWith("recordtype")
            )
          ) {
            // Get the label from the Column's Picklist Options
            const matchedOption = this.localColumns
              .find((col) => col.fieldName === this.popoverEdit.fieldName)
              ?.options?.find((option) => option.value === val);

            this.popoverEdit.value = val;
            this.popoverEdit.displayValue =
              matchedOption?.displayValue ?? `${val}`;
            this.popoverEditCopy.value = val;
            this.popoverEditCopy.displayValue =
              matchedOption?.displayValue ?? `${val}`;
          }
        } else {
          // Update the popoverEdit's value
          this.popoverEdit.value =
            dtype === "multipicklist" ? val.join(";") : val;
          this.popoverEdit.displayValue = `${val}` || "";
          this.popoverEditCopy.value = val;
          this.popoverEditCopy.displayValue = `${val}` || "";
        }
      }

      // Assign the value to the drafts ---++  Clear the popoverEdit
      this.finishLocalEdit();
      this.removeEditPopover(true);
      this.isApplyToAll = false;
    } catch (error) {
      this.showToast(
        "Error in applyAllOkay() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }

  // =========================== Row Checkboxes =========================== \\
  // Hanlde "Select All" checkbox
  handleSelectAllRows(event) {
    handleSelectAllRows(this, event);
  }
  handleCheckboxChange(event) {
    handleCheckboxChange(this, event);
  }
  // ====================================================================== \\

  // ==================== Handle Focus/Blur of Cells ====================== \\
  // Focus a cell on click
  focusCell(event = null, cellParam = null) {
    try {
      const cell = event ? event.currentTarget : cellParam;
      cell?.classList.add("slds-has-focus");
    } catch (error) {
      this.showToast(
        "Error in focusCell() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  // Remove slds-has-focus on Blur of Cell
  blurCell(event) {
    try {
      const cell = event.currentTarget;
      if (event.relatedTarget && cell.contains(event.relatedTarget)) {
        // Focus is still within the cell; do nothing.
        return;
      }
      cell.classList.remove("slds-has-focus");
    } catch (error) {
      this.showToast(
        "Error in blurCell() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  // Focus both the cell and the button
  focusEditButton(event = null, btnParam = null) {
    try {
      const button = event ? event.currentTarget : btnParam; // Get the button
      const cell = button?.closest("td, th"); // Get the cell
      cell?.classList.add("slds-has-focus"); // Add focus to the cell
    } catch (error) {
      this.showToast(
        "Error in focusEditButton() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  // Blur both the cell and the button
  blurEditButton(event) {
    try {
      const cell = event.currentTarget.closest("td, th");
      if (event.relatedTarget && cell?.contains(event.relatedTarget)) {
        // Focus is still within the cell; do nothing.
        return;
      }
      cell?.classList.remove("slds-has-focus");
    } catch (error) {
      this.showToast(
        "Error in blurEditButton() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
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

  // ===================== Search List View Handlers ======================= \\
  _searchTerm;
  _uncommittedSearchTerm;
  async handleSearchFilter(message) {
    this._searchTerm = message.detail;
    this._uncommittedSearchTerm = message.detail;

    if (this._paginated) {
      this._currentPage = 1;
      await this.loadPage(1);
      return;
    }

    // updates localRows (data only)
    handleSearchFilter(message, this);

    // Wait for DOM to reflect the new localRows
    await new Promise(requestAnimationFrame);
    // Now it is safe to touch DOM
    persistCheckedRows(this);
    persistEditedFields(this);
    await persistSort(this);

    // And only now run highlight/reset against the actual cells
    handleEveryFilter({ detail: this._uncommittedSearchTerm || "" }, this);
  }
  handleEveryFilter(message) {
    this._uncommittedSearchTerm = message.detail;
    handleEveryFilter(message, this);
    Promise.resolve().then(() => {
      persistCheckedRows(this);
      persistEditedFields(this);
    });
  }
  // ======================================================================= \\

  // =========================== Save/Cancel Drafts ========================== \\
  // Remove tabIndex=0 from all the table elements and remove slds-is-edited from all edited cells
  async resetCellClasses() {
    try {
      const allCells = this.template.querySelectorAll(".slds-cell-edit");
      if (allCells) {
        allCells.forEach((cell) => {
          // Remove 'slds-is-edited' from all cells
          cell.classList.remove(
            "slds-is-edited",
            "slds-has-focus",
            "slds-no-row-hover"
          );
        });
      }
      clearCheckboxes(this);
    } catch (error) {
      this.showToast(
        "Error in resetCellClasses() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
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
    } catch (error) {
      this.showToast(
        "Error in clearDrafts() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  // Map the original values back to all the rows ---++ Reset the <td> and <th> cell styling classes
  async cancelEdits() {
    this.isLoading = true;
    try {
      // Remap original draft values to the rows
      this.localRows = handleRevertFields(
        this.localRows,
        this.draftOriginalValues
      );
      // Remap original Draft values to the stable rows
      this.stableRows = handleRevertFields(
        this.stableRows,
        this.draftOriginalValues
      );

      // Let LWC apply the reverted data into the DOM attributes first
      //await Promise.resolve();
      //// Rebuild the visible cell contents from the current dataset values
      //handleEveryFilter({ detail: this._uncommittedSearchTerm || '' }, this);

      // Reset the datatable attributes cell styles
      await this.clearDrafts();
      await this.resetCellClasses();
      await persistSearchTerm(this);
      await persistSort(this);
    } catch (error) {
      this.showToast(
        "Error in cancelEdits() of sldsTableAuto.js",
        getErrorMessage(error),
        "error"
      );
    } finally {
      this.isLoading = false;
    }
  }

  // Save edits when user clicks "Save"
  // Map the drafts to a record-format --> Save the record-formats to the database ---++ Reset the <td> and <th> cell styling classes
  async saveEdits() {
    this.isLoading = true;

    if (!this.objectName) {
      this.showToast(
        "Implementation Error:",
        'Public Property, "objectName" was not provided. The component requires this property to save records.',
        "error"
      );
      this.isLoading = false;
      return;
    }

    const fieldNameMap = FIELD_API_NAME_EXCEPTIONS[this.objectName] || {};

    try {
      const formattedRecs = this.draftValues.map((src) => {
        const out = { ...src };

        // normalize Id
        if (out.id && !out.Id) {
          out.Id = out.id;
          delete out.id;
        }

        const recId = out.Id;
        const origRec = (this.localRows || []).find(
          (r) => (r?.Id ?? r?.id) === recId
        );

        // ---- LABEL -> API NAME REMAP ----
        if (origRec?.fields?.length) {
          const apiNameByLabel = new Map(
            origRec.fields.map((f) => [f.fieldName, f.apiName])
          );

          for (const key of Object.keys(out)) {
            const apiName = apiNameByLabel.get(key);
            if (!apiName) continue;

            if (!Object.prototype.hasOwnProperty.call(out, apiName)) {
              out[apiName] = out[key];
            }
            delete out[key];
          }
        }

        // ---- FIELD API NAME EXCEPTIONS ----
        for (const [oldKey, newKey] of Object.entries(fieldNameMap)) {
          if (Object.prototype.hasOwnProperty.call(out, oldKey)) {
            if (!Object.prototype.hasOwnProperty.call(out, newKey)) {
              out[newKey] = out[oldKey];
            }
            delete out[oldKey];
          }
        }

        return {
          sObjectType: this.objectName,
          ...out
        };
      });

      await saveRows({ rows: formattedRecs });

      await this.clearDrafts();
      await this.resetCellClasses();
      // Give the post-DML table query a moment to observe the committed data
      // before we ask the cacheable wire to refresh.
      await new Promise((resolve) => setTimeout(resolve, 150));
      await this.handleRefresh();
      if (!this._paginated) {
        await persistSort(this);
        await persistSearchTerm(this);
      }
      this.showToast(`${this._objectLabel} successfully saved`, "", "success");
    } catch (error) {
      this.showToast(
        "Error in saveEdits() of sldsTableAuto.js",
        getErrorMessage(error),
        "error"
      );
    } finally {
      this.isLoading = false;
    }
  }
  // ========================================================================= \\

  // ✅ DOM handler: NO async, NO promise returned
  applyRowAction(event) {
    // fire-and-forget; swallow any stray rejection here
    this._applyRowAction(event).catch((e) => {
      this.showToast(
        "Error in applyRowAction() of sldsTableAuto.js",
        getErrorMessage(e),
        "error"
      );
    });
  }

  async _applyRowAction(message) {
    let isRefresh = false;
    let toastMessage = null;
    let deletedRecordIds = null;
    this.isLoading = true;
    try {
      const recordId = this.modalConfig?.recordId;
      const details = message?.detail;

      if (typeof details === "string") {
        if (details === "cancel") {
          this.modalConfig = null;
          return;
        }
        if (details === "okay") {
          await deleteRecordsById({
            recordIds: [recordId],
            objectApiName: this.objectName
          });
          deletedRecordIds = [recordId];
          toastMessage = "Record Successfully Deleted";
          isRefresh = true;
        }
      } else if (details && typeof details === "object") {
        if (details.delete) {
          const recordIds = Array.from(
            new Set([...this.checkboxArray, recordId])
          );
          await deleteRecordsById({
            recordIds,
            objectApiName: this.objectName
          });
          deletedRecordIds = recordIds;
          toastMessage = `${recordIds.length} Successfully Deleted`;
          isRefresh = true;
        }
        clearCheckboxes(this);
      }
      if (isRefresh) {
        await this.handleRefresh();
        if (this.notifyDeletion && deletedRecordIds?.length) {
          this.dispatchEvent(
            new CustomEvent("deletion", { detail: deletedRecordIds })
          );
        }
      }
    } catch (error) {
      this.showToast(
        "Error in applyRowAction() of sldsTableAuto.js",
        getErrorMessage(error),
        "error"
      );
      isRefresh = false;
      toastMessage = null;
    } finally {
      this.isLoading = false;
      this.modalConfig = null;
      if (isRefresh && toastMessage) {
        this.showToast(toastMessage, "", "success");
      }
    }
  }

  // Call Modal on Row Action
  // ⬅️ DOM handler must be sync so it never returns a Promise
  handleRowAction(event) {
    this._handleRowAction(event).catch((e) => {
      this.showToast(
        "Error in handleRowAction() of sldsTableAuto.js",
        getErrorMessage(e),
        "error"
      );
    });
  }

  // ⬅️ your original code moved here (unchanged except the refresh event)
  async _handleRowAction(event) {
    try {
      const { id = null, selection = null } = event?.detail || {};

      switch (selection?.toLowerCase()) {
        case "delete":
          if (
            this.checkboxArray.length &&
            id &&
            this.checkboxArray.some((recId) => id === recId)
          ) {
            this.modalConfig = {
              columns: 1,
              modalTitle: "Delete Record",
              fields: [
                {
                  fieldName: "delete",
                  label: "Delete all select rows",
                  value: false,
                  dtype: "boolean"
                }
              ],
              modalMessage: "Are you sure you want to delete this record?",
              cancelButtonLabel: "Cancel",
              okayButtonLabel: "Delete",
              recordId: id
            };
          } else {
            this.modalConfig = {
              columns: 1,
              modalTitle: "Delete Record",
              modalMessage: "Are you sure you want to delete this record?",
              cancelButtonLabel: "Cancel",
              okayButtonLabel: "Delete",
              fields: null,
              recordId: id
            };
          }
          requestAnimationFrame(() => {
            const modalEle = this.template.querySelector(
              '[data-id="deleteRecordsModal"]'
            );
            if (modalEle) modalEle.showMe();
          });
          return;

        case "edit": {
          const result = await newRecordLayoutModal.open({
            size: "small",
            description: "Accessible description of modal's purpose",
            objectApiName: this.objectName,
            objectLabel: this._objectLabel,
            recordId: id
          });

          // undefined → saved
          if (result?.result === "success") {
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
          requestAnimationFrame(() => {
            const clickedButton = this.template.querySelector(
              `[data-menu-id="${id}"]`
            );
            if (clickedButton) {
              clickedButton.focus();
            }
          });
          break;
        }
        default:
          this.dispatchEvent(
            new CustomEvent("customrowaction", { detail: { id, selection } })
          );
          break;
      }
    } catch (error) {
      this.showToast(
        "Error in handleRowAction() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }

  // Handle Text Style of Columns
  handleColAction(message) {
    try {
      const msgDetail = message?.detail;
      if (msgDetail) {
        // Get Col Details (fieldName, textStyle)
        const fieldName = msgDetail.id;
        const newTextStyle = msgDetail.selection;

        // find the column entry
        const colEntry = this.localColumns.find(
          (col) => col.fieldName === fieldName
        );

        // ********** CELL_TEXT_STYLES
        // Check if style was unchanged or invalid
        if (!newTextStyle || colEntry.textStyle === newTextStyle) return;

        // Update the column 'textStyle' attribute
        this.localColumns = this.localColumns.map((col) => {
          return col.fieldName === fieldName
            ? { ...col, textStyle: newTextStyle }
            : col;
        });

        // Get the current cell style class
        const crntCl = CELL_TEXT_STYLES[colEntry.textStyle];
        // Get the next text stlye
        const newCl = CELL_TEXT_STYLES[newTextStyle];

        // Replace the cell text classes
        const fieldCells = this.template.querySelectorAll(
          `[data-cell-field-name="${fieldName}"]`
        );
        if (fieldCells) {
          fieldCells.forEach((cell) => cell.classList.replace(crntCl, newCl));
        }
      }
    } catch (error) {
      this.showToast(
        "Error in handleColAction() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }

  // =================================================================== Column Sorting Handlers =================================================================== \\
  _sortBy;
  // Handle Sort-Button of Column
  async sortCol(event) {
    event.preventDefault();
    this.isLoading = true;

    const button = event.currentTarget;
    const fieldName = button.dataset.colFieldName;
    let isAsc = false;

    try {
      const th = button.closest("th");

      const removeSort = (tableCols) => {
        if (!tableCols) return;

        tableCols.forEach((col) => {
          if (
            col.classList.contains("slds-is-sorted") &&
            col.dataset.id !== th.dataset.id
          ) {
            col.classList.remove(
              "slds-is-sorted",
              "slds-is-sorted_asc",
              "slds-is-sorted_desc"
            );
            col.setAttribute("aria-sort", "none");
          }
        });
      };

      const sortColDesc = (col) => {
        if (!col.classList.contains("slds-is-sorted")) {
          col.classList.add("slds-is-sorted");
        }
        col.classList.remove("slds-is-sorted_asc");
        col.classList.add("slds-is-sorted_desc");
        col.setAttribute("aria-sort", "descending");
      };

      const sortColAsc = (col) => {
        if (!col.classList.contains("slds-is-sorted")) {
          col.classList.add("slds-is-sorted");
        }
        col.classList.remove("slds-is-sorted_desc");
        col.classList.add("slds-is-sorted_asc");
        col.setAttribute("aria-sort", "ascending");
      };

      if (th) {
        const tableCols = this.template.querySelectorAll(
          '[data-element="tableColumn"]'
        );
        removeSort(tableCols);

        if (!th.classList.contains("slds-is-sorted")) {
          sortColAsc(th);
          isAsc = true;
        } else if (th.getAttribute("aria-sort") === "descending") {
          sortColAsc(th);
          isAsc = true;
        } else {
          sortColDesc(th);
          isAsc = false;
        }
      }

      const field = this.localColumns.find(
        (col) => col.fieldName === fieldName
      );

      this._sortedCol = {
        fieldName: field.fieldName,
        label: field.label,
        type: isAsc ? "asc" : "desc",
        isAsc,
        dtype: field.dtype || "text"
      };

      this._sortBy = [
        {
          fieldName: field.fieldName,
          sortDirection: isAsc ? "ASC" : "DESC"
        }
      ];

      if (this._paginated) {
        this._currentPage = 1;
        await this.loadPage(1);
        return;
      }

      await this.performSort(isAsc, fieldName);
      this.dispatchEvent(
        new CustomEvent("newsort", { detail: this._sortedCol })
      );
    } catch (error) {
      this.showToast(
        "Error in sortCol() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    } finally {
      this.isLoading = false;
    }
  }
  // Sort the columns after changes detected
  async performSort(isAsc, fieldName) {
    try {
      let sortingRows = [...this.localRows];

      let picklistOptions = [];

      const matchedCol = this.localColumns.find(
        (col) => col.fieldName === fieldName
      );
      if (!matchedCol) {
        return;
      }

      const dtype = matchedCol.dtype ?? "text";

      if (dtype === "picklist" || dtype === "multipicklist") {
        picklistOptions = (matchedCol.options ?? []).map(
          (option) => option?.value
        );
      }

      // Perform Sorting
      sortingRows = sortingRows.sort((a, b) => {
        const fieldA = a.fields.find((field) => field.fieldName === fieldName);
        const fieldB = b.fields.find((field) => field.fieldName === fieldName);

        const valueA = fieldA?.value || "";
        const valueB = fieldB?.value || "";

        const dtypeA = fieldA?.dtype || "text";

        // Blank text handling
        if (!valueA && !valueB) return 0;
        if (!valueA) return isAsc ? -1 : 1;
        if (!valueB) return isAsc ? 1 : -1;

        if (
          (dtypeA === "picklist" || dtypeA === "multipicklist") &&
          picklistOptions
        ) {
          // Sort picklist by options order
          const indexA = picklistOptions.indexOf(valueA);
          const indexB = picklistOptions.indexOf(valueB);

          return isAsc ? indexA - indexB : indexB - indexA;
        } else if (
          dtypeA === "number" ||
          dtypeA === "decimal" ||
          dtypeA === "currency" ||
          dtypeA === "percent"
        ) {
          // Numeric sorting
          return isAsc ? valueA - valueB : valueB - valueA;
        } else if (dtypeA === "date") {
          // Date sorting
          return isAsc
            ? new Date(valueA) - new Date(valueB)
            : new Date(valueB) - new Date(valueA);

          // datetime
        } else if (dtypeA === "datetime") {
          const tA = Date.parse(valueA);
          const tB = Date.parse(valueB);
          if (isNaN(tA) && isNaN(tB)) return 0;
          if (isNaN(tA)) return isAsc ? -1 : 1;
          if (isNaN(tB)) return isAsc ? 1 : -1;
          return isAsc ? tA - tB : tB - tA;
        } else if (dtypeA === "boolean") {
          // Boolean sorting
          const boolA = valueA === "true";
          const boolB = valueB === "true";

          if (boolA === boolB) return 0;
          if (isAsc) {
            return boolA ? 1 : -1;
          }
          return boolA ? -1 : 1;
        }

        // Default alphabetical sorting with tie-breaker
        const splitA = valueA.split(" ");
        const splitB = valueB.split(" ");

        for (let i = 0; i < Math.max(splitA.length, splitB.length); i++) {
          const wordA = splitA[i] || "";
          const wordB = splitB[i] || "";
          const comparison = wordA.localeCompare(wordB);
          if (comparison !== 0) {
            return isAsc ? comparison : -comparison;
          }
        }
        return 0;
      });

      this.localRows = JSON.parse(JSON.stringify(sortingRows));
    } catch (error) {
      this.showToast(
        "Error in performSort() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  // ================================================================================================================================================================ \\

  // ======================================================================= Filter Handlers ======================================================================== \\
  get gridClass() {
    const commCl = this.isCommunity ? "community-config" : "";
    const isGrid = {
      topGrid: `slds-has-flexi-truncate ${commCl}`,
      middleGrid: "slds-grid",
      bottomGrid: "slds-truncate slds-col slds-size_9-of-11"
    };
    const noGrid = {
      topGrid: `${commCl}`,
      middleGrid: "",
      bottomGrid: ""
    };
    if (this.filterDetails?.isFilter) {
      //console.log('Yeah  is filter is true');
    } else {
      //console.log('Not filter now');
    }
    return this.filterDetails?.isFilter ? isGrid : noGrid;
  }

  handleFilter() {
    try {
      this.filterDetails = {
        colOptions: this.localColumns.map((col) => {
          return {
            label: col.label,
            value: col.fieldName,
            dtype: col.dtype,
            keyId: createUniqueKeyIds(),
            ...(col.options // Conditionally add Picklist Options
              ? { options: [...col.options] }
              : {})
          };
        }),
        tableName: this.headerConfig.listViewTitle,
        isFilter: true,
        size: "large",
        storedConditions: []
      };
    } catch (error) {
      this.showToast(
        "Error in handleFilter() of sldsTableAuto.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }

  closeFilterPanel() {
    this.filterDetails = {
      ...this.filterDetails,
      isFilter: false
    };
  }

  // Apply Filter to <rows>  when message received
  filterRows(message) {
    const detail = message?.detail;
    if (detail) {
      //this.filterData = {
      //    filtered: detail.filtered,
      //    orig: this.filterData?.original || detail.original,
      //    fields: detail.fields
      //};
    }
    //this.rows = this.filterData.filtered.map(item => item);
  }
  // ================================================================================================================================================================ \\

  handlePageHeaderSelections() {
    console.log("handlePageHeaderSelections() was called in sldsTableAuto.js");
  }

  // Apply Styles to the host 👉 Can pass 1.Array of Arrays   2.Array of Object   3.Strings
  _applyVarsDirect(cssVar, varStyle = null) {
    // Check that CSS var starts with '--' and has a non-null stlye
    const isValid = (cssVarP, varStyleP) => {
      return (
        typeof cssVarP === "string" &&
        typeof varStyleP === "string" &&
        cssVarP?.startsWith("--") &&
        varStyleP
      );
    };

    // Get Host elements
    const el = this.template.host;

    if (Array.isArray(cssVar)) {
      // Handle Array of vars
      cssVar.forEach((hostVar) => {
        if (Array.isArray(hostVar) && isValid(hostVar[0], hostVar[1])) {
          // Handle Array structure  (CSS var at index 0)
          el.style.setProperty(hostVar[0], hostVar[1]);
        } else if (
          typeof hostVar === "object" &&
          isValid(hostVar.cssVar, hostVar.varStyle)
        ) {
          // Handle Object structure (cssVar & varStyle keys)
          el.style.setProperty(hostVar.cssVar, hostVar.varStyle);
        } else {
          this.showToast(
            "Incorrect argument structure in _applyVarsDirect() of sldsTableAuto.js",
            "accepted structures: 1. [{cssVar: --my-style, varStyle: 10px}]  2. [ [--my-style, 10px] ]",
            ""
          );
        }
      });
    } else if (isValid(cssVar, varStyle)) {
      // Handle string arguments
      el.style.setProperty(cssVar, varStyle);
    }
  }

  // Footer class controller
  get footerBgClass() {
    let footerCl = "slds-docked-form-footer vg-table_edit-footer";
    
    footerCl = this._isInitLimit
      ? `${footerCl} edit-footer-lower`
      : `${footerCl} edit-footer`;

    return footerCl;
  }
  // smaller checkbox space if row count not suppressed
  get checkboxThCl() {
    const sizeCl = this._suppressRowCount
      ? "check-th-normal"
      : "check-th-small";
    return `slds-text-align_right slds-cell_action-mode ${sizeCl}`;
  }
  get checkboxTdCl() {
    return `slds-text-align_right row-action-cell ${this._suppressRowCount ? "check-th-normal" : "check-th-small"}`;
  }
  // Trigger Edited State (toggles save/cancel footer)
  get isTableEdited() {
    return this.draftValues?.length > 0;
  }
  // Set illustration to the opposite of suppressIllustration
  get isIllustration() {
    return !this.suppressIllustration;
  }
  // different style checkbox for  communities
  get booleanCellStyle() {
    return this.isCommunity
      ? "slds-form-element slds-form-element_stacked slds-m-vertical_xx-small"
      : "slds-form-element";
  }
  // Message for Slds Illustration component
  get noDataMessage() {
    if (this.noDataTitle) return this.noDataTitle;
    return this._objectLabel
      ? `No ${this._objectLabel} data available.`
      : "No data.";
  }
  get sortedByInfos() {
    if (!this._sortedCol) return "";
    return ` • Sorted by: ${this._sortedCol.label} - ${this._sortedCol.type}`;
  }
  get isCommunity() {
    try {
      const candidates = [
        window?.location?.href,
        document?.baseURI,
        document?.URL,
        document?.referrer
      ].filter(Boolean);

      for (const u of candidates) {
        const { hostname, pathname } = new URL(u);
        const host = hostname.toLowerCase();
        const path = pathname.toLowerCase();
        const firstSeg = path.split("/").filter(Boolean)[0] || "";

        const onExpDomain =
          host.includes("salesforce-experience.com") ||
          host.endsWith(".site.com") || // covers my.site.com as well
          host.endsWith(".salesforce-sites.com"); // older domains, just in case

        const hasCommunityRoot =
          firstSeg === "s" || // common Experience Cloud root
          firstSeg === "ace"; // your site path segment

        if (onExpDomain || hasCommunityRoot) {
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error("error in get isCommunity() of sldsTableAuto.js: ", e);
      return false;
    }
  }
  // Table Style
  get tableCl() {
    if (this.isSimpleTable) {
      let simpleCl =
        "classic-table slds-table slds-no-row-hover slds-table_bordered slds-table_fixed-layout";
      if (this.colBorders) simpleCl = simpleCl + " slds-table_col-bordered";
      if (this.tightTable) simpleCl = simpleCl + " tight-table";
      if (!this.suppressResizableCols)
        simpleCl = simpleCl + " slds-table-resizable-cols no-actions-table";
      return simpleCl;
    }
    // slds-table slds-table_fixed-layout slds-table_edit classic-table
    let baseCl =
      "slds-table slds-table_fixed-layout slds-table_edit classic-table";
    if (this.suppressRowActions) baseCl = baseCl + " no-actions-table";
    if (this.stripedTable) baseCl = baseCl + " slds-table_striped";
    if (!this.suppressResizableCols)
      baseCl = baseCl + " slds-table-resizable-cols";
    if (!this.suppressBorderedTable) baseCl = baseCl + " slds-table_bordered";
    if (this.colBorders) baseCl = baseCl + " slds-table_col-bordered";
    if (this.tightTable) baseCl = baseCl + " tight-table";
    //console.log('here is baseCl in sldsTable.js: ', baseCl);
    return baseCl;
  }
  get customTableCl() {
    //if (this.isSimpleTable) return 'custom-table-container__simple';
    if (!this.suppressHeader) {
      return "custom-table-container bordered-table slds-scrollable_x";
    }
    return "custom-table-container not-bordered-table slds-scrollable_x";
  }
  get colsCl() {
    if (this.isSimpleTable) {
      let simpleColCl = "";
      if (!this.suppressResizableCols)
        simpleColCl = "slds-is-resizable dv-dynamic-width";
      return this.suppressColActions
        ? simpleColCl
        : `${simpleColCl} slds-has-button-menu`;
    }
    let colCl = "";
    if (!this.suppressResizableCols) {
      colCl = colCl + " slds-is-resizable dv-dynamic-width";
    }
    if (!this._suppressSort) {
      colCl = colCl + " slds-is-sortable";
    }
    if (!this.suppressColActions) {
      colCl = colCl + " slds-has-button-menu";
    }
    return colCl ? colCl : "empty-cols";
  }
  get isPopover() {
    return this._isMultiEditPopover ? false : true;
  }

  pageSizeModalConfig;
  async handleSettingsSelected(message) {
    try {
      const selection = message?.detail;
      const selectionLower = selection ? selection.toLowerCase() : null;

      switch (selectionLower) {
        case "new list view":
          this.createListViewConfig = { objectApiName: this.objectName };
          break;
        case "rename list view":
          this.updateListViewConfig = {
            headerTitle: `Update ${this.selectedListViewMeta?.label}`
          };
          break;
        case "select fields to display":
          // Get field available to display in the list view
          if (this._objectInfos) {
            const fields = this._objectInfos?.data?.fields;
            if (!fields) return;
            const options = Object.values(fields)?.map((meta) => {
              return {
                label: meta?.label,
                value: meta?.apiName,
                dtype: meta?.dataType
              };
            });
            this.updateDisplayColumnsConfig = {
              headerTitle: `Update ${this.selectedListViewMeta?.label} Displayed Fields`,
              options,
              currentValue: this._columns.map((col) => col.fieldName)
            };
          }
          break;
        case "delete list view":
          this.deleteListViewConfig = {
            apiName: this.selectedListViewMeta?.listReference.listViewApiName
          };
          break;
        case "pagesize":
          this.pageSizeModalConfig = {
            headerTitle: "Update List View Page Size",
            currentValue: this._pageSize,
            inputLabel: "Page Size",
            okLabel: "Update",
            slotFooter: true,
            newPageSize: null
          };
          break;
        case "updatecolumnwidthspct":
          await this.saveColumnWidths(false);
          break;
        case "updatecolumnwidthspx":
          await this.handleSaveColumnWidths();
          break;
        case "set as default list view":
          this.dispatchEvent(
            new CustomEvent("defaultlistview", { detail: selection })
          );
          break;
        default:
          break;
      }
    } catch (error) {
      this.showToast(
        "Error in handleSettingsSelection() of sldsTableAuto.js",
        getErrorMessage(error),
        "error"
      );
    }
  }
  async handleSaveColumnWidths() {
    await this.saveColumnWidths(true);
  }
  async updatePageSize() {
    try {
      let val = this.pageSizeModalConfig?.newPageSize;

      if (!val) {
        const input = this.template.querySelector(
          'c-slds-input[data-id="page-size-input"]'
        );
        val = input?.getValue();
      }

      const numVal = Number(val);
      if (isNaN(numVal) || numVal <= 0 || numVal === this._pageSize) {
        return;
      }

      this._applyPageSizeState(numVal);

      if (this._conditions !== undefined || this._paginated) {
        await this.loadPage(1);
      } else {
        this.initializeTableQuery();
      }
    } catch (error) {
      this.showToast(
        "Error in updatePageSize() of sldsTableAuto.js",
        getErrorMessage(error),
        "error"
      );
    } finally {
      this.closePageSizeModal();
    }
  }

  closePageSizeModal() {
    this.pageSizeModalConfig = null;
    focusListHeader(this, true);
  }
  async savePageSize() {
    try {
      const input = this.template.querySelector(
        'c-slds-input[data-id="page-size-input"]'
      );
      const val = this.pageSizeModalConfig?.newPageSize ?? input?.getValue();
      const numVal = Number(val);

      if (isNaN(numVal) || numVal <= 0) {
        return;
      }

      this._applyPageSizeState(numVal);

      const fieldApiName = this._effectivePageSizeConfigName;
      if (!fieldApiName || !this._listViewName || !this.objectName) {
        if (this._conditions !== undefined || this._paginated) {
          await this.loadPage(1);
        } else {
          this.initializeTableQuery();
        }
        this.showToast(
          `Page size updated to ${numVal}`,
          "Saved for this session only.",
          "success"
        );
        return;
      }

      const merged = {
        ...(this._pageSizeConfigsResult || {})
      };

      merged[this.objectName] = {
        ...(merged[this.objectName] || {}),
        [this._listViewName]: numVal
      };

      const userSettings = {
        [fieldApiName]: JSON.stringify(merged)
      };

      await saveUserDisplaySettings({
        userId: this._userId,
        userSettings
      });

      this._pageSizeConfigsResult = merged;
      this._currentPageSizeConfig = numVal;

      if (this._conditions !== undefined || this._paginated) {
        await this.loadPage(1);
      } else {
        this.initializeTableQuery();
      }

      this.showToast(`Page size updated to ${numVal}`, "", "success");
    } catch (error) {
      this.showToast(
        "Error in savePageSize() of sldsTableAuto.js",
        getErrorMessage(error),
        "error"
      );
    } finally {
      this.closePageSizeModal();
    }
  }

  // Show Toast
  toastObj;
  showToast(title, message, variant, mode = null) {
    const toastMode = mode
      ? mode
      : variant === "success"
        ? "dismissible"
        : "sticky";

    this.toastObj = {
      variant: variant,
      mode: toastMode,
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
  showLinkedRecordToast(
    action,
    objectApiName,
    objectLabel,
    recordId,
    linkLabel
  ) {
    const getLinkMessage = () => {
      switch (action) {
        case "new":
          return linkLabel && linkLabel !== objectLabel
            ? {
                before: `New ${objectLabel}`,
                linkLabel: linkLabel,
                after: "was successfully created."
              }
            : {
                before: null,
                linkLabel: `New ${objectLabel}`,
                after: "was successfully created."
              };

        case "edit":
          return linkLabel && linkLabel !== objectLabel
            ? {
                before: `${objectLabel}`,
                linkLabel: linkLabel,
                after: "was successfully updated."
              }
            : {
                before: null,
                linkLabel: `${objectLabel}`,
                after: "was successfully updated."
              };
        case "converted":
          return {
            before: `${objectLabel} was successfully converted. View`,
            linkLabel: `new ${linkLabel}`,
            after: "."
          };
        default:
          return null;
      }
    };

    if (!objectApiName || !recordId) {
      // Warning if no recordId/objectApiName configured
      this.toastObj = {
        variant: "warning",
        mode: "sticky",
        objectApiName: null,
        message: "No Record Id or Object Api Name was provided.",
        header: {
          text: "Misconfiguration of showLinkedRecordToast() in commLeadStageLwc.js"
        }
      };
    } else {
      const toastMessage = getLinkMessage();
      // Linked Toast
      this.toastObj = {
        variant: "success",
        mode: "sticky",
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
}
