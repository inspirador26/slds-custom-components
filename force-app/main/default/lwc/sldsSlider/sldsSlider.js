/**
 * sldsSlider — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/utils.
 * - Salesforce/platform modules: lwc.
 * - Template children (including conditional UI): c-slds-input, c-toast-lwc, lightning-icon.
 * - Bundle template: sldsSlider.html; local styles: sldsSlider.css. Salesforce SLDS styling is expected.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-slider') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - step (step): Numeric increment used by the input/slider. Declared default: 1.
 *   Example: child.step = 1;
 * - min (min): Minimum numeric value.
 *   Example: child.min = 0;
 * - max (max): Maximum numeric value.
 *   Example: child.max = 100;
 * - currentValue (current-value): Current input or selected option value; keep parent state in sync with
 * the selection event.
 *   Example: child.currentValue = "open";
 * - label (label): Visible control label.
 *   Example: child.label = "Status";
 * - suppressLabel (suppress-label): Hides the slider label. Declared default: false.
 *   Example: child.suppressLabel = true;
 * - disabled (disabled): Disables interaction with the control.
 *   Example: child.disabled = true;
 * - disabledHeader (disabled-header): Compatibility property: heading shown in the disabled slider
 * explanation; currently stored/exposed but not consumed by this implementation. Declared default: 'Just a
 * heads up...'.
 *   Example: child.disabledHeader = "Just a heads up...";
 * - disabledLabel (disabled-label): Label shown for the disabled slider.
 *   Example: child.disabledLabel = "Unavailable";
 * - disabledMessage (disabled-message): Explanation shown for the disabled slider.
 *   Example: child.disabledMessage = "Select a record first.";
 * - dtype (dtype): Value decoration: number, percent (%) or currency ($).
 *   Example: child.dtype = "percent";
 * - labelFontSize (label-font-size): CSS size of the slider label.
 *   Example: child.labelFontSize = "0.875rem";
 * - labelColor (label-color): CSS color for the named slider text.
 *   Example: child.labelColor = "#181818";
 * - rangeLabelColor (range-label-color): CSS color for the named slider text.
 *   Example: child.rangeLabelColor = "#181818";
 * - rangeLabelFontWeight (range-label-font-weight): CSS weight of the named slider text.
 *   Example: child.rangeLabelFontWeight = "600";
 * - sliderTrackColor (slider-track-color): CSS slider track color.
 *   Example: child.sliderTrackColor = "#c9c9c9";
 * - fontSize (font-size): CSS text size, including units.
 *   Example: child.fontSize = "0.875rem";
 * - sliderFontWeight (slider-font-weight): CSS weight of the named slider text.
 *   Example: child.sliderFontWeight = "600";
 * - fontColor (font-color): CSS color for the named slider text.
 *   Example: child.fontColor = "#181818";
 * - sliderColor (slider-color): CSS slider active color.
 *   Example: child.sliderColor = "#0176d3";
 *
 * Public methods (call on the rendered child):
 * - getValue(): Read the current component value.
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-slds-slider label="Completion" min="0" max="100" step="5"
 *         dtype="percent" current-value={value} onslidervalue={handleValue}
 *         onslidermanualvalue={handleValue}></c-slds-slider>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     value = 25;
 *     handleValue(event) { this.value = event.detail; }
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Use for bounded numeric values with both a range control and manual input. slidervalue and
 * slidermanualvalue carry scalar values from their respective controls. dtype changes prefix/suffix
 * formatting. disabled-label/disabled-message explain a disabled control; parent logic owns saving.
 */

import { LightningElement, api } from 'lwc';

import { getErrorMessage } from 'c/utils';

function resolveDtypePrefixSuffix(dtype) {
    const dtypeLower = dtype?.toLowerCase();
    switch(dtypeLower) {
        case 'percent':
            return {prefix: '', suffix: '%'};
        case 'currency':
            return {prefix: '$', suffix: ''};
        default:
            return {prefix: '', suffix: ''};
    }
}


const DISABLED_ERROR_MESSAGE_ID = 'disabled-error-message-id-1';

const CONFIG_ERROR_MESSAGE_ID = 'config-error-message-id-1';

