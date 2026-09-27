/**
 * sldsInput — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/utils.
 * - Salesforce/platform modules: lwc, @salesforce/apex/DynamicSObjectController.getRecordName.
 * - Template children (including conditional UI): c-slds-popover, c-toast-lwc, c-tooltip-button,
 * lightning-icon, lightning-input-rich-text, lightning-record-picker.
 * - Bundle template: sldsInput.html; local styles: sldsInput.css. Salesforce SLDS styling is expected.
 * - Shared CSS modules: c/sharedStylesGlobal.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-input') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - min (min): Minimum numeric value.
 *   Example: child.min = 0;
 * - max (max): Maximum numeric value.
 *   Example: child.max = 100;
 * - focusOnReady (focus-on-ready): Focuses the input after it becomes available/rendered. Declared
 * default: false.
 *   Example: child.focusOnReady = true;
 * - formLabel (form-label): Supplementary form label used by the input implementation.
 *   Example: child.formLabel = "Details";
 * - rtl (rtl): Sets right-to-left input direction.
 *   Example: child.rtl = true;
 * - dtype (dtype): Input data type controlling rendering and value conversion.
 *   Example: child.dtype = "text";
 * - filter (filter): Filter configuration passed to lightning-record-picker for reference input.
 *   Example: child.filter = { criteria: [{ fieldPath: 'Name', operator: 'like', value: 'A%' }] };
 * - inlineHelp (inline-help): Help text for the label tooltip.
 *   Example: child.inlineHelp = "Enter a value.";
 * - suppressBlurRequired (suppress-blur-required): Suppresses required-field validation on blur. Declared
 * default: false.
 *   Example: child.suppressBlurRequired = true;
 * - isRequired (is-required): Marks the control as required; validation behavior is component-specific.
 *   Example: child.isRequired = true;
 * - isDisabled (is-disabled): Disables interaction with the control.
 *   Example: child.isDisabled = true;
 * - isPopover (is-popover): Enables popover-specific blur/keyboard handling.
 *   Example: child.isPopover = true;
 * - errorMessage (error-message): Externally supplied validation message; a truthy value marks the input
 * invalid.
 *   Example: child.errorMessage = "A value is required.";
 * - isTabbable (is-tabbable): Allows Tab navigation without the usual popover dismissal handling.
 *   Example: child.isTabbable = true;
 * - currentValue (current-value): Current input or selected option value; keep parent state in sync with
 * the selection event.
 *   Example: child.currentValue = "open";
 * - label (label): Visible control label.
 *   Example: child.label = "Status";
 * - placeHolder (place-holder): Prompt shown when the input has no selection or text.
 *   Example: child.placeHolder = "Select an option";
 * - suppressErrorText (suppress-error-text): Hides the inline validation message while retaining the error
 * state. Declared default: false.
 *   Example: child.suppressErrorText = true;
 * - sendOnChange (send-on-change): Compatibility property: emits newinput while handling change rather
 * than waiting only for finalization; currently stored/exposed but not consumed by this implementation.
 * Declared default: false.
 *   Example: child.sendOnChange = true;
 * - focusHelpText (focus-help-text): Help content shown while the input has focus.
 *   Example: child.focusHelpText = "Press Enter to apply.";
 * - nubbin (nubbin): Popover nubbin placement token.
 *   Example: child.nubbin = "bottom-left";
 * - centered (centered): Centers the input text.
 *   Example: child.centered = true;
 * - suppressDefaultStyles (suppress-default-styles): Suppresses the component's default input styling.
 *   Example: child.suppressDefaultStyles = true;
 * - suppressNativeStyles (suppress-native-styles): Suppresses native input styling.
 *   Example: child.suppressNativeStyles = true;
 * - addonLeft (addon-left): Text displayed beside the input on the named side.
 *   Example: child.addonLeft = "USD";
 * - addonRight (addon-right): Text displayed beside the input on the named side.
 *   Example: child.addonRight = "USD";
 * - step (step): Numeric increment used by the input/slider.
 *   Example: child.step = 1;
 * - inputHeight (input-height): CSS input/control height, including units.
 *   Example: child.inputHeight = "2rem";
 * - borderRadius (border-radius): CSS corner radius, including units.
 *   Example: child.borderRadius = "0.25rem";
 * - fontSize (font-size): CSS text size, including units.
 *   Example: child.fontSize = "0.875rem";
 * - objectName (object-name): Salesforce object API name used for metadata, navigation or record
 * operations.
 *   Example: child.objectName = "Account";
 * - nameField (name-field): API name of the record display/name field.
 *   Example: child.nameField = "Name";
 *
 * Public methods (call on the rendered child):
 * - getValue(): Read the current component value.
 * - sendValues(): Return or dispatch the current value using this component's implementation.
 * - errorMe(errMsg=null): Mark the control invalid; accepts an optional error message where supported.
 * - removeErrorMe(): Clear the externally marked validation error.
 * - async focusMe(): Focus the component input/control.
 * - clearMe(): Clear/reset the input value.
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-slds-input label="Description" dtype="text" current-value={value}
 *         onnewinput={handleInput}></c-slds-input>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     value = '';
 *     handleInput(event) {
 *         const detail = event.detail;
 *         this.value = detail && typeof detail === 'object' ? detail.value : detail;
 *     }
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Use for text, boolean, textarea, number, currency, percent, date, datetime, decimal, reference or
 * richtext input. Most newinput events carry { value, displayVal? }; a legacy path emits a scalar, so the
 * example accepts both. escape requests popover dismissal. Data is emitted to the parent, not saved
 * automatically.
 * - Numeric variant: dtype="currency" min="0" step="0.01" addon-left="$". Reference variant:
 * dtype="reference" object-name="Account" name-field="Name" with optional filter for
 * lightning-record-picker. Rich-text variant: dtype="richtext". Validation methods are
 * errorMe()/removeErrorMe(); getValue()/sendValues() expose the current value.
 */

import { LightningElement, track, api, wire } from 'lwc';
import { 
    iconMap as ICON_MAP, 
    iconPath, 
    publicPropertyToBool, 
    getToastErrorMessage, 
    getErrorMessage, 
    handleDateObjDisplayValue,
} from 'c/utils';
import getRecordName from '@salesforce/apex/DynamicSObjectController.getRecordName';


