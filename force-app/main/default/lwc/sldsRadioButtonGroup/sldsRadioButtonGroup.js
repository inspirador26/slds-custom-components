/**
 * sldsRadioButtonGroup — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/utils.
 * - Salesforce/platform modules: lwc.
 * - Template children (including conditional UI): c-toast-lwc.
 * - Bundle template: sldsRadioButtonGroup.html; local styles: sldsRadioButtonGroup.css. Salesforce SLDS
 * styling is expected.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-radio-button-group') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - vertical (vertical): Stacks radio buttons vertically.
 *   Example: child.vertical = true;
 * - fontSize (font-size): CSS text size, including units.
 *   Example: child.fontSize = "0.875rem";
 * - minWidth (min-width): CSS minimum width of each radio button.
 *   Example: child.minWidth = "5rem";
 * - options (options): Option array with label and value; optional icon/metadata support depends on the
 * variant.
 *   Example: child.options = [{ label: 'Open', value: 'open' }];
 * - currentValue (current-value): Current input or selected option value; keep parent state in sync with
 * the selection event.
 *   Example: child.currentValue = "open";
 * - label (label): Visible control label.
 *   Example: child.label = "Status";
 * - required (required): Marks the control as required; validation behavior is component-specific.
 *   Example: child.required = true;
 * - suppressRequiredError (suppress-required-error): Suppresses the required-field error message. Declared
 * default: false.
 *   Example: child.suppressRequiredError = true;
 * - addonLeft (addon-left): Enables the left-addon radio group flag; current setter stores it without
 * applying styles.
 *   Example: child.addonLeft = true;
 * - addonRight (addon-right): Enables right-addon radio group styling.
 *   Example: child.addonRight = true;
 * - suppressLabelMargin (suppress-label-margin): Removes space beneath the radio group label.
 *   Example: child.suppressLabelMargin = true;
 * - suppressBoldLabel (suppress-bold-label): Uses normal-weight radio group label text.
 *   Example: child.suppressBoldLabel = true;
 *
 * Public methods (call on the rendered child):
 * - getValue(): Read the current component value.
 * - clearValues(): Clear the selected values.
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-slds-radio-button-group label="Status" options={options}
 *         current-value={value} onchange={handleChange}></c-slds-radio-button-group>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     options = [{ label: 'Open', value: 'open' }, { label: 'Closed', value: 'closed' }];
 *     value = 'open';
 *     handleChange(event) { this.value = event.detail; }
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Use for a small set of mutually exclusive choices displayed as buttons. change.detail is the selected
 * scalar. vertical={enabled}, with enabled = true, stacks the choices; required enables required-selection
 * handling. getValue() reads the selection and clearValues() clears it.
 */

import { LightningElement, api } from 'lwc';
import {getErrorMessage, iconMap as ICON_MAP} from 'c/utils';

let KEY_ID = 723;


// Returns options (arr of objects)
function evalCurrentValOfOptions(currentValue, options, required) {
    if (
        currentValue === undefined || 
        currentValue === null || 
        currentValue === ''
    ) {
        if (required) {
            return (options ?? []).map((opt, index) => {
                return index === 0
                    ? {...opt, isSelected: true} 
                    : opt;
            })
        } else {
            return options;
        }
    }

    if (
        required && 
        currentValue && 
        !(options ?? []).some(opt => opt.value === currentValue)
    ) {
        return (options ?? []).map((opt, index) => {
            return index === 0
                ? {...opt, isSelected: true}
                : opt;
        })
    }

    return options.map(opt => ({
        ...opt, isSelected: opt.value === currentValue
    }));
}

export default class SldsRadioButtonGroup extends LightningElement {
    _groupName = `rb_${Math.random().toString(36).slice(2)}`;
    iconMap = ICON_MAP;
    _radioGroupCl = 'slds-radio_button-group';

    @api 
    set vertical(val) {
        this._vertical = val;
        if (val) {
            this._radioGroupCl = this._radioGroupCl + ' vertical-group';
        }
    }
    get vertical() {
        return this._vertical;
    }

    @api 
    set fontSize(val) {
        this._fontSize = val;
        if (val) {
            this._applyVarsDirect('--vg-font-size', val);
        }
    }
    get fontSize() {
        return this._fontSize;
    }
    @api 
    set minWidth(val) {
        this._minWidth = val;
        if (val) {
            this._applyVarsDirect('--button-min-width', val);
        }
    }
    get minWidth() {
        return this._minWidth;
    }

    // Accept a string as such so can write the option right into the template
    // Example: options="[ {label: tommy, value: tommy}, {label: juice, value: juice} ]"
    _options = [];
    @api 
    set options(val) {
        KEY_ID = 723;
        this._inited = false;
        this._options = evalCurrentValOfOptions(this._currentValue, val, this.required).map(opt => ({
            ...opt, keyId: opt?.keyId ?? String(KEY_ID++)
        }));
    }
    get options() {
        return this._options;
    }

    _currentValue;
    @api 
    set currentValue(val) {
        this._currentValue = val;
        if (this._options?.length) {
            this._options = evalCurrentValOfOptions(val, this._options, this.required);
        }
    }
    get currentValue() {
        return this._currentValue;
    }

