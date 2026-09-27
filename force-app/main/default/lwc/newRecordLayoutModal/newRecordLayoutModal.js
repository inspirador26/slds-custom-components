/**
 * newRecordLayoutModal — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/utils.
 * - Salesforce/platform modules: @salesforce/apex/DataTableController.saveRows, lightning/modal, lwc,
 * lightning/uiRecordApi, @salesforce/apex/DynamicSObjectController.getRecordTypeInfosDynamic.
 * - Template children (including conditional UI): c-toast-lwc, c-tooltip-button, lightning-button,
 * lightning-icon, lightning-input-field, lightning-messages, lightning-modal-body, lightning-modal-footer,
 * lightning-modal-header, lightning-radio-group, lightning-record-edit-form.
 * - Bundle template: newRecordLayoutModal.html; local styles: newRecordLayoutModal.css. Salesforce SLDS
 * styling is expected.
 * - Shared CSS modules: c/sharedStylesGlobal.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples are options passed to NewRecordLayoutModal.open.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - fields (fields): Fields to retain from the retrieved layout; array of API names or semicolon-separated
 * list.
 *   Example: fields: ['Name', 'Phone']
 * - objectApiName (object-api-name): Salesforce object API name used for metadata, navigation or record
 * operations.
 *   Example: objectApiName: "Account"
 * - recordTypeId (record-type-id): Record type ID used to load record-type-specific metadata. Declared
 * default: '012000000000000AAA'.
 *   Example: recordTypeId: "012000000000000AAA"
 * - objectLabel (object-label): Singular object label displayed in headings/messages.
 *   Example: objectLabel: "Account"
 * - predefinedFields (predefined-fields): Creation defaults with fieldApiName, value and optional
 * isHidden/isDisabled.
 *   Example: predefinedFields: [{ fieldApiName: 'Name', value: 'Acme', isDisabled: false }]
 * - recordId (record-id): Salesforce record ID used for record context; supply a real ID from the parent.
 *   Example: recordId: this.recordId
 * - nameField (name-field): Compatibility property: aPI name of the record display/name field; currently
 * stored/exposed but not consumed by this implementation. Declared default: 'Name'.
 *   Example: nameField: "Name"
 * - otherRecordIds (other-record-ids): Additional record IDs for mass editing; the primary recordId is
 * excluded.
 *   Example: otherRecordIds: this.selectedRecordIds
 * - otherRecordFields (other-record-fields): Fields offered for applying the edit across otherRecordIds.
 *   Example: otherRecordFields: [{ fieldApiName: 'Phone', label: 'Phone' }]
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <lightning-button label="New account" onclick={openAccount}></lightning-button>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * import NewRecordLayoutModal from 'c/newRecordLayoutModal';
 * export default class Parent extends LightningElement {
 *     result;
 *     async openAccount() {
 *         this.result = await NewRecordLayoutModal.open({
 *             size: 'medium', description: 'Create an account',
 *             objectApiName: 'Account', objectLabel: 'Account',
 *             fields: ['Name', 'Phone'],
 *             predefinedFields: [{ fieldApiName: 'Name', value: 'Acme' }]
 *         });
 *         if (this.result?.result === 'success') {
 *             // Refresh the parent's record data; result.toastInfo contains toast details.
 *         }
 *     }
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Open imperatively with NewRecordLayoutModal.open(), which returns a promise resolving when the modal
 * closes. The platform modal owns its overlay and focus; parent CSS cannot style its internals.
 * - Edit variant: pass recordId from an existing record, together with objectApiName and fields. Mass-edit
 * variant: additionally pass otherRecordIds and otherRecordFields = [{ fieldApiName: 'Phone', label:
 * 'Phone' }]. Fields are constrained by the fetched layout and user access. Omit recordId for creation.
 * size and description are inherited LightningModal.open options.
 */

