/**
 * sldsTile — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/newRecordLayoutModal, c/utils, c/utils.
 * - Salesforce/platform modules: lwc, lightning/navigation,
 * @salesforce/apex/DynamicSObjectController.deleteRecordsById.
 * - Template children (including conditional UI): c-slds-menu-popover-button, c-slds-modal, c-toast-lwc,
 * lightning-formatted-email.
 * - Bundle template: sldsTile.html; local styles: sldsTile.css. Salesforce SLDS styling is expected.
 * - Shared CSS modules: c/sharedStylesGlobal.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-tile') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - suppressDelete (suppress-delete): Suppresses the delete action.
 *   Example: child.suppressDelete = true;
 * - suppressMarginTop (suppress-margin-top): Suppresses the top margin.
 *   Example: child.suppressMarginTop = true;
 * - manualActions (manual-actions): Emits action instead of running built-in edit/delete handling.
 *   Example: child.manualActions = true;
 * - tileUrl (tile-url): Explicit URL for the tile title.
 *   Example: child.tileUrl = "/lightning/o/Account/list";
 * - valueWidthPct (value-width-pct): Percentage of field-row width reserved for values.
 *   Example: child.valueWidthPct = 70;
 * - suppressLi (suppress-li): Uses the tile wrapper variant without the usual list-item treatment.
 * Declared default: false.
 *   Example: child.suppressLi = true;
 * - actionSlot (action-slot): Enables custom content in the actionSlot slot.
 *   Example: child.actionSlot = true;
 * - suppressActions (suppress-actions): Hides the built-in tile action button.
 *   Example: child.suppressActions = true;
 * - suppressFieldLabel (suppress-field-label): Hides tile field labels. Declared default: false.
 *   Example: child.suppressFieldLabel = true;
 * - suppressLink (suppress-link): Displays the tile title without navigation. Declared default: false.
 *   Example: child.suppressLink = true;
 * - editableFields (editable-fields): API names allowed in the record edit modal.
 *   Example: child.editableFields = ['Name', 'Phone'];
 * - titleFontSize (title-font-size): CSS size of the tile title.
 *   Example: child.titleFontSize = "1rem";
 * - fontSize (font-size): CSS text size, including units.
 *   Example: child.fontSize = "0.875rem";
 * - border (border): CSS border declaration.
 *   Example: child.border = "1px solid #c9c9c9";
 * - borderRadius (border-radius): CSS corner radius, including units.
 *   Example: child.borderRadius = "0.25rem";
 * - backgroundColor (background-color): CSS background color.
 *   Example: child.backgroundColor = "#ffffff";
 * - icon (icon): SLDS category:name icon identifier.
 *   Example: child.icon = "standard:account";
 * - iconSize (icon-size): SLDS icon size.
 *   Example: child.iconSize = "small";
 * - fieldsPerRow (fields-per-row): Number of field/value pairs across a tile row.
 *   Example: child.fieldsPerRow = 2;
 * - objectApiName (object-api-name): Salesforce object API name used for metadata, navigation or record
 * operations.
 *   Example: child.objectApiName = "Account";
 * - fieldMeta (field-meta): Metadata used to enrich tile fields with labels/data types.
 *   Example: child.fieldMeta = [{ fieldApiName: 'Phone', label: 'Phone', dtype: 'text' }];
 * - record (record): Record object, UI API fields object or normalized field array to display.
 *   Example: child.record = { Name: 'Acme', Phone: '555-0100' };
 * - displayFields (display-fields): Ordered field API names to display in the tile.
 *   Example: child.displayFields = ['Phone'];
 * - fieldsAndColumns (fields-and-columns): Normalized tile data: { fields, columns }, with matching
 * fieldApiName values.
 *   Example: child.fieldsAndColumns = { fields: [{ fieldApiName: 'Name', value: 'Acme' }], columns: [{
 * fieldApiName: 'Name', label: 'Name', dtype: 'name' }] };
 * - recordName (record-name): Explicit tile title overriding the inferred record name.
 *   Example: child.recordName = "Acme";
 * - recordId (record-id): Salesforce record ID used for record context; supply a real ID from the parent.
 *   Example: child.recordId = this.recordId;
 * - tilesPerRow (tiles-per-row): Number of tiles across a row (use a supported SLDS fraction).
 *   Example: child.tilesPerRow = 2;
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-slds-tile object-api-name="Account" record={record}
 *         suppress-actions={enabled} suppress-link={enabled}></c-slds-tile>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     enabled = true;
 *     record = { Name: 'Acme', Phone: '555-0100', Industry: 'Manufacturing' };
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Use for one record summary with label/value fields. record accepts raw fields or { Id, fields } with
 * normalized/UI API field entries. fields-and-columns is an alternative for preconfigured column metadata;
 * display-fields limits/reorders the visible fields.
 * - Action variant: supply a real record Id, omit suppress-actions, and set manual-actions={enabled} with
 * onaction={handleAction}. handleAction receives { action, recordId } in event.detail. Without
 * manual-actions, built-in edit/delete performs record operations and emits refresh. Set
 * action-slot={enabled} and provide slot="actionSlot" for custom actions.
 * - Slots: actionSlot.
 */

