/**
 * sldsCardTable — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/newRecordLayoutModal, c/utils, c/utils.
 * - Salesforce/platform modules: lwc, lightning/navigation,
 * @salesforce/apex/DynamicSObjectController.deleteRecordsById,
 * @salesforce/apex/DynamicSObjectController.resolveEntityPrefixes.
 * - Template children (including conditional UI): c-slds-menu-popover-button, c-slds-modal, c-toast-lwc,
 * c-tooltip-button, lightning-spinner.
 * - Bundle template: sldsCardTable.html; local styles: sldsCardTable.css. Salesforce SLDS styling is
 * expected.
 * - Shared CSS modules: c/sharedStylesGlobal.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-card-table') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - suppressRowActions (suppress-row-actions): Suppresses the row action menus. Declared default: false.
 *   Example: child.suppressRowActions = true;
 * - isBare (is-bare): Uses a bare table layout.
 *   Example: child.isBare = true;
 * - columnsBg (columns-bg): CSS column header background.
 *   Example: child.columnsBg = "#f3f3f3";
 * - borderRadius (border-radius): CSS corner radius, including units.
 *   Example: child.borderRadius = "0.25rem";
 * - fontSize (font-size): CSS text size, including units.
 *   Example: child.fontSize = "0.875rem";
 * - customRowButton (custom-row-button): Custom row action with icon, label and optional
 * tooltipFieldApiName.
 *   Example: child.customRowButton = { icon: 'utility:preview', label: 'Preview' };
 * - parentId (parent-id): Compatibility property: salesforce record ID used for record context; supply a
 * real ID from the parent; currently stored/exposed but not consumed by this implementation.
 *   Example: child.parentId = this.recordId;
 * - objectLabel (object-label): Singular object label displayed in headings/messages.
 *   Example: child.objectLabel = "Account";
 * - objectApiName (object-api-name): Salesforce object API name used for metadata, navigation or record
 * operations.
 *   Example: child.objectApiName = "Account";
 * - columns (columns): Column descriptors with fieldName/fieldApiName, label and dtype; schema-driven
 * components instead require field references.
 *   Example: child.columns = [{ fieldName: 'Name', fieldApiName: 'Name', label: 'Name', dtype: 'text' }];
 * - applyAllFields (apply-all-fields): Fields available for applying edits to multiple records. Declared
 * default: [].
 *   Example: child.applyAllFields = [{ fieldApiName: 'Name', label: 'Name' }];
 * - records (records): Record objects or normalized { Id, fields } rows matched by column fieldApiName.
 *   Example: child.records = [{ Id: 'row-1', Name: 'Acme' }];
 * - rowActions (row-actions): Row action option array with label and value.
 *   Example: child.rowActions = [{ label: 'Edit', value: 'edit' }];
 * - editableFields (editable-fields): API names allowed in the record edit modal.
 *   Example: child.editableFields = ['Name', 'Phone'];
 * - columnsBorderBottom (columns-border-bottom): Adds a bottom border beneath column headings.
 *   Example: child.columnsBorderBottom = true;
 * - rowHover (row-hover): Enables row-hover highlighting.
 *   Example: child.rowHover = true;
 * - colBorders (col-borders): Adds vertical column borders.
 *   Example: child.colBorders = true;
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-slds-card-table object-api-name="Account" columns={columns}
 *         records={records} suppress-row-actions={enabled}></c-slds-card-table>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     enabled = true;
 *     columns = [{ fieldApiName: 'Name', label: 'Account', dtype: 'text' },
 *         { fieldApiName: 'Phone', label: 'Phone', dtype: 'text' }];
 *     records = [{ Id: 'row-1', Name: 'Acme', Phone: '555-0100' }];
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Use for a compact table inside a card with records supplied by the parent. Example IDs are
 * display-only; use real Salesforce IDs before enabling edit/delete or record navigation. columns use
 * fieldApiName rather than lightning-datatable's type contract.
 * - Action variant: omit suppress-row-actions and provide editable-fields={editableFields}, with
 * editableFields = ['Name', 'Phone']. Listen for refresh to reload parent data after changes.
 * custom-row-button={customButton}, where customButton = { icon: 'utility:preview', label: 'Preview' },
 * emits customrowbutton.detail containing the record ID.
 */

