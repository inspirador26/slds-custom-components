/**
 * sldsModalSlot — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/utils.
 * - Salesforce/platform modules: lwc.
 * - Template children (including conditional UI): lightning-icon.
 * - Bundle template: sldsModalSlot.html; local styles: sldsModalSlot.css. Salesforce SLDS styling is
 * expected.
 * - Shared CSS modules: c/sharedStylesGlobal.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-modal-slot') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - footerSlot (footer-slot): Renders modalFooter content in place of the default footer controls.
 * Declared default: false.
 *   Example: child.footerSlot = true;
 * - overflow (overflow): CSS overflow value for the modal content.
 *   Example: child.overflow = "visible";
 * - borderRadius (border-radius): CSS corner radius, including units.
 *   Example: child.borderRadius = "0.25rem";
 * - modalTitle (modal-title): Visible modal heading.
 *   Example: child.modalTitle = "Edit details";
 * - renderFocus (render-focus): Focuses the input after it becomes available/rendered. Declared default:
 * false.
 *   Example: child.renderFocus = true;
 * - activeElement (active-element): Trigger DOM element returned in modalok/closemodal detail for focus
 * restoration.
 *   Example: child.activeElement = this.template.querySelector('button');
 * - okLabel (ok-label): Text for the modal confirmation button. Declared default: 'OK'.
 *   Example: child.okLabel = "Save";
 * - cancelLabel (cancel-label): Text for the modal cancellation button. Declared default: 'Cancel'.
 *   Example: child.cancelLabel = "Cancel";
 * - suppressOkButton (suppress-ok-button): Hides the default confirmation button. Declared default: false.
 *   Example: child.suppressOkButton = true;
 * - footerAligned (footer-aligned): Default modal footer alignment: left, center or right.
 *   Example: child.footerAligned = "right";
 * - objectApiName (object-api-name): Salesforce object API name used for metadata, navigation or record
 * operations.
 *   Example: child.objectApiName = "Account";
 * - size (size): Component size token; supported values depend on this component.
 *   Example: child.size = "small";
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <button onclick={showModal}>Open dialog</button>
 *     <template lwc:if={visible}>
 *         <c-slds-modal-slot modal-title="Details" active-element={trigger}
 *             onclosemodal={closeModal} onmodalok={saveModal}>
 *             <div slot="modalBody">Review these details.</div>
 *         </c-slds-modal-slot>
 *     </template>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     visible = false;
 *     trigger;
 *     showModal(event) { this.trigger = event.currentTarget; this.visible = true; }
 *     closeModal() { this.visible = false; this.trigger?.focus(); }
 *     saveModal() { this.closeModal(); }
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Use for a parent-owned modal with arbitrary body content. The parent must remove it on
 * closemodal/modalok; detail returns activeElement when supplied. Replace saveModal with the parent's save
 * operation.
 * - Custom-footer variant: set footer-slot={enabled}, define enabled = true, and provide
 * slot="modalFooter" buttons wired to parent handlers. The built-in OK/Cancel controls are replaced in
 * this mode.
 * - Slots: modalBody, modalFooter.
 */

import { LightningElement, api } from 'lwc';

import {iconMap as ICON_MAP, iconByObjectApiName, getErrorMessage} from 'c/utils';

export default class SldsModalSlot extends LightningElement {
    iconMap = ICON_MAP;

    @api footerSlot = false;

    _overflow = 'auto';
    @api 
    set overflow(val) {
        this._overflow = val;
    }
    get overflow() {
        return this._overflow;
    }

    @api 
    set borderRadius(val) {
        this._borderRadius = val;
        if (val) {
            this._applyVarsDirect('--modal-border-radius', val);
        }
    }
    get borderRadius() {
        return this._borderRadius;
    }

    @api modalTitle;
    @api renderFocus = false;
    @api activeElement; // Send active element back to parent

    // Button labels
    @api okLabel = 'OK';
    @api cancelLabel = 'Cancel';

    @api suppressOkButton = false;

    _footerCl = '';
    @api 
    set footerAligned(value) {
        this._footerAligned = value;
        if (value) {
            switch(value) {
                case 'left':
                    this._footerCl = 'slds-grid';
                    break;
                case 'start': 
                    this._footerCl = 'slds-grid';
                    break;
                case 'center':
                    this._footerCl  = 'slds-grid slds-grid_align-center';
                    break;
                case 'middle':
                    this._footerCl  = 'slds-grid slds-grid_align-center';
                    break;
                default:
                    break;
            }
        }
    } 
    get footerAligned() {
        return this._footerAligned;
    }

    // Add Icon to header if object api name provided
    _iconConfig;
    @api 
    set objectApiName(value) {
        this._objectApiName = value;
        if (value) {
            const iconObj = iconByObjectApiName(value);
            if (iconObj && iconObj.iconName !== "standard:empty") {
                this._iconConfig = iconObj;
            }
        }
    } 
    get objectApiName() {
        return this._objectApiName;
    }

    _modalCl = 'slds-modal slds-fade-in-open';
    @api 
    set size(value) {
        this._size = value;
        if (value) {
            this._modalCl = `slds-modal slds-fade-in-open slds-modal slds-modal_${value.toLowerCase()}`;
        }
    } 
    get size() {
        return this._size;
    }

    // Keep focus within the modal
    handleKeyDown(e) {
        try {
            if (e.key !== 'Tab') return;

            const focusables = this._getFocusableElements();
            if (!focusables.length) return;

            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        } catch(error) {
            this.showToast('Error in handleKeyDown() of sldsModalSlot.js', getErrorMessage(error), 'error');
        }
    }
    // Get focusable elements
    _getFocusableElements() {
        try {
            const internal = Array.from(
                this.template.querySelectorAll(
                    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]'
                )
            );

            const slot = this.template.querySelector('slot[name="modalBody"]');
            let slotted = [];

            if (slot) {
                const assigned = slot.assignedElements({ flatten: true });

                slotted = assigned.flatMap(el =>
                    Array.from(
                        el.querySelectorAll(
                            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]'
                        )
                    )
                );
            }

            return [...internal, ...slotted];
        } catch(error) {
            this.showToast('Error in _getFocusableElements() of sldsModalSlot.js', getErrorMessage(error), 'error');
            return null;
        }
    }

    // Focus first element on render
    _didFocus = false;
    renderedCallback() {
        if (this.renderFocus && !this._didFocus) {
            const firstEle = this.template.querySelector('[data-is-focusable="true"]');
            if (firstEle) {
                firstEle.focus();
            }
            this._didFocus = true;
        }
    }

    get modalContentCl() {
        return 'slds-modal__content modal-body-frame';
    }

    get modalScrollCl() {
        if (this._overflow === 'visible') {
            return 'modal-body-scroll oveflow-visible slds-p-around_medium';
        }
        return 'modal-body-scroll slds-scrollable_y';
    
    }

    handleCancel() {
        try {
            this.dispatchEvent(new CustomEvent('closemodal', { detail: this.activeElement ?? 'close' } ));
        } catch(error) {
            this.showToast('Error in handleCancel() of sldsModalSlot.js: ', getErrorMessage(error), 'error');
        }
        
    }
    
    handleOkay() {
        try {
            this.dispatchEvent(new CustomEvent('modalok', { detail: this.activeElement ?? 'okay' } ));
        } catch(error) {
            this.showToast('Error in handleOkay() of sldsModalSlot.js: ', getErrorMessage(error), 'error');
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
    
}