/* Example Usage:

    import NewRecordLayoutModal from 'c/newRecordLayoutModal';

    async handleNewRecord() {
        try {
            const result = await NewRecordLayoutModal.open({
                size: 'medium',
                description: 'Accessible description of modal\'s purpose',
                objectApiName: SOME_OBJECT.objectApiName, 
                objectLabel: 'SOME_OBJECT Label',
                predefinedFields: [
                    {fieldApiName: SOME_FIELD.fieldApiName, value: this.recordId, isDisabled: true, isHidden: true},
                    {fieldApiName: SOME_OTHER_FIELD.fieldApiName, value: <some_other_value>} // Disabled/Hidden False by default
                ]
            });

            if (result?.result === 'success') {
                // Get to Linked toast from the modal response
                const toastMessage = result.toastInfo;
                // Refresh 
                await this.handleRefresh();
                // Display toast with link to record
                this.showLinkedRecordToast(
                    toastMessage.action, 
                    toastMessage.objectApiName,
                    toastMessage.objectLabel,
                    toastMessage.recordId,
                    toastMessage.linkLabel
                );
            } 
        } catch(error) {
            this.showToast('Error in handleNewCapability() of partsListControllerLwc.js: ', getErrorMessage(error), 'error');
        }
    
    }

*/

import saveRows from '@salesforce/apex/DataTableController.saveRows';


import LightningModal from 'lightning/modal';
import { api, wire, track } from 'lwc';
import { getRecordUi, getRecordCreateDefaults } from 'lightning/uiRecordApi';
import {
    getToastErrorMessage, 
    getCleanMetaDataLabels, 
    iconMap as ICON_MAP, 
    iconByObjectApiName, 
    getErrorMessage, 
    normalizePhone
} from 'c/utils';


function handleOtherRecordIds(recordIds, mainRecordId) {
    if (!recordIds) return [];

    if (mainRecordId) {
        return recordIds.filter(id => id !== mainRecordId);
    } 
    return recordIds;
}


import getRecordTypeInfosDynamic from '@salesforce/apex/DynamicSObjectController.getRecordTypeInfosDynamic';

export default class NewRecordLayoutModal extends LightningModal {
    @track icon;

    @api 
    set fields(val) {
        if (val && Array.isArray(val) && val.length) {
            this._fields = new Set(val);
        } else if (val && typeof val === 'string' && val.includes(';')) {
            const fieldsArr = val.split(';');
            if (fieldsArr?.length >= 1) {
                this._fields = new Set(fieldsArr);
            }
        }
    }
    get fields() {
        return this._fields;
    }
    
    @api set objectApiName(val) {
        this._objectApiName = val; 
        const iconObj = iconByObjectApiName(val);
        if (iconObj && iconObj.iconName !== "standard:empty") {
            this.icon = iconObj;
        }

    }
    get objectApiName() {return this._objectApiName;}
    @api recordTypeId = '012000000000000AAA';
    @api objectLabel;
    @api predefinedFields; // Structure: [ {fieldApiName: <fieldApiName>, value: <value>, isHidden: T/F, isDisabled: T/F} ]

    @api 
    set recordId(val) {
        this._recordId = val;
        if (val) {
            this._otherRecordIds = handleOtherRecordIds(this._otherRecordIds, val);
        }
    }
    get recordId() {
        return this._recordId;
    }
    @api nameField = 'Name';

    _recName;
    _recId;

    _otherFieldLabels = [];

    // Allow multi-record edits
    _otherRecordIds = [];
    @api 
    set otherRecordIds(val) {
        this._otherRecordIds = handleOtherRecordIds(val, this.recordId);
    }
    get otherRecordIds() {
        return this._otherRecordIds;
    }
    
    // fields to edit if other record Ids included
    _otherFieldLabels = [];

    @api 
    set otherRecordFields(val) {
        this._otherRecordFields = val;
        if (val && val?.length) {
            this._otherFieldLabels = val.map(f => {
                return f?.label ?? getCleanMetaDataLabels(f?.fieldApiName)
            });
        }
    }
    get otherRecordFields() {
        return this._otherRecordFields ?? [];
    }


    get _massEditHelpText() {
        if (this.objectApiName && this._otherRecordIds) {
            return `Edit ${this._otherRecordIds.length + 1} ${this.objectLabel ?? getCleanMetaDataLabels(this.objectApiName)}s `
        }
        
    }

    @track iconMap = ICON_MAP;

    uiObjectApiName = undefined;
    tempRecType;

