// Move this logic to a new file 

/* main.js

    filterLogicString;
    filteredByInfo;
    visibility;
    scope;
    displayColumns;

    // Popup that appears when a field is selected
    selectedFilter;
    selectedOperator;
    selectedValue;

    // Operators for the filter
    operatorOptions;    


    filterFields = [];

    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    _objectInfos;

    // Fetch Picklist Values by Record Type
    _wiredPicklistVals
    @wire(getPicklistValuesByRecordType, { objectApiName: "$objectApiName", recordTypeId: "$_objectInfos.data.defaultRecordTypeId" })
    wiredPicklistValues({ error, data }) {
        if (data) {
            const picklistVals = {};
            console.log('here is object infos in NewListViewLwc: ', this._objectInfos);
            for (const key of Object.keys(data.picklistFieldValues)) {
                // Map all picklists by fieldApiName 
                // ... --->  const statusOptions = this._wiredPicklistVals[STATUS_FIELD.fieldApiName])
                const picklistInfo = data.picklistFieldValues[key];
                picklistVals[key] = picklistInfo.values.map(val => {
                    return {value: val.value, label: val.label, attributes: val.attributes};
                })
            }
            this._wiredPicklistVals = picklistVals;
        } else if (error) {
            console.error('Error fetching picklist values:', error);
        }
    }




    // handle filter by field selection
    handleFilterField(message, isFirst=false) {
        if (message.detail) {
            this.selectedFilter = message.detail;
            const val = message.detail;
            const opt = this.filterFieldOptions.find(opt => opt.value === val);
            this.operatorOptions = OPERATORS_BY_DTYPE[opt?.dtype];
            if (isFirst) {
                console.log('here is the first opiton of operatorOptions in handleFilterField() of newListViewLwc: ', this.operatorOptions[0].value);
                this.selectedOperator = this.operatorOptions[0].value;
            }
        }
    }
    handleSelectedOperator(message) {
        this.selectedOperator = message.detail;
    }




    // Trigger the filter section to display
    _showFilter = false;
    @api showFilters() {
        const firstOpt = this.filterFieldOptions[0];
        const msg = {detail: firstOpt.value};
        this.handleFilterField(msg, true);
        this._showFilter = true;
    }   

    // Get field available to display in the list view
    get displayColumnOptions() {
        if (this._objectInfos) {
            const fields = this._objectInfos?.data?.fields;
            if (!fields) return;

            return Object.values(fields)?.map(meta => {
                return {
                    label: meta?.label,
                    value: meta?.apiName,
                    dtype: meta?.dataType
                }
            })
        }
    }

    // Get field available to Filter By
    get filterFieldOptions() {
        if (this._objectInfos) {
            const fields = this._objectInfos?.data?.fields;
            if (!fields) return;

            return Object.values(fields)
                ?.filter(meta => meta?.filterable && meta.sortable)
                ?.map(meta => {
                    return {
                        label: meta?.label,
                        value: meta?.apiName,
                        dtype: meta?.dataType?.toLowerCase()
                    }
                })
        }
    }

*/


/* main.html 

    <template lwc:if={_showFilter}> 
        <ul>
            <template for:each={filterFields} for:item="field"> 
                <li key={field.fieldApiName}>
                    <div class="slds-grid slds-grid_pull-padded-medium">
                        <div class="slds-col slds-p-horizontal_medium"> 
                            <button class="slds-button slds-button_icon slds-button_icon-border circle-button" title="New">
                                <svg class="slds-button__icon" aria-hidden="true">
                                    <use xlink:href={iconMap.utility.new}></use>
                                </svg>
                                <span class="slds-assistive-text">More options</span>
                            </button>
                        </div>
                    </div>
                </li>
            </template>
        </ul>
        <div class="slds-p-vertical_small"> 
            <c-slds-combobox
                label="Field"
                options={filterFieldOptions}
                data-element="filters"
                is-required="true"
                current-value={selectedFilter}
                onselected={handleFilterField}
            ></c-slds-combobox>
        </div>
    
        <div class="slds-p-vertical_small"> 
            <c-slds-combobox
                label="Operator"
                options={operatorOptions}
                current-value={selectedOperator}
                onselected={handleSelectedOperator}
                data-element="filters"
                is-required="true"
            ></c-slds-combobox>
        </div>
        
        <div class="slds-p-vertical_small"> 
            <c-slds-input
                label="Value"
                dtype="text"
                is-required="true"
            ></c-slds-input>
        </div>

    </template>

    <template lwc:if={displayColumnOptions}>
        <div class="slds-p-vertical_medium">
            <c-slds-combobox-multi
                options={displayColumnOptions}
                label="Fields to Display"
                place-holder="Select one or more..."
                data-element="filter-form"
                is-required="true"
                dropdown-length="7"
            ></c-slds-combobox-multi>
        </div>
    </template>


*/


