/**
 * sldsCombobox — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/utils.
 * - Salesforce/platform modules: lwc.
 * - Template children (including conditional UI): c-toast-lwc, lightning-icon.
 * - Bundle template: sldsCombobox.html; local styles: sldsCombobox.css. Salesforce SLDS styling is
 * expected.
 * - Shared CSS modules: c/sharedStylesSldsCombobox.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-combobox') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - flipUp (flip-up): Requests an upward-opening dropdown. Declared default: false.
 *   Example: child.flipUp = true;
 * - isRequired (is-required): Marks the control as required; validation behavior is component-specific.
 * Declared default: false.
 *   Example: child.isRequired = true;
 * - suppressErrorText (suppress-error-text): Hides the inline validation message while retaining the error
 * state. Declared default: false.
 *   Example: child.suppressErrorText = true;
 * - downIconSize (down-icon-size): SLDS size for the dropdown indicator.
 *   Example: child.downIconSize = "x-small";
 * - placeHolder (place-holder): Prompt shown when the input has no selection or text.
 *   Example: child.placeHolder = "Select an option";
 * - addNone (add-none): Adds a --None-- option for clearing the selection.
 *   Example: child.addNone = true;
 * - isDisabled (is-disabled): Disables interaction with the control.
 *   Example: child.isDisabled = true;
 * - hasMeta (has-meta): Enables additional metadata lines on options.
 *   Example: child.hasMeta = true;
 * - dropdownLength (dropdown-length): SLDS dropdown length class suffix; use a supported length such as 5
 * or 7.
 *   Example: child.dropdownLength = 5;
 * - currentValue (current-value): Current input or selected option value; keep parent state in sync with
 * the selection event.
 *   Example: child.currentValue = "open";
 * - options (options): Option array with label and value; optional icon/metadata support depends on the
 * variant.
 *   Example: child.options = [{ label: 'Open', value: 'open' }];
 * - suppressMargin (suppress-margin): Removes the component's bottom margin when enabled.
 *   Example: child.suppressMargin = true;
 * - height (height): CSS input/control height, including units.
 *   Example: child.height = "2rem";
 * - borderRadius (border-radius): CSS corner radius, including units.
 *   Example: child.borderRadius = "0.25rem";
 * - fontSize (font-size): CSS text size, including units.
 *   Example: child.fontSize = "0.875rem";
 * - isDarkMode (is-dark-mode): Compatibility property: enables the combobox dark appearance; currently
 * stored/exposed but not consumed by this implementation. Declared default: false.
 *   Example: child.isDarkMode = true;
 * - label (label): Visible control label. Declared default: null.
 *   Example: child.label = "Status";
 * - isFocusBlue (is-focus-blue): Compatibility property: enables the blue focus treatment; currently
 * stored/exposed but not consumed by this implementation. Declared default: false.
 *   Example: child.isFocusBlue = true;
 *
 * Public methods (call on the rendered child):
 * - focusMe(): Focus the component input/control.
 * - clearMe(value=null): Clear/reset the input value.
 * - getValue(): Read the current component value.
 * - clearValues(): Clear the selected values.
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-slds-combobox label="Status" options={options}
 *         current-value={value} onselected={handleSelected}></c-slds-combobox>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     options = [{ label: 'Open', value: 'open' }, { label: 'Closed', value: 'closed' }];
 *     value = 'open';
 *     handleSelected(event) { this.value = event.detail; }
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Use for single selection from parent-supplied options. selected.detail is the scalar value; the None
 * option emits null. open signals dropdown opening.
 * - Optional variant: add add-none={enabled}, has-meta={enabled} and dropdown-length="7"; define enabled =
 * true and add metadata to the option objects. Parent CSS can size the host; use public style properties
 * for internals.
 */

import { LightningElement, api, track } from 'lwc';

import { getToastErrorMessage, 
    handleReadOnlySearch, 
    isValidProperty, 
    publicPropertyToBool, 
    getErrorMessage, 
    handleDropdownFlip,
    iconPath,
    isCommunitySetting,
} from 'c/utils';


const META_KEYS = ['fieldOne', 'fieldTwo'];

