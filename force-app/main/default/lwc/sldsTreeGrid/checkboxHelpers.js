// Return all checkboxes by tree-level
export function getCheckboxesByLevel(level, cmp) {
    switch(level) {
        case '1':
        case 'parent':
            return cmp.template.querySelectorAll('c-tree-checkbox[data-level="parent"][data-is-select-all="false"]');
        case '2':
        case 'child': 
            return cmp.template.querySelectorAll('c-tree-checkbox[data-level="child"][data-is-select-all="false"]');
        case '3':
        case 'grandchild':
            return cmp.template.querySelectorAll('c-tree-checkbox[data-level="grandchild"][data-is-select-all="false"]');
        case 'all':
            return cmp.template.querySelectorAll('c-tree-checkbox[data-is-select-all="false"]');
        default:
            return;
    }
}

// Return checkboxes that are children of a parent
export function getCheckboxesByParentId(parentId, cmp) {
    return cmp.template.querySelectorAll(`c-tree-checkbox[data-parent-id="${parentId}"][data-is-select-all="false"]`);
}

// Clear all checkboxes in the table 
export function clearAllCheckboxes(cmp) {
    const allTreeCheckboxes = getCheckboxesByLevel('all', cmp);
    allTreeCheckboxes.forEach(check => {
        check?.uncheckMe();
    });
    const selectAlls = cmp.template.querySelectorAll('c-tree-checkbox[data-is-select-all="true"]');
    selectAlls.forEach(all => all?.uncheckMe());

    const parentSelectAll = cmp.template.querySelector('input[data-is-select-all="true"]');
    parentSelectAll.checked = false;
}
// Clear all checkboxes in the table 
export function checkAllCheckboxes(cmp) {
    const allTreeCheckboxes = getCheckboxesByLevel('all', cmp);
    allTreeCheckboxes.forEach(check => {
        check?.checkMe();
    });
    const selectAlls = cmp.template.querySelectorAll('c-tree-checkbox[data-is-select-all="true"]');
    selectAlls.forEach(all => all?.checkMe());

    const parentSelectAll = cmp.template.querySelector('input[data-is-select-all="true"]');
    parentSelectAll.checked = true;
}

// Clear all checkboxes in the table 
export function clearCheckboxesByLevel(level, cmp) {
    switch(level) {
        case 'all':
            clearAllCheckboxes(cmp);
        case '1':
        case 'parent':
            const levelOnes = getCheckboxesByLevel(level, cmp);
            const level1SelectAll = cmp.template.querySelector('input[data-is-select-all="true"]');
            if (level1SelectAll) {
                level1SelectAll.checked = false;
            }
            levelOnes.forEach(tree => tree?.uncheckMe());
        case '2':
        case 'child':
            const levelTwos = getCheckboxesByLevel(level, cmp);
            const level2SelectAll = cmp.template.querySelectorAll('c-tree-checkbox[data-level="child"][data-is-select-all="true"]');
            levelTwos.forEach(two => two?.uncheckMe());
            level2SelectAll.forEach(two => two.uncheckMe());
            return;
        case '3':
        case 'grandchild':
            const levelThrees = getCheckboxesByLevel(level, cmp);
            const level3SelectAll = cmp.template.querySelectorAll('c-tree-checkbox[data-level="grandchild"][data-is-select-all="true"]');
            levelThrees.forEach(two => two?.uncheckMe());
            level3SelectAll.forEach(two => two.uncheckMe());
            return;
        default:
            cmp.showToast("You did send a valid level ('all', '1', '2', '3') to clearCheckboxesByLevel() in sldsTreeGrid", '', 'warning');
            return;

    }
}
// Clear all checkboxes in the table 
export function checkCheckboxesByLevel(level, cmp) {
    switch(level) {
        case 'all':
            checkAllCheckboxes(cmp);
            return;
        case '1':
        case 'parent':
            const levelOnes = getCheckboxesByLevel(level, cmp);
            const level1SelectAll = cmp.template.querySelector('[data-is-select-all="true"][data-level="parent"]');
            if (level1SelectAll) {
                level1SelectAll.checked = true;
            }
            levelOnes.forEach(tree => tree?.checkMe());
            return;
        case '2':
        case 'child':
            const levelTwos = getCheckboxesByLevel(level, cmp);
            const level2SelectAll = cmp.template.querySelectorAll('c-tree-checkbox[data-level="child"][data-is-select-all="true"]');
            levelTwos.forEach(two => two?.checkMe());
            level2SelectAll.forEach(two => two.checkMe());
            return;
        case '3':
        case 'grandchild':
            const levelThrees = getCheckboxesByLevel(level, cmp);
            const level3SelectAll = cmp.template.querySelectorAll('c-tree-checkbox[data-level="grandchild"][data-is-select-all="true"]');
            levelThrees.forEach(two => two?.checkMe());
            level3SelectAll.forEach(two => two.checkMe());
            return;
        default:
            cmp.showToast("You did send a valid level ('all', '1', '2', '3') to checkCheckboxesByLevel() in sldsTreeGrid", '', 'warning');
            return;

    }
}


