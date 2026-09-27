/**
 * sldsComboboxPortal — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/utils.
 * - Salesforce/platform modules: lwc.
 * - Template children (including conditional UI): c-slds-combobox-portal-dropdown, c-toast-lwc,
 * lightning-icon.
 * - Bundle template: sldsComboboxPortal.html; local styles: sldsComboboxPortal.css. Salesforce SLDS
 * styling is expected.
 * - Shared CSS modules: c/sharedStylesSldsCombobox.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-combobox-portal') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - flipUp (flip-up): Requests an upward-opening dropdown. Declared default: false.
 *   Example: child.flipUp = true;
 * - isRequired (is-required): Marks the control as required; validation behavior is component-specific.
 * Declared default: false.
 *   Example: child.isRequired = true;
 * - suppressErrorText (suppress-error-text): Hides the inline validation message while retaining the error
 * state. Declared default: false.
 *   Example: child.suppressErrorText = true;
 * - placeHolder (place-holder): Prompt shown when the input has no selection or text.
 *   Example: child.placeHolder = "Select an option";
 * - label (label): Visible control label. Declared default: null.
 *   Example: child.label = "Status";
 * - isDarkMode (is-dark-mode): Compatibility property: enables the combobox dark appearance; currently
 * stored/exposed but not consumed by this implementation. Declared default: false.
 *   Example: child.isDarkMode = true;
 * - isFocusBlue (is-focus-blue): Compatibility property: enables the blue focus treatment; currently
 * stored/exposed but not consumed by this implementation. Declared default: false.
 *   Example: child.isFocusBlue = true;
 * - downIconSize (down-icon-size): SLDS size for the dropdown indicator.
 *   Example: child.downIconSize = "x-small";
 * - addNone (add-none): Adds a --None-- option for clearing the selection.
 *   Example: child.addNone = true;
 * - isDisabled (is-disabled): Disables interaction with the control.
 *   Example: child.isDisabled = true;
 * - hasMeta (has-meta): Enables additional metadata lines on options.
 *   Example: child.hasMeta = true;
 * - dropdownLength (dropdown-length): SLDS dropdown length class suffix; use a supported length such as 5
 * or 7.
 *   Example: child.dropdownLength = 5;
 * - currentValue (current-value): Current input or selected option value; keep parent state in sync with
 * the selection event.
 *   Example: child.currentValue = "open";
 * - options (options): Option array with label and value; optional icon/metadata support depends on the
 * variant.
 *   Example: child.options = [{ label: 'Open', value: 'open' }];
 * - suppressMargin (suppress-margin): Removes the component's bottom margin when enabled.
 *   Example: child.suppressMargin = true;
 * - height (height): CSS input/control height, including units.
 *   Example: child.height = "2rem";
 * - borderRadius (border-radius): CSS corner radius, including units.
 *   Example: child.borderRadius = "0.25rem";
 * - fontSize (font-size): CSS text size, including units.
 *   Example: child.fontSize = "0.875rem";
 *
 * Public methods (call on the rendered child):
 * - focusMe(): Focus the component input/control.
 * - clearMe(value = null): Clear/reset the input value.
 * - getValue(): Read the current component value.
 * - clearValues(): Clear the selected values.
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-slds-combobox-portal label="Status" options={options}
 *         current-value={value} onselected={handleSelected}></c-slds-combobox-portal>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     options = [{ label: 'Open', value: 'open' }, { label: 'Closed', value: 'closed' }];
 *     value = 'open';
 *     handleSelected(event) { this.value = event.detail; }
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Use for single selection from parent-supplied options. selected.detail is the scalar value; the None
 * option emits null. open signals dropdown opening.
 * - Optional variant: add add-none={enabled}, has-meta={enabled} and dropdown-length="7"; define enabled =
 * true and add metadata to the option objects. Parent CSS can size the host; use public style properties
 * for internals. The portal variant delegates the listbox to sldsComboboxPortalDropdown and positions it
 * relative to the input to handle clipped containers.
 */

import { LightningElement, api, track } from "lwc";

import {
  getErrorMessage,
  getToastErrorMessage,
  handleReadOnlySearch,
  publicPropertyToBool
} from "c/utils";

const META_KEYS = ["fieldOne", "fieldTwo"];
const NAV_KEYS = [
  "Enter",
  "Escape",
  "Shift",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Tab"
];

let portalRoot;

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

