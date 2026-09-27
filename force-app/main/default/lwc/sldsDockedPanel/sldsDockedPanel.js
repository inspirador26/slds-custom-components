/**
 * sldsDockedPanel — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/utils.
 * - Salesforce/platform modules: lwc.
 * - Template children (including conditional UI): c-toast-lwc, lightning-icon.
 * - Bundle template: sldsDockedPanel.html; local styles: sldsDockedPanel.css. Salesforce SLDS styling is
 * expected.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-docked-panel') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - panelTitle (panel-title): Docked panel title.
 *   Example: child.panelTitle = "Notes";
 * - icon (icon): SLDS category:name icon identifier. Declared default: 'utility:new'.
 *   Example: child.icon = "standard:account";
 * - expose (expose): Exposes and opens the panel in docked mode.
 *   Example: child.expose = true;
 * - open (open): Controls whether the docked panel is open.
 *   Example: child.open = true;
 *
 * Public methods (call on the rendered child):
 * - forceOpen(): Open the panel/popover.
 * - forceClose(): Close the panel/popover.
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <button onclick={showPanel}>Open notes</button>
 *     <c-slds-docked-panel panel-title="Notes" icon="utility:note"
 *         open={opened} onpanelclose={closePanel}>
 *         <div slot="body">Notes content</div>
 *     </c-slds-docked-panel>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     opened = false;
 *     showPanel() { this.opened = true; }
 *     closePanel() { this.opened = false; }
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Use for a persistent composer that can switch between docked and expanded modal mode. panelclose tells
 * the parent to close it; dockedmode/modalmode announce mode changes, and panelbuttonclick announces the
 * panel button. forceOpen()/forceClose() are available when imperative control is needed.
 * - Slots: body.
 */

import { LightningElement, api } from 'lwc';

import {iconMap as ICON_MAP, getErrorMessage} from 'c/utils'

const MODAL_MODE = {
    sldsDockedContainer: "slds-modal slds-fade-in-open slds-docked-composer-modal slds-modal_medium", 
    sldsModalContainer: "slds-modal__container", 
    sldsModalContent: "slds-modal__content", 
    sldsBackdrop: "slds-backdrop slds-backdrop_open", 
};
const DOCKED_MODE = {
    sldsDockedContainer:  "slds-docked_container", 
    sldsModalContainer:  "", 
    sldsModalContent:  "", 
    sldsBackdrop:  "", 
}

const OPEN_PANEL_CL = 'slds-docked-composer slds-grid slds-grid_vertical slds-is-open';
const CLOSED_PANEL_CL = 'slds-docked-composer slds-grid slds-grid_vertical slds-is-closed';
const CLOSED_PANEL_FOCUS_CL = 'slds-docked-composer slds-grid slds-grid_vertical slds-is-closed slds-has-focus';
const OPEN_PANEL_FOCUSED_CL = 'slds-docked-composer slds-grid slds-grid_vertical slds-is-open slds-has-focus';



function isPanelOpen(panelCl) {
    return panelCl?.includes('slds-is-open');
}

function handleClosePanel(panelCl) {
    const hasFocus = panelCl?.includes('slds-has-focus');
    return hasFocus
        ? CLOSED_PANEL_FOCUS_CL
        : CLOSED_PANEL_CL;
}
function handleOpenPanel(panelCl) {
    const hasFocus = panelCl?.includes('slds-has-focus');
    return hasFocus
        ? OPEN_PANEL_FOCUSED_CL
        : OPEN_PANEL_CL;
}


export default class SldsDockedPanel extends LightningElement {
    iconMap = ICON_MAP;
   
    // Toggle CSS classes between "Docked-Modal" / "Pop-Up-Modal"
    _expandController = DOCKED_MODE
    _isOpen = false;

    @api panelTitle
    @api icon = 'utility:new';

    _panelCl = CLOSED_PANEL_CL;

    // Track if the entire component should be hidden
    _expose = false;
    @api 
    set expose(val) {
        this._expose = val;
        if (val) {
            this._expose = true;
            this._panelCl = OPEN_PANEL_CL;
            this._expandController = DOCKED_MODE;
        } 
    }
    get expose() {
        return this._expose;
    }

    // Set panel default state 
    @api 
    set open(val) {
        this._open = val;
        if (val && val === true || val === "true") {
            this._panelCl = OPEN_PANEL_CL;
        } else {
            this._panelCl = CLOSED_PANEL_CL;
        }
    }
    get open() {
        return this._open;
    }


    connectedCallback() {
        // Attach event listener to the header element
        this.template.addEventListener('click', this.handleHeaderClick.bind(this));
    }


    @api forceOpen() {
        this._expose = true;
        this._panelCl = OPEN_PANEL_CL;
        this._expandController = DOCKED_MODE;
    }
    @api forceClose() {
        this._expose = false;
        this._panelCl = CLOSED_PANEL_CL;
        this._expandController = DOCKED_MODE;
    }


