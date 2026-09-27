/**
 * dropdownPlain — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/utils.
 * - Salesforce/platform modules: lwc, lightning/uiObjectInfoApi.
 * - Template children (including conditional UI): c-toast-lwc, c-tooltip-button, lightning-icon.
 * - Bundle template: dropdownPlain.html; local styles: dropdownPlain.css. Salesforce SLDS styling is
 * expected.
 * - Shared CSS modules: c/sharedStylesSldsCombobox.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-dropdown-plain') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - currentValue (current-value): Current input or selected option value; keep parent state in sync with
 * the selection event.
 *   Example: child.currentValue = "open";
 * - placeHolder (place-holder): Prompt shown when the input has no selection or text. Declared default:
 * 'Select an Option'.
 *   Example: child.placeHolder = "Select an option";
 * - isStickyValue (is-sticky-value): Compatibility property: legacy selection-state flag exposed by
 * dropdownPlain; currently stored/exposed but not consumed by this implementation. Declared default:
 * false.
 *   Example: child.isStickyValue = true;
 * - hasMeta (has-meta): Compatibility property: enables additional metadata lines on options; currently
 * stored/exposed but not consumed by this implementation. Declared default: false.
 *   Example: child.hasMeta = true;
 * - label (label): Visible control label.
 *   Example: child.label = "Status";
 * - recordTypeId (record-type-id): Record type ID used to load record-type-specific metadata.
 *   Example: child.recordTypeId = "012000000000000AAA";
 * - fieldApiName (field-api-name): Unqualified field API name, paired with the object API name.
 *   Example: child.fieldApiName = "Industry";
 * - objectApiName (object-api-name): Salesforce object API name used for metadata, navigation or record
 * operations.
 *   Example: child.objectApiName = "Account";
 * - comboboxDetails (combobox-details): Picklist configuration with objectApiName, fieldApiName and
 * recordTypeId.
 *   Example: child.comboboxDetails = { objectApiName: 'Account', fieldApiName: 'Industry', recordTypeId:
 * '012000000000000AAA' };
 * - recordTypeInfos (record-type-infos): Compatibility property: record type metadata accepted by the
 * legacy dropdown API; currently stored/exposed but not consumed by this implementation.
 *   Example: child.recordTypeInfos = this.recordTypeInfos;
 * - isRequired (is-required): Marks the control as required; validation behavior is component-specific.
 * Declared default: false.
 *   Example: child.isRequired = true;
 * - isPopover (is-popover): Enables popover-specific blur/keyboard handling.
 *   Example: child.isPopover = true;
 * - isDisabled (is-disabled): Disables interaction with the control.
 *   Example: child.isDisabled = true;
 * - isTabbable (is-tabbable): Allows Tab navigation without the usual popover dismissal handling.
 *   Example: child.isTabbable = true;
 * - isClearSelection (is-clear-selection): Clears the displayed value after emitting selection.
 *   Example: child.isClearSelection = true;
 * - options (options): Option array with label and value; optional icon/metadata support depends on the
 * variant.
 *   Example: child.options = [{ label: 'Open', value: 'open' }];
 *
 * Public methods (call on the rendered child):
 * - sendValues(): Return or dispatch the current value using this component's implementation.
 * - getValue(): Read the current component value.
 * - clearMenu(): Clear the legacy dropdown selection.
 * - focusMe(): Focus the component input/control.
 * - focusOpenMe(): Focus the input and open its dropdown.
 * - errorMe(): Mark the control invalid; accepts an optional error message where supported.
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-dropdown-plain label="Status" options={options}
 *         current-value={value} onselection={handleSelection}></c-dropdown-plain>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     options = [{ label: 'Open', value: 'open' }, { label: 'Closed', value: 'closed' }];
 *     value = 'open';
 *     handleSelection(event) {
 *         const detail = event.detail;
 *         this.value = detail && typeof detail === 'object' ? detail.selection : detail;
 *     }
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Use for a legacy read-only picklist. Normal selection emits { selection }, but one keyboard path emits
 * a scalar; the example handles both. escape signals popover dismissal.
 * - For Salesforce picklists, replace options with combobox-details={details} and set details to {
 * objectApiName: 'Account', fieldApiName: 'Industry', recordTypeId: '<accessible record type ID>' }. The
 * object, field and record type must exist in the org.
 */

