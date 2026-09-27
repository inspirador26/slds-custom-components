import { LightningElement, api, wire } from 'lwc';
import { getListObjectInfo, updateListInfoByName} from 'lightning/uiListsApi';

import { 
    getToastErrorMessage, 
    iconMap as ICON_MAP, 
    getErrorMessage,
} from 'c/utils';

import {
    OPERATORS_BY_DTYPE,
    OWNER_ID_FIELD,
    NUBBIN_RIGHT_TOP,
    NUBBIN_RIGHT_BOTTOM,
    NUBBIN_OFFSET,
    SIDE_GAP,
    TOP_CEILING,
    CURRENT_FILTER_SKELETON,
    DATE_LITERAL_OPTIONS,
} from './constants';

import {
    handleTemplateErrorItems,
    TO_LOCAL_DTYPE,
    filterOutStoredFields,
    listInfosByNameToLocal,
    cleanListInfoOperators,
    getNewFilterMeta,
    handleFilterByValueLabel,
    conditionsSavable
} from './helpers';



let KEY_ID = 999;
function addKeyIds(newOptions) {
    if (!Array.isArray(newOptions)) {
        const keyId = String(KEY_ID++)
        return {
            ...newOptions,
            keyId, 
            errorId: `error-${keyId}`
        }
    }
    return newOptions.map(op => {
        const keyId = String(KEY_ID++)
        return {
            ...op, 
            keyId, 
            errorId: `error-${keyId}`
        };
    })
}


const NOT_OBJECT_DTYPES = [
    'string',
    'number',
    'boolean'
];


export default class SldsTableFilterPanelUiListsApi extends LightningElement {
    iconMap = ICON_MAP;

    storedCustomLogic;
    isShowLogic = false;
    dateLiteralOptions = DATE_LITERAL_OPTIONS;

    @api suppressRenderFocus = false;
    @api tableName;

    @api objectLabel;
    @api pluralLabel;
    @api 
    set objectApiName(val) {
        this._objectApiName = val;
        if (val && this.isListObjectInfoVariant) {
            this._listObjectObjectApiName = val;
        }
    }
    get objectApiName() {
        return this._objectApiName;
    }

    @api renderFocus = false;
    _scopeLabel;
    @api // meta from getListInfosByName api for list view
    set listViewMeta(val) {
        if (val) {
            if (val && val?.result) {
                this._listViewMeta = val.result;
                if(this.isListObjectInfoVariant) {
                    this._listObjectObjectApiName = val.result.listReference.objectApiName;
                }
            } else {
                this._listViewMeta = val;
                if(this.isListObjectInfoVariant) {
                    this._listObjectObjectApiName = val.listReference.objectApiName;
                }
            }
            this._scopeLabel = this._listViewMeta?.scope?.label;
            this.populateSavedFilters();
        } else {
            this._listViewMeta = val;
        }
    }
    get listViewMeta() {
        return this._listViewMeta;
    }

    @api 
    set wiredPicklistVals(val) {
        this._wiredPicklistVals = val;
        if (val) {
            this.populateSavedFilters();
        }
    }
    get wiredPicklistVals() {
        return this._wiredPicklistVals;
    }

    displayColumnOptions = [];
    @api 
    set objectInfos(val) {
        this._objectInfos = val;
        if (val) {
            const fields = val?.data?.fields;
            if (fields) {
                this.displayColumnOptions = Object.values(fields)
                    ?.filter(meta => meta?.filterable && meta?.dataType !== 'Address')
                    ?.map(meta => {
                        return {
                            label: meta?.label,
                            value: meta?.apiName,
                            dtype: meta?.dataType?.toLowerCase()
                        }
                    }).filter(Boolean);
            }
            this.populateSavedFilters();
        }
    }
    get objectInfos() {
        return this._objectInfos;
    }

    
    
    // query list object infos
    _listObjectObjectApiName = undefined;
    @api 
    set isListObjectInfoVariant(val) {
        this._isListObjectInfoVariant = val;
        if (this.objectApiName) {
            this._listObjectObjectApiName = this.objectApiName;
        }
    }
    get isListObjectInfoVariant() {
        return this._isListObjectInfoVariant ?? false;
    }

