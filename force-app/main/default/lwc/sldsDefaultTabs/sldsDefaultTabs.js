/**
 * sldsDefaultTabs — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/utils.
 * - Salesforce/platform modules: lwc.
 * - Template children (including conditional UI): c-slds-menu-popover-button.
 * - Bundle template: sldsDefaultTabs.html; local styles: sldsDefaultTabs.css. Salesforce SLDS styling is
 * expected.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-default-tabs') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - contentBg (content-bg): CSS background color of tab content.
 *   Example: child.contentBg = "#ffffff";
 * - contentBorder (content-border): CSS border around tab content.
 *   Example: child.contentBorder = "1px solid #c9c9c9";
 * - tab1Label (tab1-label): Label that enables the tab1 header and matching named slot.
 *   Example: child.tab1Label = "Tab 1";
 * - tab2Label (tab2-label): Label that enables the tab2 header and matching named slot.
 *   Example: child.tab2Label = "Tab 2";
 * - tab3Label (tab3-label): Label that enables the tab3 header and matching named slot.
 *   Example: child.tab3Label = "Tab 3";
 * - tab4Label (tab4-label): Label that enables the tab4 header and matching named slot.
 *   Example: child.tab4Label = "Tab 4";
 * - tab5Label (tab5-label): Label that enables the tab5 header and matching named slot.
 *   Example: child.tab5Label = "Tab 5";
 * - tab6Label (tab6-label): Label that enables the tab6 header and matching named slot.
 *   Example: child.tab6Label = "Tab 6";
 * - tab7Label (tab7-label): Label that enables the tab7 header and matching named slot.
 *   Example: child.tab7Label = "Tab 7";
 * - tab8Label (tab8-label): Label that enables the tab8 header and matching named slot.
 *   Example: child.tab8Label = "Tab 8";
 * - tab9Label (tab9-label): Label that enables the tab9 header and matching named slot.
 *   Example: child.tab9Label = "Tab 9";
 * - activeTab (active-tab): Active slot ID, tab1 through tab9; defaults to the first labeled tab.
 *   Example: child.activeTab = "tab1";
 * - spacing (spacing): Tab content spacing token (for example x-small, small, medium or large).
 *   Example: child.spacing = "small";
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-slds-default-tabs tab1-label="Overview" tab2-label="Details"
 *         active-tab={activeTab} ontabchange={handleTab}>
 *         <div slot="tab1">Overview content</div>
 *         <div slot="tab2">Detail content</div>
 *     </c-slds-default-tabs>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     activeTab = 'tab1';
 *     handleTab(event) { this.activeTab = event.detail; }
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Use for standard underlined tab navigation. Label and slot names must match: tab1-label with
 * slot="tab1", through tab9. tabchange.detail is a slot ID such as tab2. Omit a label to hide that tab.
 * Content belongs to the parent and can be styled in its CSS; spacing controls the component's panel
 * spacing.
 * - Slots: tab1, tab2, tab3, tab4, tab5, tab6, tab7, tab8, tab9.
 */

/* Example Usage 
    
    <c-slds-default-tabs
        tab1-label="Overview"
        tab2-label="Details"
        tab3-label="Performance"
        active-tab={activeTab}
        ontabchange={handleTabChange}
    >
        <!--Slots-->
        <div slot="tab1">
            <p>Overview content.</p>
        </div>

        <div slot="tab2">
            <p>Details content.</p>
        </div>

        <div slot="tab3">
            <p>Performance content.</p>
        </div>
        <!--End Slots-->

    </c-slds-default-tabs>

    Javascript: 
        handleTabChange(event) {
            const activeTab = event.detail;
            
            // ... Do something if necessary
            // --> Example of "do something"
            this.isLoading = true;
            if (activeTab === 'tab1') {
                const oppData = await myApexMethod({objectApiName: 'Opportunity'});
                this.oppData = oppData;
            }
        }

*/



import { LightningElement, api } from 'lwc';
import {iconMap as ICON_MAP} from 'c/utils';

const ORDER = ['tab1','tab2','tab3','tab4','tab5','tab6','tab7','tab8','tab9'];

// --slds-c-tabs-panel-spacing-block-end: 0.5rem;
// --slds-c-tabs-panel-spacing-block-start: 0.5rem;
const TAB_SPACING_SIZES = {
    'x-small': '0.25rem',
    small: '0.5rem',
    medium: '0.75rem',
    large: '1.0rem'
}

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
].join(',');

const OVERFLOW_RESERVE_WIDTH = 80;
const OVERFLOW_STABILITY_BUFFER = 8;

export default class SldsDefaultTabs extends LightningElement {
    iconMap = ICON_MAP;


    @api contentBg;
    @api contentBorder;

