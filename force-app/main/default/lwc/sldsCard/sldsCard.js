/**
 * sldsCard — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/utils.
 * - Salesforce/platform modules: lwc.
 * - Template children (including conditional UI): c-toast-lwc.
 * - Bundle template: sldsCard.html; local styles: sldsCard.css. Salesforce SLDS styling is expected.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-card') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - cardLabel (card-label): Visible card title.
 *   Example: child.cardLabel = "Accounts";
 * - cardLabelSize (card-label-size): CSS size of the card title.
 *   Example: child.cardLabelSize = "1rem";
 * - flexHeight (flex-height): Compatibility property: enables the basic card's flexible-height class;
 * currently stored/exposed but not consumed by this implementation. Declared default: false.
 *   Example: child.flexHeight = true;
 * - bodyOnly (body-only): Renders only cardBodyAlt without the usual header/footer. Declared default:
 * false.
 *   Example: child.bodyOnly = true;
 * - minHeight (min-height): CSS minimum component height.
 *   Example: child.minHeight = "10rem";
 * - isFooter (is-footer): Enables the cardFooter slot. Declared default: false.
 *   Example: child.isFooter = true;
 * - isNested (is-nested): Uses nested card styling. Declared default: false.
 *   Example: child.isNested = true;
 * - headerLink (header-link): Renders the basic card title as an anchor; current template uses href="#".
 *   Example: child.headerLink = true;
 * - addBoxShadow (add-box-shadow): Adds the card shadow treatment. Declared default: false.
 *   Example: child.addBoxShadow = true;
 * - objectApiName (object-api-name): Salesforce object API name used for metadata, navigation or record
 * operations.
 *   Example: child.objectApiName = "Account";
 * - icon (icon): SLDS category:name icon identifier.
 *   Example: child.icon = "standard:account";
 * - iconLabel (icon-label): Accessible/title text for the card icon.
 *   Example: child.iconLabel = "Account";
 * - cardBg (card-bg): CSS background color.
 *   Example: child.cardBg = "#ffffff";
 * - cardBorder (card-border): CSS border declaration.
 *   Example: child.cardBorder = "1px solid #c9c9c9";
 * - cardHeaderBg (card-header-bg): CSS background for the card header.
 *   Example: child.cardHeaderBg = "#f3f3f3";
 * - cardHeaderBorderStyle (card-header-border-style): CSS border style for the named region.
 *   Example: child.cardHeaderBorderStyle = "1px solid #c9c9c9";
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-slds-card card-label="Accounts" object-api-name="Account" is-footer={enabled}>
 *         <div slot="cardBody">Account summary</div>
 *         <div slot="cardFooter">Updated today</div>
 *     </c-slds-card>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     enabled = true;
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Use for a simple titled container. The footer requires is-footer. Body-only variant: set
 * body-only={enabled} and put content in slot="cardBodyAlt" instead of cardBody. headerLink currently
 * renders href="#"; it is not a configurable navigation URL.
 * - Slots: cardBody, cardBodyAlt, cardFooter.
 */

import { LightningElement, api } from 'lwc';
import {iconMap as ICON_MAP, iconPath, iconByObjectApiName, getErrorMessage} from 'c/utils';

export default class SldsCard extends LightningElement {
    @api cardLabel;    
    @api cardLabelSize;
    @api flexHeight = false;
    @api bodyOnly = false;
    @api minHeight;

    _iconConfig;

    
    @api isFooter = false;
    @api isNested = false;
    @api headerLink;

    @api addBoxShadow = false;

    @api
    set objectApiName(val) {
        if (val) {
            this._objectApiName = val;
            this._iconConfig = this.handleIcon(val);
        }
    }
    get objectApiName() {
        return this._objectApiName;
    }

    @api 
    set icon(val) {
        if (val) {
            const category = val.split(':')[0];
            const sizeCl = category && category === 'action' ? 'slds-icon_xx-small' : 'slds-icon_small';
            const iconConfig = iconPath(val, true);
            iconConfig.svg = `slds-icon ${sizeCl}`;
            this._iconConfig = iconConfig;
        }
        this._icon = val;
    }
    get icon() {
        return this._icon;
    }

    @api iconLabel;


    // Card style properties 
    @api cardBg;
    @api cardBorder;
    @api cardHeaderBg;
    @api cardHeaderBorderStyle;

    // Get the SOjbect Icon
    handleIcon() {
        try {
            // ------------- Object Icon ------------- \\
            const iconObj = iconByObjectApiName(this.objectApiName, null, true);
            const iconBaseConfig = {
                iconType: iconObj.iconName.split(':')[0], 
                iconName: iconObj.iconName.split(':')[1], 
                iconClass: iconObj?.iconClass ?? ''
            };

            const iconContainerClass = iconBaseConfig.iconName.includes('_') 
                ? iconBaseConfig.iconName.replaceAll('_', '-') 
                : iconBaseConfig.iconName;
            // --------------------------------------- \\ 

            return {
                container: `slds-icon_container slds-icon-${iconBaseConfig.iconType}-${iconContainerClass} ${iconBaseConfig.iconClass ?? ''}`,
                svg: `slds-icon slds-icon_small ${iconBaseConfig.iconClass ?? ''}`,
                icon: ICON_MAP[iconBaseConfig.iconType][iconBaseConfig.iconName]
            }
        } catch(error) {
            this.showToast('Error in handleIcon() of sldsCard.js: ', getErrorMessage(error), 'error');
        }
    }

    renderedCallback() {
        if (this.cardLabelSize) {
            const cardLabel = this.template.querySelector('[data-id="cardLabel"]')
            if (cardLabel) {
                cardLabel.style = `font-size: ${this.cardLabelSize}`;
            }
        }
        if (this.cardBorder) {
            const el = this.template.host; // or a wrapper: this.template.querySelector('.root')
            el.style.setProperty('--card-border', this.cardBorder);
        }
        this._applyVars();
    }

    get cardClasses() {
        return `slds-card ${this.isNested ? 'slds-card_boundary' : ''} ${this.addBoxShadow ? 'card-shadow' : ''}`;
    }

    // Call this function in renderedCallback  --> e.g. renderedCallback() {this.applyVars();}
    _stylesApplied = false;
    // Apply Styles to the host
    _applyVars() {
        if (this._stylesApplied) return;
        const el = this.template.host; // or a wrapper: this.template.querySelector('.root')

        if (this.cardBorder) el.style.setProperty('--card-border', this.cardBorder);
        if (this.cardBg) el.style.setProperty('--slds-c-card-color-background', this.cardBg);
        if (this.cardHeaderBg) el.style.setProperty('--c-card-header-bg', this.cardHeaderBg);
        if (this.cardHeaderBorderStyle) {
            el.style.setProperty('--c-card-header-border-style', this.cardHeaderBorderStyle);
            this.template.querySelector('.slds-card__header').classList.add('slds-p-vertical_small');
        }
        if (this.minHeight) el.style.setProperty('--min-height', this.minHeight);
        this._stylesApplied = true;
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