import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import deleteRecordsById from '@salesforce/apex/DynamicSObjectController.deleteRecordsById';
import NewRecordLayoutModal from 'c/newRecordLayoutModal';

// Import navigation mixin helpers
import {openExternalUrl, addPageRefRecord, addPageRefsFieldsArr, IS_SF_ID} from 'c/utils'; 

// Import basic util helpers
import {iconMap as ICON_MAP, iconByObjectApiName, getErrorMessage, getCleanMetaDataLabels, iconPath, formatDtypeLabel} from 'c/utils';

let KEY_ID = 100;

/* IMPORTANT NOTES: 

    👉 When "suppressActions" public property is true, it removes the "Edit/Delete" actions button
        <c-slds-tile 
            suppress-actions="true"
        </c-slds-tile>

    👉 suppressFieldLabel - makes it so value of field takes up 100% of the avaialble space

    👉 If tile is in nested slds-card wrap in max-width container as shown below:

        ☑️ Quick Nested Slds Card Example: 
            <div class="slds-grid"> 
                <div> 
                    <c-slds-card> 
                        <div slot="cardBody">
                            <div class="slds-grid">
                                <div> 
                                    <c-slds-card is-nested="true"> 
                                        <ul class="slds-grid slds-wrap slds-grid_pull-padded"> 
                                            <!-- ⭐⭐⭐ MAX WIDTH CONTAINER ⭐⭐⭐ -->
                                            <div style="max-width: 100%;">
                                                <c-slds-tile
                                                    tiles-per-row="1"
                                                    object-api-name="Contact"
                                                    record={record}
                                                ></c-slds-tile>
                                            </div>
                                            <!-- ⭐⭐⭐ END MAX WIDTH CONTAINER ⭐⭐⭐ -->
                                        </ul>
                                    </c-slds-card> 
                                </div>  
                            </div> 
                        </div> 
                    </c-slds-card> 
                </div>
            </div>

        ☑️ FULL NESTED SLDS CARD EXAMPLE:
            <div class="slds-grid">
                <div class="slds-col slds-size_1-of-3">

                    <!-- **** Parent Card **** -->
                    <c-slds-card card-label="Parent Card">
                        <div class="slds-grid">
                            <div class="slds-col slds-size_1-of-2"> 

                                <!-- **** Nested Card **** -->
                                <c-slds-card card-label="Nested Card" is-nested="true">
                                    <div slot="cardBody">
                                        <ul class="slds-grid slds-wrap slds-grid_pull-padded slds-grid_vertical-stretch">
                                            <template for:each={records} for:item="record"> 

                                                <!-- ⭐⭐⭐ MAX WIDTH CONTAINER ⭐⭐⭐ -->
                                                <div key={gov.keyId} style="max-width: 100%;">
                                                    <c-slds-tile
                                                        tiles-per-row="1"
                                                        object-api-name="Contact"
                                                        record={record}
                                                    ></c-slds-tile>
                                                </div>
                                                <!-- ⭐⭐⭐ MAX WIDTH CONTAINER ⭐⭐⭐ -->

                                            </template>
                                        </ul>
                                    </div> 
                                </c-slds-card> 
                                <!-- **** End Nested Card **** -->

                            </div>  
                        </div>
                    </c-slds-card> 
                    <!-- **** End Parent Card **** -->

                </div>
            </div>

*/