    // labels control existence
    @api tab1Label;
    @api tab2Label;
    @api tab3Label;
    @api tab4Label;
    @api tab5Label;
    @api tab6Label;
    @api tab7Label;
    @api tab8Label;
    @api tab9Label;

    // overflow state
    _visibleIds = [...ORDER]; // will get trimmed
    _overflowIds = [];
    _isOverflowOpen = false;

    _hasRendered = false;
    _resizeHandlerBound;
    _overflowAnimationFrame;
    _tabWidthById = {};

    _active;
    @api set activeTab(v) { this._active = v; }
    get activeTab() { return this._active || this._firstVisible || null; }

    
    // Spacing between the tab header and the start of the content
    @api // Options: ['x-small', 'small', 'medium', 'large']
    set spacing(val) {
        this._spacing = val;
        if (val && TAB_SPACING_SIZES[val]) {
            const varsParam = [
                ['--slds-c-tabs-panel-spacing-block-end', TAB_SPACING_SIZES[val]],
                ['--slds-c-tabs-panel-spacing-block-start', TAB_SPACING_SIZES[val]]
            ];
            this._applyVarsDirect(varsParam)
        }
    }
    get spacing() {
        return this._spacing;
    }

    get _labels() {
        return {
            tab1: this.tab1Label, tab2: this.tab2Label, tab3: this.tab3Label,
            tab4: this.tab4Label, tab5: this.tab5Label, tab6: this.tab6Label,
            tab7: this.tab7Label, tab8: this.tab8Label, tab9: this.tab9Label
        };
    }

    get _firstVisible() {
        return ORDER.find(k => !!this._labels[k]) || null;
    }

    get _normActive() {
        const a = this._active;
        return (a && this._labels[a]) ? a : this._firstVisible;
    }

    _is(id) { return this._normActive === id; }
    _itemClass(id) { return `slds-tabs_default__item${this._is(id) ? ' slds-is-active' : ''}`; }
    _panelClass(id) { return `slds-tabs_default__content ${this._is(id) ? 'slds-show' : 'slds-hide'}`; }
    _aria(id) { return String(this._is(id)); }
    _ti(id) { return this._is(id) ? '0' : '-1'; }
    _existingTabIds() { return ORDER.filter(id => !!this._labels[id]); }



    // new helpers for overflow
    _isVisible(id) {
        return this._visibleIds.includes(id) && !!this._labels[id];
    }
    _isOverflow(id) {
        return this._overflowIds.includes(id) && !!this._labels[id];
    }

    get hasOverflow() {
        return this._overflowIds.length > 0;
    }

    get overflowDropdownClass() {
        return this._isOverflowOpen
            ? 'slds-dropdown slds-dropdown_right slds-is-open'
            : 'slds-dropdown slds-dropdown_right';
    }
    get overflowAria() {
        return String(this._activeInOverflow);
    }
    get overflowTI() {
        return this._activeInOverflow ? '0' : '-1';
    }

    connectedCallback() {
        this._resizeHandlerBound = this._handleResize.bind(this);
        window.addEventListener('resize', this._resizeHandlerBound);
    }
    disconnectedCallback() {
        window.removeEventListener('resize', this._resizeHandlerBound);
        window.cancelAnimationFrame(this._overflowAnimationFrame);
    }

    renderedCallback() {
        if (!this._hasRendered) {
            this._hasRendered = true;
            this._recalculateOverflow();
        }
        this._applyVars();
    }
    _handleResize() {
        clearTimeout(this._resizeTimeout);
        this._resizeTimeout = setTimeout(() => {
            this._recalculateOverflow();
        }, 80);
    }