    _isLoaded = false;
    @wire(getListObjectInfo, {
        objectApiName: '$_listObjectObjectApiName',
    })
    listObjectInfo({ error, data }) {
        if (data) {
            this.displayColumnOptions = (data.columns ?? [])
                ?.filter(meta => meta?.filterable)
                ?.map(meta => {
                    return {
                        label: meta?.label,
                        value: meta?.fieldApiName,
                        dtype: meta?.dataType?.toLowerCase(), 
                        defaultFilterOperator: meta.defaultFilterOperator,
                        operatorOptions: cleanListInfoOperators(meta.supportedFilterOperators),
                        picklistValues: meta.picklistValues?.length 
                            ? meta.picklistValues.map(p => ({
                                label: p.label, 
                                value: p.apiName
                            }))
                            : []
                    }
                }).filter(Boolean);

            this.populateSavedFilters();
        } else if (error) {
            this.showToast('error in listObjectInfo() of newListViewLwc.js', getErrorMessage(error), 'error');
        }
        requestAnimationFrame(() => {
            this._isLoaded = true;
        });
    }

    // Operator and Condition Logic options
    filterBuilderOptions = {
        operatorOptions: [
            {label: 'eqauls', value: 'eq'},
            {label: 'not eqaul to', value: 'notEq'},
            {label: 'greater than', value: 'gt'},
            {label: 'less than', value: 'lt'},
            {label: 'greater or equal', value: 'gtOrEq'},
            {label: 'less or equal', value: 'ltOrEq'},
            {label: 'contains', value: 'contains'},
            {label: 'does not contain', value: 'notContains'},
            {label: 'starts with', value: 'startsWith'}
        ],
        expressionTypeOptions: [
            {label: 'All Conditions Are Met', value: 'allConditions'},
            {label: 'Any Condition Is Met', value: 'anyCondition'},
            {label: 'Custom Logic Is Met', value: 'customLogic'}
        ],

    }
    // Options for filter-type 
    expressionTypeOptions = [
        {label: 'All Conditions Are Met', value: 'allConditions'},
        {label: 'Any Condition Is Met', value: 'anyCondition'},
        {label: 'Custom Logic Is Met', value: 'customLogic'}
    ];

    // ========================= Public Properties ========================= \\
    _storedConditionsArr = [];
    _originalConditons = [];
    // Store the Conditions that the user filters by in Array of Objects
    populateSavedFilters() {
        try {
            const objInfos = this.isListObjectInfoVariant 
                ? this.displayColumnOptions
                : this.objectInfos;

            const savedFilters = listInfosByNameToLocal(
                this, 
                this.listViewMeta, 
                objInfos, 
                this.isListObjectInfoVariant
            );

            if (savedFilters?.length) {
                const originalConditons = savedFilters.map(filt => {
                    return addKeyIds(filt);
                });
                this._originalConditons = originalConditons;
                this._storedConditionsArr = originalConditons;
            } else {
                this._originalConditons = [];
                this._storedConditionsArr = [];   
            }
        } catch(error) {
            this.showToast('Error in populateSavedFilters() of sldsTableFilterPanelV2.js', getErrorMessage(error), 'error');
        }
    }

    // Database column options --> Array of objects --> Sample Object: {label: My Field 1, value: My_Field_1, dtype: 'number'}
    _columnOptions;
    @api 
    set columnOptions(val) {
        try {
            if (val) {
                this._columnOptions = val.map(col => {
                    return col.hasOwnProperty('dtype') && col.dtype 
                        ? col 
                        : {...col, dtype: 'text'}
                });
            }
        } catch(error) {
            getToastErrorMessage('set columnOptions()', 'sldsTableFilterPanel.js', error);
        }
    } 
    get columnOptions() {
        return this._columnOptions
    }
    // ====================================================================== \\

    @api size = 'medium';

    currentFilter = CURRENT_FILTER_SKELETON;
    _didFocus = false;
    // *************** NEW FILTER HANDLERS *************** \\
    _popoverAnchor;
    _popoverOpen = false;
    _wired = false;
    renderedCallback() {
        if (!this.suppressRenderFocus && !this._didFocus) {
            const closeBtn = this?.refs?.closeButton;
            if (closeBtn) {
                console.log('got the close button: ', closeBtn);
                closeBtn.focus();
                this._didFocus = true;
            }
        }

        if (this._wired) return;
        this._wired = true;

        window.addEventListener('resize', this._onResize = () => {
            if (this._popoverOpen) this.openPopover(this._popoverAnchor);
        });

        window.addEventListener('scroll', this._onScroll = () => {
            if (this._popoverOpen) this.openPopover(this._popoverAnchor);
        }, true); // capture scrolls in nested containers
    }
    disconnectedCallback() {
        window.removeEventListener('resize', this._onResize);
        window.removeEventListener('scroll', this._onScroll, true);
    }