    // Check if focus is within the docked panel still
    handleFocusOut(event) {
        try {
            const next = event.relatedTarget;
            // If focus is still somewhere inside this component, ignore this focusout.
            if (next && (this.template.contains(next) || next?.dataset?.parent === 'slds-docked-panel')) {
                return;
            }
            if (isPanelOpen(this._panelCl)) {
                this._panelCl = OPEN_PANEL_CL;
            } else {
                this._panelCl = CLOSED_PANEL_CL;
            }
        } catch(error) {
            this.showToast('Error in handleFocusOut() of sldsDockedPanel.js', getErrorMessage(error), 'error');
        }
    }
    focusPanel(event) {
        try {
            if (isPanelOpen(this._panelCl)) {
                this._panelCl = OPEN_PANEL_FOCUSED_CL;
            } else {
                this._panelCl = CLOSED_PANEL_FOCUS_CL;
            }
        } catch(error) {
            this.showToast('Error in focusPanel() of sldsDockedPanel.js', getErrorMessage(error), 'error');
        }
    }

    // ==================================== Component State Togglers ==================================== \\
    // Handle Clicks to the <header> element
    handleHeaderClick(event) {
        try {
            const closestHdr = event.target.closest('header');
            if (!closestHdr || !closestHdr.classList.contains) {
                return;
            }
            // Ensure a button was not specified
            if (event.target.tagName === "BUTTON" || event.target.closest('button')) {
                return;
            }
            
            
            if (isPanelOpen(this._panelCl)) {
                if (this._expandController === MODAL_MODE) {
                    this._expandController = DOCKED_MODE; 
                    this.dispatchEvent(new CustomEvent('dockedmode', { detail: 'dockedmode' } ));
                } else {
                    this._panelCl = handleClosePanel(this._panelCl);
                }
            } else {
                this._panelCl = handleOpenPanel(this._panelCl);
                this._expandController = DOCKED_MODE;
                this.dispatchEvent(new CustomEvent('dockedmode', { detail: 'dockedmode' } ));
            }
        } catch(error) {
            this.showToast('Error in handleHeaderClick() of sldsDockedPanel.js', getErrorMessage(error), 'error');
        }
    }
    // Handle "Erect Window" / "Minimize Window" clicks
    toggleComposer(event) {
        try {
            //event.stopPropagation();
            if (this._expandController === MODAL_MODE) {
                this._expandController = DOCKED_MODE;
                setTimeout(() => {
                    this._panelCl = handleClosePanel(this._panelCl);
                }, 50);
                this.dispatchEvent(new CustomEvent('dockedmode', { detail: 'dockedmode' } ));
            } else {
                this._panelCl = isPanelOpen(this._panelCl) 
                    ? handleClosePanel(this._panelCl)
                    : handleOpenPanel(this._panelCl);  
            }
        } catch(error) {
            this.showToast('Error in toggleComposer() of sldsDockedPanel.js', getErrorMessage(error), 'error');
        }    
    }
    // Handle "Expand" button clicks (expand/collapse Modal)
    toggleExpand(event) {
        try {
            if (this._expandController === DOCKED_MODE) {
                this._expandController = MODAL_MODE;
                this.dispatchEvent(new CustomEvent('modalmode', { detail: 'modalmode' } ));
            } else {
                this._expandController = DOCKED_MODE;
                this.dispatchEvent(new CustomEvent('dockedmode', { detail: 'dockedmode' } ));
            }
            this._panelCl = handleOpenPanel(this._panelCl);
        } catch(error) {
            this.showToast('Error in toggleExpand() of sldsDockedPanel.js', getErrorMessage(error), 'error');
        }
    }
    // Toggle between Invisible Component and Exposed Component
    removeComposer(event) {
        event.stopPropagation();
        this._panelCl = CLOSED_PANEL_CL;
        this._expandController = DOCKED_MODE;
        this.dispatchEvent(new CustomEvent('panelclose', { detail: 'panelclose' } ));
        this._expose = false;
    }
    // ================================================================================================== \\
    

    // Handle Footer button click
    handleFooterButtonClick(event) {
        try {
            event.preventDefault();
            event.stopPropagation();
            this.dispatchEvent(new CustomEvent('panelbuttonclick', { detail: 'panelbuttonclick' } ));
        } catch(error) {
            this.showToast('Error in handleButtonClick() of sldsDockedPanel.js', getErrorMessage(error), 'error');
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




    get _windowIcon() {
        return this._panelCl === CLOSED_PANEL_CL || this._panelCl === CLOSED_PANEL_FOCUS_CL  
            ? {icon: this.iconMap.utility.erect_window, iconTitle: 'Open Window'}
            : {icon: this.iconMap.utility.minimize_window, iconTitle: 'Minimize Window'};
    }
    get footerBtnTabIndex() {
        return this._panelCl.includes('slds-has-focus') && this._panelCl.includes('slds-is-open')
            ? "0"
            : "-1";
    }   

}