    // Call this function in renderedCallback  --> e.g. renderedCallback() {this.applyVars();}
    _stylesApplied = false;
    // Apply Styles to the host
    _applyVars() {
        if (this._stylesApplied) return;
        const el = this.template.host; // or a wrapper: this.template.querySelector('.root')

        if (this.contentBg) el.style.setProperty('--content-bg',  this.contentBg);
        if (this.contentBorder) el.style.setProperty('--content-border', this.contentBorder);

        this._stylesApplied = true;
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

    _areIdsEqual(a = [], b = []) {
        return a.length === b.length && a.every((id, index) => id === b[index]);
    }

    _getTabWidth(id) {
        const tab = this.template.querySelector(`[role="tab"][data-id="${id}"]`);
        const li = tab?.closest('li') ?? this.template.querySelector(`li[data-tab-id="${id}"], li[data-id="${id}"]`);
        const width = li?.offsetWidth ?? 0;
        if (width > 0) {
            this._tabWidthById[id] = width;
            return width;
        }

        return this._tabWidthById[id] ?? ((String(this._labels[id] ?? '').length * 8) + 40);
    }

    _applyOverflowState(visible, overflow) {
        if (this._areIdsEqual(this._visibleIds, visible) && this._areIdsEqual(this._overflowIds, overflow)) {
            return;
        }

        this._visibleIds = visible;
        this._overflowIds = overflow;
    }

    _recalculateOverflow() {
        const nav = this.template.querySelector('[data-role="nav"]');
        if (!nav) return;

        const existingIds = ORDER.filter(id => !!this._labels[id]);
        if (!existingIds.length) {
            this._applyOverflowState([], []);
            return;
        }

        window.cancelAnimationFrame(this._overflowAnimationFrame);
        this._overflowAnimationFrame = window.requestAnimationFrame(() => {
            this._overflowAnimationFrame = null;
            const hostWidth = this.template.host.getBoundingClientRect().width;
            if (!hostWidth) return;

            let usedWidth = 0;
            const visible = [];
            const overflow = [];
            const availableWidth = Math.max(hostWidth - OVERFLOW_RESERVE_WIDTH - OVERFLOW_STABILITY_BUFFER, 0);

            existingIds.forEach(id => {
                const w = this._getTabWidth(id);

                if (this._normActive === id) {
                    // favor keeping active tab in the visible row
                    if (usedWidth + w <= availableWidth) {
                        visible.push(id);
                        usedWidth += w;
                    } else {
                        // if even active doesn't fit, it still goes overflow
                        overflow.push(id);
                    }
                    return;
                }

                if (usedWidth + w <= availableWidth) {
                    visible.push(id);
                    usedWidth += w;
                } else {
                    overflow.push(id);
                }
            });

            this._applyOverflowState(visible.length ? visible : [existingIds[0]], overflow);
        });
    }

    
    _activateTab(tabId, focusTab=false, recalculate=false) {
        if (!tabId || !this._labels[tabId]) {
            return;
        }

        this._active = tabId;
        this._isOverflowOpen = false;
        this.dispatchEvent(new CustomEvent('tabchange', { detail: tabId } ));

        if (focusTab) {
            requestAnimationFrame(() => {
                this._focusSelectedTab();
            });
        }

        if (recalculate) {
            Promise.resolve().then(() => {
                this._recalculateOverflow();
            });
        }
    }

    _focusSelectedTab() {
        const selectedTab = this.template.querySelector(`[role="tab"][data-id="${this._normActive}"]`) ??
            this.template.querySelector('[role="tab"][data-id="overflow"]');
        selectedTab?.focus?.();
    }

    _getActivePanel() {
        return this.template.querySelector(`[data-panel-id="${this._normActive}"]`);
    }

    _getFocusableElements(container) {
        if (!container) {
            return [];
        }

        const focusables = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
        const slots = Array.from(container.querySelectorAll('slot'));
        slots.forEach(slot => {
            slot.assignedElements({ flatten: true }).forEach(element => {
                if (element.matches?.(FOCUSABLE_SELECTOR)) {
                    focusables.push(element);
                }
                focusables.push(...Array.from(element.querySelectorAll?.(FOCUSABLE_SELECTOR) ?? []));
            });
        });

        return focusables.filter(element => {
            const ariaHidden = element.getAttribute?.('aria-hidden') === 'true';
            return !ariaHidden && element.offsetParent !== null;
        });
    }

    _focusFirstPanelElement() {
        const firstFocusable = this._getFocusableElements(this._getActivePanel())[0];
        if (firstFocusable) {
            firstFocusable.focus();
            return true;
        }
        return false;
    }

    onTabKeyDown(event) {
        const isSelectedTab = event.currentTarget.getAttribute('aria-selected') === 'true';
        if (!isSelectedTab) {
            return;
        }

        if (event.key === 'Tab' && !event.shiftKey) {
            if (this._focusFirstPanelElement()) {
                event.preventDefault();
            }
            return;
        }

        if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) {
            return;
        }

        event.preventDefault();
        const ids = this._existingTabIds();
        const currentIndex = ids.indexOf(this._normActive);
        if (currentIndex === -1) {
            return;
        }

        const nextIndex = event.key === 'ArrowRight' || event.key === 'ArrowDown'
            ? (currentIndex + 1) % ids.length
            : (currentIndex - 1 + ids.length) % ids.length;
        this._activateTab(ids[nextIndex], true, true);
    }

    onPanelKeyDown(event) {
        if (event.key !== 'Tab' || !event.shiftKey) {
            return;
        }

        const focusables = this._getFocusableElements(this._getActivePanel());
        const eventPath = event.composedPath?.() ?? [];
        const actualTarget = eventPath[0] ?? event.target;
        if (focusables[0] && actualTarget === focusables[0]) {
            event.preventDefault();
            this._focusSelectedTab();
        }
    }

    onTabClick(e) {
        e.preventDefault();
        const tabId = e.currentTarget.dataset.id;
        this._activateTab(tabId);
    }
    onOverflowItemClick(message) {
        const tabId = message?.detail?.selection;
        this._activateTab(tabId, false, true);
    }