import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import deleteRecordsById from '@salesforce/apex/DynamicSObjectController.deleteRecordsById';
import NewRecordLayoutModal from 'c/newRecordLayoutModal';
import resolveEntityPrefixes from '@salesforce/apex/DynamicSObjectController.resolveEntityPrefixes';

// Import navigation mixin helpers
import {openExternalUrl} from 'c/utils'; 

// Import basic util helpers
import {iconMap as ICON_MAP, iconByObjectApiName, getErrorMessage, getCleanMetaDataLabels, iconPath, formatDtypeLabel, addPageRefsFieldsArr} from 'c/utils';



let KEY_ID = 100;

// find column for id field
const IS_ID_COL = (col) => {
    return col?.dtype === 'id' || col?.fieldApiName?.toLowerCase() === 'Id';
};
// Check if columns is name column
const IS_NAME_COL = (col) => {
    return col?.dtype === 'name' || col?.fieldApiName === 'Name'
};


// Get the label for the tooltip of the custom row actions button
function handleRecordTooltips(label, tooltipFieldApiName, records) {
    if (
        records?.length && 
        records.some(r => r?.fields?.length) && 
        (tooltipFieldApiName && label)
    ) {
        return records.map(rec => {
            const matchedField = rec?.fields?.find(f => 
                f?.fieldApiName === tooltipFieldApiName
            );
            const displayValue = matchedField?.displayValue ?? matchedField?.value;
            const tooltipLabel = displayValue
                ? `${label}: ${displayValue}`
                : label;
            
            return {
                ...rec,
                customButtonLabel: tooltipLabel,
                tooltipLabel
            };
        })
    }

    return records?.map(rec => ({
        ...rec,
        customButtonLabel: rec?.customButtonLabel ?? label,
        tooltipLabel: rec?.tooltipLabel ?? label
    })) ?? records;
}

export default class SldsCardTable extends NavigationMixin(LightningElement) {
    iconMap = ICON_MAP;
    _isLoading =  false;

    _tableCl = 'slds-table slds-table_cell-buffer slds-no-row-hover slds-table_bordered slds-table_fixed-layout';

    _rowActionCl = {
        button: 'slds-button slds-button_icon slds-button_icon-border-filled slds-button_icon-x-small',
        icon: 'slds-button__icon slds-button__icon_hint slds-button__icon_x-small',
        iconHref: this.iconMap.utility.down
    };
    @api suppressRowActions = false;

    @api 
    set isBare(val) {
        this._isBare = val;
        const borderBottomCl = this.columnsBorderBottom 
            ? 'border-bottom-bare-table'
            : '';

        this._tableCl = val 
            ? `slds-table slds-table_cell-buffer ${borderBottomCl}`
            : 'slds-table slds-table_cell-buffer slds-no-row-hover slds-table_bordered slds-table_fixed-layout';

        if (val) {
            this._rowActionCl = {
                button: 'slds-button slds-button_icon',
                icon: 'slds-button__icon slds-button__icon_hint slds-button__small',
                iconHref: this.iconMap.utility.chevrondown
            }
        } else {
            this._rowActionCl = {
                button: 'slds-button slds-button_icon slds-button_icon-border-filled slds-button_icon-x-small',
                icon: 'slds-button__icon slds-button__icon_hint slds-button__icon_x-small',
                iconHref: this.iconMap.utility.down
            };
        }
    }
    get isBare() {
        return this._isBare;
    }