const GET_INPUTS_ERROR = (numMin, numMax, numVal) => {
    const inputsArr = [
        {name: 'Current Value', value: numVal, error: 'Current value is not a valid number.'},
        {name: 'Min Value', value: numMin, error: 'Minimum value is not a valid number'},
        {name: 'Max Value', value: numMax, error: 'Maximum value is not a valid number'}
    ];

    const inputErrors = inputsArr
        ?.filter(obj => !Number.isFinite(obj.value))
        ?.map(obj => obj.error) ?? [];


    return inputErrors.length 
        ? `The following errors occurred: ${inputErrors.join(', ')}`
        : null;
};

function checkConfigError(currentValue, min, max, prefix, suffix, label) {
    const numberMin = Number(min);
    const numberMax = Number(max);
    const numberVal = Number(currentValue);

    const inputsError = GET_INPUTS_ERROR(numberMin, numberMax, numberVal);

    if (inputsError) {
        return ['slds-form-element slds-has-error', inputsError];
    }

    const isBreachMax = numberVal > max;
    const isBreachMin = numberVal < min;

    if (isBreachMax) {
        return ['slds-form-element slds-has-error', `${label} is greater than maximum allowed value (${prefix}${max}${suffix})`];
    }
    if (isBreachMin) {
        return ['slds-form-element slds-has-error', `${label} is less than minimum allowed value (${prefix}${min}${suffix})`];
    }

    return ['slds-form-element', null];
}


export default class SldsSlider extends LightningElement {
    @api step = 1;

    
    // Value outside of min/max 
    _configError;
    // Class of  main form element (outermost wrapper)
    _formElementCl = 'slds-form-element';  
    // flag new value for rendered callback on new value 
    _isNewValue = false;
    // ================= Check for Range Errors on Initialization ================= \\
    _min = 0;                  // Min 
    @api 
    set min(val) {
        this._min = val;
        if (val) {
            this.handleErrorAttributes();
        }
    }
    get min() {
        return this._min;
    }
    _max = 100;               // Max 
    @api 
    set max(val) {
        this._max = val;
        if (val) {
            this.handleErrorAttributes();
        }
    }
    get max() {
        return this._max;
    }
    
    
    _currentValue = 0;           // Current 
    @api 
    set currentValue(value) {
        this._currentValue = !isNaN(Number(value)) ? Number(value) : 0;
        this._isNewValue = true;
        this.handleErrorAttributes();
    } 
    get currentValue() {
        return this._currentValue;
    }
    // ============================================================================ \\


    // Data-description label
    @api label; 
    // Hide label & min/max display
    @api suppressLabel = false; 

    // Disable slider
    _disabled = false;
    @api 
    set disabled(value) {
        if (value === false || value === "false") {
            this._disabled = false;
            if (this._disabled) {
                this.handleDisabledErrorAttribute();
                this.handleErrorAttributes();
            }
        } else if (value) {
            this._disabled = true;
        } else {
            this._disabled = false;
        }
    } 
    get disabled() {
        return this._disabled ?? false;
    }
    // Disabled helpers (for warning popover)
    @api disabledHeader = 'Just a heads up...';
    @api disabledLabel;
    @api disabledMessage;


    //  For label next to slider
    _prefix = '';
    _suffix = '';
    _dtype = 'number';
    @api 
    set dtype(value) {
        if (value) {
            this._dtype = value;
            const {prefix, suffix} = resolveDtypePrefixSuffix(value);
            this._prefix = prefix;
            this._suffix = suffix;
        } else {
            this._dtype = 'number';
            this._prefix = '';
            this._suffix = '';
        }
    } 
    get dtype() {
        return this._dtype ?? 'number';
    }

    // --Public Method-- Return the current value 
    @api getValue() {
        return this._currentValue;
    }

    // Handle input Slds Input (child)
    handleNewSliderVal(message) {
        const val = Number(message?.detail?.value);
        if (!isNaN(val)) {
            this._currentValue = val;
            this.dispatchEvent(new CustomEvent('slidermanualvalue', { detail: val } ));

        }
        this.handleErrorAttributes();
    }

    // Check for error messages
    renderedCallback() {
        if (this._isNewValue) {
            if (this._disabled) {
                this.handleDisabledErrorAttribute();
            } else {
                this.handleErrorAttributes();
            }
            this._isNewValue = false;
        }
    }

