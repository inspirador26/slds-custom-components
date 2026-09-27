import { LightningElement, wire, api } from 'lwc';
import { 
    createListInfo, 
    updateListInfoByName, 
    getListObjectInfo, 
    updateListPreferences,
    deleteListInfo 
} from 'lightning/uiListsApi';


import LEAD_OBJECT_SCHEMA from "@salesforce/schema/Lead";
import OPPORTUNITY_OBJECT_SCHEMA from "@salesforce/schema/Opportunity";
import CONTRACT_OBJECT_SCHEMA from "@salesforce/schema/Contract";
import ACCOUNT_OBJECT_SCHEMA from "@salesforce/schema/Account";

import {
    getErrorMessage,
    iconByObjectApiName,
    validateApiName,
    labelToApiName,
    iconMap as ICON_MAP,
    toPlain,
    getCleanMetaDataLabels,
} from 'c/utils';


// object api names available for list views
const OBJECT_API_NAME_OPTIONS = [
    {label: 'Lead', value: LEAD_OBJECT_SCHEMA.objectApiName},
    {label: 'Opportunity', value: OPPORTUNITY_OBJECT_SCHEMA.objectApiName},
    {label: 'Contract', value: CONTRACT_OBJECT_SCHEMA.objectApiName},
    {label: 'Account', value: ACCOUNT_OBJECT_SCHEMA.objectApiName},
];

const SCOPE_OPTIONS = [
    {label: 'Mine', value: 'mine'},
    {label: 'All', value: 'everything'}
];

const SCOPE_SKELETON = [
    {label: 'My', value: 'mine'},
    {label: 'All', value: 'everything'}
];

// Skeleton for "New List View" 
const NEW_LIST_VIEW_SKELETON = {
    objectApiName: null,
    listViewApiName: null,
    label: null,
    visibility: 'private', 
    scope: {apiName: 'mine'}
};


const VARIANTS = [
    'new',
    'label',
    'columns',
    'sort',
    'delete',
];

// For "sort" variant, listview api accepts "isAscending" argument
const SORT_DIRECTION_OPTIONS = [
    {label: 'Ascending', value: true},
    {label: 'Descending', value: false}
];

let KEY_ID = 999;

function isCamelCase(str) {
    return /^[a-z]+([A-Z][a-z0-9]*)+$/.test(str) || /^[A-Z][a-z0-9]+([A-Z][a-z0-9]*)*$/.test(str);
}
function filterObjInfosChildRelationships(objectInfos) {
    if (!objectInfos) return;
    const childRelationships = objectInfos?.data 
        ? objectInfos?.data?.childRelationships ?? []
        : objectInfos?.childRelationships ?? [];

    if (!childRelationships?.length) {
        return null;
    }

    return childRelationships.filter(cf => cf?.fieldName && !isCamelCase(cf.fieldName));
}

export default class NewListViewLwc extends LightningElement {
    iconMap = ICON_MAP;

    // Options for object Api Name
    objectOptions = OBJECT_API_NAME_OPTIONS.map(opt => ({
        ...opt, iconConfig: iconByObjectApiName(opt.value)
    }));

    _displayColumns;
    // Object to pass to "createListInfo" API
    newListView = NEW_LIST_VIEW_SKELETON;
    
    // For "sort" variant, listview api accepts "isAscending" argument
    sortDirectionOptions = SORT_DIRECTION_OPTIONS;

    // object api name of the list view
    _isObjectDisabled = false;
    _wireServiceObjectApiName = undefined;

    isUpdateSort = false;
    isUpdateDisplayColumns = false;
    isUpdateLabel = false;
    isNewListView = true;
    isDeleteListView = false;

    @api // Focus on first render if true
    set renderFocus(val) {
        this._renderFocus = val;
    }
    get renderFocus() {
        return this._renderFocus;
    }

    scopeOptions = SCOPE_OPTIONS;
    @api 
    set pluralLabel(val) {
        this._pluralLabel = val;
        if (val) {
            this.scopeOptions = SCOPE_SKELETON.map(opt => {
                return {
                    ...opt,
                    label: `${opt.label} ${val}`
                };
            })
        }
    }
    get pluralLabel() {
        return this._pluralLabel;
    }