const SELECT = (ele) => {
    ele.classList.add('slds-has-focus', 'slds-is-selected');
    ele.setAttribute('aria-selected', 'true');
}
const REMOVE = (ele) => {
    if (
        ele.classList.contains('slds-has-focus') || 
        ele.classList.contains('slds-is-selected')
    ) {
        ele.classList.remove('slds-has-focus', 'slds-is-selected');
        ele.setAttribute('aria-selected', 'false');
    }
}
const SCROLL = (ele) => ele.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // Ensure visibility

const HANDLE_OPTIONS_ADD_NONE = (isNone, options, currentValue) => {
    const currentVal = currentValue ?? '';
    const stringCurrent = currentValue != null ? currentValue : '';

    let result = Array.isArray(options) ? [...options] : [];

    if (isNone && !result.some(opt => opt?.label === '--None--')) {
        result = [
            { label: '--None--', value: '' }, 
            ...result
        ];
    }

    result = result.map(o => ({
        ...o,
        value: o.value ?? '',
        isSelected: String(o.value ?? '') === stringCurrent
    }));

    return [currentVal, result];
};

const NAV_KEYS = ['Enter', 'Escape', 'Shift', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'];

const DROPDOWN_FLUID = 'slds-dropdown slds-dropdown_fluid';

export default class SldsCombobox extends LightningElement {
    currentSelection;    
    localOptions = [];

    isCommunity = isCommunitySetting;
    // Open dropdown up instead of down
    @api flipUp = false;

    // Required flag
    @api isRequired = false;    
    // Hide required error text
    @api suppressErrorText = false;
    // Add slds-has-error if error 
    _mainFormElementCl = 'slds-form-element'; 
    _errorMsg;
    _hasError = false;

    _downIconSize = 'x-small';
    @api 
    set downIconSize(val) {
        this._downIconSize = val;
        this._downIconSize = val ?? 'x-small';
    }
    get downIconSize() {
        return this._downIconSize;
    }
    
    @api placeHolder;
    @api 
    set addNone(val) {
        this._addNone = publicPropertyToBool(val);
        this.handleOptionsInitalization();
    }
    get addNone() {return this._addNone || false;}

    @api 
    set isDisabled(val) {this._isDisabled = val === 'true' || val === true ? true : false;}
    get isDisabled() {return this._isDisabled || false;}

    @api 
    set hasMeta(value) {
        this._hasMeta = !!value;
    }
    get hasMeta() {
        return this._hasMeta ?? false;
    }

    @api 
    set dropdownLength(val) {
        this._dropdownLength = Number(val);
    }
    get dropdownLength() {
        return this._dropdownLength;
    }

    _currentValue = '';
    @api
    set currentValue(value) {
        try {
            const v = value == null ? '' : value;
            console.log('here is currentValue in sldsCombobox.js: ', v);
            this._currentValue = v;
            this.handleOptionsInitalization();

        } catch (error) {
            getToastErrorMessage('set currentValue', 'SldsCombobox', error);
        }
    }
    get currentValue() { return this._currentValue ?? ''; }


    _options = [];
    @api 
    set options(value) {
        try {
            let arr = Array.isArray(value) ? value : [];
            this._options = arr;
            this.handleOptionsInitalization();

        } catch (error) {
            getToastErrorMessage('set options', 'SldsCombobox', error);
        }
    }
    get options() { return this._options || []; }

    @api 
    set suppressMargin(val) {   
        this._suppressMargin = val;
        this._applyVarsDirect('--c-margin-bottom', '0px');
    }
    get suppressMargin() {
        return this._suppressMargin;
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
            this._applyVarsDirect('--slds-c-input-radius-border', val);
        }
    }
    get borderRadius() {
        return this._borderRadius;
    }
    @api 
    set fontSize(val) {
        this._fontSize = val;
        if (val) {
            this._applyVarsDirect('--slds-c-dropdown-font-size', val);
            this._applyVarsDirect('--c-font-size', val);
        }
    }
    get fontSize() {
        return this._fontSize;
    }


    @api isDarkMode = false;
    @api label = null;
    @api isFocusBlue = false;

    originalValue = null;
    eventSending = false;
    @track _comboxOptions;
    @track isComboBoxOpen = false;
    @track highlightedOptionId = null;

    findCurrentValue(val, options, returnOption = false) {
        const strVal = String(val) ?? ''
        const match = (options ?? []).find(o => String(o.value ?? '') === strVal)
        return returnOption 
            ? match ?? null
            : match?.value ?? null;
    }
    updateIsSelectedOption(value) {
        try {
            const stringVal = String(value ?? '');
            this.localOptions = this.localOptions.map(option => {
                if (
                    !value && 
                    this.addNone && 
                    (!option.value || option.value === 'null')
                ) {
                    return {...option, isSelected: true}
                }
                const isSelected = String(option.value ?? '') === stringVal;
                return { ...option, isSelected};
            });
        } catch(error) {
            this.showToast('Error in updateIsSelectedOption() of sldsCombobox.js', error, 'error');
        } 
    }


    handleOptionsInitalization() {
        try {
            const [currentVal, options] = HANDLE_OPTIONS_ADD_NONE(this.addNone, this._options, this._currentValue);
            const hasMetaAny = options.some(op => META_KEYS.some(m => !!op?.[m]));
            const metaFlaggedOptions = options.map(op => {
                const hasMeta = META_KEYS.some(m => !!op[m]);
                const optionsClass = hasMeta 
                    ? 'slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta'
                    : hasMetaAny 
                        ? 'slds-media slds-media_center slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta'
                    : 'slds-media slds-media_center slds-listbox__option slds-listbox__option_entity slds-listbox__option_plain'
                return { ...op, hasMeta, optionsClass};
            });
            this._currentValue = currentVal;
            this._options = metaFlaggedOptions;
            this.localOptions = metaFlaggedOptions;
            this.currentSelection = this.findCurrentValue(currentVal, metaFlaggedOptions, true);
        } catch(error) {
            this.showToast('Error in handleOptionsInitalization() of sldsCombobox.js', getErrorMessage(error), 'error');
        }
    }


    // Respond to parent's command to focus the combobox
    @api focusMe() {
        const comboInput = this.template.querySelector('[data-id="sldsComboboxInput"]')
        if (comboInput){
            comboInput.focus();
        }
    }
    @api clearMe(value=null) {
        this._currentValue = value;
        this.currentSelection = null;
        this.localOptions = this.localOptions.map(opt => ({...opt, isSelected: false}));
        this.handleRequiredErrorAttributes();
    }
    @api getValue() {
        return this._currentValue;
    }
    @api clearValues() {
        try {
            this._currentValue = null;
            this.currentSelection = null;
            this.localOptions = this.localOptions.map(opt => ({...opt, isSelected: false}));
            this.handleRequiredErrorAttributes();
        } catch(error) {
            this.showToast('Error in clearValues() of sldsCombobox.js', getErrorMessage(error), 'error');
        }
    }

    // ================== Events To Parent ================= \\
    // Send event to parent when an option has been selected
    handleSelection(manual=false) {
        try {
            if (!this.eventSending) {
                this.eventSending = true;
                setTimeout(() => {
                    try {
                        const comboboxOptions = this.template.querySelectorAll('[data-id="comboboxOption"]');     
                        if (comboboxOptions && comboboxOptions.length > 0) {
                            comboboxOptions.forEach(combo => {
                                if (combo.classList.contains('slds-has-focus') && combo.dataset.value !== this._currentValue)  {
                                    combo.classList.remove('slds-has-focus');
                                }
                            });
                        }
                        if (this._currentValue !== this.originalValue) {
                            this.originalValue = this._currentValue;
                            this.currentSelection = this.findCurrentValue(this._currentValue, this.localOptions, true);
                            this.dispatchEvent(
                                new CustomEvent(
                                    'selected', 
                                    { detail: manual ? '' : this._currentValue === '--None--' ? null : this._currentValue } 
                                )
                            );
                        }
                        this.eventSending = false;
                    }catch(error) {
                        getToastErrorMessage('handleSelection-Timeout', 'SldsCombobox', error);
                    }
                }, 25);
            }
        } catch(error) {
            this.showToast('Error in handleSelection() of sldsCombobox.js', getErrorMessage(error), 'error');
        }
    }
    // Send event when combobox is opened
    isOpen() {
        this.dispatchEvent(new CustomEvent('open', { detail: 'open' } ));
    }
    // ===================================================== \\


    // Make sure option is selected upon opening
    handleNewlyOpenedCombobox() {
        try {
            const currentVal = String(this._currentValue || '');
            this.updateIsSelectedOption(currentVal);
            
            // Defer until dropdown is actually in DOM + laid out
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const options = Array.from(
                        this.template.querySelectorAll('[data-id="comboboxOption"]') || []
                    );

                    // Find the selected option node
                    const selectedNode = options?.find(op => String(op?.dataset?.value ?? '') === currentVal) 
                        ?? options?.[0];

                    if (!selectedNode) return;

                    // Update localOptions selection state
                    (this.localOptions || []).forEach(opt => {
                        opt.isSelected = (String(opt.value) === currentVal);
                    });

                    // Focus class
                    options.forEach(op => op.classList.remove('slds-has-focus'));
                    selectedNode.classList.add('slds-has-focus');

                    if (selectedNode) {
                        selectedNode.scrollIntoView({behavior: 'smooth', block: 'nearest'});
                        return;
                    }
                });
            });
            requestAnimationFrame(() => handleDropdownFlip(this));
        } catch(error) {
            this.showToast('Error in handleNewlyOpenedCombobox() of sldsCombobox.js', getErrorMessage(error), 'error');
        }
    }


    // ============== Required Error Handlers ============== \\
    // Add error classes and set aria attributes for error and error removal
    handleRequiredErrorAttributes(isError=false) {
        try {
            const inputEle = this?.refs?.input;
            if (isError) {
                this._hasError = true;  
                this._mainFormElementCl = 'slds-form-element slds-has-error'; 
                if (inputEle) inputEle.setAttribute('aria-describedby', 'error-message-unique-id');
                
            } else {
                this._hasError = false;
                this._mainFormElementCl = 'slds-form-element';
                if (inputEle) inputEle.removeAttribute('aria-describedby');
            }
        } catch(error) {
            this.showToast('Error in handleErrorAttributes() of sldsCombobox.js', getErrorMessage(error), 'error');
        }
    }
    // Detect if error should be thrown when user leaves focus
    handleFocusOut() {
        if (!this._hasError && this.isRequired && !this._currentValue) {
            this.handleRequiredErrorAttributes(true);    
            return;
        } 

        if(this._hasError && this.isRequired && this._currentValue) {
            this.handleRequiredErrorAttributes();
        }
    }
    // ===================================================== \\



    // ===================== Callbacks ===================== \\
    // Initialize <-localOptions-> && store <-originalValue->
    connectedCallback() {
        try {
            this.originalValue = this._currentValue;
        } catch(error) {
            this.showToast('Error in connectedCallback() of sldsCombobox.js', getErrorMessage(error), 'error');
        }
    }
    renderedCallback() {
        try {
            const nodes = this.template.querySelectorAll('[data-id="comboboxOption"]');
            this._comboxOptions = Array.from(nodes || []);
        
            const cur = String(this._currentValue || '');
            this._comboxOptions.forEach(op => {
                if (!op?.dataset) return;
                if (op.dataset.value === cur) {
                    (this.localOptions || []).forEach(opt => opt.isSelected = (String(opt.value) === cur));
                    op.classList.add('slds-has-focus');
                    op.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
                } else {
                    op.classList.remove('slds-has-focus');
                }
            });
        
        } catch(error) {
            this.showToast('Error in renderedCallback() of sldsCombobox.js', getErrorMessage(error), 'error');
        }
    }
    // ===================================================== \\

    // Get the currently selected option's label
    get currentValueLabel() {
        try {
            const match = this.findCurrentValue(this._currentValue, this.localOptions, true)
            return this._currentValue 
                ? match?.label || '' 
                : this.addNone  ? '--None--'  
                : ''; 

        } catch(error) {
            this.showToast('Error in currentValueLabel() of sldsCombobox.js', getErrorMessage(error), 'error');
        }
    }
    // Determines if Comobox should support Icons
    get optionsClass() {
        try {
            if (this.hasMeta) {
                return 'slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta';
            }
            return 'slds-media slds-listbox__option slds-listbox__option_plain slds-media_small';
            
        }catch(error) {
            getToastErrorMessage('optionsClass', 'SldsCombobox', error);
        }
    }
    // Determines if input (selection) should have Icon to left
    get formElementClass() {
        try {
            return this.currentSelection && 
                isValidProperty('iconConfig', this.currentSelection) && 
                this.currentSelection?.iconConfig?.iconName !== 'standard:empty'
                    ? 'slds-combobox__form-element slds-input-has-icon slds-input-has-icon_left-right'
                    : 'slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right';
        }catch(error) {
            getToastErrorMessage('formElementClass', 'SldsCombobox', error);
        }
    }

    get dropdownCl() {
        if (this._isDisabled) {
            return 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-disabled';
        }
        return 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
    }
    get inputCl() {
        if (this._isDisabled) {
            return 'slds-input slds-combobox__input slds-combobox__input-value slds-truncate slds-is-disabled';
        }
        return 'slds-input slds-combobox__input slds-combobox__input-value slds-truncate';
    }

    get selectedInputIcon() {
        try {
            const iconConfig = this.currentSelection?.iconConfig;
            const iconName = iconConfig?.iconName;

            if (!iconName || iconName === 'standard:empty') {
                return null;
            }

            const normalizedIcon = iconPath(iconName, true);
            if (!normalizedIcon?.icon || !normalizedIcon?.container) {
                return null;
            }

            const iconClass = iconConfig?.iconClass?.trim();
            const svg = `slds-icon ${iconClass ? ` ${iconClass}` : ''}`;

            return {
                container: `${normalizedIcon.container} slds-combobox__input-entity-icon`,
                svg,
                icon: normalizedIcon.icon,
                title: iconConfig?.title || this.currentSelection?.label || ''
            };
        } catch (error) {
            getToastErrorMessage('selectedInputIcon', 'SldsCombobox', error);
            return null;
        }
    }

    get dropdownLengthCl() {
        if (this.dropdownLength && [5, 7, 10].some(num => num === this.dropdownLength)) {
            const hasIcons = this.localOptions?.some(opt => opt?.iconConfig);
            const base = hasIcons ? 'slds-dropdown_length-with-icon-'
                : 'slds-dropdown_length-';

            return `${DROPDOWN_FLUID} ${base}${this.dropdownLength}`;
        }
        const optionsLength = this.localOptions?.length; 
        const hasIcons = this.localOptions?.some(opt => opt?.iconConfig);
        const base = hasIcons ? 'slds-dropdown_length-with-icon-'
            : 'slds-dropdown_length-';

        if (optionsLength >= 12) {
            return `${DROPDOWN_FLUID} ${base}10`;
        }
        if (optionsLength >= 9) {
            return `${DROPDOWN_FLUID} ${base}7`;
        }
        return `${DROPDOWN_FLUID} ${base}5`;
    }

    //const NAV_KEYS = ['Enter', 'Escape', 'Shift', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    _readOnlyStr
    _readOnlyStrTimeStamp
    handleInputKeyDown(event) {
        try {
            if (event?.key && NAV_KEYS.some(ignore => ignore === event.key)) {
                this._readOnlyStr = '';
                this._readOnlyStrTimeStamp = Date.now(); // ✅ keep state consistent
                return;
            }

            // ✅ Robust timestamp handling
            const now = Date.now();
            const last = Number(this._readOnlyStrTimeStamp) || 0;
            const diffMs = now - last;

            if (!last || diffMs > 1200) {
                this._readOnlyStr = '';
            }

            const { nextStr, match } = handleReadOnlySearch(event, this._readOnlyStr, this.localOptions);

            if (typeof nextStr === 'string') {
                this._readOnlyStr = nextStr;
                this._readOnlyStrTimeStamp = now;

                const applyFocus = () => {
                    const comboOptions = this.template.querySelectorAll('[role="option"]');
                    if (!comboOptions || comboOptions.length === 0) return false;

                    if (match) {
                        const matchedEle = Array.from(comboOptions).find(
                            ele => String(ele.dataset.value) === String(match.value)
                        );
                        if (matchedEle) {
                            comboOptions.forEach(combo => {
                                if (combo === matchedEle) {
                                    if (!match.isConvert && !match.disabled) {
                                        SELECT(combo);
                                        SELECT(combo.closest('li'));
                                    }
                                    SCROLL(matchedEle);
                                } else {
                                    REMOVE(combo);
                                    REMOVE(combo.closest('li'));
                                }
                            });
                        }
                    }
                    return true;
                };

                // ✅ If options aren't rendered yet (first keypress after open), defer one frame
                if (!applyFocus()) {
                    requestAnimationFrame(() => applyFocus());
                }
            }
        } catch (error) {
            this.showToast('Error in handleInputKeyDown() of sldsCombobox.js', getErrorMessage(error), 'error');
        }
    }

    handleFocus(event) {
        const target = event.target;
        event.preventDefault();
        target.focus();
    }

    // Handle Combobox option Click events
    handleOptionClick(event) {
        try {
            if (this._suppressBlur) {
                return;
            }
            const stringVal = String(event.currentTarget.dataset.value ?? '');
            this.localOptions = this.localOptions.map(option => ({
                ...option,
                isSelected: String(option.value ?? '') === stringVal
            }));

            this._currentValue = event.currentTarget.dataset.value; // Now currentValue updates properly
            this.toggleCombobox();
        } catch(error) {
            this.showToast('Error in handleOptionClick() of sldsCombobox.js', getErrorMessage(error), 'error');
        }
    }
    // Handle open/close triggering events for Combobox
    toggleCombobox(event=null, comboboxParam=null) {
        try {
            if (this._suppressBlur) return;
            const mutedKeys = ['Control', 'Alt', 'Meta', 'Shift', 'Tab'];
            if (event && event.key && mutedKeys.some(muted => event.key === muted)) {
                return;
            }

            // If combobox not open and Escape pressed --> Remove the combobox from the DOM (or slds-hide)
            if (event && event.key && event.key === 'Escape' && !this.isComboBoxOpen) {
                event.preventDefault();
                this.handleSelection(true); // Send a null selection so parent knows to hide/remove combobox
                return;
            }

            // If is a Keyboard action handle Aria/slds
            if (event && event.key) {
                if (this.isComboBoxOpen) {
                    // If combobox dropdown is open --> Bounce the keyDown events to the comboboxOptions keyDown handler
                    if (event.key !== undefined && event.key === 'Escape' && !this.isComboBoxOpen) {
                        event.preventDefault();
                        this.handleComboboxKeyDown(event);
                        return;
                    }
                    event.preventDefault();
                    this.handleComboboxKeyDown(event);
                    return;
                } else if(!this.isComboBoxOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
                    // Make sure page does not scroll down when user wants to open combobox
                    event.preventDefault();
                }
            }

            // Handle Option clicks --> save selection & close combobox
            if ([event, comboboxParam].every(param => !param)) {
                const combobox = this.template.querySelector('[data-id="combobox"]');

                // When option is clicked it also triggers the dropdown toggler --> must set timeout to bounce it
                setTimeout(() => {
                    try {
                        this.handleSldsAriaCombobox(combobox, null, false);
                        this.isOpen();
                        if (event && NAV_KEYS.some(k => k === event.key)) {
                            event.stopPropagation();
                        }
                    }catch(error) { getToastErrorMessage('toggleCombobox-timeout', 'SldsCombobox', error); }
                }, 20);

                return;
            }
            
            // Query the markup for combobox 
            const combobox = event ? this.template.querySelector('[data-id="combobox"]') : comboboxParam;
            if (!combobox) return; // Exit if no combobox is found

            if (event instanceof PointerEvent) {
                // PointerEvent (mouse, pen, touch via pointer API)
                if (combobox.classList.contains('slds-is-open')) {
                    event.stopPropagation();
                    combobox.classList.remove('slds-is-open');
                    combobox.setAttribute('aria-expanded', 'false');
                    this.isComboBoxOpen = false;
                    return;
                }
            }

            if (!combobox.classList.contains('slds-is-open') && event && !event.key) {
                this.handleSldsAriaCombobox(combobox);
            }

            // Open the Combobobox (forced)
            if ( (!event && comboboxParam) || (!event.key || event.key === undefined)) {
                // Toggle the 'slds-is-open'
                this.handleNewlyOpenedCombobox();
                return;
            }

            // Open the Combobobox
            if (
                event && 
                event.key && 
                event.key !== undefined && 
                ['Tab', 'Escape'].every(key => event.key !== key)
            ) { 
                this.isOpen();
                this.handleSldsAriaCombobox(combobox, null, true);
            }

        } catch(error) {
            this.showToast('Error in toggleCombobox() of sldsCombobox.js', getErrorMessage(error), 'error');
        }
    }   

    
    // Control the combobox slds class states && the Aria attributes
    handleSldsAriaCombobox(combobox=null, comboboxOptions=null, isPositive=null) {
        try {
            if (this._suppressBlur) return;
            // Combobox element path
            if (combobox) {
                if (isPositive === null) {
                    const isOpen = combobox.classList.toggle('slds-is-open');
                    combobox.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                    this.isComboBoxOpen = !!isOpen;
                    if (isOpen) this.isOpen();
                } else if (isPositive === false) {
                    combobox.classList.remove('slds-is-open');
                    combobox.setAttribute('aria-expanded', 'false');
                    this.isComboBoxOpen = false;
                } else {
                    combobox.classList.add('slds-is-open');
                    combobox.setAttribute('aria-expanded', 'true');
                    const cur = this._currentValue;
                    if (!cur && this.addNone)
                    (this.localOptions || []).forEach(o => {
                        if (!cur && this.addNone && (!o.value || o.value === 'null')) {
                            o.isSelected = true;
                        } else {
                            o.isSelected = (String(o.value) === String(cur))
                        }
                    });
                    this.isComboBoxOpen = true;
                    requestAnimationFrame(() => handleDropdownFlip(this));
                }
            }

            // Options path
            if (comboboxOptions) {
                const isNodeList = typeof comboboxOptions.length === 'number';
                const list = isNodeList ? Array.from(comboboxOptions) : null;

                if (list) {
                    if (list.length === 0) return; // nothing to do
                    if (isPositive) {
                        const selected = list.find(el => el?.classList?.contains('slds-has-focus'));
                        if (!selected) return;
                        selected.classList.add('slds-is-selected', 'slds-has-focus');
                        selected.setAttribute('aria-checked', 'true');
                        selected.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
                        const val = selected.dataset?.value ?? '';
                        (this.localOptions || []).forEach(o => o.isSelected = (String(o.value) === String(val)));
                        this._currentValue = val;
                    } else {
                        list.forEach(el => {
                            el?.classList?.remove('slds-is-selected');
                            el?.setAttribute?.('aria-checked', 'false');
                        });
                    }
                } else {
                    // Single Element
                    const el = comboboxOptions;
                    if (!el?.classList) return;
                    if (isPositive) {
                        el.classList.add('slds-has-focus');
                        el.setAttribute('aria-selected', 'true');
                    } else {
                        el.classList.remove('slds-has-focus');
                        el.setAttribute('aria-selected', 'false');
                    }
                    el.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
                }
            }

            if (!this.isComboBoxOpen) {
                this.handleSelection();
            }
        } catch(error) {
            this.showToast('Error in handleSldsAriaCombobox() of sldsCombobox.js', getErrorMessage(error), 'error');
        }
    }

   
    // Handle combobox keyboard navigations
    handleComboboxKeyDown(event) {
        try {
            // Keys the comobobox should ignore
            const mutedKeys = ['Control', 'Alt', 'Meta', 'Shift'];
            if (mutedKeys.some(muted => event.key === muted)) { return; }

            // Keys that close the combobox (do not prevent default)
            const closeKeys = ['Escape', 'Tab'];

            // Get the combobox element
            const combobox = this.template.querySelector('[data-id="combobox"]');
            if (!combobox) return;

            // Close on "Escape" and open combobox on any other keyDown
            if (event.key && event.key !== undefined) {
                if (closeKeys.some(close => close === event.key)) { 
                    // Close combobox on "Escape"
                    if (event.key === 'Escape') event.preventDefault();
                    this.handleSldsAriaCombobox(combobox, null, false);    
                    event.stopPropagation();
                } else {
                    // Open the combobox
                    if (!combobox.classList.contains('slds-is-open')) {
                        this.toggleCombobox(null, combobox);
                    }
                }
            } 

            const comboboxOptions = this.template.querySelectorAll('[data-id="comboboxOption"]');     
            if (!comboboxOptions) return;

            // Find the currently focused item
            const focused = Array.from(comboboxOptions).findIndex(option => 
                option.classList.contains('slds-has-focus')
            );

            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { 
                event.preventDefault(); 
                // Remove focus from the current item, if any
                if (focused !== -1) {
                    this.handleSldsAriaCombobox(null, comboboxOptions[focused], false);
                }

                // Calculate the next item index
                let nextIndex = 0; 
                if (event.key === 'ArrowDown') {
                    nextIndex = focused + 1 < comboboxOptions.length ? focused + 1 : 0; 
                } else {
                    nextIndex = focused - 1 > -1 ? focused - 1 : comboboxOptions.length - 1;
                }

                // Add focus to the next item
                this.handleSldsAriaCombobox(null, comboboxOptions[nextIndex], true);
                comboboxOptions[nextIndex].classList.add('slds-has-focus');

            } else if (event.key === 'Enter') {
                // Mark and option as slds-is-selected
                this.handleSldsAriaCombobox(null, comboboxOptions, false);  // Set all options to slds-is-selected and aria-checked  to false
                this.handleSldsAriaCombobox(null, comboboxOptions, true);  // Set the option with slds-has-focus to slds-is-selected/aria-checked
                this.handleSldsAriaCombobox(combobox, null, false);       // Close the combobox
            }
        } catch(error) {
            this.showToast('Error in handleComboboxKeyDown() of sldsCombobox.js', getErrorMessage(error), 'error');
        }
    }

    // Add slds-has-focus to the options when hovered
    handleHover(event) {
        try {
            if (this._comboxOptions && this._comboxOptions !== undefined && this._comboxOptions.length > 0) {
                this._comboxOptions.forEach(opt => {
                    if (event.currentTarget.dataset.value === opt.dataset.value) {
                        opt.classList.add('slds-has-focus');
                    } else {
                        if (opt.classList.contains('slds-has-focus')) {
                            opt.classList.remove('slds-has-focus');
                        }
                    }
                })
            }
        } catch(error) {
            getToastErrorMessage('handleHover', 'SldsCombobox', error);
        }
    }
    // Remove slds-has-focus to the options when un-hovered
    handleUnhover(event) {
        try {
            event?.currentTarget?.classList?.remove('slds-has-focus');
        } catch(error) {
            this.showToast('Error in handleUnhover() of sldsCombobox.js', getErrorMessage(error), 'error');
        }
        
    }

    // Don't allow focus to leave the input element when a list-option is clicked
    deflectFocus(event) {
        event.preventDefault();
    }

    _suppressBlur = false;
    handleDropdownMouseDown(e) {
        const el = e.currentTarget;
        

        // 1) Only apply this if the dropdown is actually scrollable
        const hasVerticalOverflow = this.localOptions?.length > 5;

        
        if (!hasVerticalOverflow) return;

        // 2) Overlay scrollbars often report width as 0, so use a small gutter
        const rect = el.getBoundingClientRect();
        const SCROLLBAR_GUTTER_PX = 18; // tweak 14–20 if you want

        const clickedNearRightEdge = e.clientX >= (rect.right - SCROLLBAR_GUTTER_PX);
        

        if (clickedNearRightEdge) {
            this._suppressBlur = true;
            e.preventDefault(); // keeps focus on input

            this.template
                .querySelector('[data-id="sldsComboboxInput"]')
                ?.focus({ preventScroll: true });

            // release next tick so normal option clicks still work
            Promise.resolve().then(() => { this._suppressBlur = false; });
        }
    }

    handleDropdownMouseUp() {
        this._suppressBlur = false;
    }
    // Close the combobox when input blurred
    handleBlur(event) {
        try {
            if (this._suppressBlur) return;
            event.preventDefault();
            const combobox = this.template.querySelector('[data-id="combobox"]');
            if (!combobox) return;

            const list = Array.isArray(this._comboxOptions) ? this._comboxOptions : [];
            const cur = String(this._currentValue || '');
            const focusedOpt = list.find(opt => opt?.dataset?.value === cur);
            if (focusedOpt?.classList) focusedOpt.classList.add('slds-has-focus');

            this.handleSldsAriaCombobox(combobox, null, false);
        } catch(error) {
            this.showToast('Error in handleBlur() of sldsCombobox.js', getErrorMessage(error), 'error');
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