    // Wired data loaded Flags
    createDefaultsLoaded = false;
    recordTypesLoaded = false;

    @track recordTypes = [];
    @track sections = [];

    @track fieldApiNames = [];
    @track errorMsg;


    get isEdit() { return !!this.recordId; }

    // 🔖 Modal header Label
    get headerLabel() {
        const objLabel = this.objectLabel ?? getCleanMetaDataLabels(this.objectApiName);
        return `${this.isEdit ? 'Edit' : 'New'} ${objLabel}`;
    }
    
    @wire(getRecordUi, {
        recordIds: '$recordId',
        layoutTypes: ['Full'],
        modes: ['Edit']
    })
    wiredEditUi({ data, error }) {
        if (!this.recordId) return;

        if (error) {
            this.errorMsg = error.body?.message || 'Error loading edit layout';
            this.recordTypesLoaded = true;
            this.createDefaultsLoaded = true;
            return;
        }
        const sectionsRaw = data?.layouts?.[this.objectApiName]
            ?.[
                Object.keys(data?.layouts?.[this.objectApiName] || {})[0]
            ]?.Full?.Edit?.sections || [];

        

        // Build rows/items (kept stupid simple; no filters)
        let uid = 0;
        this.sections = sectionsRaw.map((section, si) => {
            const rows = (section.layoutRows || []).map(row => {

                const fields = (row.layoutItems || []).flatMap(item =>
                    (item.layoutComponents || [])
                    .filter(c => (c.componentType || c.type) === 'Field' && c.apiName && (!this.fields || this.fields.has(c.apiName)))
                    .map(c => ({ apiName: c.apiName }))
                );

                if (!fields.length) return null;

                const packed = [];
                for (let i = 0; i < fields.length; i += section.columns === 1 ? 1 : 2) {
                    const slice = fields.slice(i, i + (section.columns === 1 ? 1 : 2));
                    
                    packed.push({
                        key: `r${uid++}`,
                        items: slice.map(f => ({
                            apiName: f.apiName,
                            isRecordTypeId: isRT(f.apiName),
                            key: `i${uid++}-${f.apiName}`,
                            sizeClass: slice.length === 2
                                ? 'slds-col slds-size_1-of-2'
                                : 'slds-col slds-size_1-of-1'
                        }))
                    });
                }
                return packed;

            }).filter(Boolean).flat();

            if (!rows?.length) return null;

            return {
                key: `sec${si}`,
                heading: section.heading || section.label || `Section ${si + 1}`,
                rows
            };
        }).filter(Boolean);

        // Unblock template
        this.recordTypesLoaded = true;
        this.createDefaultsLoaded = true;
    }


    // 🛜 Get available Record Types
    @wire(getRecordTypeInfosDynamic, { objectName: '$objectApiName' })
    wiredRecordTypeInfos({ data, error }) {
        if (this.isEdit) {                 // 👈 skip new-record flow in edit mode
            this.recordTypesLoaded = true;
            return;
        }

        try {
            if (error) {
                this.showToast('Error', error.body?.message || 'Error Record Type Infos', 'error');
                return;
            }
            const filtered = (data || []).filter(rt => rt.Id !== '012000000000000AAA');
            this.recordTypes = filtered.map(rt => ({ label: rt.Name, value: rt.Id }));
            if (this.recordTypes.length) {
                this.recordTypeId = null;
                this.tempRecType = this.recordTypes[0].value;
            } else {
                // Trigger the UI wire service to run
                this.uiObjectApiName = this.objectApiName;
            }
        } finally {
            this.recordTypesLoaded = true;
        }
    }