const HANDLE_OPTIONS_ADD_NONE = (isNone, options, currentValue) => {
  const currentVal = currentValue ?? "";
  const stringCurrent = currentValue != null ? currentValue : "";
  let result = Array.isArray(options) ? [...options] : [];

  if (isNone && !result.some((opt) => opt?.label === "--None--")) {
    result = [{ label: "--None--", value: "" }, ...result];
  }

  result = result.map((o) => ({
    ...o,
    value: o.value ?? "",
    isSelected: String(o.value ?? "") === stringCurrent
  }));

  return [currentVal, result];
};

export default class SldsComboboxPortal extends LightningElement {
  originalValue = null;
  eventSending = false;
  highlightedOptionId = null;
  listboxId = `slds-combobox-portal-listbox-${Math.random().toString(36).slice(2)}`;

  @track isComboBoxOpen = false;
  @track localOptions = [];

  _currentValue = "";
  _options = [];
  _dropdownEl;
  _suppressBlur = false;
  _hasError = false;
  _errorMsg;
  _mainFormElementCl = "slds-form-element";
  _downIconSize = "x-small";
  _readOnlyStr = "";
  _readOnlyStrTimeStamp = 0;
  _needsOpenFocus = false;
  _restoreFocusAfterSelection = false;
  _focusRestoreTimerIds = [];

  @api flipUp = false;
  @api isRequired = false;
  @api suppressErrorText = false;
  @api placeHolder;
  @api label = null;
  @api isDarkMode = false;
  @api isFocusBlue = false;

  @api
  set downIconSize(val) {
    this._downIconSize = val ?? "x-small";
  }
  get downIconSize() {
    return this._downIconSize;
  }

  @api
  set addNone(val) {
    this._addNone = publicPropertyToBool(val);
    this.handleOptionsInitalization();
    this.syncDropdownProperties();
  }
  get addNone() {
    return this._addNone || false;
  }

  @api
  set isDisabled(val) {
    this._isDisabled = val === "true" || val === true;
    if (this._isDisabled) this.closeDropdown(false);
  }
  get isDisabled() {
    return this._isDisabled || false;
  }

  @api
  set hasMeta(value) {
    this._hasMeta = value === "" || value === true || value === "true";
    this.syncDropdownProperties();
  }
  get hasMeta() {
    return this._hasMeta ?? false;
  }

  @api
  set dropdownLength(val) {
    this._dropdownLength = Number(val);
    this.syncDropdownProperties();
  }
  get dropdownLength() {
    return this._dropdownLength;
  }

  @api
  set currentValue(value) {
    try {
      this._currentValue = value == null ? "" : value;
      this.handleOptionsInitalization();
      this.syncDropdownProperties();
    } catch (error) {
      getToastErrorMessage("set currentValue", "SldsComboboxPortal", error);
    }
  }
  get currentValue() {
    return this._currentValue ?? "";
  }

  @api
  set options(value) {
    try {
      this._options = Array.isArray(value) ? value : [];
      this.handleOptionsInitalization();
      this.syncDropdownProperties();
    } catch (error) {
      getToastErrorMessage("set options", "SldsComboboxPortal", error);
    }
  }
  get options() {
    return this._options || [];
  }

  @api
  set suppressMargin(val) {
    this._suppressMargin = val;
    this._applyVarsDirect("--c-margin-bottom", "0px");
  }
  get suppressMargin() {
    return this._suppressMargin;
  }

  @api
  set height(val) {
    this._height = val;
    if (val) this._applyVarsDirect("--input-height", val);
  }
  get height() {
    return this._height;
  }

  @api
  set borderRadius(val) {
    this._borderRadius = val;
    if (val) this._applyVarsDirect("--slds-c-input-radius-border", val);
  }
  get borderRadius() {
    return this._borderRadius;
  }

  @api
  set fontSize(val) {
    this._fontSize = val;
    if (val) {
      this._applyVarsDirect("--slds-c-dropdown-font-size", val);
      this._applyVarsDirect("--c-font-size", val);
      this.syncDropdownProperties();
    }
  }
  get fontSize() {
    return this._fontSize;
  }

  connectedCallback() {
    this.originalValue = this._currentValue;
  }

  disconnectedCallback() {
    this.clearFocusRestoreTimers();
    this.teardownPortal();
  }

  renderedCallback() {
    if (this.isComboBoxOpen) {
      const inlineDropdown = this.template.querySelector(
        "c-slds-combobox-portal-dropdown"
      );
      if (inlineDropdown || !this._dropdownEl?.isConnected) {
        this._dropdownEl = inlineDropdown;
      }
      this.portalDropdown();
      this.syncDropdownProperties();

      requestAnimationFrame(() => {
        this.positionDropdown();
        if (this._needsOpenFocus) {
          this._needsOpenFocus = false;
          this._dropdownEl?.focusValue?.(
            String(this._currentValue || ""),
            true
          );
        }
      });
    }
  }

