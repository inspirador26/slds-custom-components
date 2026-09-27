/**
 * sldsComboboxRecordTypes — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/utils.
 * - Salesforce/platform modules: lwc, lightning/platformShowToastEvent, lightning/uiObjectInfoApi.
 * - Template children (including conditional UI): lightning-icon, lightning-spinner.
 * - Bundle template: sldsComboboxRecordTypes.html; local styles: sldsComboboxRecordTypes.css. Salesforce
 * SLDS styling is expected.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-combobox-record-types') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - comboboxDetails (combobox-details): Picklist configuration with objectApiName, fieldApiName and
 * recordTypeId.
 *   Example: child.comboboxDetails = { objectApiName: 'Account', fieldApiName: 'Industry', recordTypeId:
 * '012000000000000AAA' };
 * - currentValue (current-value): Current input or selected option value; keep parent state in sync with
 * the selection event.
 *   Example: child.currentValue = "open";
 * - recordId (record-id): Salesforce record ID used for record context; supply a real ID from the parent.
 *   Example: child.recordId = this.recordId;
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-slds-combobox-record-types combobox-details={details}
 *         current-value={value} onselected={handleSelected}></c-slds-combobox-record-types>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     details = { objectApiName: 'Lead', fieldApiName: 'Status', recordTypeId: '012000000000000AAA' };
 *     value = 'Open - Not Contacted';
 *     selection;
 *     handleSelected(event) { this.selection = event.detail; }
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - This is a record-type-aware field picklist, not a record-type chooser. Use an accessible record type
 * and valid field value for your org; Lead Status is the legacy conversion-aware use case. selected.detail
 * is { value, recordId, fieldApiName }, or null when canceled. Converted Lead statuses receive special
 * handling rather than normal selection. Configuration goes through comboboxDetails;
 * objectApiName/fieldApiName are not standalone @api properties here.
 */

import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


import { getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import { parsePicklistValues, getToastErrorMessage } from 'c/utils'


export default class SldsComboboxRecordTypes extends LightningElement {

    // -------- Public Properties -------- \\ (Retrieved from @api comboboxDetails)
    recordTypeId = null;                           
    objectApiName = null;                          
    fieldApiName = null;     
    // ----------------------------------- \\
    
    wiredPicklistLoaded = false;                     // Data loaded tracker
    @track isDataLoaded = false;                    // Data loaded tracker

    convertedValsArr = [];                        // Converted type picklist values
    @track localOptions = [];                    // Picklist options tracker
    wiredPicklistVals = [];                     // Picklist options tracker

    originalValue = null;                     // Value tracker
    eventSending = false;                    // Value tracker

    @track isComboBoxOpen = false;         // Combobox state tracker
    @track highlightedOptionId = null;    // Combobox state tracker


    // Handle Public Property 'comboboxDetails'
    _comboboxDetails; // RecordTypeId, ObjectApiName, FieldApiName
    @api
    set comboboxDetails(value) {
        if (value) {
            this._comboboxDetails = value;
            // Rest Public properties
            this.recordTypeId = null;
            this.objectApiName = null;
            this.fieldApiName = null;

            // Reset tracked variables
            this.wiredPicklistVals = [];
            this.convertedValsArr = [];
            this.isDataLoaded = false;
            this.wiredPicklistLoaded = false;
            this.originalValue = null;
            this.eventSending = false
            this.isComboBoxOpen = false
            this.highlightedOptionId = null;

            // Get the public property values
            for (const key of Object.keys(value)) {
                this[key] = value[key];
            }
        }
    }
    get comboboxDetails() {
        return this._comboboxDetails;
    }

    _currentValue; // Current Field's Value
    @api set currentValue(value) {
        if (value) {
            this._currentValue = value;
            this.originalValue = value;
        }
    }
    get currentValue() {
        return this._currentValue;
    }

    _recordId; // Record Id
    @api set recordId(value) {
        if (value) {
            this._recordId = value;
        }
    }
    get recordId() {
        return this._recordId;
    }



    // ============== Initialize Dependencies ============== \\
    @wire(getPicklistValuesByRecordType, { objectApiName: "$objectApiName", recordTypeId: "$recordTypeId" })
    wiredPicklistValues({ error, data }) {
        if (data) {
            this.wiredPicklistVals = parsePicklistValues(JSON.parse(JSON.stringify(data)), this.fieldApiName);
            this.wiredPicklistLoaded = true;  // Mark `getPicklistValuesByRecordType` as loaded

            const picklistInfo = data.picklistFieldValues[this.fieldApiName];
            const picklistValues = picklistInfo.values; 
            // Get the "converted"  values for 'Status'
            const convertedValsArr = picklistValues.map(option => {
                if (option.attributes.converted) {
                    return option.value;
                }
            }).filter(Boolean);

            this.convertedValsArr = [...convertedValsArr];
        } else if (error) {
            console.error('Error fetching picklist values:', error);
        }
    } // Fetch Picklist Values by Record Type

    async waitForWiredData() {
        const maxWaitTime = 10000; // Maximum wait time of 10 seconds
        const pollInterval = 100; // Poll every 100 milliseconds
        let elapsedTime = 0;
    
        while (!this.wiredPicklistLoaded) {
            if (elapsedTime >= maxWaitTime) {
                throw new Error('Timed out waiting for objectApiName to be available.');
            }
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
            elapsedTime += pollInterval;
        }
    } // Make sure Object APIA Name is loaded before running any code

    // ===================================================== \\



    // ===================== Callbacks ===================== \\

    // Initialize <-localOptions-> && store <-originalValue->
    async connectedCallback() {
        try {
            // Wait for wired picklist values
            await this.waitForWiredData();

            // Handle undefined current value
            if (this.currentValue === undefined) {
                this.currentValue = '';
            }

            // Add 'isSelected' property to the picklist options ---> mark current value as 'isSelected'
            this.localOptions = this.wiredPicklistVals.map(option => ({
                ...option,
                isSelected: this.currentValue === option.value, 
                isConvert: this.convertedValsArr.length > 0 && this.convertedValsArr.includes(option.value)
            }));
            
            // Store the original value
            this.originalValue = this.currentValue;

            this.isDataLoaded = true;
        }catch(error) {
            getToastErrorMessage('connectedCallback', 'SldsComboboxRecordTypes', error);
        }
    }

    // Focus the combobox <input> element
    renderedCallback() {
        try {
            if (this.isDataLoaded) {
                const comboboxInput = this.template.querySelector('[data-id="popoverInput"]');
                comboboxInput.focus();
            }
        }catch(error) {
            getToastErrorMessage('renderedCallback', 'SldsComboboxRecordTypes', error);
        }
    }
    
    // ===================================================== \\

    get isInvalidSelection() {
        return this.convertedValsArr.length > 0 && this.convertedValsArr.includes(this.currentValue);
    }

    // ================== Events To Parent ================= \\
    // Send event to parent when an option has been selected
    handleSelection() {
        try {
            if (!this.eventSending) {
                this.eventSending = true;
                const detail = {
                    value: this.currentValue, 
                    recordId: this.recordId, 
                    fieldApiName: this.fieldApiName,
                }
                setTimeout(() => {
                    if (this.isInvalidSelection) {
                        this.handleConversionSelect();
                        return;
                    }
                    this.dispatchEvent(new CustomEvent('selected', { detail: detail } ));
                    this.eventSending = false;
                }, 5);
            }
        }catch(error) {
            getToastErrorMessage('handleSelection', 'SldsComboboxRecordTypes', error);
        }
    }
    handleCancel() {
        const detail = {
            value: this.originalValue, 
            recordId: this.recordId, 
            fieldApiName: this.fieldApiName,
        }
        this.dispatchEvent(new CustomEvent('selected', { detail: null } ));
    }
    // ===================================================== \\


    // Handle Combobox option Click events
    handleOptionClick(event) {
        try {
            if (this.isConvertedSelected(event.currentTarget.dataset.value)) {
                this.handleConversionSelect(); 
                return;
            }

            this.localOptions = this.localOptions.map(option => ({
                ...option,
                isSelected: option.value === event.currentTarget.dataset.value
            }));
    
            this.currentValue = event.currentTarget.dataset.value; // Now currentValue updates properly
            this.toggleCombobox();
        }catch(error) {
            getToastErrorMessage('handleOptionClick', 'SldsComboboxRecordTypes', error);
        }
    }
    // Handle open/close triggering events for Combobox
    toggleCombobox(event=null, comboboxParam=null) {
        try {
            if (event && event.key && event.key !== undefined) {

                if (this.isComboBoxOpen) {
                    // If combobox dropdown is open --> Bounce the keyDown events to the comboboxOptions keyDown handler
                    event.preventDefault();
                    this.handleComboboxKeyDown(event);
                    return;
                } else if(!this.isComboBoxOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
                    // Make sure page does not scroll down when user wants to open combobox
                    event.preventDefault();
                }
            }
    
            // Query the markup for combobox 
            const combobox = event ? this.template.querySelector('[data-id="combobox"]') : comboboxParam;
            if (!combobox) return; // Exit if no combobox is found
    
            if ((!event && comboboxParam) || (!event.key || event.key === undefined)) {
                // Toggle the 'slds-is-open'
                this.handleSldsAriaCombobox(combobox, null, null);
                // Set current value as 'Selected'
                this.localOptions.forEach(option => option.isSelected = this.currentValue === option.value); 
                return;
            }
    
            if (event && event.key && event.key !== undefined && ['Tab', 'Escape'].every(key => event.key !== key)) { 
                this.handleSldsAriaCombobox(combobox, null, true);
            }
        }catch(error) {
            getToastErrorMessage('toggleCombobox', 'SldsComboboxRecordTypes', error);
        }
    }
    // Control the combobox slds class states && the Aria attributes
    handleSldsAriaCombobox(combobox=null, comboboxOptions=null, isPositive=null) {
        try {
            if (combobox) {
                if (isPositive === null) {
                    // Case 1: (is an actual toggle) --> 'isPositive' is neither true or false
                    const isOpen = combobox.classList.toggle('slds-is-open');
                    combobox.setAttribute('aria-expanded', isOpen ? 'true' : 'false'); 
                    this.isComboBoxOpen = isOpen ? true : false; 
    
                } else if(isPositive === false) {
                    // Case 2: Force the combobox dropdown to open
                    combobox.classList.remove('slds-is-open'); 
                    combobox.setAttribute('aria-expanded', 'false');
                    this.isComboBoxOpen = false;
                
                } else {
                    // Case 3: Force the combobox to close
                    combobox.classList.add('slds-is-open'); 
                    combobox.setAttribute('aria-expanded', 'true');
                    this.localOptions.forEach(option => option.isSelected = this.currentValue === option.value); // action='findSelected'
                    this.isComboBoxOpen = true;
                }
            }
    
            if (comboboxOptions) {
                // Handle single combobox option OR all combobox options
                if (Array.from(comboboxOptions).length > 1) {
                    // Case 1: Operate on all combobox options 
                    if (isPositive) {
                        // Case 1.a: Find the focused combobox && mark it as selected && update the currentValue
                        const selected = Array.from(comboboxOptions).find(option => option.classList.contains('slds-has-focus')); 
                        if (this.isConvertedSelected(selected.dataset.value)) {
                            selected.classList.remove('slds-has-focus'); 
                            this.handleConversionSelect(); 
                            return;
                        }
                        selected.classList.add('slds-is-selected');  // Mark the focused combox as "slds-is-selected"
                        selected.setAttribute('aria-checked', 'true'); // Mark the focused combox as "aria-checked=true"
                        this.localOptions.forEach(option => option.isSelected = option.value === selected.dataset.value); // action='UpdateDraftValue'
                        this.currentValue = selected.dataset.value;
    
                    } else {
                        // Case 1.b: Mark all options as not 'slds-is-selected' and not 'aria-checked'
                        comboboxOptions.forEach(option => {option.classList.remove('slds-is-selected'); option.setAttribute('aria-checked', 'false') });
                    }
                    
                } else {
                    // Case 2: Operate on single combobox option
                    if (isPositive) {
                        // Case 2.a: set all focus/aria-selected to false
                        comboboxOptions.classList.add('slds-has-focus');
                        comboboxOptions.setAttribute('aria-selected', 'true');
                    } else {
                        // Case 2.b: set all focus/aria-selected to true
                        comboboxOptions.classList.remove('slds-has-focus');
                        comboboxOptions.setAttribute('aria-selected', 'false');
                    }
    
                }
            }
    
            // Pass event to parent component if selection was made
            if (!this.isComboBoxOpen) {
                this.handleSelection();
            }
        }catch(error) {
            getToastErrorMessage('handleSldsAriaCombobox', 'SldsComboboxRecordTypes', error);
        }
        
    }
    // Handle combobox keyboard navigations
    handleComboboxKeyDown(event) {
        try {

            function isCommandKeys() {
                const commandKeys = new Set([
                    'Alt', 'Control', 'Meta', 'OS', 'ContextMenu', 
                    'CapsLock', 'NumLock', 'ScrollLock', 'Pause', 'Insert'
                ]);

                // Also exclude F1..F12
                for (let i = 1; i <= 12; i++) {
                    commandKeys.add('F' + i);
                }
            
                // If the user pressed a command key or is holding Alt/Ctrl/Meta, do nothing
                if (
                    commandKeys.has(event.key) ||
                    event.altKey ||
                    event.ctrlKey ||
                    event.metaKey
                ) {
                    return true;
                }
                return false
            }

            // Get the combobox element
            const combobox = this.template.querySelector('[data-id="combobox"]');
            if (!combobox || isCommandKeys()) return;

            // Close on "Escape" and open combobox on any other keyDown
            if (event.key && event.key !== undefined) {
                if (event.key === 'Escape') { 
                    // Close combobox on "Escape"
                    this.handleSldsAriaCombobox(combobox, null, false);    
                } else {
                    // Open the combobox
                    if (!combobox.classList.contains('slds-is-open')) {
                        this.toggleCombobox(null, combobox);
                    }
                }
            } 

            const comboboxOptions = this.template.querySelectorAll('[data-id="comboboxOption"]');     
            if (!comboboxOptions) return;

            // Find the currently focused item
            const focused = Array.from(comboboxOptions).findIndex(option => option.classList.contains('slds-has-focus'));

            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { 
                event.preventDefault(); 
                // Remove focus from the current item, if any
                if (focused !== -1) {
                    this.handleSldsAriaCombobox(null, comboboxOptions[focused], false);
                }

                // Calculate the next item index
                let nextIndex = 0; 
                if (event.key === 'ArrowDown') {
                    nextIndex = focused + 1 < comboboxOptions.length ? focused + 1 : 0; 
                } else {
                    nextIndex = focused - 1 > -1 ? focused - 1 : comboboxOptions.length - 1;
                }

                // Add focus to the next item
                this.handleSldsAriaCombobox(null, comboboxOptions[nextIndex], true);

                comboboxOptions[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            

            } else if (event.key === 'Enter') {

                // Mark and option as slds-is-selected
                this.handleSldsAriaCombobox(null, comboboxOptions, false);  // Set all options to slds-is-selected and aria-checked  to false
                this.handleSldsAriaCombobox(null, comboboxOptions, true);  // Set the option with slds-has-focus to slds-is-selected/aria-checked
                this.handleSldsAriaCombobox(combobox, null, false);       // Close the combobox
            }
        }catch(error) {
            getToastErrorMessage('handleComboboxKeyDown', 'SldsComboboxRecordTypes', error);
        }
        

    }



    // Detect if selected value is a converted value
    isConvertedSelected(newVal) {
        return this.convertedValsArr.length > 0 && this.convertedValsArr.includes(newVal);
    }

    handleConversionSelect() {
        this.currentValue = this.originalValue;
        // Handle save error
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Conversion options disabled',
                message: `Go to the ${this.objectApiName}'s record page to convert.`,
                variant: 'info'
            })
        );
    }


}