import { LightningElement, api, track, wire } from 'lwc';
import { 
    iconMap as ICON_MAP, 
    getToastErrorMessage, 
    handleReadOnlySearch, 
    publicPropertyToBool, 
    getErrorMessage 
} from 'c/utils';

import { getPicklistValues } from 'lightning/uiObjectInfoApi';

const CONVERTED_MESSAGE = 'You must visit the record page to convert a record.';
const CLOSED_MESSAGE = 'You must visit the record page to close a record.';
const UNKNOWN_MESSAGE = 'You must visit the record page to convert/close a record';

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

export default class Dropdownplain extends LightningElement {
    @track iconMap = ICON_MAP;
    @track isKeyIds = false;
    @track _preventBlur = false;
    @api currentValue;
    @api placeHolder = 'Select an Option';
    @api isStickyValue = false;
    @api hasMeta  = false;
    @api label;
    navMode;

     // -------- Public Properties -------- \\ (Retrieved from @api comboboxDetails)
    _wiredFieldApiName = undefined;
    _recordTypeId = undefined;
    @api 
    set recordTypeId(val) {
        this._recordTypeId = val;
    }
    get recordTypeId() {
        return this._recordTypeId || undefined;
    }         
    @api 
    set fieldApiName(val) {
        this._fieldApiName = val;
        if (this.objectApiName && val) {
            this._wiredFieldApiName = `${this.objectApiName}.${val}`;
        }
    }
    get fieldApiName() {
        return this._fieldApiName || undefined;
    }     
    @api 
    set objectApiName(val) {
        this._objectApiName = val;
        if (this.fieldApiName && val) {
            this._wiredFieldApiName = `${val}.${this.fieldApiName}`
        }
    }
    get objectApiName() {
        return this._objectApiName || undefined;
    }                                 
    recordId;
    
    // Handle Public Property 'comboboxDetails'
    _comboboxDetails; // RecordTypeId, ObjectApiName, FieldApiName
    @api
    set comboboxDetails(value) {
        if (value) {
            this._comboboxDetails = value;
            // Rest Public properties
            this._recordTypeId = undefined;
            this.objectApiName = undefined;
            this.fieldApiName = null;
            // Reset tracked variables
            this.isDataLoaded = false;

            // Get the public property values
            for (const key of Object.keys(value)) {
                this[key] = value[key];
            }
        }
    }
    get comboboxDetails() {
        return this._comboboxDetails;
    }
    // ============== Initialize Dependencies ============== \\
    @wire(getPicklistValues, { recordTypeId: "$recordTypeId", fieldApiName: '$_wiredFieldApiName' })
    wiredPicklistValues({ error, data }) {
        if (data) {
            const picklistValues = data.values || [];

            // Your existing option shaping
            this._options = picklistValues.map(opt => {
                if (opt?.attributes?.converted || opt?.attributes?.closed) {
                    const disabledMessage = opt?.attributes?.converted
                        ? CONVERTED_MESSAGE
                        : CLOSED_MESSAGE;
                    return {label: opt.label, value: opt.value, disabledMessage, isConvert: true}
                }
                return {label: opt.label, value: opt.value};
            });
            //this.wiredPicklistLoaded = true;
        } else if (error) {
            //this.wiredPicklistLoaded = true;
            this.showToast('Error in wiredPicklistValues() of dropdownPlain.js', getErrorMessage(error), 'error');
        } 
    } // Fetch Picklist Values by Record Type
    // ----------------------------------- \\

    //@track localOptions = [];
    originalValue = null;
    eventSending = false;

    @api recordTypeInfos;

    @track isComboBoxOpen = false;
    @track highlightedOptionId = null;

    _readOnlyStrTimeStamp;
    _readOnlyStr = '';   // Allow user to type to try to find an option 
    _comboboxOptions;

