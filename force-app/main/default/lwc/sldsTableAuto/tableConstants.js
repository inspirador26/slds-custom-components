import { IS_SF_ID } from "c/utils";

function prettifyApi(api) {
  return api
    .replace(/__r$/, "")
    .replace(/__c$/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
function resolveFieldLabel(cmp, baseObjMeta, fieldPath) {
  // Direct field on base object
  if (baseObjMeta?.fields?.[fieldPath]?.label) {
    return baseObjMeta.fields[fieldPath].label;
  }

  if (!fieldPath.includes(".")) {
    return prettifyApi(fieldPath);
  }

  const parts = fieldPath.split(".");

  // FIRST relationship
  const firstRelApi = parts[0].replace(/__r$/, "");
  const firstRelLabel =
    Object.values(baseObjMeta.fields || {}).find(
      (f) => f.relationshipName === firstRelApi
    )?.label || prettifyApi(firstRelApi);

  // FINAL field
  const finalFieldApi = parts[parts.length - 1];
  const finalFieldLabel = prettifyApi(finalFieldApi);

  return `${firstRelLabel} - ${finalFieldLabel}`;
}
function renderConditionText(cmp, baseObjMeta, condObj) {
  const fieldLabel = resolveFieldLabel(cmp, baseObjMeta, condObj.fieldName);

  const vals = condObj.isValues;
  if (
    Array.isArray(vals) &&
    vals.length === 1 &&
    vals[0] != null &&
    vals[0] !== "" &&
    !IS_SF_ID(vals[0]) // ⬅️ omit value if SF Id
  ) {
    return `${fieldLabel}: ${vals[0]}`;
  }

  return fieldLabel;
}

export const SETTINGS_OPTIONS = [
  { label: "Save column widths", value: "updatecolumnwidthspx" },
  { label: "Results per page", value: "pageSize" },
  { label: "Select fields to display", value: "Select fields to display" }
];

export const DISPLAY_OPTIONS = [
  { label: "Table", value: "Table" },
  { label: "Tree Grid", value: "Tree Grid" },
  { label: "Kanban", value: "Kanban" }
];

export const SAVED_LIST_VIEW_OPTIONS = [
  {
    objectApiName: "Lead",
    options: [
      { label: "Open Leads", value: "Open Leads" },
      { label: "Open Leads 1", value: "Open Leads 1" },
      { label: "Open Leads 2", value: "Open Leads 2" }
    ]
  }
];

export const FIELD_API_NAME_EXCEPTIONS = {
  Lead: {
    Name: "Full Name"
  }
};

// Build the "Filtered By:" infos for page header
export function getFilteredByInfo(cmp) {
  if (cmp.suppressFilterMeta) {
    return "";
  }
  // Get the objectInfos
  const mainObjMeta = cmp._objectInfos.get(cmp.objectName);

  if (!mainObjMeta) return "";

  // Get the Plural Label
  const pluralLabel = `${mainObjMeta?.labelPlural}`;

  // Return just plural Label with 'All' prefix if not conditions
  if (!cmp.conditions) return `All ${pluralLabel}`;

  // Get the fields mentioned in the conditions
  const filteredByFields = Object.keys(cmp.conditions)
    .filter((k) => k !== "limit")
    .flatMap((k) =>
      (cmp.conditions[k] || []).map((condObj) =>
        renderConditionText(cmp, mainObjMeta, condObj)
      )
    )
    .filter(Boolean)
    .join(" • ");

  if (cmp.masterDetailField) return `${filteredByFields}`;
  // 1. Plural Object Label  2. '-' separator   3. Condition Fields   4. ' • ' delimiter
  return `${pluralLabel} - ${filteredByFields}`;
}

export function handleDtypeLabel(dtype) {
  if (!dtype || dtype === "name") return "text";
  return dtype;
}

// Utility to safely use user input in a RegExp
export function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// put near top of file
const NUMERIC_DTYPES = new Set([
  "decimal",
  "double",
  "currency",
  "integer",
  "long",
  "percent",
  "number"
]);
const BOOL_DTYPES = new Set(["boolean"]);
const DATE_DTYPES = new Set(["date", "datetime"]);

export function coerceByDtype(value, dtype) {
  if (value === undefined) return null;

  if (NUMERIC_DTYPES.has(dtype)) {
    if (value === "" || value === null) return null;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const s = value.trim().replace(/,/g, "");
      if (s === "") return null;
      const n = Number(s);
      return Number.isFinite(n) ? n : null; // or throw to block bad input
    }
    // booleans/objects -> null for numbers
    return null;
  }

  if (BOOL_DTYPES.has(dtype)) {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value.toLowerCase() === "true";
    return !!value;
  }

  if (DATE_DTYPES.has(dtype)) {
    // allow Date or ISO string; let server validate
    return value === "" ? null : value;
  }

  // text/picklist/etc
  return value ?? null;
}

// Change 'dataType' Object Infos values to match Table Component's expected properties
export const TO_LOCAL_DTYPE = (dtype, colInfos = null) => {
  if ((!dtype || typeof dtype !== "string") && !colInfos) {
    return "text";
  }

  const extraTypeInfo = colInfos?.extraTypeInfo ?? null;
  const dtypeLower =
    extraTypeInfo && extraTypeInfo === "RichTextArea"
      ? "richtext"
      : (dtype?.toLowerCase() ?? colInfos?.dataType?.toLowerCase() ?? "text");

  switch (true) {
    case dtypeLower === "string":
      return "text";
    case dtypeLower === "double": {
      const scale = colInfos?.scale ?? 0;
      return scale === 0 ? "number" : "decimal";
    }
    case dtypeLower === "email":
      return "text";
    default:
      return dtypeLower;
  }
};

// Col action bools
export const CELL_TEXT_STYLES = {
  clipText: "slds-truncate",
  wrapText: "slds-has-flexi-truncate",
  clampText: "slds-line-clamp"
};

// All possible Table Attrbiute
// --> Row Actions, Striped Table, Col Actions, Resizable Cols, Checkboxes, Bordered Table, Header Color, Background Color
/*const TABLE_ATTRIBUTE_DEFAULTS = {
    rowActions: true,
    colActions: true,
    stripedTable: false,
    resizableCols: true, 
    borderedTable: true, 
    colBorders: false,
    headerBg: 'var(slds-g-color-neutral-base-95, rgb(243, 243, 243))', 
    rowsBg: 'var(slds-g-color-neutral-base-100, #fff)'
}*/
