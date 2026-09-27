/**
 * sldsComboboxPortalDropdown — parent integration guide
 *
 * 1. Dependencies
 * - Salesforce/platform modules: lwc.
 * - Template children (including conditional UI): lightning-icon.
 * - Bundle template: sldsComboboxPortalDropdown.html; local styles: sldsComboboxPortalDropdown.css.
 * Salesforce SLDS styling is expected.
 * - Shared CSS modules: c/sharedStylesSldsCombobox.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-combobox-portal-dropdown') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - listboxId (listbox-id): ID assigned to the dropdown listbox for accessibility.
 *   Example: child.listboxId = "account-options";
 * - flipUp (flip-up): Requests an upward-opening dropdown. Declared default: false.
 *   Example: child.flipUp = true;
 * - fontSize (font-size): CSS text size, including units.
 *   Example: child.fontSize = "0.875rem";
 * - selectionCallback (selection-callback): Function invoked with the selected scalar option value.
 *   Example: child.selectionCallback = value => { this.value = value; };
 * - optionMouseDownCallback (option-mouse-down-callback): Function invoked before mouse selection so the
 * owner can preserve input focus.
 *   Example: child.optionMouseDownCallback = () => { this.selecting = true; };
 * - options (options): Option array with label and value; optional icon/metadata support depends on the
 * variant.
 *   Example: child.options = [{ label: 'Open', value: 'open' }];
 * - currentValue (current-value): Current input or selected option value; keep parent state in sync with
 * the selection event.
 *   Example: child.currentValue = "open";
 * - hasMeta (has-meta): Enables additional metadata lines on options.
 *   Example: child.hasMeta = true;
 * - dropdownLength (dropdown-length): SLDS dropdown length class suffix; use a supported length such as 5
 * or 7.
 *   Example: child.dropdownLength = 5;
 *
 * Public methods (call on the rendered child):
 * - positionAgainst(anchor, gap = 0): Position the dropdown against an anchor DOM element, with an
 * optional pixel gap.
 * - focusValue(value, fallbackToFirst = false): Focus an option by value, optionally falling back to the
 * first option.
 * - moveFocus(delta): Move listbox focus by a signed option offset.
 * - getFocusedValue(): Read the currently focused option value.
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <button onclick={showDropdown}>Choose status</button>
 *     <template lwc:if={visible}>
 *         <c-slds-combobox-portal-dropdown listbox-id="status-options"
 *             options={options} selection-callback={selectValue}>
 *         </c-slds-combobox-portal-dropdown>
 *     </template>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     options = [{ label: 'Open', value: 'open' }, { label: 'Closed', value: 'closed' }];
 *     visible = false;
 *     value;
 *     anchor;
 *     showDropdown(event) { this.anchor = event.currentTarget; this.visible = true; }
 *     renderedCallback() {
 *         const dropdown = this.template.querySelector('c-slds-combobox-portal-dropdown');
 *         if (dropdown && this.anchor) dropdown.positionAgainst(this.anchor);
 *     }
 *     selectValue = value => { this.value = value; this.visible = false; };
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Internal listbox companion to sldsComboboxPortal; prefer that parent for a complete
 * keyboard-accessible combobox. Direct consumers must own opening/closing, focus restoration,
 * outside-click handling, scroll/resize repositioning and keyboard navigation. This component calls
 * callbacks rather than emitting a selection event.
 */

import { LightningElement, api, track } from "lwc";

const META_KEYS = ["fieldOne", "fieldTwo"];
const VALID_LENGTHS = [5, 7, 10];

export default class SldsComboboxPortalDropdown extends LightningElement {
  @track normalizedOptions = [];

  @api listboxId;
  @api flipUp = false;
  @api fontSize;
  @api selectionCallback;
  @api optionMouseDownCallback;

  _options = [];
  _currentValue = "";
  _focusedValue = null;
  _ignoreNextMouseDownValue = null;
  _ignoreNextClickValue = null;
  _hasMeta = false;

  @api
  set options(value) {
    this._options = Array.isArray(value) ? value : [];
    this.normalizeOptions();
  }
  get options() {
    return this._options;
  }

  @api
  set currentValue(value) {
    this._currentValue = value ?? "";
    this.normalizeOptions();
  }
  get currentValue() {
    return this._currentValue;
  }

  @api
  set hasMeta(value) {
    this._hasMeta = value === true || value === "true";
    this.normalizeOptions();
  }
  get hasMeta() {
    return this._hasMeta;
  }

  @api
  set dropdownLength(value) {
    this._dropdownLength = Number(value);
    this.normalizeOptions();
  }
  get dropdownLength() {
    return this._dropdownLength;
  }

  renderedCallback() {
    if (this.fontSize) {
      this.template.host.style.setProperty(
        "--slds-c-dropdown-font-size",
        this.fontSize
      );
    }
  }

  get dropdownClass() {
    const hasIcons = this.normalizedOptions?.some((opt) => opt?.iconConfig);
    const base = hasIcons
      ? "slds-dropdown_length-with-icon-"
      : "slds-dropdown_length-";
    return `slds-dropdown slds-dropdown_fluid ${base}${this.normalizedDropdownLength}`;
  }

  get normalizedDropdownLength() {
    if (
      this.dropdownLength &&
      VALID_LENGTHS.some((num) => num === this.dropdownLength)
    ) {
      return this.dropdownLength;
    }

    const optionsLength = this.normalizedOptions?.length || 0;
    if (optionsLength >= 12) return 10;
    if (optionsLength >= 9) return 7;
    return 5;
  }