    @api isRequired=false;
    @track hasError = false;

    @api // Close on blur if is popover 
    set isPopover(val) {
        this._isPopover = val && (val===true || val==='true');
    }
    get isPopover() {
        return this._isPopover;
    }

    // Disable a field
    @api set isDisabled(val) {this._isDisabled = publicPropertyToBool(val);}
    get isDisabled() {return this._isDisabled || false;}
    

    @api // Set to true to prevent close event on Tab keydown
    set isTabbable(val) { this._isTabbable = publicPropertyToBool(val); }
    get isTabbable() { return this._isTabbable; }

    @api // Clear Selection once selection is made
    set isClearSelection(val) {
        this._isClearSelection = val && (val === "true" || val === true);
    }
    get isClearSelection() {
        return this._isClearSelection;
    }

    _options;
    @api // List of options for combobox
    set options(value) {
        if (value) {
            this.originalValue = this.currentValue;

            if (value.some(option => option.hasOwnProperty('keyId'))) {
                this.isKeyIds = true; // Flag that the options have key ids
            }
            this._options = value.map(option => {
                return {
                    ...option, isSelected: this.currentValue ? option.value === this.currentValue : false
                }
            });
        }
    }
    get options() {
        return this._options ?? [];
    }
    
    // ================= Events Communcation ================ \\
    // Send event to parent when an option has been selected
    handleSelection(isNullSelection=false, key=null) {
        try {
            if (isNullSelection) {
                this.dispatchEvent(new CustomEvent('escape', { detail: key && key === 'Tab' ? 'Tab' : '' } ));
                return;
            }
            if (!this.eventSending) {
                this.eventSending = true;
                // Remove the error flag if an option was selected
                if (this.hasError) {
                    // Check that a selection was made from the options
                    if (this._options.some(opt => opt.value === this.currentValue)) {
                        this.hasError = false;
                    }
                }

                setTimeout(() => {
                    this.dispatchEvent(new CustomEvent('selection', { detail: {selection: this.currentValue} } ));
                    this.eventSending = false;
                    if (this.isClearSelection) { this.currentValue = ''; }
                }, 25);
            }
        } catch(error) {
            this.showToast('Error in handleSelection() of dropdownPlain.js: ', error);
        }
    }
    // Send this.currentValue to requester
    @api sendValues() {
        return this.currentValue;
    }
    @api getValue() {
        return this.currentValue;
    }
    // Clear selection and focus the combobox
    @api clearMenu() {
        setTimeout(() => {
            this.currentValue = null;
            this.originalValue = null;
        }, 250);
        //comboboxInput.focus();
    }
    @api focusMe() {
        const comboboxInput = this.template.querySelector('input');
        if (comboboxInput) {
            comboboxInput.focus();
        }
    }
    @api focusOpenMe() {
        const combobox = this.template.querySelector('[data-id="combobox"]');
        if (combobox) {
            combobox.classList.add('slds-is-open');
            this.focusMe();
            this.handleNewlyOpenedCombobox();
        } 
    }
    // Flag error with the combobox
    @api errorMe() {
        this.hasError = true;
    }
    // ===================================================== \\

    // Add slds-has-error is <this.hasError> is true
    get formElementClass() {
        return this.hasError 
            ? "slds-form-element slds-has-error"
            : "slds-form-element";
    }
    // Capitalize letters of the ticker
    get valueLabel() {
        return this.currentValue 
            ? this._options.find(opt => opt.value === this.currentValue)?.label || this.currentValue
            : null; 
    }

    // ===================== Callbacks ===================== \\
    // Initialize <-localOptions-> && store <-originalValue->
    renderedCallback() {
        const comboOpts = this.template.querySelectorAll('[data-id="comboboxOption"]');
        if (comboOpts) this._comboboxOptions = comboOpts;
    }
    // ===================================================== \\

