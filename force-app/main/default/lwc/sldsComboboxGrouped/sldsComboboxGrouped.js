/**
 * sldsComboboxGrouped — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/utils.
 * - Salesforce/platform modules: lwc.
 * - Template children (including conditional UI): c-toast-lwc.
 * - Bundle template: sldsComboboxGrouped.html; local styles: sldsComboboxGrouped.css. Salesforce SLDS
 * styling is expected.
 * - Shared CSS modules: c/sharedStylesSldsCombobox, c/sharedStylesGlobal.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-combobox-grouped') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - includeGroup (include-group): Includes the selected group label in the displayed value. Declared
 * default: false.
 *   Example: child.includeGroup = true;
 * - dropdownLength (dropdown-length): SLDS dropdown length class suffix; use a supported length such as 5
 * or 7.
 *   Example: child.dropdownLength = 5;
 * - currentGroupedVal (current-grouped-val): Selected group/value pair, useful when values repeat across
 * groups.
 *   Example: child.currentGroupedVal = { group: 'Status', value: 'open' };
 * - currentValue (current-value): Current input or selected option value; keep parent state in sync with
 * the selection event.
 *   Example: child.currentValue = "open";
 * - placeHolder (place-holder): Prompt shown when the input has no selection or text. Declared default:
 * 'Select an Option'.
 *   Example: child.placeHolder = "Select an option";
 * - label (label): Visible control label.
 *   Example: child.label = "Status";
 * - isPopover (is-popover): Enables popover-specific blur/keyboard handling.
 *   Example: child.isPopover = true;
 * - isAddon (is-addon): Uses styles intended for an adjacent addon control.
 *   Example: child.isAddon = true;
 * - isGrow (is-grow): Allows the dropdown to grow beyond its usual constrained layout.
 *   Example: child.isGrow = true;
 * - groupedOptions (grouped-options): Groups shaped as { label, options: [{ label, value }] }; use instead
 * of flat options.
 *   Example: child.groupedOptions = [{ label: 'Status', options: [{ label: 'Open', value: 'open' }] }];
 *
 * Public methods (call on the rendered child):
 * - errorMe(errorMessage=null): Mark the control invalid; accepts an optional error message where
 * supported.
 * - focusMe(): Focus the component input/control.
 * - focusOpenMe(): Focus the input and open its dropdown.
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-slds-combobox-grouped label="Status" grouped-options={groups}
 *         current-grouped-val={selection} onselection={handleSelection}>
 *     </c-slds-combobox-grouped>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     groups = [{ label: 'Status', options: [{ label: 'Open', value: 'open' }, { label: 'Closed', value: 'closed' }] }];
 *     selection = { group: 'Status', value: 'open' };
 *     handleSelection(event) { this.selection = event.detail.selection; }
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Use for a single choice organized into groups. selection and groupcomboblur carry { selection };
 * grouped selections contain { group, value }. For ungrouped current-state matching, current-value can
 * also hold a scalar. include-group controls the displayed group prefix.
 */

import { LightningElement, track, api } from 'lwc';
import { handleReadOnlySearch, 
    iconMap as ICON_MAP, 
    publicPropertyToBool, 
    getErrorMessage,
    handleDropdownFlip,
} from 'c/utils';

/* Example usage:

    Javascript:
        myLabel = 'Label above the combobox';
        myPlaceHolder = 'Choose Something';
        myCurrentValue = 'y';
        myCurrentValueGroup = 'Group 1'
        myGroupedOptions = [
            {label: 'Group 1', options: [
                {label: 'x', value: 'y'},
                {label: 'z', value: 'a'},
                ]
            },
            {label: 'Group 2', options: [
                {label: 'b', value: 'c'},
                {label: 'd', value: 'e'},
                ]
            },
        ];

        handleSelection(message) {
            const selection = message.detail.selection;
        }

    HTML:
        <x-slds-combobox-grouped
            label={myLabel}
            place-holder={myPlaceHolder}
            current-value={myCurrentValue}
            grouped-options={myGroupedOptions}
            onselection={handleSelection}
        ></x-slds-combobox-grouped>
*/


