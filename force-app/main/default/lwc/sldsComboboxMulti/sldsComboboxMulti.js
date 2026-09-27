/**
 * sldsComboboxMulti — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/utils.
 * - Salesforce/platform modules: lwc.
 * - Bundle template: sldsComboboxMulti.html; local styles: sldsComboboxMulti.css. Salesforce SLDS styling
 * is expected.
 * - Shared CSS modules: c/sharedStylesSldsCombobox, c/sharedStylesGlobal.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-combobox-multi') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - label (label): Visible control label. Declared default: ''.
 *   Example: child.label = "Status";
 * - placeHolder (place-holder): Prompt shown when the input has no selection or text. Declared default:
 * 'Select one or more...'.
 *   Example: child.placeHolder = "Select an option";
 * - suppressOverflow (suppress-overflow): Compatibility property: suppresses the multi-select overflow
 * treatment; currently stored/exposed but not consumed by this implementation. Declared default: false.
 *   Example: child.suppressOverflow = true;
 * - dropdownLength (dropdown-length): SLDS dropdown length class suffix; use a supported length such as 5
 * or 7.
 *   Example: child.dropdownLength = 5;
 * - flipUp (flip-up): Requests an upward-opening dropdown. Declared default: false.
 *   Example: child.flipUp = true;
 * - search (search): Enables typing to filter options.
 *   Example: child.search = true;
 * - isDisabled (is-disabled): Disables interaction with the control.
 *   Example: child.isDisabled = true;
 * - alwaysDisplayPills (always-display-pills): Keeps selected-value pills visible when the control loses
 * focus.
 *   Example: child.alwaysDisplayPills = true;
 * - currentValue (current-value): Array of selected values, or a semicolon-delimited string.
 *   Example: child.currentValue = ['open'];
 * - suppressMargin (suppress-margin): Removes the component's bottom margin when enabled.
 *   Example: child.suppressMargin = true;
 * - borderRadius (border-radius): CSS corner radius, including units.
 *   Example: child.borderRadius = "0.25rem";
 * - showNone (show-none): Uses the no-selection pillbox presentation and its compact empty height.
 *   Example: child.showNone = true;
 * - isRequired (is-required): Marks the control as required; validation behavior is component-specific.
 *   Example: child.isRequired = true;
 * - options (options): Option array with label and value; optional icon/metadata support depends on the
 * variant.
 *   Example: child.options = [{ label: 'Open', value: 'open' }];
 * - groupedOptions (grouped-options): Groups shaped as { label, options: [{ label, value }] }; use instead
 * of flat options.
 *   Example: child.groupedOptions = [{ label: 'Status', options: [{ label: 'Open', value: 'open' }] }];
 * - minSelections (min-selections): Minimum number of choices required by selection validation.
 *   Example: child.minSelections = 1;
 * - maxSelections (max-selections): Maximum number of choices allowed by selection validation.
 *   Example: child.maxSelections = 3;
 * - isPopover (is-popover): Compatibility property: enables popover-specific blur/keyboard handling;
 * currently stored/exposed but not consumed by this implementation.
 *   Example: child.isPopover = true;
 * - pillMaxWidth (pill-max-width): Maximum CSS width of an individual selected-value pill.
 *   Example: child.pillMaxWidth = "12rem";
 * - isAddon (is-addon): Compatibility property: uses styles intended for an adjacent addon control;
 * currently stored/exposed but not consumed by this implementation.
 *   Example: child.isAddon = true;
 *
 * Public methods (call on the rendered child):
 * - focusMe(): Focus the component input/control.
 * - errorMe(errMsg = null): Mark the control invalid; accepts an optional error message where supported.
 * - removeErrorMe(): Clear the externally marked validation error.
 * - getValue(): Read the current component value.
 * - clearMe(): Clear/reset the input value.
 * - clearValues(): Clear the selected values.
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-slds-combobox-multi label="Statuses" options={options}
 *         current-value={values} search={enabled}
 *         oncombomultiselection={handleSelection}></c-slds-combobox-multi>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     options = [{ label: 'Open', value: 'open' }, { label: 'Closed', value: 'closed' }];
 *     enabled = true;
 *     values = ['open'];
 *     handleSelection(event) { this.values = event.detail; }
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Use for multiple choices with removable pills. combomultiselection.detail is an array, including []
 * when empty. current-value also accepts a Salesforce semicolon-delimited multipicklist string.
 * - Grouped variant: replace options={options} with grouped-options={groups}; define groups = [{ label:
 * 'Status', options: this.options }]. min-selections and max-selections configure validation;
 * errorMe/removeErrorMe control externally reported errors.
 */

