import {
    buildSelectorString,
    getErrorMessage,
} from 'c/utils';

import {
    OPERATORS,
    OPERATORS_BY_DTYPE,
} from './constants';

export function handleFilterByValueLabel(val, dtype) {
    if (val === null || val === undefined) {
        return '';
    }
    if (dtype === 'boolean') {
        switch(String(val)) {
            case '0':
                return 'false';
            case '1':
                return 'true';
            case 'true':
                return 'true';
            case 'false':
                return 'false';
            default:
                return String(val);
        }
    }
    return val;
}

export function filterOutStoredFields(cmp, displayColumnOptions, storedConditionsArr) {
    try {
        if (!storedConditionsArr?.length || !storedConditionsArr.some(cond => cond.field.value)) {
            return displayColumnOptions;
        }
        const usedFields = storedConditionsArr
            .filter(cond => !!cond.field.value)
            ?.map(cond => cond.field.value);

        if (!usedFields?.length) return displayColumnOptions;
        
        return displayColumnOptions.filter(col => !usedFields.includes(col.value));
    } catch(error) {
        cmp.showToast('Error in filterOutStoredFields() of helpers.js', getErrorMessage(error), 'error');
    }
}

export function handleTemplateErrorItems(cmp, keyIdsArr, isErr=false) {
    const btnsSelector = buildSelectorString('data-key-id', keyIdsArr);
    const filterItemSelector = buildSelectorString('data-key-id', keyIdsArr);

    const buttons = cmp.template.querySelectorAll(btnsSelector);
    const filterItems = cmp.template.querySelectorAll(filterItemSelector);

    buttons.forEach(btn => {
        if (btn) {
            if (isErr) {
                const keyId = btn.dataset.keyId;
                btn.setAttribute('aria-describedby', `error-${keyId}`);
            } else {
                if (btn.hasAttribute('aria-describedby')) {
                    btn.removeAttribute('aria-describedby');
                }
            }
        }
    });
    filterItems.forEach(item => {
        if (item) {
            if (isErr) {
                item.classList.add('slds-has-error');
            } else {
                if (item.classList.contains('slds-has-error')) {
                    item.classList.remove('slds-has-error');
                }
            }
        }
    });
}

export function TO_LOCAL_DTYPE(colInfos) {
    if (!colInfos) return 'text'
    const dtype = colInfos?.dataType;
    if (!dtype || typeof dtype !== 'string') return 'text';
    const dtypeLower = dtype.toLowerCase();

    switch(true) {
        case dtypeLower === 'string': 
            return 'text';
        case dtypeLower === 'double': 
            const scale = colInfos?.scale;
            return scale === 0 ? 'number' : 'decimal';
        case dtype?.toLowerCase() === 'textarea':
            return 'richtext';
        default: 
            return dtypeLower;
    } 
}

export function cleanListInfoOperators(operators) {
    if (!operators?.length) return [];
    return operators.map(op => 
        OPERATORS.find(stored => stored.value === op) ?? null
    ).filter(Boolean);
}


export function getNewFilterMeta(cmp, displayColumnOptions, wiredPicklistVals, objectInfos) {
    try {
        if (!cmp.isListObjectInfoVariant) {
            const fieldInfo = displayColumnOptions.find(col => col.value && col.dtype);
            const colInfos = objectInfos?.data?.fields?.[fieldInfo?.value];
            const localDtype = TO_LOCAL_DTYPE(colInfos);

            const operatorOptions = OPERATORS_BY_DTYPE[fieldInfo?.dtype];
            const picklistOptions = wiredPicklistVals?.[fieldInfo.value] || [];
            const isPicklistType = fieldInfo?.dtype.includes('picklist');

            return {
                field: {
                    label: fieldInfo.label, 
                    value: fieldInfo.value,
                },
                operator: {
                    label: operatorOptions[0].label, 
                    value: operatorOptions[0].value,
                    options: operatorOptions
                },
                filterBy: {
                    value: isPicklistType ? [] : '',
                    options: picklistOptions
                },
                dtype: fieldInfo?.dtype,
                ismultipicklist: isPicklistType, 
                isboolean: fieldInfo?.dtype === 'boolean',
                isdate: fieldInfo?.dtype?.includes('date'),
                isSaved: false,
                isNew: true,
                localDtype,
                errorMessage: null,
            }
        } 

        const fieldInfo = displayColumnOptions.find(col => !!(col.value && col.dtype));
        const fieldValue = fieldInfo.value;
        const fieldLabel = fieldInfo.label;
        const dtype = fieldInfo.dtype;
        const localDtype = TO_LOCAL_DTYPE(fieldInfo);
        const picklistOptions = fieldInfo?.picklistValues ?? [];
        const operatorOptions = fieldInfo.operatorOptions;
        const operatorValue = fieldInfo.defaultFilterOperator;
        const isPicklistType = dtype?.includes('picklist');
        const operatorLabel = operatorOptions.find(op => op.value === operatorValue)?.label ?? '';
        return {
            field: {
                label: fieldLabel, 
                value: fieldValue,
            },
            operator: {
                label: operatorLabel, 
                value: operatorValue,
                options: operatorOptions
            },
            filterBy: {
                label: '',
                value: isPicklistType ? [] : '',
                options: picklistOptions
            },
            dtype,
            ismultipicklist: isPicklistType, 
            isboolean: dtype === 'boolean',
            isdate: dtype?.includes('date'),
            isSaved: false,
            isNew: true,
            localDtype,
            errorMessage: null,
        }
        
    } catch(error) {
        cmp.showToast('Error in getNewFilterMeta() of helpers.js', getErrorMessage(error), 'error');
    }
}