    openPopover(anchorEl) {        
        try {
            const pop = this?.refs?.filterPopover;
            if (!pop || !anchorEl) return;

            pop.classList.remove('slds-hide');
            pop.classList.add('slds-show');

            // measure offscreen
            pop.style.left = '-10000px';
            pop.style.top = '-10000px';
            pop.style.maxHeight = '';
            pop.style.overflowY = '';

            const a = anchorEl.getBoundingClientRect();
            let p = pop.getBoundingClientRect();

            // LEFT of anchor (right nubbin)
            const left = a.left - p.width - SIDE_GAP;
            pop.style.left = `${Math.round(left)}px`;

            // ----------------------------
            // FIXED: choose nubbin mode that fits WITHOUT clamping
            // ----------------------------

            const anchorCenterY = a.top + (a.height / 2);

            // IMPORTANT: SLDS nubbin isn't at 0px from top/bottom. It's inset.
            // These are the "nubbin point" distances INSIDE the popover.
            // If your current NUBBIN_OFFSET was tuned for bottom, keep it for bottom.
            const NUBBIN_FROM_TOP = NUBBIN_OFFSET;     // tweak if needed (often ~24-32)
            const NUBBIN_FROM_BOTTOM = NUBBIN_OFFSET;  // tweak if needed

            // Candidate top values that make the nubbin point at the anchor center:
            const topForRightTop = anchorCenterY - NUBBIN_FROM_TOP;
            const topForRightBottom = anchorCenterY - (p.height - NUBBIN_FROM_BOTTOM);

            // Fit checks (no clamp)
            const fitsTop = (topForRightTop >= TOP_CEILING) && ((topForRightTop + p.height) <= window.innerHeight);
            const fitsBottom = (topForRightBottom >= TOP_CEILING) && ((topForRightBottom + p.height) <= window.innerHeight);

            let top;
            let useRightTop;

            if (fitsTop && !fitsBottom) {
                useRightTop = true;
                top = topForRightTop;
            } else if (fitsBottom && !fitsTop) {
                useRightTop = false;
                top = topForRightBottom;
            } else if (fitsBottom && fitsTop) {
                // both fit: choose whichever keeps it closer to the anchor without pushing upward
                // (you can swap preference if you want)
                useRightTop = false;
                top = topForRightBottom;
            } else {
                // Neither fits perfectly. Pick the one with less overflow, THEN clamp as last resort.
                const overflowTop =
                    Math.max(0, TOP_CEILING - topForRightTop) +
                    Math.max(0, (topForRightTop + p.height) - window.innerHeight);

                const overflowBottom =
                    Math.max(0, TOP_CEILING - topForRightBottom) +
                    Math.max(0, (topForRightBottom + p.height) - window.innerHeight);

                useRightTop = overflowTop <= overflowBottom;
                top = useRightTop ? topForRightTop : topForRightBottom;

                // last resort clamp
                const maxTop = window.innerHeight - p.height;
                top = Math.min(Math.max(top, TOP_CEILING), maxTop);
            }

            // Apply nubbin class
            if (useRightTop) {
                pop.classList.add(NUBBIN_RIGHT_TOP);
                pop.classList.remove(NUBBIN_RIGHT_BOTTOM);
            } else {
                pop.classList.add(NUBBIN_RIGHT_BOTTOM);
                pop.classList.remove(NUBBIN_RIGHT_TOP);
            }

            // If it still can't fit, constrain height and re-evaluate (keeps your existing behavior)
            const availableH = window.innerHeight - TOP_CEILING;
            if (p.height > availableH) {
                pop.style.maxHeight = `${Math.floor(availableH)}px`;
                pop.style.overflowY = 'auto';

                p = pop.getBoundingClientRect();

                // Recompute candidates with new height
                const topTop2 = anchorCenterY - NUBBIN_FROM_TOP;
                const topBottom2 = anchorCenterY - (p.height - NUBBIN_FROM_BOTTOM);

                const fitsTop2 = (topTop2 >= TOP_CEILING) && ((topTop2 + p.height) <= window.innerHeight);
                const fitsBottom2 = (topBottom2 >= TOP_CEILING) && ((topBottom2 + p.height) <= window.innerHeight);

                if (fitsBottom2 || !fitsTop2) {
                    useRightTop = false;
                    top = topBottom2;
                    pop.classList.add(NUBBIN_RIGHT_BOTTOM);
                    pop.classList.remove(NUBBIN_RIGHT_TOP);
                } else {
                    useRightTop = true;
                    top = topTop2;
                    pop.classList.add(NUBBIN_RIGHT_TOP);
                    pop.classList.remove(NUBBIN_RIGHT_BOTTOM);
                }

                const maxTop2 = window.innerHeight - p.height;
                top = Math.min(Math.max(top, TOP_CEILING), maxTop2);
            }

            pop.style.top = `${Math.round(top)}px`;

            this._popoverAnchor = anchorEl;
            this._popoverOpen = true;
        } catch (error) {
            this.showToast('Error in openPopover() of sldsTableFilterPanel.js', getErrorMessage(error), 'error');
        }
    }
    _nextFrame() {
        return new Promise(resolve => requestAnimationFrame(resolve));
    }
    async openPopoverThenFocus(anchorEl) {
        this.openPopover(anchorEl);

        // Give the browser a paint/layout cycle so focus + measurements are stable.
        await this._nextFrame();

        const fieldPicklist = this.template.querySelector('c-slds-combobox[data-id="fieldPicklist"]');
        fieldPicklist?.focusMe?.();
    }
    closePopover() {
        try {
            const pop = this?.refs?.filterPopover;
            if (!pop) return;
            this.currentFilter = CURRENT_FILTER_SKELETON;
            pop.classList.add('slds-hide');
            pop.classList.remove('slds-show');
            this._popoverOpen = false;
            this._popoverAnchor = null;
        } catch(error) {
            this.showToast('Error in closePopover() of sldsTableFilterPanel.js', getErrorMessage(error), 'error');
        }
    }