/* Example Usage: 

    HTML:
        <c-slds-tile
            tiles-per-row="1"
            suppress-actions="true"   
            object-api-name="Contact"
            record={gov}
        ></c-slds-tile>

    Javascript:
        rec = {
            Id: '202020298'
            Name: 'James Patterson'
            fields: [
                {label: 'Title', displayValue: 'Vice President'},
                {label: 'Email', displayValue: 'patterson@gmail.com'},
                {label: 'Name', fieldApiName: 'Name', displayValue: 'John Redding', value: '1002929201'},
                {label: 'Id', fieldApiName: 'Id', displayValue: null, value: '1002929201'},
            ]
        }

*/

/* Public Properties
    1. tiles-per-row 
        - Controls the size of the tile 
        - 1-4 is recommended, depending on the size of the container 

    2. 

*/


// find column for id field
const IS_ID_COL = (col) => {
    return col?.dtype === 'id' || col?.fieldApiName.toLowerCase() === 'id';
};

const IS_NAME_COL = (col) => {
    return col?.dtype === 'name' || col?.fieldApiName === 'Name'
};


// Check for reference fields in the record
const HAS_LINKED_FIELDS =(fields) => {
    return fields?.some(f => typeof fVal === 'object' && rec?.Id && rec?.Name);
};

// Check if fields have fieldApiName / value / displayValue field properties


// If user sent object with no "fields" property  -->  add the 'fields' array && filter out "Id" and "Name"
const HANDLE_OBJECT_REC_FIELDS = (rec) => {
    return Object.entries(rec)
        .filter( ([key, _]) => key !== 'Id' && key !== 'id' && key !== 'Name')
        .map( ([key, val]) => ( {[key]: val} ));
};
// Handle link to record by looking for Name/Id
const HANDLE_OBJECT_REC_ID_NAME = (rec) => {
    const recordId = rec?.Id ?? rec?.id;
    const recordName = rec?.Name;
    
    return [recordId, recordName];
};

function handleDisplayFields(displayFields, cmp) {
    if (!displayFields?.length || !cmp._fields?.length) {
        return;
    }

    const newFields = displayFields.map(f => {
        if (typeof f === 'string') {
            // Handle array of strings display fields
            const match = cmp._fields.find(realF => realF.fieldApiName === f);
            if (match) {
                return match;
            } 
            return {
                fieldApiName: f,
                value: null,
                displayValue: '—',
                label: f?.label ?? getCleanMetaDataLabels(f),
                keyId: String(KEY_ID++)
            }
        } else if (typeof f === 'object' && f?.fieldApiName) {
            // Handle array of objects display fields
            const fieldApiName = f.fieldApiName;
            const match = cmp._fields.find(realF => realF.fieldApiName === f.fieldApiName);
            const dtype = f?.dtype ?? null;
            if (match) {
                return dtype 
                    ? {...match, dtype, [`is${dtype}`]: true}
                    : match;
            } 

            return {
                fieldApiName,
                value: dtype === 'boolean' ? false : null,
                displayValue: '—',
                label: f?.label ?? getCleanMetaDataLabels(f),
                keyId: String(KEY_ID++),
                dtype: dtype ?? 'text',
                [`is${dtype ?? 'text'}`]: true
            }
        }
    });

    cmp._fields = newFields;
}

const ICON_SIZES = ['xx-small', 'x-small', 'small', 'medium', 'large'];

