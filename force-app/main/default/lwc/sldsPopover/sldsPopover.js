/**
 * sldsPopover — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/utils.
 * - Salesforce/platform modules: lwc.
 * - Bundle template: sldsPopover.html; local styles: sldsPopover.css. Salesforce SLDS styling is expected.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-popover') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - footer (footer): Enables the popover footer slot. Declared default: false.
 *   Example: child.footer = true;
 * - header (header): Popover heading.
 *   Example: child.header = "Help";
 * - isNotifyHeader (is-notify-header): Uses the notification-style header layout.
 *   Example: child.isNotifyHeader = true;
 * - headerPadding (header-padding): CSS padding for the popover header/body treatment.
 *   Example: child.headerPadding = "0.75rem";
 * - variant (variant): Popover visual variant (for example warning or error).
 *   Example: child.variant = "warning";
 * - popoverBg (popover-bg): CSS background color of the popover.
 *   Example: child.popoverBg = "#ffffff";
 * - isDark (is-dark): Uses a light close button for dark backgrounds.
 *   Example: child.isDark = true;
 * - nubbin (nubbin): Popover nubbin placement token.
 *   Example: child.nubbin = "bottom-left";
 * - adjustHorizontal (adjust-horizontal): Horizontal position adjustment as a px or rem string.
 *   Example: child.adjustHorizontal = "8px";
 * - adjustVertical (adjust-vertical): Vertical adjustment as a px or rem string (internally inverted for
 * positioning).
 *   Example: child.adjustVertical = "8px";
 * - size (size): Component size token; supported values depend on this component.
 *   Example: child.size = "small";
 * - scroll (scroll): Uses the small scrollable popover body class.
 *   Example: child.scroll = true;
 * - icon (icon): SLDS category:name icon identifier.
 *   Example: child.icon = "standard:account";
 * - shrinkNubbin (shrink-nubbin): Adds the smaller-nubbin host treatment.
 *   Example: child.shrinkNubbin = true;
 *
 * Public methods (call on the rendered child):
 * - forceOpen(): Open the panel/popover.
 * - forceClose(): Close the panel/popover.
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-slds-popover header="Help" nubbin="bottom-left">
 *         <button slot="trigger" onclick={showHelp}>Show help</button>
 *         <p slot="body">Choose an account before continuing.</p>
 *     </c-slds-popover>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     showHelp() { this.template.querySelector('c-slds-popover').forceOpen(); }
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Use for contextual help or a small notification. The parent trigger opens it through forceOpen();
 * forceClose() closes it, and popoverclose reports dismissal. Set footer={enabled} to render a footer
 * slot. The extra notification body slot is spelled notiftyBody in the current template. Parent layout
 * should leave space for the absolutely positioned panel.
 * - Slots: body, footer, notiftyBody, trigger.
 */

import { LightningElement, api } from 'lwc';
import { publicPropertyToBool, iconPath, iconMap as ICON_MAP } from 'c/utils';


const VARIANT_CLS = {
    error: 'slds-popover_error',
    warning: 'slds-popover_warning',
    info: 'slds-popover_info',
    dark: 'slds-popover_dark'
};

const GET_NUBBIN = (val) => {
    // Bottom center is default
    if (!val || typeof val !== 'string') return 'bottom_center';

    const s = val.toLowerCase().replace(/_/g, '-').trim();

    // split once: "top-left" => ["top","left"], "left-top" => ["left","top"], "left" => ["left"]
    const parts = s.split('-').filter(Boolean);
    const p0 = parts[0];              // primary
    const p1 = parts[1] || null;      // secondary

    // Side-first inputs
    if (p0 === 'left' || p0 === 'right') {
        const y = (p1 === 'top' || p1 === 'bottom') ? p1 : 'center';
        return `${p0}_${y}`;          // left_top, left_center, left_bottom, right_*
    }

    // Top/bottom-first inputs (keep your old meaning)
    const y = (p0 === 'top') ? 'top' : 'bottom';  // default bottom
    const x = (p1 === 'left' || p1 === 'right') ? p1 : 'center';
    return `${y}_${x}`;              // top_left, top_center, bottom_right, etc.
};

const NUBBIN_CL_MAP = {
    top_right: 'slds-nubbin_top-right',
    top_left: 'slds-nubbin_top-left',
    top_center: 'slds-nubbin_top',
    bottom_right: 'slds-nubbin_bottom-right',
    bottom_left: 'slds-nubbin_bottom-left',
    bottom_center: 'slds-nubbin_bottom',
    left_bottom: 'slds-nubbin_left-top', 
    left_top: 'slds-nubbin_left-bottom',
    left_center: 'slds-nubbin_left',
    right_top: 'slds-nubbin_right-top', 
    right_bottom: 'slds-nubbin_right-bottom',
    right_center: 'slds-nubbin_right',
};

