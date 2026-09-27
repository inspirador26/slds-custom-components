/**
 * sldsCardTiles — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/utils, c/newRecordLayoutModal, c/utils.
 * - Salesforce/platform modules: lwc, @salesforce/apex, lightning/navigation,
 * @salesforce/apex/DynamicSObjectController.deleteRecordsById,
 * @salesforce/apex/DynamicSObjectController.fetchRecordsDynamicWithConditionCached.
 * - Template children (including conditional UI): c-object-infos-lwc, c-slds-illustration,
 * c-slds-menu-popover-button, c-slds-modal, c-toast-lwc, lightning-formatted-rich-text, lightning-spinner.
 * - Bundle template: sldsCardTiles.html; local styles: sldsCardTiles.css. Salesforce SLDS styling is
 * expected.
 * - Shared CSS modules: c/sharedStylesGlobal.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-card-tiles') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - isCommunity (is-community): Enables Experience Cloud-specific layout/navigation handling. Declared
 * default: false.
 *   Example: child.isCommunity = true;
 * - suppressSettings (suppress-settings): Suppresses the settings menu. Declared default: false.
 *   Example: child.suppressSettings = true;
 * - viewName (view-name): Compatibility property: name displayed for the tile view; currently
 * stored/exposed but not consumed by this implementation.
 *   Example: child.viewName = "Accounts";
 * - tileBg (tile-bg): CSS background color.
 *   Example: child.tileBg = "#ffffff";
 * - tileBorderStyle (tile-border-style): CSS border style for the named region.
 *   Example: child.tileBorderStyle = "1px solid #c9c9c9";
 * - tileBorderRadius (tile-border-radius): CSS corner radius, including units.
 *   Example: child.tileBorderRadius = "0.25rem";
 * - tileLinkColor (tile-link-color): CSS tile title link color.
 *   Example: child.tileLinkColor = "#0176d3";
 * - cardBg (card-bg): CSS background color.
 *   Example: child.cardBg = "#ffffff";
 * - cardHeaderBg (card-header-bg): CSS background for the card header.
 *   Example: child.cardHeaderBg = "#f3f3f3";
 * - cardHeaderBorderStyle (card-header-border-style): CSS border style for the named region.
 *   Example: child.cardHeaderBorderStyle = "1px solid #c9c9c9";
 * - cardShadow (card-shadow): CSS box-shadow declaration.
 *   Example: child.cardShadow = "0 1px 3px #0003";
 * - cardBorder (card-border): CSS border declaration.
 *   Example: child.cardBorder = "1px solid #c9c9c9";
 * - suppressHeaderLink (suppress-header-link): Prevents the tile-card header from acting as a link.
 * Declared default: false.
 *   Example: child.suppressHeaderLink = true;
 * - tilesPerRow (tiles-per-row): Number of tiles across a row (use a supported SLDS fraction).
 *   Example: child.tilesPerRow = 2;
 * - newRecordVals (new-record-vals): Default field values supplied when opening the new-record modal.
 *   Example: child.newRecordVals = [{ fieldApiName: 'Name', value: 'New account' }];
 * - objectLabel (object-label): Singular object label displayed in headings/messages.
 *   Example: child.objectLabel = "Account";
 * - pluralLabel (plural-label): Plural object label displayed in headings/messages.
 *   Example: child.pluralLabel = "Accounts";
 * - columns (columns): Schema-driven columns; each field contains objectApiName/fieldApiName (normally an
 * @salesforce/schema import); first field determines the queried object.
 *   Example: child.columns = [{ field: ACCOUNT_NAME, label: 'Account' }];
 * - conditions (conditions): Query conditions: structured buildWhereClause configuration or SOQL predicate
 * (without WHERE), optionally followed by LIMIT.
 *   Example: child.conditions = { cond1: [{ fieldName: 'Name', isValues: ['Acme'] }], limit: 25 };
 * - sendRowsLength (send-rows-length): Emits rowslength with the loaded row count. Declared default:
 * false.
 *   Example: child.sendRowsLength = true;
 * - sendRows (send-rows): Emits sendrows with loaded record data. Declared default: false.
 *   Example: child.sendRows = true;
 *
 * Public methods (call on the rendered child):
 * - async handleRefresh(): Reload backing records; await completion where asynchronous.
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-slds-card-tiles columns={columns} conditions={conditions}
 *         send-rows-length={enabled} onrowslength={handleCount}></c-slds-card-tiles>
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
 * - Use for an org-backed tile collection that loads its own records and metadata. The first column's
 * field.objectApiName determines the object; schema imports supply that shape. This requires object/field
 * access and the Apex/child dependencies listed above.
 * - Filtering variant: conditions = { cond1: [{ fieldName: 'Name', isValues: ['Acme'] }], limit: 25 }.
 * Supply a predicate when using a limit with the tile query, since its Apex method prepends WHERE.
 * Conditions are translated by the repository's query helpers; separate condition groups use AND and
 * entries within a group use OR. send-rows enables sendrows; send-rows-length enables rowslength. Call
 * handleRefresh() on the rendered component after external changes. Use sldsTile for a single
 * parent-supplied record.
 */