    // Handle Combobox option Click events
    handleOptionClick(event) {
        try {
            const dataVal = event.currentTarget.dataset.value;
            const selectedOption = this.template.querySelector(
                `[data-id="comboboxOption"][data-value="${CSS.escape(dataVal)}"]`
            );
            this.currentValue = dataVal;
            
            this.handleSldsAriaCombobox(null, selectedOption, true);
            
            this.toggleCombobox();
        }catch(error) {
            console.error('handleOptionClick', 'SldsCombobox', error)
        }
    }

    _handleDropdownFlip() {
        const dropdown = this.template.querySelector('.slds-dropdown_fluid');
        if (!dropdown) return;
        // Reset any previous flip
        dropdown.classList.remove('dropdown-up');

        const rect = dropdown.getBoundingClientRect();
        const overflowBottom = rect.bottom > window.innerHeight;
        const overflowTop = rect.top < 0;

        // If it overflows below the viewport and has more space above, flip it
        if (overflowBottom && rect.top > rect.height) {
            dropdown.classList.add('dropdown-up');
        } else if (overflowTop) {
            // In case it somehow renders above the viewport already
            dropdown.classList.remove('dropdown-up');
        }
    }


    get localOptions() {
        if  (!this._options?.length) return [];
        return this._options.map(opt => {
            const isSelected = opt.value === this.currentValue;

            if (opt?.attributes?.converted || opt?.attributes?.closed || opt?.isConvert) {
                const disabledMessage = opt?.attributes?.converted
                    ? CONVERTED_MESSAGE
                    : opt?.attributes?.closed ? CLOSED_MESSAGE
                    : UNKNOWN_MESSAGE;
                    
                return {...opt, isConvert: true, disabledMessage, isSelected}
            }
            return {...opt, isSelected};
        });
    }

    // ==================== Disabled Handlers ==================== \\
    _isDisabledIndex(i) {
        const opt = this._options?.[i];
        return !!opt?.isConvert; // add other disable rules here if needed
    }
    _findFirstEnabledIndex() {
        for (let i = 0; i < this._comboboxOptions.length; i++) {
            if (!this._isDisabledIndex(i)) return i;
        }
        return -1;
    }
    _findLastEnabledIndex() {
        for (let i = this._comboboxOptions.length - 1; i >= 0; i--) {
            if (!this._isDisabledIndex(i)) return i;
        }
        return -1;
    }
    _findEnabledIndexByValue(value) {
        const idx = this._options?.findIndex(o => o?.value === value);
        return (idx >= 0 && !this._isDisabledIndex(idx)) ? idx : -1;
    }    
    handleDisabledClick(event) {
        event.stopPropagation();
        event.preventDefault();
        const optVal = event?.target?.dataset?.value ?? event?.currentTarget?.dataset?.value;
        const matchedAttrs = this.localOptions?.find(opt => opt?.value === optVal)?.attributes;
        if (matchedAttrs) {
            const endResult = {closed: matchedAttrs?.closed, converted: matchedAttrs?.converted};
            if (endResult.closed) {
                this.showToast('Option not selectable.', 'You must visit the record page to close a record.', 'info');
            } else if (endResult.converted) {
                this.showToast('Option not selectable.', 'You must visit the record page to convert a record.', 'info');
            }

        }
    }
    // ============================================================ \\