/* Example Usage:   
[
    DTYPE_BOOLS_SKELETON
    text, boolean, textarea, number, currency, percent, date, datetime, decimal, reference, richtext
]

        <!-- 
            <c-slds-input
                rtl=                        // default = false :: rtl="true" for checkbox :: Makes the checkbox on left of checkbox instead of right 
                dtype=                      // default = "text" :: Required :: valid values - [text, boolean, textarea, number, currency, percent, date, datetime, decimal, reference, richtext]
                is-required                 // default = false :: is-required="true" :: Self-explanatory 
                is-disabled                 // default = false :: is-disabled="true" :: Self-explanatory ::
                is-popover                  // default = false :: is-popover="true"  :: Sends out blur/escape event as 'onescape' :: onescape={closePopover}
                errormessage                // default = '' :: error-message={customErrorMsg} :: Sets the error message as custom string :: probably want to use with "onnewinput" :: onnewinput={checkErrors}
                current-value               // default = null :: Self explanatory
                input-height                // default = '1.875rem' :: input-height="2.25rem" :: Changes height of input 
                input-radius                // default = 'var(--slds-c-input-radius-border, 0.25rem)' :: input-radius="var(--slds-g-radius-border-4)" :: Changes border radius of input 
                focus-help-text             // default = '' :: focus-help-text={anyMessage} :: makes popover appear above the input element :: NOT valid for dtype="boolean/reference/richtext"
                suppress-error-text         // default = false :: suppress-error-text="true" :: puts error in a popover for dtype="text" instead of below the input
                nubbin                      // default = 'bottom-right' :: nubbin="bottom-left" :: positions popover to left :: valid for focus-help-text={anyString} 
                suppress-default-styles     // default = false :: suppress-default-styles="true" :: Removes default icons :: valid for dtype="number/currency/decimal/percent"
                suppress-native-styles      // default = false :: suppress-native-styles="true" :: remove incrementor from input :: valid for dtypes="number/currency/decimal/percent"
                addon-left="$"              // default = '' :: addon-left={anyString} :: Adds string before input element :: only valid for dtypes="number/currency/decimal/percent 
                addon-right="%"             // default = '' :: addon-right={anyString} :: Adds string after input element :: only valid for dtypes="number/currency/decimal/percent 
                step                        // default = 1 :: increments value {step} :: valid for dtype="decimal/percent/number" :: e.g.) step="3/{myNum}"
                inline-help                 // default = '' :: adds help text below input element :: not valid for dtype="reference/boolean/richtext" :: e.g.) inline-help="Max: 500"
                suppress-blur-required      // defailt = false :: removes checking value on blur :: valid for dtype="number/text"
                focus-on-ready              // default = false :: focuses the input when rendered :: valid for all dtypes
            ></c-slds-input> 
        -->
        <c-slds-input
            rtl=""
            dtype=""text""
            is-required=""
            is-disabled=""
            is-popover=""
            error-message=""                
            current-value=""
            input-height="1.875rem"
            input-radius="'var(--slds-c-input-radius-border, 0.25rem)"
            focus-help=""
            nubbin="'bottom-right"                      
            addon-left=""
            addon-right=""
            step="1"      
            inline-help=""
            suppress-default=""
            suppress-native=""  
            suppress-error=""          
            suppress-blur-required=""
            focus-on-ready=""

            onnewinput={handleInput} 
            onescape={closePopover}
        ></c-slds-input> 

    HTML:
        <x-slds-input 
            dtype="text/textarea/number/currency/percent/date/datetime/decimal" 
            label="label above the input element" 
            place-holder="place holder for the input element"
            data-id={myDataId} ( optional --> no effect on <x-slds-input> )
            is-required="true/false"
            onnewinput={myInputHandler}
        ></x-slds-input>

    Javascript:
        myInputHandler(message) {
            // if you added a data-id...
            const fieldName = event.currentTarget.dataset.id;

            // Value sent from <x-slds-input>
            const value = event.detail.value;

            // do something with the value...  
            // ---> e.g. trigger an error if invalid
            const isError = this.fieldsObj[fieldName].isRequired && !val;

            if (isError) {
                // ---> e.g. trigger an error in <x-slds-input>
                this.template.querySelector(`[data-id="${myDataId}"]`).errorMe();

            } else {
                // ---> Form e.g.) save the data if a form
                this.fieldsObj[fieldName].value = value;
                this.saveData(this.fieldsObj)

                // ---> Popover e.g.) if is a popover, close the popover
                this.draftValues.push({fieldName: fieldName, value: value});
                this.closePopover();
            }
        }
*/

// helpers (keep inside your component file)
const BOOL_TRUE  = new Set(['true','1','yes','y','on','t']);
const BOOL_FALSE = new Set(['false','0','no','n','off','f']);

// make any value a stable string key for compare/stsore
const origParser = (v) => {
    if (v === undefined) return '⟂undef';     // JSON.stringify(undefined) is undefined
    if (Number.isNaN(v)) return '⟂nan';       // avoids null-vs-NaN confusion
    if (v instanceof Date) return v.toISOString(); // stable for date/datetime
    if (Array.isArray(v)) return JSON.stringify(v.slice()); // or .slice().sort() if order doesn't matter
    return JSON.stringify(v);                  // handles string/number/boolean/null/object
};

function coerceByDtype(value, dtype) {
    if (value === undefined) return null;

    if (NUMERIC_DTYPES.has(dtype)) {
        if (value === '' || value === null) return null;
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const s = value.trim().replace(/,/g, '');
            if (s === '') return null;
            const n = Number(s);
            return Number.isFinite(n) ? n : null; // or throw to block bad input
        }
        // booleans/objects -> null for numbers
        return null;
    }

    if (BOOL_DTYPES.has(dtype)) {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') return value.toLowerCase() === 'true';
        return !!value;
    }

    if (DATE_DTYPES.has(dtype)) {
        // allow Date or ISO string; let server validate
        return value === '' ? null : value;
    }

    // text/picklist/etc
    return value ?? null;
}



// put near top of file
const NUMERIC_DTYPES = new Set(['decimal','double','currency','integer','long','percent','number']);
const BOOL_DTYPES = new Set(['boolean']);
const DATE_DTYPES = new Set(['date','datetime']);


function _parseNumeric(val) {
    if (val === null || val === undefined) return null;
    if (typeof val === 'number' && Number.isFinite(val)) return { num: val, hasPercent: false };

    let s = String(val).trim();
    if (s === '') return null;

    // paren negatives "(1,234.56)"
    let neg = false;
    if (s.startsWith('(') && s.endsWith(')')) { neg = true; s = s.slice(1, -1); }

    // keep digits, dot, comma, percent; drop everything else ($, spaces, letters)
    s = s.replace(/[^\d.,%\-]/g, '');

    // thousands commas → remove
    s = s.replace(/,/g, '');

    // percent?
    const hasPercent = s.includes('%');
    s = s.replace(/%/g, '');

    // lone "-" or "." → null
    if (s === '' || s === '-' || s === '.') return null;

    let n = Number(s);
    if (!Number.isFinite(n)) return null;
    if (neg) n = -n;

    return { num: n, hasPercent };
}

