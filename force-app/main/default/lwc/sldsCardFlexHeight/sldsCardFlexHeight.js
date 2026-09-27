/**
 * sldsCardFlexHeight — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/utils.
 * - Salesforce/platform modules: lwc, lightning/navigation.
 * - Bundle template: sldsCardFlexHeight.html; local styles: sldsCardFlexHeight.css. Salesforce SLDS
 * styling is expected.
 * - Shared CSS modules: c/sharedStylesGlobal.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-card-flex-height') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - cardLabel (card-label): Visible card title.
 *   Example: child.cardLabel = "Accounts";
 * - cardLabelSize (card-label-size): CSS size of the card title.
 *   Example: child.cardLabelSize = "1rem";
 * - isCustomHeader (is-custom-header): Renders the cardHeader slot instead of the standard title header.
 * Declared default: false.
 *   Example: child.isCustomHeader = true;
 * - minHeight (min-height): CSS minimum component height.
 *   Example: child.minHeight = "10rem";
 * - iconCl (icon-cl): Additional CSS class used on the card icon.
 *   Example: child.iconCl = "slds-icon-text-default";
 * - isFooter (is-footer): Enables the cardFooter slot. Declared default: false.
 *   Example: child.isFooter = true;
 * - isNested (is-nested): Uses nested card styling. Declared default: false.
 *   Example: child.isNested = true;
 * - isTable (is-table): Uses card layout intended for table content. Declared default: false.
 *   Example: child.isTable = true;
 * - hasActionSlot (has-action-slot): Enables the actionSlot header area. Declared default: false.
 *   Example: child.hasActionSlot = true;
 * - suppressCardPadding (suppress-card-padding): Removes the flexible card's normal padding. Declared
 * default: false.
 *   Example: child.suppressCardPadding = true;
 * - isTileCard (is-tile-card): Applies the flexible card's tile layout adjustments.
 *   Example: child.isTileCard = true;
 * - suppressHeader (suppress-header): Hides the standard header.
 *   Example: child.suppressHeader = true;
 * - addBoxShadowInset (add-box-shadow-inset): Adds the inset card shadow treatment. Declared default:
 * false.
 *   Example: child.addBoxShadowInset = true;
 * - isCommunity (is-community): Enables Experience Cloud-specific layout/navigation handling. Declared
 * default: false.
 *   Example: child.isCommunity = true;
 * - addBoxShadow (add-box-shadow): Adds the card shadow treatment. Declared default: false.
 *   Example: child.addBoxShadow = true;
 * - recordId (record-id): Salesforce record ID used for record context; supply a real ID from the parent.
 *   Example: child.recordId = this.recordId;
 * - objectApiName (object-api-name): Salesforce object API name used for metadata, navigation or record
 * operations.
 *   Example: child.objectApiName = "Account";
 * - headerColor (header-color): CSS card title color.
 *   Example: child.headerColor = "#181818";
 * - icon (icon): SLDS category:name icon identifier.
 *   Example: child.icon = "standard:account";
 * - iconSize (icon-size): SLDS icon size.
 *   Example: child.iconSize = "small";
 * - iconLabel (icon-label): Accessible/title text for the card icon.
 *   Example: child.iconLabel = "Account";
 * - cardBg (card-bg): CSS background color.
 *   Example: child.cardBg = "#ffffff";
 * - cardBorder (card-border): CSS border declaration.
 *   Example: child.cardBorder = "1px solid #c9c9c9";
 * - cardHeaderBorderStyle (card-header-border-style): CSS border style for the named region.
 *   Example: child.cardHeaderBorderStyle = "1px solid #c9c9c9";
 * - cardFooterBg (card-footer-bg): CSS card footer background.
 *   Example: child.cardFooterBg = "#f3f3f3";
 * - suppressHeaderMargin (suppress-header-margin): Removes header margin. Declared default: false.
 *   Example: child.suppressHeaderMargin = true;
 * - suppressBodyMarginTop (suppress-body-margin-top): Removes the named card body margin.
 *   Example: child.suppressBodyMarginTop = true;
 * - suppressBodyMarginBottom (suppress-body-margin-bottom): Removes the named card body margin.
 *   Example: child.suppressBodyMarginBottom = true;
 * - suppressFooterBorder (suppress-footer-border): Truthy CSS override written to --c-footer-border; use
 * none to remove it.
 *   Example: child.suppressFooterBorder = "none";
 * - footerBorder (footer-border): CSS footer border declaration.
 *   Example: child.footerBorder = "1px solid #c9c9c9";
 * - suppressCardShadow (suppress-card-shadow): Removes the card shadow.
 *   Example: child.suppressCardShadow = true;
 * - customCardShadow (custom-card-shadow): CSS box-shadow declaration.
 *   Example: child.customCardShadow = "0 1px 3px #0003";
 * - borderRadius (border-radius): CSS corner radius, including units.
 *   Example: child.borderRadius = "0.25rem";
 * - cardHeaderBg (card-header-bg): CSS background for the card header.
 *   Example: child.cardHeaderBg = "#f3f3f3";
 * - iconColorCl (icon-color-cl): Additional CSS class used on the card icon.
 *   Example: child.iconColorCl = "slds-icon-text-default";
 * - cardHeaderPadding (card-header-padding): CSS header padding.
 *   Example: child.cardHeaderPadding = "0.75rem";
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <div class="card-region">
 *         <c-slds-card-flex-height card-label="Accounts" object-api-name="Account"
 *             has-action-slot={enabled} is-footer={enabled}>
 *             <button slot="actionSlot" onclick={handleRefresh}>Refresh</button>
 *             <div slot="cardBody">Account summary</div>
 *             <div slot="cardFooter">{status}</div>
 *         </c-slds-card-flex-height>
 *     </div>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     enabled = true;
 *     status = 'Ready';
 *     handleRefresh() { this.status = 'Refresh requested'; }
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 * .card-region { display: flex; flex-direction: column; height: 24rem; min-height: 0; }
 * c-slds-card-flex-height { flex: 1; min-height: 0; }
 *
 * 4. Notes
 * - Use inside a height-constrained flex layout where the card body must grow or scroll. Custom-header
 * variant: set is-custom-header={enabled} and add slot="cardHeader" content. record-id plus
 * object-api-name enables record navigation. Public style properties configure the card's shadow, header,
 * body and footer.
 * - Slots: actionSlot, cardBody, cardFooter, cardHeader.
 */

