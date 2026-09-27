import { LightningElement, api, wire } from 'lwc';
import getTableRecords from '@salesforce/apex/DataTableController.getTableRecords';
import { refreshApex } from '@salesforce/apex';
import { buildWhereClause, getErrorMessage } from 'c/utils';


/* Example Usage

    Controlled Version:
        HTML: 
            <c-wired-records-lwc
                conditions={conditions}
            ></c-wired-records-lwc>

        JAVASCRIPT:
            const wiredRecordsComponent = this.template.querySelector('c-wired-records-lwc');

            if (wiredRecordsComponent) {
                // Build the Main Object query (pass to <c-wired-records-lwc>)
                const mainFieldsQuery = this._columns.map(col => {
                    if (col.isReference) {
                        if (col.relationshipName && col.nameReference) {
                            // Add <objectApiName> + "." + <reference.nameField> to get Name field of all reference columns
                            return `${col.relationshipName}.${col.nameReference}`;
                        }
                        // Skip incomplete reference
                        return null; 
                    }
                    return col?.field?.fieldApiName || null;
                }).filter(Boolean);

                this._rows = await wiredRecordsComponent.fetchRecords(
                    mainObjectName,
                    mainFieldsQuery,
                    this.conditions
                );
            }

    Public Properties Version:
        HTML:
            ** NOTE: must have --->  is-event-variant="true" **
            <c-wired-records-lwc
                object-api-name={objectApiName}
                field-api-names={fieldApiNames}
                conditions={conditions}
                is-event-variant="true"
                onwiredrecords={handleWiredRecords}
            ></c-wired-records-lwc>

        objectApiName = 'NSN_Finished_Part__c';
        fieldApiNames = [
            NAME_FIELD.fieldApiName,
            NOMENCLATURE_FIELD.fieldApiName, 
            'Lead__c', 
            'Lead__r.Name', 
        ];
        conditions = [
            {fieldName: LEAD_STATUS_FIELD.fieldApiName, notValues: ['Qualified'], nullable: false}
        ]
*/


export default class WiredRecordsLwc extends LightningElement {
    isWiredDataLoaded = false;
    recordsArr;

    @api isEventVariant = false;
    suppressEvent = false;  // Controls whether to send a custom event or not

    @api objectApiName = null;
    @api fieldApiNames = null; // field names 

    @api searchTerm = null;
    @api sortBy = null;

    get wiredSearchTerm() {
        return this.searchTerm ?? null;
    }
    get wiredSortBy() {
        return this.sortBy ?? null;
    }

    _conditions = undefined;
    @api
    set conditions(value) {
        try {
            if (!value) { this._conditions = null; return; }
            // If caller passed an object, build. If they passed a prebuilt string, keep it.
            this._conditions = typeof value === 'string' 
                ? value 
                : buildWhereClause(value);
        } catch(error) {
            this.showToast('Error in set conditions() of wiredRecordsLwc.js: ', getErrorMessage(error), 'error');
        }
    }
    get conditions() { return this._conditions || undefined; }

    get wiredObjectName() {
        return this.objectApiName || undefined;
    }
    get wiredFieldApiNames() {
        return (Array.isArray(this.fieldApiNames) && this.fieldApiNames.length)
            ? this.fieldApiNames
            : undefined;
    }
    get wiredConditions() {
        // allow undefined so the wire won’t fire early
        return this._conditions ?? undefined;;
    }




    _wiredRecordsResult;
    @wire(getTableRecords, {
        objectName: '$wiredObjectName',
        fieldApiNames: '$wiredFieldApiNames',
        conditions: '$wiredConditions',
        searchTerm: '$wiredSearchTerm',
        sortByJson: '$wiredSortBy'
    }) wiredRecords(result) {
        this._wiredRecordsResult = result;
        const { data, error } = result;
        if (data) {
            this.recordsArr = data;
            this.isWiredDataLoaded = true;
            if (this.isEventVariant) {
                this.sendRecords(this.recordsArr);
            }
        } else if (error) {
            this.showToast('Error in wiredRecords() wiredRecordsLwc.js', getErrorMessage(error), 'error');
            this.isWiredDataLoaded = true;
        }
    }