function handleIconSize(icon, size=null) {
    if (!icon) return;
    if (!size || size === 'small' || !ICON_SIZES.some(sz => sz === size)) {
        return 'slds-icon_small';
    }
    if (size === 'medium') {
        return {
            ...icon,
            container: icon.container.replace('slds-icon_small', '')
        };
    }
    return {
        ...icon,
        svg: icon.svg.replace('slds-icon_small', `slds-icon_${size}`)
    };
}

function handleIconSizeCl(size=null) {
    if (!size || size === 'small' || !ICON_SIZES.some(sz => sz === size)) {
        return 'slds-icon_small';
    }
    if (size === 'medium') {
        return '';
    }
    return `slds-icon_${size}`;
}


export default class SldsTiles extends NavigationMixin(LightningElement) {
    _actionButtonCl = 'slds-shrink-none';
    _tileCl = 'slds-p-horizontal_small slds-size_1-of-1 slds-medium-size_1-of-3';
    modalConfig;
    
    recordActions = [
        {label: 'Edit', value: 'Edit'},
        {label: 'Delete', value: 'Delete'},
    ];

    @api 
    set suppressDelete(val) {
        this._suppressDelete = val;
        if (val) {
            this.recordActions = [
                {label: 'Edit', value: 'Edit'},
                {label: 'Delete', value: 'Delete', disabled: true}
            ];
        }
    }
    get suppressDelete() {
        return this._suppressDelete;
    }

    @api 
    set suppressMarginTop(val) {
        this._suppressMarginTop = val;
        if (val) {
            this._applyVarsDirect('--c-tile-margin-top', '0px');
        }
    }
    get suppressMarginTop() {
        return this._suppressMarginTop;
    }
    
    @api 
    set manualActions(val) {
        this._manualActions = val;
    }
    get manualActions() {
        return this._manualActions ?? false;
    }
    @api tileUrl;
    @api valueWidthPct;
    @api suppressLi = false;
    
    @api 
    set actionSlot(val) {
        this._actionSlot = val;
    }
    get actionSlot() {
        return this._actionSlot;
    }

    @api 
    set suppressActions(val) {
        if (val) {
            this._actionButtonCl = 'slds-shrink-none invisible';
        }
        this._suppressActions = val;
    } 
    get suppressActions() {
        return this._suppressActions ?? false;
    }
    
    @api suppressFieldLabel = false;
    @api suppressLink = false;

    iconMap = ICON_MAP;

    
    _tileName;
    _fields = [];
    _columns = [];

    @api 
    set editableFields(val) {
        if (val && Array.isArray(val) && val.length) {
            if ( val.every(item => typeof item === 'string') ) {
                this._editableFields = val;

            } else if( val.every(item => typeof item ===  'object' && (item.fieldApiName || item.fieldName)) ) {
                this._editableFields = val.map(item => item?.fieldApiName ?? item?.fieldName);
            }
        } else if(val && typeof val === 'string' && val.split(';')?.length) {
            this._editableFields = val.split(';');
        } else {
            this._editableFields = null;
        }
    }
    get editableFields() {
        return this._editableFields;
    }

    @api 
    set titleFontSize(value) {
        this._titleFontSize = value;
        if (value) {
            const numValue = Number(value.replace('px', '').replace('rem', '').replace('em', ''));
            if (!isNaN(numValue) && numValue > 0.9125) {
                this._applyVarsDirect('--tile-title_padding-bottom', '0.15rem');
            }
            this._applyVarsDirect('--tile-title_font-size', value);
        }
    } 
    get titleFontSize() {
        return this._titleFontSize;
    }

    @api 
    set fontSize(value) {
        this._fontSize = value;
        if (value) {
            this._applyVarsDirect('--c-detail-font-size', value);
        }
    } 
    get fontSize() {
        return this._fontSize;
    }