    @api label;
    
    @api 
    set required(val) {
        this._required = !!val;
        if (this._options?.length) {
            this._options = evalCurrentValOfOptions(this._currentValue, this._options, val);
        }
    }
    get required() {
        return !!this._required;
    }
    @api suppressRequiredError = false;

    @api 
    set addonLeft(val) {
        this._addonLeft = val;
        if (val) {
            //this._applyVarsDirect('--border-radius-left', val);
        }
    }
    get addonLeft() {
        return this._addonLeft;
    }

    _formControlCl = 'slds-form-element__control';
    @api 
    set addonRight(val) {
        this._addonRight = val;
        if (val) {
            //this._applyVarsDirect('--border-radius-right', val);
            this._radioGroupCl = this._radioGroupCl + ' addon-right-radio-group';
            this._formControlCl = 'slds-form-element__control slds-input-has-icon slds-input-has-icon_right';
        }
    }
    get addonRight() {
        return this._addonRight;
    }

    @api 
    set suppressLabelMargin(val) {
        this._suppressLabelMargin = val;
        if (val) this._applyVarsDirect('--c-label-margin-bottom', '0px');
    }
    get suppressLabelMargin() {
        return this._suppressLabelMargin;
    }
    @api 
    set suppressBoldLabel(val) {
        this._suppressBoldLabel = val;
        if (val) this._applyVarsDirect('--c-label-font-weight', 'normal');
    }
    get suppressBoldLabel() {
        return this._suppressBoldLabel;
    }

    // Send parent value 
    @api getValue() {
        return this._currentValue;
    }
    @api clearValues() {
        this._options = this._options.map((opt, index) => {
            return index === 0 && this.required 
                ? {...opt, isSelected: true}
                : {...opt, isSelected: false};
        });
    }


    // Check for required error/error-cleared 
    _errorsMarked = false;
    _inited = false;
    renderedCallback() {
        if (!this._inited) {
            if (this.required && !this._options.some(opt => opt.isSelected)) {
                this._options = this._options.map((opt, index) => ({
                    ...opt, isSelected: index === 0
                }));
            }
            this._currentValue = this._options.find(opt => opt.isSelected)?.value;
            this._inited = true;
        }
        if (!this.suppressRequiredError) {
            if (this.required && !this._currentValue && !this._errorsMarked) {
                // add required error
                this.handleAriaDescribedBy(true);
            }

            if (this.required && this._currentValue && this._errorsMarked) {
                // remove required error
                this.handleAriaDescribedBy(false);
            }
        }
    }


    // Set inputs as aria-describedby="error-uniquie-id-219" if error 
    // ... --> Remove aria-describedby if no longer has errors 
    handleRequiredErrors(isError=false) {
        try {
            const inputs = this.template.querySelectorAll('input');
            const formElement = this?.refs?.formElement;
            if (inputs && formElement) {
                const arrInputs = Array.from(inputs);
                if (arrInputs?.length) {
                    if (isError) {
                        inputs.forEach(inp => {
                            inp.setAttribute("aria-describedby", "error-unique-id-219");
                        });
                        formElement.classList.add('slds-has-error');
                        this._errorsMarked = true;
                    } else {
                        inputs.forEach(inp => {
                            inp.removeAttribute("aria-describedby");
                        });
                        formElement.classList.remove('slds-has-error');
                        this._errorsMarked = false;
                    }
                }
            }
        } catch(error) {
            this.showToast('Error in handleAriaDescribedBy() of sldsRadioButtonGroup.js', getErrorMessage(error), 'error');
        }
    }

    // Flag component as errored if required and no value    
    get requiredError() {
        if (!this.suppressRequiredError) {
            if (!this._currentValue && this.required) {
                return 'This field is required'
            }
        }
        return null;
    }

    // Mark selected option as "isSelected" && send new value to parent
    handleChange(event) {
        try {
            const value = event.target.value;
            const keyId = event.target?.dataset?.keyId ?? event.currentTarget?.dataset?.keyId;

            if (!keyId) return;

            // Prefer key id (use value as backup)
            const matchedProp = keyId 
                ? 'keyId' 
                : 'value'; 

            // Key id or value to find selected option
            const propVal = matchedProp === 'keyId'
                ? keyId
                : value;

            // New value to send to parent
            const eventVal = this._options.find(opt => opt?.[matchedProp] === propVal)?.value;


            // if no change --> abort
            if (this._currentValue === eventVal) return;


            // Update current value
            this._currentValue = eventVal;


            // Mark selected option as selected
            this._options = this._options.map(opt => ({
                ...opt, isSelected: opt?.[matchedProp] === propVal
            }));

            // Remove errors if required
            if (this.required && this._errorsMarked) {
                this.handleAriaDescribedBy();
            }


            this.dispatchEvent(new CustomEvent('change', { detail: eventVal } ));

        } catch(error) {
            this.showToast('Error in handleChange() of SldsRadioButtonGroup.js', getErrorMessage(error), 'error');
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