export const SETTINGS_OPTIONS = [
    {label: 'Set as Default List View', value: 'Set as Default List View'},
    {label: 'New List View', value: 'New List View', restricted: false},
    {label: 'Rename List View', value: 'Rename List View', restricted: true},
    //{
    //    label: 'Default Sort Order', 
    //    value: 'Default Sort Order', 
    //    tooltip: 'Change default sort when page loads.'
    //},
    {label: 'Select Fields to Display', value: 'Select Fields to Display', restricted: true},
    {label: 'Delete List View', value: 'Delete List View', restricted: true},
    //{
    //    label: 'Set Table State (all)', 
    //    value: 'Set Table State (all)', 
    //    tooltip: 'Saves current column widths, sorting, fields displayed in their current state.'
    //}
];

export const VALID_DTYPES = [
    'number',
    'currency',
    'decimal',
    'percent',
    'date',
    'textarea',
    'datetime',
    'boolean',
    'reference',
    'richtext',
    'name',
    'picklist',
    'multipicklist',
];


// Col action bools
export const CELL_TEXT_STYLES = {
    clipText: 'slds-truncate',
    wrapText: 'slds-has-flexi-truncate', 
    clampText: 'slds-line-clamp'
};
export const TO_LOCAL_DTYPE = (colInfos) => {
    if (!colInfos) return 'text'

    const extraTypeInfo = colInfos?.extraTypeInfo ?? null;
    const dtype = extraTypeInfo && extraTypeInfo === 'RichTextArea' 
        ? 'richtext'
        : colInfos?.dataType;


    if (!dtype || typeof dtype !== 'string') return 'text';
    const dtypeLower = dtype.toLowerCase();
    
    switch(true) {
        case dtypeLower === 'string': 
            return 'text';
        case dtypeLower === 'double': 
            const scale = colInfos.scale;
            return scale === 0 ? 'number' : 'decimal';
        default: 
            return dtypeLower;
    } 
}


// All possible Table Attrbiute 
// --> Row Actions, Striped Table, Col Actions, Resizable Cols, Checkboxes, Bordered Table, Header Color, Background Color
export const TABLE_ATTRIBUTE_DEFAULTS = {
    rowActions: true,
    colActions: true,
    stripedTable: false,
    resizableCols: true, 
    borderedTable: true, 
    colBorders: false,
    headerBg: 'var(slds-g-color-neutral-base-95, rgb(243, 243, 243))', 
    rowsBg: 'var(slds-g-color-neutral-base-100, #fff)'
}