    addFilter() {
        try {
            // Filter out field names that have been used in the stored Conditions
            const filteredDisplayColumns = filterOutStoredFields(
                this, 
                this.displayColumnOptions, 
                this._storedConditionsArr
            );
            // Create a new stored condition
            const preFilter = getNewFilterMeta(
                this, 
                filteredDisplayColumns, 
                this.wiredPicklistVals, 
                this.objectInfos
            );
            // Add a key id to the single filter item
            const currentFilter = addKeyIds(preFilter);

            // push it to the conditions array
            this._storedConditionsArr = [
                ...this._storedConditionsArr,
                currentFilter
            ];
            
            const keyId = currentFilter.keyId;

            requestAnimationFrame(() => {
                try {
                    const btn = this.template.querySelector(`[data-key-id="${keyId}"][data-element="edit-filter"]`);
                    if (btn) btn.click();
                } catch (e) {
                    this.showToast('Error after addFilter()', getErrorMessage(e), 'error');
                }
            });
            
        } catch(error) {
            this.showToast('Error in addFilter() of sldsTableFilterPanelV2.js', getErrorMessage(error), 'error');
        }
    }
    
    editFilter(event) {
        try {
            const keyId = event?.currentTarget?.dataset?.keyId;
            
            if (keyId) {
                this.currentFilter = this._storedConditionsArr.find(filter => filter.keyId === keyId);
                //console.log('here is current filter in SldsTableFilterPanelUiListsApi.js: ', JSON.stringify(this.currentFilter));
                // Anchor = the clicked button (DO NOT overthink this)
                const anchor = event.currentTarget;
                // Let DOM update, then open popover
                requestAnimationFrame(() => {
                    this.openPopoverThenFocus(anchor);
                });
            }
        } catch(error) {
            this.showToast('Error in editFilter() of sldsTableFilterPanelV2.js', getErrorMessage(error), 'error');
        }
    }


    saveCurrentFilter() {
        try {
            // Mark filter as "added" (not saved and not new)
            const newFilter = {
                ...this.currentFilter,
                isSaved: false,
                isNew: false
            };
            // Update the conditions array w/ the new values 
            this._storedConditionsArr = this._storedConditionsArr.map(cond => {
                if (cond.keyId === newFilter.keyId) {
                    return newFilter;
                }
                return cond;
            });

            this.closePopover();
        } catch(error) {
            this.showToast('Error in saveCurrentFilter() of sldsTableFilterPanelV2.js', getErrorMessage(error), 'error');
        }
    }


