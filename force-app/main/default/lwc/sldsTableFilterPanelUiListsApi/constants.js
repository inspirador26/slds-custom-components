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
    picklist: TEXT_TYPES_OPTIONS,
    multipicklist: TEXT_TYPES_OPTIONS,
};


export const DATE_LITERAL_OPTIONS = [
    {
        label: 'Day Literals', options: [
            {label: 'TODAY', value: 'TODAY'},
            {label: 'YESTERDAY', value: 'YESTERDAY'},
            {label: 'TOMORROW', value: 'TOMORROW'},
        ]
    },
    {
        label: 'Week Literals', options: [
            {label: 'THIS WEEK', value: 'THIS WEEK'},
            {label: 'LAST WEEK', value: 'LAST WEEK'},
            {label: 'NEXT WEEK', value: 'NEXT WEEK'},
        ]
    },
    {
        label: 'Month Literals', options: [
            {label: 'THIS MONTH', value: 'THIS MONTH'},
            {label: 'LAST MONTH', value: 'LAST MONTH'},
            {label: 'NEXT MONTH', value: 'NEXT MONTH'},
        ]
    },
    {
        label: 'Quarter Literals', options: [
            {label: 'THIS QUARTER', value: 'THIS QUARTER'},
            {label: 'LAST QUARTER', value: 'LAST QUARTER'},
            {label: 'NEXT QUARTER', value: 'NEXT QUARTER'},
        ]
    },
    {
        label: 'Year Literals', options: [
            {label: 'THIS YEAR', value: 'THIS YEAR'},
            {label: 'LAST YEAR', value: 'LAST YEAR'},
            {label: 'NEXT YEAR', value: 'NEXT YEAR'},
        ]
    },
];



export const NUBBIN_RIGHT_TOP = 'slds-nubbin_right-top';
export const NUBBIN_RIGHT_BOTTOM = 'slds-nubbin_right-bottom';
export const NUBBIN_OFFSET = 28; // your measured constant (center of nubbin from edge)
export const SIDE_GAP = 30;     // space between anchor and popover (horizontal)
export const TOP_CEILING = 130; // absolute viewport ceiling


export const CURRENT_FILTER_SKELETON = {
    field: {label: '', value: null},
    operator: {label: '', value: null},
    filterBy: {
        value: '',
        label: '',
        options: []
    },
    dtype: 'text',
    ismultipicklist: false,
    isboolean: false,
    isdate: false,
    isSaved: false,
    isNew: true,
    keyId: null
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