    @api 
    set listInfoByName(val) {
        this._listInfoByName = val;
        this.handleVariants();
    }
    get listInfoByName() {
        return this._listInfoByName;
    }

    _objectApiName;
    @api 
    set objectApiName(val) {
        this._objectApiName = val;
        if (val) {
            this._isObjectDisabled = true;
            this.newListView = {...NEW_LIST_VIEW_SKELETON, objectApiName: val};
        }
    }
    get objectApiName() {
        return this._objectApiName;
    }


    _childRelationShips = [];
    childRelationShipOptions = [];
    @api 
    set objectInfos(val) {
        this._objectInfos = val;
        if (val) {
            // Get the child lookup fields from object infos --> filter out camel-case fieldName children
            const childRelations = filterObjInfosChildRelationships(val);
            const childObjectNamesSet = new Set();
            // Find repeating child object api names --> add parentheses with fieldName inside if repeating
            const hasTwo = childRelations.map(obj => {
                if (childObjectNamesSet.has(obj.childObjectApiName)) {
                    return obj.childObjectApiName;
                } 
                childObjectNamesSet.add(obj.childObjectApiName);
                return null;
            }).filter(Boolean);

            // Build picklist options for UI
            this.childRelationShipOptions = childRelations.map(obj => {
                if (hasTwo.includes(obj.childObjectApiName)) {
                    // add parentheses with fieldName inside if repeating
                    return {
                        label: `${getCleanMetaDataLabels(obj.childObjectApiName)} (${getCleanMetaDataLabels(obj.fieldName)})`,
                        value: `${obj.childObjectApiName}::${obj.fieldName}`,
                    }
                }
                // Not repeating entry
                return {
                    label: getCleanMetaDataLabels(obj.childObjectApiName),
                    value: `${obj.childObjectApiName}::${obj.fieldName}`,
                }
            });
            const allFieldNames = this.childRelationShipOptions.map(o => o.value);
            //console.log('here are all field names in set objectInfos(): ', JSON.stringify(allFieldNames));
            // Store original shape of filtered child relations 
            this._childRelationShips = childRelations;
            const plainObj = toPlain(val);
            //console.log('here is object infos in newListViewLwc.js: ', plainObj);
        }
    }
    get objectInfos() {
        return this._objectInfos ?? null;
    }

