/**
 * sldsInputFilterSearch — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/utils.
 * - Salesforce/platform modules: lwc.
 * - Template children (including conditional UI): c-tooltip-button.
 * - Bundle template: sldsInputFilterSearch.html; local styles: sldsInputFilterSearch.css. Salesforce SLDS
 * styling is expected.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-input-filter-search') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - rows (rows): Legacy public field; current implementation emits search strings and does not filter this
 * array.
 *   Example: child.rows = [];
 * - suppressChildFilter (suppress-child-filter): Legacy flag; current implementation does not branch on it
 * or filter rows locally. Declared default: false.
 *   Example: child.suppressChildFilter = true;
 * - label (label): Visible control label.
 *   Example: child.label = "Status";
 * - fieldHelp (field-help): Tooltip help next to the filter search label.
 *   Example: child.fieldHelp = "Search the displayed records.";
 * - placeHolder (place-holder): Prompt shown when the input has no selection or text. Declared default:
 * 'Search this list...'.
 *   Example: child.placeHolder = "Select an option";
 * - renderFocus (render-focus): Focuses the input after it becomes available/rendered. Declared default:
 * false.
 *   Example: child.renderFocus = true;
 * - focusHelp (focus-help): Help string or array displayed when the search field is focused.
 *   Example: child.focusHelp = ['Press Enter to search.'];
 * - borderRadius (border-radius): CSS corner radius, including units.
 *   Example: child.borderRadius = "0.25rem";
 * - isIconRight (is-icon-right): Moves the search icon to the right.
 *   Example: child.isIconRight = true;
 * - suppressButton (suppress-button): Hides the search field's clear button.
 *   Example: child.suppressButton = true;
 * - icon (icon): Utility icon key without category prefix.
 *   Example: child.icon = "search";
 *
 * Public methods (call on the rendered child):
 * - focusMe(): Focus the component input/control.
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-slds-input-filter-search label="Search accounts"
 *         onsearchfilter={handleCommitted} oncurrentsearchfilter={handleLive}>
 *     </c-slds-input-filter-search>
 *     <template for:each={filteredRows} for:item="row">
 *         <div key={row.Id}>{row.Name}</div>
 *     </template>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     rows = [{ Id: 'row-1', Name: 'Acme' }, { Id: 'row-2', Name: 'Example' }];
 *     term = '';
 *     handleCommitted(event) { this.term = event.detail; }
 *     handleLive(event) { this.term = event.detail; }
 *     get filteredRows() {
 *         return this.rows.filter(row => row.Name.toLowerCase().includes(this.term.toLowerCase()));
 *     }
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Use as a search-term input. currentsearchfilter fires on input; searchfilter fires for committed
 * Enter/Tab changes and clearing. Both details are strings. Despite legacy comments/API names, rows and
 * suppressChildFilter do not currently perform local filtering; the example filters in the parent. Listen
 * only to searchfilter when querying on every keystroke is undesirable.
 */

import { LightningElement, track, api } from 'lwc';

import {iconMap as ICON_MAP} from 'c/utils';


function getFormElementCl(isIconRight, suppressButton) {
    if (suppressButton && isIconRight) {
        return 'slds-form-element__control slds-input-has-icon slds-input-has-icon_right';
    }
    if (suppressButton) {
        return 'slds-form-element__control slds-input-has-icon slds-input-has-icon_left'
    }
    return 'slds-form-element__control slds-input-has-icon slds-input-has-icon_left-right';
}

export default class SldsInputFilterSearch extends LightningElement {
    
    // Imported Properties
    @track iconMap = ICON_MAP;

    // Public Properties
    @api rows;                          // Store the array of object to filter
    @api suppressChildFilter = false;  // If "true" dont apply filter locally.  Evt: 'newinput' ---++  if "false" filter.  Evt: 'newfilter'
    @api label;                       // label above form element 
    @api fieldHelp;                  // Tooltip help above form element (nieghbors <label>)
    @api placeHolder = 'Search this list...';

