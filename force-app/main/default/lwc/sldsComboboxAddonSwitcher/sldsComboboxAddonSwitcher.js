/**
 * sldsComboboxAddonSwitcher — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/utils.
 * - Salesforce/platform modules: lwc.
 * - Bundle template: sldsComboboxAddonSwitcher.html; local styles: sldsComboboxAddonSwitcher.css.
 * Salesforce SLDS styling is expected.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-combobox-addon-switcher') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - placeHolder (place-holder): Prompt shown when the input has no selection or text. Declared default:
 * 'Select'.
 *   Example: child.placeHolder = "Select an option";
 * - label (label): Visible control label.
 *   Example: child.label = "Status";
 * - isFontNormal (is-font-normal): Uses normal-weight text instead of the switcher's bold styling.
 *   Example: child.isFontNormal = true;
 * - menuTitle (menu-title): Optional heading above dropdown options.
 *   Example: child.menuTitle = "Available options";
 * - isReadOnly (is-read-only): Uses a read-only selection input.
 *   Example: child.isReadOnly = true;
 * - isIconVariant (is-icon-variant): Displays an icon-only switcher and forces read-only input.
 *   Example: child.isIconVariant = true;
 * - startValue (start-value): Initial selected switcher option value.
 *   Example: child.startValue = "accounts";
 * - options (options): Option array with label and value; optional icon/metadata support depends on the
 * variant.
 *   Example: child.options = [{ label: 'Open', value: 'open' }];
 * - groupedOptions (grouped-options): Groups shaped as { label, options: [{ label, value }] }; use instead
 * of flat options.
 *   Example: child.groupedOptions = [{ label: 'Status', options: [{ label: 'Open', value: 'open' }] }];
 *
 * Public methods (call on the rendered child):
 * - errorMe(errorMessage = null): Mark the control invalid; accepts an optional error message where
 * supported.
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-slds-combobox-addon-switcher label="Search in" options={scopes}
 *         start-value={scope} oncomboswitcherselection={handleScope}>
 *         <input slot="addonEnd" type="search" aria-label="Search records"
 *             oninput={handleSearch} />
 *     </c-slds-combobox-addon-switcher>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     scopes = [{ label: 'Accounts', value: 'accounts', icon: 'standard:account' }];
 *     scope = 'accounts';
 *     searchTerm = '';
 *     handleScope(event) { this.scope = event.detail; }
 *     handleSearch(event) { this.searchTerm = event.target.value; }
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Use as a scope selector around a parent-owned addonEnd control. comboswitcherselection.detail is the
 * selected value. For categorized scopes use grouped-options with { label, options } groups instead of
 * options. For an icon-only compact scope selector use is-icon-variant={enabled}, with enabled = true.
 * - Slots: addonEnd.
 */

import { LightningElement, api } from 'lwc';

import { iconPath, iconMap as ICON_MAP } from 'c/utils';


/*
 **IMPORTANT** Adding an option w/ value = 'none' will not display an icon in the menu
    it will display an icon in the <input> element if user selects it or if is set as <startValue>
*/

export default class SldsComboboxAddonSwitcher extends LightningElement {
    iconMap = ICON_MAP;
    idCnt = 300;
    groupId = 2500;
    stableId = 23429929;
    isRendered = false;
    isComboOpen = false;
    _errorMessage;
    _dropdownTrigger;
    _comboOptions;
    _inputEle;

    @api placeHolder = 'Select';
    @api label;

    @api
    set isFontNormal(val) {
        this._isFontNormal = val && (val === true || val === 'true');
    }
    get isFontNormal() {
        return this._isFontNormal;
    }

    @api menuTitle;

    _isReadOnly = false;
    @api
    set isReadOnly(val) {
        this._isReadOnly = val && (val === 'true' || val === true);
    }
    get isReadOnly() {
        return this._isReadOnly ?? false;
    }

    @api
    set isIconVariant(val) {
        this._isIconVariant = val && (val === 'true' || val === true);
        if (this._isIconVariant) {
            this._isReadOnly = true;
        }
    }
    get isIconVariant() {
        return this._isIconVariant;
    }