    @api 
    set border(val) {
        this._border = val;
        if (val) {
            //console.log('here is border in set vorder of sldsTile.js: ', val);
            this._applyVarsDirect('--vg-tile-border-style', val);
            this._applyVarsDirect('--vg-tile-padding', '0.5rem');
        }
    }
    get border() {
        return this._border;
    }
    @api 
    set borderRadius(val) {
        this._borderRadius = val;
        if (val) {
            this._applyVarsDirect('--vg-tile-border-radius', val);
        }
    }
    get borderRadius() {
        return this._borderRadius;
    }
    @api 
    set backgroundColor(val) {
        this._backgroundColor = val;
        if (val) {
            this._applyVarsDirect('--vg-tile-bg', val);
        } else {
            this._applyVarsDirect('--vg-tile-bg', 'var(--slds-g-color-neutral-base-100, #fff)');
        }
    }
    get backgroundColor() {
        return this._backgroundColor;
    }

    _icon;
    @api 
    set icon(val) {
        if (val) {
            this._icon = this.handleIcon(val);
        }
    }
    get icon() {
        return this._icon;
    }

    _iconSize = 'small';
    @api 
    set iconSize(val) {
        if (val && val !== 'small' && ICON_SIZES.some(sz => val === sz)) {
            this._iconSize = val;
            if (this._icon) {
                this._icon = handleIconSize(this._icon, val);
            }
        }
    }
    get iconSize() {
        return this._iconSize;
    }

    _fieldsPerRowCl = '';
    _gridCl = '"slds-grid slds-wrap slds-grid_pull-padded-medium"';
    @api 
    set fieldsPerRow(value) {
        this._fieldsPerRow = value;
        if (value && !isNaN(Number(value))) {
            this._gridCl = `slds-grid slds-wrap slds-grid_pull-padded-medium fields-${value}`;
            this._fieldsPerRowCl = `slds-col slds-size_1-of-${value} slds-p-horizontal_medium tile-field`;
        }
    } 
    get fieldsPerRow() {
        return this._fieldsPerRow;
    }

    // ======================= Required ======================= \\
    @api 
    set objectApiName(val) {
        this._objectApiName = val;
        this.handleRecordIdLink();
        if (val) {
            if (!this._icon) {
                const icon = this.handleIcon(val);
                this._icon = icon;
            }
        }
    }
    get objectApiName() {
        return this._objectApiName;
    }

    @api 
    set fieldMeta(value) {
        this._fieldMeta = value;
        if (value) {
            this.handleFieldMeta();
        }
    } 
    get fieldMeta() {
        return this._fieldMeta;
    }

    @api 
    set record(val) {
        try {
            if (val) {
                if (!Array.isArray(val) && val?.Id) {
                    this._recordId = val.Id;
                    this.handleRecordIdLink();
                }

                if (val.fields) {
                    const valFields = !Array.isArray(val.fields) && typeof val.fields === 'object' 
                        ? Object.entries(val.fields).map( ([fieldApiName, valsObj]) => ({fieldApiName, ...valsObj}) )
                        : val.fields;
                    
                    const nameField = valFields.find(f => f.fieldApiName === 'Name');
                    this._tileName = nameField?.displayValue;
                    this._fields = valFields   
                        ?.filter(f => f.fieldApiName !== 'Name' && f.fieldApiName !== 'Id')
                        ?.map(f => ({
                            ...f,
                            isemail: f?.fieldApiName?.toLowerCase()?.includes('email'),
                            displayValue: f?.displayValue ?? f?.value, 
                            value: f?.value ?? f?.displayValue, 
                            valueTitle: f?.displayValue ?? f?.value ?? `${f?.label ?? getCleanMetaDataLabels(f?.fieldApiName)} n/a`
                        }));

                    this.handleFieldMeta();
                
                } else if(typeof val === "object"){
                    const nameField = Object.keys(val).find(k => k === 'Name');
                    this._tileName = val?.[nameField];

                    this._fields = Object.entries(val)
                        ?.filter(([fieldApiName, _]) => fieldApiName !== 'Name' && fieldApiName !== 'Id' && fieldApiName !== 'objectApiName')
                        ?.map( ([fieldApiName, fieldVal]) => {
                            const isGetRecord =
                                fieldVal != null &&
                                typeof fieldVal === 'object' &&
                                'value' in fieldVal;


                            const cleanFieldVal = isGetRecord ? fieldVal.value : fieldVal;
                            const cleanDisplayVal = isGetRecord ? fieldVal.displayValue : fieldVal;
                            // sometimes getRecord() has null for value/displayValue
                            const validValVal = cleanDisplayVal ?? cleanFieldVal;

                            const isemail = fieldApiName?.toLowerCase().includes('email');
                                
                            return {
                                fieldApiName, 
                                isemail,
                                value: cleanFieldVal, 
                                displayValue: cleanDisplayVal ?? validValVal, 
                                label: getCleanMetaDataLabels(fieldApiName), 
                                valueTitle: validValVal ?? `${getCleanMetaDataLabels(fieldApiName)} n/a`
                            }
                        });
                    
                    this.handleFieldMeta();
                }
            }
            this._record = val;
            if (this.displayFields) {
                handleDisplayFields(this.displayFields, this);
            }
        } catch(error) {
            this.showToast('Error in set record() of sldsTile.js', getErrorMessage(error), 'error');
        }
    }
    get record() {
        return this._record;
    }

