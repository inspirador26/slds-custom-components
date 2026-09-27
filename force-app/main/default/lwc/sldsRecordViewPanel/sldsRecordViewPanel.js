import { LightningElement, track, api, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";

import {
  iconPath,
  iconMap as ICON_MAP,
  isValidProperty,
  getErrorMessage,
  formatDtypeLabel,
  getToastErrorMessage,
  buildWhereClause,
  iconByObjectApiName,
  addPageRefsFieldsArr
} from "c/utils";

import fetchRecordsMultiObjectsWithConditionCached from "@salesforce/apex/DynamicSObjectController.fetchRecordsMultiObjectsWithConditionCached";

let KEY_ID = 0;

const NUBBINS = new Set([
  "left",
  "left-top",
  "left-bottom",
  "right",
  "right-top",
  "right-bottom",
  "bottom",
  "top"
]);

const NUBBIN_CLS = new Set([
  "slds-nubbin_left",
  "slds-nubbin_left-top",
  "slds-nubbin_left-bottom",
  "slds-nubbin_right",
  "slds-nubbin_right-top",
  "slds-nubbin_right-bottom",
  "slds-nubbin_bottom",
  "slds-nubbin_top"
]);

const BASE_PANEL_CL = "slds-popover slds-popover_panel slds-popover_large";

const REQUIRED_QUERY_PROPERTIES = [
  "objectApiName",
  "fieldApiNames",
  "conditions"
];

const mapRecordsToCols = (cols, wiredRecords, isHeader, isParent) => {
  try {
    const colArray = Array.isArray(cols) ? cols : [];
    if (!colArray.length)
      return { objectLabel: "Unknown", icon: {}, records: [] };

    const objApiNm = colArray[0]?.objectApiName || "Unknown";

    const iconInfo = iconByObjectApiName(objApiNm, null, true);
    const iconObj = iconPath(iconInfo?.iconName, true, false) || {};

    // Re-order columns safely
    let orderedCols = [...colArray];
    const nameColIdx = orderedCols.findIndex((c) => !!c?.isNameField);

    if (nameColIdx !== -1) {
      const [nameCol] = orderedCols.splice(nameColIdx, 1);
      orderedCols = [nameCol, ...orderedCols];
    }

    orderedCols = orderedCols.filter((c) => c?.fieldApiName !== "Id");

    let iconContainer = isHeader
      ? `${iconObj.container ?? ""} slds-media__figure`.trim()
      : iconObj.container;

    if (isValidProperty("iconClass", iconInfo)) {
      iconContainer = `${iconContainer} ${iconInfo.iconClass}`;
    }

    // Always coerce to an array
    let list = Array.isArray(wiredRecords?.[objApiNm])
      ? wiredRecords[objApiNm]
      : [];

    if (
      isParent &&
      list.length &&
      Object.keys(list[0]).some((f) => f.endsWith("__r"))
    ) {
      list = list.map((rec) => rec[`${objApiNm}__r`]);
    }
    if (
      !list.length ||
      list.every((rec) => Object.keys(rec).every((f) => f === "Id"))
    ) {
      return {
        objectLabel: iconInfo?.title ?? objApiNm,
        icon: {
          ...iconObj,
          container: iconContainer,
          svg: "slds-icon slds-icon_small"
        },
        records: [] // your explicit empty-array rule
      };
    }

    const records = list.map((rec) => ({
      keyId: KEY_ID++,
      Id: rec?.Id,
      fields: orderedCols.map((col) => {
        const dtype = col?.dtype || "text";
        const fieldVal = rec?.[col?.fieldApiName];

        // ✅ keep your original logic:
        // value = record.Id if name field, otherwise raw field value
        // displayVal = record.Name (or any readable name field)
        const value = col?.isNameField ? rec?.Id : (fieldVal ?? null);

        const displayVal = col?.isNameField
          ? String(rec[col?.fieldApiName] ?? "")
          : formatDtypeLabel(rec, col.fieldApiName, col.dtype, col);

        return {
          keyId: KEY_ID++,
          fieldApiName: col?.fieldApiName,
          fieldLabel: col?.label,
          dtype: col?.isNameField ? "name" : dtype,
          [`is${dtype.toLowerCase()}`]: true,
          objectApiName: col?.objectApiName,
          isNameField: !!col?.isNameField,
          value,
          displayVal: displayVal ?? "Unknown"
        };
      })
    }));
    return {
      isParent: isParent,
      objectLabel: iconInfo?.title ?? objApiNm,
      icon: {
        ...iconObj,
        container: iconContainer,
        svg: "slds-icon slds-icon_small"
      },
      records
    };
  } catch (error) {
    getToastErrorMessage("mapRecordsToCols()", "sldsRecordViewPanel.js", error);
    return { objectLabel: "Error", icon: {}, records: [] };
  }
};
/*
const mapMasterDetailToCols = (cols, wiredRecords, isHeader, isParent) => {
  	try {
		const colArray = Array.isArray(cols) ? cols : [];
		if (!colArray.length) {
			return { objectLabel: 'Unknown', icon: {}, records: [] };
		}

		const objApiNm = colArray[0]?.objectApiName || 'Unknown';

		const iconInfo = iconByObjectApiName(objApiNm, null, true);
		const iconObj  = iconPath(iconInfo?.iconName, true, false) || {};

		// Re-order columns safely
		let orderedCols = [...colArray];
		const nameColIdx = orderedCols.findIndex(c => !!c?.isNameField);

		if (nameColIdx !== -1) {
			const [nameCol] = orderedCols.splice(nameColIdx, 1);
			orderedCols = [nameCol, ...orderedCols];
		}

		orderedCols = orderedCols.filter(c => c?.fieldApiName !== 'Id');

		let iconContainer = isHeader 
			? `${iconObj.container ?? ''} slds-media__figure`.trim() 
			: iconObj.container;

		if (isValidProperty('iconClass', iconInfo)) {
			iconContainer = `${iconContainer} ${iconInfo.iconClass}`;
		}

		// Always coerce to an array
		let list = Array.isArray(wiredRecords?.[objApiNm]) 
			? wiredRecords[objApiNm] 
			: [];

		if (isParent && list.length && Object.keys(list[0]).some(f => f.endsWith('__r'))) {
			list = list.map(rec => rec[`${objApiNm }__r`])
		}
		if (!list.length || list.every(rec => Object.keys(rec).every(f => f === 'Id'))) {
			return {
				objectLabel: iconInfo?.title ?? objApiNm,
				icon: {
					...iconObj,
					container: iconContainer,
					svg: 'slds-icon slds-icon_small'
				},
				records: []          // your explicit empty-array rule
			};
		}

		const records = list.map(rec => ({
			keyId: KEY_ID++,
			Id: rec?.Id,
			fields: orderedCols.map(col => {
				const dtype = col?.dtype || 'text';
				const fieldVal = rec?.[col?.fieldApiName];

				// ✅ keep your original logic:
				// value = record.Id if name field, otherwise raw field value
				// displayVal = record.Name (or any readable name field)
				const value = col?.isNameField ? rec?.Id : (fieldVal ?? null);

				const displayVal = col?.isNameField
					? String(rec[col?.fieldApiName] ?? '')
					: formatDtypeLabel(rec, col.fieldApiName, col.dtype, col);

				return {
                    keyId: KEY_ID++,
                    fieldApiName: col?.fieldApiName,
                    fieldLabel: col?.label,
                    [`is${dtype.toLowerCase()}`]: true,
                    objectApiName: col?.objectApiName,
                    isNameField: !!col?.isNameField,
                    value,
                    displayVal: displayVal ?? 'Unknown'
				};
			})
		}));
		return {
			isParent: isParent,
			objectLabel: iconInfo?.title ?? objApiNm,
			keyId: KEY_ID++,
			icon: {
				...iconObj,
				container: iconContainer,
				svg: 'slds-icon slds-icon_small'
			},
			records
		};

	} catch (error) {
			getToastErrorMessage('mapRecordsToCols()', 'sldsRecordViewPanel.js', error);
			return { objectLabel: 'Error', icon: {}, records: [] };
	}
};
*/

export default class SldsRecordViewPanel extends NavigationMixin(
  LightningElement
) {
  iconMap = ICON_MAP;
  _keyId = 0;
  isLoading = false;
  toastObj;
  panelCl = `${BASE_PANEL_CL} slds-nubbin_left-top`;

  isLarge = true;
  _isMasterDetail = false;

  @api isCommunity = false;

  @api
  set nubbin(value) {
    if (NUBBINS.has(value)) this._nubbin = `slds-nubbin_${value}`;
    else if (NUBBIN_CLS.has(value)) this._nubbin = `${value}`;
    else this._nubbin = `slds-nubbin_left-top`;
    this.panelCl = `${BASE_PANEL_CL} ${this.nubbin}`;
  }
  get nubbin() {
    return this._nubbin ?? "slds-nubbin_left-top";
  }

  // Query array for Apex
  _apexQuery;
  @api
  set apexQuery(queries) {
    try {
      this.isLoading = true;
      //console.log('here is queries in set apexQuery() of  sldsRecordViewPanel.js: ', JSON.stringify(queries));

      if (!queries || !queries.length) return;

      // Ensure required apex properties are present
      const correctQueries = queries
        ?.filter((qry) =>
          REQUIRED_QUERY_PROPERTIES.every((rqd) => isValidProperty(rqd, qry))
        )
        ?.map((qry) => {
          const whereClause = buildWhereClause(qry.conditions);
          return isValidProperty("mapKey", qry)
            ? { ...qry, conditions: whereClause }
            : { ...qry, conditions: whereClause, mapKey: qry.objectApiName };
        });

      // No valid queries
      if (!correctQueries || !correctQueries.length) {
        this.showToast(
          "Error in record preview panel",
          "None of the record preview queries were configured correctly, contact an admin about this error",
          "error"
        );
      }

      // Warn user if some data will be missing
      if (correctQueries.length && correctQueries.length < queries.length) {
        // Get all object api names mentioned in "correct" queries
        const allObjApiName = new Set(
          correctQueries.map((obj) => obj.objectApiName)
        );

        // Get obj api names missing from "corect" queries
        const missing =
          queries
            .filter((qry) => !allObjApiName.has(qry.objectApiName))
            ?.map((qry) => qry.objectApiName)
            ?.join(", ") || null;

        let msg = "Some data might be missing in the record preview panel";
        if (missing) {
          msg = msg += ` for ${missing}`;
        }

        this.showToast(
          "Missing properties in Record Preview Panel",
          msg,
          "warning"
        );
      }

      //console.log('here is correctQueries in set apexQuery() of  sldsRecordViewPanel.js: ', JSON.stringify(correctQueries));

      this._apexQuery = correctQueries;
    } catch (error) {
      this.isLoading = false;
      this.showToast(
        "Error in previewRecords()() of sldsRecordViewPanel.js.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  get apexQuery() {
    return this._apexQuery;
  }

  // Store each array of records as object with prop: 1. isHeaderSection, 2. records > record.fields
  @track _sectionByMapKey = [];

  isHeader = false;
  parentObjs = [];
  @api
  set panelColumns(value) {
    if (value) {
      const colsFlat = value.map((colObj) => colObj.columns);
      const headerSectionIdx = value.findIndex((colObj) =>
        isValidProperty("isHeaderSection", colObj)
      );

      // Flag parent Objects
      this.parentObjs =
        value
          ?.filter((colObj) => colObj.isParent)
          ?.map((colObj) => colObj.columns[0].objectApiName) || [];

      if (headerSectionIdx === -1) {
        // Flag header
        this.isHeader = false;
        // Store Columns
        this._panelColumns = colsFlat;
      } else {
        // Flag header
        this.isHeader = true;

        // 1. Remove Header Section (splice returns an ARRAY)
        const headerSectionArray = colsFlat.splice(headerSectionIdx, 1);

        // 2. The first item of the returned array is the header section
        const headerSection = headerSectionArray[0];

        // 3. Concat Header as first item
        // Use the spread operator to put the header back at the front of the remaining array
        this._panelColumns = [headerSection, ...colsFlat];

        //console.log('here is _panelColumns in set panelColumns()  of sldsRecordViewPanel.js: ', JSON.stringify(this._panelColumns));
      }
    } else {
      this._panelColumns = value;
    }
  }
  get panelColumns() {
    return this._panelColumns;
  }

  // Check if current object was flagged as a parent object
  isParentObject(cols) {
    return this.parentObjs?.some(
      (objApiName) => objApiName === cols[0].objectApiName
    );
  }

  // Check if result is master detail
  masterDetailResult(wiredResult) {
    // Map sections of master detail as children of parent
    function mapMasterDetailSections(parentObj, childrenObj) {
      const parentObjName = Object.keys(parentObj)[0];
      return parentObj[parentObjName].map((rec) => {
        return {
          [parentObjName]: [rec],
          children: Object.entries(childrenObj).map(
            ([childObjname, recsArr]) => {
              return {
                [childObjname]:
                  recsArr.filter((childRec) =>
                    Object.values(childRec).some(
                      (fieldVal) => fieldVal === rec.Id
                    )
                  ) || []
              };
            }
          )
        };
      });
    }

    // Get top-level Object Rows --> Parent should always be at the top
    const parentCandidate = Array.from(Object.keys(wiredResult))[0];

    // Filter out parent candidate from wiredResult
    const childrenCandidates = {};
    for (const [mapKey, recsArr] of Object.entries(wiredResult)) {
      if (mapKey !== parentCandidate && recsArr?.length) {
        childrenCandidates[mapKey] = recsArr;
      }
    }

    // Get all parent candidate Ids in a Set
    const parentCandidateIds = new Set(
      wiredResult[parentCandidate]?.map((rec) => rec?.Id)
    );

    // check if all objects are related
    if (
      childrenCandidates &&
      parentCandidateIds.size &&
      Object.values(childrenCandidates).every((recsArr) =>
        recsArr.every((rec) =>
          Object.values(rec).some((fieldVal) =>
            parentCandidateIds.has(fieldVal)
          )
        )
      )
    ) {
      return mapMasterDetailSections(
        { [parentCandidate]: wiredResult[parentCandidate] },
        childrenCandidates
      );
    }
    return null;
  }

  _wiredRecordPreview;
  @wire(fetchRecordsMultiObjectsWithConditionCached, { queries: "$_apexQuery" })
  wiredRecordPreview(result) {
    try {
      this._wiredRecordPreview = result;
      const { data, error } = result;
      if (data) {
        //console.log('here is data in wiredRecordPreview() of sldsRecordViewPanel.js: ', data);
        // Check if is master detail relationship
        const masterDetailResult = this.masterDetailResult(data);

        if (masterDetailResult && masterDetailResult.length) {
          const getObjKey = (obj) => Array.from(Object.keys(obj))[0];
          this._isMasterDetail = true;

          this._sectionByMapKey = masterDetailResult.map((parent) => {
            const parentObjName = getObjKey(parent);
            const parentCols = this._panelColumns.find(
              (colsArr) => colsArr[0].objectApiName === parentObjName
            );

            const children = parent?.children ?? [];
            const childrenResult = children?.map((childObj) => {
              const childObjApiName = getObjKey(childObj);
              const childCols = this._panelColumns.find(
                (colsArr) => colsArr[0].objectApiName === childObjApiName
              );
              return mapRecordsToCols(childCols, childObj, false, false);
            });

            return {
              isHeader: true,
              keyId: KEY_ID++,
              masterRecord: mapRecordsToCols(
                parentCols,
                { [parentObjName]: parent[parentObjName] },
                true,
                false
              ),
              children: childrenResult ?? []
            };
          });
        } else {
          this._sectionByMapKey = (
            Array.isArray(this.panelColumns) ? this.panelColumns : []
          ).map((cols, index) => {
            // Check if object pertaining to cols is a parent of the table data
            const isParent = this.isParentObject(cols);
            const isHeader = this.isHeader && index === 0 && !isParent;

            const section =
              mapRecordsToCols(cols, data, isHeader, isParent) || {};

            return {
              isHeader,
              isParent,
              keyId: KEY_ID++,
              objectLabel: section.objectLabel,
              icon: section.icon || {},
              records: Array.isArray(section.records) ? section.records : [] // <— always array
            };
          });
        }
        //console.log('here is _sectionByMapKey in wiredRecordPreview() of sldsRecordViewPanel.js: ', JSON.stringify(this._sectionByMapKey));
        this.preloadSectionHrefs();
      } else if (error) {
        this.showToastError("wiredRecordPreview", "SldsRecordViewPanel", error);
      }
    } catch (e) {
      this.showToastError("wiredRecordPreview", "SldsRecordViewPanel", e);
    } finally {
      this.isLoading = false;
    }
  }

  @api previewRecords(queries, columnsByObjectApiName = null) {
    try {
      if (columnsByObjectApiName) {
        console.log(
          "has columnsByObjectApiName in previewRecords() of sldsRecordViewPanel.js"
        );
      }
      this.isLoading = true;

      if (!queries || !queries.length) return;

      // Ensure required apex properties are present
      const correctQueries = queries
        ?.filter((qry) =>
          REQUIRED_QUERY_PROPERTIES.every((rqd) => isValidProperty(rqd, qry))
        )
        ?.map((qry) => {
          const whereClause = buildWhereClause(qry.conditions);
          return isValidProperty("mapKey", qry)
            ? { ...qry, conditions: whereClause }
            : { ...qry, conditions: whereClause, mapKey: qry.objectApiName };
        });

      // No valid queries
      if (!correctQueries || !correctQueries.length) {
        this.showToast(
          "Error in record preview panel",
          "None of the record preview queries were configured correctly, contact an admin about this error",
          "error"
        );
      }

      // Warn user if some data will be missing
      if (correctQueries.length && correctQueries.length < queries.length) {
        // Get all object api names mentioned in "correct" queries
        const allObjApiName = new Set(
          correctQueries.map((obj) => obj.objectApiName)
        );

        // Get obj api names missing from "corect" queries
        const missing =
          queries
            .filter((qry) => !allObjApiName.has(qry.objectApiName))
            ?.map((qry) => qry.objectApiName)
            ?.join(", ") || null;

        let msg = "Some data might be missing in the record preview panel";
        if (missing) {
          msg = msg += ` for ${missing}`;
        }

        this.showToast(
          "Missing properties in Record Preview Panel",
          msg,
          "warning"
        );
      }

      this._multiObjQuery = correctQueries;
    } catch (error) {
      this.isLoading = false;
      this.showToast(
        "Error in previewRecords()() of sldsRecordViewPanel.js.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }

  // Preload hrefs to the records
  /* eslint-disable no-await-in-loop */
  /* eslint-disable consistent-return */
  async preloadSectionHrefs() {
    try {
      //console.log('in preloadSectionHrefs() of sldsRecordViewPanel.js.  !Array.isArray(this._sectionByMapKey)?: ', !Array.isArray(this._sectionByMapKey));
      if (!Array.isArray(this._sectionByMapKey)) return this._sectionByMapKey;

      // shallow clone of top-level array; we'll clone only nodes we touch
      const out = this._sectionByMapKey.map((s) => ({ ...s }));

      for (let i = 0; i < out.length; i++) {
        const section = out[i];

        // ----- MASTER RECORD -----
        if (
          section?.masterRecord?.records &&
          Array.isArray(section.masterRecord.records)
        ) {
          const newMasterRecord = { ...section.masterRecord };
          const newMasterRecords = section.masterRecord.records.map((r) => ({
            ...r
          }));

          for (let r = 0; r < newMasterRecords.length; r++) {
            const rec = newMasterRecords[r];
            if (Array.isArray(rec?.fields) && rec.fields.length) {
              rec.fields = await addPageRefsFieldsArr(rec.fields, this);
            }
          }

          newMasterRecord.records = newMasterRecords;
          section.masterRecord = newMasterRecord;
        }

        // ----- CHILD SECTIONS -----
        if (Array.isArray(section?.children) && section.children.length) {
          const newChildren = section.children.map((child) => ({ ...child }));

          for (let c = 0; c < newChildren.length; c++) {
            const child = newChildren[c];

            if (Array.isArray(child?.records) && child.records.length) {
              const newChildRecords = child.records.map((r) => ({ ...r }));

              for (let r = 0; r < newChildRecords.length; r++) {
                const rec = newChildRecords[r];
                if (Array.isArray(rec?.fields) && rec.fields.length) {
                  rec.fields = await addPageRefsFieldsArr(rec.fields, this);
                }
              }

              child.records = newChildRecords;
            }
          }

          section.children = newChildren;
        }
      }

      //console.log('here is out in preloadSectionHrefs() of  sldsRecordViewPanel.js: ', JSON.stringify(out));

      this._sectionByMapKey = out;
    } catch (error) {
      this.showToast(
        "Error in preloadSectionHrefs() of sldsRecordViewPanel.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }

  _obs;
  _resizeObs;
  _initialized = false;
  renderedCallback() {
    if (this._initialized) return;

    const scroller = this.template.querySelector('[data-id="scroller"]');
    if (!scroller) return;

    // 32px fixed toolbar (your close button row)
    scroller.style.setProperty("--toolbar-h", "0px");

    const parents = Array.from(
      this.template.querySelectorAll(".parent-header")
    );
    if (!parents.length) return;

    // helper: set CSS var to the height of the given parent header
    const setParentH = (el) => {
      if (!el) return;
      const h = Math.ceil(el.getBoundingClientRect().height); // borders included, margins excluded
      scroller.style.setProperty("--parent-h", `${h}px`);
    };

    // initial value uses the first parent header (page top)
    setParentH(parents[0]);

    // observe which parent is actually "stuck" and use *its* height
    this._obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const isStuck =
            e.intersectionRatio < 1 &&
            e.boundingClientRect.top <= (e.rootBounds?.top ?? 0) + 0.5;

          e.target.classList.toggle("is-stuck", isStuck);
          if (isStuck) setParentH(e.target);
        });

        // if none are stuck (e.g., scrolled back near top), fall back to the first
        if (!parents.some((p) => p.classList.contains("is-stuck"))) {
          setParentH(parents[0]);
        }
      },
      { root: scroller, threshold: [1] }
    );

    parents.forEach((h) => this._obs.observe(h));

    // keep the height fresh if the current header reflows (wraps text, etc.)
    this._resizeObs = new ResizeObserver(() => {
      const current =
        this.template.querySelector(".parent-header.is-stuck") || parents[0];
      setParentH(current);
    });
    parents.forEach((h) => this._resizeObs.observe(h));

    this._initialized = true;
  }

  disconnectedCallback() {
    this._obs?.disconnect();
    this._resizeObs?.disconnect();
  }

  get scrollCl() {
    return this.isLarge
      ? "scroll-section-large slds-border_top"
      : "scroll-section slds-border_top";
  }

  handleClose() {
    //console.log('IN handleClose OF SldsRecordViewPanel.js');
    this.dispatchEvent(new CustomEvent("closepanel", { detail: "" }));
  }

  @api focusFirstTabbable() {
    const firstTabbable = this.getTabbableElements()[0];
    if (firstTabbable && typeof firstTabbable.focus === "function") {
      firstTabbable.focus();
      return true;
    }
    return false;
  }
  handlePanelKeydown(event) {
    try {
      if (event.key !== "Tab") return;

      const tabbables = this.getTabbableElements();
      const firstTabbable = tabbables[0];
      const lastTabbable = tabbables[tabbables.length - 1];

      if (event.shiftKey) {
        if (!firstTabbable || event.target !== firstTabbable) return;

        event.preventDefault();
        this.dispatchPreviewPanelTabout("backward");
        return;
      }

      if (!lastTabbable || event.target !== lastTabbable) return;

      event.preventDefault();
      this.dispatchPreviewPanelTabout("forward");
    } catch (error) {
      this.showToast(
        "Error in handlePanelKeydown() of sldsRecordViewPanel.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }
  dispatchPreviewPanelTabout(direction) {
    this.dispatchEvent(
      new CustomEvent("previewpaneltabout", {
        bubbles: true,
        composed: true,
        detail: { direction }
      })
    );
  }
  getTabbableElements() {
    const selector = [
      '[tabindex="0"]',
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])"
    ].join(",");

    return Array.from(this.template.querySelectorAll(selector)).filter((el) =>
      this.isTabbableElement(el)
    );
  }
  isTabbableElement(el) {
    if (!el) return false;
    if (el.closest(".slds-hide")) return false;
    if (el.getAttribute("aria-hidden") === "true") return false;
    if (el.tabIndex < 0) return false;

    const rects = el.getClientRects?.();
    return !rects || rects.length > 0;
  }

  navigateToRecord(event) {
    try {
      event.preventDefault();
      const recordId = event?.currentTarget?.dataset?.recordId;

      if (recordId) {
        this[NavigationMixin.GenerateUrl]({
          type: "standard__recordPage",
          attributes: {
            recordId: recordId,
            actionName: "view"
          }
        }).then((url) => {
          try {
            window.open(url, "_blank");
          } catch (error) {
            this.showToast(
              "Error in handleRecordClickPromise() of sldsTableAuto.js: ",
              error
            );
          }
        });
      }
    } catch (error) {
      this.showToast(
        "Error in navigateToRecord() of sldsRecordViewPanel.js: ",
        getErrorMessage(error),
        "error"
      );
    }
  }

  // Show Toast
  showToast(title, message, variant, mode = null) {
    this.toastObj = {
      variant: variant,
      mode: mode || "dismissible",
      message: message,
      header: {
        text: title
      }
    };
  }

  showToastError(fnName, fileName, error) {
    this.toastObj = {
      header: { text: `Error in ${fnName} of ${fileName}` },
      message: getErrorMessage(error),
      variant: "error",
      mode: "dismissible"
    };
  }
}