    // 🛜  Get UI for record creation
    @wire(getRecordCreateDefaults, {
        objectApiName: '$uiObjectApiName',
        recordTypeId: '$recordTypeId'
    })
    // --- in wiredDefaults ---
    wiredDefaults({ data, error }) {
        if (this.isEdit) return;           
        try {
            if (error) {
                this.errorMsg = error.body?.message || 'Error loading layout';
                return;
            }
            if (!data) return;            

            const fieldInfos = data.objectInfos?.[this.objectApiName]?.fields || {};
            const sections = buildSectionsFromCreateDefaults(
                data,
                this.objectApiName,
                this.recordTypeId, 
                this.predefinedFields
            );

            // keep only creatable, non-calculated fields per row
            this.sections = sections
                .map(sec => ({
                    ...sec,
                    rows: sec.rows
                        .map(r => ({
                            ...r,
                            items: r.items.filter(item => {
                                const f = fieldInfos[item.apiName];
                                return f && f.createable && !f.calculated;
                            })
                        }))
                        .filter(r => r.items.length > 0)
                }))
                .filter(sec => sec.rows.length > 0);

        } catch (e) {
            this.sections = [{
                key: 'sec0',
                heading: 'Details',
                rows: [{ key: 'r0', items: [{ apiName: 'Name', sizeClass: 'slds-col slds-size_1-of-1', key: 'i0-Name' }] }]
            }];
            this.errorMsg = 'Could not parse layout; showing minimal form.';
            // eslint-disable-next-line no-console
            console.error('Layout parse error', e);
        } finally {
            this.createDefaultsLoaded = true;
        }
    }

    // 🚩 Flag when both wires have finished loading
    get ready() {
        return this.recordTypesLoaded && this.createDefaultsLoaded;
    }

    get applyToAllNumber() {
        return !this._otherRecordIds?.length 
            ? null 
            : this._otherRecordIds?.length + 1;
    }
    get applyToAllHelp() {
        return !this.otherRecordFields?.length
            ? null 
            : `Applies to fields: ${this.otherRecordFields.map(f => {
                return f?.label ?? getCleanMetaDataLabels(f.fieldApiName)
            }).join(', ')}.  Fields outside this scope can still be edited but those edits will not be applied to the the other ${this._otherRecordIds.length} records.`
    }
    get applyToAllFields() {
        return !this.otherRecordFields?.length
            ? null 
            : `${this.otherRecordFields.map(f => {
                return f?.label ?? getCleanMetaDataLabels(f.fieldApiName)
            }).join(', ')}`
    }

    // ⬇️ submit record type Id on "Next" click
    submitRecordTypeId() {
        if (!this.tempRecType) return;
        this.recordTypeId = this.tempRecType;
        this.uiObjectApiName = this.objectApiName;
    }

    // 🔙 change record type
    handleBack() {
        this.recordTypeId = undefined;
        this.uiObjectApiName = undefined;
    }

    // ✏️ Handle change in record type
    handleRecTypeChange(event) {
        this.tempRecType = event.target.value;
    }

    // 🔒 Close / 🔓 Open sections
    toggleSections(event) {
        event.preventDefault();
        event.stopPropagation();
        const section = event.target.closest('.slds-section')
        if (section) {
            section.classList.toggle('slds-is-open');
        }
    }

    // ⬇️ Submit form 
    handleSubmit(event) {
        try {
            const fields = event.detail.fields;

            const phoneFields = Object.keys(fields).filter(
                f => f.toLowerCase().includes('phone')
            );

            for (const phoneF of phoneFields) {
                const raw = fields[phoneF];
                if (raw) {
                    fields[phoneF] = normalizePhone(raw);
                }
            }

            this.template.querySelector('lightning-record-edit-form').submit(fields);

        } catch (error) {
            this.showToast(
                'Error in handleSubmit() of newRecordLayoutModal.js',
                getErrorMessage(error),
                'error'
            );
        }
    }

    _applyToAll = false;
    handleApplyToAll(event) {
        try {
            this._applyToAll = event.target.checked;
        } catch(error) {
            this.showToast('Error in handleApplyToAll() of newRecordLayoutModal.js', getErrorMessage(error), 'error');
        }
    }   