    _value;
    _selectedValue;
    @api
    set startValue(val) {
        this._startValue = val;
        this._selectedValue = val;
        this.syncSelectedOption();
    }
    get startValue() {
        return this._startValue;
    }

    _options;
    @api
    set options(val) {
        this._options = (val ?? []).map(option => {
            return option.icon
                ? {
                    ...option,
                    icon: iconPath(option.icon, true),
                    isNone: option.value === 'none',
                    iconStr: option.icon,
                    id: `option-id-${this.idCnt++}`,
                    isMeta: Object.keys(option).some(k => k.startsWith('meta'))
                }
                : {
                    ...option,
                    id: `option-id-${this.idCnt++}`,
                    isMeta: Object.keys(option).some(k => k.startsWith('meta'))
                };
        });
        this.syncSelectedOption();
    }
    get options() {
        return this._options;
    }

    _groupedOptions;
    @api
    set groupedOptions(val) {
        this.isGrouped = true;
        this._groupedOptions = (val ?? []).map(group => {
            return {
                label: group.label,
                groupId: `${group.label}-${this.groupId++}`,
                options: group.options.map(option => {
                    const groupedOption = {
                        ...option,
                        id: `${this.groupId++}-${this.idCnt++}`,
                        isMeta: Object.keys(option).some(k => k.startsWith('meta')),
                        group: group.label,
                        iconStr: option.iconStr || option.icon,
                        stableId: option.stableId || `${this.stableId++}`
                    };

                    if (groupedOption.icon) {
                        groupedOption.icon = typeof groupedOption.icon === 'string'
                            ? iconPath(groupedOption.icon, true)
                            : groupedOption.icon;
                    }

                    return groupedOption;
                })
            };
        });
        this.syncSelectedOption();
    }
    get groupedOptions() {
        return this._groupedOptions;
    }

    @api errorMe(errorMessage = null) {
        if (errorMessage) {
            this.template.querySelector('.slds-combobox-group').classList.add('slds-has-error');
            this.template.querySelector('.slds-form-element').classList.add('slds-has-error');
            this._inputEle.setAttribute('aria-describedby', 'error-message-unique-id');
            this._inputEle.setAttribute('aria-invalid', 'true');
            this._errorMessage = errorMessage;
        } else if (this._errorMessage) {
            this.template.querySelector('.slds-combobox-group').classList.remove('slds-has-error');
            this.template.querySelector('.slds-form-element').classList.remove('slds-has-error');
            this._inputEle.removeAttribute('aria-describedby');
            this._inputEle.setAttribute('aria-invalid', 'false');
            this._errorMessage = null;
        }
    }

    renderedCallback() {
        const dropdownTrigger = this.template.querySelector('.slds-dropdown-trigger');
        if (dropdownTrigger) this._dropdownTrigger = dropdownTrigger;

        const comboOptions = this.template.querySelectorAll('[data-element="comboItem"]');
        if (comboOptions) this._comboOptions = comboOptions;

        const inputEle = this.template.querySelector('.slds-input');
        if (inputEle) this._inputEle = inputEle;

        this.syncWidthVars();

        if (!this.isRendered) {
            if (this._isReadOnly) {
                this.template.querySelector('.slds-input').style.setProperty('cursor', 'pointer', 'important');
                this.template.querySelector('.slds-combobox__input').removeAttribute('aria-autocomplete');
            }
            this.isRendered = true;
        }
    }

    get iconVariantObj() {
        if (!this.isIconVariant) return null;

        let iconStr = null;

        if (this.inputVal.label) {
            iconStr = this._groupedOptions
                ? this._groupedOptions.map(group => group.options).flat().find(opt => this.inputVal.label === opt.label).iconStr
                : this._options.find(opt => opt.label === this.inputVal.label).iconStr;
        } else if (this.startValue) {
            iconStr = this._groupedOptions
                ? this._groupedOptions.map(group => group.options).flat().find(opt => this.startValue === opt.value).iconStr
                : this._options.find(opt => opt.value === this.startValue).iconStr;
        } else {
            iconStr = this._groupedOptions
                ? this._groupedOptions[0].options[0].iconStr
                : this._options[0].iconStr;
        }

        const iconObj = iconPath(iconStr, true);
        iconObj.container = `${iconObj.container.replace('slds-current-color', 'slds-icon-text-default')} slds-input__icon slds-input__icon_left`;
        return iconObj;
    }