  normalizeOptions() {
    const currentValue = String(this._currentValue ?? "");
    const focusedValue =
      this._focusedValue == null ? null : String(this._focusedValue);

    this.normalizedOptions = (this._options || []).map((option, index) => {
      const value = option.value ?? "";
      const stringValue = String(value);
      const isSelected = stringValue === currentValue;
      const isFocused =
        focusedValue == null ? isSelected : stringValue === focusedValue;
      const hasMeta = META_KEYS.some((key) => !!option?.[key]);
      const showMeta = this.hasMeta && hasMeta;

      return {
        ...option,
        index,
        key: option?.key ?? `${stringValue}-${index}`,
        id:
          option?.id ??
          `${this.listboxId || "slds-combobox-portal-listbox"}-option-${index}`,
        value,
        label: option.label ?? "",
        isSelected,
        isFocused,
        showMeta,
        metaText: [option.fieldOne, option.fieldTwo]
          .filter(Boolean)
          .join(" | "),
        optionClass: this.getOptionClass(showMeta, isSelected, isFocused),
        ariaSelected: isFocused || isSelected ? "true" : "false",
        ariaChecked: isSelected ? "true" : "false"
      };
    });
  }

  getOptionClass(showMeta, isSelected, isFocused) {
    const base = showMeta
      ? "slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta"
      : "slds-media slds-media_center slds-listbox__option slds-listbox__option_plain slds-media_small";
    const selectedClass = isSelected ? " slds-is-selected" : "";
    const focusClass = isFocused ? " slds-has-focus" : "";
    return `${base}${selectedClass}${focusClass}`;
  }

  @api
  positionAgainst(anchor, gap = 0) {
    const dropdown = this.template.querySelector('[data-element="dropdown"]');
    if (!dropdown || !anchor) return;

    const rect = anchor.getBoundingClientRect();
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;

    dropdown.style.visibility = "hidden";
    dropdown.style.width = `${rect.width}px`;
    dropdown.style.left = `${rect.left}px`;

    const dropdownHeight = dropdown.getBoundingClientRect().height;
    const shouldFlip =
      this.flipUp ||
      (rect.bottom + gap + dropdownHeight > viewportHeight &&
        rect.top > dropdownHeight);
    const top = shouldFlip
      ? rect.top - gap - dropdownHeight
      : rect.bottom + gap;

    dropdown.style.top = `${Math.max(0, top)}px`;
    dropdown.style.visibility = "visible";
  }

  @api
  focusValue(value, fallbackToFirst = false) {
    const stringValue = String(value ?? "");
    const match = this.normalizedOptions.find(
      (option) => String(option.value ?? "") === stringValue
    );
    const focused =
      match || (fallbackToFirst ? this.normalizedOptions[0] : null);

    if (!focused) return null;

    this._focusedValue = focused.value;
    this.normalizeOptions();
    requestAnimationFrame(() => {
      this.template
        .querySelector(`[data-index="${focused.index}"]`)
        ?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
    });
    return focused.value;
  }

  @api
  moveFocus(delta) {
    if (!this.normalizedOptions.length) return null;

    const focusedIndex = this.normalizedOptions.findIndex(
      (option) => option.isFocused
    );
    const nextIndex =
      focusedIndex === -1
        ? delta > 0
          ? 0
          : this.normalizedOptions.length - 1
        : (focusedIndex + delta + this.normalizedOptions.length) %
          this.normalizedOptions.length;

    return this.focusValue(this.normalizedOptions[nextIndex].value, true);
  }

  @api
  getFocusedValue() {
    const focused = this.normalizedOptions.find((option) => option.isFocused);
    return focused?.value;
  }

  handleOptionPointerDown(event) {
    this.selectFromOptionPress(event);
  }

  handleOptionMouseDown(event) {
    const value = String(event.currentTarget.dataset.value ?? "");

    if (this._ignoreNextMouseDownValue === value) {
      event.preventDefault();
      event.stopPropagation();
      this._ignoreNextMouseDownValue = null;
      return;
    }

    this.selectFromOptionPress(event);
  }

  selectFromOptionPress(event) {
    event.preventDefault();
    event.stopPropagation();
    const value = event.currentTarget.dataset.value;
    const stringValue = String(value ?? "");

    this._ignoreNextMouseDownValue = stringValue;
    this._ignoreNextClickValue = stringValue;

    if (typeof this.optionMouseDownCallback === "function") {
      this.optionMouseDownCallback();
    }

    if (typeof this.selectionCallback === "function") {
      this.selectionCallback(value);
      return;
    }

    this.dispatchEvent(
      new CustomEvent("optionmousedown", {
        bubbles: true,
        composed: true
      })
    );
    this.dispatchEvent(
      new CustomEvent("selection", {
        detail: value,
        bubbles: true,
        composed: true
      })
    );
  }

  handleOptionMouseEnter(event) {
    this.focusValue(event.currentTarget.dataset.value);
  }

  handleOptionMouseLeave() {
    this._focusedValue = null;
    this.normalizeOptions();
  }

  handleOptionClick(event) {
    const value = event.currentTarget.dataset.value;
    const stringValue = String(value ?? "");

    if (this._ignoreNextClickValue === stringValue) {
      this._ignoreNextClickValue = null;
      return;
    }

    if (typeof this.selectionCallback === "function") {
      this.selectionCallback(value);
      return;
    }

    this.dispatchEvent(
      new CustomEvent("selection", {
        detail: value,
        bubbles: true,
        composed: true
      })
    );
  }
}