    // handle "Field" selection within the popover
    handleFieldSelection(message) {
        try {
            if (message?.detail) {
                const val = message.detail;
                if (val === this.currentFilter?.field?.value) return;
                const fieldMeta = this.displayColumnOptions.find(f => f.value === val);


                if (this.isListObjectInfoVariant) {
                    const fieldValue = fieldMeta.value;
                    const fieldLabel = fieldMeta.label;
                    const dtype = fieldMeta.dtype;
                    const localDtype = TO_LOCAL_DTYPE(fieldMeta);
                    const picklistOptions = fieldMeta.picklistValues;
                    const operatorOptions = fieldMeta.operatorOptions;
                    const operatorValue = fieldMeta.defaultFilterOperator;
                    const isPicklistType = dtype?.includes('picklist');
                    const operatorLabel = operatorOptions.find(op => op.value === operatorValue)?.label ?? ''
                    
                    const newFilter = {
                        ...this.currentFilter,
                        field: {label: fieldLabel, value: fieldValue},
                        operator: {
                            label: operatorLabel, 
                            value: operatorValue,
                            options: operatorOptions
                        },
                        filterBy: {
                            options: picklistOptions || [],
                            value: isPicklistType ? [] : ''
                        },
                        ismultipicklist: isPicklistType,
                        isboolean: fieldMeta.dtype === 'boolean',
                        isdate: fieldMeta.dtype.includes('date'),
                        dtype: fieldMeta.dtype,
                        localDtype,
                    };
                    this.currentFilter = newFilter;
                    return;
                }

                const colInfos = this.objectInfos?.data?.fields?.[fieldMeta.value];
                const localDtype = TO_LOCAL_DTYPE(colInfos);

                const operatorOptions = OPERATORS_BY_DTYPE?.[fieldMeta?.dtype] ?? operatorOptions.string;
                const picklistOptions = this.wiredPicklistVals?.[fieldMeta.value] ?? [];

                const newFilter = {
                    ...this.currentFilter,
                    field: {label: fieldMeta.label, value: fieldMeta.value},
                    operator: {
                        label: operatorOptions[0].label, 
                        value: operatorOptions[0].value,
                        options: operatorOptions
                    },
                    filterBy: {
                        options: picklistOptions || [],
                        value: fieldMeta.dtype.includes('picklist') ? [] : ''
                    },
                    ismultipicklist: fieldMeta.dtype.includes('picklist'),
                    isboolean: fieldMeta.dtype === 'boolean',
                    isdate: fieldMeta.dtype.includes('date'),
                    dtype: fieldMeta.dtype,
                    localDtype,
                };
                this.currentFilter = newFilter;
            }
        } catch(error) {
            this.showToast('Error in handleFieldSelection() of sldsTableFilterPanelV2.js', getErrorMessage(error), 'error');
        }
    }
    // Handle "Operator" selection within the popover
    handleOperatorSelection(message) {
        try {
            const value = message.detail;
            const options = this.currentFilter.operator.options;
            const label = options.find(opt => opt.value === value)?.label;
            const operator = {value, label, options};
            this.currentFilter = {...this.currentFilter, operator: operator};
            this.updateErrorState(false);
        } catch(error) {
            this.showToast('Error in handleOperatorSelection() of sldsTableFilterPanelV2.js', getErrorMessage(error), 'error');
        }
    }
    // Handle "Filter By" selection within the popover (multi-picklist, regular input, boolean)
    handleFilterByMultiVal(message) {
        try {
            const pillValues = message.detail?.map(opt => 
                opt?.value ?? opt
            ) ?? [];
            const currentFilter = this.currentFilter;
            currentFilter.filterBy.value = pillValues;
            this.currentFilter = currentFilter;
            this.updateErrorState(false);
        } catch(error) {
            this.showToast('Error in handleFilterByMultiVal() of sldsTableFilterPanelV2.js', getErrorMessage(error), 'error');
        }
    }
    handleFilterByInput(message) {
        // Get the updated value
        const details = message.detail;
        const val = typeof details === 'object'
            ? details[Object.keys(details)[0]]
            : details;

        this.currentFilter = {
            ...this.currentFilter,
            filterBy: {
                value: val,
                label: val,
                options: this.currentFilter.filterBy?.options ?? []
            }
        }
    }
    handleFilterByDateInput(message) {
        try {
            const value = message?.detail?.selection?.value;
            const currentFilter = this.currentFilter;
            currentFilter.filterBy.value = value;
            currentFilter.filterBy.label = value;
            this.currentFilter = currentFilter; 
        } catch(error) {
            this.showToast('Error in handleFilterByDateInput() of sldsTableFilterPanelV2.js', getErrorMessage(error), 'error');
        }
    }
    handleFilterByBoolean(event) {
        try {
            const value = event.target.value;
            const checked = event.target.checked;
            const filterObj = this.currentFilter;

            if (checked) {
                const otherInput = value === "false" ? this?.refs?.boolTrue
                    : this?.refs?.boolFalse;
                if (otherInput) {
                    otherInput.checked = false;
                }
                filterObj.filterBy.value = value;
            } else {
                filterObj.filterBy.value = null;
            }

            filterObj.filterBy.label = handleFilterByValueLabel(value, 'boolean');
            this.currentFilter = filterObj;

        } catch(error) {
            this.showToast('Error in handleFilterByBoolean() of sldsTableFilterPanelV2.js', getErrorMessage(error), 'error');
        }
    }