/* ⭐⭐ --IMPORTANT-- REQUIRED HTML / CSS ⭐⭐

        👉 HTML:
                <div class="card-list__container"> 
                    <div class="card-list__grid grid__gap_large"> 
                        <!-- Cards Go Here --> 
                        <c-slds-card-flex-height></c-slds-card-flex-height>  ⭐ 3 cards
                        <c-slds-card-flex-height></c-slds-card-flex-height>
                        <c-slds-card-flex-height></c-slds-card-flex-height>
                    </div>
                </div>

        👉 CSS: 
                .card-list__container {
                    container-type: inline-size;
                }
                .card-list__grid {
                    display: grid;
                    grid-template-columns: repeat(3⭐, minmax(0, 1fr));    👈 Set the amount of cards in the grid 
                }
                .grid__gap_large {
                    gap: 1.5rem;
                }
                .feature-set-card {
                    flex-grow: 1;
                    position: relative;
                    overflow-wrap: anywhere;
                }
*/

/* Example Usage: 
    <div class="card-list__container"> 
        <div class="card-list__grid grid__gap_large"> 
            <c-slds-card-flex-height
                add-box-shadow="true"
                card-border="solid 1px var(--slds-g-color-border-base-2)"
                card-label="Industry Org Profile"
                card-label-size="18px"
                object-api-name="Account"
                is-footer="true"
            >
*/

const CARD_LABEL_SIZES = {
  "xx-large": "header-text_xx-large",
  "x-large": "header-text_x-large",
  large: "header-text_large",
  medium: "header-text_medium",
  small: "header-text_small",
  "x-small": "header-text_x-small",
  "xx-small": "header-text_xx-small",
  "xxx-small": "header-text_xxx-small"
};

import { LightningElement, api } from "lwc";
import {
  iconMap as ICON_MAP,
  iconPath,
  iconByObjectApiName,
  getErrorMessage,
  addPageRefRecord
} from "c/utils";

import { NavigationMixin } from "lightning/navigation"; // IMPORT NAVIGATION MIXIN