const SELECT = (ele) => {
    ele.classList.add("slds-has-focus", "slds-is-selected");
    ele.setAttribute("aria-selected", "true");
    ele.setAttribute("aria-checked", "true");
}
const REMOVE = (ele) => {
    if (
        ele.classList.contains("slds-has-focus") || 
        ele.classList.contains("slds-is-selected")
    ) {
        ele.classList.remove("slds-has-focus", "slds-is-selected");
        ele.setAttribute("aria-selected", "false");
        ele.setAttribute("aria-checked", "false");
    }
}
const SCROLL = (ele) => ele.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // Ensure visibility

const NAV_KEYS = ['Enter', 'Escape', 'Shift', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

const DROPDOWN_LENGTHS = ['5', '7', '10'];
const DROPDOWN_MAP = {
    large: 10,
    medium: 7,
    small: 5
};



export default class SldsComboboxGrouped extends LightningElement {
    
    @track counterId = 2300;

    // include the group name in the label of the current value in the <input> element
    @api includeGroup = false;

    @api 
    set dropdownLength(val) {
        this._dropdownLength = String(val);
    }
    get dropdownLength() {
        return this._dropdownLength ?? '7';
    }

    @track iconMap = ICON_MAP;
    isRendered = false;

    // ------------- Public Properties ------------- \\
    @api currentGroupedVal;
    _currentValue = '';
    @api 
    set currentValue(val) {
        this._currentValue = val;
        if (this._groupedOptions) {
            this._groupedOptions = this._groupedOptions.map(obj => {
                if (obj.options.some(opt => opt.value === val)) {
                    return {
                        ...obj,
                        options: obj.options.map(opt => {
                            return opt.value === val 
                                ? {...opt, isSelected: true}
                                : {...opt, isSelected: false};
                        })
                    }
                }
                return {
                    ...obj, 
                    options: obj.options.map(opt => ({...opt, isSelected: false}))
                };
            });
        }
    }
    get currentValue() {
        return this._currentValue ?? '';
    }
    @api placeHolder = 'Select an Option';
    @api label;

    @api 
    set isPopover(val) {this._isPopover = publicPropertyToBool(val);;}
    get isPopover() {return this._isPopover;}

    @api 
    set isAddon(val) {this._isAddon = publicPropertyToBool(val);;}
    get isAddon() {return this._isAddon;}

    @api // Allow the dropdown to grow
    set isGrow(val) {this._isGrow = publicPropertyToBool(val);}
    get isGrow() {return this._isGrow;}

    _groupedOptions = [];
    @api  
    set groupedOptions(value) {
        try {
            if (value) {

                this._groupedOptions = value.filter(g => g).map(group => {
                    const groupLabel = group.label;
                    return {
                        label: groupLabel, 
                        groupId: `${groupLabel}-${this.counterId++}`,
                        options: group.options.map(opt => {
                            return {
                                ...opt,
                                group: groupLabel,
                                optionId: `${opt.value}-${this.counterId++}`,
                                isSelected: this._currentValue === opt.value
                            }
                        })
                    };
                });
            }
        }catch(error) {
            console.error('Error in set groupedOptions(value) of SldsComboboxGrouped.js: ', getErrorMessage(error));
        }
    }
    get groupedOptions() {
        return this._groupedOptions;
    }
    // --------------------------------------------- \\
    _comboboxContainer;
    _inputEle;
    _comboboxOptions;
    _groupHeaders;
    _navMode = 'mouse';   // 'mouse' or 'keyboard'
    originalValue = '';
    _errorMessage;


    // ======================== Public Methods =========================== \\
    // Get error message from parent when invalid input
    @api errorMe(errorMessage=null) {
        // Change the template queries if combobox is an addon_end
        const container = this.isAddon ? '.slds-combobox_container' : '.slds-form-element';
        const uniqueId = this.isAddon ? "error-message-unique-id-addon" : "error-message-unique-id";
        
        if (errorMessage) {
            this.template.querySelector(container).classList.add('slds-has-error');
            this._inputEle.setAttribute("aria-describedby", uniqueId);
            this._inputEle.setAttribute("aria-invalid", "true");
            this._errorMessage = errorMessage;
        } else {
            if (this._errorMessage) {
                this.template.querySelector(container).classList.remove('slds-has-error');
                this._inputEle.removeAttribute("aria-describedby");
                this._inputEle.setAttribute("aria-invalid", "false");
                this._errorMessage = null;
            }
        }
    }
    // =================================================================== \\

    get dropdownLengthCl() {
        if (DROPDOWN_LENGTHS.some(l => l === this._dropdownLength)) {
            return `slds-dropdown slds-dropdown_length-${this._dropdownLength} slds-dropdown_fluid`;
        }
        if (DROPDOWN_MAP[this._dropdownLength]) {
            return `slds-dropdown slds-dropdown_length-${DROPDOWN_MAP[this._dropdownLength]} slds-dropdown_fluid`;
        }
        return 'slds-dropdown slds-dropdown_length-7 slds-dropdown_fluid';
    }

    // Display the label of the current choice - not the value
    get valueLabel() {
        try {
            if (this.currentGroupedVal) {
                for (const group of this._groupedOptions) {
                    if (group.label === this.currentGroupedVal.group) {
                        const selectedOption = group.options.find(opt => opt.value === this.currentGroupedVal.value);
                        if  (selectedOption) {
                            return this.includeGroup 
                                ? `${group.label} - ${selectedOption.label}`
                                : selectedOption.label;
                        }
                    }
                }
                return '';
            }
            if (this._currentValue) {
                for (const group of this._groupedOptions) {
                    const selectedOption = group.options.find(opt => opt.value === this._currentValue);
                    if  (selectedOption) {
                        return this.includeGroup 
                            ? `${group.label} - ${selectedOption.label}`
                            : selectedOption.label;
                    }
                }
                return '';
            }
            return '';
        }catch(error) {
            console.error('get valueLabel', error);
        }
    }

    // modularize this.template.querySelector / this.template.querySelectorAll
    queryDataId(queryStr, dataProperty='data-id', isAll=false) {
        try {
            const element = isAll
            ? this.template.querySelectorAll(`[${dataProperty}="${queryStr}"]`)
            : this.template.querySelector(`[${dataProperty}="${queryStr}"]`);
        
            return element ? element : null;
        }catch(error) {
            console.error('groupedOptions', error);
        }
    }

    // Put focus on the input  element
    @api focusMe() {
        if (this._inputEle) {
            this._inputEle.focus();
        }
    }
    // Open and focus the combobox
    @api focusOpenMe() {
        if (this._inputEle) {
            this._inputEle.focus();
        }
        this.openCombobox();
        requestAnimationFrame(() => {handleDropdownFlip(this);});
    }

    // Get all HTML elements that are used in JS
    queryTrackedEles() {
        try {
            if (!this._comboboxContainer) {
                const comboboxContainer = this.queryDataId('combobox');
                if (comboboxContainer) this._comboboxContainer = comboboxContainer;
            }
            if (!this._inputEle) {
                const inputEle = this.queryDataId('comboboxInput');
                if (inputEle) this._inputEle = inputEle;
            }
            if (!this._comboboxOptions) {
                const comboboxOptions = this.queryDataId('comboboxOption', 'data-id', true);
                if (comboboxOptions) this._comboboxOptions = comboboxOptions;
            }
            if (!this._groupHeaders) {
                const groupHeaders = this.template.querySelectorAll('[data-element="groupHeader"]');
                if (groupHeaders) this._groupHeaders = groupHeaders;
            }

            if (!this.originalValue) this.originalValue = this._currentValue;

            if (!this.isRendered) {
                if (this.isGrow) {
                    const dropdown = this.template.querySelector('.slds-dropdown_fluid');
                    if (dropdown) { 
                        dropdown.classList.add('slds-dropdown_large', 'dropdown-grow');
                        dropdown.style.setProperty('width', '100%', 'important');  
                        this.isRendered = true;
                    } 
                }
            }
        } catch(error) {
            console.error('Error in queryTrackedEles() of sldsComboboxGrouped.js: ', error);
        }
    }
    // Track the main combobox options and store in global variable
    renderedCallback() {
        try {
            this.queryTrackedEles();

        }catch(error) {
            console.error('renderedCallback', error);
        }
    }

    
    // open the dropdown and set focus on the current CHOICE
    openCombobox(arrowType=null) {
        try {
            this.queryTrackedEles();

            this._comboboxContainer.classList.add('slds-is-open');
            this._comboboxContainer.setAttribute("aria-expanded", "true");
            if (this._currentValue || this.currentGroupedVal) {
                this.handleSelectedAttributes(this._currentValue || this.currentGroupedVal);
            } else {
                if (arrowType) {
                    // Find the currently focused item
                    const focused = Array.from(this._comboboxOptions).findIndex(option => option.classList.contains('slds-has-focus'));
                    if (arrowType === 'ArrowDown' || arrowType === 'ArrowUp') { 
                        // Remove focus from the current item, if any
                        if (focused !== -1) {
                            this.handleOptionsNav(focused);
                            return;
                        }
        
                        // Calculate the next item index
                        let nextIndex = 0; 
                        if (arrowType === 'ArrowDown') {
                            nextIndex = focused + 1 < this._comboboxOptions.length ? focused + 1 : 0;
                        } else {
                            nextIndex = focused - 1 > -1 ? focused - 1 : comboboxOptions.length - 1;
                        }
                        
                        this.handleOptionsNav(nextIndex); 
                    }
                }
            }
        }catch(error) {
            console.error('openCombobox', error);
        }
    }
    // Close the dropdown & notify parent of current value
    closeCombobox() {
        try {
            this._comboboxContainer.classList.remove('slds-is-open');
            this._comboboxContainer.setAttribute("aria-expanded", "false");
            this.originalValue = '';
            setTimeout(() => {
                if (this._comboboxContainer) {
                    this.dispatchEvent(new CustomEvent('selection', { detail: {selection: this.currentGroupedVal || this._currentValue}, bubbles: true } ));
                }
            }, 30);
        }catch(error) {
            console.error('closeCombobox', error);
        }
        
    }

    
    // Send 'blur' event to parent if is Popover
    handleBlur() {
        if (this.isPopover) {
            this.dispatchEvent(new CustomEvent('groupcomboblur', { detail: {selection: this.currentGroupedVal || this._currentValue} } ));
        } else {
            this.closeCombobox();
        }
    }   

    // Handle attribute of CHOSEN option
    handleSelectedAttributes(value=null, groupedVal=null) {
        try {
            if (value || groupedVal) {
                this._comboboxOptions.forEach(option => {
                    const isSelected = groupedVal
                        ? option.dataset.value === groupedVal.value && option.dataset.group === groupedVal.group 
                        : option.dataset.value === value;

                    if (isSelected) {
                        option.setAttribute("aria-selected", "true");
                        option.setAttribute("aria-checked", "true");
                        option.classList.add("slds-has-focus", "slds-is-selected");
                    } else {
                        option.setAttribute("aria-selected", "false");
                        option.classList.remove('slds-has-focus', 'slds-is-selected');
                        option.setAttribute("aria-checked", "false");
                    }
                });
            } 
        }catch(error) {
            console.error('handleSelectedAttributes', error);
        }
    }
    // Set the focus on the current focused option
    handleOptionsNav(index) {
        try {
            const focusedVal = this._comboboxOptions[index].dataset.value;
            // Remove focus from the current item, if any
            this._comboboxOptions.forEach(option => {
                if (option.dataset.value === focusedVal) {
                    if (index === 0) {
                        // Scroll the group header into view
                        const closestHeader = Array.from(this._groupHeaders)[0];
                        if (closestHeader) {
                            closestHeader.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                        else {
                            option.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                    } else {
                        option.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // Ensure visibility
                    }
                    option.classList.add('slds-is-selected', 'slds-has-focus');
                    option.setAttribute("aria-selected", "true");
    
                } else {
                    option.classList.remove('slds-is-selected', 'slds-has-focus');
                    option.setAttribute("aria-selected", "false");
                }
            });
        }catch(error) {
            console.error('handleOptionsNav', error);
        }
    }

    // When choice is made set the option to isSelected: true
    reMapGroups() {
        try {
            if (this.currentGroupedVal) {
                this._groupedOptions = this._groupedOptions.map(group => {
                    const valsSet = new Set(group.options.map(opt => opt.value));
                    return group.label === this.currentGroupedVal.group && valsSet.has(this.currentGroupedVal.value)
                        ? {
                            ...group, 
                            options: group.options.map(opt => {
                                return opt.value === this.currentGroupedVal.value ? {...opt, isSelected: true} : {...opt};
                            })
                        }
                        : group;
                });
            } else {
                this._groupedOptions = this._groupedOptions.map(group => {
                    if (group.options.some(opt => opt.value === this._currentValue)) {
                        return {
                            ...group,
                            options: group.options.map(opt => {
                                return opt.value === this._currentValue 
                                    ? {...opt, isSelected: true}
                                    : {...opt};
                            })
                        };
                    }
                    return {...group};
                });
            }
        } catch(err) {
            console.error('Error in reMapGroups() of SldsComboboxGrouped.js:  ', err);
        }
    }

    // Handle Option CHOICE (close the combobox)
    handleOptionClick(event) {
        const dataVal = event.currentTarget.dataset.value;
        this._currentValue = dataVal;
        const dataGrpdVal = {group: event.currentTarget.dataset.group, value: dataVal};
        this.currentGroupedVal = dataGrpdVal;
        this.handleSelectedAttributes(null, dataGrpdVal);
        setTimeout(() => {
            this.reMapGroups();
        }, 20);
    }


    // Handle Escape/Enter/ArrowUp+Down
    handleKeyDown(event) {
        try {
            const mutedKeys = ['Control', 'Alt', 'Meta', 'Shift'];

            if (event && event.key) {
                this._comboboxOptions = this.template.querySelectorAll('[role="option"]');
                switch(true) {

                    // Abort if non-interactive keys
                    case mutedKeys.some(muted => event.key === muted):
                        return;

                    // Close the combobox
                    case event.key === 'Escape':
                        event.preventDefault();
                        if (this._comboboxContainer.classList.contains('slds-is-open')) { this.closeCombobox();}
                        return;

                    // Handle Keyboard navigation
                    case event.key === 'ArrowUp' || event.key === 'ArrowDown':
                        // Set Nav Mode to keyboard
                        this._navMode = 'keyboard';
                        // Dont let the page scroll
                        event.preventDefault();

                        if (!this._comboboxContainer.classList.contains('slds-is-open')) {
                            // Open Combobox
                            this.openCombobox(event.key);
                            requestAnimationFrame(() => {handleDropdownFlip(this);});
                        } else {
                            // Navigate through the options
                            let selected = Array.from(this._comboboxOptions).findIndex(opt => opt.classList.contains('slds-has-focus'));
                            if (event.key === 'ArrowUp') {
                                // Get the next option by moving down the arrays length (e.g. if current is 2 next is 1)
                                selected = selected - 1 < 0 
                                    ?  Array.from(this._comboboxOptions).length - 1
                                    : selected - 1;
                            } else {
                                // Get the next option by moving up the arrays length (e.g. if current is 2 next is 3)
                                selected = selected + 1 > Array.from(this._comboboxOptions).length - 1
                                    ? 0
                                    : selected + 1;
                            }
                            // Set the focused attributes on the selection
                            this.handleOptionsNav(selected);
                        }
                        return;
                    
                    case event.key === 'Enter':
                        if (!this._comboboxContainer.classList.contains('slds-is-open')) {
                            // Set the focused attributes on the selection
                            //let selected = this._currentValue
                            //    ? Array.from(this._comboboxOptions).findIndex(opt => opt.dataset.value === this._currentValue) 
                            //    : 0;
                            this.openCombobox();
                            requestAnimationFrame(() => {handleDropdownFlip(this);});
                            //this.handleOptionsNav(selected);
                            return;
                        }
                        // Handle Option CHOICE (close the combobox)
                        const currentSelection = Array.from(this._comboboxOptions).find(opt => opt.classList.contains('slds-is-selected'));
                        if (currentSelection) {
                            this._currentValue = currentSelection.dataset.value;
                            this.currentGroupedVal = {group: currentSelection.dataset.group, value: currentSelection.dataset.value};
                            this.handleSelectedAttributes(this.currentGroupedVal);
                            this.reMapGroups();
                        }
                        this.closeCombobox();
                        break;

                    default:
                        break;
                }
            }

        }catch(error) {
            console.error('handleKeyDown', error);
        }
    }

    // Toggle slds-is-open on dropdown click
    handleDropdownClick(event) {
        event.stopPropagation();
        if (this._comboboxContainer.classList.contains('slds-is-open')) {
            this.closeCombobox();
        } else {
            this.openCombobox();
            requestAnimationFrame(() => {handleDropdownFlip(this);});
        }
    }

    // Toggle to mouse nav on mouse move
    handleMouseMove() {
        this._navMode = 'mouse';
    }

    // Focus the option when hovered
    focusHover(event) {
        if (this._navMode === 'keyboard') return;

        const option = event.currentTarget;
        this._comboboxOptions = this.template.querySelectorAll('[data-id="comboboxOption"]');

        this._comboboxOptions.forEach(opt => {
            opt.classList.remove('slds-has-focus');
            opt.closest('.slds-listbox__item')?.classList.remove('slds-has-focus');

            if (!opt.classList.contains('slds-is-selected')) {
                opt.setAttribute("aria-selected", "false");
            }
        });

        if (option) {
            option.classList.add('slds-has-focus');
            option.setAttribute("aria-selected", "true");
        }

    }
    // UnFocus the option when mouse leaves
    unfocusHover(event) {
        event.preventDefault();
        const option = event.currentTarget;
        if (option) {
            option.classList.remove('slds-has-focus');
            option.closest('.slds-listbox__item')?.classList.remove('slds-has-focus');

            if (!option.classList.contains('slds-is-selected')) {
                option.setAttribute("aria-selected", "false");
            }
        }
    }

    // Don't allow focus to leave the input element when a list-option is clicked
    deflectFocus(event) {
        event.preventDefault();
    }

    
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

            if (!last || diffMs > 2000) {
                this._readOnlyStr = '';
            }

            const flatGroupedOptions = (this._groupedOptions ?? []).flatMap(grp => grp.options ?? []);
            const { nextStr, match } = handleReadOnlySearch(event, this._readOnlyStr, flatGroupedOptions);

            if (typeof nextStr === 'string') {
                this._readOnlyStr = nextStr;
                this._readOnlyStrTimeStamp = now;

                const applyFocus = () => {
                    const comboOptions = this.template.querySelectorAll('[role="option"]');
                    if (!comboOptions || comboOptions.length === 0) return false;

                    if (match) {
                        const strVal = String(match.value);
                        const matchedEle = Array.from(comboOptions).find(
                            ele => String(ele.dataset.value) === strVal
                        );
                        if (matchedEle) {
                            comboOptions.forEach(combo => {
                                if (combo === matchedEle) {
                                    if (!match.isConvert && !match.disabled) {
                                        SELECT(combo);
                                        //SELECT(combo.closest('li'));
                                    }
                                    SCROLL(matchedEle);
                                } else {
                                    REMOVE(combo);
                                    //REMOVE(combo.closest('li'));
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
            this.showToast('Error in handleInputKeyDown() of sldsComboboxGrouped.js', getErrorMessage(error), 'error');
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