    @api 
    set variant(val) {
        this._variant = val;
        switch(val) {
            case 'new':
                this.isUpdateDisplayColumns = false;
                this.isUpdateLabel = false;
                this.isNewListView = true;
                this.isDeleteListView = false;
                this.isUpdateSort = false;
                break;
            case 'label':
                this.isNewListView = false;
                this.isUpdateLabel = true; 
                this.isUpdateDisplayColumns = false;
                this.isDeleteListView = false;
                this.isUpdateSort = false;
                break;
            case 'columns':
                this.isNewListView = false;
                this.isUpdateDisplayColumns = true;
                this.isUpdateLabel = false;
                this.isDeleteListView = false;
                this.isUpdateSort = false;
                break;
            case 'sort':
                this.isNewListView = false;
                this.isUpdateDisplayColumns = false;
                this.isUpdateLabel = false;
                this.isDeleteListView = false;
                this.isUpdateSort = true;
                break;
            case 'delete': 
                this.isNewListView = false;
                this.isUpdateDisplayColumns = false;
                this.isUpdateLabel = false;
                this.isDeleteListView = true;
                this.isUpdateSort = false;

            default:
                // default is "new"
                break;
        }
        this.handleVariants();
    }
    get variant() {
        return this._variant;
    }
    _originalOrderedBy;
    _listLabel;
    // Update UI based on variant (new/label/columns are variants)
    handleVariants() {
        try {
            if (this.variant) {
                if (this.listInfoByName) {
                    this._isObjectDisabled = true;
                    this._objectApiName = this.listInfoByName.listReference.objectApiName;

                    if (this.isUpdateLabel) {
                        this.newListView = {
                            objectApiName: {objectApiName: this.listInfoByName.listReference.objectApiName},
                            listViewApiName: this.listInfoByName.listReference.listViewApiName,
                            label: this.listInfoByName.label
                        };
                    }
                    if (this.isUpdateDisplayColumns) {
                        this._isLoading = true;
                        this.newListView = {
                            objectApiName: {objectApiName: this.listInfoByName.listReference.objectApiName},
                            listViewApiName: this.listInfoByName.listReference.listViewApiName,
                            displayColumns: this.listInfoByName.displayColumns.map(col => col.fieldApiName)
                        };
                        // Trigger "getListObjectInfo" wire
                        this._wireServiceObjectApiName = this._objectApiName;
                    }
                    if (this.isUpdateSort) {
                        this._isLoading = true;
                        this.newListView = {
                            objectApiName: {objectApiName: this.listInfoByName.listReference.objectApiName},
                            listViewApiName: this.listInfoByName.listReference.listViewApiName,
                            orderedBy: (this.listInfoByName.orderedByInfo ?? []).map(col => ({ 
                                fieldApiName: col?.fieldApiName ?? '', 
                                label: col?.label ?? '',
                                isAscending: !col 
                                    ? true 
                                    : col?.isAscending === true || col?.isAscending === 'true', 
                                keyId: String(KEY_ID++)
                            }))
                        };
                        this._originalOrderedBy = this.newListView.orderedBy;
                        // Trigger "getListObjectInfo" wire
                        this._wireServiceObjectApiName = this._objectApiName;
                    }
                    if (this.isDeleteListView) {
                        this.newListView = {
                            objectApiName: this.listInfoByName.listReference.objectApiName,
                            listViewApiName: this.listInfoByName.listReference.listViewApiName
                        };
                        this._listLabel = this.listInfoByName.label;
                    }
                }
            }
        } catch(error) {
            this.showToast('Error in handleVariants() of newListViewLwc.js', getErrorMessage(error), 'error');
            this._isLoading = false;
        }
    }


    _didRenderFocus = false;
    renderedCallback() {
        try {
            if (this.variant && this.renderFocus && !this._didRenderFocus) {
                const focusTarget = this.template.querySelector('[data-focus-target="true"]');
                if (focusTarget) {
                    if (focusTarget.focusMe) {
                        //console.log('Focus target was child in newListViewLwc.js');
                        focusTarget.focusMe();
                        this._didRenderFocus = true;
                    } else {
                        focusTarget.focus();
                        this._didRenderFocus = true;
                    }
                } else {
                    //console.log('Failed to get the Focus target in newListViewLwc.js');
                }
            }
        } catch(error) {
            this.showToast('Error in renderedCallback() of newListViewLwc.js', getErrorMessage(error), 'error');
        }
    }

    sortFieldOptions = [];
    _displayColumnOptions = [];
    _templateDisplayColumns = [];
    @wire(getListObjectInfo, {
        objectApiName: '$_wireServiceObjectApiName',
    })
    listObjectInfo({ error, data }) {
        if (data) {
            //console.log('here is data in listObjectInfo() of newListViewLwc.js: ', data);
            try {
                if (this.isUpdateDisplayColumns) {
                     
                    const displayColumns = (data.columns ?? [])
                        ?.filter(c => c.displayable)
                        ?.map(c => ({
                            label: c.label,
                            value: c.fieldApiName
                        }));
                        
                    this._displayColumnOptions = displayColumns;
                    this._templateDisplayColumns = displayColumns;

                } else if (this.isUpdateSort) {
                    this.sortFieldOptions = (data.columns ?? [])
                        ?.filter(c => c.sortable)
                        ?.map(c => ({
                            label: c.label,
                            value: c.fieldApiName,
                        }));
                }
            } catch(error) {
                this.showToast('Error in listObjectInfo() of newListViewLwc.js', getErrorMessage(error), 'error');
            } finally {
                this._isLoading = false;
            }

        } else if (error) {
            this.showToast('error in listObjectInfo() of newListViewLwc.js', getErrorMessage(error), 'error');
            this._isLoading = false;
        }
    }