    handleDisabledErrorAttribute() {
        try {
            const sliderInput = this.refs?.sliderInput;
            if (sliderInput) {
                if (this._disabled) {
                    this._formElementCl = 'slds-form-element slds-has-error';
                    sliderInput.setAttribute('aria-describedby', DISABLED_ERROR_MESSAGE_ID);
                } else {
                    sliderInput.removeAttribute('aria-describedby');
                    this._formElementCl = 'slds-form-element';
                }
            }
        } catch(error) {
            this.showToast('Error in handleDisabledErrorAttribute() of sldsSlider.js: ', getErrorMessage(error), 'error');
        }
    }

    // Control form element classes and attributes related to errors
    handleErrorAttributes() {
        try {
            if (this._disabled) return;
            // Check if original had error
            const hadError = this._configError;

            // update error state
            [this._formElementCl, this._configError] = checkConfigError(this._currentValue, this._min, this._max, this._prefix, this._suffix, this.label);

            // check if updated has error
            const hasError = !!this._configError;
            
            if (hadError !== hasError) {
                // Update aria-describedBy
                const sliderInput = this.refs?.sliderInput;
                if (sliderInput) {
                    if (hasError && !sliderInput.hasAttribute('aria-describedby')) {
                        sliderInput.setAttribute('aria-describedby', CONFIG_ERROR_MESSAGE_ID);
                    } else if(!hasError) {
                        sliderInput.removeAttribute('aria-describedby');
                    }
                }
            } 
        } catch(error) {
            this.showToast('Error in handleErrorAttributes() of sldsSlider.js: ', getErrorMessage(error), 'error');
        }
    }

    // runs on every change in value 
    handleInput(event) {
        const val = event.target.value;
        this._currentValue = val;
    }

    // runs on committed value
    handleChange(event) {
        if (this._configError) {
            this.handleErrorAttributes();
        }
        const val = event.target.value;
        this.dispatchEvent(new CustomEvent('slidervalue', { detail: val } ));
    }


    
    // ============================ Styling Public Properties ============================ \\
    @api 
    set labelFontSize(value) {
        this._labelFontSize = value;
        if (value) {
            this._applyVarsDirect('--vg-slider-label-font-size', value);
        }
    } 
    get labelFontSize() {
        return this._labelFontSize;
    }
    @api 
    set labelColor(value) {
        this._labelColor = value;
        if (value) {
            this._applyVarsDirect('--vg-slider-label-font-color', value);
        }
    } 
    get labelColor() {
        return this._labelColor;
    }

    @api 
    set rangeLabelColor(value) {
        this._rangeLabelColor = value;
        if (value) {
            this._applyVarsDirect('--vg-slider-label-range-label-color', value);
        }
    } 
    get rangeLabelColor() {
        return this._rangeLabelColor;
    }

    @api 
    set rangeLabelFontWeight(value) {
        this._rangeLabelFontWeight = value;
        if (value) {
            this._applyVarsDirect('--vg-slider-label-range-label-font-weight', value);
        }
    } 
    get rangeLabelFontWeight() {
        return this._rangeLabelFontWeight;
    }

    @api 
    set sliderTrackColor(value) {
        this._sliderTrackColor = value;
        if (value) this._applyVarsDirect('--vg-slider-track-color', value);
    } 
    get sliderTrackColor() {
        return this._sliderTrackColor;
    }

    @api 
    set fontSize(value) {
        this._fontSize = value;
        if (value) {
            this._applyVarsDirect('--vg-slider-font-size', value);
        }
    } 
    get fontSize() {
        return this._fontSize;
    }
    @api 
    set sliderFontWeight(value) {
        this._sliderFontWeight = value;
        if (value) {
            this._applyVarsDirect('--vg-slider-font-weight', value);
        }
    } 
    get sliderFontWeight() {
        return this._sliderFontWeight;
    }
    @api 
    set fontColor(value) {
        this._fontColor = value;
        if (value) {
            this._applyVarsDirect('--vg-slider-font-color', value);
        }
    } 
    get fontColor() {
        return this._fontColor;
    }
    @api 
    set sliderColor(value) {
        this._sliderColor = value;
        this._applyVarsDirect('--vg-slider-color', value);
    } 
    get sliderColor() {
        return this._sliderColor;
    }
    // =================================================================================== \\


    
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