function getLevel2CheckedIds(cmp) {
    const checked = cmp._checkedByLevel ?? {};

    // All parent IDs in your current dataset
    const parentIdSet = new Set((cmp.localRows ?? []).map(r => String(r.Id)));

    // Level 2 = values whose key is a parent ID
    return Object.entries(checked)
        .filter(([key]) => parentIdSet.has(String(key)))
        .flatMap(([, ids]) => ids ?? []);
}
function getLevel3CheckedIds(cmp) {
    const checked = cmp._checkedByLevel ?? {};

    // All child IDs in your current dataset
    const childIdSet = new Set(
        (cmp.localRows ?? []).flatMap(p => (p.children ?? []).map(c => String(c.Id)))
    );

    return Object.entries(checked)
        .filter(([key]) => childIdSet.has(String(key)))
        .flatMap(([, ids]) => ids ?? []);
}
function getLevel1CheckedIds(cmp) {
    return cmp._checkedByLevel?.parent ?? [];
}
// Get all checked record Ids from level one of the table 
export function getCheckedRowsByLevel(level, cmp) {
    switch(level) {
        case 'all':
            return {
                level1: getLevel1CheckedIds(cmp),
                level2: getLevel2CheckedIds(cmp),
                level3: getLevel3CheckedIds(cmp),
            };
        case '1':
        case 'parent':
            return getLevel1CheckedIds(cmp);
        case '2':
        case 'child':
            return getLevel2CheckedIds(cmp);
        case '3':
        case 'grandchild':
            return getLevel3CheckedIds(cmp);
        default:
            cmp.showToast("You did send a valid level ('all', '1', '2', '3') to getCheckedRowsByLevel() in sldsTreeGrid", '', 'warning');
    }
}


// Add all rows of specified level to the checkbox by level Object
export function buildCheckedRowsByLevel(level, cmp) {
    switch(level) {
        case 'all': 
            const checked = { parent: [] };
            this.localRows.forEach(p => {
                checked.parent.push(p.Id);
                checked[p.Id] = p.children.map(c => c.Id);

                p.children.forEach(c => {
                    checked[c.Id] = c.children.map(gc => gc.Id);
                });
            });
            return checked;

        case '1':
        case 'parent': 
            return {
                ...cmp._checkedByLevel,
                parent: cmp.localRows.map(r => r.Id)
            };
        case '2':
        case 'child': 
            const next2 = { ...this._checkedByLevel };
            (this.localRows ?? []).forEach(p => {
                next2[p.Id] = (p.children ?? []).map(c => c.Id).filter(Boolean);
            });
            return next2;

        case '3':
        case 'grandchild': 
            const next3 = { ...this._checkedByLevel };
            (this.localRows ?? []).forEach(p => {
                (p.children ?? []).forEach(c => {
                    next3[c.Id] = (c.children ?? []).map(gc => gc.Id).filter(Boolean);
                });
            });

        default:
            cmp.showToast("You did send a valid level ('all', '1', '2', '3') to buildCheckedRowsByLevel() in sldsTreeGrid", '', 'warning');
            return cmp._checkedByLevel;

    }
}