function getMatchedFieldInfo(fieldApiName, fieldInfos, isListObjectInfos) {
    if (isListObjectInfos) {
        return fieldInfos.find(col => col.value === fieldApiName);
    } 
    return Object.values(fieldInfos).find(f => {
        if (f?.apiName === fieldValue) return true;
        if (
            f?.referenceToInfos?.length &&
            f?.referenceToInfos?.[0]?.nameFields?.length 
        ) {
            const apiName = f.referenceToInfos[0].apiName;
            return f.referenceToInfos[0].nameFields.some(ref => `${apiName}.${ref}` === fieldValue);
        }
        return false;
    });
}
function getPicklistOptions(cmp, fieldInfo, isListObjectInfos) {
    if (isListObjectInfos) {
        return fieldInfo.picklistValues;
    }
    return cmp.wiredPicklistVals?.[fieldValue] || [];
}
function getOperatorOptions(dtype, fieldInfo, isListObjectInfos) {
    if (isListObjectInfos) {
        return fieldInfo.operatorOptions;
    }
    return OPERATORS_BY_DTYPE[dtype];
}

export function listInfosByNameToLocal(cmp, listInfosByName, objectInfos, isListObjectInfos=false) {
    try {
        if (!listInfosByName?.filteredByInfo?.length || !objectInfos ) {
            return [];
        }
        if (!objectInfos || (Array.isArray(objectInfos) && !objectInfos?.length)) {
            return [];
        }

        const fieldInfos = isListObjectInfos 
            ? objectInfos
            : objectInfos?.data?.fields;

        const storedConditionsArr = [];
        for (const fbInfo of listInfosByName.filteredByInfo) {
            const fieldValue = fbInfo.fieldApiName;
            const fieldLabel = fbInfo.label;
            const fieldInfo = getMatchedFieldInfo(fieldValue, fieldInfos, isListObjectInfos)
            
            if (!fieldInfo) {
                // Do not know what to do about multiple values for one filter
                cmp.showToast(
                    'Error in helpers.listInfosByNameToLocal() of sldsTableFilterPanelV2.js',
                    `could not find field infos for this field.  label: ${fieldLabel} fieldApiName: ${fieldValue}`, 
                    'warning'   
                );
            }
            // Get the dtype infos
            const dtype = (fieldInfo?.dtype ?? fieldInfo?.dataType)?.toLowerCase() ?? 'text';
            const localDtype = TO_LOCAL_DTYPE(fieldInfo);

            // Check if is picklist
            const ismultipicklist = dtype.includes('picklist') || dtype === 'reference';

            if (!ismultipicklist && fbInfo?.operandLabels?.length > 1) {
                // Do not know what to do about multiple values for one filter
                cmp.showToast(
                    'Error in helpers.listInfosByNameToLocal() of sldsTableFilterPanelV2.js',
                    `${fieldLabel} has operandLabels of length greater than 1 for a non-picklist value: ${JSON.stringify(fbInfo.operandLabels)}`, 
                    'warning'   
                );
            }

            // Get the value for the filter (filterBy.value)
            const filterByValue = ismultipicklist ? fbInfo?.operandLabels ?? []
                : fbInfo?.operandLabels?.length === 1 ? fbInfo.operandLabels[0]
                : '';

            // Get picklist values if dtype is picklist
            const filterByOptions = getPicklistOptions(cmp, fieldInfo, isListObjectInfos)

            // Find operator that matches to listInfo response 
            const operatorMatch = OPERATORS.find(op => 
                op.value === fbInfo?.operator || op.label === fbInfo?.operator
            );

            const operatorValue = operatorMatch?.value ?? fbInfo?.operator;
            const operatorLabel = operatorMatch?.label ?? fbInfo?.operator;
            const operatorOptions = getOperatorOptions(dtype, fieldInfo, isListObjectInfos);

            storedConditionsArr.push({
                field: {label: fieldLabel, value: fieldValue},
                operator: {
                    label: operatorLabel, 
                    value: operatorValue,
                    options: operatorOptions
                },
                filterBy: {
                    value: filterByValue,
                    label: handleFilterByValueLabel(filterByValue, dtype),
                    options: filterByOptions
                },
                dtype,
                ismultipicklist,
                isboolean: dtype === 'boolean',
                localDtype,
                isdate: dtype.includes('date'),  
                isSaved: true,
                isNew: false,
                errorMessage: null,
            });
            
        }

        return storedConditionsArr;
    } catch(error) {
        cmp.showToast('Error in helpers.listInfosByNameToLocal() of sldsTableFilterPanelV2.js', getErrorMessage(error), 'error');
    }
}

export function localToListinInfosByName(storedConditionsArr) {
    return;
}

function toDense(conditionsArr) {
    return (conditionsArr ?? []).map(cond => ({
        field: cond?.field?.value,
        operator: cond?.operator?.value,
        filterBy: cond?.filterBy?.value,
    }));
}

export function conditionsSavable(storedConditionsArr, originalConditionsArr) {
    // Empty conditions is edited and valid if original was not empty
    if (storedConditionsArr.length === 0 && originalConditionsArr.length > 0 ) {
        return true;
    }

    // get only field/operator/filterBy values to compare
    const denseStored = toDense(storedConditionsArr);
    const denseOrig = toDense(originalConditionsArr);


    // ❓❓ all stored conditions have field/operator/filterBy values 
    const allStoredHaveValues = denseStored.every(cond => 
        Object.values(cond).every(val => val)
    );

    if (!allStoredHaveValues) {
        // all properties of conditions do not have values --> abort
        return false; 
    }

    if ( denseStored.length === denseOrig.length ) {
        // If one of the original filters were edited --> then it is valid
        return denseStored.some((stored, index) =>
            JSON.stringify(stored) !== JSON.stringify(denseOrig[index])
        );
    }

    // Check that all conditions have a valid value
    return true;
}