    // Check for missing field/operator/filterBy values in the fitlers
    updateErrorState(isSave=false) {
        try {
            // Do not flood the user with error messages on every field update
            if (!isSave && !this._hasErrors) return;

            // Check for missing operator, field or filter by values
            this._storedConditionsArr = this._storedConditionsArr.map(cond => {
                const errsArr = [];
                if (!cond.filterBy.value) {
                    errsArr.push('value')
                }
                if (!cond.field.value) {
                    errsArr.push('field');
                }
                if (!cond.operator.value) {
                    errsArr.push('operator');
                }
                if (!errsArr.length > 0) {
                    return {...cond, errorMessage: null};
                }
                const errorMessage = errsArr.length === 1
                    ? `${errsArr[0]} is required`
                    : `${errsArr.join(', ')} are required`;

                return {...cond, errorMessage}
            });

            // Enter error state if any of the filters have error messages
            const errorKeyIds = (this._storedConditionsArr ?? [])
                ?.filter(cond => cond.errorMessage)
                ?.map(cond => cond.keyId);

            const notErrorKeyIds = (this._storedConditionsArr ?? [])
                ?.filter(cond => !cond.errorMessage)
                ?.map(cond => cond.keyId);

            if (errorKeyIds?.length) {
                handleTemplateErrorItems(this, errorKeyIds, true);
                this._hasErrors = true;
            } else {
                this._hasErrors = false;
            }
            if (notErrorKeyIds?.length) {
                handleTemplateErrorItems(this, notErrorKeyIds, false);
            }
        } catch(error) {
            this.showToast('Error in updateErrorState() of sldsTableFilterPanelV2.js', getErrorMessage(error), 'error');
        }
    }

    // Handle "Delete" clicks
    removeAllFilters() {
        this._storedConditionsArr = [];
    }
    removeFilter(event) {
        try {
            const keyId = event.target?.dataset?.keyId;
            if (this._popoverOpen && this._popoverAnchor?.dataset?.keyId === keyId) {
                this.closePopover();
            }
            if (keyId) {
                this._storedConditionsArr = this._storedConditionsArr.filter(cond => cond.keyId !== keyId);
            }
        } catch(error) {
            this.showToast('Error in removeFilter() of sldsTableFilterPanelV2.js', getErrorMessage(error), 'error');
        }
    }
    // ***************************************************** \\


    



    // =============================== Getters ============================== \\
    // Outermost HTML element (slds Panel)
    get panelCl() {
        // Possible XLarge strings
        const xlsArr = ['x-large', 'xl', 'extralarge', 'xlarge', 'x_large'];
        // Size to CSS  class mapping
        const sizes = {
            small: 'slds-size_small', 
            medium: 'slds-size_medium', 
            large: 'slds-size_large', 
            xlarge: 'slds-size_x-large', 
            full: 'slds-size_full'
        }

        // Base CSS Class
        const panelCl = 'slds-panel slds-panel_docked slds-panel_docked-right slds-is-open slds-is-relative';
        // Size public property lower case
        const size = this.size ? this.size.toLowerCase() : 'medium';
        
        return xlsArr.some(xlStr => xlStr === size) 
            ? `${panelCl} ${sizes.xlarge}` 
            : `${panelCl} ${sizes[size]}`;
    }
    // Check whether the Filter Config is Savable
    get isComplete() {
        if (this.customLogic) return true;
        if (this._storedConditionsArr.some(cond => cond.isNew)) return false;
        return conditionsSavable(this._storedConditionsArr, this._originalConditons);
    }
    // Toggle numbered filtered-conditions list using 'slds-list_ordered' on the <ol> element
    get olClass() {
        return this.isShowLogic 
            ? 'slds-list_ordered slds-list_vertical slds-list_vertical-space' 
            : 'slds-list_vertical slds-list_vertical-space';
    } 
    // ====================================================================== \\