  @api focusMe() {
    this.restoreInputFocus();
  }

  @api clearMe(value = null) {
    this._currentValue = value ?? "";
    this.localOptions = this.localOptions.map((opt) => ({
      ...opt,
      isSelected: false
    }));
    this.handleRequiredErrorAttributes();
    this.syncDropdownProperties();
  }

  @api getValue() {
    return this._currentValue;
  }

  @api clearValues() {
    this.clearMe("");
  }

  findCurrentValue(val, options, returnOption = false) {
    const strVal = String(val ?? "");
    const match = (options ?? []).find((o) => String(o.value ?? "") === strVal);
    return returnOption ? (match ?? null) : (match?.value ?? null);
  }

  handleOptionsInitalization() {
    try {
      const [currentVal, options] = HANDLE_OPTIONS_ADD_NONE(
        this.addNone,
        this._options,
        this._currentValue
      );

      this._currentValue = currentVal;
      this.localOptions = options.map((op) => ({
        ...op,
        hasMeta: META_KEYS.some((m) => !!op[m])
      }));
    } catch (error) {
      this.showToast(
        "Error in handleOptionsInitalization() of sldsComboboxPortal.js",
        getErrorMessage(error),
        "error"
      );
    }
  }

  get currentSelection() {
    return this.findCurrentValue(this._currentValue, this.localOptions, true);
  }

  get currentValueLabel() {
    const match = this.currentSelection;
    return this._currentValue
      ? match?.label || ""
      : this.addNone
        ? "--None--"
        : "";
  }

  get mainFormElementCl() {
    return this._mainFormElementCl;
  }

  get errorMsg() {
    return this._errorMsg;
  }

  get hasError() {
    return this._hasError;
  }

  get isOpenString() {
    return this.isComboBoxOpen ? "true" : "false";
  }

  get dropdownCl() {
    const base =
      "slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click";
    return this.isDisabled ? `${base} slds-is-disabled` : base;
  }

  get dropdownHostClass() {
    return this.isComboBoxOpen ? "" : "slds-combobox-portal__dropdown_hidden";
  }

  get inputCl() {
    const base =
      "slds-input slds-combobox__input slds-combobox__input-value slds-truncate";
    return this.isDisabled ? `${base} slds-is-disabled` : base;
  }

  get formElementClass() {
    return "slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right";
  }

  get showDropdownIcon() {
    return !this.isDisabled;
  }

  handleComboboxClick(event) {
    if (this.isDisabled || this._suppressBlur) return;
    event.preventDefault();
    this.toggleDropdown();
  }

  handleFocus(event) {
    event.preventDefault();
    event.target.focus();
  }

  handleFocusOut() {
    if (!this._hasError && this.isRequired && !this._currentValue) {
      this.handleRequiredErrorAttributes(true);
      return;
    }

    if (this._hasError && this.isRequired && this._currentValue) {
      this.handleRequiredErrorAttributes();
    }
  }

  handleBlur() {
    if (this._suppressBlur) {
      this.restoreInputFocus(true);
      return;
    }
    window.setTimeout(() => {
      if (!this._suppressBlur) this.closeDropdown();
    }, 80);
  }

  handleMouseDown(event) {
    const input = this.template.querySelector('[data-id="sldsComboboxInput"]');
    if (event.target !== input) {
      event.preventDefault();
      input?.focus({ preventScroll: true });
    }
  }

  handleMouseUp() {
    this._suppressBlur = false;
  }

  handleKeyDown(event) {
    try {
      if (this.isDisabled) return;

      if (event?.key && NAV_KEYS.some((ignore) => ignore === event.key)) {
        this._readOnlyStr = "";
        this._readOnlyStrTimeStamp = Date.now();
      } else if (event.key) {
        this.handleTypeAhead(event);
        return;
      }

      if (event.key === "Escape") {
        if (this.isComboBoxOpen) {
          event.preventDefault();
          this.closeDropdown();
        } else {
          this.handleSelection(true);
        }
        return;
      }

      if (event.key === "Tab") {
        this.closeDropdown();
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (!this.isComboBoxOpen) {
          this.openDropdown();
          return;
        }
        this._dropdownEl?.moveFocus?.(event.key === "ArrowDown" ? 1 : -1);
        return;
      }

      if (event.key === "Enter" && this.isComboBoxOpen) {
        event.preventDefault();
        const focusedValue = this._dropdownEl?.getFocusedValue?.();
        if (focusedValue !== undefined) this.selectValue(focusedValue);
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        this.openDropdown();
      }
    } catch (error) {
      this.showToast(
        "Error in handleKeyDown() of sldsComboboxPortal.js",
        getErrorMessage(error),
        "error"
      );
    }
  }