    get comboFontClass() {
        return this.isFontNormal
            ? 'slds-combobox_object-switcher slds-combobox-addon_start font-normal'
            : 'slds-combobox_object-switcher slds-combobox-addon_start';
    }

    get labelFor() {
        return this.isIconVariant ? 'combobox-icon-variant' : 'combobox-text-variant';
    }

    get comboFormEleClass() {
        return this.isIconVariant
            ? 'slds-combobox__form-element slds-input-has-icon slds-input-has-icon_left-right'
            : 'slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right';
    }

    get comboContainerClass() {
        return this.isIconVariant
            ? 'slds-combobox_container slds-has-icon-only'
            : 'slds-combobox_container';
    }

    get ulEleAttributes() {
        return this.menuTitle
            ? { role: 'group', ariaLabel: this.menuTitle }
            : { role: 'presentation', ariaLabel: 'None' };
    }

    get currentOptions() {
        if (this._groupedOptions) {
            return this._value
                ? this._groupedOptions.map(group => {
                    if (!group.options.some(opt => `${opt.value}`.includes(`${this._value}`) || `${opt.label}`.includes(this._value))) {
                        return null;
                    }
                    return {
                        ...group,
                        options: group.options.filter(opt => `${opt.value}`.includes(`${this._value}`) || `${opt.label}`.includes(this._value))
                    };
                }).filter(Boolean)
                : [...this._groupedOptions];
        }

        if (this._options) {
            return this._value
                ? this._options.filter(opt => `${opt.value}`.includes(`${this._value}`) || `${opt.label}`.includes(this._value))
                : [...this._options];
        }

        return [];
    }

    get inputVal() {
        if (this._value) {
            return { label: this._value, value: this._value };
        }

        if (this._groupedOptions) {
            if (this._groupedOptions.map(group => group.options).flat().some(opt => opt.isSelected)) {
                const groupLabel = this._groupedOptions.find(group => group.options.some(opt => opt.isSelected)).label;
                const selected = this._groupedOptions.map(group => group.options).flat().find(opt => opt.isSelected);
                return { ...selected, label: `${groupLabel} - ${selected.label}` };
            }
            return { label: '', value: '' };
        }

        if (this._options && this._options.length > 0) {
            if (this._options.some(opt => opt.isSelected)) {
                return { ...this._options.find(opt => opt.isSelected) };
            }
            return { label: '', value: '' };
        }

        return { label: '', value: '' };
    }

    dispatchValue() {
        this.dispatchEvent(new CustomEvent('comboswitcherselection', {
            detail: this.inputVal.value,
            bubbles: true,
            composed: true
        }));
    }

    handleDropdownTriggerState(isClose = false) {
        let isSelection = false;

        if (isClose) {
            this.isComboOpen = false;

            this._comboOptions.forEach(combo => {
                if (combo.classList.contains('slds-has-focus')) {
                    this.selectOption(combo.dataset.value);
                    isSelection = true;
                }
            });
            this._value = '';
            this._comboOptions.forEach(combo => {
                combo.classList.remove('slds-has-focus');
                combo.setAttribute('aria-selected', 'false');
            });
            this._dropdownTrigger.classList.remove('slds-is-open');
            this._dropdownTrigger.setAttribute('aria-expanded', 'false');
        } else {
            this._value = '';
            this.isComboOpen = true;
            this._dropdownTrigger.classList.add('slds-is-open');
            this._dropdownTrigger.setAttribute('aria-expanded', 'true');
        }

        if (isSelection) {
            this.dispatchValue();
        }
    }