    @api 
    set columnsBg(val) {
        this._columnsBg = val;
        if (val) {
            this._applyVarsDirect('--columns-bg', val);
        }

    }
    get columnsBg() {
        return this._columnsBg;
    }

    @api 
    set borderRadius(val) {
        this._borderRadius = val;
        if (val) {
            this._applyVarsDirect('--border-radius', val);
        }
    }
    get borderRadius() {
        return this._borderRadius;
    }
    @api 
    set fontSize(val) {
        this._fontSize = val;
        if (val) {
            this._applyVarsDirect('--font-size', val);
        }
    }
    get fontSize() {
        return this._fontSize;
    }


    @api // Add custom icon button before the start of the rows in <tbody>
    set customRowButton(val) {
        this._customRowButton = val;
        if (val) {
            if (val?.icon && val.icon.split(':')?.length === 2) {
                const [category, iconName] = val.icon.split(':');
                const label = val.label;

                this._customRowButton = {
                    icon: this.iconMap[category][iconName],
                    label
                };
            }
        }
    }
    get customRowButton() {
        return this._customRowButton;
    }


    @api parentId;
    @api objectLabel;
    @api 
    set objectApiName(val) {
        this._objectApiName = val
        //if (val) {
        //    if (!this._icon) {
        //        const icon = this.handleIcon(val);
        //        this._icon = icon;
        //    }
        //}
    }
    get objectApiName() {
        return this._objectApiName;
    }

    _columns = [];
    @api 
    set columns(value) {
        this._columns = value;
        this.parseRowsAndColumns();
    } 
    get columns() {
        return this._columns;
    }

    @api applyAllFields = [];
    
    _records = [];
    @api 
    set records(value) {
        this._records = value?.map(rec => rec);
        if (value?.length) {
            this._allRecordIds = value?.map(rec => {
                if (rec?.Id) {
                    return rec.Id;
                } else {
                    const idField = rec?.fields?.length && rec?.fields.some(f => f?.Id || f?.fieldApiName === 'Id');
                    if (idField) {
                        return;
                    }
                }
            })
        }
        this.parseRowsAndColumns();
    } 
    get records() {
        return this._records;
    }

    _rowActions = [{label: 'Edit', value: 'edit'}, {label: 'Delete', value: 'delete'}];
    @api // Actions for the row-action buttons
    set rowActions(value) {
        if (value) {
            if (typeof value === 'string' && value.includes(';')) {
                const rowActions = value.split(';');
                this._rowActions = rowActions.map(action => ({label: getCleanMetaDataLabels(action.trim()), value: action.trim()}));
            } else if (Array.isArray(value)) {
                const isArrOfObj = value.every(v => typeof v === 'object' && v.label && v.value);
                if (isArrOfObj) {this._rowActions = value}
                else if(value.every(v => typeof v === 'string')) {
                    this._rowActions = value.map(v => ({label: v, value: v}))
                }
            }
        } 
    }
    get rowActions() {
        return this._rowActions?.length ?? [{label: 'Edit', value: 'edit'}, {label: 'Delete', value: 'delete'}]
    }
    

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

    @api // Use this if isBare="true" and you still want a bottom for the table
    set columnsBorderBottom(val) {
        this._columnsBorderBottom = val;
        if (val && !this._tableCl.includes('border-bottom-bare-table')) {
            this._tableCl = `${this._tableCl} border-bottom-bare-table`
        }
    }
    get columnsBorderBottom() {
        return this._columnsBorderBottom;
    }

    // Add hover to rows
    @api 
    set rowHover(value) {
        this._rowHover = value;
        if (value) {
            this._tableCl = this._tableCl.replace('slds-no-row-hover', '');
        }
    } 
    get rowHover() {
        return this._rowHover;
    }
    // Add border separation between columns
    @api 
    set colBorders(value) {
        this._colBorders = value;
        if (value) {
            this._tableCl = `${this._tableCl} slds-table_col-bordered`;
        }
    } 
    get colBorders() {
        return this._colBorders;
    }
    

