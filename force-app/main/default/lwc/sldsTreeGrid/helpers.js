import {IS_SF_ID, getErrorMessage} from 'c/utils';

let __rid = 0;

// Add object api names using entity prefixes
export function addObjectApiNameToFieldsArr(rec, wiredEntityPrefixes) {
    const fieldsArr = Array.isArray(rec) ? rec : rec?.fields ?? [];

    return fieldsArr.map(f => {
        if (!f?.objectApiName && IS_NEED_REF(f, wiredEntityPrefixes)) {
            const objectApiName = getObjectApiNameByPrefix(f.value, wiredEntityPrefixes);
            return objectApiName 
                ? {...f, objectApiName} 
                : f;
        }
        return f;
    });
}

// Check for name/reference dtype and a valid value to flag needs reference 
export const IS_NEED_REF = (fieldObj, prefixes) => {
    return (fieldObj?.dtype === 'name' || fieldObj?.dtype === 'reference') &&
        !fieldObj.url &&
        fieldObj?.value && IS_SF_ID(fieldObj?.value) && 
        getObjectApiNameByPrefix(fieldObj.value, prefixes);
}

// Assign "Id" to each row in the tree data
function ensureStableId(node) {
    if (!node) return node;
    if (node.Id) { node.Id = String(node.Id); return node; }
    if (!node._rid) node._rid = `tmp_${++__rid}`;
    node.Id = node._rid;
    return node;
}
// Ensure all tree items have an "Id" and "keyId"
export function normalizeTree(nodes = []) {
    return nodes.map(n => {
        n = ensureStableId({ ...n });

        const rid = String(n.Id);
        const hasKids = Array.isArray(n.children) && n.children.length > 0;

        // unique, stable keys for each sibling <tr> you render for this node
        n.kParent  = `row:${rid}`;             // the node's own "field row" <tr>
        n.kWrap2   = hasKids ? `wrap2:${rid}` : undefined; // level-2 wrapper under a top-level row
        n.kWrap3   = hasKids ? `wrap3:${rid}` : undefined; // level-3 wrapper under a child row

        if (hasKids) {
            n.children = normalizeTree(n.children);
        }
        return n;
    });
}
// Return object api name by first 3 characters of record Id
export function getObjectApiNameByPrefix(recordId, entityPrefixes) {
    try {
        if (!recordId || !entityPrefixes) return;
        const firstThree = recordId.slice(0, 3);
        return entityPrefixes?.[firstThree];
    } catch(error) {
        console.error('Error in getObjectApiNameByPrefix() of sldsTreeGrid.js', getErrorMessage(error), 'error');
    }
}


// Get record ids of reference dtype fields (and optionally validate as SF Ids)
export function handleRefFieldIds(rec) {
    const extract = (r) =>
        (r?.fields ?? [])
        .filter(f => f?.dtype === 'reference' && f?.value)
        .map(f => f.value)
        .filter(IS_SF_ID);

    if (!rec) return [];
    const ids = Array.isArray(rec) ? rec.flatMap(extract) : extract(rec);
    return [...new Set(ids)];
}


export function getAllEntityPrefixes(records) {
    try {
        if (!records?.length) return;

        const entityPrefixes = records.map(rec => {
            if (rec?.Id) {
                return rec?.Id.slice(0, 3);
            }
        }).filter(Boolean);

        if (entityPrefixes?.length) {
            return Array.from(new Set(entityPrefixes));
        }
    } catch(error) {
        console.error('Error in getAllEntityPrefixes() of sldsTreeGrid.js', getErrorMessage(error), 'error');
    }
}