    _childRelationshipColumns = [];
    addChildRelationship() {
        try {
            const newEntry = {
                childObjectApiName: '', 
                fieldName: '',
                relationshipName: '',
                columnLabel: '',       // is value
                nameField: 'Name',    // is value
                conditions: '',      // is value
                keyId: String(KEY_ID++), 
                relationPlaceHolder: 'Ex: LIMIT 1'
            }
            //console.log('here is newEntry in newListViewLwc.js: ', JSON.stringify(newEntry));
            this._childRelationshipColumns = [
                ...this._childRelationshipColumns,
                newEntry
            ]; 

        } catch(error) {
            this.showToast('Error in addChildRelationship() of newListViewLwc.js', getErrorMessage(error), 'error');
        }
    }
    // Build label when picklist option is select for "display columns"
    handleChildDisplayColumn(event) {
        try {
            const selected = event.detail;
            const parts = selected.split('::');
            if (parts?.length === 2) {
                const [childObjectName, fieldName] = parts;
                const keyId = event.target?.dataset?.keyId;
                const matched = this._childRelationShips.find(o => 
                    o.childObjectApiName === childObjectName && o.fieldName === fieldName
                );

                this._childRelationshipColumns = this._childRelationshipColumns.map(cf => {
                    if (cf?.keyId === keyId) {
                        const relationshipName = matched.relationshipName;
                        const fieldName = matched.fieldName;
                        const childObjectApiName = matched.childObjectApiName;
                        const columnLabel = getCleanMetaDataLabels(childObjectName);
                        return {
                            ...cf, 
                            columnLabel,
                            relationshipName,
                            fieldName,
                            childObjectApiName,
                            relationPlaceHolder: `${relationshipName}.Status = "Sent" LIMIT 1`
                        };
                    }
                    return cf;
                });
            }

        } catch(error) {
            this.showToast('Error in handleChildDisplayColumn() of newListViewLwc.js', error, 'error');
        } 
    }
    handleColumnLabel(event) {
        try {
            const keyId = event.target?.dataset?.keyId;
            if (keyId) {
                const columnLabel = event.detail?.value ?? '';
                this._childRelationshipColumns = this._childRelationshipColumns.map(cf => {
                    if (cf.keyId === keyId) {
                        return {...cf, columnLabel}
                    }
                })
            
            }
        } catch(error) {
            this.showToast('Error in handleColumnLabel() of newListViewLwc.js', error, 'error');
        } 
    }
    handleDisplayColumnCondition(event) {
        try {
            const keyId = event.target?.dataset?.keyId;
            if (keyId) {
                const conditions = event.detail?.value ?? '';
                this._childRelationshipColumns = this._childRelationshipColumns.map(cf => {
                    if (cf.keyId === keyId) {
                        return {...cf, conditions}
                    }
                })
            
            }
        } catch(error) {
            this.showToast('Error in handleDisplayColumnCondition() of newListViewLwc.js', error, 'error');
        } 

    }
    handleNameField(event) {
        try {
            const keyId = event.target?.dataset?.keyId;
            if (keyId) {
                const nameField = event.detail?.value ?? '';
                if (nameField) {
                    this._childRelationshipColumns = this._childRelationshipColumns.map(cf => {
                        if (cf.keyId === keyId) {
                            return {...cf, nameField};
                        }
                    })
                }
            }
        } catch(error) {
            this.showToast('Error in handleNameField() of newListViewLwc.js', error, 'error');
        } 
    }
    // Delete the child display column entry 
    removeChildColumn(event) {
        try {
            const keyId = event.target?.dataset?.keyId ?? event.currentTarget?.dataset?.keyId;
            if (keyId) {
                this._childRelationshipColumns = this._childRelationshipColumns.filter(cf => 
                    cf?.keyId !== keyId
                );
            }
        } catch(error) {
            this.showToast('Error in removeChildColumn() of newListViewLwc.js', error, 'error');
        } 
    }