function _toIsoDate(d) {
    // returns "YYYY-MM-DD"
    const pad = x => String(x).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function _coerceDate(val) {
    if (val == null) return null;
    if (val instanceof Date && !isNaN(val)) return _toIsoDate(val);
    const s = String(val).trim();
    if (s === '') return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;     // already ISO date
    const d = new Date(s);
    return isNaN(d) ? null : _toIsoDate(d);
}

function _coerceDateTime(val) {
    if (val == null) return null;
    if (val instanceof Date && !isNaN(val)) return val.toISOString(); // "YYYY-MM-DDTHH:mm:ss.sssZ"
    const s = String(val).trim();
    if (s === '') return null;
    // If already ISO, pass through; else parse
    const d = new Date(s);
    return isNaN(d) ? null : d.toISOString();
}

function _coerceBoolean(val) {
    if (typeof val === 'boolean') return val;
    if (val == null) return null;
    const s = String(val).trim().toLowerCase();
    if (BOOL_TRUE.has(s)) return true;
    if (BOOL_FALSE.has(s)) return false;
    return null; // unknown → null
}

const ADDON_CL = 'slds-input-has-fixed-addon';

const IS_ADDON_COMPATIBLE = (dtype) => {
    return Object.keys(FORM_ELEMENT_CONTROL_BASE_CLS).some(key => key === dtype);
}
const GET_ADDON_ID = (dtype, addon, isRight=false) => {
    if (!addon) return '';
    return isRight 
        ? `fixed-text-${dtype}-right`
        : `fixed-text-${dtype}-left`;
}

const FORM_ELEMENT_CONTROL_BASE_CLS = {
    number: 'slds-form-element__control',
    currency: 'slds-form-element__control slds-input-has-icon slds-input-has-icon_left',
    decimal: 'slds-form-element__control',
    percent: 'slds-form-element__control slds-input-has-fixed-addon',
};


// Check for Addons & suppression of default addons/icons
function handleFormElementCl(dtype, addonLeft, addonRight, suppressDefaultStyles) {

    const defaultCl = suppressDefaultStyles ? 'slds-form-element__control' 
        : FORM_ELEMENT_CONTROL_BASE_CLS[dtype];

    if (suppressDefaultStyles && !addonLeft && !addonRight) {
        return 'slds-form-element__control';
    }
    if (!suppressDefaultStyles && !addonLeft && !addonRight) {
        return defaultCl;
    }

    return `${defaultCl} ${addonLeft || addonRight  ? ADDON_CL : ''}`;
}

function handleInputCl(suppressDefaultStyles, suppressNativeStyles, centered=false) {
    const centeredCl = centered ? 'slds-text-align_center' : '';
    return suppressDefaultStyles || suppressNativeStyles
        ? `slds-input slds-input_counter slds-text-align_left ${centeredCl}`
        : `slds-input ${centeredCl}`;
}

function handleAriaLabellBy(dtype, addonLeft, addonRight, suppressDefaultStyles) {
    const notHasDefault = dtype !== 'percent'; 

    if (notHasDefault || suppressDefaultStyles) {
        return `${GET_ADDON_ID(dtype, addonRight, true)} ${GET_ADDON_ID(dtype, addonLeft)}`
    } 

    const addonRightId = GET_ADDON_ID(dtype, addonRight, true);
    const addonLeftId = GET_ADDON_ID(dtype, addonLeft, false);

    return `${addonRightId ?? 'fixed-text-addon-pre'} ${addonLeftId}`; 
}

const DTYPE_BOOLS_SKELETON = {
    istext: false,
    isboolean: false,
    istextarea: false,
    isnumber: false,
    iscurrency: false,
    ispercent: false,
    isdate: false,
    isdatetime: false,
    isdecimal: false,
    isreference: false,
    isrichtext: false,
};


const NUMBER_INPUT_ID_ADDON_LEFT = 'fixed-text-number-left';
const NUMBER_INPUT_ID = 'whole-number';
const NUMBER_INPUT_ID_ADDON_RIGHT = 'fixed-text-number-right';

const FORM_HELP_ID = 'help-message-id-49';



function handleFormElementControlErrorIcon(formElementCls, hasError, errorMessage) {
    if (hasError || errorMessage) {
        return formElementCls.includes('slds-input-has-icon_left') 
            ? `${formElementCls} slds-input-has-icon_group-left`
                : formElementCls.includes('slds-input-has-icon_right') 
            ? formElementCls.replace('slds-input-has-icon_right', 'slds-input-has-icon_left-right')
            : `${formElementCls} slds-input-has-icon slds-input-has-icon_left`;
    }
    return formElementCls;
}

export default class SldsInput extends LightningElement {
    textInputVal = '';
    _justCommitted = false;
    _originalValue;
    iconMap = ICON_MAP;
    formats = [
        'bold',
        'italic',
        'link',
    ];
    numberInputIds = {
        numberInputIdAddonLeft: NUMBER_INPUT_ID_ADDON_LEFT,
        numberInputId: NUMBER_INPUT_ID,
        numberInputIdAddonRight: NUMBER_INPUT_ID_ADDON_RIGHT,
        formHelpId: FORM_HELP_ID,  
    };
    formHelpId = FORM_HELP_ID;
    // ==================== Local Tracked Properties ==================== \\
    // Sync the time and the date when dtype='datetime'
    datetimeSyncVal;
    // Flag missing values when isRequired=true
    hasError=false;  

    _suppressErrorPopover = true;
    // Set is{dtype} flag on the data type (e.g. isdecmial) 
    boolObj = {...DTYPE_BOOLS_SKELETON, istext: true};
    // Set a 300ms timeout between Custom Events
    @track debounceTimeout = null;
    // For popovers watch out for 'Tab' keydown
    @track isPopoverTab = false;
    @track isDateEnter = false;
    @track mostRecentKey;
    @track originalDate;
    @track _preventBlur = false;
    // =================================================================== \\


    _formElementCl = 'slds-form-element__control';
    _ariaLabelledBy;
    _inputCl = 'slds-input';

    

    handleInputIconAndAddons()  {
        if (!IS_ADDON_COMPATIBLE(this.dtype)) return;
        this._formElementCl = handleFormElementCl(this.dtype, this.addonLeft, this.addonRight, this.suppressDefaultStyles);
        this._ariaLabelledBy = handleAriaLabellBy(this.dtype, this.addonLeft, this.addonRight, this.suppressDefaultStyles);
        this._inputCl = handleInputCl(this.suppressDefaultStyles, this.suppressNativeStyles, this.centered);
    }

    get _inlineErrorIconFormElementCl() {
        return handleFormElementControlErrorIcon(this._formElementCl, this.hasError, this._errorMessage);
    }

    // ======================== Public Properties ======================== \\
    @api
    set min(val) {
        const parsed = Number(val);
        this._min = Number.isNaN(parsed) ? null : parsed;
    }
    get min() {
        return this._min;
    }
    @api
    set max(val) {
        const parsed = Number(val);
        this._max = Number.isNaN(parsed) ? null : parsed;
    }
    get max() {
        return this._max;
    }

    get percentMin() {
        return this.min ?? 0;
    }

    get percentMax() {
        return this.max ?? 100;
    }
    
    @api focusOnReady=false;

    // rtl="true" for checkbox :: Makes the checkbox on left of checkbox instead of right 
    @api formLabel;
    _dir = 'ltr';
    @api 
    set rtl(val) {
        this._rtl = val;
        if (val) {
            this._dir = 'rtl';
        }
    }
    get rtl() {
        return this._rtl;
    }

    @api // data type of the input element
    set dtype(value) {
        if (
            value && 
            typeof value === 'string' && 
            DTYPE_BOOLS_SKELETON.hasOwnProperty(`is${value?.toLowerCase()}`)
        ) {
            const valLower = value.toLowerCase();
            this.boolObj = {...DTYPE_BOOLS_SKELETON, [`is${valLower}`]: true};
            this._dtype = valLower;
            if (IS_ADDON_COMPATIBLE(valLower)) {
                this.handleInputIconAndAddons();
            }
        } 
    }
    get dtype() {
        return this._dtype ?? 'text';
    }

    @api filter;

    @api inlineHelp;
    @api suppressBlurRequired = false;

    @api // Add red required asterik if true 
    set isRequired(val) {this._isRequired = publicPropertyToBool(val);} 
    get isRequired() {return this._isRequired;}

    // Disable a field
    @api set isDisabled(val) {
        this._isDisabled = publicPropertyToBool(val);
    }
    get isDisabled() {
        return this._isDisabled || false;
    }

    @api // Change the event handling if is a popover
    set isPopover(val) {
        this._isPopover = publicPropertyToBool(val);
    } 
    get isPopover() {
        return this._isPopover;
    }
    _errorMessage;
    @api // For when parent has a getter to display an error message
    set errorMessage(val) {
        //console.log('in sldsInput.js, set errorMessage() was called: ', val);
        this._errorMessage = val;
        this.hasError = val ? true : false;
    }
    get errorMessage() {return this._errorMessage}
    @api // Set to true to prevent close event on Tab keydown
    set isTabbable(val) { this._isTabbable = publicPropertyToBool(val); }
    get isTabbable() { return this._isTabbable; }

    _currentValue;
    @api            // import the current value
    set currentValue(val) {
        this._currentValue = val;
        this.textInputVal = val && val !== undefined ? val : '';
        //if (!this._originalValue) {
        //    this._originalValue = origParser(val);
        //}
        this._originalValue = origParser(val);
    } 
    get currentValue() {return this._currentValue ?? null;}
    @api label;                 // Label Above the input element
    @api placeHolder;          // placeholder of input element 

    @api suppressErrorText = false;
    @api sendOnChange = false;

    // Show help text when input element is focused
    @api focusHelpText;
    _helpNubbin = 'bottom-right';
    @api 
    set nubbin(val) {
        this._nubbin = val;
        if (val) {
            this._helpNubbin = val;
        }
    }
    get nubbin() {
        return this._nubbin;
    }

    @api 
    set centered(val) {
        this._centered = val;
        if (val) {
            this.handleInputIconAndAddons();
        }
    }
    get centered() {
        return this._centered ?? false;
    }

    @api 
    set suppressDefaultStyles(value) {
        this._suppressDefaultStyles = value;
        if (value) {
            this.handleInputIconAndAddons();
        }
    } 
    get suppressDefaultStyles() {
        return this._suppressDefaultStyles || false;
    }
    
    @api 
    set suppressNativeStyles(value) {
        this._suppressNativeStyles = value;
        if (value) {
            this.handleInputIconAndAddons();
        }
    } 
    get suppressNativeStyles() {
        return this._suppressNativeStyles ?? false;
    }
    @api 
    set addonLeft(value) {
        this._addonLeft = value
        if (value) {
            this.handleInputIconAndAddons();
        }
    } 
    get addonLeft() {
        return this._addonLeft;
    }
    @api 
    set addonRight(value) {
        this._addonRight = value;
        if (value) {
            this.handleInputIconAndAddons();
        }
    } 
    get addonRight() {
        return this._addonRight;
    }

    _step = 1;
    @api 
    set step(value) {
        if (value) {
            const numVal = Number(value);
            if (!isNaN(numVal)) {
                this._step = numVal;
            }
        } else {
            this._step = 1;
        }
    } 
    get step() {
        return this._step ?? 1;
    }
    @api 
    set inputHeight(val) {
        this._inputHeight = val;
        if (val) {
            this._applyVarsDirect('--input-height', val);
        }
    }
    get inputHeight() {
        return this._inputHeight;
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
            this._applyVarsDirect('--font-size', val);
        }
    }
    get fontSize() {
        return this._fontSize;
    }
    
    
    
    // =================================================================== \\



    // ================= Lightning Record Picker Config ================== \\
    @api objectName;
    @api nameField;
    @track displayVal;
    get selectedId() {
        if (this.boolObj.isreference) {
            return this._currentValue ?? null;
        }
        return null;
    }
    get fields() {
        if (!this.boolObj?.isreference || !this.objectName) return [];
        const fld = this.nameField || 'Name';
        return [`${this.objectName}.${fld}`];
    }

    async handleRecordPickerChange(e) { 
        const id = e.detail?.recordId ?? '';
        this._currentValue = id;
        if (id) {
            this._preventBlur = true; 
            const displayVal = await getRecordName({ objectApiName: this.objectName, recordId: id }); 
            this.displayVal = displayVal;
            this.sendRecordPickerEvt(id, displayVal);
        } else {
            this.displayVal = '';
            this._preventBlur = false;
        }
    }

    sendRecordPickerEvt(val, displayVal) {
        if (origParser(val) === this._originalValue) {
            this.dispatchEvent(new CustomEvent('escape', {detail: ''}))
        } else {
            this.dispatchEvent(new CustomEvent('newinput', { 
                detail: {
                    value: val, 
                    displayVal: !val ? '' : displayVal ? displayVal : ''
                } 
            } ));
        }
    }

    handleRecordPickerKeyDown(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            this.dispatchEvent(new CustomEvent('escape', { detail: '' } ));
        }
    }

    handlePickerFocusout(e) {
        if (!this._preventBlur) {
            // if focus moved anywhere outside this component, treat as outside click
            const next = e.relatedTarget;
            if (!next || !this.template.contains(next)) {
                this.sendRecordPickerEvt(this._currentValue, this.displayVal)
            }
        }
    }
    // =================================================================== \\
    

    _mouseEvtBound = false;
    _renderedFocus = false;
    _inited = false;
    renderedCallback() {
        if (this.boolObj.isdatetime || this.boolObj.isdate) {
            this.originalDate  = this.boolObj.isdatetime
                ? this.syncDatetimeManual()
                : this.getInputEle().value;
        }
        if (!this._inited) {
            if (this.focusOnReady && !this.boolObj.isreference && !this._renderedFocus) {
                const inp = this.boolObj.isrichtext 
                    ? this?.refs?.richTextEle
                    : this.template.querySelector('input');
                if (inp) {
                    inp.focus();
                    this._renderedFocus = true;
                }

            }
            this._inited = true;
        }
        // Attach once
        if (this.isPopover && !this._mouseEvtBound) {
            try {
                const cmpRoot = this.template.querySelector('.component-root');
                if (cmpRoot) {
                    cmpRoot.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
                    cmpRoot.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
                    this._mouseEvtBound = true;
                }
            } catch(error) {
                this.showToast('Error in event binder of renderedCallback() of sldsInput.js', getErrorMessage(error), 'error');
            }
        }
    }


    _mouseInBounds = false;
    handleMouseEnter() {
        this._mouseInBounds = true;
    }
    handleMouseLeave() {
        this._mouseInBounds = false;
    }

    // helpers
    _isVisible(el) {
        if (!el) return false;
        // hidden via display:none / visibility:hidden / not in layout
        const style = getComputedStyle(el);
        return style.visibility !== 'hidden' && style.display !== 'none' && el.offsetParent !== null;
    }

    async _focusWhenReady(getEl, { attempts = 10 } = {}) {
        // Try up to ~10 frames; returns true if focused
        for (let i = 0; i < attempts; i++) {
            const el = getEl();
            if (el && !el.disabled && this._isVisible(el)) {
            // Prefer component's own focus() if available (e.g., lightning-input, combobox, record-picker)
            (typeof el.focus === 'function') && el.focus({ preventScroll: true });
            const active = this.template.activeElement || document.activeElement;
            if (el === active) return true;
            }
            // wait one animation frame (faster + less janky than a big timeout)
            await new Promise(r => requestAnimationFrame(r));
        }
        return false;
    }

    handleRecordPickerReady(event) {
        // 1) don’t let this bubble and mess with parent/table logic
        event.stopPropagation();
        if ((this.isPopover || this.focusOnReady) && this.boolObj.isreference) {
            // 2) defer focus 1 tick so SLDS/popover can finish whatever it’s doing
            requestAnimationFrame(() => {
                const rp = this.template.querySelector('[data-id="recordPicker"]');
                if (rp && typeof rp.focus === 'function') {
                    rp.focus();
                }
            });
        } 
    }


    // ========================= Public Methods ========================== \\
    // Return the current value to the parent
    @api getValue() {
        if (this.boolObj.istextarea ||  this.boolObj.istext || this.boolObj.isrichtext) {
            return this._currentValue
        }
        if (this.boolObj.isdatetime) {
            return _coerceDateTime(this.syncDatetimeManual());
        }
        if (this.dtype === 'percent') {
            return this.numberVal;
        }

        if (this.dtype === 'date') {
            return _coerceDate(this.getInputEle().value);
        }

        if (this.dtype === 'reference') {
            return {value: this._currentValue, displayVal: this.displayVal};
        }

        if (this.dtype === 'boolean') return this.booleanVal

        if (this.dtype === 'decimal' || this.dtype ==='number') {
            return coerceByDtype(this._currentValue, this.dtype);
        }

        if (this.dtype === 'text') {
            return this.textInputVal;
        }

        return this._currentValue; 
    }
    // Send this._currentValue to requester
    @api sendValues() {
        try {
            if (this.boolObj.istextarea ||  this.boolObj.istext || this.boolObj.isrichtext) {
                return this.textVal
            } 
            if (this.boolObj.isdatetime) {
                return this.syncDatetimeManual();
            }
            if (this.dtype === 'percent') {
                return this.numberVal;
            }
            if (this.dtype === 'date') {
                return this.getInputEle().value;
            }
            if (this.dtype === 'boolean') return this.booleanVal;

            if (this.dtype === 'reference') {
                return {value: this._currentValue, displayVal: this.displayVal};
            }

            return this._currentValue; 
        } catch(error) {
            getToastErrorMessage('sendValues()', 'sldsInput.js', error);
        }
    }
    // Flag errors with the input (set aria-invalid to true)
    @api errorMe(errMsg=null) {
        if (errMsg) {
            this._errorMessage = errMsg;
        } else {
            this._errorMessage = 'This field is required.';
        }
        //console.log('in sldsInput.js, errorMe() was called: ', errMsg);
        this.hasError=true; 
    }
    // Set <this.hasError> to false
    @api removeErrorMe() {
        this.hasError=false
        if (this._errorMessage) this._errorMessage = null;
    }
    // Add focus to the input element
    @api async focusMe() {
        if (this.boolObj.isreference) {
            this._focusWhenReady = true;
            return;
        }
        const getEl = () => this.getInputEle(); // your existing getter

        const ok = await this._focusWhenReady(getEl);

        // If your getter sometimes returns a wrapper with an inner date input, handle that once:
        if (!ok) {
            const el = getEl();
            const innerDate = el && typeof el === 'object' && el.date ? el.date : null;
            if (innerDate) {
                await this._focusWhenReady(() => innerDate);
            }
        }
    }
    @api clearMe() {
        this._currentValue = null;
        this.displayVal = null;
        this.hasError = false;
    }
    // =================================================================== \\

    // Call this every time you send a Custom Event
    toProperDtype(val) {
        // Treat empty string as clearing the field
        if (val === '') return null;

        // Text / Textarea → string (or null)
        if (this.boolObj.istext || this.boolObj.istextarea) {
            return val == null ? null : String(val);
        }

        if (this.boolObj.isrichtext) {
            return val;
        }

        // Boolean
        if (this.boolObj.isboolean) {
            return _coerceBoolean(val);
        }

        // Date
        if (this.boolObj.isdate) {
            return _coerceDate(val); // "YYYY-MM-DD"
        }

        // DateTime
        if (this.boolObj.isdatetime) {
            return _coerceDateTime(val); // ISO string with Z
        }

        // Numeric family
        if (this.boolObj.isnumber) {
            const parsed = _parseNumeric(val);
            return parsed ? Math.trunc(parsed.num) : null;
        }

        if (this.boolObj.isdecimal) {
            const parsed = _parseNumeric(val);
            return parsed ? parsed.num : null;
        }

        if (this.boolObj.iscurrency) {
            const parsed = _parseNumeric(val);
            return parsed ? parsed.num : null;
        }

        if (this.boolObj.ispercent) {
            const parsed = _parseNumeric(val);
            if (!parsed) return null;
            let n = parsed.num;
            // If user typed "12%" → 12; if they typed "0.12%" or "0.12" with a %,
            // bump to percentage units (Salesforce Percent usually expects 12 for 12%).
            if (parsed.hasPercent && n <= 1) n = n * 100;
            return n;
        }

        // Default: return as-is string
        return val == null ? null : String(val);
    }

    // Add slds-has-error to .slds-form-element if there is an error
    get formElementClass() {
        if (this.hasError) {
            if (this.boolObj.istextarea || this.boolObj.isboolean) {
                const ele = this.boolObj.istextarea ? 'textareaInput' : 'booleanInput';
                const input = this.template.querySelector(`[data-id="${ele}"]`);
                if (input) input.setAttribute("aria-describedby", "error-message-unique-id");
                
            }
            return 'slds-form-element slds-has-error';
        } 
        // Remove error classes if no error
        if ((this.boolObj.istextarea || this.boolObj.isboolean) && this.hasError && this._currentValue) {
            const ele = this.boolObj.istextarea ? 'textareaInput' : 'booleanInput';
            const input = this.template.querySelector(`[data-id="${ele}"]`);
            if (input) input.removeAttribute("aria-describedby");
        }
        return 'slds-form-element'; 
    }
    get dateTimeGridClass() {
        return this.isPopover
            ? 'slds-grid date-padding'
            : 'slds-grid';
    }
    get dateGridClass() {
        return this.isPopover
            ? {base: 'slds-grid', col: 'slds-form-element__control slds-col'}
            : {base: '', col: 'slds-form-element__control'}
    }
    // ================ Form Input Parent Event Handlers ================= \\
    // Return the current input element based on the <dtype>
    getInputEle() {
        const dtype = this._dtype ? this._dtype : 'text';

        switch(dtype) {
            case 'number':
                return this.template.querySelector('[data-id="numberInput"]');
                
            case 'currency':
                return this.template.querySelector('[data-id="currencyInput"]');
                
            case 'decimal':
                return this.template.querySelector('[data-id="decimalInput"]');
                
            case 'percent':
                return this.template.querySelector('[data-id="percentInput"]');

            case 'date':
                return this.template.querySelector('[data-id="dateInput"]');
            
            case 'textarea': 
                return this.template.querySelector('[data-id="textareaInput"]'); 

            case 'datetime':
                const datetimeDateInp = this.template.querySelector('[data-id="datetimeInputDate"]');
                const datetimeTimeInp = this.template.querySelector('[data-id="datetimeInputTime"]');
                return {date: datetimeDateInp, time: datetimeTimeInp};
            
            case 'boolean': 
                return this.template.querySelector('[data-id="booleanInput"]');

            case 'reference':
                return this.template.querySelector('[data-id="recordPicker"]')

            case 'richtext':
                return this.template.querySelector('[data-id="richtextInput"]')

            default:            
                return this.template.querySelector('[data-id="textInput"]');      
        }
    }
    
    // Handle regular input Value Change
    handleInputEleChange(event) {
        try  {
            const evtVal = event.target.value;
            //console.log('here is event.target.value in handleInputEleChange() of sldsInput.js: ', evtVal);
            if (this.focusHelpText) {
                this.handleHelpPopoverState(true);
            }
    
            if (this.isPopover) return;

            // Update the value
            if (!this.boolObj.isdate && !this.boolObj.isdatetime) {
                this._currentValue = `${event.target.value}`;
            }

            // Get the input element
            const element = this.getInputEle();

            // Get the current value from the input element
            let val = this.dtype === 'datetime' 
                ? this.syncDatetimeManual() 
                : this.dtype === 'boolean' ? element.checked
                : element?.value ?? event?.target?.value; 


            if (this.boolObj.istext) {
                this.textInputVal = val;
            }

             if (this.suppressBlurRequired && this.isRequired) {
                if (this.isRequired && (evtVal !== 0 && !evtVal)) {
                    this.hasError = true;
                } else if ((this.min || this.max) && !isNaN(evtVal) && (evtVal < this.min || evtVal > this.max)) {
                    const hasMax = this.max || this.max === 0;
                    const hasMin = this.min || this.min === 0;
                    this.hasError = true;
                    this._errorMessage = hasMax && hasMin
                        ? `Please enter a value between ${this.min} - ${this.max}`
                            : hasMin 
                        ? `The minimum allowed value is ${this.min}`
                        : `The maximum allowed value is ${this.max}`;
                } else {
                    this.hasError = false;
                }
            }
            

            if (!this._errorMessage && (this.hasError && val)) {
                // Remove error if the val is not null anymores
                this.hasError = false;
            }

            // Clear previous timeout if it exists
            clearTimeout(this.debounceTimeout);

            // Send the parent notification that the value was updated
            this.debounceTimeout = setTimeout(() => {
                try {
                    // Send event to parent with the value
                    this.dispatchEvent(new CustomEvent('newinput', { detail: {value: this.toProperDtype(val)} } ));
                } catch(error) {
                    console.error('error in handleInputEleChange() timeout:  ', error);
                }
            }, 40);

        } catch(error) {
            this.showToast('Error in handleInputEleChange() of sldsInput.js', getErrorMessage(error), 'error');
        }
    }
    // =================================================================== \\
    
    
    handleNumberInput(event) {
        this.handleHelpPopoverState(event);
        const num = event.target.value;
        this._currentValue = num;

        if (this.max && (num > this.max)) {
            this.errorMe(`The maximum allowed value is ${this.max}`);
        } else if (this.min && (num < this.min)) {
            this.errorMe(`The minimum allowed value is ${this.min}`);
        } else {
            this._currentValue = num;
            this.removeErrorMe();
        }
    }


    // Dont show help message again when user closes
    _permanentlyClosePopover = false;
    handleHelpPopoverClose(event) {
        event.preventDefault();
        event.stopPropagation();
        this._permanentlyClosePopover = true;
        const input = this.template.querySelector('input');
        if (input) {
            input.focus();
        }
    }
    // Close/Open help popover
    _isHelpPopoverOpen = false;
    handleHelpPopoverState(isClose=false) {
        if (this._permanentlyClosePopover) return;
        if (this.focusHelpText) {
            if (
                (!isClose && this._isHelpPopoverOpen) || 
                (isClose && !this._isHelpPopoverOpen)
            ) { return; }
            const popover = this.template.querySelector('c-slds-popover');
            if (popover) {
                if (isClose) { 
                    popover.forceClose();
                    this._isHelpPopoverOpen = false;
                } else {
                    popover.forceOpen();
                    this._isHelpPopoverOpen = true;
                }
            }
        }
    }
    // Check "Fccus help text"
    handleFocus(event) {
        this._isFocused = true;
        if (this.boolObj.istextarea) {
            const textarea = event?.target;
            const value = textarea?.value ?? '';
            requestAnimationFrame(() => {
                textarea?.setSelectionRange?.(value.length, value.length);
            });
        }
    }
    // Show popover when value changes
    handleInputChange(event) {
        if (!this.focusHelpText) return;
        if (this._isFocused) {
            const val = event.target.value;
            this.handleHelpPopoverState(!val)
        }
    }


    // ======================== Checkbox Handlers ======================== \\
    handleCheckBoxChange(event) {
        this._currentValue = event.target.checked;
        if (this.isPopover) {
            this._preventBlur = true
            // Send event to parent with the value
            this.dispatchEvent(new CustomEvent('newinput', { detail: {value: event.target.checked} } ));
            setTimeout(() => { 
                try {
                    this._preventBlur = false;
                } catch(error) {
                    console.error('error in handleCheckBoxChange() timeout:  ', error);
                } 
            }, 40);

        }
    }
    handleCheckBoxBlur(event) {
        if (this.isPopover && event?.relatedTarget?.dataset?.id !== 'booleanInput') {
            setTimeout(() => {
                if (!this._preventBlur) this.dispatchEvent(new CustomEvent('escape', { detail: '' } ));
            }, 40);
        }
    }
    // =================================================================== \\


    // ================= Popover Parent Event Handlers =================== \\
    // **--Popovers Only--** detect 'Tab', 'Escape'
    handlePopoverKeyDown(event) {
        try {
            if (!this.isPopover) return;
            this.mostRecentKey = event.key;
            if (this.boolObj.isrichtext) {
                if (event.key === 'Enter') {
                    // SHIFT + ENTER → commit value for richtext
                    if (event.shiftKey) {
                        event.preventDefault();
                        const val = event.target.value;
                        this._justCommitted = true; // <-- arm
                        this.dispatchEvent(new CustomEvent('newinput', { detail: {value: this.toProperDtype(val)} } ));
                        setTimeout(() => { this._justCommitted = false; }, 0);

                    }
                    return;
                }
            }   
            event.stopPropagation();

            if (event.key === 'Enter') {

                if (this.boolObj.isdate || this.boolObj.isdatetime || this.boolObj.isrichtext)  {
                    return;
                }
                
                event.preventDefault();

                const val = this.boolObj.isdatetime 
                    ? this.syncDatetimeManual() 
                        : this.boolObj.isdate 
                    ? this.getInputEle().value
                    : event.target.value;
                    
                this._justCommitted = true; // <-- arm
                this._currentValue = null;
                this.dispatchEvent(new CustomEvent('newinput', { detail: {value: this.toProperDtype(val)} } ));
                setTimeout(() => { this._justCommitted = false; }, 0);
                return;
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                // Send event to parent with the value
                this.dispatchEvent(new CustomEvent('escape', { detail: '' } ));
            }
        } catch(error) {
            getToastErrorMessage('handlePopoverKeyDown()', 'sldsInput.js', error);
        }
    }
    
    // If focused element not within <x-slds-input> ---> Send value-event to parent
    _hasBlurred = false;
    handlePopoverBlur(event) {
        try {
            if (this.focusHelpText) {
                this._isFocused = false;
                this.handleHelpPopoverState(true);
            }
            
            if (!this.isPopover) {
                if (this.suppressBlurRequired) return;
                // Check if field is required and send current value of input element
                const ele = event.currentTarget;
                const val = this.getValue();
                const required = ele.required;
                this.handleRequiredError(val, required);

                if ( !val && required &&  (required === 'true' || required === true) ) {
                    this.dispatchEvent(new CustomEvent('newinput', { detail: {value: this.toProperDtype(val)} } ));                    
                }
                return;
            }
            if (this._justCommitted) return;
            
            if (this._mouseInBounds) {
                return;
            }

            const val = event.target.value;
            if (this.focusOnReady && !this._hasBlurred) {
                this._hasBlurred = true;
                return;
            }

            setTimeout(() => {
                try {
                    const wrapper = this.dtype === 'richtext'
                        ? this.template.querySelector('.rich-text-container')
                        : this.template.querySelector('[data-id="formElement"]');

                    const active = document.activeElement;
            
                    if (wrapper && wrapper.contains(active)) {
                        // Focus still inside the component
                        return;
                    }
                    if (this.mostRecentKey === 'Enter' || 
                        this.mostRecentKey === 'Tab' || 
                        (this.boolObj.isboolean && this.mostRecentKey === " ") 
                    ) {
                        this._currentValue = null;
                        this.dispatchEvent(new CustomEvent('newinput', { detail: {value: this.toProperDtype(val)} } ));
                    } else {
                        if (this.isPopover) {    
                            const isOrig = this._originalValue === origParser(val);
                            if (this._isTabbable && this.mostRecentKey === 'Tab') {
                            } else {
                                if (isOrig) {
                                    // Focus moved outside the component — signal to close
                                    this.dispatchEvent(new CustomEvent('escape', { detail: '' } ));
                                } else {
                                    this.dispatchEvent(new CustomEvent('newinput', { detail: this.toProperDtype(val) } ));
                                }
                            }
                            
                        }
                    }
                } catch(error) {
                    this.showToast('Error in handlePopoverBlur() timeout of sldsInput.js: ', getErrorMessage(error), 'error');
                } 
            }, 0);
        } catch(error) {
            getToastErrorMessage('handlePopoverBlur()', 'sldsInput.js', error);
        }
    }

    cancelRichTextPopover() {
        this.dispatchEvent(new CustomEvent('escape', { detail: '' } ));
    }
    handleRichTextDonePopover() {
        const richtext = this?.refs?.richTextEle;
        if (richtext) {
            const val = richtext.value; 
            this.dispatchEvent(new CustomEvent('newinput', { detail: {value: val} } ));
        }
    }

    // Prevent the main input element from losing focus when an item in dropdown is clicked/pressed
    deflectBlur(event) {
        if (!this.isPopover) return;
        event.preventDefault();
    }
    handlePopoverDate(event) {
        event.target.classList.add('slds-is-selected');
        setTimeout(() => {
            try {
                const val = this.boolObj.isdatetime 
                    ? this.syncDatetimeManual() 
                        : this.boolObj.isdate 
                    ? this.getInputEle().value
                    : event.target.value;

                const isSame = this.boolObj.isdatetime
                    ? this.originalDate?.getTime() === val?.getTime()
                    : this.originalDate === val;

                if (isSame)  {
                    this.dispatchEvent(new CustomEvent('escape', { detail: '' } ));
                } else {
                    this.dispatchEvent(new CustomEvent('newinput', { detail: {value: this.toProperDtype(val)} } ));
                }
                this._currentValue = null;
            } catch(error) {
                console.error('error in handlePopoverDate() timeout:  ', error);
            } 
        }, 120);
    }
    // =================================================================== \\

    handleRequiredError(val, required) {
        if (required) {
            if (this.boolObj.istext || this.boolObj.isnumber) {
                const formControl = this.template.querySelector('.slds-form-element__control');
                if (formControl) {
                    if (!val && !formControl.classList.contains('slds-input-has-icon')) {
                        formControl.classList.add('slds-input-has-icon', 'slds-input-has-icon_left');
                    } else if (val) {
                        if (formControl.classList.contains('slds-input-has-icon')) {
                            formControl.classList.remove('slds-input-has-icon', 'slds-input-has-icon_left');
                        }
                    }
                }
            }
            this._suppressErrorPopover = !!val;
            this.hasError = !val;
            this._errorMessage = val ? null : 'Enter a value.';
        }

        if (this.min || this.max) {
            if (this.suppressErrorText) {
                if (this.min && val < this.min) {
                    this.focusHelpText =`Please enter a value greater than or equal to ${this.min}` ;
                }
                if (this.min && val > this.max) {
                    this.focusHelpText =`Please enter a value less than or equal to ${this.max}` ;
                }
            }
        } else {
            this.focusHelpText = '';
        }
    }

    // =================== Data Type Conversion Getters ================== \\
    get booleanVal() {
        if (this._currentValue === null || this._currentValue === undefined) return null;
        return publicPropertyToBool(this._currentValue);
    }
    // Return empty string if no val provided
    get textVal() {
        return this._currentValue && this._currentValue !== undefined ? this._currentValue : this.textInputVal;
    }
    get textAreaVal() {
        return this._currentValue ? this._currentValue : '';
    }
    get checkboxVal() {
        return publicPropertyToBool(this._currentValue);
    }
    // Convert currentVal from string to number
    get numberVal() {
        return parseInt(this._currentValue) || null;
    }
    // Convert currentVal from string to two-digit decimal (e.g. 1.99 or 1.00)
    get currencyVal() {
        const n = parseFloat(this._currentValue);
        if (isNaN(n)) {
            return null;          // or however you’d like to handle bad input
        }
        return n.toFixed(2);      // → "1.00", "1.60", etc.
    }
    // Convert currentVal from string to specified decimal (<decimalAmt>) --> defaults to 2 decimals
    get decimalVal() {
        const n = parseFloat(this._currentValue);
        if (isNaN(n)) {
            return null;          // or however you’d like to handle bad input
        }
        return this.decimalAmt  
            ? n.toFixed(this.decimalAmt) 
            : n.toFixed(2);      // → "1.00", "1.60", etc.
    }
    // convert currentVal from String to date
    get dateVal() {
        const v = this._currentValue;
        if (!v) return '';

        // If it's already a Salesforce Date string, return it as-is (input expects YYYY-MM-DD)
        if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;

        // Otherwise, try to parse and convert to local YYYY-MM-DD
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return '';

        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');

        return `${yyyy}-${mm}-${dd}`;
    }
    // =================================================================== \\

    

    handleFocusOut(event) {
        const next = event.relatedTarget;

        // If focus is still somewhere inside this component, ignore this focusout.
        if (next && this.template.contains(next)) {
            return;
        } 
        this.dispatchEvent(new CustomEvent('sldsinputfocusout', { detail: this.label ?? 'focusout' } ));
    }
    handleFocusIn() {
        this.dispatchEvent(new CustomEvent('sldsinputfocusin', { detail: this.label ?? 'focusin' } ));
    }


    // ================== Data Type Conversion w/ Sync =================== \\
    // date getter: "YYYY-MM-DD" or blank
    get datetimeDateVal() {
        // If user never set anything, maybe you do want “today”?
        if (!this._currentValue) {
            const t = new Date();
            const yy = t.getFullYear();
            const mm = String(t.getMonth()+1).padStart(2,'0');
            const dd = String(t.getDate()).padStart(2,'0');
            return `${yy}-${mm}-${dd}`;
        }
    
        // Parse whatever they gave you
        const d = this.manualGetDatetime(this._currentValue);
    
        // If it’s valid, format it as YYYY-MM-DD using **local** time
        if (d) {
            const yy = d.getFullYear();
            const mm = String(d.getMonth()+1).padStart(2,'0');
            const dd = String(d.getDate()).padStart(2,'0');
            return `${yy}-${mm}-${dd}`;
        }
    
        // If parsing failed (really invalid), clear the input rather than show “today”
        return '';
    }
    // time getter: "HH:mm" from the sync date, or default "10:00"
    get datetimeTimeVal() {
        if (this.datetimeSyncVal) {
            return this.datetimeSyncVal.toTimeString().slice(0, 5);
        }
        return '00:00'; // ← instead of '10:00'
    }
    
    syncDatetimeManual() {
        // grab both controls
        const dateVal = this.template.querySelector('[data-id="datetimeInputDate"]').value;
        const timeVal = this.template.querySelector('[data-id="datetimeInputTime"]').value;

        // still no date selected
        if (!dateVal) return;  

        // build a new Date from "YYYY-MM-DDThh:mm"
        return new Date(`${dateVal}T${timeVal}`);
    }
    manualGetDatetime(dateParam) {
        // 1) If it’s already a Date, use it…
        let d = dateParam instanceof Date
                ? dateParam
                : typeof dateParam === 'string'
                    // 2) …otherwise, try parsing the string
                    ? new Date(dateParam)
                    : null;

        // 3) Bail on totally bogus input
        if (!(d instanceof Date) || isNaN(d.getTime())) {
            console.error('manualGetDatetime: invalid input →', dateParam);
            return null;
        }

        return d;
    }
    // =================================================================== \\

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
