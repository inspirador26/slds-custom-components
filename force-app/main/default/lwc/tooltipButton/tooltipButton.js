import { LightningElement, api } from 'lwc';
import { publicPropertyToBool, iconPath, getErrorMessage } from 'c/utils';



/* Example Usage

    VARIANT NOTES:  
        • variant="header"           👉 header-label="My Header Label" 
        • variant="headerIcon"       👉 header-label="My Header Label"
        • variant="simple"           👉 can exclude 'variant' property 
    
    PUBLIC PROPERTY NOTES:
        • shrink-nubbin="true"       👉 shrinks the nubbin 
        • tip-width="<x>rem;"        👉 sets tooltip width (default is auto, wraps at 20rem)
        

    ☑️ 'headerIcon' Variant:  
            HTML:
                <c-tooltip-button
                    variant="headerIcon"
                    header-label="Usage Tips" 
                >
                    <!--⭐ Tooltip Trigger Slot (slot="tipTrigger")-->
                    <lightning-button 
                        slot="tipTrigger"
                        variant="brand"
                        label="Create RFQ"
                        onclick={getCheckboxesForRfq}
                    ></lightning-button>
                    <!--//////////////////////////-->

                    <!--⭐ Icon Slot (slot="icon")-->
                    <svg slot="icon"
                        class="slds-icon slds-icon_small slds-icon-text-default" 
                        aria-hidden="true"
                    > 
                        <use xlink:href={iconMap.utility.info_alt}></use>
                    </svg>
                    <!--/////////////-->

                    <!--⭐ Text Body Slot (slot="headerBody")-->
                    <div slot="headerBody"> 
                        <p class="slds-p-vertical_xx-small slds-text-body_regular"><span style="font-weight: bold">Select group of options: </span> Hold shift while selecting options.</p>
                        <p class="slds-p-vertical_xx-small slds-text-body_regular"><span style="font-weight: bold">Remove group of options: </span> Click, hold, and drag across the pills to select them, then click Remove.</p>
                        <p class="slds-p-vertical_xx-small slds-text-body_regular"><span style="font-weight: bold">Jump to option: </span> Type the label of the option.</p>
                    </div> 
                    <!--/////////////////-->
                </c-tooltip-button>

    ☑️ 'header' Variant:  
            HTML:
                <c-tooltip-button
                    variant="header"
                    header-label="Usage Tips"  
                >
                    <!--⭐ Tooltip Trigger Slot (slot="tipTrigger")-->
                    <lightning-button 
                        slot="tipTrigger"
                        variant="brand"
                        label="Create RFQ"
                        onclick={getCheckboxesForRfq}
                    ></lightning-button>
                    <!--//////////////////////////-->


                    <!--⭐ Text Body Slot (slot="headerBody")-->
                    <div slot="headerBody"> 
                        <p class="slds-p-vertical_xx-small slds-text-body_regular"><span style="font-weight: bold">Select group of options: </span> Hold shift while selecting options.</p>
                        <p class="slds-p-vertical_xx-small slds-text-body_regular"><span style="font-weight: bold">Remove group of options: </span> Click, hold, and drag across the pills to select them, then click Remove.</p>
                        <p class="slds-p-vertical_xx-small slds-text-body_regular"><span style="font-weight: bold">Jump to option: </span> Type the label of the option.</p>
                    </div> 
                    <!--/////////////////-->
                </c-tooltip-button>

    ☑️ 'simple' Variant (default):  
        HTML:
            <c-tooltip-button>
                <!--⭐ Tooltip Trigger Slot (slot="tipTrigger")-->
                <lightning-button 
                    slot="tipTrigger"
                    variant="brand"
                    label="Create RFQ"
                    onclick={getCheckboxesForRfq}
                ></lightning-button>
                <!--//////////////////////////-->

                <!--⭐ Text Body Slot (slot="simpleVariantBody")-->
                <div slot="simpleVariantBody"> 
                    <p class="slds-p-vertical_xx-small slds-text-body_regular"><span style="font-weight: bold">Select group of options: </span> Hold shift while selecting options.</p>
                    <p class="slds-p-vertical_xx-small slds-text-body_regular"><span style="font-weight: bold">Remove group of options: </span> Click, hold, and drag across the pills to select them, then click Remove.</p>
                    <p class="slds-p-vertical_xx-small slds-text-body_regular"><span style="font-weight: bold">Jump to option: </span> Type the label of the option.</p>
                </div> 
                <!--/////////////////-->
            </c-tooltip-button>

*/



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


