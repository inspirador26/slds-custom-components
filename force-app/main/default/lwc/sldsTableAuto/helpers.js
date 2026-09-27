export function objectHasRecordTypes(objectInfo) {
    const infos = objectInfo?.recordTypeInfos;
    if (!infos) return false;

    const rts = Object.values(infos);

    // "Has record types" in the meaningful sense:
    // at least one available RT that is NOT Master
    return rts.some(rt => rt?.available && rt?.name !== 'Master');
}



export function handleGetTableRecordsRes(cmp, rowsObj) {
    cmp._rows = rowsObj.rows;
    cmp._isLastPage = !rowsObj?.hasNextPage;
    cmp._rowsCount = rowsObj.totalCount ?? 0;
    cmp._totalPages = Math.ceil(cmp._rowsCount / cmp._pageSize);
}