    // ======================= Custom Logic Handlers ======================= \\
    conditionReferenceWarning;
    customLogic;
    // Display the current Filter Conditions' logic in textarea
    showCustomLogic() {
        try {
            if (!this.customLogic) {
                let cnt = 0;
                this.customLogic = this._storedConditionsArr.map(cond => {
                    cnt += 1;
                    return `${cnt}`;
                }).join(' AND '); 

                this.isShowLogic = true; 

            } else if(this.isShowLogic && this.customLogic) { 
                const crntLogic = this.template.querySelector('[data-id="customLogic"]').getValue();
                if (crntLogic === this.customLogic) {
                    let cnt = 0;
                    this.customLogic = this._storedConditionsArr.map(cond => {
                        cnt += 1;
                        return `${cnt}`;
                    }).join(' AND '); 
                }
            }

            // If new filters added while editing custom logic, display warning that some conditions may not be included
            if (this.isShowLogic && this._storedConditionsArr && this._storedConditionsArr.length) {
                const conditionIdxs = this._storedConditionsArr.map((_, i) => `${i + 1}`);
                const logicIdxs = this.customLogic.match(/\d+/g);
                if (conditionIdxs.length > logicIdxs.length) {
                    this.conditionReferenceWarning = 'Some filter conditions are defined but not referenced in your filter logic.';
                } else if(logicIdxs.length > conditionIdxs.length) {

                } else {    
                    this.conditionReferenceWarning = null;
                }
            }
        } catch(error) {
            this.showToast('Error in showCustomLogic() of sldsTableFilterPanel.js', getErrorMessage(error), 'error');
        }
    }
    // Child Event Handler: Remove Custom Logic Textarea input
    handleEscapeMessage() {
        this.isShowLogic = false;
        this.customLogic = null;
    }
    // Child Event Handler: Update Custom Logic If user writes something
    handleNewCustomLogic(message) {
        try {
            // Get the updated value
            const details = message.detail;
            const val = typeof details === 'object'
                ? details[Object.keys(details)[0]]
                : details;
            
            if (val !== undefined) {
                this.storedConditionsArr = val;
            }
            
            this.customLogic = null;
        } catch(error) {
            this.showToast('Error in handleInputMessage() of sldsTableFilterPanel.js', getErrorMessage(error), 'error');
        }
    }
    // Check for parentheses errors
    isCustomLogicError() {
        try {
            this.customLogic = this.template.querySelector('[data-id="customLogic"]').getValue();
            // Check for errors in parentheses
            function hasFaultyLogic(input) {
                const tokens = input.match(/\d+|AND|OR|\(|\)/g);

                if (!tokens) return false;

                for (let i = 0; i < tokens.length - 2; i++) {
                    const a = tokens[i];
                    const b = tokens[i + 1];
                    const c = tokens[i + 2];

                    // Look for: NUMBER AND NUMBER OR NUMBER (or the reverse)
                    if (
                        /\d+/.test(a) &&
                        (b === 'AND' || b === 'OR') &&
                        /\d+/.test(c)
                    ) {
                        const nextOp = tokens[i + 3];
                        if (nextOp === 'AND' || nextOp === 'OR') {
                            // Check if AND/OR alternates and is not inside parentheses
                            if (b !== nextOp) {
                                return true;
                            }
                        }
                    }
                }

                return false;
            }

            // Get number of defined conditions 
            const conditionIdxs = this._storedConditionsArr.map((_, i) => `${i + 1}`);
            // Get numbers mentioned in custom logic
            const logicIdxs = this.customLogic.match(/\d+/g);

            // Check if AND/OR count equals 1 - conditionsIdxs.length
            const andOrCnt = this.customLogic.match(/\b(?:AND|OR)\b/gi) || [];
            const notValidAndOr = andOrCnt.length !== conditionIdxs - 1;

            switch(true) {
                // More Filter Conditions than Custom Logic 
                case conditionIdxs.length > logicIdxs.length:
                    return 'Some filter conditions are defined but not referenced in your filter logic.';
                // Logic has more Conditions than Filter Conditions
                case logicIdxs.length > conditionIdxs.length:
                    const conditionIdxSet = new Set(conditionIdxs);
                    return `The filter logic references an undefined filter: ${logicIdxs.find(logic => !conditionIdxSet.has(logic))}.`;
                // Partentheses misplacement
                case hasFaultyLogic(this.customLogic): 
                    return 'Your filter must use parentheses around successive AND and OR expressions. Ex: "1 AND (2 OR 3) OR (5 AND 6)"';
                // And/Or:conditions ratio out of balance
                case notValidAndOr:
                    return 'Check the spelling in your filter logic.';
                // Whatever
                case conditionIdxs.length !== logicIdxs.length:  
                    return 'Check the spelling in your filter logic.';
                default:
                    return null;
                
            }

        } catch(error) {
            this.showToast('Error in isCustomLogicError() of sldsTableFilterPanel.js', getErrorMessage(error), 'error');
        }
    }
    // Translate user expression to a filter expression
    compileFilterExpression(input) {
        try {
            const tokens = input.match(/\d+|AND|OR|\(|\)/g);
            if (!tokens) return '';

            const precedence = { OR: 1, AND: 2 };

            function toPostfix(tokens) {
                const output = [];
                const stack = [];

                for (const token of tokens) {
                    if (/\d+/.test(token)) {
                        output.push(token);
                    } else if (token === '(') {
                        stack.push(token);
                    } else if (token === ')') {
                        while (stack.length && stack[stack.length - 1] !== '(') {
                            output.push(stack.pop());
                        }
                        stack.pop(); // Remove '('
                    } else if (token === 'AND' || token === 'OR') {
                        while (
                            stack.length &&
                            precedence[stack[stack.length - 1]] >= precedence[token]
                        ) {
                            output.push(stack.pop());
                        }
                        stack.push(token);
                    }
                }

                while (stack.length) {
                    output.push(stack.pop());
                }

                return output;
            }

            function toInfix(postfix) {
                const stack = [];

                for (const token of postfix) {
                    if (/\d+/.test(token)) {
                        stack.push(token);
                    } else if (token === 'AND' || token === 'OR') {
                        const right = stack.pop();
                        const left = stack.pop();
                        stack.push(`(${left} ${token} ${right})`);
                    }
                }

                return stack[0];
            }

            const postfix = toPostfix(tokens);
            return toInfix(postfix);
        
        } catch(error) {
            this.showToast('Error in compileFilterExpression() of sldsTableFilterPanel.js', getErrorMessage(error), 'error');
        }
    }
    // ====================================================================== \\