  handleTypeAhead(event) {
    const now = Date.now();
    const last = Number(this._readOnlyStrTimeStamp) || 0;
    const diffMs = now - last;

    if (!last || diffMs > 1200) {
      this._readOnlyStr = "";
    }

    const { nextStr, match } = handleReadOnlySearch(
      event,
      this._readOnlyStr,
      this.localOptions
    );
    if (typeof nextStr !== "string") return;

    this._readOnlyStr = nextStr;
    this._readOnlyStrTimeStamp = now;

    if (!this.isComboBoxOpen) this.openDropdown();
    if (match) {
      event.preventDefault();
      requestAnimationFrame(() => this._dropdownEl?.focusValue?.(match.value));
    }
  }

  toggleDropdown() {
    if (this.isComboBoxOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown() {
    if (this.isDisabled) return;

    this.isComboBoxOpen = true;
    this.dispatchEvent(new CustomEvent("open", { detail: "open" }));
    this._needsOpenFocus = true;
    this.addGlobalListeners();
  }

  closeDropdown(sendSelection = true) {
    if (!this.isComboBoxOpen && !this._dropdownEl) return;

    this.isComboBoxOpen = false;
    this.highlightedOptionId = null;
    this._needsOpenFocus = false;
    this.removeGlobalListeners();
    this.removePortaledDropdown();
    if (sendSelection) this.handleSelection();
  }

  handleSelection(manual = false) {
    if (this.eventSending) {
      if (this._restoreFocusAfterSelection) {
        this._restoreFocusAfterSelection = false;
        this.restoreInputFocus(true);
      }
      return;
    }

    this.eventSending = true;
    window.setTimeout(() => {
      try {
        if (this._currentValue !== this.originalValue || manual) {
          this.originalValue = this._currentValue;
          this.dispatchEvent(
            new CustomEvent("selected", {
              detail: manual
                ? ""
                : this._currentValue === "--None--"
                  ? null
                  : this._currentValue
            })
          );
        }
      } catch (error) {
        getToastErrorMessage(
          "handleSelection-timeout",
          "SldsComboboxPortal",
          error
        );
      } finally {
        this.eventSending = false;
        if (this._restoreFocusAfterSelection) {
          this._restoreFocusAfterSelection = false;
          this.restoreInputFocus(true);
        }
      }
    }, 25);
  }

  syncDropdownProperties() {
    if (!this._dropdownEl) return;

    this._dropdownEl.listboxId = this.listboxId;
    this._dropdownEl.options = this.localOptions;
    this._dropdownEl.currentValue = this._currentValue;
    this._dropdownEl.hasMeta = this.hasMeta;
    this._dropdownEl.dropdownLength = this.dropdownLength;
    this._dropdownEl.flipUp = this.flipUp;
    this._dropdownEl.fontSize = this.fontSize;
  }

  portalDropdown() {
    const dropdown = this._dropdownEl;
    if (!dropdown || typeof document === "undefined") return;

    dropdown.selectionCallback = this.dropdownSelectionCallback;
    dropdown.optionMouseDownCallback = this.dropdownMouseDownCallback;
    dropdown.style.display = "";
    dropdown.removeAttribute("aria-hidden");

    const host = ensurePortalRoot();
    if (dropdown.parentNode !== host) {
      host.appendChild(dropdown);
    }
  }

  removePortaledDropdown(remove = false) {
    const dropdown = this._dropdownEl;
    if (!dropdown) return;

    dropdown.style.display = "none";
    dropdown.setAttribute("aria-hidden", "true");
    if (remove && dropdown.parentNode) {
      Node.prototype.removeChild.call(dropdown.parentNode, dropdown);
    }
  }

  handleDropdownMouseDown = (event) => {
    event?.stopPropagation();
    this.handleDropdownMouseDownDetail();
  };

  dropdownMouseDownCallback = () => {
    this.handleDropdownMouseDownDetail();
  };

  handleDropdownMouseDownDetail() {
    this._suppressBlur = true;
    this._restoreFocusAfterSelection = true;
    this.template
      .querySelector('[data-id="sldsComboboxInput"]')
      ?.focus({ preventScroll: true });
    this.clearFocusRestoreTimers();
    const timerId = window.setTimeout(() => {
      this._suppressBlur = false;
    }, 150);
    this._focusRestoreTimerIds.push(timerId);
  }

  handleDropdownSelection = (event) => {
    event.stopPropagation();
    this.selectValue(event.detail);
  };

  dropdownSelectionCallback = (value) => {
    this.selectValue(value);
  };

  selectValue(value) {
    const stringVal = String(value ?? "");
    this._suppressBlur = true;
    this._restoreFocusAfterSelection = true;
    this._currentValue = value ?? "";
    this.localOptions = this.localOptions.map((option) => ({
      ...option,
      isSelected: String(option.value ?? "") === stringVal
    }));
    this.syncDropdownProperties();
    this.closeDropdown();
    this.restoreInputFocus(true);
  }

  restoreInputFocus(includeDelayedAttempts = false) {
    this.clearFocusRestoreTimers();
    const focusInput = () => {
      if (!this.isConnected || this.isDisabled) return;
      this.template
        .querySelector('[data-id="sldsComboboxInput"]')
        ?.focus({ preventScroll: true });
    };

    focusInput();
    Promise.resolve().then(focusInput);
    requestAnimationFrame(focusInput);

    if (includeDelayedAttempts) {
      [0, 50, 150].forEach((delay) => {
        const timerId = window.setTimeout(() => {
          focusInput();
          if (delay === 150) {
            this._suppressBlur = false;
          }
        }, delay);
        this._focusRestoreTimerIds.push(timerId);
      });
    }
  }

  clearFocusRestoreTimers() {
    this._focusRestoreTimerIds.forEach((timerId) => {
      window.clearTimeout(timerId);
    });
    this._focusRestoreTimerIds = [];
  }

  positionDropdown = () => {
    if (!this._dropdownEl || !this.isComboBoxOpen) return;

    const anchor =
      this.template.querySelector('[data-id="sldsComboboxInput"]') ||
      this.template.querySelector('[data-id="combobox"]');
    if (!anchor) return;

    this._dropdownEl.positionAgainst?.(anchor, 0);
  };

  addGlobalListeners() {
    window.addEventListener("resize", this.positionDropdown);
    window.addEventListener("scroll", this.positionDropdown, true);
    window.addEventListener("pointerdown", this.handleOutsidePointerDown, true);
  }

  removeGlobalListeners() {
    window.removeEventListener("resize", this.positionDropdown);
    window.removeEventListener("scroll", this.positionDropdown, true);
    window.removeEventListener(
      "pointerdown",
      this.handleOutsidePointerDown,
      true
    );
  }

  handleOutsidePointerDown = (event) => {
    const path =
      typeof event.composedPath === "function" ? event.composedPath() : [];
    if (path.includes(this._dropdownEl) || path.includes(this.template.host))
      return;
    this.closeDropdown();
  };

  teardownPortal() {
    this.removeGlobalListeners();
    this.removePortaledDropdown(true);
    this._dropdownEl = null;
  }

  handleRequiredErrorAttributes(isError = false) {
    const inputEle = this.template.querySelector(
      '[data-id="sldsComboboxInput"]'
    );
    if (isError) {
      this._hasError = true;
      this._mainFormElementCl = "slds-form-element slds-has-error";
      inputEle?.setAttribute("aria-describedby", "error-message-unique-id");
    } else {
      this._hasError = false;
      this._mainFormElementCl = "slds-form-element";
      inputEle?.removeAttribute("aria-describedby");
    }
  }

  _applyVarsDirect(cssVar, varStyle = null) {
    const isValid = (cssVarP, varStyleP) =>
      typeof cssVarP === "string" &&
      typeof varStyleP === "string" &&
      cssVarP.startsWith("--") &&
      varStyleP;

    const el = this.template.host;
    if (Array.isArray(cssVar)) {
      cssVar.forEach((hostVar) => {
        if (Array.isArray(hostVar) && isValid(hostVar[0], hostVar[1])) {
          el.style.setProperty(hostVar[0], hostVar[1]);
        } else if (
          typeof hostVar === "object" &&
          isValid(hostVar.cssVar, hostVar.varStyle)
        ) {
          el.style.setProperty(hostVar.cssVar, hostVar.varStyle);
        }
      });
    } else if (isValid(cssVar, varStyle)) {
      el.style.setProperty(cssVar, varStyle);
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
      variant,
      mode: modeP,
      message,
      header: {
        text: title
      }
    };
  }
}
