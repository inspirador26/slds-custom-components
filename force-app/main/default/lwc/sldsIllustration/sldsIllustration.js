/**
 * sldsIllustration — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/utils.
 * - Salesforce/platform modules: lwc.
 * - Bundle template: sldsIllustration.html; local styles: sldsIllustration.css. Salesforce SLDS styling is
 * expected.
 * - Shared CSS modules: c/sharedStylesGlobal.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-illustration') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - additionalHelpTextSlot (additional-help-text-slot): Enables the additionalHelpTextSlot named slot.
 *   Example: child.additionalHelpTextSlot = true;
 * - size (size): Illustration size: xx-small, x-small, small/default or large.
 *   Example: child.size = "small";
 * - isButton (is-button): Styles the call-to-action as a brand button; callToAction controls whether it is
 * rendered. Declared default: false.
 *   Example: child.isButton = true;
 * - helpText (help-text): Primary empty/error-state message.
 *   Example: child.helpText = "No records found";
 * - additionalHelpText (additional-help-text): Additional message string or array of message strings.
 *   Example: child.additionalHelpText = "Try changing your filters.";
 * - callToAction (call-to-action): Text for the illustration action button.
 *   Example: child.callToAction = "Refresh";
 * - isNoContent (is-no-content): Selects the named illustration/state; set only the intended variant
 * flags.
 *   Example: child.isNoContent = true;
 * - isNoData (is-no-data): Marks the table as loaded with no data and clears its current rows.
 *   Example: child.isNoData = true;
 * - isOpenRoad (is-open-road): Selects the named illustration/state; set only the intended variant flags.
 *   Example: child.isOpenRoad = true;
 * - isError (is-error): Selects the named illustration/state; set only the intended variant flags.
 *   Example: child.isError = true;
 * - isNoAccess (is-no-access): Selects the named illustration/state; set only the intended variant flags.
 *   Example: child.isNoAccess = true;
 * - isNoConnection (is-no-connection): Selects the named illustration/state; set only the intended variant
 * flags.
 *   Example: child.isNoConnection = true;
 * - isPageNotAvailable (is-page-not-available): Selects the named illustration/state; set only the
 * intended variant flags.
 *   Example: child.isPageNotAvailable = true;
 * - isNoPreview (is-no-preview): Selects the named illustration/state; set only the intended variant
 * flags.
 *   Example: child.isNoPreview = true;
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-slds-illustration is-no-data={enabled} size="small"
 *         help-text="No accounts found" additional-help-text="Try another filter."
 *         is-button={enabled} call-to-action="Refresh" onaction={handleAction}>
 *     </c-slds-illustration>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     enabled = true;
 *     refreshRequested = false;
 *     handleAction() { this.refreshRequested = true; }
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Use for empty, unavailable or error states. The action event asks the parent to perform the call to
 * action. Choose the state flags for the desired artwork. Rich-help variant: set
 * additional-help-text-slot={enabled} and supply slot="additionalHelpTextSlot" content.
 * - Slots: additionalHelpTextSlot.
 */

import { LightningElement, api, track } from 'lwc';
import { publicPropertyToBool } from 'c/utils';

/*
    <c-slds-illustration
        is-dash-through=""        (no image, just crossed out help-text)
        is-no-data=""             (desert --> variants: is-open-road="true")
        is-error=""               (**requires variant --> is-no-access="true" (closed treasure), is-no-connection="true", is-page-not-available="true") 
        is-no-content=""          (treasure chest)
        is-no-preview=""          (broken binoculars)
        size="small"              (x-small, xx-small, small(default), large) 
        help-text="No Data"
        additonal-help-text=""    (Can be Array or String) 
        is-button=""              (adds button) 
        call-to-action=""         (label for the button) 
        onaction={}               (action handler) 
    ></c-slds-illustration>
    <c-slds-illustration
        is-dash-through=""        
        is-no-data=""             
        is-error=""               
        is-no-content=""          
        is-no-preview=""          
        size="small"              
        help-text="No Data"
        additonal-help-text=""
        is-button=""              
        call-to-action=""         
        onaction={}               
    ></c-slds-illustration>
*/

let KEY_ID = 5232312;
export default class SldsIllustration extends LightningElement {
    _helpTextCl = 'header-text_medium slds-text-color_weak';

