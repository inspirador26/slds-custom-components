/**
 * sldsComboboxMultiAddon — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/utils.
 * - Salesforce/platform modules: lwc.
 * - Bundle template: sldsComboboxMultiAddon.html; local styles: sldsComboboxMultiAddon.css. Salesforce
 * SLDS styling is expected.
 * - Shared CSS modules: c/sharedStylesSldsCombobox, c/sharedStylesGlobal.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-combobox-multi-addon') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - label (label): Visible control label. Declared default: 'Relate To'.
 *   Example: child.label = "Status";
 * - switcherLabel (switcher-label): Accessible label for the scope switcher. Declared default: 'Filter
 * Search'.
 *   Example: child.switcherLabel = "Filter Search";
 * - switcherMenuTitle (switcher-menu-title): Optional heading above dropdown options. Declared default:
 * ''.
 *   Example: child.switcherMenuTitle = "Available options";
 * - placeHolder (place-holder): Prompt shown when the input has no selection or text. Declared default:
 * 'Search...'.
 *   Example: child.placeHolder = "Select an option";
 * - iconOnly (icon-only): Displays only the selected scope icon.
 *   Example: child.iconOnly = true;
 * - iconAndText (icon-and-text): Displays the selected scope icon alongside its label.
 *   Example: child.iconAndText = true;
 * - hideNone (hide-none): Hides the None scope and returns selections keyed by scope.
 *   Example: child.hideNone = true;
 * - multiScoped (multi-scoped): Allows multiple scopes to be active and returns selections keyed by scope.
 *   Example: child.multiScoped = true;
 * - search (search): Enables typing to filter options.
 *   Example: child.search = true;
 * - borderRadius (border-radius): CSS corner radius, including units.
 *   Example: child.borderRadius = "0.25rem";
 * - borderColor (border-color): CSS border color.
 *   Example: child.borderColor = "#c9c9c9";
 * - fontSize (font-size): CSS text size, including units.
 *   Example: child.fontSize = "0.875rem";
 * - metaFontSize (meta-font-size): CSS size for option metadata text.
 *   Example: child.metaFontSize = "0.75rem";
 * - height (height): CSS input/control height, including units.
 *   Example: child.height = "2rem";
 * - switcherWidth (switcher-width): Blurred switcher width in rem; numeric values above 7.5 are applied.
 *   Example: child.switcherWidth = "9rem";
 * - switcherWidthActive (switcher-width-active): CSS width of the switcher while focused.
 *   Example: child.switcherWidthActive = "12rem";
 * - switcherOptions (switcher-options): Scope options with label/value and optional SLDS icon and
 * metadata.
 *   Example: child.switcherOptions = [{ label: 'Accounts', value: 'accounts', icon: 'standard:account' }];
 * - optionSets (option-sets): Map of scope keys to option arrays or { label, placeholder, options }
 * objects.
 *   Example: child.optionSets = { accounts: [{ label: 'Acme', value: 'acme' }] };
 * - initialScope (initial-scope): Initial scope value, or array of values in multiScoped mode.
 *   Example: child.initialScope = "accounts";
 * - initialSelectionsByScope (initial-selections-by-scope): Map of scope keys to arrays of selected option
 * values.
 *   Example: child.initialSelectionsByScope = { accounts: ['acme'] };
 *
 * Public methods (call on the rendered child):
 * - focusMe(): Focus the component input/control.
 * - clearSelections(notify = true): Clear selections in every scope; notify=false suppresses the selection
 * notification.
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-slds-combobox-multi-addon switcher-options={scopes}
 *         option-sets={sets} initial-scope="accounts" search={enabled}
 *         oncomboswitcherselection={handleScope}
 *         oncombomultiselection={handleSelection}></c-slds-combobox-multi-addon>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     enabled = true;
 *     scopes = [{ label: 'Accounts', value: 'accounts', icon: 'standard:account' }];
 *     sets = { accounts: [{ label: 'Acme', value: 'acme' }] };
 *     scope = 'accounts';
 *     selection = [];
 *     handleScope(event) { this.scope = event.detail; }
 *     handleSelection(event) { this.selection = event.detail; }
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Use when selections are partitioned by scope. Default combomultiselection.detail is the active scope's
 * value array; hide-none or multi-scoped changes it to a map of scope keys to value arrays.
 * - Multi-scope variant: set multi-scoped={enabled}, initial-scope={initialScopes}, and
 * initial-selections-by-scope={initialSelections}; define initialScopes = ['accounts'] and
 * initialSelections = { accounts: ['acme'] }. comboswitcherselection.detail then contains an array of
 * scopes. optionSets also supports { accounts: { label: 'Accounts', placeholder: 'Find an account',
 * options: [...] } }.
 */

import { LightningElement, api, track } from 'lwc';
import { ComboboxController, handleDropdownFlip, handleReadOnlySearch, iconMap as ICON_MAP, iconPath } from 'c/utils';