    // Dispatch event with records
    sendRecords(records) {
        try {
            if (records && records.length > 0) {
                this.dispatchEvent(new CustomEvent('wiredrecords', { detail: { records } }));
                return;
            }
            // Dispatch an empty array if there are no records
            this.dispatchEvent(
                new CustomEvent('wiredrecords', { detail: { records: [] } })
            );

        } catch(error) {
            this.showToast('Error in sendRecords() of wiredRecordsLwc.js: ', getErrorMessage(error), 'error');
        }
    }


    // Make sure Object APIA Name is loaded before running any code
    async waitForWiredData() {
        const maxWaitTime = 7000; // Maximum wait time of 10 seconds
        const pollInterval = 100; // Poll every 100 milliseconds
        let elapsedTime = 0;
    
        while (!this.isWiredDataLoaded) {
            if (elapsedTime >= maxWaitTime) {
                throw new Error('Timed out waiting for refreshed wire data in wiredRecordsLwc.js.');
            }
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
            elapsedTime += pollInterval;
        }
    }

    
    // Query Records (Public Method)
    @api async fetchRecords(
        objectApiName = null,
        fieldApiNames = null,
        conditions = null,
        isMasterDetail,
        searchTerm = null,
        sortBy = null
    ) {
        try {
            this.isWiredDataLoaded = false;

            this._isMasterDetail = !!isMasterDetail;

            if (conditions !== undefined) this.conditions = conditions;
            if (objectApiName) this.objectApiName = objectApiName;
            if (fieldApiNames) {
                this.fieldApiNames = Array.isArray(fieldApiNames) ? [...fieldApiNames] : fieldApiNames;
            }

            this.searchTerm = searchTerm;
            this.sortBy = sortBy ? JSON.stringify(sortBy) : null;

            if (!this.objectApiName || !this.fieldApiNames) {
                const missing = ['objectApiName', 'fieldApiNames'].filter(param => !this[param]);
                this.showToast(`Missing Required Parameters: ${missing.join(', ')}`, 'fetchRecords() of WiredRecordsLwc.js', 'error');
                return;
            }

            await this.waitForWiredData();
            return this.recordsArr;
        } catch (error) {
            this.showToast('Error in fetchRecords() of wiredRecordsLwc.js: ', getErrorMessage(error), 'error');
        }
    }

    paramsReady() {
       return !!(this.wiredObjectName && this.wiredFieldApiNames);
    }


    // Refresh Apex (Public Method)
    // expose a refresh that actually returns fresh data
    @api async refreshMe() {
        try {
            if (!this._wiredRecordsResult) {
                console.warn('_wiredRecordsResult is undefined; returning current rows.');
                this.showToast('_wiredRecordsResult is undefined in refreshMe() of wiredRecordsLwc.js', 'returning current rows.', 'warning');
                return this.recordsArr ?? [];
            }

            // Make sure the wire is eligible (object + fields must be present)
            if (!(this.wiredObjectName && this.wiredFieldApiNames)) {
                //this.showToast('wiredObjectName and wiredFieldApiNames are null in refreshMe() of wiredRecordsLwc.js', 'returning current rows', 'warning');
                return this.recordsArr ?? [];
            }

            // Optional nudge: new array ref avoids any stale identity edge cases
            if (Array.isArray(this.fieldApiNames)) {
                this.fieldApiNames = [...this.fieldApiNames];
            }

        } catch(error) {
            this.showToast('Error in refreshMe() of wiredRecordsLwc.js: ', getErrorMessage(error), 'error');
        }

        // IMPORTANT: don’t poll; trust refreshApex’s promise
        try {
            await refreshApex(this._wiredRecordsResult);
            // Whatever the latest is after refresh
            return this._wiredRecordsResult?.data ?? this.recordsArr ?? [];
        } catch(error) {
            this.showToast('Error in refreshMe() of wiredRecordsLwc.js: ', getErrorMessage(error), 'error');
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