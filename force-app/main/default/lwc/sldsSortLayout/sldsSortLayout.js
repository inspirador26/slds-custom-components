import { LightningElement, api } from "lwc";
import { iconMap as ICON_MAP, getErrorMessage } from "c/utils";

const SORT_DIRECTION_OPTIONS = [
  { label: "Ascending", value: true },
  { label: "Descending", value: false }
];

let KEY_ID = 999;

function clone(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function normalizeBoolean(value, fallback = true) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true" || value.toLowerCase() === "asc") {
      return true;
    }
    if (value.toLowerCase() === "false" || value.toLowerCase() === "desc") {
      return false;
    }
  }
  return fallback;
}

function makeSortEntry(sort = {}) {
  const isAscending = Object.prototype.hasOwnProperty.call(sort, "isAscending")
    ? normalizeBoolean(sort.isAscending)
    : normalizeBoolean(sort.direction);

  return {
        ...sort,
        fieldApiName: sort.fieldApiName ?? sort.fieldName ?? sort.value ?? "",
        label: sort.label ?? "",
        isAscending,
        keyId: sort.keyId ?? `${KEY_ID++}-${Math.random().toString(36).slice(2)}`,
  };
}

function makeBlankSortEntry() {
    return makeSortEntry({
        fieldApiName: "",
        label: "",
        isAscending: true
    });
}

function comparableSorts(sorts) {
  return (sorts ?? [])
    .filter((sort) => sort.fieldApiName)
    .map((sort) => ({
      fieldApiName: String(sort.fieldApiName ?? ""),
      isAscending: normalizeBoolean(sort.isAscending)
    }));
}

export default class SldsSortLayout extends LightningElement {
    iconMap = ICON_MAP;
    sortDirectionOptions = SORT_DIRECTION_OPTIONS;

    _orderedBy = [makeBlankSortEntry()];
    _originalOrderedBy = [];
    _sortFieldOptions = [];
    _maxSortColumns = 5;

    filteredSortOptions = [];

    @api renderFocus = false;

    @api
    set sortFieldOptions(value) {
        this._sortFieldOptions = Array.isArray(value) ? value : [];
        this.hydrateSortLabels();
    }
    get sortFieldOptions() {
        return this._sortFieldOptions;
    }

    @api
    set fieldOptions(value) {
        this._sortFieldOptions = Array.isArray(value) ? value : [];
        this.hydrateSortLabels();
    }
    get fieldOptions() {
        return this.sortFieldOptions;
    }

    @api
    set orderedBy(value) {
        this.setOrderedBy(value, true);
    }
    get orderedBy() {
        return this._orderedBy;
    }

    @api
    set sorts(value) {
        this.setOrderedBy(value, true);
    }
    get sorts() {
        return this.orderedBy;
    }

    @api
    set maxSortColumns(value) {
        const parsed = Number(value);
        this._maxSortColumns = Number.isFinite(parsed) && parsed > 0 ? parsed : 5;
    }
    get maxSortColumns() {
        return this._maxSortColumns;
    }

    get rows() {
        const lastIndex = this._orderedBy.length - 1;
        const selectedFieldApiNames = new Set(
            this._orderedBy
                .map((sort) => sort.fieldApiName)
                .filter(Boolean)
        );

        return this._orderedBy.map((sort, index) => ({
        ...sort,
        rowLabel: index === 0 ? "Sort by" : "Then by",
        showRequired: this.isSortRequired && index === 0,
        isFirst: index === 0,
        isLast: index === lastIndex,
        availableFieldOptions: this.sortFieldOptions.filter((option) => {
            const value = option.value;
            return value === sort.fieldApiName || !selectedFieldApiNames.has(value);
        }),
        moveUpButtonClass: [
            "slds-button slds-button_icon slds-button_icon-border-filled",
            index === 0 ? "slds-is-disabled" : ""
        ]
            .filter(Boolean)
            .join(" "),
        moveDownButtonClass: [
            "slds-button slds-button_icon slds-button_icon-border-filled",
            index === lastIndex ? "slds-is-disabled" : ""
        ]
            .filter(Boolean)
            .join(" ")
        }));
    }

    get hasSortRows() {
        return this._orderedBy.length > 0;
    }

    get isAddSortColDisabled() {
        return (
            this._orderedBy.length >= this.maxSortColumns ||
            this._orderedBy.some((sort) => !sort.fieldApiName)
        );
    }

    get isSortRequired() {
        return this._orderedBy.length === 1;
    }

    get columnLimitLabel() {
        return `${this.maxSortColumns} column limit`;
    }

    @api
    getOrderedBy() {
        return clone(this._orderedBy);
    }

    @api
    getSorts() {
        return this.getOrderedBy();
    }

    @api
    clearAllSort() {
        this.setOrderedBy([makeBlankSortEntry()]);
        this.notifyParent();
    }

    setOrderedBy(value, resetOriginal = false) {
        const next = Array.isArray(value) && value.length ? value : [makeBlankSortEntry()];
        this._orderedBy = next.map((sort) => makeSortEntry(sort));
        this.hydrateSortLabels();

        if (resetOriginal) {
            this._originalOrderedBy = clone(this._orderedBy);
        }
    }