    _isInited = false;
    modalConfig;


    // Get all object api names by row
    _entityPrefixMap;
    _allRecordIds = undefined;
    _wiredPrefixResult;
    @wire(resolveEntityPrefixes, {recordIds: '$_allRecordIds'})
    wiredEntityPrefixes(result) {
        this._wiredPrefixResult = result;
        const { data, error } = result;
        if (data) {
            // do something
            this._entityPrefixMap = data;
        } else if (error) {
            // Show Toast
            this.showToast('Error  in wiredEntityPrefixes() of sldsCardTable.js: ', getErrorMessage(error), 'error');
        }
    }
    // return object api name by recordId
    getEntityPrefixById(recordId) {
        if (!recordId) return null;
        if (!this._entityPrefixMap) return this.objectApiName;
        const entityPrefix = recordId.slice(0, 3);
        const objectApiName = this._entityPrefixMap?.[entityPrefix];
        return objectApiName ?? this.objectApiName;
    }

    // Map the fields to the columns 
    parseRowsAndColumns() {
        try {
            if (!this._columns.length || !this._records.length) return;

            KEY_ID = 100;

            const allRecordIds = [];
                
            const idColIndex = this._columns.findIndex(col => IS_ID_COL(col));
            if (idColIndex !== -1) {
                this._columns = this._columns.filter((_, index) => index !== idColIndex);
            }

            this._columns = this._columns.map(col => ({ ...col, keyId: KEY_ID++ }));

            const origRecords = this._records;

            this._records = this._records.map(rec => {
                const fields = rec?.fields ?? rec;
                const isFieldsArr = Array.isArray(fields);

                let tooltipLabel;

                const recFields = this._columns.map(col => {
                    const fieldCol = col.isDynamic
                        ? col.fields.find(dynCol => rec[dynCol.mapKey ?? dynCol.fieldApiName]) ?? null
                        : col;

                    if (!fieldCol) {
                        return {
                            value: null,
                            displayValue: null,
                            label: col.label,
                            fieldApiName: null,
                            keyId: KEY_ID++,
                            dtype: 'text'
                        };
                    }

                    const fieldKey = fieldCol.mapKey ?? fieldCol.fieldApiName;

                    if (!fieldKey) {
                        return {
                            value: null,
                            displayValue: null,
                            label: fieldCol.label,
                            fieldApiName: fieldCol.fieldApiName ?? null,
                            keyId: KEY_ID++,
                            dtype: fieldCol.dtype ?? 'text'
                        };
                    }

                    const fieldFromArr = isFieldsArr
                        ? fields.find(f => f.fieldApiName === fieldKey)
                        : null;

                    const fieldVal = isFieldsArr
                        ? (fieldFromArr?.value ?? fieldFromArr?.displayValue)
                        : fields[fieldKey];

                    const dtype = fieldCol.dtype ?? 'text';

                    const valueFn = typeof fieldCol.valueFn === 'function' ? fieldCol.valueFn : null;
                    const displayValueFn = typeof fieldCol.displayValueFn === 'function' ? fieldCol.displayValueFn : null;
                    //formatDtypeLabel(obj, accessor=null, dtype=null, colObj=null)
                    const value = valueFn ? valueFn(rec) : fieldVal;

                    const displayValue = displayValueFn ? displayValueFn(rec) 
                        : fieldVal ? formatDtypeLabel(fieldVal, null, dtype, null)
                        : '—';                    

                    const label = col.label ?? fieldCol.label ?? getCleanMetaDataLabels(fieldCol.fieldApiName);

                    const fieldApiName = fieldCol.fieldApiName;
                    const keyId = KEY_ID++;

                    const field = {
                        label,
                        fieldApiName,
                        value,
                        displayValue,
                        dtype,
                        [`is${dtype}`]: true,
                        keyId
                    };
                    if (fieldCol.objectApiName) {
                        field.objectApiName = typeof fieldCol.objectApiName === 'function'
                            ? fieldCol.objectApiName(rec)
                            : fieldCol.objectApiName;
                    }
                    if (fieldCol.textCl) {
                        const textClProp = fieldCol.textCl;
                        const textCl = typeof textClProp === 'function'
                            ? textClProp(rec) 
                            : typeof textClProp === 'string' ? textClProp
                            : '';

                        field.textCl = !!textCl && typeof textCl === 'string'
                            ? `${textCl} slds-truncate` 
                            : 'slds-truncate';
                    }
                    if (fieldCol.badgeLabel) {
                        const badgeProp = fieldCol.badgeLabel;
                        
                        if (typeof badgeProp !== 'function' && typeof badgeProp === 'object') {
                            const isRecAndRecs = badgeProp.params === 'all';
                            const fn = badgeProp.fn;
                            if (fn && typeof fn === 'function') {
                                const badgeLabel = isRecAndRecs
                                    ? fn(origRecords, rec)
                                    : fn(rec);

                                if (badgeLabel) {
                                    field.badgeLabel = badgeLabel;
                                }
                            }
                        } else {
                            const badgeLabel = typeof badgeProp === 'function' ? badgeProp(rec) 
                                : typeof badgeProp === 'string' ? badgeProp
                                : '';

                            if (!!badgeLabel && typeof badgeLabel === 'string') {
                                field.badgeLabel = badgeLabel;
                            }
                        }
                    }

                    if (fieldCol.tooltipLabel) {
                        const toolTipConfig = fieldCol.tooltipLabel;
                        if (typeof toolTipConfig === 'function') {
                            const toolTipResult = toolTipConfig(rec);
                            if (toolTipResult) {
                                tooltipLabel = toolTipResult
                            }
                        } else if (typeof toolTipConfig === 'string' && toolTipConfig) {
                            tooltipLabel = toolTipConfig;
                        }
                    }

                    return field;
                }).filter(Boolean);

                let recordId = rec.Id ?? rec.id;

                if (recordId) {
                    allRecordIds.push(recordId);
                } else {
                    recordId = KEY_ID++;
                }

                return {
                    Id: recordId,
                    keyId: KEY_ID++,
                    fields: recFields,
                    tooltipLabel
                };
            });

            this._allRecordIds = allRecordIds?.length ? allRecordIds : undefined;

            this._isInited = true;

            // 🔹 SAME PATTERN AS TILE: if any rec.fields has reference
            if (
                this._records.some(rec =>
                    rec.fields.some(f => 
                        f?.dtype === 'reference' || 
                        f?.dtype === 'name'
                    )
                )
            ) {
                const original = this._records;

                Promise.resolve().then(async () => {
                    const linkedRecords = [];

                    for (const rec of original) {
                        const linkedFields = await addPageRefsFieldsArr(rec.fields, this);
                        linkedRecords.push({ ...rec, fields: linkedFields });
                    }

                    this._records = linkedRecords;
                });
            }
        } catch (error) {
            this.showToast(
                'Error in parseRowsAndColumns() of sldsCardTable.js: ',
                getErrorMessage(error),
                'error'
            );
        }
    }

