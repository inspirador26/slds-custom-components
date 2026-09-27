import { LightningElement, api } from 'lwc';
import {getErrorMessage} from 'c/utils';

let KEY_ID = 723;


// Returns options (arr of objects)
function evalCurrentValOfOptions(currentValue, options) {
    if (!currentValue?.length) {
        return (options ?? []).map(opt => ({...opt, isSelected: false}));
    }

    return options.map(opt => ({
        ...opt, isSelected: currentValue.includes(opt.value)
    }));
}


export default class SldsCheckboxButtonGroup extends LightningElement {
    _groupName = `rb_${Math.random().toString(36).slice(2)}`;

    _checkGroupCl = 'slds-checkbox_button-group';
    @api 
    set vertical(val) {
        this._vertical = val;
        if (val) {
            this._checkGroupCl = 'slds-checkbox_button-group vertical-group';
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

    // Accept a string as such so can write the option right into the template
    // Example: options="[ {label: tommy, value: tommy}, {label: juice, value: juice} ]"
    _options = [];
    @api 
    set options(val) {
        KEY_ID = 723;
        this._options = evalCurrentValOfOptions(this._currentValue, val).map(opt => ({
            ...opt, keyId: opt?.keyId ?? String(KEY_ID++)
        }));
    }
    get options() {
        return this._options;
    }

    // Array of selected values 
    _currentValue = [];
    @api 
    set currentValue(val) {
        // Make sure current value is an array
        const formattedVal = typeof val === 'string' ? [val]
            : Array.isArray(val) ? val 
            : [];

        this._currentValue = formattedVal;
       
        if (this._options?.length) {
            this._options = evalCurrentValOfOptions(formattedVal, this._options);
        }
    }
    get currentValue() {
        return this._currentValue;
    }

    @api label;
    @api isRequired = false;


    // Send parent value 
    @api getValue() {
        return this._currentValue;
    }

    @api clearValues() {
        this._options = this._options.map(opt => ({
            ...opt, isSelected: false
        }));
    }


    // Check for required error/error-cleared 
    _errorsMarked = false;
    renderedCallback() {
        if (this.isRequired && !this._currentValue.length && !this._errorsMarked) {
            // add required error
            this.handleRequiredErrors(true);
        }

        if (this.isRequired && this._currentValue.length && this._errorsMarked) {
            // remove required error
            this.handleRequiredErrors(false);
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
            this.showToast('Error in handleRequiredErrors() of sldsRadioButtonGroup.js', getErrorMessage(error), 'error');
        }
    }

    // Flag component as errored if required and no value    
    get requiredError() {
        if (!this._currentValue?.length && this.isRequired) {
            return 'This field is required'
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

            this._currentValue = this._currentValue?.includes(eventVal) 
                ? this._currentValue.filter(v => v !== eventVal)
                : [...this._currentValue, eventVal];

            this._options = evalCurrentValOfOptions(this._currentValue, this._options);

            // Remove errors if required
            if (this.isRequired && this._errorsMarked) {
                this.handleRequiredErrors();
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