    get hiddenTabs() {
        const result = [];
        const labels = this._labels; // { tab1: 'Overview', tab2: 'Details', ... }

        ORDER.forEach(id => {
            const tabLabel = labels[id];
            if (tabLabel && !this._isVisible(id)) {
                result.push({
                    label: tabLabel, // "Overview"
                    value: id        // "tab1"
                });
            }
        });
        return result;
    }
    // true if current active tab is one of the overflowIds
    get _activeInOverflow() {
        return this._overflowIds.includes(this._normActive);
    }
    get overflowButtonClass() {
        // base button look
        let cls = 'slds-button';

        // when active tab is in overflow, make it look like a tab
        if (this._activeInOverflow) {
            cls += ' slds-tabs_default__link slds-overflow-is-active';
        }

        return cls;
    }
    get overflowItemClass() {
        // base classes for the overflow tab container
        let cls = 'slds-tabs_default__item slds-tabs_default__overflow-button';
        if (this._activeInOverflow) {
            cls += ' slds-is-active';
        }
        return cls;
    }



    // getters (no args allowed in template)
    get tab1ItemClass() { return this._itemClass('tab1'); }
    get tab2ItemClass() { return this._itemClass('tab2'); }
    get tab3ItemClass() { return this._itemClass('tab3'); }
    get tab4ItemClass() { return this._itemClass('tab4'); }
    get tab5ItemClass() { return this._itemClass('tab5'); }
    get tab6ItemClass() { return this._itemClass('tab6'); }
    get tab7ItemClass() { return this._itemClass('tab7'); }
    get tab8ItemClass() { return this._itemClass('tab8'); }
    get tab9ItemClass() { return this._itemClass('tab9'); }

    get tab1PanelClass() { return this._panelClass('tab1'); }
    get tab2PanelClass() { return this._panelClass('tab2'); }
    get tab3PanelClass() { return this._panelClass('tab3'); }
    get tab4PanelClass() { return this._panelClass('tab4'); }
    get tab5PanelClass() { return this._panelClass('tab5'); }
    get tab6PanelClass() { return this._panelClass('tab6'); }
    get tab7PanelClass() { return this._panelClass('tab7'); }
    get tab8PanelClass() { return this._panelClass('tab8'); }
    get tab9PanelClass() { return this._panelClass('tab9'); }

    get tab1Aria() { return this._aria('tab1'); }
    get tab2Aria() { return this._aria('tab2'); }
    get tab3Aria() { return this._aria('tab3'); }
    get tab4Aria() { return this._aria('tab4'); }
    get tab5Aria() { return this._aria('tab5'); }
    get tab6Aria() { return this._aria('tab6'); }
    get tab7Aria() { return this._aria('tab7'); }
    get tab8Aria() { return this._aria('tab8'); }
    get tab9Aria() { return this._aria('tab9'); }

    get tab1TI() { return this._ti('tab1'); }
    get tab2TI() { return this._ti('tab2'); }
    get tab3TI() { return this._ti('tab3'); }
    get tab4TI() { return this._ti('tab4'); }
    get tab5TI() { return this._ti('tab5'); }
    get tab6TI() { return this._ti('tab6'); }
    get tab7TI() { return this._ti('tab7'); }
    get tab8TI() { return this._ti('tab8'); }
    get tab9TI() { return this._ti('tab9'); }


    // NEW: visible/overflow flags for template
    get tab1IsVisible() { return this._isVisible('tab1'); }
    get tab2IsVisible() { return this._isVisible('tab2'); }
    get tab3IsVisible() { return this._isVisible('tab3'); }
    get tab4IsVisible() { return this._isVisible('tab4'); }
    get tab5IsVisible() { return this._isVisible('tab5'); }
    get tab6IsVisible() { return this._isVisible('tab6'); }
    get tab7IsVisible() { return this._isVisible('tab7'); }
    get tab8IsVisible() { return this._isVisible('tab8'); }
    get tab9IsVisible() { return this._isVisible('tab9'); }

    get tab1IsOverflow() { return this._isOverflow('tab1'); }
    get tab2IsOverflow() { return this._isOverflow('tab2'); }
    get tab3IsOverflow() { return this._isOverflow('tab3'); }
    get tab4IsOverflow() { return this._isOverflow('tab4'); }
    get tab5IsOverflow() { return this._isOverflow('tab5'); }
    get tab6IsOverflow() { return this._isOverflow('tab6'); }
    get tab7IsOverflow() { return this._isOverflow('tab7'); }
    get tab8IsOverflow() { return this._isOverflow('tab8'); }
    get tab9IsOverflow() { return this._isOverflow('tab9'); }
}