    hydrateSortLabels() {
        if (!this._orderedBy?.length) return;

        this._orderedBy = this._orderedBy.map((sort) => {
        if (!sort.fieldApiName || sort.label) {
            return sort;
        }

        const label = this.sortFieldOptions.find(
            (option) => option.value === sort.fieldApiName
        )?.label;

        return label ? { ...sort, label } : sort;
        });
    }

    dispatchSortEvent(name, detail) {
        this.dispatchEvent(
        new CustomEvent(name, {
            detail,
            bubbles: true,
            composed: true
        })
        );
    }

    notifyParent() {
        const orderedBy = clone(this._orderedBy);
        const usableOrderedBy = orderedBy
        .filter((sort) => sort.fieldApiName)
        .map((sort) => ({
            fieldApiName: sort.fieldApiName,
            label: sort.label,
            isAscending: normalizeBoolean(sort.isAscending),
            direction: normalizeBoolean(sort.isAscending) ? "asc" : "desc"
        }));
        const state =
        JSON.stringify(comparableSorts(this._originalOrderedBy)) ===
        JSON.stringify(comparableSorts(this._orderedBy))
            ? "unchanged"
            : "changed";

        this.dispatchSortEvent("sortchange", { orderedBy, usableOrderedBy, state });
        this.dispatchSortEvent("orderbychange", { orderedBy, usableOrderedBy, state });
        this.dispatchSortEvent("orderbystate", state);
    }

    focusLastCombobox() {
        try {
            const lastKeyId = this._orderedBy[this._orderedBy.length -1]?.keyId;
            if (lastKeyId) {
                const ele = this.template.querySelector(
                    `c-slds-combobox-portal[data-key-id="${lastKeyId}"]`
                );
                if (ele) {
                    requestAnimationFrame(() => {
                        ele.focusMe();
                    });
                }
            }
        } catch(error) {
            this.showToast('Error in focusLastCombobox() of sldsSortLayout.js', error, 'error');
        } 
    }

    addSortCol() {
        try {
            if (this.isAddSortColDisabled) return;

            this._orderedBy = [
                ...this._orderedBy, 
                makeBlankSortEntry()
            ];
            this.notifyParent();
            requestAnimationFrame(() => {
                this.focusLastCombobox();
            })
            
        } catch(error) {
            this.showToast('Error in addSortCol() of sldsSortLayout.js', getErrorMessage(error), 'error');
        }
    }

    removeSortCol(event) {
        const keyId = event.target?.dataset?.keyId ?? event.currentTarget?.dataset?.keyId;
        if (!keyId) return;

        const next = this._orderedBy.filter((sort) => sort.keyId !== keyId);
        this._orderedBy = next.length ? next : [makeBlankSortEntry()];
        this.notifyParent();
        this.focusLastCombobox();
    }

    handleSortColFieldSelection(event) {
        const keyId = event.currentTarget?.dataset?.keyId;
        const fieldApiName = event.detail;
        if (!keyId) return;

        const label =
        this.sortFieldOptions.find((option) => option.value === fieldApiName)
            ?.label ?? "";

        this._orderedBy = this._orderedBy.map((sort) => {
        return sort.keyId === keyId ? { ...sort, fieldApiName, label } : sort;
        });
        this.notifyParent();
    }

    handleAscendingChange(event) {
        const keyId = event.currentTarget?.dataset?.keyId;
        if (!keyId) return;

        const isAscending = normalizeBoolean(event.detail);
        this._orderedBy = this._orderedBy.map((sort) => {
        return sort.keyId === keyId ? { ...sort, isAscending } : sort;
        });
        this.notifyParent();
    }

    moveSortColDown(event) {
        const keyId = event.target?.dataset?.keyId ?? event.currentTarget?.dataset?.keyId;
        const matchedIdx = this._orderedBy.findIndex((sort) => sort.keyId === keyId);
        if (matchedIdx === -1 || matchedIdx === this._orderedBy.length - 1) return;

        const next = [...this._orderedBy];
        [next[matchedIdx], next[matchedIdx + 1]] = [
        next[matchedIdx + 1],
        next[matchedIdx]
        ];
        this._orderedBy = next;
        this.notifyParent();
    }

    _wasFocused = false;
    renderedCallback() {
        if (this.renderFocus && !this._wasFocused) {
            const combo = this.template.querySelector('c-slds-combobox-portal');
            if (combo) {
                combo.focusMe();
                this._wasFocused = true;
            }
        }
    }

    moveSortColUp(event) {
        const keyId = event.target?.dataset?.keyId ?? event.currentTarget?.dataset?.keyId;
        const matchedIdx = this._orderedBy.findIndex((sort) => sort.keyId === keyId);
        if (matchedIdx <= 0) return;

        const next = [...this._orderedBy];
        [next[matchedIdx - 1], next[matchedIdx]] = [
        next[matchedIdx],
        next[matchedIdx - 1]
        ];
        this._orderedBy = next;
        this.notifyParent();
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