    // Open external urls
    handleExternalClick(event) {
        let link = event.currentTarget?.dataset?.value ?? null;
        openExternalUrl(link, this);
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



    dispatchRowButton(event) {
        const btn = event.currentTarget?.dataset?.recordId
            ? event.currentTarget
            : event.target;

        const recordId = btn?.dataset?.recordId;

        btn.focus();

        if (recordId) {
            this.dispatchEvent(new CustomEvent('customrowbutton', { detail: recordId } ));
        }
    }

    
    // ⬅️ DOM handler must be sync so it never returns a Promise
    handleRowAction(event) {
        this._handleRowAction(event).catch(e => {
            this.showToast('Error in handleRowAction() of sldsCardTable.js', getErrorMessage(e), 'error');
        });
    }
    // ⬅️ your original code moved here (unchanged except the refresh event)
    async _handleRowAction(event) {
        try {
            const { id = null, selection = null } = event?.detail || {};
            console.log('here is id in ')
            const objectApiName = this.getEntityPrefixById(id);
            let objectLabel;
            if (objectApiName === this.objectApiName) {
                objectLabel = this.objectLabel ?? getCleanMetaDataLabels(this.objectApiName);
            } else {
                if (objectApiName) objectLabel = getCleanMetaDataLabels(objectApiName);
            }

            switch (selection?.toLowerCase()) {
                case 'delete':
                    this.modalConfig = {
                        columns: 1,
                        modalTitle: 'Delete Record',
                        modalMessage: 'Are you sure you want to delete this record?',
                        cancelButtonLabel: 'Cancel',
                        okayButtonLabel: 'Delete',
                        objectApiName,
                        fields: null,
                        recordId: id
                    };
                    setTimeout(() => {
                        const modalEle = this.template.querySelector('[data-id="deleteRecordsModal"]');
                        if (modalEle) modalEle.showMe();
                    });
                    break;

                case 'edit': {
                    const otherRecordIds = this.applyAllFields?.length 
                        ? this._records?.map(rec => rec?.Id)
                        : [];

                    const otherRecordFields = this.applyAllFields;

                    const result = await NewRecordLayoutModal.open({
                        size: 'small',
                        description: 'Accessible description of modal\'s purpose',
                        objectApiName: objectApiName ?? this.objectApiName, 
                        objectLabel: objectLabel,
                        recordId: id, 
                        fields: this.editableFields?.length ? this.editableFields : null, 
                        otherRecordIds,
                        otherRecordFields,
                    });
                    console.log('here is id after returning from toast in sldsCardTable.js: ', id);
                    // undefined → saved
                    if (result?.result === 'success') {
                        this._isLoading = true;
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
                        this._isLoading = false;
                    }
                    requestAnimationFrame(() => {
                        const clickedButton = this.template.querySelector(`[data-menu-id="${id}"]`);
                        if (clickedButton) {
                            clickedButton.focus();
                        }
                    })
                    break;
                }
                default:
                    break;
            }
        } catch(error) {
            this.showToast('Error in handleRowAction() of sldsCardTable.js: ', getErrorMessage(error), 'error');
        } finally {
            this._isLoading = false;
        }
    }


    // ✅ DOM handler: NO async, NO promise returned
    applyRowAction(event) {
        // fire-and-forget; swallow any stray rejection here
        this._applyRowAction(event).catch(e => {
            this.showToast('Error in applyRowAction() of sldsCardTable.js', getErrorMessage(e), 'error');
        });
    }
    async _applyRowAction(message) {
        let isRefresh = false;
        let toastMessage = null;
        this._isLoading = true;
        try {
            const recordId = this.modalConfig?.recordId;
            const details  = message?.detail;
            const objectApiName  = this.modalConfig?.objectApiName;

            if (typeof details === 'string') {
                if (details === 'cancel') { this.modalConfig = null; return; }
                if (details === 'okay') {
                    
                    await deleteRecordsById({ recordIds: [recordId], objectApiName: objectApiName });
                    toastMessage = 'Record Successfully Deleted';
                    isRefresh = true;
                }
                if (isRefresh) {
                    this.dispatchEvent(new CustomEvent('refresh', { detail: '' } ));
                }
            } 
        } catch (error) {
            this.showToast('Error in applyRowAction() of sldsCardTable.js', getErrorMessage(error), 'error');
            isRefresh = false;
            toastMessage = null;

        } finally {
            this._isLoading = false;
            this.modalConfig = null;
            if (isRefresh && toastMessage) {
                this.showToast(toastMessage, '', 'success');
            }
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