    @api renderFocus = false;

    _suppressFocusHelp = true;
    _isFocusHelpArr = false;
    @api // Display help text that appears in tooltip on focus
    set focusHelp(val) {
        this._isFocusHelpArr = Array.isArray(val) && val?.length;
        this._focusHelp = this._isFocusHelpArr 
            ? val.map((help, index) => ({text: help, keyId: `help-${index}`}))
            : val;
    }
    get focusHelp() {
        return this._focusHelp ?? null;
    }

    @api 
    set borderRadius(val) {
        this._borderRadius = val;
        if (val) {
            this._applyVarsDirect('--slds-c-input-radius-border', val)
        }
    }
    get borderRadius() {
        return this._borderRadius;
    }

    // Local Properties
    @track componentHelp;              // Usage help.  Ex: 'Press enter to finalize input'
    @track value = '';                // current value the input element 

    lastDispatchedVal;


    _formEleCl = 'slds-form-element__control slds-input-has-icon slds-input-has-icon_left-right';
    @api // Display icon on the right
    set isIconRight(val) {
        this._isIconRight = !!val;
        this._formEleCl = getFormElementCl(!!val, this.suppressButton);
    }
    get isIconRight() {
        return !!this._isIconRight;
    }
    @api // Do not include the "clear value" button
    set suppressButton(val) {
        this._suppressButton = !!val;
        this._formEleCl = getFormElementCl(this.isIconRight, !!val);
    }
    get suppressButton() {
        return !!this._suppressButton;
    }


    @api 
    set icon(val) {
        this._icon = val;
    }
    get icon() {
        return this._icon 
            ? this.iconMap.utility[this._icon] ?? this.iconMap.utility.search 
            : this.iconMap.utility.search;
    }

    @api focusMe() {
        const inp = this.template.querySelector('input');
        if (inp) {
            inp.focus();
        }
    }

    _didFocus = false;
    renderedCallback() {
        if (this.renderFocus && !this._didFocus) {
            const inp = this.template.querySelector('input');
            if (inp) {
                inp.focus();
                this._didFocus = true;
            }
        }
    }

    // Send current value to parent
    dispatchValue() {
        // Store the most recent dispatched value 
        this.lastDispatchedVal = this.value; 

        this.dispatchEvent(new CustomEvent('searchfilter', {
            detail: this.value,
            bubbles: true,
            composed: true
        }));
    }

    dispatchEveryChange() {
        this.dispatchEvent(new CustomEvent('currentsearchfilter', {
            detail: this.value,
            bubbles: true,
            composed: true
        }));
    }

    // Detect finalized changes in the input element
    handleChange(event) {
        this._wasChanged = true;
        this.value = event.target.value;
        //this.dispatchValue();
    }

    handleKeyDown(event) {
        setTimeout(() => {
            if (
                this._wasChanged && 
                event.key &&  
                (event.key === 'Tab' || event.key === 'Enter') 
            ) {
                this.dispatchValue();
            }        
        }, 30);
    }

    get _labelFor() {
        return this.focusHelp 
            ? 'text-input-id-48'
            : 'text-input-id-47';
    }
    
    // Detect all changes made in the input element
    handleInput(event) {
        this.value = event.target.value;
        this.dispatchEveryChange();
    }

    clearValue() {
        const inputE1 = this.template.querySelector('input'); 
        if (inputE1) inputE1.value = '';
        this.value = '';
        this.dispatchValue();
        setTimeout(() => {
            inputE1.focus();
        }, 50);
    }

    handleBlur(event) {
        this._suppressFocusHelp = true;
        event.preventDefault();
        event.stopPropagation();
    }

    
    handleHelpVariantFocus(event) {
        this._suppressFocusHelp = false;
    }
    handleHelpVariantFocusOut() {
        this._suppressFocusHelp = true;
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