    @api // List of fieldApiNames
    set displayFields(val) {
        this._displayFields = val;
        if (val) {
            handleDisplayFields(val, this);
        }
    }
    get displayFields() {
        return this._displayFields;
    }

    @api // fields can be array or object 
    set fieldsAndColumns(val) {
        try {
            if (val?.fields && val?.columns) {
                KEY_ID = 100;

                // get the columns and fileds from the object
                const columns = val?.columns;
                const fields = val?.fields;

                if (columns.length && fields) {
                    // check if user sent fields ar array 
                    const isFieldsArr = Array.isArray(fields);

                    // find the id and name field
                    const idColIdx = columns.findIndex(col => IS_ID_COL(col));
                    const nameColIdx = columns.findIndex(col => IS_NAME_COL(col));

                    // Get id/name values and filter them out from columns
                    const idCol = columns[idColIdx];
                    const nameCol = columns[nameColIdx];

                    // Get the record name and id
                    if (idCol && idCol.fieldApiName) {
                        this._recordId = fields[idCol.mapKey];
                    }
                    if (nameCol && nameCol.fieldApiName) {
                        this._tileName = fields[nameCol.mapKey];
                    }

                    let filteredColumns = columns.filter( (_, index) => index !== idColIdx && index !== nameColIdx);

                    
                    // Filter out columns if fields does not have 
                    filteredColumns = filteredColumns.filter(col => fields.hasOwnProperty(col?.mapKey) || fields.hasOwnProperty(col.fieldApiName)); 
                    this._fields = filteredColumns.map(col => {
                        // Get the property the contains the field's value
                        const fieldKey = col.mapKey ?? col.fieldApiName;
                        if (!fieldKey) return null;
                        // Get fieldVal
                        const fieldVal = isFieldsArr 
                            ? fields.find(f => f.fieldApiName === fieldKey)?.value ?? fields.find(f => f.fieldApiName === fieldKey)?.displayValue
                            : fields[fieldKey];

                        // check for value / display value functions in the column
                        const valueFn = col.valueFn && typeof col.valueFn === 'function' ? col.valueFn : null;
                        const displayValueFn = col.displayValueFn && typeof col.displayValueFn === 'function' ? col.displayValueFn : null;

                        // Get all properties for field
                        const value = valueFn ? valueFn(fieldVal) : fieldVal;
                        const displayValue = displayValueFn ? displayValueFn(fieldVal) : fieldVal;
                        const label = col.label ?? getCleanMetaDataLabels(col.fieldApiName);
                        const fieldApiName = col.fieldApiName;
                        const dtype = col.dtype ?? 'text';
                        const keyId = KEY_ID++;

                        const field = {
                            label,
                            fieldApiName,
                            value,
                            displayValue,
                            dtype, [`is${dtype}`]: true, 
                            keyId, 
                            valueTitle: displayValue ?? value ?? `${label ?? getCleanMetaDataLabels(fieldApiName)} n/a`
                        };
                        if (col.objectApiName) field.objectApiName = col.objectApiName;
                        
                        return field;
                    
                    }).filter(Boolean);

                    if (this._fields.some(f => f.dtype === 'reference')) {

                        const original = this._fields;

                        Promise.resolve().then(async () => { 
                            const linkedRows = await addPageRefsFieldsArr(original, this);
                            this._fields = linkedRows;
                        });
                    }
                }

                this.handleRecordIdLink();
        
            }

            this._fieldsAndColumns = val;
        } catch(error) {
            this.showToast('Error in set fieldsAndColumns() of sldsTile.js: ', getErrorMessage(error), 'error');
        }
    }
    get fieldsAndColumns() {
        return this._fieldsAndColumns
    }
    // ========================================================= \\