    // Api Name of list view
    handleObject(message) {
        try {
            const objectApiName = message.detail;
            if (objectApiName !== this.objectApiName) {
                const inputs = this.template.querySelectorAll('[data-element="listview-form"]');
                inputs.forEach(inp => {
                    if(inp) {
                        inp.clearMe();
                    }
                })
                this.newListView = {...NEW_LIST_VIEW_SKELETON, objectApiName};
            }
        } catch(error) {
            this.showToast('Error in handleObject() of newListViewLwc.js', getErrorMessage(error), 'error');
        }
    }
    // List view label
    handleLabel(message) {
        try {
            const label = message.detail?.value;
            if (this.isUpdateLabel && label) {
                this.newListView = {
                    ...this.newListView,
                    label: label 
                };
                return;
            }
            if (label) {
                const listViewApiName = labelToApiName(label);
                this.newListView = {
                    ...this.newListView,
                    label,
                    listViewApiName
                };
            }
        } catch(error) {
            this.showToast('Error in handleLabel() of newListViewLwc.js', getErrorMessage(error), 'error');
        }
    }
    // Check api name
    handleApiName(message) {
        try {
            const listViewApiName = message.detail?.value;
            if (listViewApiName) {
                const resp = validateApiName(listViewApiName);
                if (!resp.valid) {
                    const inp = this.template.querySelector('[data-id="api-name"]');
                    if (inp) {
                        const msg = resp.message;
                        inp.errorMe(msg);
                    }
                } else {
                    this.newListView = {
                        ...this.newListView,
                        listViewApiName
                    }
                }
            }
        } catch(error) {
            this.showToast('Error in handleApiName() of newListViewLwc.js', getErrorMessage(error), 'error');
        }
    }
    // --New List View-- update scope property
    handleScopeChange(event) {
        try {
            const scopeVal = event.detail.value;
            this.newListView = {...this.newListView, scope: {apiName: scopeVal}};
        } catch(error) {
            this.showToast('Error in handleScopeChange() of newListViewLwc.js', getErrorMessage(error), 'error');
        }

    }

    // Filter Display Columns options in dual listbox
    filterDisplayColumns(message) {
        try {
            const searchText = message.detail?.toLowerCase()?.trim();
            const selectedSet = new Set(this.newListView.displayColumns || []);

            if (!searchText) {
                this._templateDisplayColumns = this._displayColumnOptions;
                return;
            }

            const selected = [];
            const startsWithOptions = [];
            const includesOptions = [];

            this._displayColumnOptions.forEach(col => {
                const labelLower = col.label.toLowerCase();

                if (selectedSet.has(col.value)) {
                    selected.push(col);
                } else if (labelLower.startsWith(searchText)) {
                    startsWithOptions.push(col);
                } else if (labelLower.includes(searchText)) {
                    includesOptions.push(col);
                }
            });

            this._templateDisplayColumns = [
                ...selected,
                ...startsWithOptions,
                ...includesOptions
            ];

        } catch (error) {
            this.showToast('Error in filterDisplayColumns() of newListViewLwc.js', error, 'error');
        }
    }
    // Update display selected columns for the list view
    updateDisplayColumns(event) {
        try {
            const selected = event.detail.value;
            this.newListView = {
                ...this.newListView, 
                displayColumns: selected
            };
        } catch(error) {
            this.showToast('Error in updateDisplayColumns() of newListViewLwc.js', getErrorMessage(error), 'error');
        }
    }