    // ✅ New record successfully created
    async handleSuccess(event) {
        const fields = event.detail.fields;
        const recordId = event?.detail?.id ?? null;

        const linkLabel = this.objectApiName === 'Lead'
            ? ['FirstName', 'LastName'].map(f => fields?.[f]?.value)?.filter(Boolean)?.join(' ')
            : fields['Name']?.value;

        const toastInfo = {
            action: this.isEdit ? 'edit' : 'new', 
            objectApiName: this.objectApiName,
            objectLabel: this.objectLabel,
            recordId,
            linkLabel: `"${linkLabel}"`
        };

        if (this._applyToAll && this._otherRecordIds?.length && this.otherRecordFields?.length) {
            const recSkeleton = {};
            this.otherRecordFields.forEach(obj => {
                if (fields.hasOwnProperty(obj.fieldApiName)) {
                    const fieldVal = fields[obj.fieldApiName]?.value;
                    recSkeleton[obj.fieldApiName] = fieldVal;
                }
            });
            
            const editedRecords = this._otherRecordIds.map(recId => {
                return {Id: recId, sObjectType: this.objectApiName, ...recSkeleton}
            });

            if (editedRecords?.length) { 
                await saveRows({rows: editedRecords});
            }
        }
        
        this.close({result: 'success', toastInfo: toastInfo});
    }

    // ❌ New record error
    handleError(e) {
        console.error('error in newRecordLayoutModal.js:', JSON.stringify(e.detail, null, 2));
        this.errorMsg = e.detail.message;
        getToastErrorMessage('handleError', 'newRecordLayoutModal.js', e);
    }
    
    // ⬇️ Submit record-edit-form from <footer>
    handleFauxSubmit() {
        try {
            const button = this.template.querySelector('[data-id="submitButton"]');
            if (button) {
                button.click();
            } else  {
                //console.log('FAILED TO get the submit button in handleFauxSubmit() of newRecordLayoutModal.js');
            }
        } catch(error) {
            getToastErrorMessage('handleFauxSubmit()', 'newRecordLayoutModal.js', error);
        }
    }

    // 🔒 Close Modal (no new record)
    handleCancel() {
        this.close('cancel');
    }


    @track toastObj;
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



}










function isRT(apiName) {
    return (apiName || '').toLowerCase() === 'recordtypeid';
}
function buildSectionsFromCreateDefaults(data, objectApiName, recordTypeId, predefinedFields=null) {
    const rawSections = getSections(data, objectApiName, recordTypeId) || [];
    let uid = 0;

    return rawSections.map((section, si) => {
        const rows = [];

        (section.layoutRows || []).forEach(row => {
        // collect ALL field components in this layoutRow
        const fields = (row.layoutItems || []).flatMap(item =>
            (item.layoutComponents || [])
            .filter(c => (c.componentType || c.type) === 'Field' && c.apiName)
            .map(c => ({ apiName: c.apiName }))
        );

        if (!fields.length) return;

        // make rows of two (extras become their own row)
        for (let i = 0; i < fields.length; i += 2) {
            const slice = fields.slice(i, i + 2);
            const items = slice.map(f => {
                const field = {
                    apiName: f.apiName,
                    isRecordTypeId: isRT(f.apiName),
                    sizeClass: slice.length === 2 ? 'slds-col slds-size_1-of-2' : 'slds-col slds-size_1-of-1',
                    key: `i${uid++}-${f.apiName}`
                };
                if (predefinedFields && predefinedFields.length) {
                    const preDefinedF = predefinedFields && predefinedFields.length
                        ? predefinedFields.find(preF => preF.fieldApiName === f.apiName)
                        : null;
                    if (preDefinedF && preDefinedF.hasOwnProperty('value')) {
                        field.value = preDefinedF.value;
                        field.isDisabled = !!preDefinedF?.isDisabled;
                        field.isHidden = !!preDefinedF?.isHidden;
                    }
                }
                return field;
            });
            rows.push({ key: `r${uid++}`, items });
        }
        });

        return {
            key: `sec${si}`,
            keyId: `sec${si}`,
            heading: section.heading || section.label || `Section ${si + 1}`,
            rows
        };
    });
}
function getSections(data, objectApiName, recordTypeId) {
    // nested shape
    const nested = data?.layout?.layouts?.[objectApiName];
    if (nested) {
        const rtKey = (recordTypeId && nested[recordTypeId]) ? recordTypeId : Object.keys(nested)[0];
        const full = nested?.[rtKey]?.Full;
        if (full?.sections?.length) return full.sections;
    }
    // flat shape (your JSON)
    if (data?.layout?.sections?.length) return data.layout.sections;
    return [];
}