/* constants.js 


    export const OWNER_ID_FIELD = 'OwnerId';
    
    
    export const OPERATORS = [
        {label: 'contains', value: 'Contains'},
        {label: 'equals', value: 'Equals'},
        {label: 'excludes', value: 'Excludes'},
        {label: 'greater than or equal to', value: 'GreaterOrEqual'},
        {label: 'greater than', value: 'GreaterThan'},
        {label: 'includes', value: 'Includes'},
        {label: 'less than or equal to', value: 'LessOrEqual'},
        {label: 'less than', value: 'LessThan'},
        {label: 'does not contain', value: 'NotContain'},
        {label: 'not equal to', value: 'NotEqual'},
        {label: 'starts with', value: 'StartsWith'},
        {label: 'within', value: 'Within'},
    ];
    
    const TEXT_TYPES_OPTIONS = [
        {label: 'equals', value: 'Equals'}, 
        {label: 'not equal to', value: 'NotEqual'}, 
        {label: 'less than', value: 'LessThan'}, 
        {label: 'greater than', value: 'GreaterThan'}, 
        {label: 'less than or equal to', value: 'LessOrEqual'},
        {label: 'greater than or equal to', value: 'GreaterOrEqual'}, 
        {label: 'contains', value: 'Contains'},
        {label: 'does not contain', value: 'NotContain'},
        {label: 'starts with', value: 'StartsWith'},
    ];
    const BOOLEAN_OPTIONS = [
        {label: 'equals', value: 'Equals'}, 
        {label: 'not equal to', value: 'NotEqual'},
    ];
    const NUMBER_OPTIONS = [
        {label: 'equals', value: 'Equals'}, 
        {label: 'not equal to', value: 'NotEqual'}, 
        {label: 'less than', value: 'LessThan'}, 
        {label: 'greater than', value: 'GreaterThan'}, 
        {label: 'less than or equal to', value: 'LessOrEqual'}, 
        {label: 'greater than or equal to', value: 'GreaterOrEqual'}, 
    ];
    
    export const OPERATORS_BY_DTYPE = {
        reference: TEXT_TYPES_OPTIONS,
        date: NUMBER_OPTIONS,
        datetime: NUMBER_OPTIONS,
        boolean: BOOLEAN_OPTIONS,
        phone: TEXT_TYPES_OPTIONS,
        email: TEXT_TYPES_OPTIONS,
        number: NUMBER_OPTIONS,
        double: NUMBER_OPTIONS, 
        currency: NUMBER_OPTIONS,
        string: TEXT_TYPES_OPTIONS,
    };



    // Options for filter-type 
    export const EXPRESSION_TYPE_OPTIONS  = [
        {label: 'All Conditions Are Met', value: 'allConditions'},
        {label: 'Any Condition Is Met', value: 'anyCondition'},
        {label: 'Custom Logic Is Met', value: 'customLogic'}
    ];  
    // Operator Options (greater than, equals, less than, greater than or equal to)
    export const OPERATOR_OPTIONS  = [
        {label: 'equals', value: 'eq'},
        {label: 'not eqaul to', value: 'notEq'},
        {label: 'greater than', value: 'gt'},
        {label: 'less than', value: 'lt'},
        {label: 'greater or equal', value: 'gtOrEq'},
        {label: 'less or equal', value: 'ltOrEq'},
        {label: 'contains', value: 'contains'},
        {label: 'does not contain', value: 'notContains'},
        {label: 'starts with', value: 'startsWith'}
    ];
    // Operator and Condition Logic options
    export const FILTER_BUILDER_OPTIONS = {
        operatorOptions: [
            {label: 'eqauls', value: 'eq'},
            {label: 'not eqaul to', value: 'notEq'},
            {label: 'greater than', value: 'gt'},
            {label: 'less than', value: 'lt'},
            {label: 'greater or equal', value: 'gtOrEq'},
            {label: 'less or equal', value: 'ltOrEq'},
            {label: 'contains', value: 'contains'},
            {label: 'does not contain', value: 'notContains'},
            {label: 'starts with', value: 'startsWith'}
        ],
        expressionTypeOptions: [
            {label: 'All Conditions Are Met', value: 'allConditions'},
            {label: 'Any Condition Is Met', value: 'anyCondition'},
            {label: 'Custom Logic Is Met', value: 'customLogic'}
        ],

    }

*/