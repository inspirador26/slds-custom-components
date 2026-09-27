/**
 * sldsMenuPopoverButton — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/utils.
 * - Salesforce/platform modules: lwc.
 * - Template children (including conditional UI): c-slds-menu-popover-menu, c-toast-lwc.
 * - Bundle template: sldsMenuPopoverButton.html. Salesforce SLDS styling is expected.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-menu-popover-button') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - isSave (is-save): Enables the menu's save option behavior. Declared default: false.
 *   Example: child.isSave = true;
 * - options (options): Option array with label and value; optional icon/metadata support depends on the
 * variant. Declared default: [].
 *   Example: child.options = [{ label: 'Open', value: 'open' }];
 * - menuSize (menu-size): Size forwarded to the child popover menu.
 *   Example: child.menuSize = "small";
 * - menuId (menu-id): Identifier included in menu keyboard/navigation details.
 *   Example: child.menuId = "row-actions";
 * - checkedIconFn (checked-icon-fn): Callback (menu, value) returning a SLDS icon name for checked menu
 * options.
 *   Example: child.checkedIconFn = (menu, value) => 'utility:check';
 * - value (value): Selected menu option value.
 *   Example: child.value = "edit";
 * - isDiv (is-div): Uses a div wrapper for the slotted trigger.
 *   Example: child.isDiv = true;
 * - buttonLast (button-last): Uses the trailing-button wrapper treatment.
 *   Example: child.buttonLast = true;
 * - isLeft (is-left): Requests left-side menu positioning.
 *   Example: child.isLeft = true;
 * - isCheck (is-check): Enables check-style menu options.
 *   Example: child.isCheck = true;
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-slds-menu-popover-button options={actions} onselection={handleSelection}>
 *         <button class="slds-button slds-button_neutral">Actions</button>
 *     </c-slds-menu-popover-button>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     actions = [{ label: 'Edit', value: 'edit' }, { label: 'Preview', value: 'preview' }];
 *     selection;
 *     handleSelection(event) { this.selection = event.detail; }
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Use around a slotted trigger to show sldsMenuPopoverMenu. The selection event forwards the child menu
 * detail. is-check and value enable selected-option checks. The component handles positioning and keyboard
 * focus restoration; menupopovertab/menupopovertabout expose menu navigation details to parents that
 * coordinate focus.
 * - Slots: (default trigger/content).
 */

import { LightningElement, api } from "lwc";
import { publicPropertyToBool, getErrorMessage } from "c/utils";

const GAP = 4;
const TABBABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(",");

let portalRoot;

function getScrollPosition() {
  return {
    x: window.pageXOffset || window.scrollX || 0,
    y: window.pageYOffset || window.scrollY || 0
  };
}

function focusWithoutScroll(el) {
  if (!el || typeof el.focus !== "function") return;

  const { x, y } = getScrollPosition();

  try {
    el.focus({ preventScroll: true });
  } catch {
    el.focus();
  }

  window.requestAnimationFrame(() => {
    const next = getScrollPosition();
    if (next.x !== x || next.y !== y) {
      window.scrollTo(x, y);
    }
  });
}