// Build an Object with object api name and record ids in Array 
// ---> Stucture: { <objectName>: [<Id>, <Id>, ...], <objectName2>, [<Id>, <id>, ...]}
export function buildRecordIdByObjectMap(recordIds, entityPrefixes) {
    if (!Array.isArray(recordIds) || !entityPrefixes) return null;

    const byObj = {}; // objApiName -> Set(ids)

    // Store record ids in a Set for each object api name 
    for (const recordId of recordIds) {
        if (!recordId) continue;

        // Get the object api name
        const objApiName = getObjectApiNameByPrefix(recordId, entityPrefixes);
        if (!objApiName) continue;

        (byObj[objApiName] ??= new Set()).add(recordId);
    }

    const recordIdsByObjectApiName = {};
    for (const [objApiName, idSet] of Object.entries(byObj)) {
        // Store the unique record ids as array
        if (idSet.size) recordIdsByObjectApiName[objApiName] = [...idSet];
    }

    return Object.keys(recordIdsByObjectApiName).length ? recordIdsByObjectApiName : null;
}

export function parseRecordDeleteMessageObject(msgObject, prefix) {
    return `${prefix} 
        ${Object.entries(msgObject)?.map( ([objLabel, cnt]) => {
            return `${cnt} ${objLabel}s`
        }).join(', ')} 
    records`;
}

const ICON_PROPERTIES = [
    {propKey: 'icon', prop: 'icon-name', value: (val) => val, required: true},
    {propKey: 'iconTitle', prop: 'icon-title', value: (val) => val ?? '', required: false},
    {propKey: 'size', prop: 'icon-size', value: (val) => val ? val : val?.startsWith('action') ? 'x-small' : 'small', required: false},
    {propKey: 'cl', prop: 'icon-cl', value: (val) => val ?? '', required: false}
];

// Handle icons for expandable rows.  
// --->  stucture: icon-name:<icon-name>;icon-title:<icon-title>;icon-cl:<icon-cl>;icon-size:<icon-size>;
// --->  Ex: "icon-name:utility:check;icon-title:Complete;icon-cl:red-icon;" 
export function handleLevelIcons(publicPropertyStr) {
    if (!publicPropertyStr || !publicPropertyStr.includes(';')) return null;
    const parts = publicPropertyStr.split(';').filter(Boolean);
    const iconConfig = {};

    let notValid = false;
    ICON_PROPERTIES.forEach(obj => {
        const propMatcher = obj.prop;
        const matchedPart = parts.find(part => part?.startsWith(propMatcher));
        if (!matchedPart && obj.required) {
            notValid = true;
        }
        const iconProp = obj.propKey;
        if (!matchedPart) {
            iconConfig[iconProp] = obj.value(null);
        } else {
            const userVal = matchedPart?.trim()?.replace(`${propMatcher}:`, '');
            const iconVal = obj.value(userVal);
            iconConfig[iconProp] = iconVal;
        }
    });

    if (notValid) {
        return { icon: null, iconTitle: null, size: null, cl: null};
    }
    return iconConfig;
}   
// Loops tree rows and get all child Ids 
export function getAllChildIds(localRows) {
    return localRows
        ?.flatMap(rec => rec?.children ?? [])
        ?.map(child => child?.Id)
        ?.filter(Boolean) ?? [];
}
// Loops tree rows and get all grandchild Ids 
export function getAllGrandChilIds(localRows) {
    return localRows
        ?.filter(rec => rec?.children?.length)
        ?.flatMap(rec => rec.children)
        ?.filter(child => child?.children?.length)
        ?.flatMap(child => child.children)
        ?.map(gChild => gChild?.Id)
        ?.filter(Boolean) ?? [];
}


// Show empty data messages when user expands the trees if "Show Empty Children" is true 
export function handleShowEmptyChildren(starterRows, levelTwoColumns, levelThreeColumns) {

    if (levelTwoColumns?.length && !levelThreeColumns?.length) {
        // Hanlde no level 3 columns
        return starterRows.map(r => {
            return r?.children?.length 
                ? r 
                : {...r, children: []};
        });

    } 

    if (levelTwoColumns?.length && levelThreeColumns?.length) {
        // Hanlde valid columns at level 2/3 
        return starterRows.map(r => {
            return !r?.children?.length
                ? {...r, children: []}
                : {...r, children: r.children.map(c => {
                    return c?.children?.length  ? c : {...c, children: []}
                })}
                
        })
    }
    
    // Do nothing
    return starterRows;
}