const POPOVER_POSITION_MAP = {
    top_right: 'nubbin-top-right', 
    top_left: 'nubbin-top-left', 
    top_center: 'nubbin-top-center', 
    bottom_right: 'nubbin-bottom-right', 
    bottom_left: 'nubbin-bottom-left', 
    bottom_center: 'nubbin-bottom-center', 
    left_bottom: 'nubbin-left-top',
    left_center: 'nubbin-left-center', 
    left_top: 'nubbin-left-bottom', 
    right_top: 'nubbin-right-top', 
    right_center: 'nubbin-right-center', 
    right_bottom: 'nubbin-right-bottom', 
}


const POPOVER_SIZES = {
    small: 'slds-popover_small',
    medium: 'slds-popover_medium',
    large: 'slds-popover_large',
    full: 'slds-popover_full-width'
}

function normalizeAdjustment(value) {
    if (typeof value !== 'string') return null;

    const match = value.trim().match(/^([+-]?\d*\.?\d+)(px|rem)$/i);
    if (!match) return null;

    const amount = Number(match[1]);
    if (!Number.isFinite(amount)) return null;

    return `${amount}${match[2].toLowerCase()}`;
}

function invertAdjustment(value) {
    const match = value.match(/^(-?\d*\.?\d+)(px|rem)$/i);
    if (!match) return '0px';

    return `${Number(match[1]) * -1}${match[2]}`;
}


export default class SldsPopover extends LightningElement {
    _iconConfig;
    iconMap = ICON_MAP;
    @api footer=false;
    @api header;

    _isNotifyHeader = false;
    @api
    set isNotifyHeader(value) {
        this._isNotifyHeader = publicPropertyToBool(value);
    }
    get isNotifyHeader() {
        return this._isNotifyHeader;
    }

    @api 
    set headerPadding(val) {
        this._headerPadding = val;
        if (val) {
            this._applyVarsDirect('--header-padding-body', val);
        }
    }
    get headerPadding() {
        return this._headerPadding;
    }

    // Enable  variants "dark", "warning", "error", "info"
    @api 
    set variant(value) {
        this._variant = value;
        if (value) {
            this.handlePopoverVariant(value);
        }
    } 
    get variant() {
        return this._variant;
    }

    @api 
    set popoverBg(value) {
        this._popoverBg = value;
        if (value) {
            this._applyVarsDirect('--popover-color-bg', value);
        }
    } 
    get popoverBg() {
        return this._popoverBg;
    }

    _buttonCl = 'slds-button slds-button_icon slds-button_icon-small slds-float_right slds-popover__close'; 
    @api 
    set isDark(value) {
        this._isDark = value;
        if (value) {
            this._buttonCl = 'slds-button slds-button_icon slds-button_icon-small slds-float_right slds-popover__close slds-button_icon-inverse'; 
        }
    } 
    get isDark() {
        return this._isDark;
    }


    _popoverClasses = 'slds-popover slds-hide slds-nubbin_bottom nubbin-bottom-center';
    _nubbin = 'slds-nubbin_bottom';
    @api // Options: 'bottom', 'bottom-right', 'bottom-left', 'top', 'top-right', 'top-left'
    set nubbin(val) {
        const nubbin = GET_NUBBIN(val); 
        const nubbinCl = NUBBIN_CL_MAP[nubbin];
        const popoverPosCl = POPOVER_POSITION_MAP[nubbin];
        this._popoverClasses = `slds-popover slds-hide ${popoverPosCl} ${nubbinCl} ${POPOVER_SIZES?.[this.size] ?? ''}`;
        this.handlePopoverVariant(this.variant);
        this._nubbin = nubbin; 
    }
    get nubbin() {
        return this._nubbin ?? 'slds-nubbin_bottom';
    }

    @api
    set adjustHorizontal(value) {
        const adjustment = normalizeAdjustment(value);
        this._adjustHorizontal = adjustment ?? '0px';
        this._applyVarsDirect('--popover-adjust-x', this._adjustHorizontal);
    }
    get adjustHorizontal() {
        return this._adjustHorizontal ?? '0px';
    }

    @api
    set adjustVertical(value) {
        const adjustment = normalizeAdjustment(value);
        this._adjustVertical = adjustment ?? '0px';
        this._applyVarsDirect('--popover-adjust-y', invertAdjustment(this._adjustVertical));
    }
    get adjustVertical() {
        return this._adjustVertical ?? '0px';
    }

