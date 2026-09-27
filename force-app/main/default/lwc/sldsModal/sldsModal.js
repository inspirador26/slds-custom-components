import { LightningElement, api, track } from 'lwc';
import { iconMap as ICON_MAP, getToastErrorMessage} from 'c/utils';


/*
    Example setup:
        
        Initialize the modal (JS):
            this.template.querySelector('x-slds-modal').showMe()

        Add the component to the markup (HTML):
            <x-slds-modal
                modal-message="My modal message."
                cancel-button-label="Cancel"
                okay-button-label="Okay"
                onmodalclick={handleModalClick}
            ></x-slds-modal>

        Handle the modal message (JS):
            handleModalClick(message) {
                const detail = message.detail; 
                if (detail === 'cancel') { // do something }
                if (detail === 'okay') { // do something else }
            }
*/

export default class SldsModal extends LightningElement {
    @track iconMap = ICON_MAP;

    @track fieldForm = {}; // simplest
    @track requiredFields = [];   // Store the required fields
    @track displayModal = false;
    @track isRendered = false;
    
    
    @api columns;
    @api modalTitle;

    @api 
    set fields(value) {   
        // Get the required fields
        if (value) {
            if (value.some(f =>  f.isRequired)) {
                this.requiredFields = value.filter(field => field.isRequired)?.map(field => field.fieldName);
            }
            // Store the fields
            this._fields = value.map(field => {
                if (field.value) {
                    this.fieldForm[field.fieldName] = field.value;
                }
                return {...field, [ `is${field.dtype || 'text'}`]: true };
            });

            this.displayModal = true;
        }
       
    }
    get fields() {
        return this._fields;
    }

    @api 
    set modalMessage(value) {
        this._modalMessage = value;
        this.displayModal = true;
    }
    get modalMessage() {
        return this._modalMessage;
    }

    @api 
    set cancelButtonLabel(value) {
        this._cancelButtonLabel = value;
    }
    get cancelButtonLabel() {
        return this._cancelButtonLabel;
    }
    
    @api 
    set okayButtonLabel(value) {
        this._okayButtonLabel = value;
    }
    get okayButtonLabel() {
        return this._okayButtonLabel;
    }


    @api showMe() {
        this.displayModal = true;
    }
    @api hideMe() {
        this.displayModal = false;
    }


    // Get the amount of columns in each row  of the modal
    get colGridSizeClass() {
        return this.columns 
            ? `field-row slds-col slds-size_1-of-${this.columns} slds-p-around_medium`
            : 'field-row slds-col slds-size_1-of-1 slds-p-around_medium';
    }
    
    // ===================== Required Fields ===================== \\
    // Return True if field is required
    checkIfRequired(fieldName) {
        try {
            return new Set(this.requiredFields).has(fieldName);
        } catch(error) {
            getToastErrorMessage('checkIfRequired()', 'sldsModal.js', error);
        }
    }
    // Trigger Error to the child component if required field missing
    triggerError(fieldName, errMsg=null) {
        try {
            this.template.querySelector(`[data-id=${fieldName}]`).errorMe(errMsg);
        } catch(error) {
            getToastErrorMessage('triggerError()', 'sldsModal.js', error);
        }
        
    }
    unTriggerError(fieldName) {
        try {
            this.template.querySelector(`[data-id=${fieldName}]`).removeErrorMe();
        } catch(error) {
            getToastErrorMessage('unTriggerError()', 'sldsModal.js', error);
        }
    }
    // ============================================================ \\ 
   
    // Handle message sent from the child component --->  update the <fieldForm> object
    handleNewInput(event) {
        try {
            // Get the fieldName from the dataset-id
            const fieldName = event.currentTarget.dataset.id;

            // Get the message from the child
            const details = event.detail;

            // Flag required
            const isRequired = this.checkIfRequired(fieldName);

            // Get the value sent by the childs
            let val = details ? details[Object.keys(details)[0]] : null;

            // Flag if the user input was an error
            const isError = isRequired && !val ? true : false;

            // Update the fieldForm data to reflect the current value of the child
            this.fieldForm[fieldName] = val;

            if (isError) {
                this.triggerError(fieldName);
            }
        } catch(error) {
            getToastErrorMessage('handleNewInput()', 'sldsModal.js', error);
        }
    }

    handleCancel() {
        try {
            this.displayModal =  false;
            this.dispatchEvent(new CustomEvent('modalclick', {
                detail: 'cancel',
                bubbles: false,    
                composed: true     
            }));
        } catch(error) {
            getToastErrorMessage('handleCancel()', 'sldsModal.js', error);
        }
    }

    _isRenderedFocus = false;
    renderedCallback() {
        if (!this._isRenderedFocus) {
            const firstFocusItem = this.template.querySelector('[data-is-focusable="true"]') ?? this.template.querySelector('.slds-modal__close');
            if (firstFocusItem) {
                this._isRenderedFocus = true;
                firstFocusItem.focus();
            }
        }
    }


    // Verify that all the required fields have been filled
    handleOkay() {
        try {
            this.displayModal = false;
            let isSave = true;
            if (this._fields) {
                // ------------ Request the value from the child components ------------ \\
                for (const fieldObj of this._fields) {
                    if (fieldObj?.fieldName) {
                        const fieldVal = this.template.querySelector(`[data-id="${fieldObj.fieldName}"]`).sendValues();
                        if (fieldVal || fieldVal === false) {
                            this.fieldForm[fieldObj.fieldName] = fieldVal;
                        }
                    }
                }
                // ---------------------------------------------------------------------- \\ 
            }

            
            // Handle <_fields> length greater than 0 modal message
            if (this._fields && this._fields.length > 0) {
                // Ensure required fields are filled if fields
                if (this.requiredFields && this.requiredFields.length > 0) {
                    for (const required of this.requiredFields) {

                        if (!this.fieldForm[required]) {
                            this.template.querySelector(`[data-id="${required}"]`).errorMe();
                            isSave = false;
                        }
                    }
                }
                // Send a custom event with the fieldForm data
                if (isSave) {
                    this.dispatchEvent(
                        new CustomEvent('modalclick', {
                            detail: this.fieldForm,
                            bubbles: true
                        })
                    );
                }
                
            } else {
                // Handle simple modal (only body)
                this.dispatchEvent(
                    new CustomEvent('modalclick', {
                        detail: 'okay',
                        bubbles: true
                    })
                );
            }
        } catch(error) {
            getToastErrorMessage('handleOkay()', 'sldsModal.js', error);
            console.error('Error in handleOkay()() of sldsModal.js: ', error);
        } 
    }
    
}