import { LightningElement, api, track } from "lwc";
import {
  iconMap as ICON_MAP,
  publicPropertyToBool,
  positionMenuDropdownPopoverV3,
  getErrorMessage
} from "c/utils";

const MENU_SIZES = {
  xxSmall: "slds-dropdown_xx-small",
  xSmall: "slds-dropdown_x-small",
  small: "slds-dropdown_small",
  medium: "slds-dropdown_medium",
  large: "slds-dropdown_large"
};
const TABBABLE_SELECTOR = [
  '[role="menuitem"][tabindex]:not([tabindex="-1"])',
  "button:not([disabled])",
  '[tabindex]:not([tabindex="-1"]):not([disabled])'
].join(",");
const HAS_OWN = Object.prototype.hasOwnProperty;

function focusWithoutScroll(el) {
  if (!el || typeof el.focus !== "function") return;

  try {
    el.focus({ preventScroll: true });
  } catch {
    el.focus();
  }
}

const FOCUS_ITEM = (menuItems, toFocusIdx, cmp) => {
  try {
    menuItems.forEach((item, idx) => {
      if (idx === toFocusIdx) {
        item.classList.add("slds-has-focus");
        focusWithoutScroll(item);
      } else {
        item.classList.remove("slds-has-focus");
      }
    });
  } catch (error) {
    cmp.showToast(
      "Error in FOCUS_ITEM() of sldsMenuPopoverMenu.js",
      getErrorMessage(error),
      "error"
    );
  }
};

function isGroupOption(option) {
  return option && typeof option === "object" && HAS_OWN.call(option, "group");
}

function getOptionKey(option, index, prefix) {
  const identifier = option?.value ?? option?.label ?? option?.group ?? index;
  return `${prefix}-${index}-${identifier}`;
}