    @api 
    set size(value) {
        this._size = value;
        if (value) {
            this._popoverClasses = `${this._popoverClasses} ${POPOVER_SIZES?.[this.size] ?? ''}`
        }
    } 
    get size() {
        return this._size;
    }

    _bodyCl = 'slds-popover__body';
    @api 
    set scroll(value) {
        this._scroll = value;
        if (value) {
            this._bodyCl = 'slds-popover__body slds-popover__body_small';
        }
    } 
    get scroll() {
        return this._scroll;
    }

    @api 
    set icon(val) {
        if (val) {
            const iconConfig = iconPath(val, true);
            iconConfig.svg = 'slds-icon slds-icon_small';
            this._iconConfig = iconConfig;
        }
        this._icon = val;
    }
    get icon() {
        return this._icon;
    }

    // For small nubbin
    @api 
    set shrinkNubbin(val) {
        const isShrink = publicPropertyToBool(val);
        const host = this.template.host;
        if (isShrink) {
            host.classList.add('shrink-nubbin');
        } else {
            host.classList.remove('shrink-nubbin');
        }
        this._shrinkNubbin = isShrink;
    }
    get shrinkNubbin() {
        return this._shrinkNubbin;
    }

    // Add  modifier class to popover classes if user passed "variant"
    handlePopoverVariant(variantStr) {
        if (!variantStr) return;
        const variantCl = VARIANT_CLS[variantStr];
        if (variantCl) {
            this._popoverClasses = `${this._popoverClasses} ${variantCl}`;
        }
        if (!this.isNotifyHeader) {
            this._isNotifyHeader = ['error', 'info', 'warning'].some(vrnt => variantStr === vrnt);
        }
        switch(variantStr) {
            case 'error': {
                const errIcon = iconPath('utility:error', true);
                errIcon.svg = 'slds-icon slds-icon_small error-icon';
                this._iconConfig = errIcon;
                this._bodyCl = `${this._bodyCl} slds-popover_error__body slds-text-align_left`;
                break;
            }
            case 'warning': {
                const warningIcon = iconPath('utility:error', true);
                warningIcon.svg = 'slds-icon slds-icon_small error-icon';
                this._iconConfig = warningIcon;
                this._bodyCl = `${this._bodyCl} slds-popover_warning__body slds-text-align_left`;
                break;
            }
            case 'info': {
                const infoIcon = iconPath('utility:info', true);
                infoIcon.svg = 'slds-icon slds-icon_small info-icon';
                this._iconConfig = infoIcon;
                this._bodyCl = `${this._bodyCl} slds-popover_warning__body slds-text-align_left`;
                break;
            }
            default:
                break;
        }   

        if (this.isNotifyHeader && this.headerPadding) {
            this._applyVars('--header-padding-header', this.headerPadding);
        } 
    }

    // Show tooltip when user hovers over "Create RFQ" button
    openPopover() {
        const tip = this.template.querySelector('[data-id="popover"]');
        if (!tip) return;

        tip.classList.remove('slds-hide', 'slds-fall-into-ground');
        tip.classList.add('slds-rise-from-ground');
    }
    // Hide tooltip when mouser leaves "Create RFQ" button 
    closePopover() {
        const tip = this.template.querySelector('[data-id="popover"]');
        if (!tip) { return; }

        tip.classList.replace('slds-rise-from-ground', 'slds-fall-into-ground');

        // hide after the out animation finishes
        const done = () => {
            tip.classList.add('slds-hide');
            tip.removeEventListener('animationend', done);
            tip.removeEventListener('transitionend', done);
        };
        tip.addEventListener('animationend', done, { once: true });
        tip.addEventListener('transitionend', done, { once: true });
        this.dispatchEvent(new CustomEvent('popoverclose', { detail: 'closed' } ));
    }

    @api forceOpen() {
        const tip = this.template.querySelector('[data-id="popover"]');
        if (!tip) return;
        tip.classList.remove('slds-hide', 'slds-fall-into-ground');
        tip.classList.add('slds-rise-from-ground');
    }

    @api forceClose() {
        const tip = this.template.querySelector('[data-id="popover"]');
        if (!tip) { return; }
        tip.classList.add('slds-hide');
        tip.classList.replace('slds-rise-from-ground', 'slds-fall-into-ground');
    }

    // Apply Styles to the host
    _applyVars(cssVar, style) {
        if (!cssVar || !style) return;

        const el = this.template.host; // or a wrapper: this.template.querySelector('.root')
        el.style.setProperty(cssVar, style);
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
