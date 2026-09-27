/**
 * sldsComboboxSearch — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/utils.
 * - Salesforce/platform modules: lwc, @salesforce/apex,
 * @salesforce/apex/DynamicSObjectController.fetchRecordsDynamicWithConditionCached.
 * - Template children (including conditional UI): c-toast-lwc, c-tooltip-button, lightning-icon,
 * lightning-spinner.
 * - Bundle template: sldsComboboxSearch.html; local styles: sldsComboboxSearch.css. Salesforce SLDS
 * styling is expected.
 * - Shared CSS modules: c/sharedStylesGlobal, c/sharedStylesSldsCombobox.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-combobox-search') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - isRequired (is-required): Marks the control as required; validation behavior is component-specific.
 * Declared default: false.
 *   Example: child.isRequired = true;
 * - placeHolder (place-holder): Prompt shown when the input has no selection or text. Declared default:
 * 'Search...'.
 *   Example: child.placeHolder = "Select an option";
 * - isSelectionVariant (is-selection-variant): Restricts the searchable input to option-selection
 * behavior. Declared default: false.
 *   Example: child.isSelectionVariant = true;
 * - isLoading (is-loading): Shows the searchable combobox loading state. Declared default: false.
 *   Example: child.isLoading = true;
 * - focusOnReady (focus-on-ready): Focuses the input after it becomes available/rendered.
 *   Example: child.focusOnReady = true;
 * - labelMargin (label-margin): CSS margin applied to the search label.
 *   Example: child.labelMargin = "0 0 0.25rem";
 * - labelFontWeight (label-font-weight): CSS font weight applied to the search label.
 *   Example: child.labelFontWeight = "600";
 * - height (height): CSS input/control height, including units.
 *   Example: child.height = "2rem";
 * - borderRadius (border-radius): CSS corner radius, including units.
 *   Example: child.borderRadius = "0.25rem";
 * - fontSize (font-size): CSS text size, including units.
 *   Example: child.fontSize = "0.875rem";
 * - queryObj (query-obj): Server lookup configuration: objectApiName, nameField, conditions and optional
 * metaOne through metaFour field names.
 *   Example: child.queryObj = { objectApiName: 'Account', nameField: 'Name', conditions: 'Id != null LIMIT
 * 25', metaOne: 'Industry' };
 * - leftIcon (left-icon): Leading SLDS icon name or icon configuration object.
 *   Example: child.leftIcon = "standard:account";
 * - isAddon (is-addon): Uses styles intended for an adjacent addon control.
 *   Example: child.isAddon = true;
 * - isGrow (is-grow): Allows the dropdown to grow beyond its usual constrained layout.
 *   Example: child.isGrow = true;
 * - isDropdownUp (is-dropdown-up): Positions the searchable dropdown above the input.
 *   Example: child.isDropdownUp = true;
 * - inputIcon (input-icon): SLDS icon replacing the default search indicator.
 *   Example: child.inputIcon = "utility:search";
 * - labelTop (label-top): Label above the searchable input.
 *   Example: child.labelTop = "Account";
 * - labelBottom (label-bottom): Supporting label below the searchable input.
 *   Example: child.labelBottom = "Choose an account";
 * - menuTitle (menu-title): Optional heading above dropdown options.
 *   Example: child.menuTitle = "Available options";
 * - dtype (dtype): Input data type controlling rendering and value conversion.
 *   Example: child.dtype = "text";
 * - dropdownLeft (dropdown-left): Selects the named horizontal dropdown alignment. Declared default:
 * false.
 *   Example: child.dropdownLeft = true;
 * - dropdownRight (dropdown-right): Selects the named horizontal dropdown alignment. Declared default:
 * false.
 *   Example: child.dropdownRight = true;
 * - currentValue (current-value): Initial search/selected value; accepts a string or the selection object
 * used internally.
 *   Example: child.currentValue = "acme";
 * - options (options): Option array with label and value; optional icon/metadata support depends on the
 * variant.
 *   Example: child.options = [{ label: 'Open', value: 'open' }];
 *
 * Public methods (call on the rendered child):
 * - clearMe(): Clear/reset the input value.
 * - focusMe(): Focus the component input/control.
 * - getValue(): Read the current component value.
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-slds-combobox-search label-top="Account" options={options}
 *         is-selection-variant={enabled} oncombometaselection={handleSelection}>
 *     </c-slds-combobox-search>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     enabled = true;
 *     options = [{ label: 'Acme', value: 'acme', metaOne: 'Manufacturing' }];
 *     value;
 *     handleSelection(event) { this.value = event.detail; }
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Use for searchable choices with optional metadata. combometaselection.detail is the scalar value (null
 * on clear); comboboxopen and popoverclose signal visibility changes.
 * - Server-backed variant: replace options={options} with query-obj={query}; define query = {
 * objectApiName: 'Account', nameField: 'Name', conditions: 'Id != null LIMIT 25', metaOne: 'Industry' }.
 * The Apex lookup supplies records and turns on selection mode. Its conditions must include a predicate
 * when supplied because Apex adds WHERE; a standalone LIMIT clause is invalid. Use valid object/field
 * names and conditions supported by DynamicSObjectController.
 */