    @api 
    set recordName(value) {
        this._recordName = value;
        if (value) {
            this._tileName = value;
        }
        //console.log('here is recordName in sldsTile.js: ', this._recordName);
    } 
    get recordName() {
        return this._recordName;
    }

    _recordId;
    @api // Link to record 
    set recordId(val) {
        this._recordId = val;
        if (val) this.handleRecordIdLink();
    } 
    get recordId() {
        return this._recordId;
    }

    @api 
    set tilesPerRow(val) {
        if (val) {
            this._tileCl = `slds-p-horizontal_small slds-size_1-of-1 slds-medium-size_1-of-${val}`
        }
        this._tilesPerRow = val;
    }
    get tilesPerRow() {
        return this._tilesPerRow;
    }   

    _inited = false;
    _rendered = false;
    renderedCallback() {
        this._applyVars();
    }

    // Add dtype to fields
    handleFieldMeta() {
        try {
            if (!this._fields?.length || !this.fieldMeta?.length) return;
            const allFieldApiNames = new Set(this.fieldMeta.map(d => d.fieldApiName));

            if (this.fieldMeta.some(fMeta => this._fields.find(f => f.fieldApiName === fMeta.fieldApiName))) {

                const missingFieldMeta = this._fields
                    .filter(f => !allFieldApiNames.has(f.fieldApiName))
                    ?.map(f => ({label: f.label, fieldApiName: f.fieldApiName}))

                
                const allFieldsMeta = [...this.fieldMeta, ...missingFieldMeta];

                this._fields = allFieldsMeta.map(fMeta => {
                    const matchedF = this._fields.find(f => f.fieldApiName === fMeta.fieldApiName);
                    if (!matchedF) return null;
                    if (
                        !allFieldApiNames?.has(matchedF.fieldApiName) || 
                        (!fMeta?.dtype && !fMeta?.label)
                    ) {
                        return matchedF;
                    }
                    
                    const dtype = fMeta?.dtype;
                    const label = fMeta?.label ?? matchedF?.label;
                    const crntValue = matchedF?.value ?? matchedF?.displayValue;

                    const displayValue = dtype && crntValue 
                        ? formatDtypeLabel(crntValue, null, dtype) 
                        : matchedF?.displayValue ?? matchedF?.value;

                    return {
                        ...matchedF, 
                        dtype: dtype ?? matchedF.dtype ?? 'text', 
                        displayValue,
                        label
                    }
                }).filter(Boolean);
            }
        } catch(error) {
            this.showToast('Error in handleFieldMeta() of sldsTile.js: ', getErrorMessage(error), 'error');
        }
    }