    handleAddonStartKeyDown(event) {
        if (event.key === 'Enter') {
            this.isComboOpen
                ? this.handleDropdownTriggerState(true)
                : this.handleDropdownTriggerState();
            return;
        }

        if (event.key === 'Escape' || event.key === 'Tab') {
            this.handleDropdownTriggerState(true);
            return;
        }

        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            if (!this.isComboOpen) this.handleDropdownTriggerState();

            const isDown = event.key === 'ArrowDown';
            const arrLength = Array.from(this._comboOptions).length;
            const currentSelected = Array.from(this._comboOptions).findIndex(opt => opt.getAttribute('aria-selected') === 'true');

            const nextIdx = isDown
                ? (currentSelected === -1 || currentSelected + 1 > arrLength - 1 ? 0 : currentSelected + 1)
                : (currentSelected === -1 || currentSelected - 1 < 0 ? arrLength - 1 : currentSelected - 1);

            this.handleFauxFocusOption(this._comboOptions[nextIdx].id);
        }
    }

    handleAddonStartFocusIn() {
        if (!this.isComboOpen) {
            this.handleDropdownTriggerState();
        }
    }

    handleAddonStartClick() {
        if (!this.isComboOpen) {
            this.handleDropdownTriggerState();
        }
    }

    handleInputBlur() {
        this.handleDropdownTriggerState(true);
    }

    handleInput(event) {
        if (!this.isComboOpen) {
            this.handleDropdownTriggerState();
        }
        this._value = event.target.value;
    }

    selectOption(val) {
        this._selectedValue = val;
        if (this._groupedOptions) {
            this._groupedOptions = this._groupedOptions.map(group => {
                return !group.options.some(opt => opt.value === val)
                    ? { ...group, options: group.options.map(opt => ({ ...opt, isSelected: false })) }
                    : { ...group, options: group.options.map(opt => ({ ...opt, isSelected: opt.value === val })) };
            });
            this.syncWidthVars();
            return;
        }

        this._options = this._options.map(opt => ({ ...opt, isSelected: opt.value === val }));
        this.syncWidthVars();
    }

    syncSelectedOption() {
        const targetValue = this._selectedValue ?? this._startValue;
        if (!targetValue) return;

        if (this._groupedOptions) {
            this._groupedOptions = this._groupedOptions.map(group => ({
                ...group,
                options: group.options.map(opt => ({ ...opt, isSelected: opt.value === targetValue }))
            }));
            return;
        }

        if (this._options) {
            this._options = this._options.map(opt => ({ ...opt, isSelected: opt.value === targetValue }));
        }
    }

    syncWidthVars() {
        const switcher = this.template.querySelector('.slds-combobox_object-switcher');
        const label = this.inputVal?.label || this.placeHolder || '';
        const length = label.length;
        const restWidth = Math.min(Math.max(length + 6, 16), 24);
        const focusWidth = Math.min(restWidth + 6, 30);

        if (switcher) {
            switcher.style.setProperty('--addon-switcher-rest-width', `${restWidth}ch`);
            switcher.style.setProperty('--addon-switcher-focus-width', `${focusWidth}ch`);
        }
    }

    handleFauxFocusOption(optionId, isStableId = false) {
        try {
            this._inputEle.setAttribute('aria-activedescendant', `${optionId}`);
            this._comboOptions.forEach(option => {
                if (
                    (isStableId && option.dataset.stableId === this.stableId) ||
                    (!isStableId && option.id === optionId)
                ) {
                    option.setAttribute('aria-selected', 'true');
                    option.classList.add('slds-has-focus');
                    option.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    option.setAttribute('aria-selected', 'false');
                    option.classList.remove('slds-has-focus');
                }
            });
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('handleFauxFocusOption', error);
        }
    }

    deflectFocus(event) {
        event.preventDefault();
    }

    handleOptionClick(event) {
        event.stopPropagation();
        this.selectOption(event.currentTarget.dataset.value);
        this.handleDropdownTriggerState(true);
        this.dispatchValue();
    }
}