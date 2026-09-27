import {
  getToastErrorMessage,
  getCleanMetaDataLabels,
  getErrorMessage,
  isValidProperty
} from "c/utils";

import { TO_LOCAL_DTYPE } from "./tableConstants";

const FILTER_OUT_NAME_AND_ID = (fieldsArr, nameField) =>
  (fieldsArr || []).filter(
    (f) => f.fieldApiName !== "Id" && f.fieldApiName !== nameField
  );

// Add Parent Lookup in query
const TO_RELATION_FIELD = (relationName, parentFieldApiName) =>
  `${relationName}.${parentFieldApiName}`;

/*
// Get the lookup id for record preview panel 
const GET_PANEL_LOOKUP_ID = (clickedField, mainObjRecordId, objectInfos, columns) => {
    return null;
}
// For Record Popover --> from "<relation_name>.<field_name>" to "<field_name>"
const TO_PARENT_REC = (rec, col) => {
    return isValidProperty(relationName, col) ? {...rec[col.relationName]} : null;
}
*/

// Build Preview Query with 'recordId' && 'fieldName'
export const BUILD_PREVIEW_QUERY = (
  cols,
  recordId,
  fieldName,
  fieldValue,
  tableObject
) => {
  try {
    // Get Field's Column Entry
    const colInfos = cols.find((col) => col.fieldName === fieldName);
    //console.log('in BUILD_PREVIEW_QUERY() of recordPreviewHelpers.js  (sldsTableAuto),  here is colInfos: ',  JSON.stringify(colInfos));
    //console.log('in BUILD_PREVIEW_QUERY() of recordPreviewHelpers.js (sldsTableAuto helper) Here is recordId: ', recordId, ' fieldName: ', JSON.stringify(fieldName), ' fieldValue: ', JSON.stringify(fieldValue), ' tableObject: ', tableObject)
    // Check if "parent" on popover is the Table Object  --> if so use recordId  as refId
    const isParentMainObj = colInfos?.popover?.parent === tableObject;
    //console.log('isParentMainObj in BUILD_PREVIEW_QUERY() of recordPreviewHelpers.js (sldsTableAuto helper): ', isParentMainObj);

    // Get the lookup Id reference
    const refId = isParentMainObj
      ? recordId
      : isValidProperty("parent", colInfos?.popover)
        ? fieldValue
        : recordId;

    // Get the Fields/Objects to be queried in <col>.popover.references
    const popoverReferences = colInfos.popover.references;
    // Check if is table object
    const isTableFields = colInfos?.popover?.isTableFields;

    //console.log('here is isTableFields in BUILD_PREVIEW_QUERY() of recordPreviewHelpers (sldsTableAuto): ', isTableFields);

    // Build the query
    return popoverReferences.map((refObj) => {
      // Get queryObj property
      const queryObj = refObj.queryObj;
      const objectApiName = queryObj?.queryObjectApiName; // Object API name to query
      const fieldApiNames = queryObj?.fieldNames; // Field API names to query
      const mapKey = queryObj?.isChild
        ? queryObj?.objectApiName
        : queryObj?.parentObjectApiName;

      // Query child object if reference is to child  --->  query main object if references is a parent
      const conditions = isTableFields
        ? {
            cond1: [{ fieldName: "Id", isValues: [recordId], nullable: false }]
          }
        : queryObj?.isTableRefChild
          ? {
              cond1: [
                {
                  fieldName: queryObj?.childLookupField,
                  isValues: [recordId],
                  nullable: false
                }
              ]
            }
          : queryObj?.isChild
            ? {
                cond1: [
                  {
                    fieldName: queryObj?.childLookupField,
                    isValues: [refId],
                    nullable: false
                  }
                ]
              }
            : queryObj?.isChildOfTable
              ? {
                  cond1: [
                    {
                      fieldName: queryObj?.tableReference,
                      isValues: [recordId],
                      nullable: false
                    }
                  ]
                }
              : {
                  cond1: [
                    { fieldName: "Id", isValues: [refId], nullable: false }
                  ]
                };

      return { objectApiName, fieldApiNames, conditions, mapKey };
    });
  } catch (error) {
    console.error(
      "Error in BUILD_PREVIEW_QUERY() of recordPreviewHelpers.js of sldsTableAuto: ",
      getErrorMessage(error)
    );
    return { error };
  }
};
export const FIND_NAME_FIELD = (namesArr) => {
  try {
    return Array.isArray(namesArr) && namesArr.length
      ? (namesArr.find((n) => n === "Name") ?? namesArr[0])
      : undefined;
  } catch (error) {
    getToastErrorMessage("findNameField()", "sldsTableAuto.js", error);
    return undefined;
  }
};
// -- Boolean -- is Parent Reference array
export const IS_PARENT_OBJECT = (mainObjParentFields, fieldsArr) => {
  return mainObjParentFields.some((parentF) =>
    (parentF.referenceToInfos || []).some(
      (r) => r.apiName === fieldsArr[0].objectApiName
    )
  );
};
// -- Boolean -- is Child Reference array
export const IS_CHILD_OBJECT = (mainObjChildFields, fieldsArr) => {
  return mainObjChildFields.some(
    (ch) => ch.childObjectApiName === fieldsArr[0].objectApiName
  );
};
// --- Child builder: query the child directly ---
export const BUILD_CHILD_OBJ_INFOS = (
  parentObjMeta,
  fieldsArr,
  allObjInfos,
  mainRefLookup
) => {
  try {
    const mainObjChildFields = parentObjMeta?.childRelationships || [];

    const childObjectName = fieldsArr[0].objectApiName;
    const childEntry = mainObjChildFields.find(
      (ch) => ch.childObjectApiName === childObjectName
    );
    if (!childEntry) return null;

    const childInfo = allObjInfos.get(childObjectName);
    if (!childInfo) return null;

    const nameField =
      childObjectName === "Task"
        ? "Subject"
        : FIND_NAME_FIELD(childInfo?.nameFields);
    const filtered = FILTER_OUT_NAME_AND_ID(fieldsArr, nameField);

    // Base columns (Id, Name?, and requested fields)
    let fieldsArrRes = [
      { fieldApiName: "Id", objectApiName: childObjectName },
      ...(nameField
        ? [{ fieldApiName: nameField, objectApiName: childObjectName }]
        : []),
      ...filtered
    ];

    // Enrich with metadata — NOTE: fields is a MAP keyed by apiName
    fieldsArrRes = fieldsArrRes.map((field) => {
      const fieldKey = childInfo?.fields;

      const fieldInfo =
        fieldKey && Array.isArray(fieldKey)
          ? childInfo.fields.find((f) => f.apiName === field.fieldApiName)
          : fieldKey?.[field.fieldApiName]; // <- key fix

      const referenceInfos = fieldInfo?.referenceToInfos?.length
        ? FIND_NAME_FIELD(fieldInfo.referenceToInfos)
        : null;

      return {
        // keep the original props used elsewhere
        fieldApiName: field.fieldApiName,
        objectApiName: field.objectApiName,

        // extras
        dtype: TO_LOCAL_DTYPE(fieldInfo?.dataType),
        isReference: fieldInfo?.dataType === "Reference",
        unique: !!fieldInfo?.unique,
        label: fieldInfo?.label ?? getCleanMetaDataLabels(field.fieldApiName),
        fieldName: field.fieldApiName,
        updateable: !!fieldInfo?.updateable,
        nameReference: referenceInfos ? referenceInfos.nameFields[0] : null,
        relatedObjectApiName: referenceInfos ? referenceInfos.apiName : null,
        calculated: !!fieldInfo?.calculated,
        relationshipName: fieldInfo?.relationshipName ?? null,
        isNameField: nameField && nameField === field.fieldApiName
      };
    });

    // Build query fields for the CHILD (no dot-walk)
    const queryFieldNames = fieldsArrRes.map((f) => f.fieldApiName);

    let childLookupField = null;
    let isTableRefChild = false;

    if (mainRefLookup) {
      const childLookupRef = Object.values(childInfo.fields).find((infos) =>
        infos?.referenceToInfos?.some(
          (ref) => ref.apiName === parentObjMeta.apiName
        )
      );

      if (childLookupRef?.relationshipName) {
        childLookupField = `${childLookupRef.relationshipName}.${mainRefLookup}`;
        isTableRefChild = true;
        queryFieldNames.push();
      }
    }

    if (!childLookupField) {
      childLookupField = childEntry?.fieldName ?? null;
    }

    return {
      queryObj: {
        fieldNames: queryFieldNames,
        queryObjectApiName: childObjectName,
        objectApiName: childObjectName,
        isChild: true,
        isParent: false,
        relationName: null,
        childLookupField,
        isTableRefChild
      },
      columns: fieldsArrRes,
      isParent: false
    };
  } catch (error) {
    getToastErrorMessage("BUILD_CHILD_OBJ_INFOS()", "sldsTableAuto.js", error);
    return null;
  }
};
// --- Parent builder: dot-walk via relation on the MAIN object ---
export const BUILD_PARENT_OBJ_INFOS = (
  mainObjParentFields,
  fieldsArr,
  allObjInfos,
  mainObjName
) => {
  try {
    const parentObjName = fieldsArr[0].objectApiName;
    const parentInfo = allObjInfos.get(parentObjName);
    if (!parentInfo) return null;

    // reference field on parent point to MAIN
    const parentRefField = mainObjParentFields.find((f) =>
      (f?.referenceToInfos || []).some((r) => r.apiName === parentObjName)
    );
    if (!parentRefField) return null;

    const relationName = parentRefField.relationshipName; // e.g., Account or Lead__r
    const fkOnMain = parentRefField.apiName; // e.g., AccountId or Lead__c

    // parent name field
    const refInfoMatch = (parentRefField?.referenceToInfos || []).find(
      (r) => r.apiName === parentObjName
    );
    const parentNameField =
      parentObjName === "Task"
        ? "Subject"
        : FIND_NAME_FIELD(refInfoMatch?.nameFields);

    const filtered = FILTER_OUT_NAME_AND_ID(fieldsArr, parentNameField);

    // Columns (for UI) expressed as PARENT fields
    let columnsRes = [
      { fieldApiName: "Id", objectApiName: parentObjName },
      ...(parentNameField
        ? [{ fieldApiName: parentNameField, objectApiName: parentObjName }]
        : []),
      ...filtered
    ];

    // Enrich with metadata — NOTE: fields is a MAP keyed by apiName
    columnsRes = columnsRes.map((field) => {
      const fieldInfo = parentInfo?.fields?.[field.fieldApiName]; // <- key fix

      const referenceInfos = fieldInfo?.referenceToInfos?.length
        ? FIND_NAME_FIELD(fieldInfo.referenceToInfos)
        : null;

      return {
        fieldApiName: field.fieldApiName, // keep original name used elsewhere
        objectApiName: field.objectApiName,
        dtype: TO_LOCAL_DTYPE(fieldInfo?.dataType),
        isReference: fieldInfo?.dataType === "Reference",
        unique: !!fieldInfo?.unique,
        fieldName: field.fieldApiName,
        label: fieldInfo?.label,
        updateable: !!fieldInfo?.updateable,
        nameReference: referenceInfos ? referenceInfos.nameFields[0] : null,
        relatedObjectApiName: referenceInfos ? referenceInfos.apiName : null,
        calculated: !!fieldInfo?.calculated,
        relationshipName: fieldInfo?.relationshipName ?? null,
        isNameField: parentNameField && parentNameField === field.fieldApiName
      };
    });

    // Query against MAIN with dotted fields to reach PARENT
    const queryFields = [
      fkOnMain,
      ...(parentNameField
        ? [TO_RELATION_FIELD(relationName, parentNameField)]
        : []),
      ...filtered.map((f) => TO_RELATION_FIELD(relationName, f.fieldApiName))
    ];

    return {
      queryObj: {
        fieldNames: queryFields,
        queryObjectApiName: mainObjName, // Object api name to query
        parentObjectApiName: parentObjName, // querying main with dotted fields
        isChild: false,
        isParent: true,
        relationName
      },
      columns: columnsRes,
      isParent: true
    };
  } catch (error) {
    getToastErrorMessage("BUILD_PARENT_OBJ_INFOS()", "sldsTableAuto.js", error);
    return null;
  }
};
// --- Main Query Obj builder: query the parent directly ---
export const BUILD_MAIN_REF_INFOS = (
  tableObjName,
  fieldsArr,
  allObjInfos,
  mainObjName
) => {
  try {
    // Get the popover's parent object api name
    const objName = fieldsArr[0].objectApiName;

    // Get the Table's Object Infos
    const tableObjInfos = allObjInfos.get(tableObjName);
    const chlildOfTableInfo =
      tableObjInfos?.childRelationships.find(
        (child) => child.childObjectApiName === objName
      ) ?? null;

    // Get the popover's parent object
    const crntObjInfos = allObjInfos.get(objName);

    // Get the Names from object infos
    const namesArr = allObjInfos.get(mainObjName)?.nameFields;

    // name field
    const nameField =
      objName === "Task" ? "Subject" : FIND_NAME_FIELD(namesArr);

    // Filter out name and ID
    const filtered = FILTER_OUT_NAME_AND_ID(fieldsArr, nameField);

    // Columns (for UI) expressed as PARENT fields
    let columnsRes = [
      { fieldApiName: "Id", objectApiName: mainObjName },
      ...(nameField
        ? [{ fieldApiName: nameField, objectApiName: mainObjName }]
        : []),
      ...filtered
    ];

    // Enrich with metadata — NOTE: fields is a MAP keyed by apiName
    columnsRes = columnsRes.map((field) => {
      const fieldInfo = crntObjInfos?.fields?.[field.fieldApiName]; // <- key fix

      const referenceInfos = fieldInfo?.referenceToInfos?.length
        ? FIND_NAME_FIELD(fieldInfo.referenceToInfos)
        : null;

      return {
        fieldApiName: field.fieldApiName, // keep original name used elsewhere
        objectApiName: field.objectApiName,
        dtype: TO_LOCAL_DTYPE(fieldInfo?.dataType),
        isReference: fieldInfo?.dataType === "Reference",
        unique: !!fieldInfo?.unique,
        fieldName: field.fieldApiName,
        label: fieldInfo?.label,
        updateable: !!fieldInfo?.updateable,
        nameReference: referenceInfos ? referenceInfos.nameFields[0] : null,
        relatedObjectApiName: referenceInfos ? referenceInfos.apiName : null,
        calculated: !!fieldInfo?.calculated,
        relationshipName: fieldInfo?.relationshipName ?? null,
        isNameField: nameField && nameField === field.fieldApiName
      };
    });

    // Query against MAIN with dotted fields to reach PARENT
    const queryFields = columnsRes.map((f) => f.fieldApiName);

    return {
      queryObj: {
        fieldNames: queryFields,
        queryObjectApiName: mainObjName, // Object api name to query
        parentObjectApiName: null, // querying main with dotted fields
        isChild: false,
        isChildOfTable: chlildOfTableInfo !== null,
        tableReference: chlildOfTableInfo?.fieldName,
        isParent: false,
        relationName: null,
        isHeader: true
      },
      columns: columnsRes,
      isParent: false
    };
  } catch (error) {
    getToastErrorMessage("BUILD_MAIN_REF_INFOS()", "sldsTableAuto.js", error);
    return null;
  }
};

/*
function getDynamicCandidateApiNames(columns = []) {
    const names = new Set();
    columns.forEach(c => {
        if (c && c.isDynamic && Array.isArray(c.fields)) {
            c.fields.forEach(f => f?.fieldApiName && names.add(f.fieldApiName));
        }
    });
    return names;
}
*/