    // Get the SOjbect Icon
    handleIcon(objectApiName) {
        try {
            // ------------- Object Icon ------------- \\
            const iconObj = objectApiName.includes(':') ? iconPath(objectApiName, true)
                : iconByObjectApiName(objectApiName, null, true);
            const iconBaseConfig = {
                iconType: iconObj.iconName.split(':')[0], 
                iconName: iconObj.iconName.split(':')[1], 
                iconClass: iconObj?.iconClass ?? ''
            };

            const iconContainerClass = iconBaseConfig.iconName.includes('_') 
                ? iconBaseConfig.iconName.replaceAll('_', '-') 
                : iconBaseConfig.iconName;
            // --------------------------------------- \\ 
            const sizeCl = handleIconSizeCl(this._iconSize);
            return {
                container: `slds-icon_container slds-icon-${iconBaseConfig.iconType}-${iconContainerClass} ${iconBaseConfig.iconClass ?? ''}`,
                svg: `slds-icon ${sizeCl} ${iconBaseConfig.iconClass ?? ''}`,
                icon: ICON_MAP[iconBaseConfig.iconType][iconBaseConfig.iconName]
            }
        } catch(error) {
            this.showToast('Error in handleIcon() of sldsTile.js: ', getErrorMessage(error), 'error');
        }
    }

    // Open External url on click
    handleExternalClick(event) {
        const link = event?.currentTarget?.dataset?.value;
        if (link) {
            openExternalUrl(link, this);
        }
    }

    // Handle Edit/Delete record actions 
    async handleRecordAction(message) {
        const msgDetail = message?.detail;
        if (msgDetail) {
            const recordId = this._recordId;
            const action = msgDetail?.selection;


            if (this.manualActions) {
                this.dispatchEvent(new CustomEvent('action', 
                    { detail: {action, recordId} } 
                ));
                return;
            }
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
                        break;

                    // Handle Edit Record
                    case 'Edit':
                        const result = await NewRecordLayoutModal.open({
                            size: 'small',
                            description: 'Accessible description of modal\'s purpose',
                            objectApiName: this.objectApiName, 
                            objectLabel: getCleanMetaDataLabels(this.objectApiName),
                            recordId: recordId,
                            fields: this.editableFields?.length ? this.editableFields : null 
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
                            this.dispatchEvent(new CustomEvent('refresh', { detail: '' } ));
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
                    await deleteRecordsById({ recordIds: [recordId], objectApiName: this.objectApiName });
                    toastMessage = 'Record Successfully Deleted';
                    isRefresh = true;
                }
            } 
        } catch (error) {
            this.showToast('Error in applyRowAction() of sldsTableAuto.js', getErrorMessage(error), 'error');
            isRefresh = false;
            toastMessage = null;

        } finally {
            this.isLoading = false;
            this.modalConfig = null;
            if (isRefresh) {
                this.dispatchEvent(new CustomEvent('toast', { 
                    detail: {
                        variant: 'success', 
                        message: '',
                        title: `${getCleanMetaDataLabels(this.objectApiName)} "${this._tileName}" successfully was deleted`    
                    } 
                }));
                this.dispatchEvent(new CustomEvent('refresh', { detail: '' } ));
            }
        }
    }

    handleRecordIdLink() {
        if (this.suppressLink) return;
        if ((!this.objectApiName || !this._recordId)) return;
        if (!this._tileUrl) {
            const singleObjArr = [ {Id: this._recordId, objectApiName: this.objectApiName} ];
            Promise.resolve().then(async () => { 
                this._tileUrl = await addPageRefRecord(singleObjArr, this);
            });
        }
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


    // Call this function in renderedCallback  --> e.g. renderedCallback() {this.applyVars();}
    _stylesApplied = false;
    // Apply Styles to the host
    _applyVars() {
        if (this._stylesApplied) return;
        const el = this.template.host; // or a wrapper: this.template.querySelector('.root')

        if (this.valueWidthPct && this.valueWidthPct.endsWith('%')) {
            el.style.setProperty('--item-detail-width', this.valueWidthPct);
        }

        if (this.suppressFieldLabel) el.style.setProperty('--item-detail-width',  '100%');
        
        this._stylesApplied = true;
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

        // Get Host elements
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