function isTabbable(el) {
  if (!el || el.disabled || el.getAttribute("aria-hidden") === "true")
    return false;
  if (el.tabIndex < 0) return false;

  const style = window.getComputedStyle(el);
  if (style.visibility === "hidden" || style.display === "none") return false;

  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

function getTabSequenceFor(el) {
  const root = el?.getRootNode?.();
  if (!root?.querySelectorAll) {
    return { previous: null, next: null };
  }

  const tabbables = Array.from(root.querySelectorAll(TABBABLE_SELECTOR)).filter(
    isTabbable
  );

  const index = tabbables.findIndex((item) => item === el || item.contains(el));

  return {
    previous: index > 0 ? tabbables[index - 1] : null,
    next:
      index !== -1 && index < tabbables.length - 1 ? tabbables[index + 1] : null
  };
}

function ensurePortalRoot() {
  if (portalRoot?.isConnected) {
    return portalRoot;
  }

  let host = Array.from(document.body.children).find(
    (child) => child.id === "slds-portal-root"
  );
  if (!host) {
    host = new DOMParser().parseFromString(
      '<div id="slds-portal-root" style="position: relative; z-index: 9999;"></div>',
      "text/html"
    ).body.firstElementChild;
    document.body.appendChild(host);
  }
  portalRoot = host;
  return host;
}

/* Example Usage:
        HTML:
            <x-slds-menu-popover-button 
                id={myButton.id}                  <-- add 'id' for multiple instances on the page
                options={rowActions}              <-- **required
                container={relativeContainer}     <-- *required if is in a relative container
                onselection={handleSelction}      <-- **required
                is-left="false"                   <-- default is false (pins menu to right side of button)
            >
                <button class="slds-button slds-button_icon slds-button_icon-border-filled slds-button_icon-x-small" 
                    aria-haspopup="true" 
                    tabindex="0" 
                    aria-selected="false"
                    title="More actions"
                    data-id={row.menuId}
                >
                    <svg class="slds-button__icon slds-button__icon_hint slds-button__icon_small" aria-hidden="true">
                        <use xlink:href="/dist/icons/utility-sprite/svg/symbols.svg#down"></use>
                    </svg>
                    <span class="slds-assistive-text">More actions</span>
                </button>
            </x-slds-menu-popover-button>

        JavaScript:
            handleSelction(message) {
                // Get the response from <x-slds-menu-popover-button
                const detail= message.detail;

                // ***** detail can have id  ******
                if (typeof detail === 'object' && detail.id) {
                    const id = detail.id
                    const action = detail.selection

                // ***** detail without id  ******
                } else {
                    const selection = detail; 
                }
            }

*/

function resolveDivCl(isDiv, buttonLast) {
  return buttonLast
    ? "slds-dropdown-trigger slds-dropdown-trigger_click slds-button_last"
    : isDiv
      ? "slds-dropdown-trigger slds-dropdown-trigger_click"
      : "";
}

export default class SldsMenuPopoverButton extends LightningElement {
  isOpen = false;
  _onGlobalKeydown = null;
  _onGlobalWheel = null;

  @api isSave = false;
  @api options = [];
  @api menuSize;
  @api menuId;
  @api checkedIconFn;

  _value;
  @api
  set value(val) {
    this._value = val;
  }
  get value() {
    return this._value;
  }

  _ariaHasPopup = false;
  _divCl = "";
  @api
  set isDiv(val) {
    this._isDiv = val;
    if (val) {
      this._ariaHasPopup = true;
      this._divCl = resolveDivCl(val, this.buttonLast);
    }
  }
  get isDiv() {
    return this._isDiv ?? "";
  }
  @api
  set buttonLast(val) {
    this._buttonLast = val;
    if (val) {
      this._divCl = resolveDivCl(this.isDiv, val);
      this._ariaHasPopup = true;
    }
  }
  get buttonLast() {
    return this._buttonLast;
  }

  _isLeft = false;
  @api set isLeft(v) {
    this._isLeft = publicPropertyToBool(v);
  }
  get isLeft() {
    return this._isLeft;
  }

  _isCheck = false;
  @api set isCheck(v) {
    this._isCheck = publicPropertyToBool(v);
  }
  get isCheck() {
    return this._isCheck;
  }

  _menuEl = null;
  _onMenuSelection = null;
  _onMenuClose = null;
  _onMenuTab = null;
  _onMenuTabOut = null;
  _onHostMenuSelection = null;
  _onHostMenuClose = null;
  _onHostMenuTab = null;
  _onHostMenuTabOut = null;
  _onResize = null;
  _onScroll = null;
  _onOutside = null;
  _previousTabTarget = null;
  _nextTabTarget = null;
  _needsPositionAndFocus = false;

  get _btn() {
    return this.template
      .querySelector("slot")
      ?.assignedElements({ flatten: true })
      ?.find((el) => el.tagName === "BUTTON");
  }

  toggle() {
    try {
      if (this.isOpen) {
        this._close({ refocus: true });
      } else {
        this._open();
      }
    } catch (error) {
      this.showToast(
        "Error in toggle() of sldsMenuPopoverButton.js",
        getErrorMessage(error),
        "error"
      );
    }
  }

  handleKeyDown(e) {
    try {
      const { key } = e;

      // Trigger has focus
      if (!this.isOpen) {
        // Open menu on Enter / Space / ArrowDown
        if (key === "Enter" || key === " " || key === "ArrowDown") {
          e.preventDefault();
          this._open(); // _open will focus first item
        }
        return;
      }

      // Menu is open

      // Close on Escape
      if (key === "Escape") {
        e.preventDefault();
        this._close({ refocus: true });
        return;
      }

      // If you want ArrowDown on trigger to shove focus back into first item while open:
      if (key === "ArrowDown") {
        e.preventDefault();
        this._menuEl?.focusFirstItem?.();
      }

      // I would NOT fight Tab here – let it close & move on naturally,
      // or if needed you can intercept it similarly and push focus in.
    } catch (error) {
      this.showToast(
        "Error in handleKeyDown() of sldsMenuPopoverButton.js",
        getErrorMessage(error),
        "error"
      );
    }
  }

  _open() {
    try {
      const btn = this._btn;
      if (!btn) return;
      const tabTargets = getTabSequenceFor(btn);

      this._previousTabTarget = tabTargets.previous;
      this._nextTabTarget = tabTargets.next;
      this._needsPositionAndFocus = true;
      this.isOpen = true;

      // keep positioned, outside click, etc (your existing code)
      this._onResize = () => this._positionMenu();
      this._onScroll = () => this._positionMenu();
      window.addEventListener("resize", this._onResize, { passive: true });
      window.addEventListener("scroll", this._onScroll, true);

      this._onOutside = (evt) => {
        const path =
          typeof evt.composedPath === "function" ? evt.composedPath() : [];
        const menu = this._menuEl;
        if (path.includes(menu) || path.includes(btn)) return;
        this._close({ refocus: true });
      };
      window.addEventListener("pointerdown", this._onOutside, {
        capture: true
      });

      requestAnimationFrame(() => {
        this._menuEl.focusFirstItem();
      });
    } catch (error) {
      this.showToast(
        "Error in _open() of sldsMenuPopoverButton.js",
        getErrorMessage(error),
        "error"
      );
    }
  }

  renderedCallback() {
    try {
      if (!this.isOpen) return;

      const stagedMenu = this.template.querySelector(
        "c-slds-menu-popover-menu"
      );
      if (stagedMenu) {
        this._menuEl = stagedMenu;
        this._portalMenu();
      }

      if (this._needsPositionAndFocus) {
        this._needsPositionAndFocus = false;
        window.requestAnimationFrame(() => {
          this._positionMenu();
          this._menuEl?.focusFirstItem?.();
        });
      }
    } catch (error) {
      this.showToast(
        "Error in renderedCallback() of sldsMenuPopoverButton.js",
        getErrorMessage(error),
        "error"
      );
    }
  }

  _portalMenu() {
    const menu = this._menuEl;
    if (!menu || typeof document === "undefined") return;

    menu.selectionCallback = this.menuSelectionCallback;
    menu.requestCloseCallback = this.menuCloseCallback;
    menu.menuTabCallback = this.menuTabCallback;
    menu.menuTabOutCallback = this.menuTabOutCallback;

    const host = ensurePortalRoot();
    Array.from(
      host.querySelectorAll('c-slds-menu-popover-menu[aria-hidden="true"]')
    ).forEach((staleMenu) => {
      Node.prototype.removeChild.call(host, staleMenu);
    });
    this._wirePortaledMenuEvents(host);
    if (menu.parentNode !== host) {
      host.appendChild(menu);
    }
  }

  _wirePortaledMenuEvents(host = portalRoot) {
    const menu = this._menuEl;
    if (!menu || this._onMenuSelection) return;

    const fromMenu = (event) => {
      const path =
        typeof event.composedPath === "function" ? event.composedPath() : [];
      return (
        path.includes(menu) ||
        event.target === menu ||
        menu.contains(event.target)
      );
    };
    this._onMenuSelection = (event) => {
      if (fromMenu(event)) this.handleMenuSelection(event);
    };
    this._onMenuClose = (event) => {
      if (fromMenu(event)) this.handleMenuClose(event);
    };
    this._onMenuTab = (event) => {
      if (fromMenu(event)) this.handleMenuTab(event);
    };
    this._onMenuTabOut = (event) => {
      if (fromMenu(event)) this.handleMenuTabOut(event);
    };

    menu.addEventListener("selection", this._onMenuSelection);
    menu.addEventListener("requestclose", this._onMenuClose);
    menu.addEventListener("menupopovertab", this._onMenuTab);
    menu.addEventListener("menupopovertabout", this._onMenuTabOut);
    host?.addEventListener("selection", this._onMenuSelection);
    host?.addEventListener("requestclose", this._onMenuClose);
    host?.addEventListener("menupopovertab", this._onMenuTab);
    host?.addEventListener("menupopovertabout", this._onMenuTabOut);
    window.addEventListener("selection", this._onMenuSelection, true);
    window.addEventListener("requestclose", this._onMenuClose, true);
    window.addEventListener("menupopovertab", this._onMenuTab, true);
    window.addEventListener("menupopovertabout", this._onMenuTabOut, true);

    this._onHostMenuSelection = (event) => {
      if (event.target !== this.template.host && this.isOpen) {
        this.handleMenuSelection(event);
      }
    };
    this._onHostMenuClose = (event) => {
      if (event.target !== this.template.host && this.isOpen) {
        this.handleMenuClose(event);
      }
    };
    this._onHostMenuTab = (event) => {
      if (event.target !== this.template.host && this.isOpen) {
        this.handleMenuTab(event);
      }
    };
    this._onHostMenuTabOut = (event) => {
      if (event.target !== this.template.host && this.isOpen) {
        this.handleMenuTabOut(event);
      }
    };

    this.template.host.addEventListener("selection", this._onHostMenuSelection);
    this.template.host.addEventListener("requestclose", this._onHostMenuClose);
    this.template.host.addEventListener("menupopovertab", this._onHostMenuTab);
    this.template.host.addEventListener(
      "menupopovertabout",
      this._onHostMenuTabOut
    );
  }

  _unwirePortaledMenuEvents(menu = this._menuEl) {
    if (!menu) return;

    if (this._onMenuSelection) {
      menu.removeEventListener("selection", this._onMenuSelection);
      portalRoot?.removeEventListener("selection", this._onMenuSelection);
      window.removeEventListener("selection", this._onMenuSelection, true);
    }
    if (this._onMenuClose) {
      menu.removeEventListener("requestclose", this._onMenuClose);
      portalRoot?.removeEventListener("requestclose", this._onMenuClose);
      window.removeEventListener("requestclose", this._onMenuClose, true);
    }
    if (this._onMenuTab) {
      menu.removeEventListener("menupopovertab", this._onMenuTab);
      portalRoot?.removeEventListener("menupopovertab", this._onMenuTab);
      window.removeEventListener("menupopovertab", this._onMenuTab, true);
    }
    if (this._onMenuTabOut) {
      menu.removeEventListener("menupopovertabout", this._onMenuTabOut);
      portalRoot?.removeEventListener("menupopovertabout", this._onMenuTabOut);
      window.removeEventListener("menupopovertabout", this._onMenuTabOut, true);
    }
    if (this._onHostMenuSelection) {
      this.template.host.removeEventListener(
        "selection",
        this._onHostMenuSelection
      );
    }
    if (this._onHostMenuClose) {
      this.template.host.removeEventListener(
        "requestclose",
        this._onHostMenuClose
      );
    }
    if (this._onHostMenuTab) {
      this.template.host.removeEventListener(
        "menupopovertab",
        this._onHostMenuTab
      );
    }
    if (this._onHostMenuTabOut) {
      this.template.host.removeEventListener(
        "menupopovertabout",
        this._onHostMenuTabOut
      );
    }
  }

  _removePortaledMenu() {
    const menu =
      this._menuEl || portalRoot?.querySelector("c-slds-menu-popover-menu");
    if (!menu) return;

    if (menu.parentNode) {
      menu.style.display = "none";
      menu.setAttribute("aria-hidden", "true");
      Node.prototype.removeChild.call(menu.parentNode, menu);
    }

    try {
      this._unwirePortaledMenuEvents(menu);
    } catch {
      // The menu is already visually closed; listener cleanup is best effort.
    }
  }

  _positionMenu() {
    try {
      const btn = this._btn;
      const menu = this._menuEl;

      if (btn && menu) {
        menu.positionAgainst?.(btn, this._isLeft, GAP);
      }
    } catch (error) {
      this.showToast(
        "Error in _positionMenu() of sldsMenuPopoverButton.js",
        getErrorMessage(error),
        "error"
      );
    }
  }

  handleMenuSelection(e) {
    try {
      e.stopPropagation();
      this.handleMenuSelectionDetail(e.detail);
    } catch (error) {
      this.showToast(
        "Error in handleMenuSelection() of sldsMenuPopoverButton.js",
        getErrorMessage(error),
        "error"
      );
    }
  }

  menuSelectionCallback = (detail) => {
    this.handleMenuSelectionDetail(detail);
  };

  handleMenuSelectionDetail(detail) {
    this.dispatchEvent(
      new CustomEvent("selection", {
        detail,
        bubbles: true,
        composed: true
      })
    );
    this._close({ refocus: true });
  }

  handleMenuClose(e) {
    e.stopPropagation();
    this.handleMenuCloseDetail();
  }

  menuCloseCallback = () => {
    this.handleMenuCloseDetail();
  };

  handleMenuCloseDetail() {
    this._close({ refocus: true });
  }

  handleMenuTab(e) {
    e.stopPropagation();
    this.handleMenuTabDetail(e.detail);
  }

  menuTabCallback = (detail) => {
    this.handleMenuTabDetail(detail);
  };

  handleMenuTabDetail(detail) {
    this.dispatchEvent(
      new CustomEvent("menupopovertab", {
        detail,
        bubbles: true,
        composed: true
      })
    );
  }

  handleMenuTabOut(e) {
    e.stopPropagation();
    this.handleMenuTabOutDetail(e.detail);
  }

  menuTabOutCallback = (detail) => {
    this.handleMenuTabOutDetail(detail);
  };

  handleMenuTabOutDetail(detail) {
    const direction = detail?.direction;
    const focusTarget =
      direction === "backward" ? this._previousTabTarget : this._nextTabTarget;

    this.dispatchEvent(
      new CustomEvent("menupopovertabout", {
        detail: { ...detail, menuId: this.menuId || null },
        bubbles: true,
        composed: true
      })
    );

    this._close({ refocus: false });
    window.requestAnimationFrame(() => focusWithoutScroll(focusTarget));
  }

  _close({ refocus = false } = {}) {
    try {
      if (!this.isOpen && !this._menuEl) return;

      this.isOpen = false;

      // remove global listeners
      if (this._onResize) {
        window.removeEventListener("resize", this._onResize);
        this._onResize = null;
      }
      if (this._onScroll) {
        window.removeEventListener("scroll", this._onScroll, true);
        this._onScroll = null;
      }
      if (this._onOutside) {
        window.removeEventListener("pointerdown", this._onOutside, true);
        this._onOutside = null;
      }

      // 🔴 NEW: remove global key + wheel
      if (this._onGlobalKeydown) {
        window.removeEventListener("keydown", this._onGlobalKeydown, true);
        this._onGlobalKeydown = null;
      }
      if (this._onGlobalWheel) {
        window.removeEventListener("wheel", this._onGlobalWheel, true);
        this._onGlobalWheel = null;
      }

      this._removePortaledMenu();

      this._menuEl =
        this._onMenuSelection =
        this._onMenuClose =
        this._onMenuTab =
        this._onMenuTabOut =
        this._onHostMenuSelection =
        this._onHostMenuClose =
        this._onHostMenuTab =
        this._onHostMenuTabOut =
          null;
      this._previousTabTarget = null;
      this._nextTabTarget = null;
      this._needsPositionAndFocus = false;

      if (refocus) focusWithoutScroll(this._btn);
    } catch (error) {
      this.showToast(
        "Error in _close() of sldsMenuPopoverButton.js",
        getErrorMessage(error),
        "error"
      );
    }
  }

  disconnectedCallback() {
    this._close({ refocus: true });
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