    @api 
    set additionalHelpTextSlot(val) {
        console.log('in additionalHelpTextSlot of SldsIllustration.js, here is val: ', val);
        this._additionalHelpTextSlot = !!val;
    }
    get additionalHelpTextSlot() {
        return this._additionalHelpTextSlot ?? false;
    }

    @api 
    set size(value) {
        this._size = value;
        switch(value) {
            case 'xx-small':
                this._helpTextCl = 'slds-text-color_weak header-text_x-small'; break;
            case 'x-small':
                this._helpTextCl = 'slds-text-color_weak header-text_small'; break;
            case 'small':
                this._helpTextCl = 'slds-text-color_weak header-text_medium'; break;
            case 'large':
                this._helpTextCl = 'slds-text-color_weak header-text_large'; break;
        }
    }
    get size() {return this._size;}

    @api isButton = false;

    // ============= User Help Messages ============== \\
    _helpText = '';
    @api 
    set helpText(value) {this._helpText = value;}
    get helpText() {return this._helpText;}

    _isAdditionalHelpTextArr = false;
    _additionalHelpText = '';
    @api 
    set additionalHelpText(value) {
        if (value) {
            if (Array.isArray(value)) {
                this._isAdditionalHelpTextArr = true;
                this._additionalHelpText = value.map(v => ({msg: v, keyId: String(KEY_ID++)}));
            } else {
                this._isAdditionalHelpTextArr = false;
                this._additionalHelpText = value;
            }
        }
    }
    get additionalHelpText() {return this._additionalHelpText;}
    @api 
    set callToAction(value) {this._callToAction = value;}
    get callToAction() {return this._callToAction;}
    // =============================================== \\

    @api 
    set isNoContent(value) {this._isNoContent = publicPropertyToBool(value);}
    get isNoContent() {return this._isNoContent;}

    @api 
    set isNoData(value) {this._isNoData = publicPropertyToBool(value);}
    get isNoData() {return this._isNoData;}
    // ============ No Data Illustrations ============ \\
    @api 
    set isOpenRoad(value) {this._isOpenRoad = publicPropertyToBool(value);}
    get isOpenRoad() {return this._isOpenRoad;}
    // =============================================== \\
    

    @api 
    set isError(value) {this._isError = publicPropertyToBool(value);}
    get isError() {return this._isError;}

    // ============= Error Illustrations ============= \\
    @api 
    set isNoAccess(value) {this._isNoAccess = publicPropertyToBool(value);}
    get isNoAccess() {return this._isNoAccess;}
    @api 
    set isNoConnection(value) {this._isNoConnection = publicPropertyToBool(value);}
    get isNoConnection() {return this._isNoConnection;}
    @api 
    set isPageNotAvailable(value) {this._isPageNotAvailable = publicPropertyToBool(value);}
    get isPageNotAvailable() {return this._isPageNotAvailable;}
    @api 
    set isNoPreview(value) {
        this._isNoPreview = publicPropertyToBool(value);
    }
    get isNoPreview() {
        return this._isNoPreview;
    }
    // =============================================== \\

    get isDashThrough() {
        return !this.isNoData && !this.isError && !this.isNoContent;
    }


    // Notify parent of call to action
    handleCallToAction() {
        // Send event to parent with the value
        this.dispatchEvent(new CustomEvent('action', { detail: 'action' } ));   
    }

    get sizeClass() {
        switch(this.size) {
            case 'xx-small':
                return 'slds-illustration xx-small-illustration';
            case 'x-small':
                return 'slds-illustration x-small-illustration';
            case 'large':
                return 'slds-illustration slds-illustration_large';
            default:
                return 'slds-illustration slds-illustration_small';
        }
    }

    get buttonCl() {
        return this.isButton
            ? 'slds-button slds-button_brand'
            : 'slds-button'
    }

    get helpTextCl() {
        return this.size && (this.size === 'x-small' ||  this.size === 'xx-small')
            ? 'slds-text-heading_small'
            : 'slds-text-heading_medium'; 
    }


    _hasRendered = false;
    renderedCallback() {
        if (this.size && this.size === 'fill' && !this._hasRendered) {
            const svg = this.template.querySelector('svg');
            if (svg) {
                svg.classList.add('gw-illustration__svg');
            }
        }
    }
}