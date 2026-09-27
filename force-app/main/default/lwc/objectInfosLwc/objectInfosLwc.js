import { LightningElement, api, wire, track } from 'lwc';
import { getObjectInfos } from 'lightning/uiObjectInfoApi';
import { getErrorMessage, toPlain } from 'c/utils';
import getTaskDescribe from '@salesforce/apex/UiApiFallbackCtrl.getTaskDescribe';


// Given an Apex DescribeFieldResult (serialized), normalize to UI-like
function mapFieldType(dtype) {
    try {
        if (!dtype) return;

        switch (dtype.toLowerCase()) {
            case 'double':
                return 'Double';
            
            case 'string': 
                return 'String';

            case 'combobox': 
                return 'Picklist';
            
            case 'picklist': 
                return 'Picklist';

            case 'boolean':
                return 'Boolean';

            case 'integer': 
                return 'Number';

            case 'datetime':
                return 'DateTime';

            case 'textarea':
                return 'TextArea';

            case 'reference': 
                return 'Reference';
            
            default: 
                return dtype;
        }
    } catch(error) {
        console.error('Error in mapFieldType() of objectInfosLwc.js: ', getErrorMessage(error), 'error');
    }
}

export default class ObjectInfosLwc extends LightningElement {
    objectApiNames;              // array<string> for wire
    infoByObject = new Map();    // Map<string,ObjectInfo>
    @track toastObj;

    @wire(getObjectInfos, { objectApiNames: '$objectApiNames' })
    wiredObjectInfos({ data, error }) {
        if (error) {
            // eslint-disable-next-line no-console
            this.showToast('Error in wiredObjectInfos() of objectInfosLwc.js', getErrorMessage(error), 'error');
            this.infoByObject = new Map();
            return;
        }
        if (!data) return;

        try {
            const plain = toPlain(data);
            this.infoByObject = new Map(
                (plain.results || [])
                    .filter(r => !r.error && r.result)
                    .map(r => [r.result.apiName, r.result])
            );
        } catch(error) {
            this.showToast('Error in wiredObjectInfos() of objectInfosLwc.js: ', getErrorMessage(error), 'error');
        }
    }

    async waitForWiredData() {
        const maxWaitMs = 30000;
        const step = 100;
        let elapsed = 0;
        while (this.infoByObject.size === 0) {
            if (elapsed >= maxWaitMs) this.showToast('Timed out waiting for object metadata  in objectInfosLwc.', '', 'error');
            await new Promise(r => setTimeout(r, step));
            elapsed += step;
        }
    }

    /**
     * @param {string[]|{objectApiName:string}[]} objNames
     * @returns {Promise<Map<string,ObjectInfo>>}
     */
    @api async queryObjects(objNames) {
        try {
            // Accept ['Lead','Task'] or [{objectApiName:'Lead'}, ...]
            const objNamesCln = (objNames || []).map(x => typeof x === 'string' ? x : x.objectApiName);
            
            const isTask = (objNamesCln.some(obj => obj === 'Task'));
            let taskInfos;
            
            this.objectApiNames = objNamesCln.filter(obj => obj !== 'Task');
            
            if (isTask) {
                taskInfos = toPlain(await getTaskDescribe());
                taskInfos = {
                    ...taskInfos,
                    fields: taskInfos.fields.map(f => {
                        return {...f, dataType: mapFieldType(f.dataType)};
                    })
                }
            } 

            // Wait for wired data to be ready
            await this.waitForWiredData();
            
            // Add Task to the map 
            if (taskInfos) this.infoByObject.set('Task', taskInfos);

            return this.infoByObject; // Map(apiName -> ObjectInfo)

        } catch (error) {
            this.showToast('Error in queryObjects() of objectInfosLwc.js', getErrorMessage(error), 'error');
            return new Map();
        }
    }

    showToast(title, message, variant, mode=null) {
        const toastMode = mode 
            ? mode
                : variant === 'success'
            ? 'dismissible'
            : 'sticky'; 
            
        this.toastObj = { 
            variant: variant, 
            mode: toastMode, 
            message: message,
            header: { 
                text: title
            }        
        };   
    }
}