    // ========================== Sort Variant Handlers ========================== \\
    // Notify parent if sorts have changed
    notifyParentOfChangedState() {
        try {

            if (this.newListView?.orderedBy?.length === 0) {
                this.dispatchEvent(new CustomEvent('orderbystate', { detail: 'unchanged' } ));
                return   
            }
            if (this.newListView?.orderedBy?.every(col => !col?.fieldApiName)) {
                this.dispatchEvent(new CustomEvent('orderbystate', { detail: 'unchanged' } ));
                return;
            }

            const origOrderedBy = (this._originalOrderedBy ?? []).map(col => {
                return {
                    fieldApiName: String(col?.fieldApiName ?? ''), 
                    isAscending: String(col?.isAscending)
                }
            });
            const newOrderedBy = (this.newListView.orderedBy ?? []).map(col => {
                return {
                    fieldApiName: String(col?.fieldApiName ?? ''), 
                    isAscending: String(col?.isAscending) 
                }
            });

            if (JSON.stringify(origOrderedBy) !== JSON.stringify(newOrderedBy)) {
                this.dispatchEvent(new CustomEvent('orderbystate', { detail: 'changed' } ));
            } else {
                this.dispatchEvent(new CustomEvent('orderbystate', { detail: 'unchanged' } ));
            }
        } catch(error) {
            this.showToast('Error in notifyParentOfChangedState() of newListViewLwc.js', getErrorMessage(error), 'error');
        }
    }
    // Add entry
    addSortCol() { 
        try {
            const newEntry = {
                fieldApiName: '', 
                label: '',
                isAscending: true, 
                keyId: String(KEY_ID++)
            }
            
            this.newListView = {
                ...this.newListView,
                orderedBy: [
                    ...this.newListView.orderedBy,
                    newEntry
                ]
            };

            this.notifyParentOfChangedState();
        } catch(error) {
            this.showToast('Error in addSort() of newListViewLwc.js', getErrorMessage(error), 'error');
        }
    }
    // Remove entry
    removeSortCol(event) {
        try {
            const keyId = event.target?.dataset?.keyId ?? event.currentTarget?.dataset?.keyId; 
            if (keyId) {
                const matched = (this.newListView.orderedBy ?? []).find(item => item?.keyId === keyId);
                if (matched) {
                    this.newListView = {
                        ...this.newListView,
                        orderedBy: this.newListView.orderedBy.filter(col => col.keyId !== keyId)
                    };
                }
            }
            this.notifyParentOfChangedState();
        } catch(error) {
            this.showToast('Error in removeSortCol() of newListViewLwc.js', getErrorMessage(error), 'error');
        }
    }
    // Check if "Add sort column" button should be disabled
    get isAddSortColDisabled() {
        if (!this.newListView?.orderedBy?.length) return;

        if (this.newListView.orderedBy.length === 5) {
            return true;
        }

        if (this.newListView.orderedBy.some(col => !col.fieldApiName)) {
            return true;
        }
        return false;
    }
    get isSortRequired() {
        return this.newListView?.orderedBy?.length === 1;
    }
    // Handle Field Api Name selection
    handleSortColFieldSelection(event) {
        try {
            const fieldApiName = event.detail;
            const keyId = event?.target?.dataset?.keyId;
            if (fieldApiName && keyId) {
                const label = this.sortFieldOptions.find(opt => opt?.value === fieldApiName)?.label;
                const matchedCol = this.newListView?.orderedBy?.find(col => col?.keyId === keyId);
                if (label && matchedCol) {
                    this.newListView = {
                        ...this.newListView,
                        orderedBy: this.newListView.orderedBy.map(col => {
                            return col.keyId === keyId
                                ? {...col, fieldApiName, label}
                                : col;
                        })
                    }
                }
            }
            this.notifyParentOfChangedState();
        } catch(error) {
            this.showToast('Error in handleSortColFieldSelection() of newListViewLwc.js', getErrorMessage(error), 'error');
        }
    }
    // Handle "isAscending" change 
    handleAscendingChange(event) {
        try {
            const keyId = event?.target?.dataset?.keyId;
            const isAscending = event?.detail;
           
            if (keyId) {
                const matched = this.newListView.orderedBy.find(col => col.keyId === keyId);
                if (matched) {
                    this.newListView = {
                        ...this.newListView,
                        orderedBy: this.newListView.orderedBy.map(col => {
                            return String(col.keyId) === String(keyId) 
                                ? {...col, isAscending: isAscending}
                                : col;
                        })
                    };
                }
                requestAnimationFrame(() => {
                    this.notifyParentOfChangedState();
                })
            }
        } catch(error) {
            this.showToast('Error in handleAscendingChange() of newListViewLwc.js', getErrorMessage(error), 'error');
        }
    }
    // Clear all sort configs 
    @api clearAllSort() {
        try {
            this.newListView = {
                ...this.newListView,
                orderedBy: [{
                    fieldApiName: '', 
                    label: '',
                    isAscending: true, 
                    keyId: String(KEY_ID++)
                }]
            };
            this.notifyParentOfChangedState();
        } catch(error) {
            this.showToast('Error in clearAllSort() of newListViewLwc.js', getErrorMessage(error), 'error');
        }
    } 
    // Move sort column DOWN (toward the end)
    moveSortColDown(event) {
        try {
            const keyId = event?.target?.dataset?.keyId ?? event?.currentTarget?.dataset?.keyId; 
            const orderedBy = this.newListView?.orderedBy ?? [];
            const matchedIdx = orderedBy.findIndex(col => col.keyId === keyId);

            // Must exist AND not already last
            if (matchedIdx === -1 || matchedIdx === orderedBy.length - 1) return;

            const next = [...orderedBy];
            [next[matchedIdx], next[matchedIdx + 1]] =
                [next[matchedIdx + 1], next[matchedIdx]];

            this.newListView = {
                ...this.newListView,
                orderedBy: next
            };
        } catch (error) {
            this.showToast(
                'Error in moveSortColDown() of newListViewLwc.js',
                getErrorMessage(error),
                'error'
            );
        }
    }
    // Move sort column UP (toward the start)
    moveSortColUp(event) {
        try {
            const keyId = event?.target?.dataset?.keyId ?? event?.currentTarget?.dataset?.keyId;
            const orderedBy = this.newListView?.orderedBy ?? [];
            const matchedIdx = orderedBy.findIndex(col => col.keyId === keyId);

            // Must exist AND not already first
            if (matchedIdx <= 0) return;

            const next = [...orderedBy];
            [next[matchedIdx - 1], next[matchedIdx]] =
                [next[matchedIdx], next[matchedIdx - 1]];

            this.newListView = {
                ...this.newListView,
                orderedBy: next
            };
        } catch (error) {
            this.showToast(
                'Error in moveSortColUp() of newListViewLwc.js',
                getErrorMessage(error),
                'error'
            );
        }
    }
    // ============================================================================ \\