    handleNewlyOpenedCombobox(key = null) {
        let selected;

        const clearFocus = () => {
            this._comboboxOptions.forEach(opt => {
                if (opt.classList.contains('slds-has-focus')) {
                    REMOVE(opt);
                    REMOVE(opt.closest('li'));
                }
            });
        };

        const selectIndex = (idx) => {
            if (idx < 0) return;
            const optEl = this._comboboxOptions[idx];
            if (!optEl) return;
            SELECT(optEl);
            SELECT(optEl.closest('li'));
            selected = optEl;
        };

        clearFocus();

        if (key && (key === 'ArrowUp' || key === 'ArrowDown')) {
            const idx = key === 'ArrowDown'
                ? this._findFirstEnabledIndex()
                : this._findLastEnabledIndex();

            selectIndex(idx);

        } else if (!this._options.some(opt => opt.isSelected)) {
            selectIndex(this._findFirstEnabledIndex());

        } else {
            // if currentValue points to a disabled option, fall back to first enabled
            const idx = this._findEnabledIndexByValue(this.currentValue);
            selectIndex(idx >= 0 ? idx : this._findFirstEnabledIndex());
        }

        if (selected) {
            setTimeout(() => {
                selected.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
        }

        requestAnimationFrame(() => this._handleDropdownFlip());
    }

    
    // Handle open/close triggering events for Combobox
    toggleCombobox(event=null, comboboxParam=null) {
        try {
            if (event && event.key && event.key === 'Escape') {
                event.preventDefault();
                if (!this.isPopover) event.stopPropagation();
                const combobox = this.template.querySelector('[data-id="combobox"]');
                if (!combobox.classList.contains('slds-is-open')) {
                    this.dispatchEvent(new CustomEvent('escape', { detail: 'escape' } ));
                } else {
                    combobox.classList.remove('slds-is-open');
                    combobox.setAttribute('aria-expanded', 'false');
                }
                if (!this.isPopover) return;
            }

            if (!comboboxParam && event?.type === 'click') {
                const combobox = this.template.querySelector('[data-id="combobox"]');
                if (combobox) {
                    if (!combobox?.classList?.contains('slds-is-open')) {
                        this.handleNewlyOpenedCombobox();
                        if (combobox) combobox.classList.add('slds-is-open');
                        requestAnimationFrame(() => this._handleDropdownFlip());
                        return;
                    } else {
                        combobox.setAttribute('aria-expanded', "false");
                        combobox.classList.remove('slds-is-open');
                        return;
                    }
                }
            }
            this.navMode = 'keyboard';
            const mutedKeys = ['Control', 'Alt', 'Meta', 'Shift'];
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
            if (event && event.key && event.key !== undefined) {
                if (this.isComboBoxOpen) {
                    // If combobox dropdown is open --> Bounce the keyDown events to the comboboxOptions keyDown handler
                    if (event.key !== undefined && event.key === 'Escape') {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    event.preventDefault();
                    this.handleComboboxKeyDown(event);
                    return;

                } else if(!this.isComboBoxOpen) {
                    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                        // Make sure page does not scroll down when user wants to open combobox
                        event.preventDefault();
                        
                        this.handleNewlyOpenedCombobox(event.key);
                    }
                    if (event.key === 'Enter') {
                        this.handleNewlyOpenedCombobox();
                    }
                } 
            }

            // Handle Option clicks --> save selection & close combobox
            if ([event, comboboxParam].every(param => !param)) {
                const combobox = this.template.querySelector('[data-id="combobox"]');
                // When option is clicked it also triggers the dropdown toggler --> must set timeout to bounce it
                setTimeout(() => {
                    try {
                        this.handleSldsAriaCombobox(combobox, null, false);
                        if (event) {event.stopPropagation();}
                    }catch(error) { console.error('toggleCombobox-timeout', 'SldsCombobox', error); }
                }, 20);

                return;
            }

            // Query the markup for combobox 
            const combobox = event ? this.template.querySelector('[data-id="combobox"]') : comboboxParam;
            if (!combobox) return; // Exit if no combobox is found

            // Open the Combobobox (forced)
            if ((!event && comboboxParam) || (!event.key || event.key === undefined)) {
                // Toggle the 'slds-is-open'
                this.handleSldsAriaCombobox(combobox);
                requestAnimationFrame(() => this._handleDropdownFlip());
                return;
            }

            // Open the Combobobox on click
            if (event && event.key && event.key !== undefined && ['Tab', 'Escape'].every(keyType => event.key !== keyType)) { 
                this.handleSldsAriaCombobox(combobox, null, true);
            }

        } catch(error) {
            this.showToast('Error in toggleCombobox() of dropdownPlain.js: ', getErrorMessage(error), 'error');
        }
    }
    
    // Control the combobox slds class states && the Aria attributes
    handleSldsAriaCombobox(combobox=null, comboboxOptions=null, isPositive=null, key=null) {
        try {
            // Handle Combobox Input element as parameter
            if (combobox) {

                if (isPositive === null) {
                    // Case 1: (is an actual toggle) --> 'isPositive' is neither true or false
                    const isOpen = combobox.classList.toggle('slds-is-open');
                    combobox.setAttribute('aria-expanded', isOpen ? 'true' : 'false'); 
                    this.isComboBoxOpen = isOpen ? true : false; 
                    if (isOpen) {
                        // Notify parent of open and focus the current selected option
                        requestAnimationFrame(() => this._handleDropdownFlip());
                    } 

                } else if(isPositive === false) {
                    // Case 2: Force the combobox dropdown to close
                    combobox.classList.remove('slds-is-open'); 
                    combobox.setAttribute('aria-expanded', 'false');
                    this.isComboBoxOpen = false;
                } else {
                    // Case 3: Force the combobox to open
                    combobox.classList.add('slds-is-open'); 
                    combobox.setAttribute('aria-expanded', 'true');
                    this._options.forEach(option => option.isSelected = this.currentValue === option.value); // action='findSelected'
                    this.isComboBoxOpen = true;
                    requestAnimationFrame(() => this._handleDropdownFlip());
                }
            }
            // Handle Combobox List option elements as parameter
            if (comboboxOptions) {
                // Handle single combobox option OR all combobox options
                if (Array.from(comboboxOptions).length > 1) {
                    // Case 1: Operate on all combobox options 
                    if (isPositive) {
                        // Case 1.a: Find the focused combobox && mark it as selected && update the current <-draftValue->
                        const selected = Array.from(comboboxOptions).find(option => option.classList.contains('slds-has-focus')); 
                        if (!selected) return;
                        if (!selected.classList) return;
                        selected.classList?.add('slds-is-selected');  // Mark the focused combox as "slds-is-selected"
                        selected.setAttribute('aria-checked', 'true'); // Mark the focused combox as "aria-checked=true"
                        selected.classList.add('slds-has-focus');
                        selected.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // Ensure visibility
                        this._options.forEach(option => option.isSelected = option.value === selected.dataset.value); // action='UpdateDraftValue'
                        this.currentValue = selected.dataset.value;

                    } else {
                        // Case 1.b: Mark all options as not 'slds-is-selected' and not 'aria-checked'
                        comboboxOptions.forEach(option => {option.classList.remove('slds-is-selected'); option.setAttribute('aria-checked', 'false') });
                    }
                    
                } else {
                    // Case 2: Operate on single combobox option
                    if (isPositive) {
                        // Case 2.a: set focus/aria-selected to false  on the single option

                        // Remove focus from all options
                        this._comboboxOptions?.forEach(combo => {combo.classList.remove('slds-has-focus'); combo.setAttribute('aria-selected', 'false');});
                        comboboxOptions.classList.add('slds-has-focus');
                        comboboxOptions.setAttribute('aria-selected', 'true');
                        comboboxOptions.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // Ensure visibility
                    } else {
                        // Case 2.b: set focus/aria-selected to true  on the single option
                        comboboxOptions.classList.remove('slds-has-focus');
                        comboboxOptions.setAttribute('aria-selected', 'false');
                        comboboxOptions.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // Ensure visibility
                    }

                }
            }

            // Pass event to parent component if selection was made
            if (!this.isComboBoxOpen) {
                key && key === 'Tab' 
                    ? this.handleSelection(false, 'Tab') 
                    : this.handleSelection();
            }
        }catch(error) {
            console.error('Error in handleSldsAriaCombobox() of dropdownPlain.js: ', error)
        }
    }
  
    // Handle combobox keyboard navigations
    handleComboboxKeyDown(event) {
        try {
            this.navMode === 'keyboard';
            // Keys the comobobox should ignore
            const mutedKeys = ['Control', 'Alt', 'Meta', 'Shift'];
            if (mutedKeys.some(muted => event.key === muted)) { return; }

            // Keys that close the combobox (do not prevent default)
            const closeKeys = ['Escape', 'Tab'];

            // Get the combobox element
            const combobox = this.template.querySelector('[data-id="combobox"]');
            if (!combobox) return;

            // Close on "Escape" and open combobox on any other keyDown
            if (event && event.key && event.key !== undefined) {
                if (closeKeys.some(close => close === event.key)) { 
                    // Close combobox on "Escape"
                    if (event.key === 'Escape') event.preventDefault();
                    this.handleSldsAriaCombobox(combobox, null, false, event.key);    
                    if (event.key === 'Escape') event.stopPropagation();
                } else {
                    // Open the combobox
                    if (!combobox.classList.contains('slds-is-open')) {
                        this.toggleCombobox(null, combobox);
                        requestAnimationFrame(() => this._handleDropdownFlip());
                    }
                }
            } 

            const comboboxOptions = this.template.querySelectorAll('[data-id="comboboxOption"]');     
            if (!comboboxOptions) return;

            // Find the currently focused item
            const focused = Array.from(comboboxOptions).findIndex(option => option.classList.contains('slds-has-focus'));

            if (event && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) { 
                event.preventDefault(); 
                // Remove focus from the current item, if any
                if (focused !== -1) {
                    this.handleSldsAriaCombobox(null, comboboxOptions[focused], false);
                }

                // Calculate the next item index
                let nextIndex = 0; 
                if (event && event.key === 'ArrowDown') {
                    nextIndex = focused + 1 < comboboxOptions.length ? focused + 1 : 0;

                    const rel = this.localOptions.slice(nextIndex).findIndex(opt => !opt.isConvert);
                    const abs = rel === -1 ? -1 : nextIndex + rel;

                    nextIndex = abs !== -1
                        ? abs
                        : this.localOptions.findIndex(opt => !opt.isConvert);

                } else {
                    nextIndex = focused - 1 > -1
                        ? focused - 1
                        : comboboxOptions.length - 1;

                    // walk backwards from nextIndex → 0
                    let rel = this.localOptions
                        .slice(0, nextIndex + 1)        // include nextIndex
                        .reverse()
                        .findIndex(opt => !opt.isConvert);

                    if (rel !== -1) {
                        // convert reversed index back to absolute index
                        nextIndex = nextIndex - rel;
                    } else {
                        // wrap: find last enabled option
                        nextIndex = [...this.localOptions]
                            .reverse()
                            .findIndex(opt => !opt.isConvert);

                        if (nextIndex !== -1) {
                            nextIndex = this.localOptions.length - 1 - nextIndex;
                        }
                    }

                }

                // Add focus to the next item
                this.handleSldsAriaCombobox(null, comboboxOptions[nextIndex], true);
                comboboxOptions[nextIndex].classList.add('slds-has-focus');

            } else if (event && event.key === 'Enter') {
                // Mark and option as slds-is-selected
                this.handleSldsAriaCombobox(null, comboboxOptions, false);  // Set all options to slds-is-selected and aria-checked  to false
                this.handleSldsAriaCombobox(null, comboboxOptions, true);  // Set the option with slds-has-focus to slds-is-selected/aria-checked
                this.handleSldsAriaCombobox(combobox, null, false);       // Close the combobox
            }
        }catch(error) {
            console.error('Error in handleComboboxKeyDown() of dropdownPlain.js: ', error)
        }
    }
    
    enableHover() {
        this.navMode = 'mouse';
    }

    // Add slds-has-focus to the options when hovered
    handleHover(event) {
        try {
            if (this.navMode !== 'keyboard') {
                if (this._comboboxOptions && this._comboboxOptions !== undefined && this._comboboxOptions.length > 0) {
                    this._comboboxOptions.forEach(opt => {
                        if (event.currentTarget.getAttribute('aria-disabled') === "true") {
                            opt.closest('li').classList.remove('slds-has-focus', 'slds-is-selected');
                            opt.classList.remove('slds-has-focus', 'slds-is-selected');
                        } else if (event.currentTarget.dataset.value === opt.dataset.value) {
                            opt.closest('li').classList.add('slds-has-focus');
                            opt.classList.add('slds-has-focus', 'slds-is-selected');
                            
                        } else {
                            if ([opt.closest('li'), opt].some(ele => ele.classList.contains('slds-has-focus', 'slds-is-selected'))) {
                                opt.closest('li').classList.remove('slds-has-focus', 'slds-is-selected');
                                opt.classList.remove('slds-has-focus', 'slds-is-selected');
                            }
                        }
                    })
                }
            }
        } catch(error) {
            console.error('handleHover', 'SldsCombobox', error);
        }
    }
    // Remove slds-has-focus to the options when un-hovered
    handleUnhover(event) {
        try {
            event?.currentTarget?.closest('li').classList?.remove('slds-has-focus');
        }catch(error) {
            console.error('handleUnhover', 'SldsCombobox', error);
        }
        
    }

  
    // Remove any highlight from the input box when focused
    handleFocus(event) {
        const input = event.target;
        // Move the cursor to the end without selecting the text
        const length = input.value.length;
        input.setSelectionRange(length, length);
    }


    // Don't allow focus to leave the input element when a list-option is clicked
    deflectFocus(event) {
        event.preventDefault();
    }

    handleInputKeyDown(event) {
        try {
            if (event.key === 'Tab' ) {
                if (this.isComboBoxOpen) {
                    const focusedOption = this.template.querySelector('[data-id="comboboxOption"].slds-has-focus');
                    if (focusedOption) {
                        this.currentValue = focusedOption.dataset.value;
                        this.dispatchEvent(new CustomEvent('selection', { detail: this.currentValue } ));
                    }
                }
                return;
            }    

            if (!this.isPopover && event.key === 'Escape' && this.isComboBoxOpen) {
                event.preventDefault();
                const combobox = this.template.querySelector('[data-id="combobox"]'); 
                if (combobox) {
                    combobox.classList.setAttribute('aria-expanded', 'false');
                    combobox.classList.remove('slds-is-open');
                    this.isComboBoxOpen = false;
                    event.stopPropagation();
                    return;
                }
            }

            const ignoreKeys = ['Enter', 'Escape', 'Shift', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
            if (event?.key && ignoreKeys.some(ignore => ignore === event.key)) {
                if (event.key === 'Escape') event.preventDefault();
                this._readOnlyStr = '';
                return;
            }

            event.stopPropagation();
            if (!this._comboboxOptions) {
                // Query template for the combobox options
                const combos = this.template.querySelectorAll('[data-id="comboboxOption]');
                if (combos) this._comboboxOptions = combos;
            }


            // how many ms have passed
            const diffMs = Date.now() - this._readOnlyStrTimeStamp; 
            if (diffMs > 2000) {
                this._readOnlyStr = '';
            }
            
            const {nextStr, match, index} = handleReadOnlySearch(event, this._readOnlyStr, this._options);
            
            if (typeof nextStr === 'string') {
                this._readOnlyStr = nextStr;
                this._readOnlyStrTimeStamp = Date.now(); 
                if (match) {
                    const matchedEle = Array.from(this._comboboxOptions)?.find(ele => ele.dataset.value === match.value);
                    if (matchedEle) {
                        // Remove slds-has-focus from all the options
                        this._comboboxOptions.forEach(combo => {
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
            }
        } catch(error) {
            getToastErrorMessage('Error in handleInputKeyDown()() of dropdownPlain.js: ', error);
        }
    }

    // Close the combobox when input blurred
    handleBlur(event) {
        try {
            if (!this._isPopover) return;

            if (this._isPopover && !this._isTabbable) {
                if (!this._preventBlur) {
                    this.dispatchEvent(new CustomEvent('escape', { detail: '' } ));
                } else {
                    this._preventBlur = false;
                }
            }
            //event.preventDefault();
            // Get the combobox element (dropdownTrigger)
            const combobox = this.template.querySelector('[data-id="combobox"]');

            if (!combobox) return;

            // Close combobox
            combobox.classList.remove('slds-is-open');
            //this.handleSldsAriaCombobox(combobox, null, false);  
            
        }catch(error) {
            console.error('handleBlur', 'SldsCombobox', error);
        }
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

}