import { LightningElement, track, api, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';

import {
    publicPropertyToBool, 
    iconMap as ICON_MAP, 
    iconPath,
    iconByObjectApiNameV2,
    getErrorMessage,
    getCleanMetaDataLabels
} from 'c/utils';

import fetchRecordsDynamicWithConditionCached from '@salesforce/apex/DynamicSObjectController.fetchRecordsDynamicWithConditionCached';

const META_KEYS = ['metaOne', 'metaTwo', 'metaThree', 'metaFour'];
/* Example Usage:

    Selection Variant (use this when the combobox is more than merely a search utility):
        JS: 
            _wiredPublicAccountsResult;
            @wire(fetchRecordsDynamicWithConditionCached, {objectName: '$_publicAccountApiName', fieldApiNames: '$_publicAccountFieldApiNames', conditions: '$_publicAccountCondition'})
            wiredPublicAccounts(result) {
                this._wiredPublicAccountsResult = result;
                const { data, error } = result;
                if (data) {
                    this.publicAccountOptions = data?.map(rec => {
                        const label = rec?.[PUBLIC_ACCOUNT_LEGAL_BUSINESS_NAME_FIELD.fieldApiName] ?? rec?.[PUBLIC_ACCOUNT_NAME_FIELD.fieldApiName];
                        const value = rec?.['Id'];
                        const metaOne = `Staus: ${rec?.[PUBLIC_ACCOUNT_REGISTRATION_STATUS_FIELD.fieldApiName] ?? 'n/a'}`;
                        const metaTwo = `CAGE: ${rec?.[PUBLIC_ACCOUNT_CAGE_FIELD.fieldApiName] ?? 'n/a'}`;
                        // Add the combobox entry
                        return {label, value, metaOne, metaTwo, icon: 'custom:custom24'};
                    });
                } else if (error) {
                    this.showToast('Error in wiredFinishedParts() of ListViewFinishedPartsDynamic.js: ', getErrorMessage(error), 'error');
                }
            }
        
        HTML: 
            <c-slds-combobox-search
                is-selection-variant="true"
                is-grow="true"
                options={publicAccountOptions} 
                place-holder="Search Public Accounts..."
            ></c-slds-combobox-search>


*/
    

function resolveOptionsClass(cmp, option) {
   
    const isMeta = cmp._isMeta === 'yes' ? true 
        : cmp._isMeta === 'no' ? false
        : META_KEYS.some(mk => cmp._options.some(op => !!op[mk]));
    
    const hasMeta = META_KEYS.some(mK => !!option?.[mK]);

    const hasIcon = option?.icon;
 
    const optionClass = (isMeta && hasMeta) 
        ? 'slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta'
        : hasIcon 
            ? 'slds-media slds-media_center slds-listbox__option slds-listbox__option_entity slds-listbox__option_plain'
        : 'slds-media slds-media_center slds-listbox__option slds-listbox__option_entity slds-listbox__option_plain'

    return {isMeta, hasMeta, optionClass};
    
}

function isBoldFont(val) {
    if (val === 'bold') return true;
    const numberVal = Number(val);
    const isValidNumber = !isNaN(numberVal) && Number.isFinite(numberVal);
    
    return isValidNumber && numberVal >= 600;
}


export default class SldsComboboxSearch extends LightningElement {
    iconMap = ICON_MAP;

    idCnt = 300;
    // --------- Tracked HTML Elements --------- \\
    @track _dropdownTrigger; // Controls open/close state
    @track _comboOptions;   // List of menu options
    @track _inputEle;       // <input> element
    _headerOption;
    // ----------------------------------------- \\

    isRendered = false;
    @api isRequired = false;
    _formElementCl = 'slds-form-element';
    _hasError = false;
    _errorMsg;

    @track isEvent = false;
    @track _value = {label: '', value: ''};
    // ======================= Public Properties ========================= \\

    // --------------- Placeholder ----------------- \\ 
    @api placeHolder = 'Search...';     // Placeholder for the input

    @api isSelectionVariant = false;
    @api isLoading = false;
    _focusOnReady = false;
    _pendingFocusOnReady = false;
    _isQueryLoading = false;

    @api
    set focusOnReady(val) {
        this._focusOnReady = publicPropertyToBool(val);
        if (this._focusOnReady) {
            this._pendingFocusOnReady = true;
        }
    }
    get focusOnReady() {
        return this._focusOnReady;
    }

    @api 
    set labelMargin(val) {
        this._labelMargin = val;
        if (val) {
            this._applyVarsDirect('--label-margin', val);
        }
    }
    get labelMargin() {
        return this._labelMargin;
    }
    @api 
    set labelFontWeight(val) {
        this._labelFontWeight = val;
        if (val) {
            this._applyVarsDirect('--label-font-weight', val);
            if (isBoldFont(val)) {
                this._applyVarsDirect('--label-color', 'var(--slds-g-color-neutral-base-30, #444)');
            }
        }
    }
    get labelFontWeight() {
        return this._labelFontWeight;
    }


    @api 
    set height(val) {
        this._height = val;
        if (val) {
            this._applyVarsDirect('--input-height', val);
        }
    }
    get height() {
        return this._height;
    }
    @api 
    set borderRadius(val) {
        this._borderRadius = val;
        if (val) {
            this._applyVarsDirect('--input-radius', val);
        }
    }
    get borderRadius() {
        return this._borderRadius;
    }
    @api 
    set fontSize(val) {
        this._fontSize = val;
        if (val) {
            this._applyVarsDirect('--input-font-size', val);
        }
    }
    get fontSize() {
        return this._fontSize;
    }


    /* Structure: 
        {
            nameField: Name,
            objectApiName: Contact,
            metaOne: Title,
            metaTwo: Email,
            conditions: `Account__r.Id = '${this.recordId}',
            
        }
    */
    
    _objectApiName = undefined;
    _fieldApiNames = [];
    _conditions = undefined;
    _queryNameField;
    _queryMetaFields = [];

    _isMeta = 'unknown';
    normalizeQueryObj(queryObj) {
        if (!queryObj) {
            this._queryNameField = undefined;
            this._queryMetaFields = [];
            this._fieldApiNames = [];
            this._objectApiName = undefined;
            this._conditions = undefined;
            this._isQueryLoading = false;
            return;
        }

        const nameField = queryObj?.nameField ?? 'Name';
        const objectApiName = queryObj?.objectApiName ?? null;
        const conditions = queryObj?.conditions ?? null;
        const metaFields = ['metaOne', 'metaTwo', 'metaThree', 'metaFour']
            .map(key => queryObj?.[key])
            .filter(Boolean);

        this._queryNameField = nameField;
        this._queryMetaFields = metaFields;
        this._fieldApiNames = ['Id', nameField, ...metaFields];
        this._objectApiName = objectApiName;
        this._conditions = conditions;
        this._isQueryLoading = !!objectApiName;

        if (objectApiName) {
            const cleanLabel = getCleanMetaDataLabels(objectApiName);
            if (!this.menuTitle) {
                this.menuTitle = cleanLabel;
            }
            if (!this.placeHolder || this.placeHolder === 'Search...') {
                this.placeHolder = `Search ${cleanLabel}...`;
            }
        }

        this.isSelectionVariant = true;
    }

    _optionIconCl = 'slds-icon slds-icon_small';
    mapQueryRecordsToOptions(records) {
        if (!Array.isArray(records) || !this._objectApiName || !this._queryNameField) {
            return [];
        }

        const metaFields = Object.entries(this.queryObj)
            .filter(([k, _]) => META_KEYS.includes(k))
            .map(([_, v]) => v);
            
        
        const isMeta = metaFields.length > 0;
        this._isMeta = isMeta ? 'yes' : 'no';
        const iconRes = iconByObjectApiNameV2(this._objectApiName);
        const iconName = iconByObjectApiNameV2(this._objectApiName)?.iconName;
        if (iconRes.iconClass) {
            this._optionIconCl = `slds-icon slds-icon_small ${iconRes.iconClass}`;
        } else {
            this._optionIconCl = 'slds-icon slds-icon_small'
        }

        return records.map(record => {
            const label = record?.[this._queryNameField] ?? record?.Name ?? record?.Id;
            const option = {
                label,
                value: record?.Id,
                objectApiName: this._objectApiName,
                isMeta,
                hasMeta: !isMeta ? false : metaFields.some(k => !!record[k]),
            };

            if (iconName) {
                option.icon = iconName;
            }

            this._queryMetaFields.forEach((fieldApiName, idx) => {
                const metaKey = `meta${['One', 'Two', 'Three', 'Four'][idx]}`;
                const metaVal = record?.[fieldApiName];
                if (metaVal !== null && metaVal !== undefined && metaVal !== '') {
                    option[metaKey] = `${metaVal}`;
                }
            });

            const {
                isMeta: resolvedIsMeta,
                hasMeta: resolvedHasMeta,
                optionClass
            } = resolveOptionsClass(this, option);

            return { ...option, isMeta: resolvedIsMeta, hasMeta: resolvedHasMeta, optionClass };
        });
    }

    @api 
    set queryObj(val) {
        this._queryObj = val;
        if (val) {
            this.isSelectionVariant = true;
        }
        this.normalizeQueryObj(val);
    }
    get queryObj() {
        return this._queryObj ?? undefined;
    }
    get isComboboxLoading() {
        return !!this.queryObj && this._isQueryLoading;
    }

    focusInputWhenReady() {
        if (!this.focusOnReady || !this._pendingFocusOnReady || this._selectedOption) return;

        const input = this.template.querySelector('[data-id="inputEle"]');
        if (!input) return;

        this._pendingFocusOnReady = false;
        requestAnimationFrame(() => {
            try {
                input.focus({ preventScroll: true });
            } catch (error) {
                input.focus();
            }
        });
    }


    
    @api 
    set leftIcon(val) {
        if (!val) {
            this._leftIcon = null;
            return;
        }

        let iconName;
        let iconClass = '';
        let label = '';

        if (typeof val === 'string') {
            const [category, name, customCl = ''] = val.split(':');
            if (!category || !name) {
                this._leftIcon = null;
                return;
            }
            iconName = `${category}:${name}`;
            iconClass = customCl;
        } else if (typeof val === 'object') {
            iconName = val?.iconName || val?.icon || null;
            iconClass = val?.iconClass || '';
            label = val?.label || '';
        }

        if (!iconName) {
            this._leftIcon = null;
            return;
        }

        const normalizedIcon = iconPath(iconName, true);
        const svg = `slds-icon slds-icon_small${iconClass ? ` ${iconClass}` : ''}`;

        this._leftIcon = {
            label,
            icon: {
                container: `${normalizedIcon?.container} slds-combobox__input-entity-icon`,
                svg,
                icon: normalizedIcon?.icon
            }
        };
    }
    get leftIcon() {
        return this._leftIcon;
    }

    // ---------- Has Object Switcher Bool ---------- \\
    @api 
    set isAddon(val) {this._isAddon = publicPropertyToBool(val); }
    get isAddon() {return this._isAddon;}

    // ------------ Large Combobox Bool ------------ \\
    @api
    set isGrow(val) {this._isGrow = publicPropertyToBool(val); }
    get isGrow() {return this._isGrow;}

    // ----------- Dropdown Above Input ------------ \\
    @api // Make the dropdown appear above the input element instead of below
    set isDropdownUp(val) { this._isDropdownUp = publicPropertyToBool(val); }
    get isDropdownUp() { return this._isDropdownUp; }

    // --------------- Input Ele Icon --------------- \\
    @api  // Replaces 'utility:search' icon
    set inputIcon(val) {this._inputIcon = iconPath(val, true, true);}
    get inputIcon() {return this._inputIcon;}
    // -------------- Combobbox Label --------------- \\
    @api labelTop;                        // Label (optional) above input element
    @api labelBottom;                    // Label (optional) below input element

    @api menuTitle;                    // Title at the top of the options
    
    // ----------------- Data Type ------------------- \\ 
    @api 
    set dtype(val) {this._dtype = val ? val : "text"}
    get dtype() {return this._dtype;}

    @api dropdownLeft = false;
    @api dropdownRight = false;

    // ------------ Options Configuration ------------ \\ 
    filterIndex = 0;
    mainIndex = 0;
    batchSize = 50;
    isNewData = false;
    filteredOptions = [];
    overLoadOptions = [];
    _options = [];


    _wiredResult;
    @wire(fetchRecordsDynamicWithConditionCached, {
        objectName: '$_objectApiName',
        fieldApiNames: '$_fieldApiNames',
        conditions: '$_conditions'
    })   
    wiredfetchRecordsDynamicWithConditionCached(result) {
        this._wiredResult = result;
        const { data, error } = result;
        if (data) {
            try {
                if (this.queryObj) {
                    this.options = this.mapQueryRecordsToOptions(data);
                }
                this._isQueryLoading = false;
                if (this.focusOnReady) {
                    this._pendingFocusOnReady = true;
                }
            } catch(error) {
                this._isQueryLoading = false;
                this.showToast('Error in parsing in wiredfetchRecordsDynamicWithConditionCached() of sldsComboboxSearch.js', getErrorMessage(error), 'error');
            }
        } else if (error) {
            this._isQueryLoading = false;
            this.showToast('Error in wiredfetchRecordsDynamicWithConditionCached() of sldsComboboxSearch.js: ', getErrorMessage(error), 'error');
        }
    } 


    _isLoading = false;
    // Refresh Apex 
    async handleRefresh() {
        this._isLoading = true;
        try {
            await refreshApex(this._wiredResult);
        }catch(error) {
            this.showToast('Error in handleRefresh() of sldsComboboxSearch.js: ', getErrorMessage(error), 'error');
        } finally {
            this._isLoading = false;
        }
    }

    _startValue;
    @api 
    set currentValue(value) {
        this._currentValue = value;
        if (value) {
            if (typeof value === 'string') {
                this._startValue = value;
            } else {
                const icon = value?.icon
                    ? typeof value.icon === 'string'
                        ? iconPath(value.icon, true)
                        : value.icon
                    : null;
                this._startValue = value?.icon
                    ? {label: value.label, value: value.value, icon }
                    : {label: value.label, value: value.value};

                this._value = {label: value.label, value: value.value};
            }
        }
    } 
    get currentValue() {
        return this._currentValue;
    }

    @api // List of Options
    set options(val) {
        try {
            const nextOptions = Array.isArray(val) ? val : [];
            if (
                this.overLoadOptions && (this.overLoadOptions.length !== nextOptions.length || 
                (this.filterIndex && this.overLoadOptions[this.filterIndex] !== nextOptions[this.filterIndex]))
            ) {
                // Reset overload overflow combobox trackers
                this.resetLoadMoreOptionsVars(this.overLoadOptions);
            }
            
            if (nextOptions.length >= this.batchSize) { 
                this.overLoadOptions = nextOptions.map(option => {
                    const {isMeta, hasMeta, optionClass} = resolveOptionsClass(this, option);

                    return option.icon 
                        ? { ...option, 
                            icon: iconPath(option.icon, true),
                            id: `option-id-${this.idCnt++}`, 
                            isMeta,
                            hasMeta,
                            optionClass
                        }
                        : {...option, 
                            id: `option-id-${this.idCnt++}`, 
                            isMeta,
                            hasMeta,
                            optionClass
                        };
                });
                this._options = this.overLoadOptions.slice(0, this.batchSize);

            } else {
                this.overLoadOptions = [];
                this._options = nextOptions.map(option => {
                    const {isMeta, hasMeta, optionClass} = resolveOptionsClass(this, option);
                    return option.icon 
                        ? { ...option, 
                            icon: iconPath(option.icon, true), 
                            id: `option-id-${this.idCnt++}`, 
                            isMeta, hasMeta, optionClass
                        }
                        : {...option, 
                            id: `option-id-${this.idCnt++}`, 
                            isMeta, hasMeta, optionClass
                        };
                });
            }
        } catch(error) {
            this.showToast('Error in set options() of sldsComboboxSearch.js: ', getErrorMessage(error), 'error');
        }
    }
    get options() {
        return this._options;
    }
    // =================================================================== \\

    // ========================= Public Methods ========================== \\
    @api clearMe() {
        this._value = {value: '', label: ''};
        if (this._selectedOption) {
            this.removeSelected(null, true);
        }
        this.handleRequiredErrorAttributes();
    }
    @api focusMe() {
        const input = this.template.querySelector('[data-id="inputEle"]');
        if (!input) return;

        try {
            input.focus({ preventScroll: true });
        } catch (error) {
            input.focus();
        }
    }
    @api getValue() {
        if (this.isSelectionVariant) {
            return this._selectedOption?.value ?? null;
        }
    }
    // =================================================================== \\

    
    // Hanlde value selection when the search box initializes 
    handleStartValue() {
        if (this._startValue?.label && this._startValue?.value) {
            this._value = {
                label: this._startValue?.label, 
                value: this._startValue?.value
            }
            return;
        }

        if (!this._options?.length || !this._startValue) return;

        // find selected options
        const selectedOpt = this._options.find(opt => opt.value === this._startValue);

        if (selectedOpt) {
            this._value = {label: selectedOpt?.label, value: selectedOpt?.value};
        } 
    }

    // Reset the combobox options trackers
    //@api resetLoadMoreOptionsVars() {}
    resetLoadMoreOptionsVars(onlyIdx=false) {
        this.mainIndex = 0;
        this.filterIndex = 0;

        if (!onlyIdx) {
            this._options = this.overLoadOptions.slice(0, 50).map(opt => opt);
        };
    };

    // Track HTML Elements: <this._dropdownTrigger>, <this._comboOptions>, <this._inputEle>
    renderedCallback() {
        try {
            // --------------- Get Tracked Combobox Elements --------------- \\
            // DropdownTrigger (aria-expanded && slds-is-open)
            const dropdownTrigger = this.template.querySelector('.slds-dropdown-trigger');
            if (dropdownTrigger) this._dropdownTrigger = dropdownTrigger;
            
            // Combobox Options (slds-has-focus && aria-selected) 
            const comboOptions = this.template.querySelectorAll('.slds-listbox__option_entity');
            if (comboOptions) this._comboOptions = comboOptions;

            // Input element (aria-activedescendant)
            const inputEle = this.template.querySelector('[data-id="inputEle"]');
            if (inputEle) this._inputEle = inputEle;

            // Get the header element 
            if (this.menuTitle && !this._headerOption) {
                const header  = this.template.querySelector('[data-element="groupHeader"]');
                if (header) this._headerOption = header;
            }
            // -------------------------------------------------------------- \\

            this.syncFormElementIconClasses();
            this.focusInputWhenReady();

            // Add custom styles based on public property Booleans
            if (!this.isRendered) {
                // slds-dropdown element
                const dropdown = this.template.querySelector('.slds-dropdown_fluid');

                // Make Dropdown appear above the input element
                if (this.isDropdownUp) dropdown.classList.add('dropdown-up');

                // Make dropdown expand to width of <input> element
                if (this.isGrow) dropdown.classList.add('dropdown-grow');
                
                this.isRendered = true;
            }

            if (this._startValue && this.isSelectionVariant) {
                if (!this._value) {
                    this._value = typeof this._startValue === 'string'
                        ? {value: this._startValue, label: ''}
                        : {value: this._startValue.value, label: this._startValue.label}
                }
                if (this._value) {
                    this.handleSelectionVariant(true);
                    this._startValue = null;
                }
            }

            // Add a "load next batch of options" listener if <overloadOptions>
            if (this.overLoadOptions.length && !this.intersectionObserver) {
                this.intersectionObserver = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.loadMoreOptions();
                        }
                    });
                });
                const sentinel = this.template.querySelector('.load-more-sentinel');
                if (sentinel) {
                    this.intersectionObserver.observe(sentinel);
                }
            }
        } catch(error) {
            this.showToast('Error in renderedCallback() of sldsComboboxSearch.js: ', getErrorMessage(error), 'error');
        }
    }
    get dropdownClass() {
        const upCl = this.isDropdownUp ? ' dropdown-up' : '';
        const growCl = this.isGrow ? ' dropdown-grow' : '';
        const dropLengthCl = this.isIcons 
            ? ' slds-dropdown_length-with-icon-7' 
            : ' slds-dropdown_length-7';
        
        const base = 'slds-dropdown slds-dropdown_fluid';
        const drxnCl = this.dropdownLeft ? ' slds-dropdown_left'
            : this.dropdownRight ? ' slds-dropdown_right' 
            : '';

        return `${base}${upCl}${growCl}${dropLengthCl}${drxnCl}`;
    }
    // When user reaches end of combobox load the next batch of options (if Overload Options)
    loadMoreOptions() {
        try {
            if (this._value.value) {
                // User is filtering
                const startIdx = this.filterIndex;
                const endIdx = startIdx + this.batchSize;
                const nextBatch = this.filteredOptions.slice(startIdx, endIdx);
                this.filterIndex = endIdx;
                this._options = [...this._options, ...nextBatch];
            } else {
                // User is scrolling through full list
                const startIdx = this.mainIndex;
                const endIdx = startIdx + this.batchSize;
                const nextBatch = this.overLoadOptions.slice(startIdx, endIdx).filter(opt => !this._options.some(p => p.id === opt.id));
                this.mainIndex = endIdx;
                this._options = [...this._options, ...nextBatch];
                //if (isFirst) {
                //    setTimeout(() => {this._comboOptions[this.mainIndex - (this.batchSize -3)].scrollIntoView({behavior: 'smooth', block: 'nearest'});});
                //}
            }
        } catch(error) {
            this.showToast('Error in loadMoreOptions() of sldsComboboxSearch.js: ', getErrorMessage(error), 'error');
        }
    }

    // ============================ Getters ============================== \\
    // Add a Menu title to the list of options
    get ulEleAttributes()  {
        return this.menuTitle
            ? {role: "group", ariaLabel: this.menuTitle}
            : {role: "presentation", ariaLabel: "None"};
    }
    // Set flag for html-rendering of icons ---++ Update options with the iconContainer/Path
    get isIcons() {
        return this._options.some(opt => opt.hasOwnProperty('icon') || opt.hasOwnProperty('img'));
    }
    get listBoxOptionClass() {
        return this._options.some(opt => opt.hasOwnProperty('icon') || opt.hasOwnProperty('img') ) 
            ? 'slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta'
            : 'slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta slds-listbox__option_plain';
    }
    // Default is true unles isLabelBottom is true
    get isLabelTop() {
        return !this.isLabelBottom;
    }
    // Filter the options
    get currentOptions() {
        try {
        
            if (this.overLoadOptions && this.overLoadOptions.length > 0) {
                const isMetas = this.overLoadOptions.some(opt => Object.keys(opt).includes('metaOne'));
                const inputVal = this._value?.value?.toLowerCase() || '';
                const inputLabel = this._value?.label?.toLowerCase() || '';

                if (inputVal) {
                    const filtered = this.overLoadOptions
                        .map(opt => {
                            const val = opt.value?.toLowerCase() || '';
                            const label = opt.label?.toLowerCase() || '';
                            let score = 0;

                            if (val === inputVal || label === inputVal) {
                                score += 100;
                            } else if (val.startsWith(inputVal) || label.startsWith(inputVal)) {
                                score += 50;
                            }
                            else if (val.includes(inputVal) || label.includes(inputVal)) {
                                score += 25;
                            } 

                            if (isMetas) {
                                Object.keys(opt).forEach(key => {
                                    if (!key.startsWith('meta') || opt[`isM${key.slice(1)}Strike`]) return;
                                    const meta = opt[key]?.toLowerCase() || '';
                                    if (meta === inputVal || meta === inputLabel) {
                                        score += 40;
                                    }
                                    else if (meta.startsWith(inputVal) || meta.startsWith(inputLabel)) {
                                        score += 20;
                                    }
                                    else if (meta.includes(inputVal) || meta.includes(inputLabel)) {
                                        score += 10;
                                    }
                                });
                            }

                            return { opt, score};
                    })
                    .filter(({ score }) => score > 0)
                    .sort((a, b) => b.score - a.score)
                    .map(({ opt }) => opt)
                    .slice(0, this.filterIndex + this.batchSize);

                    return filtered;
                } 

                return this._options;
            }

        return this._value.value
            ? this._options.filter(opt => 
                `${opt.value}`.includes(`${this._value.value.toLowerCase()}`) || 
                `${opt.label}`.includes(this._value.value.toLowerCase()) ||
                `${opt.label.toLowerCase()}`.includes(this._value.label.toLowerCase()) ||

                Object.keys(opt).some(key => // Check if the metas include the searched 
                    key.startsWith('meta') && !opt[`isM${key.slice(1)}Strike`] && typeof opt[key] === 'string' &&
                    (
                        opt[key].toLowerCase().includes(this._value.value) || 
                        opt[key].toLowerCase().includes(`${this._value.value}`) ||
                        opt[key].toLowerCase().includes(`${this._value.label.toLowerCase()}`)
                    )
                )
            )
            : this._options;

        } catch(error) {
            this.showToast('Error in get currentOptions() of sldsComboboxSearch.js: ', getErrorMessage(error), 'error');
            return [];
        }
    }
    // =================================================================== \\



    // ============== Required Error Handlers ============== \\
    // Add error classes and set aria attributes for error and error removal
    handleRequiredErrorAttributes(isError=false) {
        try {
            const inputEle = this.template.querySelector('input');
            if (isError) {
                this._hasError = true;   
                this._formElementCl = 'slds-form-element slds-has-error'; 
                if (inputEle) inputEle.setAttribute('aria-describedby', 'error-message-unique-id');
                
            } else {
                this._hasError = false;
                this._formElementCl = 'slds-form-element';
                if (inputEle) inputEle.removeAttribute('aria-describedby');
            }
        } catch(error) {
            this.showToast('Error in handleErrorAttributes() of sldsCombobox.js', getErrorMessage(error), 'error');
        }
    }
    // Detect if error should be thrown when user leaves focus
    handleFocusOut() {
        if (!this._hasError && this.isRequired && !this._selectedOption) {
            this.handleRequiredErrorAttributes(true);    
            return;
        } 

        if(this._hasError && this.isRequired && this._selectedOption) {
            this.handleRequiredErrorAttributes();
        }
    }
    // ===================================================== \\

    // Flag when focused to display help text for selection variant 
    _isFocused = false;
    _showSelectionHelp = false;
    get shouldShowSelectionHelp() {
        return !!this._selectedOption && 
            !this._isCancelSelectionFocused && 
            (this._isFocused || this._showSelectionHelp);
    }
    // Flag input as focused 
    handleFocus(event) {
        this._isFocused = true;
    }

    // ==================== Combobox State Handlers ====================== \\
    // Close Combobox && focus input
    closeCombobox(event=null) {
        if (event) event.stopPropagation();
        const val = this._value.value;
        if (this._dropdownTrigger) {
            this._dropdownTrigger.classList.remove('slds-is-open');
            this._dropdownTrigger.setAttribute("aria-expanded", "false");
            this._comboOptions.forEach(opt => {
                opt.classList.remove('slds-has-focus');
                opt.setAttribute('aria-selected', 'false');
            });
            this._inputEle.removeAttribute('aria-activedescendant');
           
        }
        this._value.value = null;
        this._value = {
            ...this._value, value: null
        };
        if (this.isEvent) {
            this.isEvent = false;
            this.dispatchEvent(new CustomEvent('combometaselection', { detail: val } ));
        }
        if (this._justSelected) {
            this._justSelected = false;
            return;
        }
        this._isFocused = false;
        this._showSelectionHelp = false;
    }
    // Open Combobox
    openCombobox() {
        if (this._selectedOption) return;
        if (this._dropdownTrigger) {
            this.handleInputFocus();
            this._dropdownTrigger.classList.add('slds-is-open');
            this._dropdownTrigger.setAttribute("aria-expanded", "true");
        }
    }
    // Open/Close dropdown when dropdown trigger clicked
    handleTriggerClick(event) {
        if (this._selectedOption) return;
        if (this._dropdownTrigger.classList.contains('slds-is-open')) {
            this._dropdownTrigger.classList.remove('slds-is-open');
            this._dropdownTrigger.setAttribute("aria-expanded", "false");
            this._isFocused = false;
        } else {
            this.handleInputFocus();
            this._dropdownTrigger.classList.add('slds-is-open');
            this._dropdownTrigger.setAttribute("aria-expanded", "true");
        }
    }
    // =================================================================== \\

    
    // =================== Listbox Options Handlers ====================== \\
    // Fake Focus && Remove focus from all others (slds-has-focus && aria-selected="true")
    focusSelectedOption(val) {
        this._comboOptions.forEach(option => {
            if (option.dataset.value === val) {
                option.classList.add('slds-has-focus');
                option.setAttribute("aria-selected", "true");
            } else {
                option.classList.remove('slds-has-focus');
                option.setAttribute("aria-selected", "false");
            }
        })
    }
    // Set "aria-activedescendant" on the inputEle && aria-selected="true" on the option 
    handleFauxFocusOption(optionId) {
        try {
            this._inputEle.setAttribute("aria-activedescendant", `${optionId}`);
            let cnt=0;
            this._comboOptions.forEach(option => {
                if (option.id === optionId) {
                    option.setAttribute('aria-selected', 'true');
                    option.classList.add('slds-has-focus');
                    if (cnt === 0 && this._headerOption) {this._headerOption.scrollIntoView({behavior: 'smooth', block: 'nearest'});}
                    else { option.scrollIntoView({behavior: 'smooth', block: 'nearest'}); }
                } else {
                    option.setAttribute('aria-selected', 'false');
                    option.classList.remove('slds-has-focus');
                }
                cnt++;
            });
        }catch(error) {
            console.error('handleFauxFocusOption', error);
        }
    }
    // Don't let focus leave the input element
    deflectFocus(event)  {
        event.preventDefault(); 
    }
    // Set the value to the clicked options value
    handleOptionClick(event) {
        const selected = this.resolveSelectedOption(
            event.currentTarget.dataset.value,
            event.currentTarget.dataset.label
        );
        this._value = {
            value: event.currentTarget.dataset.value,
            label: event.currentTarget.dataset.label
        };
        if (this.isSelectionVariant) {
            this.handleSelectionVariant(false, selected);
        }
        this.isEvent = true;
        this._justSelected = true;
        requestAnimationFrame(() => {
            this.closeCombobox();
            this.focusMe();
            this._isFocused = true;
            this._showSelectionHelp = true;
            this.dispatchEvent(new CustomEvent('popoverclose', { detail: 'closed' } ));
        });
    }
    // =================================================================== \\

    _isCancelSelectionFocused = false;
    handleRemoveSelctedFocus() { 
        this._isCancelSelectionFocused = true;
        this._showSelectionHelp = false;
    }
    handleRemoveSelectedFocusOut() {
        this._isCancelSelectionFocused = false;
    }


    // ====================== Input Pill Variant ======================== \\
    _selectedOption = null;
    _isReadOnly = false;
    syncFormElementIconClasses() {
        const formEl = this.template.querySelector('.slds-combobox__form-element');
        if (!formEl) return;

        const hasLeftAdornment = !!this.leftIcon || !!this._selectedOption;
        formEl.classList.remove('slds-input-has-icon_right', 'slds-input-has-icon_left-right');
        formEl.classList.add(
            hasLeftAdornment
                ? 'slds-input-has-icon_left-right'
                : 'slds-input-has-icon_right'
        );
    }
    updateIconClasses(hasLeftIcon) {
        if (this.leftIcon) {
            this.syncFormElementIconClasses();
            return;
        }

        const formEl = this.template.querySelector('.slds-combobox__form-element');
        if (!formEl) return;

        formEl.classList.remove('slds-input-has-icon_right', 'slds-input-has-icon_left-right');
        formEl.classList.add(hasLeftIcon ? 'slds-input-has-icon_left-right' : 'slds-input-has-icon_right');
    }
    updateComoboboxAttributes() {
        const inputEle = this.template.querySelector('input');
        if (inputEle) {
            inputEle.style.userSelect = 'none';
            inputEle.classList.add('no-select');
        }
    }
    handleRemoveKeydown(event) {
        const removeKs = ['Backspace', 'Escape'];
        if (event && event.key && removeKs.some(k => event.key === k)) {
            this.removeSelected(null, true);
        }
    }
    resolveSelectedOption(value, label='') {
        const collections = [
            this._options,
            this.currentOptions,
            this.overLoadOptions
        ].filter(Array.isArray);

        for (const options of collections) {
            const selected = options.find(opt =>
                opt?.value === value || (!!label && opt?.label === label)
            );
            if (selected) {
                return selected;
            }
        }

        return null;
    }
    handleSelectionVariant(isStartValue=false, explicitSelected=null) {
        try {
            const currentValue = this._value && typeof this._value === 'object'
                ? this._value.value
                : this._value;

            const selected = explicitSelected
                ?? (isStartValue && !this._options?.length
                ? this._startValue
                : this.resolveSelectedOption(currentValue, this._value?.label));

            if (!selected) return;

            // use option's icon if present, else standard account
            const iconContainer = `${selected?.icon?.container} slds-combobox__input-entity-icon`;
            const svg = this._optionIconCl ?? 'slds-icon slds-icon_small';
            const icon = selected?.icon?.icon;

            this._isReadOnly = true;

            this._selectedOption = {
                label: selected.label,
                value: selected.value,
                icon: {
                    container: iconContainer,
                    svg, 
                    icon
                }
            };

            this.handleRequiredErrorAttributes(false);    

            // YOU WANT TO DO IT HERE:
            this.updateIconClasses(true);   // <-- LEFT + RIGHT

            const container = this.template.querySelector('.slds-combobox_container');
            if (container) {
                container.classList.add('slds-has-selection');
                this._isFocused = true;
                this._showSelectionHelp = true;
            }
        } catch (error) {
            this.showToast(
                'Error in handleSelectionVariant()',
                getErrorMessage(error),
                'error'
            );
        }
    }
    removeSelected(event=null, doNotFocus=false) {
        this._selectedOption = null;
        this._isReadOnly = false;

        this.updateIconClasses(false);  // <-- RIGHT ONLY

        const container = this.template.querySelector('.slds-combobox_container');
        container?.classList.remove('slds-has-selection');

        this._value = { label: '', value: null };
        this._showSelectionHelp = false;
        this._isCancelSelectionFocused = false;
        this.dispatchEvent(new CustomEvent('combometaselection', { detail: null } ));
        if (doNotFocus) return;
        
        const input = this.template.querySelector('input');
        if (input) input.focus();
    }
    // =================================================================== \\


    // ==================== Options Loading Variant ====================== \\
    handleInputFocus() {
        if (this.isLoading) {
            this.dispatchEvent(new CustomEvent('comboboxopen', { detail: '' } ));
        }
    }
    // =================================================================== \\
    

    // Detect current <input> element entry --> Open combobox  if not open
    handleInput(event) {
        if (this._selectedOption) return;
        if (!this._dropdownTrigger.classList.contains('slds-is-open')) {
            this.openCombobox();
        }
        this._value.value = event.target.value;
        this._value.label = event.target.value;
        if (this.isSelectionVariant) {
            this.handleSelectionVariant();
        }
    }
    // Close the combobox Tab/Escape --> Open if Enter
    handleKeyDown(event) {
        if (this._selectedOption) {
            this.handleRemoveKeydown(event); 
            return;
        }
        // Close combobox on 'Escape'/'Tab'
        if (event.key === 'Tab' || event.key === 'Escape') {
            if (event.key === 'Escape') {
                event.preventDefault();
            }
            this.closeCombobox();
            return;
        }

        // Open/Close combobox on 'Enter'
        if (event.key === 'Enter') {
            if (this._dropdownTrigger.classList.contains('slds-is-open')) {
                const selected = Array.from(this._comboOptions).find(opt => opt.classList.contains('slds-has-focus')); 
                if (selected) {
                    this.isEvent = true;
                    this._value = {
                        value: selected.dataset.value,
                        label: selected.dataset.label,
                    }
                    if (this.isSelectionVariant) {
                        this._justSelected = true;
                        this.handleSelectionVariant(false, this.resolveSelectedOption(
                            selected.dataset.value,
                            selected.dataset.label
                        ));
                    }
                }
                this.closeCombobox();
                return;
            } 
            this.openCombobox();
        }

        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            if (!this._dropdownTrigger.classList.contains('slds-is-open')) {
                this.openCombobox();
            }

            const isDown = event.key === 'ArrowDown';
            const arrLength = Array.from(this._comboOptions ?? []).length;
            if (!arrLength) return;

            const currentSelected = Array.from(this._comboOptions).findIndex(opt => 
                opt.getAttribute('aria-selected') === 'true'
            );

            let nextIdx = 0 
            
            if (isDown) {
                nextIdx = currentSelected===-1 || currentSelected + 1 > arrLength -1
                    ? 0
                    : currentSelected + 1   ;
            } else {
                nextIdx = currentSelected===-1 || currentSelected - 1 < 0
                    ? arrLength - 1
                    : currentSelected - 1;
            }
            if (nextIdx !== -1) this.handleFauxFocusOption(this._comboOptions[nextIdx].id);
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