export default class SldsCardFlexHeight extends NavigationMixin(
  LightningElement
) {
  @api
  set cardLabel(val) {
    this._cardLabel = val;
    if (val?.toLowerCase()?.includes("unknown")) {
      this._applyVarsDirect(
        "--c-header-color",
        "var(--vg-color-weak, #636363)"
      );
    } else {
      this._applyVarsDirect(
        "--c-header-color",
        this.headerColor ?? "var(--slds-g-color-neutral-base-10, #181818)"
      );
    }
  }
  get cardLabel() {
    return this._cardLabel;
  }
  // xxx-small, xx-small, x-small, small, medium, large, x-large, xx-large
  @api cardLabelSize;
  @api isCustomHeader = false;
  @api minHeight;

  _iconConfig;

  @api iconCl;

  @api isFooter = false;
  @api isNested = false;
  @api isTable = false;
  @api hasActionSlot = false;

  @api suppressCardPadding = false;

  @api
  set isTileCard(val) {
    this._isTileCard = val;
    this.handleTileCard();
  }
  get isTileCard() {
    return this._isTileCard || false;
  }

  @api
  set suppressHeader(val) {
    this._suppressHeader = val;
    if (val) {
      this._applyVarsDirect("--slds-c-card-body-spacing-block-start", "0px");
    }
  }
  get suppressHeader() {
    return this._suppressHeader;
  }

  @api addBoxShadowInset = false;
  @api isCommunity = false;
  @api addBoxShadow = false;
  _headerLink;

  @api
  set recordId(value) {
    this._recordId = value;
    this.handleRecordIdLink();
  }
  get recordId() {
    return this._recordId;
  }

  @api
  set objectApiName(val) {
    if (val) {
      this._objectApiName = val;
      this.handleRecordIdLink();
      this._iconConfig = this.handleIcon(val);
      this.handleIconSize();
    }
  }
  get objectApiName() {
    return this._objectApiName;
  }

  @api
  set headerColor(val) {
    this._headerColor = val;
    if (val) {
      this._applyVarsDirect("--c-header-color", val);
    }
  }
  get headerColor() {
    return this._headerColor;
  }

  @api
  set icon(val) {
    if (val) {
      const category = val.split(":")[0];
      const sizeCl =
        category && category === "action"
          ? "slds-icon_xx-small"
          : "slds-icon_small";
      let iconConfig = iconPath(val, true);
      iconConfig.svg = `slds-icon ${sizeCl}`;
      if (iconConfig.container.includes("slds-current-color")) {
        iconConfig = {
          ...iconConfig,
          container: iconConfig.container.replace(
            "slds-current-color",
            "utility-icon"
          )
        };
      }
      this._iconConfig = iconConfig;
      this.handleIconSize();
    }
    this._icon = val;
  }
  get icon() {
    return this._icon;
  }

  @api
  set iconSize(value) {
    if (value) {
      this._iconSize = value === "medium" ? "" : `slds-icon_${value}`;

      this.handleIconSize();
    } else {
      this._iconSize = null;
    }
  }
  get iconSize() {
    return this._iconSize === ""
      ? ""
      : this._iconSize?.includes("slds")
        ? this._iconSize
        : null;
  }

  @api iconLabel;

  // Card style properties
  @api cardBg;
  @api cardBorder;
  @api cardHeaderBorderStyle;
  @api cardFooterBg;
  @api suppressHeaderMargin = false;

  @api
  set suppressBodyMarginTop(val) {
    this._suppressBodyMarginTop = val;
    if (val) {
      this._applyVarsDirect("--slds-c-card-body-spacing-block-start", "0px");
    }
  }
  get suppressBodyMarginTop() {
    return this._suppressBodyMarginTop;
  }
  @api
  set suppressBodyMarginBottom(val) {
    this._suppressBodyMarginBottom = val;
    if (val) {
      this._applyVarsDirect("--slds-c-card-body-spacing-block-end", "0px");
    }
  }
  get suppressBodyMarginBottom() {
    return this._suppressBodyMarginBottom;
  }

  @api
  set suppressFooterBorder(val) {
    this._suppressFooterBorder = val;
    if (val) {
      this._applyVarsDirect("--c-footer-border", val);
    }
  }
  get suppressFooterBorder() {
    return this._suppressFooterBorder;
  }

  @api
  set footerBorder(val) {
    this._footerBorder = val;
    this._applyVarsDirect("--c-footer-border", val);
  }
  get footerBorder() {
    return this._footerBorder;
  }

  @api
  set suppressCardShadow(val) {
    this._suppressCardShadow = val;
    if (val) {
      this._applyVarsDirect("--card-shadow", "none");
    }
  }
  get suppressCardShadow() {
    return this._suppressCardShadow;
  }
  @api
  set customCardShadow(val) {
    this._customCardShadow = val;
    if (val) {
      this._applyVarsDirect("--card-shadow", val);
    }
  }
  get customCardShadow() {
    return this._customCardShadow;
  }

  @api
  set borderRadius(val) {
    this._borderRadius = val;
    if (val) {
      this._applyVarsDirect("--c-border-radius", val);
      if (val === "var(--slds-g-radius-border-4)") {
        this._applyVarsDirect("--c-border-complementary", "none");
      } else if (val === "var(--slds-g-radius-border-3)") {
        this._applyVarsDirect("--c-border-complementary", "none");
      }
    }
  }
  get borderRadius() {
    return this._borderRadius;
  }

  @api
  set cardHeaderBg(value) {
    this._cardHeaderBg = value;
    if (value) {
      this._applyVarsDirect("--c-card-header-bg", value);
    }
  }
  get cardHeaderBg() {
    return this._cardHeaderBg;
  }

  @api
  set iconColorCl(value) {
    this._iconColorCl = value;
    this.handleIconColorCl();
  }
  get iconColorCl() {
    return this._iconColorCl;
  }

  @api
  set cardHeaderPadding(value) {
    this._cardHeaderPadding = value;
    if (value) {
      this._applyVarsDirect("--c-card-header-padding", value);
    }
  }
  get cardHeaderPadding() {
    return this._cardHeaderPadding;
  }

  handleIconColorCl() {
    if (
      this.iconColorCl &&
      this._iconConfig?.svg &&
      !this._iconConfig?.svg?.includes(this.iconColorCl)
    ) {
      this._iconConfig = {
        ...this._iconConfig,
        svg: `${this._iconConfig.svg} ${this.iconColorCl}`
      };
    }
  }

  // Handle "Icon Size" public property
  handleIconSize() {
    if (
      !this._iconConfig?.svg ||
      this.iconSize === null ||
      this.iconSize === undefined
    ) {
      return;
    }
    const toReplace = this._iconConfig.svg.includes("slds-icon_small")
      ? "slds-icon_small"
      : "slds-icon_xx-small";

    this._iconConfig = {
      ...this._iconConfig,
      svg: this._iconConfig.svg.replace(toReplace, this.iconSize)
    };
    this.handleIconColorCl();
  }
  // Get the SOjbect Icon
  handleIcon() {
    try {
      // ------------- Object Icon ------------- \\
      const iconObj = iconByObjectApiName(this.objectApiName, null, true);
      const iconBaseConfig = {
        iconType: iconObj.iconName.split(":")[0],
        iconName: iconObj.iconName.split(":")[1],
        iconClass: iconObj?.iconClass ?? ""
      };

      let iconContainerClass = iconBaseConfig.iconName.includes("_")
        ? iconBaseConfig.iconName.replaceAll("_", "-")
        : iconBaseConfig.iconName;
      // --------------------------------------- \\

      if (iconContainerClass.includes("slds-current-color")) {
        iconContainerClass.replace("slds-current-color", "");
      }

      return {
        container: `slds-icon_container slds-icon-${iconBaseConfig.iconType}-${iconContainerClass} ${iconBaseConfig.iconClass ?? ""}`,
        svg: `slds-icon slds-icon_small ${iconBaseConfig.iconClass ?? ""}`,
        icon: ICON_MAP[iconBaseConfig.iconType][iconBaseConfig.iconName]
      };
    } catch (error) {
      this.showToast(
        "Error in handleIcon() of sldsCard.js: ",
        getErrorMessage(error),
        "error"
      );
      return null;
    }
  }
  handleRecordIdLink() {
    if (!this.objectApiName || !this.recordId) return;
    if (!this._headerLink) {
      const singleObjArr = [
        { Id: this.recordId, objectApiName: this.objectApiName }
      ];
      Promise.resolve().then(async () => {
        this._headerLink = await addPageRefRecord(singleObjArr, this);
      });
    }
  }

  renderedCallback() {
    this._applyVars();
  }

  get cardClasses() {
    return `slds-card ${this.isNested ? "slds-card_boundary" : ""}`;
  }

  // Call this function in renderedCallback  --> e.g. renderedCallback() {this.applyVars();}
  _stylesApplied = false;
  // Apply Styles to the host
  _applyVars() {
    if (this._stylesApplied) return;
    const el = this.template.host; // or a wrapper: this.template.querySelector('.root')

    if (this.cardLabelSize) {
      const cardCl = CARD_LABEL_SIZES[this.cardLabelSize];
      if (cardCl) {
        const cardLabel = this.template.querySelector(
          ".slds-card__header-title"
        );
        if (cardLabel) {
          cardLabel.classList.replace("slds-card__header-title", cardCl);
        }
      }
    }

    if (this.addBoxShadowInset) {
      const sldsCard = this.template.querySelector(".slds-card");
      if (sldsCard) {
        this._applyVarsDirect("--card-shadow", "none");
        sldsCard.classList.add("inset-card");
      }
    }

    if (this.suppressCardPadding) {
      const cardBody = this.template.querySelector(".slds-card__body");
      if (cardBody) {
        cardBody.style.margin = "0px";
        cardBody.style.padding = "0px";
      }
    }
    if (this.suppressHeaderMargin) {
      const header = this.template.querySelector('[data-id="card-header"]');
      if (header) {
        header.style.marginBottom = "0px";
      }
    }

    this.handleTileCard();

    if (this.iconCl) {
      const iconContainer = this.template.querySelector(
        '[data-id="iconContainer"]'
      );
      if (iconContainer) iconContainer.classList.add(this.iconCl);
    }

    if (this.isTable) {
      const cardBody = this.template.querySelector(".slds-card__body");
      if (cardBody) {
        cardBody.style.paddingLeft = "0px";
        cardBody.style.paddingRight = "0px";
      }
    }

    if (this.isCommunity) {
      const cardBody = this.template.querySelector(".slds-card__body");
      if (cardBody) cardBody.style.marginTop = "0px";
    }
    if (this.cardBorder) {
      el.style.setProperty("--card-border", this.cardBorder);
    }

    if (this.cardBg)
      el.style.setProperty("--slds-c-card-color-background", this.cardBg);
    if (this.cardHeaderBorderStyle) {
      el.style.setProperty(
        "--c-card-header-border-style",
        this.cardHeaderBorderStyle
      );
      if (!this.cardHeaderPadding) {
        this._applyVarsDirect("--c-card-header-padding", "0.5rem");
      }
    }
    if (this.isFooter && this.cardFooterBg) {
      el.style.setProperty("--c-card-footer-bg", this.cardFooterBg);
    }
    if (this.minHeight) el.style.setProperty("--min-height", this.minHeight);

    if (this.addBoxShadow && !this.suppressCardShadow) {
      el.style.setProperty("--card-shadow", "0 2px 2px 0 rgba(0, 0, 0, 0.10)");
    }

    this._stylesApplied = true;
  }

  // Apply Styles to the host 👉 Can pass 1.Array of Arrays   2.Array of Object   3.Strings
  _applyVarsDirect(cssVar, varStyle = null) {
    // Check that CSS var starts with '--' and has a non-null stlye
    const isValid = (cssVarP, varStyleP) => {
      return (
        typeof cssVarP === "string" &&
        typeof varStyleP === "string" &&
        cssVarP?.startsWith("--") &&
        varStyleP
      );
    };

    // Get Host elements
    const el = this.template.host;

    if (Array.isArray(cssVar)) {
      // Handle Array of vars
      cssVar.forEach((hostVar) => {
        if (Array.isArray(hostVar) && isValid(hostVar[0], hostVar[1])) {
          // Handle Array structure  (CSS var at index 0)
          el.style.setProperty(hostVar[0], hostVar[1]);
        } else if (
          typeof hostVar === "object" &&
          isValid(hostVar.cssVar, hostVar.varStyle)
        ) {
          // Handle Object structure (cssVar & varStyle keys)
          el.style.setProperty(hostVar.cssVar, hostVar.varStyle);
        }
      });
    } else if (isValid(cssVar, varStyle)) {
      // Handle string arguments
      el.style.setProperty(cssVar, varStyle);
    }
  }

  handleTileCard() {
    const cardHeader = this.template.querySelector('[data-id="card-header"]');
    if (cardHeader) {
      if (this.isTileCard) {
        // Remove tile-margin from the card
        cardHeader.classList.replace(
          "slds-card__header",
          "slds-card-flex-height__header"
        );
      } else if (
        cardHeader.classList.contains("slds-card-flex-height__header")
      ) {
        // Restore card-margin if not tile
        cardHeader.classList.replace(
          "slds-card-flex-height__header",
          "slds-card__header"
        );
      }
    }
  }

  toastObj;
  showToast(title, message, variant, mode = null) {
    const modeP = mode
      ? mode
      : variant === "success"
        ? "dismissible"
        : "sticky";

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