const NAV_KEYS = ['Enter', 'Escape', 'Shift', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'];
const ALPHA_NUMERIC_KEYS = [
    ...'abcdefghijklmnopqrstuvwxyz',
    ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    ...'0123456789'
];
const READ_ONLY_SEARCH_TIMEOUT_MS = 1000;

const META_KEYS = ['metaOne', 'metaTwo', 'metaThree', 'metaFour'];

function parseIcon(option) {
    const icon = option.icon ? iconPath(option.icon, true) : null;
    if (icon) {
        return {...icon, container: `${icon.container} slds-pill__icon_container`}
    }
    return null;
}

function getBaseValue(value) {
    const stringValue = String(value ?? '');
    const dotIndex = stringValue.indexOf('.');
    const isGreater = (
        dotIndex >= 0
            ? stringValue.slice(dotIndex + 1)
            : stringValue
    );
        
    return isGreater;
}

function normalizeOption(option, idPrefix, index) {
    return {
        ...option,
        id: option.id || `${idPrefix}-${index}`,
        stableId: option.stableId || `${idPrefix}-stable-${index}`,
        baseValue: option.baseValue || getBaseValue(option.value),
        icon: option.icon ? iconPath(option.icon, true) : null,
        pillIcon: parseIcon(option),
        isMeta: Object.keys(option || {}).some((key) => key.startsWith('meta'))
    };
}

function getSearchScore(option, rawTerm) {
    const term = String(rawTerm ?? '').trim().toLowerCase();
    if (!term) {
        return Number.NEGATIVE_INFINITY;
    }

    const label = String(option?.label ?? '').toLowerCase();
    const metaValues = [
        option?.metaOne,
        option?.metaTwo,
        option?.metaThree,
        option?.metaFour
    ].map((value) => String(value ?? '').toLowerCase());
    const optionValue = String(option?.value ?? '').toLowerCase();

    if (label === term) {
        return 500;
    }
    if (label.startsWith(term)) {
        return 400 - (label.length - term.length);
    }
    if (label.includes(term)) {
        return 300 - label.indexOf(term);
    }

    const metaPrefixIndex = metaValues.findIndex((value) => value.startsWith(term));
    if (metaPrefixIndex > -1) {
        return 200 - metaPrefixIndex;
    }

    const metaIncludesIndex = metaValues.findIndex((value) => value.includes(term));
    if (metaIncludesIndex > -1) {
        return 150 - metaIncludesIndex;
    }

    if (optionValue.startsWith(term)) {
        return 100;
    }
    if (optionValue.includes(term)) {
        return 50;
    }

    return Number.NEGATIVE_INFINITY;
}

export default class SldsComboboxMultiAddon extends LightningElement {
    iconMap = ICON_MAP;
    _switcherId = 'switcher-selected-value';

    @api label = 'Relate To';
    @api switcherLabel = 'Filter Search';
    @api switcherMenuTitle = '';
    @api placeHolder = 'Search...';
    @api
    set iconOnly(value) {
        this._iconOnly = value === true || value === 'true';
    }
    get iconOnly() {
        return this._iconOnly ?? false;
    }
    @api
    set iconAndText(value) {
        this._iconAndText = value === '' || value === true || value === 'true';
    }
    get iconAndText() {
        return this._iconAndText ?? false;
    }
    @api
    set hideNone(value) {
        this._hideNone = value === true || value === 'true';
    }
    get hideNone() {
        return this._hideNone ?? false;
    }
    @api
    set multiScoped(value) {
        this._multiScoped = value === true || value === 'true';
        if (this._multiScoped) {
            const initialValues = Array.isArray(this._initialScope)
                ? this._initialScope
                : (this._initialScope ? [this._initialScope] : []);
            if (initialValues.length && !this.selectedScopes.length) {
                this.selectedScopes = initialValues;
                this.activeScope = initialValues[0] ?? null;
            } else if (!this.selectedScopes.length && this._switcherOptions.length) {
                this.selectedScopes = [this._switcherOptions[0].value];
                this.activeScope = this._switcherOptions[0].value;
            }
        }
    }
    get multiScoped() {
        return this._multiScoped ?? false;
    }
    @api
    set search(value) {
        this._search = value === true || value === 'true';
        if (value) {
            this._applyVarsDirect('--c-caret-color', 'var(--slds-g-color-neutral-base-10, #181818)');
        }
    }
    get search() {
        return this._search ?? false;
    }

    @api 
    set borderRadius(val) {
        this._borderRadius = val;
        if (val) {
            this._applyVarsDirect('--c-border-radius', val);
        }
    }
    get borderRadius() {
        return this._borderRadius;
    }
    @api 
    set borderColor(val) {
        this._borderColor = val;
        if (val) {
            this._applyVarsDirect([
                ['--slds-c-input-color-border', val],
                ['--slds-g-color-border-base-4', val]
            ]);
        }
    }
    get borderColor() {
        return this._borderColor;
    }
    @api 
    set fontSize(val) {
        this._fontSize = val;
        if (val) {
            this._applyVarsDirect('--slds-c-dropdown-font-size', val);
            this._applyVarsDirect('--c-font-size', val);
        }
    }
    get fontSize() {
        return this._fontSize;
    }
    @api 
    set metaFontSize(val) {
        this._metaFontSize = val;
        if (val) {
            this._applyVarsDirect('--c-meta-font-size', val);
        }
    }
    get metaFontSize() {
        return this._metaFontSize;
    }
    @api 
    set height(val) {
        this._height = val;
        if (val) {
            this._applyVarsDirect('--c-input-height', val);
        }
    }
    get height() {
        return this._height;
    }
    _switcherDropdownCl = 'slds-dropdown slds-dropdown_length-5 slds-dropdown_x-small slds-dropdown_left switcher-dropdown';
    @api 
    set switcherWidth(val) {
        this._switcherWidth = val;
        if (val) {
            const numberVal = Number(val.replace('rem', ''));
            if (numberVal > 7.5) {
                this._switcherDropdownCl = this._switcherDropdownCl.replace('slds-dropdown_x-small', 'slds-dropdown_fluid');
            }
            this._applyVarsDirect('--c-switcher-width-blurred', val);
        }
    }
    get switcherWidth() {
        return this._switcherWidth;
    }
    @api 
    set switcherWidthActive(val) {
        this._switcherWidthActive = val;
        if (val) {
            this._applyVarsDirect('--c-switcher-width-focused', val);
        }
    }
    get switcherWidthActive() {
        return this._switcherWidthActive;
    }


    _switcherOptions = [];
    _optionSetConfigs = {};
    _normalizedOptionSets = {};
    _initialScope = null;
    _initialSelectionsByScope = {};

    @track activeScope = null;
    @track selectedScopes = [];
    @track selectedByScope = {};
    @track isPillsExpanded = false;
    @track isPillFocusActive = false;
    @track searchTerm = '';
    @track isAddonInputFocused = false;

    _switcherCombo;
    _dropdownTrigger;
    _comboOptions;
    _inputEle;
    _readOnlyStr = '';
    _readOnlyStrTimeStamp = 0;
    _switcherReadOnlyStr = '';
    _switcherReadOnlyStrTimeStamp = 0;
    _switcherNavMode = 'mouse';
    _expandedFromMore = false;
    _pillRemovePointerPending = false;

    _switcherHasMeta = false;
    _addonHasMeta = false;
    @api
    set switcherOptions(value) {
        const options = Array.isArray(value) ? value : [];
        this._switcherHasMeta = options.some(op => META_KEYS.some(mk => !!op?.[mk]));
        this._switcherOptions = options.map((option, index) => {
            const hasMetaOne = !!String(option?.metaOne ?? '').trim();
            const hasMetaTwo = !!String(option?.metaTwo ?? '').trim();
            const hasMetaThree = !!String(option?.metaThree ?? '').trim();

            return {
                ...option,
                id: option.id || `scope-${index}`,
                icon: option.icon ? iconPath(option.icon, true) : null,
                isMeta: META_KEYS.some((key) => String(option?.[key] ?? '').trim()),
                metaTwoPrefix: hasMetaOne ? ' • ' : '',
                metaThreePrefix: hasMetaOne || hasMetaTwo ? ' • ' : '',
                metaFourPrefix: hasMetaOne || hasMetaTwo || hasMetaThree ? ' • ' : ''
            };
        });

        if (this.multiScoped) {
            if (!this.selectedScopes.length && this._switcherOptions.length) {
                this.selectedScopes = [this._switcherOptions[0].value];
            }
            this.activeScope = this.selectedScopes[0] ?? this._switcherOptions[0]?.value ?? null;
        } else if (!this.activeScope && this._switcherOptions.length) {
            this.activeScope = this._switcherOptions[0].value;
        }
    }
    get switcherOptions() {
        return this._switcherOptions;
    }

    @api
    set optionSets(value) {
        const sets = value ?? {};
        this._optionSetConfigs = Object.keys(sets).reduce((acc, key) => {
            const setConfig = Array.isArray(sets[key])
                ? { options: sets[key] ?? [] }
                : (sets[key] ?? {});
            acc[key] = {
                label: setConfig.label ?? key,
                placeholder: setConfig.placeholder ?? this.placeHolder,
                options: (setConfig.options ?? []).map((option, index) => normalizeOption(option, `${key}-option`, index))
            };
            return acc;
        }, {});
        this._normalizedOptionSets = Object.keys(this._optionSetConfigs).reduce((acc, key) => {
            acc[key] = this._optionSetConfigs[key].options;
            return acc;
        }, {});
        
        this._addonHasMeta = (Object.values(this._normalizedOptionSets) ?? [])
            .some(op => META_KEYS.some(mk => op?.[mk]));
    }
    get optionSets() {
        return this._normalizedOptionSets;
    }

    @api
    set initialScope(value) {
        this._initialScope = value;
        if (this.multiScoped) {
            const values = Array.isArray(value) ? value : (value ? [value] : []);
            this.selectedScopes = values;
            this.activeScope = values[0] ?? null;
            return;
        }
        this.activeScope = value;
    }
    get initialScope() {
        return this._initialScope;
    }

    @api
    set initialSelectionsByScope(value) {
        this._initialSelectionsByScope = { ...(value ?? {}) };
        this.selectedByScope = { ...this._initialSelectionsByScope };
    }
    get initialSelectionsByScope() {
        return this._initialSelectionsByScope;
    }

    connectedCallback() {
        this._switcherCombo = new ComboboxController({
            host: this,
            isMultiSelect: this.multiScoped,
            isSearchable: false,
            options: this._switcherOptions,
            triggerSelector: '.switcher-trigger',
            inputSelector: '.switcher-input',
            optionSelector: '.switcher-option[role="option"]',
            dropdownSelector: '.switcher-dropdown',
            getSelectedValue: () => (this.multiScoped ? this.selectedScopes : this.activeScope),
            onSelect: ({ value }) => {
                if (this.multiScoped) {
                    const nextScopes = new Set(this.selectedScopes);
                    if (nextScopes.has(value)) {
                        nextScopes.delete(value);
                    } else {
                        nextScopes.add(value);
                    }

                    this.selectedScopes = this._switcherOptions
                        .map((option) => option.value)
                        .filter((optionValue) => nextScopes.has(optionValue));
                    this.activeScope = this.selectedScopes[0] ?? null;
                } else {
                    this.activeScope = value;
                }
                this.closeAddonCombobox();
                this.dispatchEvent(new CustomEvent('comboswitcherselection', {
                    detail: this.multiScoped ? this.selectedScopes : this.activeScope,
                    bubbles: true,
                    composed: true
                }));
            }
        });
    }

    @api focusMe() {
        const inp = this.template.querySelector('.switcher-input');
        if (inp) {
            inp.focus();
        }
    }

    @api clearSelections(notify = true) {
        this.selectedByScope = {};
        this.searchTerm = '';
        this.isPillsExpanded = false;
        this.isPillFocusActive = false;
        this._pillRemovePointerPending = false;

        if (notify) {
            this.dispatchSelections();
        }
    }

    renderedCallback() {
        this._switcherCombo.options = this._switcherOptions;
        this._dropdownTrigger = this.template.querySelector('.addon-trigger');
        this._comboOptions = this.template.querySelectorAll('.addon-option[role="option"]');
        this._inputEle = this.template.querySelector('.addon-input');
    }

    get normalizedSwitcherOptions() {
        return this._switcherOptions.map((option) => {
            const hasIcon = !!option?.icon;
            return {
                ...option,
                isSelected: this.multiScoped
                    ? this.selectedScopes.includes(option.value)
                    : option.value === this.activeScope,
                ariaChecked: this.multiScoped
                    ? (this.selectedScopes.includes(option.value) ? 'true' : 'false')
                    : (option.value === this.activeScope ? 'true' : 'false'),
                className: [
                    'switcher-option',
                    'slds-media',
                    'slds-media_small',
                    'slds-listbox__option',
                    hasIcon || option.isMeta 
                        ? 'slds-listbox__option_entity'
                        : '',
                    option.isMeta
                        ? 'slds-listbox__option_has-meta' 
                        : 'slds-listbox__option_plain',
                    ((this.multiScoped && this.selectedScopes.includes(option.value)) || (!this.multiScoped && option.value === this.activeScope))
                        ? 'slds-is-selected'
                        : ''
                ].filter(Boolean).join(' ')
            };
        });
    }

    get selectedSwitcherOption() {
        const selectedValue = this.multiScoped
            ? (this.selectedScopes[0] ?? this.activeScope)
            : this.activeScope;
        return this._switcherOptions.find((option) => 
            option.value === selectedValue
        ) || null;
    }

    get selectedSwitcherOptionIconCl() {
        if (!this.shouldShowSwitcherIcon || !this.selectedSwitcherOption?.icon) {
            return '';
        }
        const iconcl = this.selectedSwitcherOption?.icon?.container?.includes('utility')
            ? 'slds-icon slds-icon_x-small slds-align-middle slds-icon-text-default selected-switcher-icon'
            : 'slds-icon slds-icon_x-small slds-align-middle selected-switcher-icon';

        return iconcl;
    }

    get shouldShowSwitcherIconOnly() {
        return this.iconOnly && !this.iconAndText;
    }

    get shouldShowSwitcherIconAndText() {
        return this.iconAndText;
    }

    get shouldShowSwitcherTextOnly() {
        return !this.shouldShowSwitcherIconOnly && !this.shouldShowSwitcherIconAndText;
    }

    get shouldShowSwitcherIcon() {
        return this.shouldShowSwitcherIconOnly || this.shouldShowSwitcherIconAndText;
    }

    get switcherDisplayLabel() {
        if (this.multiScoped) {
            const selectedOptions = this._switcherOptions.filter((option) => this.selectedScopes.includes(option.value));
            if (!selectedOptions.length) {
                return 'Filter by';
            }
            if (selectedOptions.length === 1) {
                return `Filter by: ${selectedOptions[0].label}`;
            }
            return `Filter by: ${selectedOptions[0].label} +${selectedOptions.length - 1}`;
        }

        const current = this.selectedSwitcherOption;
        return current ? `Filter by: ${current.label}` : 'Filter by';
    }

    get switcherInputValue() {
        if (this.multiScoped) {
            const selectedOptions = this._switcherOptions.filter((option) => this.selectedScopes.includes(option.value));
            if (!selectedOptions.length) {
                return '';
            }
            if (selectedOptions.length === 1) {
                return selectedOptions[0].label;
            }
            return `${selectedOptions[0].label} +${selectedOptions.length - 1}`;
        }

        return this.selectedSwitcherOption?.label ?? '';
    }

    get activeScopeValues() {
        if (this.multiScoped) {
            const selectedScopes = this.selectedScopes.filter((scopeKey) => this._normalizedOptionSets[scopeKey]);
            if (selectedScopes.length) {
                return selectedScopes;
            }

            if (this.activeScope && this._normalizedOptionSets[this.activeScope]) {
                return [this.activeScope];
            }

            return Object.keys(this._normalizedOptionSets).filter((scopeKey) => {
                return Array.isArray(this._normalizedOptionSets[scopeKey]) && this._normalizedOptionSets[scopeKey].length;
            });
        }
        return this.activeScope ? [this.activeScope] : [];
    }

    get currentSelections() {
        return this.selectedByScope[this.activeScope] ?? [];
    }

    get currentOptions() {
        if (this.multiScoped) {
            const mergedOptions = new Map();

            this.activeScopeValues.forEach((scopeKey) => {
                (this._normalizedOptionSets[scopeKey] ?? []).forEach((option) => {
                    const labelKey = String(option.label ?? '').trim().toLowerCase();
                    const currentSelectionSet = new Set(this.selectedByScope[scopeKey] ?? []);
                    const existing = mergedOptions.get(labelKey);
                    const source = {
                        scopeKey,
                        value: option.value,
                        stableId: option.stableId
                    };

                    if (!existing) {
                        mergedOptions.set(labelKey, {
                            ...option,
                            value: option.baseValue,
                            stableId: `merged-${labelKey.replace(/[^a-z0-9]+/gi, '-')}`,
                            groups: [scopeKey],
                            sources: [source],
                            isSelected: currentSelectionSet.has(option.value)
                        });
                        return;
                    }

                    existing.groups = [...existing.groups, scopeKey];
                    existing.sources = [...existing.sources, source];
                    existing.isSelected = existing.isSelected && currentSelectionSet.has(option.value);
                });
            });

            return Array.from(mergedOptions.values());
        }

        const selectedSet = new Set(this.currentSelections);
        return (this._normalizedOptionSets[this.activeScope] ?? []).map((option) => ({
            ...option,
            isSelected: selectedSet.has(option.value)
        }));
    }

    get filteredOptions() {
        if (!this.search) {
            return this.currentOptions;
        }

        const term = this.searchTerm.trim().toLowerCase();
        if (!term) {
            return this.currentOptions;
        }

        return this.currentOptions
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

    get addonTemplateOptions() {
        return this.filteredOptions.map((option) => {
            const isIcon = !!option.icon;
            const isMeta = META_KEYS.some(m => option?.[m]);
            return {
                ...option,
                ariaSelected: option.isSelected ? 'true' : 'false',
                ariaChecked: option.isSelected ? 'true' : 'false',
                className: [
                    'addon-option',
                    !isMeta && !isIcon 
                        ? 'addon-option-plain'
                        : null,
                    'slds-media',
                    'slds-media_small slds-listbox__option_entity',
                    !isMeta && isIcon ? 'slds-media_center' : '',
                    'slds-listbox__option',
                    isMeta ? 'slds-listbox__option_has-meta' 
                        : 'slds-listbox__option_plain',
                    option.isSelected 
                        ? 'slds-is-selected' 
                        : ''
                ].filter(Boolean).join(' ')
            };
        });
    }

    get switcherHasIcons() {
        return this._switcherOptions.some((option) => !!option.icon);
    }

    get addonHasIcons() {
        return this.filteredOptions.some((option) => !!option.icon);
    }

    get pills() {
        const scopeKeys = this.hideNone
            ? Object.keys(this._normalizedOptionSets)
            : this.activeScopeValues;

        if (this.hideNone || this.multiScoped) {
            return scopeKeys.flatMap((scopeKey) => {
                const selectedSet = new Set(this.selectedByScope[scopeKey] ?? []);
                return (this._normalizedOptionSets[scopeKey] ?? [])
                    .filter((option) => selectedSet.has(option.value))
                    .map((option) => ({
                        ...option,
                        scopeKey
                    }));
            });
        }

        return this.currentOptions.filter((option) => option.isSelected);
    }

    get displayedPills() {
        return this.isPillsExpanded ? this.pills : this.pills.slice(0, 2);
    }

    get hiddenPillCount() {
        return Math.max(this.pills.length - this.displayedPills.length, 0);
    }

    get selectionGroupClass() {
        return (this.isPillsExpanded || this.isPillFocusActive)
            ? 'slds-listbox_selection-group slds-is-expanded'
            : 'slds-listbox_selection-group';
    }

    get comboboxGroupClass() {
        return this.pills.length
            ? 'slds-combobox-group slds-has-selection'
            : 'slds-combobox-group';
    }

    get switcherTriggerClass() {
        const searchCl = this.search ? 'trigger-search' : '';
        return this.isSwitcherOpen
            ? `slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click switcher-trigger slds-is-open ${searchCl}`
            : `slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click switcher-trigger ${searchCl}`;
    }

    get switcherInputClass() {
        if (this.shouldShowSwitcherIconOnly) {
            return this.isSwitcherOpen
                ? 'slds-input slds-combobox__input slds-has-focus slds-combobox__input-value switcher-input'
                : 'slds-input slds-combobox__input slds-combobox__input-value switcher-input';
        }
        return this.isSwitcherOpen
            ? 'slds-input_faux slds-combobox__input slds-has-focus slds-combobox__input-value switcher-input'
            : 'slds-input_faux slds-combobox__input slds-combobox__input-value switcher-input';
    }

    get switcherComboboxContainerClass() {
        return this.shouldShowSwitcherIconOnly
            ? 'slds-combobox_container slds-has-icon-only'
            : 'slds-combobox_container';
    }

    get switcherFormElementClass() {
        return this.shouldShowSwitcherIcon
            ? 'slds-combobox__form-element slds-input-has-icon slds-input-has-icon_left-right'
            : 'slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right';
    }

    get comboFormCl() {
        return this.search ? 'slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right searchable'
            : 'slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right';
    }

    get addOnMediaBodyCl() {
        return this.addonHasIcons && this._addonHasMeta
            ? 'slds-media__body slds-m-left_xx-small'
                : this.addonHasIcons && !this._addonHasMeta
                    ? 'slds-media__body slds-align-middle slds-m-left_xx-small'
                : !this.addonHasIcons && this._addonHasMeta
                    ? 'slds-media__body'
            : 'slds-media__body slds-align-middle';
    }
    get switcherMediaBodyCl() {
        return this._switcherHasMeta && this.switcherHasIcons
            ? 'slds-media__body slds-m-left_xx-small'
                : this.switcherHasIcons && !this._switcherHasMeta
                    ? 'slds-media__body slds-m-left_xx-small slds-align-middle'
                : !this.switcherHasIcons && this._switcherHasMeta
                    ? 'slds-media__body'
            : 'slds-media__body slds-align-middle';
    }

    get isSwitcherOpen() {
        return this._switcherCombo?.isOpen ?? false;
    }

    get addonTriggerClass() {
        const base = this.search
            ? 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click addon-trigger trigger-search'
            : 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click addon-trigger';

        return this.isAddonOpen
            ? `${base} slds-is-open`
            : base;
    }

    get addonInputClass() {
        const base = this.search
            ? 'slds-input slds-combobox__input addon-input'
            : 'slds-input slds-combobox__input slds-combobox__input-value addon-input';

        return this.isAddonInputFocused && !this.isPillFocusActive
            ? `${base} slds-has-focus`
            : base;
    }

    get isAddonOpen() {
        return this._dropdownTrigger?.classList?.contains('slds-is-open');
    }

    get inputValue() {
        if (this.search) {
            return this.searchTerm;
        }
        return this.pills.length ? `${this.pills.length} options selected` : '';
    }

    get activePlaceholder() {
        if (!this.multiScoped) {
            return this._optionSetConfigs[this.activeScope]?.placeholder ?? this.placeHolder;
        }

        const selectedLabels = this._switcherOptions
            .filter((option) => this.selectedScopes.includes(option.value))
            .map((option) => option.label);
        if (!selectedLabels.length) {
            return this.placeHolder;
        }
        if (selectedLabels.length === 1) {
            return this._optionSetConfigs[this.selectedScopes[0]]?.placeholder ?? this.placeHolder;
        }
        return `Select ${selectedLabels.join(', ')}...`;
    }

    get isAddonReadOnly() {
        return !this.search;
    }

    get addonInputIconHref() {
        return this.search
            ? this.iconMap.utility.search
            : this.iconMap.utility.down;
    }

    openAddonCombobox(clearReadStr = false, isNav = false) {
        if (clearReadStr) {
            this._readOnlyStr = '';
        }
        if (this._dropdownTrigger) {
            this._dropdownTrigger.classList.add('slds-is-open');
            this._dropdownTrigger.setAttribute('aria-expanded', 'true');
            requestAnimationFrame(() => {
                handleDropdownFlip({ template: this.template });
            });
        }

        if (!isNav) {
            this.handleFauxFocusOption(this._comboOptions?.[0]?.id);
        }
    }

    closeAddonCombobox() {
        if (this._dropdownTrigger) {
            this._dropdownTrigger.classList.remove('slds-is-open');
            this._dropdownTrigger.setAttribute('aria-expanded', 'false');
        }
        if (this._comboOptions) {
            this._comboOptions.forEach((option) => {
                option.classList.remove('slds-has-focus');
                option.setAttribute('aria-selected', 'false');
            });
        }
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
            this._switcherCombo?.close();
            this.closeAddonCombobox();
        });
    }

    shouldExpandSelectionGroup(element) {
        if (!element) {
            return false;
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
            if (firstRemoveButton && typeof firstRemoveButton.focus === 'function') {
                firstRemoveButton.focus();
            }
        });
    }

    dispatchSelections() {
        this.dispatchEvent(new CustomEvent('combomultiselection', {
            detail: (this.hideNone || this.multiScoped) ? this.selectedByScope : this.currentSelections,
            bubbles: true,
            composed: true
        }));
    }

    toggleSelection(stableId) {
        if (this.multiScoped) {
            const option = this.currentOptions.find((item) => item.stableId === stableId);
            if (!option) {
                return;
            }

            const nextSelectedByScope = { ...this.selectedByScope };
            if (option.isSelected) {
                option.sources.forEach(({ scopeKey, value }) => {
                    nextSelectedByScope[scopeKey] = (nextSelectedByScope[scopeKey] ?? []).filter((selection) => selection !== value);
                });
            } else {
                option.sources.forEach(({ scopeKey, value }) => {
                    const nextSet = new Set(nextSelectedByScope[scopeKey] ?? []);
                    nextSet.add(value);
                    nextSelectedByScope[scopeKey] = [...nextSet];
                });
            }

            this.selectedByScope = nextSelectedByScope;
            this.dispatchSelections();
            return;
        }

        const scopeOptions = this._normalizedOptionSets[this.activeScope] ?? [];
        const option = scopeOptions.find((item) => item.stableId === stableId);
        if (!option) {
            return;
        }

        const current = new Set(this.currentSelections);
        if (current.has(option.value)) {
            current.delete(option.value);
        } else {
            current.add(option.value);
        }

        this.selectedByScope = {
            ...this.selectedByScope,
            [this.activeScope]: [...current]
        };

        this.dispatchSelections();
    }

    handleSwitcherFocus() {
        this.isAddonInputFocused = false;
        if (this._inputEle) {
            this._inputEle.classList.remove('slds-has-focus');
        }
        this._switcherCombo.handleFocus();
    }

    handleSwitcherBlur() {
        this._switcherCombo.handleBlur();
    }

    handleSwitcherTriggerClick() {
        this._switcherNavMode = 'mouse';
        this._switcherReadOnlyStr = '';
        this.closeAddonCombobox();
        this._switcherCombo.handleTriggerClick();
    }

    handleSwitcherTriggerKeyDown(event) {
        if (this.handleSwitcherReadOnlyTypeAhead(event)) {
            return;
        }

        if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter') {
            this._switcherNavMode = 'keyboard';
            this._switcherReadOnlyStr = '';
        }

        this._switcherCombo.handleTriggerKeyDown(event);
    }

    handleSwitcherOptionClick(event) {
        this._switcherCombo.handleOptionClick(event);
        if (this.search) {
            this.searchTerm = '';
        }
    }

    handleSwitcherReadOnlyTypeAhead(event) {
        if (!event?.key) {
            return false;
        }

        if (event.ctrlKey || event.metaKey || event.altKey) {
            return false;
        }

        const isPrintable = event.key.length === 1;
        const isBackspace = event.key === 'Backspace';
        if (!isPrintable && !isBackspace) {
            if (NAV_KEYS.includes(event.key)) {
                this._switcherReadOnlyStr = '';
                this._switcherReadOnlyStrTimeStamp = Date.now();
            }
            return false;
        }

        if (isPrintable && !ALPHA_NUMERIC_KEYS.includes(event.key) && event.key !== ' ') {
            return false;
        }

        event.preventDefault();
        event.stopPropagation();

        const now = Date.now();
        const last = Number(this._switcherReadOnlyStrTimeStamp) || 0;
        if (!last || now - last > READ_ONLY_SEARCH_TIMEOUT_MS) {
            this._switcherReadOnlyStr = '';
        }

        const { nextStr, match, index } = handleReadOnlySearch(event, this._switcherReadOnlyStr, this._switcherOptions);
        if (typeof nextStr !== 'string') {
            return true;
        }

        this._switcherReadOnlyStr = nextStr;
        this._switcherReadOnlyStrTimeStamp = now;
        this._switcherNavMode = 'typeahead';

        if (!this.isSwitcherOpen) {
            this.closeAddonCombobox();
            this._switcherCombo.open({ focusSelected: false });
        }

        const focusMatch = () => {
            if (match && index >= 0) {
                this._switcherCombo.focusOption(index);
            }
        };

        focusMatch();
        requestAnimationFrame(() => focusMatch());
        return true;
    }

    handleSwitcherOptionMouseMove(event) {
        if (this.isSwitcherReadOnlySearchActive()) {
            return;
        }

        this._switcherNavMode = 'mouse';
        const optionEl = event.currentTarget?.closest?.('.switcher-option[role="option"]');
        this.focusSwitcherOptionElement(optionEl);
    }

    handleSwitcherOptionMouseLeave(event) {
        if (this._switcherNavMode !== 'mouse') {
            return;
        }
        event.currentTarget?.classList?.remove('slds-has-focus');
        event.currentTarget?.setAttribute?.('aria-selected', 'false');
    }

    isSwitcherReadOnlySearchActive() {
        const last = Number(this._switcherReadOnlyStrTimeStamp) || 0;
        return this._switcherNavMode === 'typeahead' && !!this._switcherReadOnlyStr && Date.now() - last <= READ_ONLY_SEARCH_TIMEOUT_MS;
    }

    focusSwitcherOptionElement(optionEl) {
        const options = Array.from(this.template.querySelectorAll('.switcher-option[role="option"]') || []);
        options.forEach((option) => {
            if (option === optionEl) {
                option.classList.add('slds-has-focus');
                option.setAttribute('aria-selected', 'true');
                this._switcherCombo.focusedIndex = options.indexOf(option);
            } else {
                option.classList.remove('slds-has-focus');
                option.setAttribute('aria-selected', 'false');
            }
        });
    }

    handleAddonInputClick(event) {
        this.isAddonInputFocused = true;
        this._switcherCombo?.close();
        if (!this.isAddonOpen) {
            this.openAddonCombobox(this.search ? false : true);
            return;
        }
        event.stopPropagation();
        this.closeAddonCombobox();
    }

    handleAddonInputFocus() {
        this.isAddonInputFocused = true;
    }

    handleAddonInputBlur() {
        this.isAddonInputFocused = false;
    }

    handleAddonInput(event) {
        if (!this.search) {
            return;
        }

        this.searchTerm = event.target.value ?? '';
        this._switcherCombo?.close();
        if (!this.isAddonOpen) {
            this.openAddonCombobox(false);
            requestAnimationFrame(() => {
                this.handleFauxFocusOption(this._comboOptions?.[0]?.id);
            });
            return;
        }

        requestAnimationFrame(() => {
            this.handleFauxFocusOption(this._comboOptions?.[0]?.id);
        });
    }

    handleFauxFocusOption(optionId) {
        if (!optionId || !this._comboOptions) {
            return;
        }

        this._comboOptions.forEach((option) => {
            if (option.id === optionId) {
                option.setAttribute('aria-selected', 'true');
                option.classList.add('slds-has-focus');
                option.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                option.setAttribute('aria-selected', 'false');
                option.classList.remove('slds-has-focus');
            }
        });
    }

    handleAddonKeyDown(event) {

        if (
            this.search && 
            !NAV_KEYS.includes(event.key) && 
            event.key !== 'Backspace'
        ) {
            if (!ALPHA_NUMERIC_KEYS.includes(event.key) && event.key !== ' ') {
                return;
            }
            if (!this.isAddonOpen) {
                this.openAddonCombobox(false);
            }
            return;
        }

        if (event.key === 'Tab' || event.key === 'Escape') {
            if (event.key === 'Escape') {
                event.stopPropagation();
                event.preventDefault();
            }
            this.closeAddonCombobox();
            return;
        }

        if (event.key === 'Enter') {
            if (this.isAddonOpen) {
                event.preventDefault();
                event.stopPropagation();
                const selected = Array.from(this._comboOptions || []).find((option) => option.classList.contains('slds-has-focus'));
                if (selected) {
                    this.toggleSelection(selected.dataset.stableId);
                }
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            this.openAddonCombobox(true);
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

            if (!this.isAddonOpen) {
                this.openAddonCombobox(false, true);
            }

            this.handleFauxFocusOption(options[nextIndex]?.id);
            return;
        }

        this.handleReadOnlyTypeAhead(event);
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

        const { nextStr, match } = handleReadOnlySearch(event, this._readOnlyStr, this.currentOptions);
        if (typeof nextStr !== 'string') {
            return;
        }

        this._readOnlyStr = nextStr;
        this._readOnlyStrTimeStamp = now;

        const applyFocus = () => {
            const comboOptions = this.template.querySelectorAll('.addon-option[role="option"]');
            if (!comboOptions?.length) {
                return false;
            }

            if (match) {
                const matched = Array.from(comboOptions).find((element) => String(element.dataset.value) === String(match.value));
                if (matched) {
                    if (!this.isAddonOpen) {
                        this.openAddonCombobox();
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

    deflectFocus(event) {
        event.preventDefault();
    }

    handleAddonOptionClick(event) {
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

    expandPills() {
        this.isPillsExpanded = true;
        this._expandedFromMore = true;
        this.focusFirstPill();
    }

    focusPillGroup() {
        this.isPillsExpanded = true;
        this._expandedFromMore = true;
        this.isPillFocusActive = true;
    }

    handleSelectionGroupClick(event) {
        if (event.target.closest('.slds-listbox-toggle')) {
            return;
        }

        if (event.target.closest('[data-pill-focus="true"], [data-pill-remove-focus="true"]')) {
            return;
        }

        this.isPillsExpanded = false;
        this.isPillFocusActive = false;
        this._expandedFromMore = false;
    }

    handlePillClick(event) {
        event.stopPropagation();
        this.isPillsExpanded = true;
        this._expandedFromMore = true;
        this.isPillFocusActive = true;

        const pillItem = event.currentTarget.closest('.slds-listbox-item');
        const removeButton = pillItem?.querySelector('[data-pill-remove-focus="true"]');
        if (removeButton && typeof removeButton.focus === 'function') {
            requestAnimationFrame(() => {
                removeButton.focus();
            });
        }
    }

    handlePillRemoveFocus() {
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
    }

    handlePillRemove(event) {
        event.stopPropagation();
        this.isPillsExpanded = true;
        this._expandedFromMore = true;
        this.isPillFocusActive = true;
        const value = event.currentTarget.dataset.pillValue;
        const scopeKey = event.currentTarget.dataset.pillScopeKey || this.activeScope;
        const stableId = event.currentTarget.dataset.pillStableId;
        const currentPills = this.pills;
        const removedIndex = currentPills.findIndex((pill) => pill.value === value);
        const nextSelections = (this.selectedByScope[scopeKey] ?? []).filter((selection) => selection !== value);

        this.selectedByScope = {
            ...this.selectedByScope,
            [scopeKey]: nextSelections
        };
        

        this.dispatchSelections();
        this.isPillFocusActive = true;

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

            const accurateRemovedIndex = stableId
                ? currentPills.findIndex((pill) => pill.stableId === stableId)
                : removedIndex;
            const targetIndex = accurateRemovedIndex < removeButtons.length
                ? accurateRemovedIndex
                : removeButtons.length - 1;
            const nextButton = removeButtons[targetIndex] || removeButtons[0];
            nextButton?.focus();
            this._pillRemovePointerPending = false;
        });
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