    // Close the filter panel 
    cancelFilterPanel() {
        this.dispatchEvent(new CustomEvent('close', { detail: 'close' } ));
    }
    cancelNewFilters() {
        this._storedConditionsArr = this._originalConditons;
        this.customLogic = null;
        this.isShowLogic = false;
    }

    _hasErrors = false;
    _isLoading = false;
    async handleSave() {
        let result;
        try {
            this._isLoading=true;
            this.updateErrorState(true);

            if (this._hasErrors) {
                return;
            }
            result = await this.updateListFilters();
        } catch(error) {
            this.showToast('Error in handleSave() of sldsTableFilterPanelV2.js', getErrorMessage(error), 'error');
        } finally {
            this._isLoading = false;
            if (result?.data) {
                this.dispatchEvent(new CustomEvent('filtersupdated', { detail: 'filtersupdated' } ));
            } else if (result?.error) {
                this.showToast('Error updating list view in sldsTableFilterPanelV2.js: ', getErrorMessage(result.error), 'error');
            }
        }
    }
    async updateListFilters() {
        try {
            const filtersArr = (this._storedConditionsArr ?? [])
                .filter(c => c?.field?.value && c?.operator?.value); // only valid ones

            const filterLogicString = filtersArr
                .map((_, i) => String(i + 1))
                .join(' AND ');

            const filteredByInfoArr = filtersArr.map(c => {
                const fieldApiName = c.field.value;
                const operator = c.operator.value;

                const raw = c.filterBy?.value;

                // normalize to string[]
                const operandLabels = Array.isArray(raw)
                    ? raw.filter(v => v !== null && v !== undefined && v !== '')
                    : (raw !== null && raw !== undefined && raw !== '' ? [raw] : []);

                return { fieldApiName, operator, operandLabels };
            });

            return await updateListInfoByName({
                objectApiName: this.objectApiName,
                listViewApiName: this._listViewMeta.listReference.listViewApiName,
                filterLogicString,
                filteredByInfo: filteredByInfoArr
            });
        } catch(error) {
            this.showToast('Error in updateListFilters() of sldsTableFilterPanelV2.js', getErrorMessage(error), 'error');
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