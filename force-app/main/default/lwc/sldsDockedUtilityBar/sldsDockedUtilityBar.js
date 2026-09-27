/**
 * sldsDockedUtilityBar — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/utils.
 * - Salesforce/platform modules: lwc.
 * - Template children (including conditional UI): c-toast-lwc.
 * - Bundle template: sldsDockedUtilityBar.html; local styles: sldsDockedUtilityBar.css. Salesforce SLDS
 * styling is expected.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-docked-utility-bar') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - utility1 (utility1): Utility 1 configuration: label, icon, optional info/subText/notification; value
 * is generated internally.
 *   Example: child.utility1 = { label: 'Notes', icon: 'utility:note', notification: false };
 * - utility2 (utility2): Utility 2 configuration: label, icon, optional info/subText/notification; value
 * is generated internally.
 *   Example: child.utility2 = { label: 'Notes', icon: 'utility:note', notification: false };
 * - utility3 (utility3): Utility 3 configuration: label, icon, optional info/subText/notification; value
 * is generated internally.
 *   Example: child.utility3 = { label: 'Notes', icon: 'utility:note', notification: false };
 * - utility4 (utility4): Utility 4 configuration: label, icon, optional info/subText/notification; value
 * is generated internally.
 *   Example: child.utility4 = { label: 'Notes', icon: 'utility:note', notification: false };
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-slds-docked-utility-bar utility1={notes} onpanelopen={handlePanel}>
 *         <div slot="utility1">Notes content</div>
 *     </c-slds-docked-utility-bar>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     notes = { label: 'Notes', icon: 'utility:note', notification: false };
 *     activePanel;
 *     handlePanel(event) { this.activePanel = event.detail; }
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; padding-bottom: 3rem; }
 *
 * 4. Notes
 * - Use for up to four utilities with corresponding utility1 through utility4 slots. Each utility's value
 * is generated from its slot number. panelopen reports the selected dock identifier. Add utility2/3/4
 * configurations and matching slots for more tools; reserve space in the page for the fixed utility bar.
 * - Slots: utility1, utility2, utility3, utility4.
 */

import { LightningElement, api } from 'lwc';
import {iconMap as ICON_MAP, getErrorMessage} from 'c/utils'



const UTILITY_NAMES = [
    'utility1',
    'utility2',
    'utility3',
    'utility4'
];


function handleUtilityProperties(newUtility, utilityNumberStr) {
    const iconParts = newUtility.icon?.split(':');

    if (iconParts?.length === 2) {
        const [category, icon] = iconParts;
        return {...newUtility, value: `utility${utilityNumberStr}`, utility: utilityNumberStr, icon: ICON_MAP[category][icon]};
    }

    return {...newUtility, value: `utility${utilityNumberStr}`, icon: null, utility: utilityNumberStr};
}


const BAR_ITEM_BASE_CL = 'slds-utility-bar__item';
const BAR_ITEM_FIRST_CL = 'slds-utility-bar__item slds-m-left_x-small';
const BAR_ITEM_NOTIFICATION_CL = 'slds-utility-bar__item slds-has-notification';
const BAR_ITEM_FIRST_NOTIFICATION_CL = 'slds-utility-bar__item slds-has-notification slds-m-left_x-small';


export default class SldsDockedUtilityBar extends LightningElement {
    iconMap = ICON_MAP;

    _selectedItem;

    // Each option needs 'label', 'value', 'icon', 
    // optional: 'subText', 'notification' (adds red dot and gray background)
    _options = [];

    // Needs 3 properties: 'label', 'value', 'icon'
    _utility1;
    _utility1Cl = BAR_ITEM_FIRST_CL;
    @api
    set utility1(val) {
        try {
            if (val) {
                this._utility1Cl = val.notification ? BAR_ITEM_FIRST_NOTIFICATION_CL : BAR_ITEM_FIRST_CL;
                this._utility1 = handleUtilityProperties(val, '1');
                this._options = [this._utility1, this._utility2, this._utility3, this._utility4]
                    .filter(Boolean);
            } else {
                this._utility1 = val;
            }
        } catch(error) {
            this.showToast('Error in set utility1() of sldsDockedUtilityBar.js', getErrorMessage(error), 'error');
        }
    }
    get utility1() {
        return this._utility1;
    }

    // Needs 3 properties: 'label', 'value', 'icon'
    _utility2;
    _utility2Cl = BAR_ITEM_BASE_CL;
    @api 
    set utility2(val) {
        try {
            if (val) {
                this._utility2Cl = val.notification ? BAR_ITEM_NOTIFICATION_CL : BAR_ITEM_BASE_CL;
                this._utility2 = handleUtilityProperties(val, '2');
                this._options = [this._utility1, this._utility2, this._utility3, this._utility4]
                    .filter(Boolean);
            } else {
                this._utility2 = val;
            }
        } catch(error) {
            this.showToast('Error in set utility2() of sldsDockedUtilityBar.js', getErrorMessage(error), 'error');
        }
    }
    get utility2() {
        return this._utility2;
    }