import { LightningElement, api, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { iconMap as ICON_MAP} from 'c/utils';
import NewRecordLayoutModal from 'c/newRecordLayoutModal';
import { NavigationMixin } from 'lightning/navigation';
import deleteRecordsById from '@salesforce/apex/DynamicSObjectController.deleteRecordsById';
import fetchRecordsDynamicWithConditionCached from '@salesforce/apex/DynamicSObjectController.fetchRecordsDynamicWithConditionCached';


import { 
    getErrorMessage, 
    getToastErrorMessage,
    buildWhereClause,
    isValidProperty, 
    mapRowsToColumnsCards,   
    NON_NAV_TARGETS,
    getCleanMetaDataLabels,
    iconByObjectApiName,
    isHtml
} from 'c/utils';




// Change 'dataType' Object Infos values to match Table Component's expected properties
// replace TO_LOCAL_DTYPE with:
const TO_LOCAL_DTYPE = (dtype) => {
    if (!dtype || typeof dtype !== 'string') return 'text';
    const d = dtype.toLowerCase();
    switch (d) {
        case 'string': return 'text';
        case 'double': return 'decimal';
        case 'boolean': return 'boolen';
        case 'textarea': return 'richtext';
        case 'picklist':
        case 'multipicklist': return 'multipicklist'
        case 'combobox': return 'text';     // <- force text for picklists
        default: return d;
    }
};

const NOT_NAV_TARGET_HANDLERS = {
  RecordType: { dtype: 'text' },       // <- was picklist
  RecordTypeId: { dtype: 'text' },     // <- was picklist
  RecordTypeLocalization: null,
};



const FIND_NAME_FIELD = (namesArr) => {
    try {
        return Array.isArray(namesArr) && namesArr.length
            ? (namesArr.find(n => n === 'Name') ?? namesArr[0])
            : undefined;
    } catch(error) {
        getToastErrorMessage('findNameField()', 'sldsCardTiles.js', error);
    }
}

// Col action bools
const CELL_TEXT_STYLES = {
    clipText: 'slds-truncate',
    wrapText: 'slds-has-flexi-truncate', 
    clampText: 'slds-line-clamp'
};

const REMAP_SETTING_VALUES = (settingsArr, newVal, oldVal) => {
    return settingsArr.map(val => val === oldVal ? newVal : val);
};

const SAVABLE_CONFIGS = {

}


export default class SldsCardTiles extends NavigationMixin(LightningElement) {
    iconMap = ICON_MAP;
    _tooltipText = { label: '', value: '' };

    _noDataHelpText = 'Nothing to see here.'
    _isOpenRoad=true;

    // Detect Community Setting
    @api isCommunity = false;
    @api suppressSettings = false;
    @api viewName;
    

    // ================ Style Properties ================ \\
    // Tile style properties 
    @api 
    set tileBg(val) {
        this._tileBg = val;
        if (val) {
            this._applyVarsDirect('--vg-tile-bg', val);
        }
    }
    get tileBg() {
        return this._tileBg;
    }
    @api 
    set tileBorderStyle(val) {
        this._tileBorderStyle = val;
        if (val) {
            this._applyVarsDirect('--vg-tile-border-style', val);
        }
    }
    get tileBorderStyle() {
        return this._tileBorderStyle;
    }
    @api 
    set tileBorderRadius(val) {
        this._tileBorderRadius = val;
        if (val) {
            this._applyVarsDirect('--vg-tile-border-radius', val);
        }
    }
    get tileBorderRadius() {
        return this._tileBorderRadius;
    }
    @api 
    set tileLinkColor(val) {
        this._tileLinkColor = val;
        if (val) {
            this._applyVarsDirect('--vg-tile-link-color', val);
        }
    }
    get tileLinkColor() {
        return this._tileLinkColor;
    }
    // Card style properties 
    @api 
    set cardBg(val) {
        this._cardBg = val;
        if (val) {
            this._applyVarsDirect('--vg-card-bg', val);
        }
    }
    get cardBg() {
        return this._cardBg;
    }
    @api 
    set cardHeaderBg(val) {
        this._cardHeaderBg = val;
        if (val) {
            this._applyVarsDirect('--vg-card-header-bg', val);
        }
    }
    get cardHeaderBg() {
        return this._cardHeaderBg;
    }
    @api 
    set cardHeaderBorderStyle(val) {
        this._cardHeaderBorderStyle = val;
        if (val) {
            this._applyVarsDirect('--vg-card-header-border-style', val);
        }
    }
    get cardHeaderBorderStyle() {
        return this._cardHeaderBorderStyle;
    }
    @api 
    set cardShadow(val) {
        this._cardShadow = val;
        if (val) {
            this._applyVarsDirect('--vg-card-shadow', val);
        }
    }
    get cardShadow() {
        return this._cardShadow;
    }
    @api 
    set cardBorder(val) {
        this._cardBorder = val;
        if (val) {
            this._applyVarsDirect('--vg-card-border', val);
        }
    }
    get cardBorder() {
        return this._cardBorder;
    }
    // =================================================== \\

    

    _hideTooltip = false;

    // Actions available for each Tile within the card
    recordActions = [
        {label: 'Edit', value: 'Edit'},
        {label: 'Delete', value: 'Delete'}
    ]

    // Setting for the cards 
    settingsOptions = [
        {label: 'Tiles Per Row', value: 'tilesPerRow'},
        {label: 'Wrap Field Values', value: 'wrapFieldValues'},
        {label: 'Hide Tooltip', value: 'hideTooltip'}
    ];
    settingValues = ['clipFieldLabels', 'clipFieldValues', 'showTooltip'];

    // Confirm Deletion event with a modal 
    modalConfig;
    tilePerRowModal;
    _origTilesPerRow;
    
    iconConfig; // Icon for the Cards View 
    newButtonLabel;
    isLoading = false;

    localColumns = [];
    localRows = [];
    _cards = [];

    // Omit link on Main Card Title (i.e. <pluralLabel> (<cardAmount>))
    @api suppressHeaderLink = false;

    // Class for the amount of tiles per row 
    _tilesSizeCl = 'slds-p-horizontal_small slds-size_1-of-1 slds-medium-size_1-of-4';
    @api 
    set tilesPerRow(val) {
        this._tilesPerRow = val;
        if (val) {
            if (!Number.isNaN(val)) {
                const numberVal = Number(val);
                if (numberVal > 0 && numberVal <= 12) {
                    this._tilesSizeCl = `slds-p-horizontal_small slds-size_1-of-1 slds-medium-size_1-of-${numberVal}`
                }
            }
        }
    }
    get tilesPerRow() {
        return this._tilesPerRow || 4;
    }

    // Pre-configured values when "New" button is clicked
    @api newRecordVals;

    // Label for the Object
    _objectLabel;
    @api 
    set objectLabel(val) {
        this._objectLabel = val;
    }
    get objectLabel() {
        return this._objectLabel;
    }
    // Plural Label for the Object
    _pluralLabel;
    @api 
    set pluralLabel(val) {
        this._pluralLabel = val;
        this.updateNoDataMessage();
    }
    get pluralLabel() {
        return this._pluralLabel;
    }


    updateNoDataMessage() {
        if (this._pluralLabel) {
            this._noDataHelpText = `No ${this._pluralLabel}`;
            this._isOpenRoad = false;
        }
    }

    objectName;
    _objectInfos; // Will Store all Object Data for all Objects mentioned in the Columns
    _columns;
    @api // Columns for the table
    set columns(value) {
        this._columns = value;
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
    @api 
    set conditions (value) {
        this._conditions = value;
        if (!this._isInitLimit) this._isInitLimit = !!value?.limit;
        this._isRowsLimit = !!value?.limit;
        this._isConditionsDefined = value !== undefined;
        if (this._initDone) this.initializeTableQuery();
    } 
    get conditions() {
        return this._conditions || undefined;
    }


    @api sendRowsLength = false;
    @api sendRows = false;


    _initDone = false;
    _isRendered = false;
    _containerCl = '';
    _wiredRecordsResult;
    _wirePromiseResolve;
    _wirePromiseReject;
    _queryObjectName;
    _queryFieldApiNames;
    _queryConditions;

    get wiredObjectName() {
        return this._queryObjectName || undefined;
    }

    get wiredFieldApiNames() {
        return Array.isArray(this._queryFieldApiNames) && this._queryFieldApiNames.length
            ? this._queryFieldApiNames
            : undefined;
    }

    get wiredConditions() {
        return this._queryConditions ?? undefined;
    }

    @wire(fetchRecordsDynamicWithConditionCached, {
        objectName: '$wiredObjectName',
        fieldApiNames: '$wiredFieldApiNames',
        conditions: '$wiredConditions'
    })
    wiredCards(result) {
        this._wiredRecordsResult = result;

        const { data, error } = result;

        if (data) {
            this._cards = data;
            this.resolveWirePromise(data);
        } else if (error) {
            this.rejectWirePromise(error);
            this.showToast('Error in wiredCards() of sldsCardTiles.js: ', getErrorMessage(error), 'error');
        }
    }

    // Query records 
    renderedCallback() {
        try {
            // Only run after we know columns and objectName
            if (!this._initDone) {
                if (this._columns?.length) {
                    this.initializeTableQuery();
                }
            }
            
            if (!this._isRendered) {
                if (this.isCommunity) this._containerCl = 'community-config'; 
            }

        } catch (error) {
            getToastErrorMessage('renderedCallback()', 'sldsCardTiles.js', error);
        }
    }

    // Attach event listeners 
    connectedCallback() {
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
    }
    // Remove Event Listeners
    disconnectedCallback() {
        window.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    }

    // Track mouse move to display tooltip
    handleMouseMove(event) {
        const tooltip = this.template.querySelector('.pair-tooltip:hover, .pair:hover .pair-tooltip');
        if (tooltip) {
            tooltip.style.left = `${event.clientX + 10}px`;
            tooltip.style.top = `${event.clientY - 20}px`;
            tooltip.style.display = 'block';
        } else {
            this.template.querySelectorAll('.pair-tooltip').forEach(t => (t.style.display = 'none'));
        }
    }

    normalizeConditions(conditions) {
        if (!conditions) {
            return null;
        }

        return typeof conditions === 'string'
            ? conditions
            : buildWhereClause(conditions);
    }

    createWirePromise() {
        if (this._wirePromiseReject) {
            this._wirePromiseReject(new Error('Previous wired fetch was superseded by a newer request.'));
        }

        return new Promise((resolve, reject) => {
            this._wirePromiseResolve = resolve;
            this._wirePromiseReject = reject;
        });
    }

    resolveWirePromise(data) {
        if (this._wirePromiseResolve) {
            this._wirePromiseResolve(data);
            this._wirePromiseResolve = null;
            this._wirePromiseReject = null;
        }
    }

    rejectWirePromise(error) {
        if (this._wirePromiseReject) {
            this._wirePromiseReject(error);
            this._wirePromiseResolve = null;
            this._wirePromiseReject = null;
        }
    }

    async fetchCardsFromWire(objectName, fieldApiNames, conditions) {
        const pendingWire = this.createWirePromise();

        this._queryObjectName = objectName;
        this._queryFieldApiNames = Array.isArray(fieldApiNames) ? [...fieldApiNames] : null;
        this._queryConditions = this.normalizeConditions(conditions);

        return pendingWire;
    }


    // Initialize Records Array
    initializeTableQuery() {
        try {
            if (this._columns && this._columns.length) {
                const mainObjectName = this._columns.find(c => c?.field?.objectApiName)?.field?.objectApiName;

                if (!mainObjectName) return;

                this.objectName = mainObjectName; // Object API Name of Main Rows
                this._initDone = true;

                // Defer heavy work to avoid sync re-render churn
                Promise.resolve().then(async () => {
                    try {
                        this.isLoading = true;
                        await this.buildRowsAndColumns();
                    } catch (e) {
                        getToastErrorMessage('initializeTableQuery()/init', 'sldsCardTiles.js', e);
                    } finally {
                        this.isLoading = false;
                    }
                });
            }
        } catch(error) {
            this.showToast('Error in initializeTableQuery() of sldsCardTiles.js: ', getErrorMessage(error), 'error');
        }
    }
        
    // Get col infos of Object ---++ Query Main Rows
    async buildRowsAndColumns() {
        try {
            if (!this.objectName) return;

            const objInfosCmp = this.template.querySelector('c-object-infos-lwc');
            if (!objInfosCmp) return;

            const objMetas = await objInfosCmp.queryObjects([this.objectName]);

            if (!objMetas || !objMetas.size) return;

            // Add label if not configured by the user
            if (!this.objectLabel) this.objectLabel = objMetas.get(this.objectName)?.label 
                ?? getCleanMetaDataLabels(this.objectName);

            // Add Plural Label if not configured 
            if (!this._pluralLabel) {
                this._pluralLabel = objMetas.get(this.objectName)?.labelPlural;
                this.updateNoDataMessage();
            }

            this._objectInfos = objMetas;

            // 2) Enrich visible (non-dynamic) columns only; leave dynamic as virtual
            const enrichedCols = this.addMetaDataToColFields(this.objectName);

            // 3) Build SOQL field list (immutable; do not mutate any col/field constants)
            const mainInfo = this._objectInfos.get(this.objectName);
            const mainFieldsMap = mainInfo?.fields || {}; // map keyed by apiName

            // Base fields from visible, non-dynamic columns
            const baseFields = enrichedCols
                .filter(c => !c.isDynamic)
                .map(col => {
                    if (col.isReference && col.relationshipName && col.nameReference) {
                        return `${col.relationshipName}.${col.nameReference}`;
                    }
                    return col?.field?.fieldApiName || null;
                })
                .filter(Boolean);

            // Dynamic candidates: compute a parallel, enriched list WITHOUT mutating originals
            const dynQueryFields = [];

            const firstNameFieldOf = (refToInfos) => {
                if (!Array.isArray(refToInfos) || !refToInfos.length) return 'Name';
                const first = refToInfos[0];
                return Array.isArray(first?.nameFields) && first.nameFields.length
                    ? first.nameFields[0]
                    : 'Name';
            };


            // Build a new columns array with dynFields attached immutably
            const newColumns = enrichedCols.map(col => {
                if (!col.isDynamic) return col; // already enriched

                // Enrich each candidate into a plain object; collect fields to query
                const dynFields = (col.fields || []).map(f => {
                    const meta = mainFieldsMap[f.fieldApiName];
                    if (!meta) return { ...f }; // no extra info available

                    const isRef = meta.dataType === 'Reference';
                    const nameField = firstNameFieldOf(meta.referenceToInfos);
                    const relName = meta.relationshipName || null;
                    const dtype = TO_LOCAL_DTYPE(meta.dataType);

                    // Query pieces for this candidate (raw + name if reference)
                    dynQueryFields.push(f.fieldApiName);
                    if (isRef && relName && nameField) {
                        dynQueryFields.push(`${relName}.${nameField}`);
                    }

                    return {
                        ...f,
                        // enriched metadata for renderer/formatter
                        dtype,
                        isReference: isRef,
                        relationshipName: relName,
                        nameReference: nameField,
                        label: f.label || meta.label || getCleanMetaDataLabels(f.fieldApiName)
                    };
                });

                // Return a NEW column object carrying the enriched candidates
                return {
                    ...col,
                    dtype: col.dtype || 'reference',
                    isReference: true,
                    dynFields // <-- use these at render time; DO NOT mutate originals
                };
            });


            // Final deduped SOQL list
            const mainFieldsQuery = Array.from(new Set([...baseFields, ...dynQueryFields]));

            if (this.conditions === undefined) {
                this._cards = [];
            } else {
                this._cards = await this.fetchCardsFromWire(
                    this.objectName,
                    mainFieldsQuery,
                    this.conditions
                );
            }

            if (this.sendRows) {
                this.dispatchEvent(new CustomEvent('sendrows', { detail: this._cards }));
            }

            if (this.sendRowsLength) {
                this.dispatchEvent(new CustomEvent('rowslength', { detail: this._cards.length } ));
            }   

            this.iconConfig = this.handleIcon();

            // 6) Commit columns immutably and continue pipeline
            this._columns = newColumns;
            this.parseRowsAndColumns();

        } catch(error) {
            this.showToast('Error in buildRowsAndColumns() of sldsCardTiles.js: ', getErrorMessage(error), 'error');
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

            // -- Builder for main-object columns (incl. dynamic passthrough) --
            const buildMainObjCol = (colObj) => {
                try {
                    // Dynamic virtual column – don’t touch its fields list, just give it dtype/flags
                    if (colObj?.isDynamic) {
                        return {
                            ...colObj,
                            dtype: colObj.dtype || 'reference',
                            fieldName: colObj.fieldName || 'Related Part', // identity for header/sort
                            isReference: true
                        };
                    }

                    const fieldName = colObj?.field?.fieldApiName;
                    const isException = NON_NAV_TARGETS.has(fieldName);

                    if (!fieldName || (isException && !NOT_NAV_TARGET_HANDLERS[fieldName])) { 
                        return;
                    }

                    const fieldInfo = mainFieldsArr.find(mainF => mainF?.apiName === fieldName);
                    if (!fieldInfo) return colObj;

                    const referenceInfos = fieldInfo.referenceToInfos?.length
                        ? FIND_NAME_FIELD(fieldInfo.referenceToInfos)
                        : null;

                    // inside buildMainObjCol, right after you compute `dtype`
                    let dtype = isException
                        ? NOT_NAV_TARGET_HANDLERS[fieldName].dtype
                        : TO_LOCAL_DTYPE(fieldInfo?.dataType);

                    // force text for any residual picklist-y dtype
                    if (dtype === 'picklist') {
                        dtype = 'text';
                    }

                    const isMainObjName = (mainObjMeta?.nameFields || []).some(nm => nm === fieldName);

                    let newCol = {
                        ...colObj,
                        dtype,
                        fieldName,
                        isMainObjName,
                        isReference: fieldInfo?.dataType === 'Reference',
                        unique: !!fieldInfo?.unique,
                        label: colObj?.label ?? fieldInfo?.label ?? getCleanMetaDataLabels(fieldName),
                        updateable: !!fieldInfo?.updateable,
                        calculated: !!fieldInfo?.calculated,
                        nameReference: referenceInfos ? referenceInfos.nameFields[0] : null,
                        relatedObjectApiName: referenceInfos ? referenceInfos.apiName : null,
                        relationshipName: fieldInfo?.relationshipName ?? null
                    };
                    if (isException && dtype === 'picklist') {
                        return newCol;
                    }
                    return newCol;
                } catch (error) {
                    getToastErrorMessage('buildMainObjCol()', 'sldsCardTiles.js', error);
                }
            };

            // ——— Enrich core columns first (preserve your original order) ———
            const enrichedOrdered = this._columns
                .map(c => buildMainObjCol(c))
                .filter(Boolean);

            return enrichedOrdered;

        } catch (error) {
            this.showToast('Error in addMetaDataToColFields() of sldsCardTiles.js', getErrorMessage(error), 'error');
            return this._columns;
        }
    }

    // Format the rows such that the row's fields are in the same order as the columns ---++ Add custom Atrributes to the <columns> & <rows>
    parseRowsAndColumns() {
        try {
            if (this._cards && this._columns) {
                // Map the fields from <rows> so that that each <row.fields> is in the same order as the <column.fieldName>s
                const rowsObj = mapRowsToColumnsCards(this._cards, this._columns);
                this.localRows = rowsObj.rows;

                Promise.resolve().then(async () => { 
                    const linkedRows = await this.addPageRefs(this.localRows, this.objectName);
                    this.localRows = linkedRows;
                });

                // Map the columns to localColumns and add a 'colId' property
                this.localColumns = this._columns.map(col => {
                    // Check for "wrapText", "clipText", "clampText" in 'textStyle' property
                    const textStyle = isValidProperty('textStyle', col) 
                        && Object.keys(CELL_TEXT_STYLES).some(val => 
                            col.textStyle === val
                        )
                            ? col.textStyle 
                            : 'clipText';

                    return { ...col, colId: `${col.fieldName}-col`, textStyle: textStyle };
                });
            }
        } catch(error) {
            this.showToast('Error in parseRowsAndColumns() of sldsCardTiles.js: ', getErrorMessage(error), 'error');
        } finally {
            this.isDataLoaded = true;
        }
    }
    
    // Add links to each of the cards
    async addPageRefs(rows, objectApiName) {
        if (!rows || !rows.length) {
            return rows || [];
        }

        const pageRefs = rows.map(rec => ({
            type: 'standard__recordPage',
            attributes: {
                recordId: rec.Id,
                objectApiName,
                actionName: 'view'
            }
        }));

        const urls = await Promise.all(
            pageRefs.map(pr => this[NavigationMixin.GenerateUrl](pr))
        );

        return rows.map((rec, index) => ({
            ...rec,
            url: urls[index]
        }));
    }

    // Refresh Wired Rows
    @api async handleRefresh() {
        try {
            this.isLoading = true;

            if (this._isConditionsDefined) {
                if (this._wiredRecordsResult) {
                    await refreshApex(this._wiredRecordsResult);
                    this.parseRowsAndColumns();
                }
            } else {
                this.initializeTableQuery();
            }

            // Tell parent to refresh
            this.dispatchEvent(new CustomEvent('refresh', {
                detail: this.objectName,
                bubbles: true,
                composed: true
            }));

            if (this.sendRows) {
                // Send Apex query result to parent
                this.dispatchEvent(new CustomEvent('sendrows', { detail: this._cards } ));
            }
            if (this.sendRowsLength) {
                this.dispatchEvent(new CustomEvent('rowslength', { detail: this._cards.length } ));
            }

        } catch (e) {
            getToastErrorMessage('handleRefresh()', 'sldsCardTiles.js', e);
        } finally {
            this.isLoading = false;
        }
    }

    // Get the icon of ObjectApiName
    handleIcon() {
        // ------------- Object Icon ------------- \\
        const iconObj = iconByObjectApiName(this.objectName, null, true);
        const iconBaseConfig = {
            iconType: iconObj.iconName.split(':')[0], 
            iconName: iconObj.iconName.split(':')[1], 
            iconClass: iconObj?.iconClass ?? ''
        };

        const iconContainerClass = iconBaseConfig.iconName.includes('_') 
            ? iconBaseConfig.iconName.replaceAll('_', '-') 
            : iconBaseConfig.iconName;
        // --------------------------------------- \\ 

        return {
            container: `slds-icon_container slds-icon-${iconBaseConfig.iconType}-${iconContainerClass} ${iconBaseConfig.iconClass ?? ''}`,
            svg: `slds-icon ${iconBaseConfig.iconClass ?? ''}`,
            svgSmall: `slds-icon slds-icon_small ${iconBaseConfig.iconClass ?? ''}`,
            icon: this.iconMap[iconBaseConfig.iconType][iconBaseConfig.iconName]
        }
    }

    navigateToRecord(event) {
        event.preventDefault();

        try {
            const recordId = event.currentTarget?.dataset?.value;

            if (recordId) {
                this[NavigationMixin.GenerateUrl]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: recordId,
                        actionName: 'view'
                    }
                })
                .then((url) => {
                    try {
                        window.open(url, "_blank");
                    } catch(error) {
                        this.showToast('Error in handleRecordClickPromise() of sldsCardTiles.js: ', error);
                    }
                });
            }
        } catch(error) {
            getToastErrorMessage('navigateToRecord()', 'sldsCardTiles.js', error);
        }
    }

    // Create New Record of the objectApiName 
    async handleNewRecord() {
        try {
            const result = await NewRecordLayoutModal.open({
                size: 'small',
                description: 'Accessible description of modal\'s purpose',
                objectApiName: this.objectName, 
                objectLabel: this.objectLabel,
                predefinedFields: this.newRecordVals && this.newRecordVals.length 
                    ? this.newRecordVals
                    :  null
            });

            // Show Toast with Link to Record
            if (result?.result === 'success') {
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
                await this.handleRefresh();
            }

        }catch(error) {
            getToastErrorMessage('handleNewRecord', 'sldsTableAuto', error);
        }
    }


    // Handle Edit/Delete record actions 
    async handleRecordAction(message) {
        const msgDetail = message?.detail;
        if (msgDetail) {
            const recordId = msgDetail.id ?? msgDetail.Id;
            const action = msgDetail?.selection;

            if (recordId && action) {
                switch(action) {
                    // Handle Delete Record
                    case 'Delete':
                        this.modalConfig = {
                            columns: 1,
                            modalTitle: 'Delete Record',
                            modalMessage: 'Are you sure you want to delete this record?',
                            cancelButtonLabel: 'Cancel',
                            okayButtonLabel: 'Delete',
                            fields: null,
                            recordId
                        };
                        //console.log('Here is  modal config in handleRecordAction() of sldsCardTiles.js: ', JSON.stringify(this.modalConfig));
                        break;

                    // Handle Edit Record
                    case 'Edit':
                        const result = await NewRecordLayoutModal.open({
                            size: 'small',
                            description: 'Accessible description of modal\'s purpose',
                            objectApiName: this.objectName, 
                            objectLabel: this.objectLabel,
                            recordId: recordId
                        });

                        // Show Toast with Link to Record
                        if (result?.result === 'success') {
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
                            await this.handleRefresh();
                        }
                        break;
                        
                    // Do nothing if no action 
                    default:
                        return;
                }
            } 
        }
    }
    // Delete a record 
    async _handleDeleteAction(message) {
        let isRefresh = false;
        let toastMessage = null;
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
                }
            } 
            if (isRefresh) {
                await this.handleRefresh();
            }
        } catch (error) {
            this.showToast('Error in applyRowAction() of sldsTableAuto.js', getErrorMessage(error), 'error');
            isRefresh = false;
            toastMessage = null;

        } finally {
            this.isLoading = false;
            this.modalConfig = null;
            if (isRefresh && toastMessage) {
                this.showToast('Success', toastMessage, 'success');
            }
        }
    }

    // clipFieldLabels, wrapFieldValues, hideTooltip, tilesPerRow 
    // clipFieldLabel

    // Handle "Setting" button click (in header)
    handleSettingSelection(message) {
        const setting = message?.detail?.selection;

        switch(setting) {
            case 'wrapFieldLabels':
                this.template.querySelectorAll('.slds-item_label')
                    ?.forEach(item => item?.classList.replace('slds-truncate', 'slds-wrap'));
                this.settingValues = REMAP_SETTING_VALUES(this.settingValues, 'wrapFieldLabels', 'clipFieldLabels');
                this.settingsOptions = this.settingsOptions.map(opt => {
                    return opt.value === 'wrapFieldLabels' 
                        ? {label: 'Clip Field Labels', value: 'clipFieldLabels'}
                        : opt;
                });
                break;

            case 'wrapFieldValues':
                this.template.querySelectorAll('.slds-item_detail')
                    ?.forEach(item => item?.classList.replace('slds-truncate', 'slds-wrap'));
                this.settingValues = REMAP_SETTING_VALUES(this.settingValues, 'wrapFieldValues', 'clipFieldValues');
                this.settingsOptions = this.settingsOptions.map(opt => {
                    return opt.value === 'wrapFieldValues' 
                        ? {label: 'Clip Field Values', value: 'clipFieldValues'}
                        : opt;
                });
                break;

            case 'clipFieldValues':
                this.template.querySelectorAll('.slds-item_detail')
                    ?.forEach(item => item?.classList.replace('slds-wrap', 'slds-truncate'));
                this.settingValues = REMAP_SETTING_VALUES(this.settingValues, 'clipFieldValues', 'wrapFieldValues');
                this.settingsOptions = this.settingsOptions.map(opt => {
                    return opt.value === 'clipFieldValues' 
                        ? {label: 'Wrap Field Values', value: 'wrapFieldValues'}
                        : opt;
                });
                break;

            case 'clipFieldLabels':
                this.template.querySelectorAll('.slds-item_label')
                    ?.forEach(item => item?.classList.replace('slds-wrap', 'slds-truncate'));
                this.settingValues = REMAP_SETTING_VALUES(this.settingValues, 'clipFieldLabels', 'wrapFieldLabels');
                this.settingsOptions = this.settingsOptions.map(opt => {
                    return opt.value === 'clipFieldLabels' 
                        ? {label: 'Wrap Field Labels', value: 'wrapFieldLabels'}
                        : opt;
                });
                break;

            case 'showTooltip':
                this._hideTooltip = false;
                this.settingValues = REMAP_SETTING_VALUES(this.settingValues, 'hideTooltip', 'showTooltip');
                this.settingsOptions = this.settingsOptions.map(opt => {
                    return opt.value === 'showTooltip' 
                        ? {label: 'Hide Tooltip', value: 'hideTooltip'}
                        : opt;
                });
                break;

            case 'hideTooltip':
                this._hideTooltip = true;
                this.settingValues = REMAP_SETTING_VALUES(this.settingValues, 'showTooltip', 'hideTooltip');
                this.settingsOptions = this.settingsOptions.map(opt => {
                    return opt.value === 'hideTooltip' 
                        ? {label: 'Show Tooltip', value: 'showTooltip'}
                        : opt;
                });
                break;

            case 'tilesPerRow': 
                if (!this._origTilesPerRow) {
                    this._origTilesPerRow = this.tilesPerRow ?? 4;
                }
                this.tilePerRowModal = {
                    columns: 1,
                    cancelButtonLabel: 'Cancel',
                    okayButtonLabel: 'Ok',
                    modalMessage: `Select a value between 1 and 12.  Default is ${this._origTilesPerRow}.`,
                    fields: [
                        {
                            fieldName: 'tilesPerRow', 
                            value: this.tilesPerRow, 
                            label: 'Tile Amount', 
                            dtype: 'number',
                            min: 1, 
                            max: 12
                        }
                    ],
                };
                break;


            default:
                break;
        }
    }
    // Handle Modal response for tile amount
    handleTilesPerRows(message) {
        this.tilePerRowModal = null;
        const detail = message.detail;
        if (detail && detail?.tilesPerRow && detail?.tilesPerRow !== this.tilesPerRow) {
            this.tilesPerRow = Number(detail.tilesPerRow);
        }
    }

    // Call Modal on Row Action
    // ⬅️ DOM handler must be sync so it never returns a Promise
    handleDeleteAction(event) {
        this._handleDeleteAction(event).catch(e => {
            this.showToast('Error in handleRowAction() of sldsTableAuto.js', getErrorMessage(e), 'error');
        });
    }

    async loadAll(event) {
        event.preventDefault();
        this._originalLimit = this.conditions?.limit;

        if (this.conditions?.limit) {
            this.conditions = {
                ...this.conditions,
                limit: null
            };
        }
        this._isRowsLimit = false;
        await this.handleRefresh();
    }

    async limitRows(event) {
        event.preventDefault();

        if (this.conditions && this._originalLimit) {
            this._conditions = {
                ...this._conditions,
                limit: this._originalLimit
            };
        }
        this._isRowsLimit = true;
        await this.handleRefresh();
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
            header: { text: title }        
        };
    }

    // Tooltip handlers 
    showTooltip(event) {
        try {
            const tipEle = event.currentTarget;
            const tipVal = tipEle?.dataset?.value ?? null;
            this._tooltipText = {
                label: tipEle?.dataset?.label ?? '', 
                value: tipVal ?? 'N/A',
                isHtml: isHtml(tipVal)

            };

            const tooltip = this.template.querySelector('[data-el="tooltip"]');
            if (!tooltip) return;

            tooltip.classList.remove('slds-hide');
            tooltip.classList.add('slds-show');

            // Wait for DOM to update before measuring
            requestAnimationFrame(() => {
                const tile = tipEle.closest('.slds-card__tile, .slds-tile');
                if (!tile) return;

                const dt = tipEle.querySelector('dt');
                const dd = tipEle.querySelector('dd') || dt;

                const tileRect = tile.getBoundingClientRect();
                const dtRect   = (dt || dd).getBoundingClientRect();
                const ddRect   = (dd || dt).getBoundingClientRect();
                const tipRect  = tooltip.getBoundingClientRect();

                const vw = window.innerWidth;
                const vh = window.innerHeight;
                const pad = 8;         // viewport clamp padding
                const kiss = 16;        // how close to "kiss" the label column (px)

                // Default LEFT; flip RIGHT only if there isn't room on the left (i.e., first/leftmost tile)
                const mustShowRight = (dtRect.left - tipRect.width - kiss) < pad;

                // Horizontal position:
                //  - LEFT: align tooltip's right edge to (dt.left - kiss)
                //  - RIGHT: stick to tile's right edge (in front of dd)
                let left = mustShowRight
                    ? tileRect.right                                  // to the right of tile
                    : (dtRect.left - kiss - tipRect.width);           // "almost touching" the label column

                left = Math.max(pad, Math.min(left, vw - tipRect.width - pad));

                // Vertical anchor:
                //  - LEFT: center on dt
                //  - RIGHT: center on dd
                const a = mustShowRight ? ddRect : dtRect;
                let top = a.top + (a.height / 2) - (tipRect.height / 2);
                top = Math.max(pad, Math.min(top, vh - tipRect.height - pad));

                // Apply
                tooltip.style.position = 'fixed';
                tooltip.style.left = `${left}px`;
                tooltip.style.top  = `${top}px`;
                tooltip.style.zIndex = 9999;

                // Nubbin (points toward the tile)
                tooltip.classList.remove('slds-nubbin_left','slds-nubbin_right');
                tooltip.classList.add(mustShowRight ? 'slds-nubbin_left' : 'slds-nubbin_right');
            });



        } catch(error) {
            this.showToast('Error in showTooltip() of sldsCardTiles.js: ', getErrorMessage(error), 'error');
        }
    }
    hideTooltip() {
        try {
            const tooltip = this.template.querySelector('[data-el="tooltip"]');
            if (!tooltip) return;
            tooltip.classList.replace('slds-show', 'slds-hide');
        } catch(error) {
            this.showToast('Error in hideTololtip() of sldsCardTiles.js: ', getErrorMessage(error), 'error');
        }
    }   
    
    // Record-linked Toast 
    /* Show toast that has a link to a record.  IF NOT DONE YET ADD 👉 @track toastObj 
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