import { LightningElement, api, track } from 'lwc';
import {
    handleReadOnlySearch,
    publicPropertyToBool,
    iconPath,
    handleDropdownFlip,
    iconMap as ICON_MAP
} from 'c/utils';

const NAV_KEYS = ['Enter', 'Escape', 'Shift', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'];
const ALPHA_NUMERIC_KEYS = [
    ...'abcdefghijklmnopqrstuvwxyz',
    ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    ...'0123456789'
];
const META_KEYS = ['metaOne', 'metaTwo', 'metaThree', 'metaFour'];
const DROPDOWN_FLUID = 'slds-dropdown slds-dropdown_fluid';

function isValidVal(val) {
    return (val || val === 0) && val !== '—';
}

function parseIcon(option) {
    const icon = option.icon ? iconPath(option.icon, true) : null;
    if (icon) {
        return {
            ...icon,
            container: `${icon.container} slds-pill__icon_container`
        };
    }
    return null;
}

function getSearchScore(option, rawTerm) {
    const term = String(rawTerm ?? '').trim().toLowerCase();
    if (!term) {
        return Number.NEGATIVE_INFINITY;
    }

    const label = String(option?.label ?? '').toLowerCase();
    const metaValues = META_KEYS.map((key) => String(option?.[key] ?? '').toLowerCase());
    const optionValue = String(option?.value ?? '').toLowerCase();

    if (label === term) return 500;
    if (label.startsWith(term)) return 400 - (label.length - term.length);
    if (label.includes(term)) return 300 - label.indexOf(term);

    const metaPrefixIndex = metaValues.findIndex((value) => value.startsWith(term));
    if (metaPrefixIndex > -1) return 200 - metaPrefixIndex;

    const metaIncludesIndex = metaValues.findIndex((value) => value.includes(term));
    if (metaIncludesIndex > -1) return 150 - metaIncludesIndex;

    if (optionValue.startsWith(term)) return 100;
    if (optionValue.includes(term)) return 50;

    return Number.NEGATIVE_INFINITY;
}

export default class SldsComboboxMulti extends LightningElement {
    @track iconMap = ICON_MAP;

    idCnt = 300;
    stableId = 39393483;
    groupId = 3000;

    _dropdownTrigger;
    _comboOptions;
    _inputEle;
    _groupHeaders;
    _readOnlyStr = '';
    _readOnlyStrTimeStamp = 0;
    _expandedFromMore = false;
    _pillRemovePointerPending = false;
    _disableMarked = false;
    _activePillStableId = null;

    @track _options = [];
    @track _groupedOptions = [];
    @track isGrouped = false;
    @track selectionsError = null;
    @track hasError = false;
    @track isPillsExpanded = false;
    @track isPillFocusActive = false;
    @track searchTerm = '';
    @track isInputFocused = false;

    @api label = '';
    @api placeHolder = 'Select one or more...';
    @api suppressOverflow = false;
    @api dropdownLength;
    @api flipUp = false;

    @api
    set search(value) {
        this._search = publicPropertyToBool(value);
    }
    get search() {
        return this._search ?? false;
    }

    @api
    set isDisabled(val) {
        this._isDisabled = publicPropertyToBool(val);
    }
    get isDisabled() {
        return this._isDisabled ?? false;
    }

    @api
    set alwaysDisplayPills(val) {
        this._alwaysDisplayPills = publicPropertyToBool(val);
    }
    get alwaysDisplayPills() {
        return this._alwaysDisplayPills ?? false;
    }

    @api
    set currentValue(val) {
        this._currentValue = typeof val === 'string' ? val.split(';') : val;
        this.applySelectionsFromCurrentValue();
    }
    get currentValue() {
        return this._currentValue;
    }

    @api
    set suppressMargin(val) {
        this._suppressMargin = val;
        if (publicPropertyToBool(val)) {
            this._applyVarsDirect('--c-margin-bottom', '0px');
        }
    }
    get suppressMargin() {
        return this._suppressMargin;
    }

    @api
    set borderRadius(val) {
        this._borderRadius = val;
        if (val) {
            this._applyVarsDirect([
                ['--slds-c-input-radius-border', val],
                ['--c-border-radius', val]
            ]);
        }
    }
    get borderRadius() {
        return this._borderRadius;
    }

    @api
    set showNone(val) {
        this._showNone = val;
        if (publicPropertyToBool(val)) {
            this._applyVarsDirect('--c-pillbox-inactive-height', '0px');
            this._applyVarsDirect('--c-input-border-radius-bottom', 'var(--c-border-radius, var(--slds-c-input-radius-border, 0.25rem))');
        }
    }
    get showNone() {
        return this._showNone;
    }

    @api
    set isRequired(val) {
        this._isRequired = publicPropertyToBool(val);
    }
    get isRequired() {
        return this._isRequired;
    }

    @api
    set options(val) {
        this.isGrouped = false;
        this._options = (val ?? []).map((option) => this.normalizeOption(option));
        this.applySelectionsFromCurrentValue();
    }
    get options() {
        return this._options;
    }

    @api
    set groupedOptions(val) {
        this.isGrouped = true;
        this._groupedOptions = (val ?? []).map((group) => ({
            label: group.label,
            groupId: `${group.label}-${this.groupId++}`,
            options: (group.options ?? []).map((option) => ({
                ...this.normalizeOption(option),
                group: group.label
            }))
        }));
        this.applySelectionsFromCurrentValue();
    }
    get groupedOptions() {
        return this._groupedOptions;
    }

    @api
    set minSelections(val) {
        this._minSelections = val ? parseInt(val, 10) : null;
    }
    get minSelections() {
        return this._minSelections;
    }

    @api
    set maxSelections(val) {
        this._maxSelections = val ? parseInt(val, 10) : null;
    }
    get maxSelections() {
        return this._maxSelections;
    }

    @api
    set isPopover(val) {
        this._isPopover = publicPropertyToBool(val);
    }
    get isPopover() {
        return this._isPopover;
    }

    @api
    set pillMaxWidth(val) {
        this._pillMaxWidth = val;
        if (val) {
            this._applyVarsDirect('--c-pill-max-width', val);
        }
    }
    get pillMaxWidth() {
        return this._pillMaxWidth;
    }

    @api
    set isAddon(val) {
        this._isAddon = publicPropertyToBool(val);
    }
    get isAddon() {
        return this._isAddon;
    }

    @api focusMe() {
        this.refs?.inputEle?.focus();
    }

    @api errorMe(errMsg = null) {
        this.selectionsError = errMsg || 'This field is required';
        this.hasError = true;
    }

    @api removeErrorMe() {
        this.selectionsError = null;
        this.hasError = false;
    }

    @api getValue() {
        return this.pills.map((pill) => pill.value);
    }

    @api clearMe() {
        this._options = [];
        this._groupedOptions = [];
        this.isGrouped = false;
        this._currentValue = [];
        this.searchTerm = '';
    }

    @api clearValues() {
        if (this.isGrouped) {
            this._groupedOptions = this._groupedOptions.map((group) => ({
                ...group,
                options: group.options.map((option) => ({
                    ...option,
                    isSelected: false
                }))
            }));
        } else {
            this._options = this._options.map((option) => ({
                ...option,
                isSelected: false
            }));
        }
        this._currentValue = [];
        this.updatePillErrorStatus();
    }

    normalizeOption(option) {
        const normalizedIcon = option?.icon
            ? (typeof option.icon === 'string' ? iconPath(option.icon, true) : option.icon)
            : null;

        return {
            ...option,
            id: option?.id ?? `option-id-${this.idCnt++}`,
            stableId: option?.stableId ?? `${this.stableId++}`,
            icon: normalizedIcon,
            pillIcon: parseIcon(option),
            hasMeta: META_KEYS.some((key) => !!option?.[key]),
            isSelected: !!option?.isSelected
        };
    }

    applySelectionsFromCurrentValue() {
        const rawValues = Array.isArray(this._currentValue)
            ? this._currentValue
            : (this._currentValue ? [this._currentValue] : []);
        const selectedSet = new Set(rawValues.filter((value) => isValidVal(value)));

        if (this.isGrouped) {
            this._groupedOptions = this._groupedOptions.map((group) => ({
                ...group,
                options: group.options.map((option) => ({
                    ...option,
                    isSelected: selectedSet.has(option.value)
                }))
            }));
            return;
        }

        this._options = this._options.map((option) => ({
            ...option,
            isSelected: selectedSet.has(option.value)
        }));
    }

    renderedCallback() {
        this._dropdownTrigger = this.template.querySelector('.combo-trigger');
        this._comboOptions = this.template.querySelectorAll('.combo-option[role="option"]');
        this._inputEle = this.refs?.inputEle;
        this._groupHeaders = this.template.querySelectorAll('[data-element="groupHeader"]');

        if (this.isDisabled && !this._disableMarked) {
            const input = this.refs?.inputEle;
            if (input) {
                input.classList.add('slds-is-disabled');
                this._disableMarked = true;
            }
        }
    }

    get flatGroupedOptions() {
        return this._groupedOptions.map((group) => group.options).flat();
    }

    get allOptions() {
        return this.isGrouped ? this.flatGroupedOptions : this._options;
    }

    get filteredOptions() {
        if (this.isGrouped) {
            return [];
        }

        if (!this.search) {
            return this._options;
        }

        const term = this.searchTerm.trim().toLowerCase();
        if (!term) {
            return this._options;
        }

        return this._options
            .map((option, index) => ({
                option,
                index,
                score: getSearchScore(option, term)
            }))
            .filter(({ score }) => score > Number.NEGATIVE_INFINITY)
            .sort((left, right) => {
                if (right.score !== left.score) {
                    return right.score - left.score;
                }
                return left.index - right.index;
            })
            .map(({ option }) => option);
    }

    get filteredGroupedOptions() {
        if (!this.isGrouped) {
            return [];
        }

        if (!this.search) {
            return this._groupedOptions;
        }

        const term = this.searchTerm.trim().toLowerCase();
        if (!term) {
            return this._groupedOptions;
        }

        return this._groupedOptions
            .map((group) => ({
                ...group,
                options: group.options
                    .map((option, index) => ({
                        option,
                        index,
                        score: getSearchScore(option, term)
                    }))
                    .filter(({ score }) => score > Number.NEGATIVE_INFINITY)
                    .sort((left, right) => {
                        if (right.score !== left.score) {
                            return right.score - left.score;
                        }
                        return left.index - right.index;
                    })
                    .map(({ option }) => option)
            }))
            .filter((group) => group.options.length);
    }

    decorateOption(option) {
        return {
            ...option,
            ariaSelected: option.isSelected ? 'true' : 'false',
            ariaChecked: option.isSelected ? 'true' : 'false',
            className: [
                'combo-option',
                'slds-media',
                'slds-media_small',
                'slds-listbox__option',
                'slds-listbox__option_entity',
                option.hasMeta ? 'slds-listbox__option_has-meta' : 'slds-listbox__option_plain',
                option.isSelected ? 'slds-is-selected' : ''
            ].filter(Boolean).join(' ')
        };
    }

    get displayOptions() {
        return this.filteredOptions.map((option) => this.decorateOption(option));
    }

    get displayGroups() {
        return this.filteredGroupedOptions.map((group) => ({
            ...group,
            options: group.options.map((option) => this.decorateOption(option))
        }));
    }

    get hasIcons() {
        return this.allOptions.some((option) => !!option.icon);
    }

    get pills() {
        const selectedPills = this.allOptions
            .filter((option) => option.isSelected && isValidVal(option.value))
            .map((option) => ({
                ...option,
                pillIndex: 0
            }));

        const hasActive = selectedPills.some((pill) => pill.stableId === this._activePillStableId);
        const activeStableId = hasActive
            ? this._activePillStableId
            : selectedPills[0]?.stableId;

        this._activePillStableId = activeStableId ?? null;

        return selectedPills.map((pill, index) => ({
            ...pill,
            removeTabIndex: pill.stableId === activeStableId ? '0' : '-1',
            pillIndex: index
        }));
    }

    get displayedPills() {
        if (this.alwaysDisplayPills) {
            return this.pills;
        }
        return this.isPillsExpanded ? this.pills : this.pills.slice(0, 2);
    }

    get hiddenPillCount() {
        return Math.max(this.pills.length - this.displayedPills.length, 0);
    }

    get hasVisiblePills() {
        return this.pills.length > 0;
    }

    get selectionGroupClass() {
        const classes = ['slds-listbox_selection-group'];
        if (this.alwaysDisplayPills || this.isPillsExpanded || this.isPillFocusActive) {
            classes.push('slds-is-expanded');
        }
        if (this.alwaysDisplayPills) {
            classes.push('slds-is-static');
        }
        if (this.isDisabled) {
            classes.push('slds-is-disabled');
        }
        return classes.join(' ');
    }

    get triggerClass() {
        const classes = [
            'slds-combobox',
            'slds-dropdown-trigger',
            'slds-dropdown-trigger_click',
            'combo-trigger'
        ];
        if (this.search) {
            classes.push('trigger-search');
        }
        if (this.isOpen) {
            classes.push('slds-is-open');
        }
        return classes.join(' ');
    }

    get comboFormClass() {
        return this.search
            ? 'slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right searchable'
            : 'slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right';
    }

    get inputClass() {
        const selectionCl = this.pills?.length ? ' vg-has-selection' : '';
        const base = this.search
            ? `slds-input slds-combobox__input combo-input${selectionCl}`
            : `slds-input slds-combobox__input slds-combobox__input-value combo-input${selectionCl}`;

        return this.isInputFocused && !this.isPillFocusActive
            ? `${base} slds-has-focus`
            : base;
    }

    get inputValue() {
        if (this.search) {
            return this.searchTerm;
        }
        if (!this.minSelections) {
            return this.pills.length ? `${this.pills.length} options selected` : '';
        }
        return `${this.pills.length} of ${this.minSelections} selected`;
    }

    get inputIconHref() {
        return this.search ? this.iconMap.utility.search : this.iconMap.utility.down;
    }

    get isInputReadOnly() {
        return !this.search;
    }

    get isOpen() {
        return this._dropdownTrigger?.classList?.contains('slds-is-open');
    }

    get dropdownLengthCl() {
        const optionList = this.isGrouped
            ? this.displayGroups.map((group) => group.options).flat()
            : this.displayOptions;
        const hasIcons = optionList.some((option) => !!option.icon);
        const base = hasIcons ? 'slds-dropdown_length-with-icon-' : 'slds-dropdown_length-';

        if (this.dropdownLength && [5, 7, 10].includes(Number(this.dropdownLength))) {
            return `${DROPDOWN_FLUID} ${base}${this.dropdownLength}`;
        }

        const optionsLength = optionList.length;
        if (optionsLength >= 12) return `${DROPDOWN_FLUID} ${base}10`;
        if (optionsLength >= 9) return `${DROPDOWN_FLUID} ${base}7`;
        return `${DROPDOWN_FLUID} ${base}5`;
    }

    get formElementClass() {
        return this.hasError ? 'slds-form-element slds-has-error' : 'slds-form-element';
    }

    handleDispatch() {
        this.dispatchEvent(new CustomEvent('combomultiselection', {
            detail: this.pills.length ? this.pills.map((pill) => pill.value) : [],
            bubbles: true,
            composed: true
        }));
    }

    updatePillErrorStatus() {
        const formElement = this.template.querySelector('[data-id="formElement"]');
        if (!formElement || !this._inputEle) {
            return;
        }

        if (this.maxSelections && this.pills.length > this.maxSelections) {
            formElement.classList.add('slds-has-error');
            this._inputEle.setAttribute('aria-describedby', 'error-message-unique-id');
            this._inputEle.setAttribute('aria-invalid', 'true');
            this.selectionsError = `Only ${this._maxSelections} selections allowed`;
            return;
        }

        if (this.minSelections && this.pills.length < this.minSelections) {
            formElement.classList.add('slds-has-error');
            this._inputEle.setAttribute('aria-describedby', 'error-message-unique-id');
            this._inputEle.setAttribute('aria-invalid', 'true');
            this.selectionsError = `${this.minSelections} selections required`;
            return;
        }

        formElement.classList.remove('slds-has-error');
        this._inputEle.removeAttribute('aria-describedby');
        this._inputEle.setAttribute('aria-invalid', 'false');
        if (!this.hasError) {
            this.selectionsError = null;
        }
    }

    setOptionSelected(stableId, isSelected) {
        if (this.isGrouped) {
            this._groupedOptions = this._groupedOptions.map((group) => ({
                ...group,
                options: group.options.map((option) => option.stableId === stableId
                    ? { ...option, isSelected }
                    : option)
            }));
            return;
        }

        this._options = this._options.map((option) => option.stableId === stableId
            ? { ...option, isSelected }
            : option);
    }

    toggleSelection(stableId) {
        const target = this.allOptions.find((option) => option.stableId === stableId);
        if (!target) {
            return;
        }

        this.setOptionSelected(stableId, !target.isSelected);
        this.updatePillErrorStatus();
        this.handleDispatch();
    }

    removeOptionByStableId(stableId) {
        this.setOptionSelected(stableId, false);
        this.updatePillErrorStatus();
        this.handleDispatch();
    }

    openCombobox(clearReadStr = false, isNav = false) {
        if (clearReadStr) {
            this._readOnlyStr = '';
        }
        if (this._dropdownTrigger) {
            this._dropdownTrigger.classList.add('slds-is-open');
            this._dropdownTrigger.setAttribute('aria-expanded', 'true');
            requestAnimationFrame(() => {
                handleDropdownFlip(this);
            });
        }

        if (!isNav) {
            this.handleFauxFocusOption(this._comboOptions?.[0]?.id);
        }
    }

    closeCombobox() {
        if (this._dropdownTrigger) {
            this._dropdownTrigger.classList.remove('slds-is-open');
            this._dropdownTrigger.setAttribute('aria-expanded', 'false');
        }
        Array.from(this._comboOptions || []).forEach((option) => {
            option.classList.remove('slds-has-focus');
            option.setAttribute('aria-selected', 'false');
        });
        this.updatePillErrorStatus();
        if (!this.hasError) {
            this.handleDispatch();
        }
    }

    handleFauxFocusOption(optionId) {
        if (!optionId || !this._comboOptions) {
            return;
        }

        let count = 0;
        this._comboOptions.forEach((option) => {
            if (option.id === optionId) {
                option.setAttribute('aria-selected', 'true');
                option.classList.add('slds-has-focus');
                if (this._groupHeaders?.length && count === 0) {
                    this._groupHeaders[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    option.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            } else {
                option.setAttribute('aria-selected', 'false');
                option.classList.remove('slds-has-focus');
            }
            count++;
        });
    }

    handleRootFocusIn() {
        const active = this.template.activeElement;
        this.isPillFocusActive = !!active?.closest?.('[data-pill-focus="true"], [data-pill-remove-focus="true"]');
        if (this.shouldExpandSelectionGroup(active)) {
            this.isPillsExpanded = true;
        }
    }

    handleRootFocusOut(event) {
        const next = event.relatedTarget;
        if (next && this.template.contains(next)) {
            if (this.shouldExpandSelectionGroup(next)) {
                this.isPillsExpanded = true;
                return;
            }
        }

        requestAnimationFrame(() => {
            if (this._pillRemovePointerPending) {
                this.isPillsExpanded = true;
                this.isPillFocusActive = true;
                return;
            }

            const active = this.template.activeElement;
            if (active && this.template.contains(active) && this.shouldExpandSelectionGroup(active)) {
                this.isPillFocusActive = !!active?.closest?.('[data-pill-focus="true"], [data-pill-remove-focus="true"]');
                this.isPillsExpanded = true;
                return;
            }

            this.isPillsExpanded = false;
            this.isPillFocusActive = false;
            this._expandedFromMore = false;
            this.closeCombobox();
        });
    }

    shouldExpandSelectionGroup(element) {
        if (!element) {
            return false;
        }

        if (this.alwaysDisplayPills) {
            return true;
        }

        if (element.closest('[data-combobox-group-focus="true"]')) {
            return true;
        }

        if (element.closest('[data-pill-focus="true"]')) {
            return this.isPillsExpanded || this._expandedFromMore;
        }

        return false;
    }

    focusFirstPill() {
        requestAnimationFrame(() => {
            const firstRemoveButton = this.template.querySelector('[data-pill-remove-focus="true"]');
            firstRemoveButton?.focus?.();
        });
    }

    expandPills() {
        this.isPillsExpanded = true;
        this._expandedFromMore = true;
        this.focusFirstPill();
    }

    handleSelectionGroupClick(event) {
        if (event.target.closest('.slds-listbox-toggle')) {
            return;
        }

        if (event.target.closest('[data-pill-focus="true"], [data-pill-remove-focus="true"]')) {
            return;
        }

        if (!this.alwaysDisplayPills) {
            this.isPillsExpanded = false;
            this.isPillFocusActive = false;
            this._expandedFromMore = false;
        }
    }

    handleInputClick(event) {
        if (this.isDisabled) {
            return;
        }

        this.isInputFocused = true;
        if (!this.isOpen) {
            this.openCombobox(this.search ? false : true);
            return;
        }

        event.stopPropagation();
        this.closeCombobox();
    }

    handleInputFocus() {
        this.isInputFocused = true;
    }

    handleInputBlur() {
        this.isInputFocused = false;
    }

    handleInput(event) {
        if (!this.search || this.isDisabled) {
            return;
        }

        this.searchTerm = event.target.value ?? '';
        if (!this.isOpen) {
            this.openCombobox(false);
        }

        requestAnimationFrame(() => {
            this.handleFauxFocusOption(this._comboOptions?.[0]?.id);
        });
    }

    handleReadOnlyTypeAhead(event) {
        if (event?.key && NAV_KEYS.includes(event.key)) {
            this._readOnlyStr = '';
            this._readOnlyStrTimeStamp = Date.now();
            return;
        }

        const now = Date.now();
        const last = Number(this._readOnlyStrTimeStamp) || 0;
        if (!last || now - last > 1000) {
            this._readOnlyStr = '';
        }

        const { nextStr, match } = handleReadOnlySearch(event, this._readOnlyStr, this.allOptions);
        if (typeof nextStr !== 'string') {
            return;
        }

        this._readOnlyStr = nextStr;
        this._readOnlyStrTimeStamp = now;

        const applyFocus = () => {
            const comboOptions = this.template.querySelectorAll('.combo-option[role="option"]');
            if (!comboOptions?.length) {
                return false;
            }

            if (match) {
                const matched = Array.from(comboOptions).find((element) => String(element.dataset.value) === String(match.value));
                if (matched) {
                    if (!this.isOpen) {
                        this.openCombobox();
                    }
                    this.handleFauxFocusOption(matched.id);
                }
            }

            return true;
        };

        if (!applyFocus()) {
            requestAnimationFrame(() => applyFocus());
        }
    }

    handleKeyDown(event) {
        if (this.isDisabled) {
            return;
        }

        if (
            this.search &&
            !NAV_KEYS.includes(event.key) &&
            event.key !== 'Backspace'
        ) {
            if (!ALPHA_NUMERIC_KEYS.includes(event.key) && event.key !== ' ') {
                return;
            }
            if (!this.isOpen) {
                this.openCombobox(false);
            }
            return;
        }

        if (event.key === 'Tab' || event.key === 'Escape') {
            if (event.key === 'Escape') {
                event.stopPropagation();
                event.preventDefault();
            }
            this.closeCombobox();
            return;
        }

        if (event.key === 'Enter') {
            if (this.isOpen) {
                event.preventDefault();
                event.stopPropagation();
                const selected = Array.from(this._comboOptions || []).find((option) => option.classList.contains('slds-has-focus'));
                if (selected) {
                    this.toggleSelection(selected.dataset.stableId);
                    if (this.search) {
                        this.searchTerm = '';
                    }
                }
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            this.openCombobox(true);
            return;
        }

        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            event.stopPropagation();

            const options = Array.from(this._comboOptions || []);
            if (!options.length) {
                return;
            }

            const focusedIndex = options.findIndex((option) => option.classList.contains('slds-has-focus'));
            const nextIndex = event.key === 'ArrowDown'
                ? (focusedIndex + 1 + options.length) % options.length
                : (focusedIndex - 1 + options.length) % options.length;

            if (!this.isOpen) {
                this.openCombobox(false, true);
            }

            this.handleFauxFocusOption(options[nextIndex]?.id);
            return;
        }

        this.handleReadOnlyTypeAhead(event);
    }

    deflectFocus(event) {
        event.preventDefault();
    }

    handleOptionClick(event) {
        event.preventDefault();
        event.stopPropagation();
        this.toggleSelection(event.currentTarget.dataset.stableId);
        if (this.search) {
            this.searchTerm = '';
        }
    }

    handleHover(event) {
        const hoverValue = event.currentTarget.dataset.value;
        Array.from(this._comboOptions || []).forEach((option) => {
            if (option.dataset.value === hoverValue) {
                option.classList.add('slds-has-focus');
            } else {
                option.classList.remove('slds-has-focus');
            }
        });
    }

    handleUnhover(event) {
        event.currentTarget?.classList?.remove('slds-has-focus');
    }

    handlePillClick(event) {
        event.stopPropagation();
        this.isPillsExpanded = true;
        this._expandedFromMore = true;
        this.isPillFocusActive = true;

        const pillItem = event.currentTarget.closest('.slds-listbox-item');
        const removeButton = pillItem?.querySelector('[data-pill-remove-focus="true"]');
        if (removeButton) {
            this._activePillStableId = removeButton.dataset.pillStableId;
            requestAnimationFrame(() => {
                removeButton.focus();
            });
        }
    }

    handlePillRemoveFocus(event) {
        this._activePillStableId = event.currentTarget.dataset.pillStableId;
        this.isPillsExpanded = true;
        this._expandedFromMore = true;
        this.isPillFocusActive = true;
        this._pillRemovePointerPending = false;
    }

    handlePillRemoveMouseDown(event) {
        event.stopPropagation();
        this._pillRemovePointerPending = true;
        this.isPillsExpanded = true;
        this._expandedFromMore = true;
        this.isPillFocusActive = true;
        this._activePillStableId = event.currentTarget.dataset.pillStableId;
    }

    handlePillRemove(event) {
        event.stopPropagation();
        this.isPillsExpanded = true;
        this._expandedFromMore = true;
        this.isPillFocusActive = true;

        const stableId = event.currentTarget.dataset.pillStableId;
        const currentPills = this.pills;
        const removedIndex = currentPills.findIndex((pill) => pill.stableId === stableId);
        this.removeOptionByStableId(stableId);

        requestAnimationFrame(() => {
            const removeButtons = Array.from(this.template.querySelectorAll('[data-pill-remove-focus="true"]'));
            if (!removeButtons.length) {
                this._pillRemovePointerPending = false;
                this.isPillsExpanded = false;
                this._expandedFromMore = false;
                this.isPillFocusActive = false;
                this._inputEle?.focus();
                return;
            }

            const targetIndex = removedIndex < removeButtons.length ? removedIndex : removeButtons.length - 1;
            const nextButton = removeButtons[targetIndex] || removeButtons[0];
            this._activePillStableId = nextButton?.dataset?.pillStableId ?? null;
            nextButton?.focus();
            this._pillRemovePointerPending = false;
        });
    }

    _applyVarsDirect(cssVar, varStyle = null) {
        const isValid = (cssVarP, varStyleP) => {
            return typeof cssVarP === 'string' &&
                typeof varStyleP === 'string' &&
                cssVarP.startsWith('--') &&
                varStyleP;
        };

        const el = this.template.host;

        if (Array.isArray(cssVar)) {
            cssVar.forEach((hostVar) => {
                if (Array.isArray(hostVar) && isValid(hostVar[0], hostVar[1])) {
                    el.style.setProperty(hostVar[0], hostVar[1]);
                } else if (typeof hostVar === 'object' && isValid(hostVar.cssVar, hostVar.varStyle)) {
                    el.style.setProperty(hostVar.cssVar, hostVar.varStyle);
                }
            });
        } else if (isValid(cssVar, varStyle)) {
            el.style.setProperty(cssVar, varStyle);
        }
    }
}