function handlePopoverNeutral(popoverCls) {
    const hasNeutral = popoverCls.includes('popover-neutral');

    if (hasNeutral) {
        return `${popoverCls} popover-neutral`;
    }
    return popoverCls;

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

export default class TooltipButton extends LightningElement {

    _hasIcon = false;
    _hasHeader = false;
    _isConventionalVariant = false;
    _isMouseOver = false;
    _isTriggerFocused = false;

    constructor() {
        super();
        this._handleHostFocusIn = this.handleHostFocusIn.bind(this);
        this._handleHostFocusOut = this.handleHostFocusOut.bind(this);
        this._handleHostKeyDown = this.handleHostKeyDown.bind(this);
    }

    connectedCallback() {
        this._syncFocusListeners();
        this.addEventListener('keydown', this._handleHostKeyDown);
    }



    @api headerLabel;

    _isListeningForFocus = false;
    _stealFocus = false;
    @api
    set stealFocus(value) {
        this._stealFocus = publicPropertyToBool(value);
        this._syncFocusListeners();
        if (!this._stealFocus) {
            this._isTriggerFocused = false;
        }
    }
    get stealFocus() {
        return this._stealFocus;
    }

    _wrapperCl = 'slds-is-relative';
    @api // 👉 If container already has relative container set this to true
    set suppressRelative(value) {
        this._suppressRelative = value;
        if (value) {
            this._wrapperCl = '';
        }
    }
    get suppressRelative() {
        return this._suppressRelative;
    }


    // Always display tooltip when suppressTooltip is false
    @api showAlways = false;

    // if true --> suppress tooltip on first hover when _suppressTooltip is false
    @api suppressInstantSwitch = false;
    _suppressTooltip = false;
    @api // If true --> Do not show the tooltip every time the element is hovered
    set suppressTooltip(val) {
        this._suppressTooltip = val;
        if (val) {
            this.forceTipHide();
        } else if (val === false || val === "false") {
            if (this.showAlways) {
                this.forceTipShow();
            } else if ((this._isMouseOver || this._isTriggerFocused) && !this.suppressInstantSwitch) {
                this.forceTipShow();
            }
        }
    }
    get suppressTooltip() {
        return this._suppressTooltip || false;
    }

    // variant options: 'simple', 'header', 'headerIcon', 'warning', 'error'
    // default is 'simple'
    @api
    set variant(val) {
        switch(val) {
            case 'header':
                this._hasHeader = true;
                this._hasIcon = false;
                break;
            case 'headerIcon':
                this._hasHeader = true;
                this._hasIcon = true;
                break;
            case 'simple':
                this._hasHeader = false;
                this._hasIcon = false; 
                break;
            case 'error':
                this.handleConventionalVariants(val)
                break;
            case 'warning':
                this.handleConventionalVariants(val);
                break;
            default:
                this._hasHeader = false;
                this._hasIcon = false;
        }
        this._variant = val;
    }
    get variant() {
        return  this._variant;
    }

    _popoverClasses = 'slds-popover slds-popover_tooltip slds-hide slds-nubbin_bottom nubbin-bottom-center';
    _nubbin = 'slds-nubbin_bottom';
    @api // Options: 'bottom', 'bottom-right', 'bottom-left', 'top', 'top-right', 'top-left'
    set nubbin(val) {
        const nubbin = GET_NUBBIN(val);
        const nubbinCl = NUBBIN_CL_MAP[nubbin];
        const popoverPosCl = POPOVER_POSITION_MAP[nubbin];
        const popoverCls = `slds-popover slds-popover_tooltip slds-hide ${popoverPosCl} ${nubbinCl}`;
        this._popoverClasses = handlePopoverNeutral(popoverCls);
        this._nubbin = nubbin;
    }
    get nubbin() {
        return this._nubbin ?? 'slds-nubbin_bottom';
    }

    @api
    set tipWidth(val) {
        this._tipWidth = val;
        if (val) {
            this._applyVarsDirect('--tip-width', val);
        }
    }
    get tipWidth() {
        return this._tipWidth ?? '20rem';
    }

    @api
    set adjustHorizontal(value) {
        const adjustment = normalizeAdjustment(value);
        this._adjustHorizontal = adjustment ?? '0px';
        this._applyVarsDirect('--tooltip-adjust-x', this._adjustHorizontal);
    }
    get adjustHorizontal() {
        return this._adjustHorizontal ?? '0px';
    }

    @api
    set adjustVertical(value) {
        const adjustment = normalizeAdjustment(value);
        this._adjustVertical = adjustment ?? '0px';
        this._applyVarsDirect('--tooltip-adjust-y', invertAdjustment(this._adjustVertical));
    }
    get adjustVertical() {
        return this._adjustVertical ?? '0px';
    }

    _iconConfig;
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


    @api
    set headerBg(value) {
        this._headerBg = value;
        if  (value) {
            this._applyVarsDirect('--vg-tooltip-header-color-background', value);
        }
    }
    get headerBg() {
        return this._headerBg;
    }
    @api
    set headerColor(value) {
        this._headerColor = value;
        if (value) this._applyVarsDirect('--vg-tooltip-header-text-color', value);
    }
    get headerColor() {
        return this._headerColor;
    }
    @api
    set bodyBg(value) {
        this._bodyBg = value;
        if  (value) {
            this._applyVarsDirect('--slds-c-tooltip-color-background', value);
        }
    }
    get bodyBg() {
        return this.bodyBg;
    }
    @api
    set bodyColor(value) {
        this._bodyColor = value;
        if  (value) {
            this._applyVarsDirect('--slds-c-tooltip-text-color', value);
        }
    }
    get bodyColor() {
        return this._bodyColor;
    }

    _popoverBodyCl = 'slds-popover__body';
    // Handle Error/Warning variants
    handleConventionalVariants(variantStr) {
        if  (variantStr === 'error' || variantStr === 'warning') {
            this._hasHeader = false;
            this._hasIcon = false;
            this._applyVarsDirect('--slds-c-tooltip-color-background', 'var(--slds-g-color-neutral-base-100, #fff)');
            this._applyVarsDirect('--slds-c-tooltip-text-color', 'var(--slds-g-color-neutral-base-10, #181818)');
            this._popoverClasses = `${this._popoverClasses} popover-neutral`;
            this._isConventionalVariant = true;
        }
        if (variantStr === 'warning') {
            const iconConfig = iconPath('utility:warning', true);
            iconConfig.svg = 'slds-icon slds-icon_small warning-icon';
            this._iconConfig = iconConfig;
            this._popoverBodyCl = 'slds-popover__body slds-popover_warning__body';
            this._applyVarsDirect('--vg-tooltip-header-text-color', 'var(--vg-color-base-dark-1, #181818)');
            this._applyVarsDirect('--vg-tooltip-header-color-background', 'var(--slds-g-color-warning-base-60, #fe9339)');
        }
        if (variantStr === 'error') {
            const iconConfig = iconPath('utility:error', true);
            iconConfig.svg = 'slds-icon slds-icon_small error-icon';
            this._iconConfig = iconConfig;
            this._applyVarsDirect('--vg-tooltip-header-color-background', 'var(--slds-g-color-error-base-30, #ba0517)');
            this._applyVarsDirect('--vg-tooltip-header-text-color', 'var(--slds-g-color-neutral-base-100, #fff)');

        }
    }


    // Show tooltip when user hovers over "Create RFQ" button
    handleHelpEnter() {
        if (this.showAlways) return;
        this._isMouseOver = true;
        if (this._suppressTooltip) return;

        this._showTip();
    }

    // Hide tooltip when mouser leaves "Create RFQ" button
    handleHelpLeave() {
        if (this.showAlways) return;
        this._isMouseOver = false;
        if (this._suppressTooltip) return;
        if (this._isTriggerFocused) return;

        this._hideTip();
    }

    handleTriggerFocusIn() {
        if (!this.stealFocus) return;
        if (this.showAlways) return;
        this._isTriggerFocused = true;
        if (this._suppressTooltip) return;

        this._showTip();
    }

    handleTriggerFocusOut() {
        if (!this.stealFocus) return;
        if (this.showAlways) return;
        this._isTriggerFocused = false;
        if (this._suppressTooltip) return;
        if (this._isMouseOver) return;

        this._hideTip();
    }

    handleHostFocusIn(event) {
        if (!this.stealFocus) return;
        if (!this._isTipTriggerFocusEvent(event)) return;

        this.handleTriggerFocusIn();
    }

    handleHostFocusOut(event) {
        if (!this.stealFocus) return;
        if (!this._isTipTriggerFocusEvent(event)) return;
        if (this._isElementInTipTrigger(event.relatedTarget)) return;

        this.handleTriggerFocusOut();
    }

    handleHostKeyDown(event) {
        if (event.key !== 'Escape') return;
        if (!this._isTipTriggerFocusEvent(event)) return;

        event.preventDefault();
        event.stopPropagation();
        this._isTriggerFocused = false;
        this._hideTip();
    }

    disconnectedCallback() {
        this.removeEventListener('focusin', this._handleHostFocusIn);
        this.removeEventListener('focusout', this._handleHostFocusOut);
        this.removeEventListener('keydown', this._handleHostKeyDown);
        this._isListeningForFocus = false;
    }

    _syncFocusListeners() {
        if (!this.isConnected) return;

        if (this.stealFocus && !this._isListeningForFocus) {
            this.addEventListener('focusin', this._handleHostFocusIn);
            this.addEventListener('focusout', this._handleHostFocusOut);
            this._isListeningForFocus = true;
        } else if (!this.stealFocus && this._isListeningForFocus) {
            this.removeEventListener('focusin', this._handleHostFocusIn);
            this.removeEventListener('focusout', this._handleHostFocusOut);
            this._isListeningForFocus = false;
        }
    }

    _isTipTriggerFocusEvent(event) {
        const composedPath = event.composedPath?.() ?? [];

        return this._isElementInTipTrigger(event.target)
            || composedPath.some((element) => this._isElementInTipTrigger(element));
    }

    _isElementInTipTrigger(element) {
        const tipTrigger = element?.slot === 'tipTrigger'
            ? element
            : element?.closest?.('[slot="tipTrigger"]');

        return Boolean(tipTrigger && this.template.host.contains(tipTrigger));
    }

    @api forceTipHide() {
        this._hideTip();
    }

    @api forceTipShow() {
        this._showTip();
    }

    _hideTip() {
        const tip = this.template.querySelector('[data-id="help-tooltip"]');
        if (!tip) { return; }

        tip.classList.remove('slds-rise-from-ground');
        tip.classList.add('slds-fall-into-ground');

        // hide after the out animation finishes
        const done = () => {
            tip.classList.add('slds-hide');
            tip.removeEventListener('animationend', done);
            tip.removeEventListener('transitionend', done);
        };
        tip.addEventListener('animationend', done, { once: true });
        tip.addEventListener('transitionend', done, { once: true });
    }

    _showTip() {
        const tip = this.template.querySelector('[data-id="help-tooltip"]');
        if (!tip) return;
        tip.classList.remove('slds-hide', 'slds-fall-into-ground');
        tip.classList.add('slds-rise-from-ground');
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