    // Save the list view when parent triggers 
    @api async createListView() {
        try {
            this._isLoading = true;
            const result = await createListInfo(this.newListView);
            return result.data; // or return 'success' if you prefer
        } catch(error) {
            this.showToast('Error in createListView() of newListViewLwc.js', getErrorMessage(error), 'error');
        } finally {
            this._isLoading = false;
        }
    }
    // Update the list view when the parent triggers 
    @api async updateListView() {
        this._isLoading = true;
        try {
            if (this.isUpdateDisplayColumns) {
                const dualBox = this.template.querySelector('[data-id="displayColumns"]');
                if (dualBox) {
                    const fields = dualBox.value;
                    this.newListView = {
                        ...this.newListView,
                        displayColumns: fields
                    };
                    const result = await updateListInfoByName(this.newListView);
                    return result.data; // or return 'success' if you prefer
                } else {
                    this.showToast('Failed to get display columns component in updateListView() of newListViewLwc.js', '', 'warning');
                }
            } else if (this.isUpdateSort) {
                const filteredNewListView = {
                    ...this.newListView,
                    orderedBy: this.newListView.orderedBy
                        ?.filter(col => col.fieldApiName)
                        ?.map(col => ({fieldApiName: col.fieldApiName, isAscending: col.isAscending}))
                }
                const result = await updateListPreferences(filteredNewListView);
                return result.data; // or return 'success' if you prefer
            } else {
                const inputEle = this.template.querySelector('c-slds-input[data-id="list-label"]');
                if (inputEle) {
                    const label = inputEle.getValue();
                    this.newListView = {...this.newListView, label};
                }
                const result = await updateListInfoByName(this.newListView);
                return result.data; // or return 'success' if you prefer
            }
        } catch (error) {
            this.showToast('Error updating list view', getErrorMessage(error), 'error');
            throw error; // IMPORTANT: so parent catch runs if you want it to
        } finally {
            this._isLoading = false;
        }
    }
    // Delete list view when parent triggers
    @api async deleteListView() {
        try {
            this._isLoading = true;
            const result = await deleteListInfo(this.newListView);
            return result; // or return 'success' if you prefer
        } catch(error) {
            this.showToast('Error in deleteListView() of newListViewLwc.js', getErrorMessage(error), 'error');
        } finally {
            this._isLoading = false;
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

}