function getGroupId(option, index, prefix) {
  const identifier = String(option?.group ?? index)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${prefix}-group-${index}${identifier ? `-${identifier}` : ""}`;
}

const BASE_CHECK_ICON_CL = 'slds-icon slds-icon slds-icon_xx-small brand-icon slds-icon-text-default';
const BASE_ICON_CL = 'slds-icon slds-icon_xx-small slds-icon-text-default slds-m-left_small slds-shrink-none';

function resolveIcon(iconName, baseCl=BASE_ICON_CL) {
    const baseObj = { icon: null, iconClass: baseCl};

    if (!iconName) return baseObj;

    const parts = iconName.split(':');

    if (parts?.length === 2) {
        const [category, name] = parts;
        return {
            icon: ICON_MAP[category][name],
            iconClass: baseCl
        }
    }

    if (parts?.length === 3) {
        const [category, name, cl] = parts;
        return {
            icon: ICON_MAP[category][name],
            iconClass: cl
        }
    }
    return baseObj;
}

function normalizeOption(option, index, prefix, value, isCheck, isMultiCheck) {
    const { icon, iconClass } = resolveIcon(option?.icon ?? null);

    if (isGroupOption(option)) {
        return {
            ...option,
            iconClass,
            icon,
            isGroup: true,
            groupLabel: option.group,
            groupId: getGroupId(option, index, prefix),
            optionKey: getOptionKey(option, index, `${prefix}-group`)
        };
    }

    const normalized = {
        ...option,
        icon,
        iconClass,
        optionKey: getOptionKey(option, index, prefix)
    };

    if (Array.isArray(option?.options)) {
        normalized.options = option.options.map((subOption, subIndex) =>
        normalizeOption(
            subOption,
            subIndex,
            `${normalized.optionKey}-sub`,
            value,
            isCheck,
            isMultiCheck
        )
        );
    }

    if (isMultiCheck) {
        normalized.isSelected = value.includes(option.value);
    } else if (isCheck) {
        normalized.isSelected = String(option.value) === String(value);
    }

    return normalized;
}

function isMenuComponent(ele) {
    return ele?.dataset?.component === 'sldsMenuPopoverMenu';
}

export default class SldsMenuPopoverMenu extends LightningElement {
  iconMap = ICON_MAP;
  _isMultiCheck = false;
  _menuItems;
  navMode;

  _value;
  @api previousTabTarget;
  @api nextTabTarget;
  @api selectionCallback;
  @api requestCloseCallback;
  @api menuTabCallback;
  @api menuTabOutCallback;

  @api checkedIconFn;

  @api isSave = false;

  @api
  set options(val) {
    this._options = val;
  }
  get options() {
    return this._options ?? [];
  }
  @api
  set value(val) {
    if (val && Array.isArray(val)) {
      this._isMultiCheck = true;
    }
    this._value = val;
  }
  get value() {
    return this._value;
  }

  @api menuId;

  _isLeft = false;
  @api set isLeft(v) {
    this._isLeft = publicPropertyToBool(v);
  }
  get isLeft() {
    return this._isLeft;
  }

  _menuSize;
  @api set menuSize(v) {
    this._menuSize = v;
  }
  get menuSize() {
    return this._menuSize;
  }

  _isCheck = false;
  @api set isCheck(v) {
    this._isCheck = publicPropertyToBool(v);
  }
  get isCheck() {
    return this._isCheck;
  }

  @api positionAgainst(buttonEl, isLeft, gap = 4) {
    const dropdown =
      this.template.querySelector('[data-element="dropdown"]') ||
      this.template.querySelector(".slds-dropdown");
    if (dropdown && buttonEl) {
      const positioned = positionMenuDropdownPopoverV3(
        buttonEl,
        dropdown,
        isLeft,
        gap
      );
      if (positioned?.then) {
        positioned.then((opensLeft) => {
          this._isLeft = opensLeft;
        });
      } else {
        this._isLeft = positioned;
      }
    }
  }

  @api focusFirstItem() {
    try {
      // Prefer the explicit data-element on the selected path,
      // fall back to any menuitem.
      const firstItem =
        this.template.querySelector('[data-is-selected="true"]') ||
        this.template.querySelector('[data-element="menuItemA"]') ||
        this.template.querySelector('[role="menuitem"]');


      if (!firstItem) {
        return;
      }
      firstItem.setAttribute("tabindex", "0");
      firstItem.classList.add("slds-has-focus");
      //focusWithoutScroll(firstItem);
      requestAnimationFrame(() => {
        firstItem.focus();
      });
    } catch (e) {
      console.error("focusFirstItem error", e);
    }
  }

  resetTabIndexes(toZeroEle = null) {
    try {
      const toZeroNavVal = toZeroEle?.dataset?.value ?? toZeroEle;
      const navItems = this.template.querySelectorAll(
        '[data-nav-item="true"][tabindex="0"]'
      );
      navItems.forEach((nav) => {
        if (nav) {
          if (!toZeroNavVal || nav?.dataset?.value !== toZeroNavVal) {
            nav.setAttribute("tabindex", "-1");
          }
        }
      });
    } catch (error) {
      this.showToast(
        "Error in resetTabIndexes() of sldsMenuPopoverMenu.js",
        getErrorMessage(error),
        "error"
      );
    }
  }

  _hasFocused = false;
  _parentMenus;
  renderedCallback() {
    try {
      if (!this._hasFocused) {
        const firstItem =
          this.template.querySelector('[data-element="menuItemA"]') ||
          this.template.querySelector('[role="menuitem"]');

        if (firstItem) {
          window.requestAnimationFrame(() => {
            firstItem.setAttribute("tabindex", "0");
            firstItem.classList.add("slds-has-focus");
            focusWithoutScroll(firstItem);
          });
          this._hasFocused = true;
        }
      }
      this._menuItems = this.template.querySelectorAll('[role="menuitem"]');
      this._parentMenus = this.template.querySelectorAll(
        '[data-is-main-menu="true"]'
      );
    } catch (error) {
      this.showToast(
        "Error in renderedCallback() of sldsMenuPopoverMenu.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }

  notifySelection(detail) {
    if (typeof this.selectionCallback === "function") {
      this.closeHost();
      this.selectionCallback(detail);
      return;
    }

    this.dispatchEvent(
      new CustomEvent("selection", {
        detail,
        bubbles: true,
        composed: true
      })
    );
  }

  notifyRequestClose() {
    if (typeof this.requestCloseCallback === "function") {
      this.closeHost();
      this.requestCloseCallback();
      return;
    }

    this.dispatchEvent(
      new CustomEvent("requestclose", { bubbles: true, composed: true })
    );
  }

  notifyMenuTab(detail) {
    if (typeof this.menuTabCallback === "function") {
      this.menuTabCallback(detail);
      return;
    }

    this.dispatchEvent(
      new CustomEvent("menupopovertab", {
        detail,
        bubbles: true,
        composed: true
      })
    );
  }

  notifyMenuTabOut(detail) {
    if (typeof this.menuTabOutCallback === "function") {
      this.closeHost();
      this.menuTabOutCallback(detail);
      return;
    }

    this.dispatchEvent(
      new CustomEvent("menupopovertabout", {
        detail,
        bubbles: true,
        composed: true
      })
    );
  }

  closeHost() {
    const host = this.template.host;
    host.style.display = "none";
    host.setAttribute("aria-hidden", "true");
    if (host.parentNode) {
      Node.prototype.removeChild.call(host.parentNode, host);
    }
  }

  // Handle keyboard nav
  handleKeyDown(e) {
    try {
      this.navMode = "keyboard";
      if (e.key === "Tab") {
        this.handleTabKey(e);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        this.notifyRequestClose();
        return;
      }
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const menus = Array.from(
          this.template.querySelectorAll('[role="menuitem"]')
        );
        const eleIdx = menus.findIndex((item) =>
          item.classList.contains("slds-has-focus")
        );
        const ele = menus?.[eleIdx];
        const isTargetNested = ele?.dataset?.nested === "true";
        const isSubmenuParent = ele?.getAttribute("aria-haspopup") === "true";
        if (isTargetNested) {
          e.preventDefault();
          const parentVal = ele.dataset.parentValue;
          const prntIdx = menus.findIndex(
            (m) => m?.dataset?.value === parentVal
          );
          if (prntIdx !== -1) {
            FOCUS_ITEM(menus, prntIdx, this);
            const parentEle = menus[prntIdx];
            parentEle?.setAttribute("aria-expanded", "false");
          }
          return;
        }
        if (isSubmenuParent) {
          e.preventDefault();
          this.toggleSubmenu(ele);
          this.handleSubmenuParentFocus(ele);
          return;
        }
      }

      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();

        const menuItems = Array.from(this._menuItems)?.filter(
          (m) => !m?.classList.contains("slds-is-disabled")
        );

        if (!menuItems.length) return;
        const focusedEle =
          this.template.activeElement?.closest('[role="menuitem"]');
        const focusedIdx = menuItems.findIndex(
          (item) => focusedEle?.dataset?.value === item?.dataset?.value
        );

        const focusedMenuItem = menuItems[focusedIdx]; // <-- this is the element
        const isSubMenu = focusedMenuItem?.dataset?.nested === "true";
        const parentValue = focusedMenuItem?.dataset?.parentValue;

        const filteredItems = isSubMenu
          ? menuItems.filter(
              (m) =>
                m?.dataset?.nested === "true" &&
                m?.dataset?.parentValue === parentValue
            )
          : Array.from(this._parentMenus).filter(
              (item) => !item.classList.contains("slds-is-disabled")
            );

        const filteredItemIdx = filteredItems.findIndex((m) =>
          m.classList.contains("slds-has-focus")
        );

        // Nothing focused yet: start at first
        if (filteredItemIdx === -1) {
          FOCUS_ITEM(filteredItems, 0, this);
          return;
        }

        // Decide direction (you might want to treat Tab vs Shift+Tab differently later)
        let nextIdx =
          e.key === "ArrowUp" ? filteredItemIdx - 1 : filteredItemIdx + 1;

        // Wrap
        if (nextIdx < 0) {
          nextIdx = filteredItems.length - 1;
        } else if (nextIdx >= filteredItems.length) {
          nextIdx = 0;
        }

        FOCUS_ITEM(filteredItems, nextIdx, this);
      }
    } catch (error) {
      this.showToast(
        "Error in handleKeyDown() of sldsMenuPopoverMenu.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }

  getMenuTabbables() {
    return Array.from(this.template.querySelectorAll(TABBABLE_SELECTOR)).filter(
      (el) => {
        const style = window.getComputedStyle(el);
        return (
          el.tabIndex >= 0 &&
          style.visibility !== "hidden" &&
          style.display !== "none" &&
          !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
        );
      }
    );
  }

  handleTabKey(event) {
    const direction = event.shiftKey ? "backward" : "forward";
    const tabbables = this.getMenuTabbables();
    const active = this.template.activeElement;
    const activeIndex = tabbables.findIndex(
      (el) => el === active || el.contains(active)
    );
    const isAtStart = activeIndex <= 0;
    const isAtEnd = activeIndex === -1 || activeIndex === tabbables.length - 1;

    this.notifyMenuTab({ direction, menuId: this.menuId || null });

    if ((event.shiftKey && isAtStart) || (!event.shiftKey && isAtEnd)) {
      event.preventDefault();
      this.notifyMenuTabOut({
        direction,
        menuId: this.menuId || null,
        previousTabTarget: this.previousTabTarget || null,
        nextTabTarget: this.nextTabTarget || null
      });
    }
  }

  handleDisabledHover(event) {
    try {
      event.currentTarget.style.backgroundColor = "transparent";
      const liE1 = event.currentTarget.closest(".slds-dropdown__item");
      if (liE1) {
        liE1.style.backgroundColor = "transparent";
      }
      event.stopPropagation();
      event.preventDefault();
    } catch (error) {
      this.showToast(
        "Error in handleDisabledHover() of sldsMenuPopoverMenu.js",
        getErrorMessage(error),
        "error"
      );
    }
  }
  handleDisabledMouseDown(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.toastObj) {
      this.showToast("This option is disabled", "", "info", "dismissible");
    }
  }

  // Handle slds-has-focus on hover
  enableHover() {
    this.navMode = "mouse";
  }
  // Add slds-has-focus to the options when hovered
  handleHover(event) {
    try {
      if (this.navMode !== "keyboard") {
        if (this._menuItems && this._menuItems !== undefined) {
          const menuVal = event.currentTarget.dataset.value;
          const menuParentVal =
            event.currentTarget?.dataset?.parentValue ?? null;
          this._menuItems.forEach((opt) => {
            if (menuVal === opt.dataset.value) {
              opt.classList.add("slds-has-focus");
              focusWithoutScroll(opt);
              if (opt.getAttribute("aria-haspopup") === "true") {
                opt.setAttribute("aria-expanded", "true");
              }
            } else {
              if (opt.classList.contains("slds-has-focus")) {
                opt.classList.remove("slds-has-focus");
              }
              if (opt.getAttribute("aria-haspopup") === "true") {
                if (menuParentVal) {
                  if (opt?.dataset?.value !== menuParentVal) {
                    opt.setAttribute("aria-expanded", "false");
                  }
                } else {
                  opt.setAttribute("aria-expanded", "false");
                }
              }
            }
          });
        }
      }
    } catch (error) {
      this.showToast(
        "Error in handleHover() of sldsMenuPopoverMenu.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  // Open/Close sub menu
  toggleSubmenu(el) {
    try {
      if (el.getAttribute("aria-haspopup") === "true") {
        const isOpen = el.getAttribute("aria-expanded") === "true";
        this._menuItems.forEach((m) => {
          if (
            m.dataset.value !== el.dataset.value &&
            m.getAttribute("aria-haspopup", "true") &&
            m.getAttribute("aria-expanded", "true")
          ) {
            m.setAttribute("aria-expanded", "false");
            m.classList.remove("slds-has-focus");
          }
        });
        if (isOpen) {
          el.setAttribute("aria-expanded", "false");
        } else {
          el.classList.add("slds-has-focus");
          el.setAttribute("aria-expanded", "true");
        }
      }
    } catch (error) {
      this.showToast(
        "Error in toggleSubmenu() of sldsMenuPopoverMenu.js",
        getErrorMessage(error),
        "error"
      );
    }
  }
  // Focus first submenu parent and expand parent
  handleSubmenuParentFocus(parentEle) {
    try {
      const val = parentEle?.dataset?.value;
      const menus = Array.from(this._menuItems);
      const nestedIdx = menus.findIndex((m) => m.dataset?.parentValue === val);
      if (nestedIdx !== -1) {
        FOCUS_ITEM(menus, nestedIdx, this);
      }
    } catch (error) {
      this.showToast(
        "Error in handleSubmenuParentFocus() of sldsMenuPopoverMenu.js",
        getErrorMessage(error),
        "error"
      );
    }
  }

  handleBlur(event) {
    const relatedTarget = event.relatedTarget;
    if (!relatedTarget || isMenuComponent(relatedTarget)) {
        return;
    }
    this.notifyRequestClose();
  }

  // Select item on click or enter
  handleSelection(e) {
    try {
      e.preventDefault();
      e.stopPropagation();
      const el = e.currentTarget || e.target.closest("[data-value]");
      if (el.getAttribute("aria-haspopup") === "true") {
        this.toggleSubmenu(el);
        this.handleSubmenuParentFocus(el);
        return;
      }
      const val = el?.dataset?.value;
      if (this.isSave) {
        this._value = val;
        requestAnimationFrame(() => {
          const selected = this.template.querySelector(
            '[data-is-selected="true"]'
          );
          if (selected) {
            selected.focus();
          }
        });
      }
      if (!val || this.isSave) {
        return;
      }

      this.notifySelection({ id: this.menuId || null, selection: val });
    } catch (error) {
      this.showToast(
        "Error in handleSelection() of sldsMenuPopoverMenu.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }

  get _subMenuCl() {
    return this._isLeft
      ? "slds-dropdown slds-dropdown_submenu slds-dropdown_submenu-left"
      : "slds-dropdown slds-dropdown_submenu slds-dropdown_submenu-right";
  }
  get dropdownClass() {
    const map = MENU_SIZES;
    const base =
      this._menuSize &&
      Object.prototype.hasOwnProperty.call(map, this._menuSize)
        ? map[this._menuSize]
        : this._menuSize || "";

    const hasSubMenus = this.localOptions.some((opt) => opt?.options?.length);

    const optsLength = this.localOptions?.length;

    const dropDownCl =
      optsLength >= 7 ? "slds-dropdown_length-10" : "slds-dropdown_length-7";

    return this._isLeft
      ? `${base} slds-dropdown slds-dropdown_left ${hasSubMenus ? "" : dropDownCl}`
      : `${base} slds-dropdown slds-dropdown_right ${hasSubMenus ? "" : dropDownCl}`;
  }
  get localOptions() {
    try {
      return this.options.map((option, index) =>
        normalizeOption(
          option,
          index,
          "menu-option",
          this._value,
          this._isCheck,
          this._isMultiCheck
        )
      );
    } catch (error) {
      this.showToast(
        "Error in get localOptions() of sldsMenuPopoverMenu.js: ",
        getErrorMessage(error),
        "error"
      );
      return [];
    }
  }

  
  get _checkedIcon() {
    if (!!this.checkedIconFn && typeof this.checkedIconFn === 'function') {
        const iconRes = this.checkedIconFn(this, this._value ?? null);
        
        const { icon, iconClass } = resolveIcon(iconRes, BASE_CHECK_ICON_CL);
        
        return icon 
            ? {icon, iconClass: `${iconClass} brand-icon`} 
            : {icon: ICON_MAP.utility.check, iconClass: BASE_CHECK_ICON_CL};
    }
    return {
        icon: ICON_MAP.utility.check, 
        iconClass: BASE_CHECK_ICON_CL
    };
  }

  handleButtonFocus() {
    try {
      const menuItems = this.template.querySelectorAll('[role="menuitem"]');
      if (menuItems) {
        menuItems.forEach((menu) => {
          if (menu && menu.classList.contains("slds-has-focus")) {
            menu.classList.remove("slds-has-focus");
          }
        });
      }
    } catch (error) {
      this.showToast(
        "Error in handleButtonFocus() of sldsMenuPopoverMenu.js",
        error,
        "error"
      );
    }
  }

  handleSaveCancel() {
    this.notifyRequestClose();
  }

  // if save
  handleSave() {
    this.notifySelection({ id: this.menuId || null, selection: this._value });
  }

  _tooltipText;
  // Tooltip handlers
  showTooltip(event) {
    try {
      const tipEle = event.currentTarget;
      this._tooltipText = tipEle?.dataset?.tipMessage ?? "";

      const tooltip = this.template.querySelector('[data-el="tooltip"]');
      if (!tooltip || !this._tooltipText) return;

      const option = tipEle.closest(".slds-dropdown__item") ?? tipEle;
      const optionRect = option.getBoundingClientRect();

      tooltip.classList.remove("slds-hide");
      tooltip.classList.add("slds-show");
      tooltip.style.position = "fixed";
      tooltip.style.left = "-9999px";
      tooltip.style.top = "-9999px";
      tooltip.style.visibility = "hidden";
      tooltip.style.zIndex = 9999;

      requestAnimationFrame(() => {
        const tipRect = tooltip.getBoundingClientRect();
        const pad = 8;
        const nubbinOffset = 12;

        let left = optionRect.left - tipRect.width - nubbinOffset;
        left = Math.max(
          pad,
          Math.min(left, window.innerWidth - tipRect.width - pad)
        );

        let top = optionRect.top + optionRect.height / 2 - tipRect.height / 2;
        top = Math.max(
          pad,
          Math.min(top, window.innerHeight - tipRect.height - pad)
        );

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.style.visibility = "visible";
        tooltip.classList.remove("slds-nubbin_left", "slds-nubbin_right");
        tooltip.classList.add("slds-nubbin_right");
      });
    } catch (error) {
      this.showToast(
        "Error in showTooltip() of sldsMenuPopoverMenu.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }

  hideTooltip() {
    try {
      const tooltip = this.template.querySelector('[data-el="tooltip"]');
      if (!tooltip) return;
      tooltip.classList.replace("slds-show", "slds-hide");
    } catch (error) {
      this.showToast(
        "Error in hideTooltip() of sldsMenuPopoverMenu.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }

  @track toastObj;
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
