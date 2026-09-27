import { LightningElement, api, wire } from 'lwc';
import { getObjectInfo, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import  {getErrorMessage} from 'c/utils';

export default class WiredPicklistValuesLwc extends LightningElement {
    isReady = false;
    optionsByField = {};
   

    // ✅ make it reactive and reset state on change
    _localObjName;
    @api
    set objectApiName(v) {
        if (v !== this._localObjName) {
            this._localObjName = v;
            this.isReady = false;           // reset gate
            this.optionsByField = {};       // clear cache
        }
    }
    get objectApiName() { return this._localObjName || null; }

    // --- wires ---
    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    objectInfo;

    get recordTypeId() {
        return this.objectInfo?.data?.defaultRecordTypeId;
    }

    @wire(getPicklistValuesByRecordType, {
        objectApiName: '$objectApiName',
        recordTypeId: '$recordTypeId'
    })
    wiredPicklists({ data, error }) {
        if (data) {
            const map = {};
            const fields = data.picklistFieldValues || {};
            for (const field of Object.keys(fields)) {
                const f = fields[field];
                map[field] = (f?.values || []).map(v => ({ label: v.label, value: v.value }));
            }
            this.optionsByField = map;
            this.isReady = true;
            this.error = undefined;
        } else if (error) {
            this.showToast('Error in wiredPicklists()  of  wiredPicklistValuesLwc.js', getErrorMessage(error), 'error');
            this.isReady = false;
            
        }
    }

    // --- tiny waiter ---
    async waitForWiredData() {
        const deadline = Date.now() + 7000;
        while (!this.isReady && Date.now() < deadline) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise(r => setTimeout(r, 100));
        }
        if (!this.isReady) {
            return;
        }
    }

    // --- public API ---
    @api async getPicklistValues(arg) {
        try {
            const next = (typeof arg === 'object' && arg?.objectApiName) ? arg.objectApiName : arg;
            if (next && next !== this.objectApiName) {
                this.objectApiName = next; // triggers wires
            }
            await this.waitForWiredData();
            return this.optionsByField;
            
        } catch(error) {
            this.showToast('Error in getPicklistValues() of wiredPicklistValuesLwc.js: ', getErrorMessage(error), 'error');
        }
    }

    toastObj;
    showToast(title, message, variant, mode=null) {
        const modeP = mode 
            ? mode 
                : variant === 'success'
            ? 'dismissible'
            : 'sticky';
        
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