    // Needs 3 properties: 'label', 'value', 'icon'
    _utility3;
    _utility3Cl = BAR_ITEM_BASE_CL;
    @api 
    set utility3(val) {
        try {
            if (val) {
                this._utility3Cl = val.notification ? BAR_ITEM_NOTIFICATION_CL : BAR_ITEM_BASE_CL;
                this._utility3 = handleUtilityProperties(val, '3');
                this._options = [this._utility1, this._utility2, this._utility3, this._utility4]
                    .filter(Boolean);
            } else {
                this._utility3 = val;
            }
        } catch(error) {
            this.showToast('Error in set utility3() of sldsDockedUtilityBar.js', getErrorMessage(error), 'error');
        }
    }
    get utility3() {
        return this._utility3;
    }

    // Needs 3 properties: 'label', 'value', 'icon'
    _utility4;
    _utility4Cl = BAR_ITEM_BASE_CL;
    @api 
    set utility4(val) {
        try {
            if (val) {
                this._utility4Cl = val.notification ? BAR_ITEM_NOTIFICATION_CL : BAR_ITEM_BASE_CL;
                this._utility4 = handleUtilityProperties(val, '4');
                this._options = [this._utility1, this._utility2, this._utility3, this._utility4]
                    .filter(Boolean);
            } else {
                this._utility4 = val;
            }
        } catch(error) {
            this.showToast('Error in set utility4() of sldsDockedUtilityBar.js', getErrorMessage(error), 'error');
        }
    }
    get utility4() {
        return this._utility4;
    }
   



    // Handle clicks on the docked options' buttons
    handleOptionClick(event) {
        try {
            const button = event.currentTarget;
            if (button) {
                const newDock = button.dataset.value;
                const isActive = button.classList.contains('slds-is-active');
                const dockedDisplay = this.template.querySelector('.slds-utility-panel');

                if (isActive && !dockedDisplay.classList.contains('slds-is-open')) {
                    if (newDock === this._selectedItem?.value) {
                        this.openPanel(dockedDisplay);
                        return;
                    }
                }
            
                if (isActive) {
                    this._selectedItem = null;
                    button.classList.remove('slds-is-active');
                    button.setAttribute('aria-pressed', 'false');
                    // Close panel
                    this.closePanel();

                } else {
                    const allButtons = this.template.querySelectorAll('.slds-utility-bar__action');

                    allButtons.forEach(btn => {
                        btn.classList.remove('slds-is-active');
                        btn.setAttribute('aria-pressed', 'false')
                    });
                    button.classList.add('slds-is-active');

                    // Open panel
                    this.openPanel();
                    this._selectedItem = this._options.find(opt => opt.value === newDock);
                    this.dispatchEvent(new CustomEvent('panelopen', { detail: newDock } ));
                }
            
            }
        } catch(error) {
            this.showToast('Error in handleOptionClick() of sldsDockedUtilityBar.js', getErrorMessage(error), 'error');
        }
    }


    // Close the docked panel
    closePanel(dockedDisplay=null) {
        try {
            if (!dockedDisplay || !dockedDisplay.classList) {
                dockedDisplay = this.template.querySelector('.slds-utility-panel');
            }
            if (dockedDisplay) {
                dockedDisplay.classList.remove('slds-is-open');
            }
            this.resetUtilityButtons();
        } catch(error) {
            this.showToast('Error in closePanel() of sldsDockedUtilityBar.js', getErrorMessage(error), 'error');
        }
    }

    resetUtilityButtons() {
        [
            this.refs?.utility1Button,
            this.refs?.utility2Button,
            this.refs?.utility3Button,
            this.refs?.utility4Button
        ].filter(Boolean).forEach((button) => {
            button.classList.remove('slds-is-active');
            button.setAttribute('aria-pressed', 'false');
        });
        this._selectedItem = null;
    }


    // Open docked panel
    openPanel(dockedDisplay=null) {
        try {
            if (!dockedDisplay) {
                dockedDisplay = this.template.querySelector('.slds-utility-panel');
            }
            if (!dockedDisplay.classList.contains('slds-is-open')) {
                dockedDisplay.classList.add('slds-is-open');
            }
        } catch(error) {
            this.showToast('Error in openPanel() of sldsDockedUtilityBar.js', getErrorMessage(error), 'error');
        }
    }


    get activeUtilityBool() {
        try {
            const utilityBools = {};
            UTILITY_NAMES.forEach(name => {
                utilityBools[name] = this._selectedItem?.value === name;
            });
            return utilityBools;
        } catch(error) {
            this.showToast('Error in get activeUtilityBool() of sldsDockedUtilityBar.js', getErrorMessage(error), 'error');
        }
    }
    get selectedItemInfo() {
        try {
            if (this._selectedItem) {
                return {
                    icon: this._selectedItem.icon,
                    heading: this._selectedItem.label,
                    info: this._selectedItem.info
                }
            }
            return {
                icon: '',
                heading: '',
                info: ''
            }
        } catch(error) {
            this.showToast('Error in selectedItemInfo() of sldsDockedUtilityBar.js', getErrorMessage(error), 'error');
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
