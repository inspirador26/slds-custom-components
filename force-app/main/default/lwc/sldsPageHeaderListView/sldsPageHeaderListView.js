import { LightningElement, api } from 'lwc';

import { 
    getErrorMessage, 
    isValidProperty, 
    iconByDataType, 
    iconMap as ICON_MAP, 
    formatTimeAgo,
    getCleanMetaDataLabels,
    iconPath, 
    isCommunitySetting,
    getNotSearchableFieldNames,
} from 'c/utils';


function handleSortByObject(sortedBy) {

    if (Array.isArray(sortedBy)) {
        const infos = sortedBy.map(s => {
            const sLabel = s?.label;
            const sFieldApiName = s?.fieldName ?? s?.fieldApiName;
            if (!sLabel && !sFieldApiName) return null;

            return sLabel ?? getCleanMetaDataLabels(sFieldApiName);

        }).filter(Boolean);

        return !infos.length 
            ? ''
            : ` • Sorted by ${infos.join(', ')}`;
    }

    const label = sortedBy?.label;
    if (!label) {
        const fieldApiName = sortedBy?.fieldName ?? sortedBy?.fieldApiName;

        return !fieldApiName 
            ? ''
            : ` • Sorted by ${getCleanMetaDataLabels(fieldApiName)}`;
    } 
    return ` • Sorted by ${label}`;
}


const SUPPRESS_BORDER_TOP_CONFIG = [
    ['--border-top', 'none'],
    ['--c-border-radius', '0px']
];


// Find matching option when setting grouped options / current value
function findCurrentListView(groupedOptions, listViewTitle) {
    if (!groupedOptions?.length) {
        return listViewTitle;
    }
    
    if (groupedOptions?.length && listViewTitle) {
        return (groupedOptions ?? [])
            .flatMap(obj => obj?.options ?? [])
            .filter(Boolean)
            .find(flatObj => 
                flatObj?.value === listViewTitle || flatObj.label === listViewTitle
            )?.value ?? null;
    }
    return null;
}


// Display warning for columns that are not DB searchable 
function getCleanListOfLabels(arr, singleAfterMsg, multiAfterMsg) {
    if (!arr.length) return null;
    if (arr.length === 1) {
        return `${arr[0]} ${singleAfterMsg}`;
    }
    const lastItem = arr[arr.length -1];
    const allButLast = arr.slice(0, -1);
    return `${allButLast.join(', ')} and ${lastItem} ${multiAfterMsg}`;
}

const HELP_LABELS_MAP = {
    notSearchable: {
        single: 'is not searchable.  Use filters or sort on this field instead.',
        multiple: 'are not searchable.  Use filters or sort on these fields instead.'
    },
    notSearchableNotFilterable: {
        single: 'is not searchable/filterable.  Use sorting on this field instead.',
        multiple: 'are not searchable/filterable.  Use sorting on these fields instead.'
    },
    notSearchableNotSortable: {
        single: 'is not searchable/sortable.  Use filters on this field instead.',
        multiple: 'are not searchable/sortable.  Use filters on these fields instead.'
    },
    notSearchableNotSortableNotFilterable: {
        single: 'is not searchable/sortable/filterable.',
        multiple: 'are not searchable/sortable/filterable.',
    },
};
// Parse unsearchable columns to create help message in search this list input 
function getUnsearchableHelp(columns, isDbControlled, isSfListApi) {
    if (!columns?.length || (!isDbControlled && !isSfListApi)) return null;

    const infosObj = {
        notSearchable: getNotSearchableFieldNames(columns, isDbControlled, isSfListApi),
        notSortable: columns.filter(col => col?.notSortable).map(col => col.fieldName),
        notFilterable: columns.filter(col => col?.notFilterable).map(col => col.fieldName),
    };
    
    const colLabelByFieldName = Object.fromEntries(
        columns.map(col => [col.fieldName, col.label])
    );
    
    const allFieldsUnique = Array.from(
        new Set( Object.values(infosObj).flat() )
    );

    const resObj = {
        notSearchable: [],
        notSearchableNotFilterable: [],
        notSearchableNotSortable: [],
        notSearchableNotSortableNotFilterable: [],
    };
    
    allFieldsUnique.forEach(f => {
        const notSearchable = infosObj.notSearchable.includes(f)
        const notFilterable = infosObj.notFilterable.includes(f);
        const notSortable = infosObj.notSortable.includes(f)
        
        if (notSearchable) {
            const label = colLabelByFieldName?.[f] ?? null;
            if (label) {
                if (notFilterable && notSortable) {
                    resObj.notSearchableNotSortableNotFilterable.push(label);
                } else if (notFilterable) {
                    resObj.notSearchableNotFilterable.push(label);
                } else if (notSortable) {
                    resObj.notSearchableNotSortable.push(label);
                } else {
                    resObj.notSearchable.push(label);
                }
            }
        }
    });

    const resArr = Object.entries(resObj).filter(([k, v]) => v?.length)
        .map(([k, vArr]) => (
            getCleanListOfLabels(vArr, HELP_LABELS_MAP?.[k]?.single, HELP_LABELS_MAP?.[k]?.multiple,)
        )
    ).filter(Boolean);

    return resArr?.length && resArr.length === 1
        ? resArr[0]
        : resArr?.length > 1 ? resArr 
        : null;
}

export default class SldsPageHeaderListView extends LightningElement {
    iconMap = ICON_MAP;

    lastRefreshed = new Date();
    currentTime = new Date(); // Continuously updated "now"
    _intervalId;
    
    isLoading = false;
    _filteredBy;
    
    _groupedOptions;
    _additionalInfo;
    iconTitleContainer;

    _lastFocusedEl;
    
    @api suppressSort = false;
    @api suppressCharts = false;
    @api suppressFilter = false;
    @api suppressSettings = false; 
    @api suppressViewOptions = false;
    @api suppressOverflowMenu = false;
    @api suppressEdit = false;
    @api suppressNewRecord = false;

    iconSvgCl = 'slds-icon slds-page-header__icon';

    @api sendCheckedLabel;

    @api 
    set borderRadius(val) {
        this._borderRadius = val;
        if (val) {
            this._applyVarsDirect('--c-border-radius', val);
        }
    }
    get borderRadius() {
        return this._borderRadius ?? 'var(--slds-g-radius-border-1, 0.25rem)';
    }

    @api // Define the list view actions that should be displayed
    set listViewActions(value) {
        this._listViewActions = value;
    }
    get listViewActions() {s
        return this._listViewActions;
    }
    @api // iconType: '<utility/custom/etc.>' iconName: '<iconName>'  ---++  define iconTitleContainer also here 
    set iconConfig(value) {
        if (value) {
            const iconContainerClass = value.iconName.includes('_') 
                ? value.iconName.replaceAll('_', '-') 
                : value.iconName 
            
            if (isValidProperty('iconClass', value)) {
                this.iconSvgCl = `slds-icon slds-page-header__icon ${value.iconClass}`;
                this.iconTitleContainer = `slds-icon_container slds-icon-${value.iconType}-${iconContainerClass} ${value.iconClass}`;
            } else {
                this.iconTitleContainer = `slds-icon_container slds-icon-${value.iconType}-${iconContainerClass}`;
            }
        }
        //this._iconConfig = `/dist/icons/${value.iconType}-sprite/svg/symbols.svg#${value.iconName}`
        this._iconConfig = this.iconMap[value.iconType][value.iconName];
    }
    get iconConfig() {
        return this._iconConfig;
    }
    @api 
    set listViewOptions(value) {
        this._listViewOptions = value;
    }
    get listViewOptions() {
        return this._listViewOptions;
    }
    _sortedBy = '';
    @api 
    set sortedBy(value) {
        if (value) {
            if (typeof value === 'string') {
                this._sortedBy = value;
            } else {
                this._sortedBy = this._sortedBy = handleSortByObject(value);
            }
        } else {
            this._sortedBy = '';
        }

    }
    get sortedBy() {
        return this._sortedBy;
    }
    @api  // Label what the table is filtered by
    set filteredBy(value) {
        this._filteredBy = value;
    }
    get filteredBy() {
        return this._filteredBy;
    }
    @api // The "Change List View" Options
    set groupedOptions(value) {
        this._groupedOptions = value ? JSON.parse(JSON.stringify(value)) : [];
        this._currentListView = findCurrentListView(value, this._currentListView);
    }
    get groupedOptions() {
        return this._groupedOptions || [];
    }
    @api 
    set additionalInfo(value) {
        this._additionalInfo = value;
    }
    get additionalInfo() {
        return this._additionalInfo;
    }
    @api 
    set displayTypeOptions(value) {
        this._displayTypeOptions = value;
    } 
    get displayTypeOptions() {
        return this._displayTypeOptions;
    }
    
    _settingsOptions = [];
    @api 
    set settingsOptions(value) {
        this._settingsOptions = value;
    }
    get settingsOptions() {
        return this._settingsOptions;
    }

    @api listViewEditable = false;

    @api objectLabel;
    @api listLength;
    @api selectedListViewValue;
    @api pageLabel;
    _listViewTrigger;
    
    // Current List View value from <this.groupedOptions>
    _currentListView;
    @api 
    set currentListView(val) {
        this._currentListView = findCurrentListView(this._groupedOptions ?? [], val);
    }
    get currentListView() {
        return this._currentListView;
    }   

    @api 
    set isSfListApi(val) {
        this._isSfListApi = !!val;
        this.searchFocusHelp = getUnsearchableHelp(this.columns, this.isDbControlled, !!val);
    }
    get isSfListApi() {
        return !!this._isSfListApi;
    }

    @api // Search should be limited if table is controlled by Apex instead of JS
    set isDbControlled(val) {
        this._isDbControlled = !!val;
        this.searchFocusHelp = getUnsearchableHelp(this.columns, !!val, this.isSfListApi);
    }
    get isDbControlled() {
        return !!this._isDbControlled;
    }

    searchFocusHelp;
    @api // Search columns sent from parent to find unsearchable columns 
    set columns(val) {
        const cols = (val ?? []).map(col => {
            return col?.dtype 
                ? col 
                : {...col, dtype: 'text'};
        });
        this._columns = cols
        this.searchFocusHelp = getUnsearchableHelp(cols, this.isDbControlled, this.isSfListApi);
    }
    get columns() {
        return this._columns ?? [];
    }

    isCommunity = isCommunitySetting();



    connectedCallback() {
        // Update currentTime every 10 seconds (adjust as needed)
        this._intervalId = setInterval( () => {this.currentTime = new Date();}, 10000 );
    }
    // Remove Last Refreshed Polling Interval
    disconnectedCallback() {
        // Clear interval when component is removed
        if (this._intervalId) {
            clearInterval(this._intervalId);
        }
    }   

    // Community styles
    get containerCl() {
        return this.isCommunity ? 'community-config' : '';
    }

    get pageHeaderCl() {
        return this.isCommunity 
            ? 'slds-page-header slds-p-bottom_x-small slds-p-top_small'
            : 'slds-page-header slds-p-bottom_x-small slds-p-top_small'
    }

    //  Handle Menu buttons selection
    handleControlsSelction(message) {
        const detail= message.detail;

        // ***** detail can have id  ******
        if (typeof detail === 'object' && detail.id) {
            const id = detail.id
            const action = detail.selection
        } 
    }
    // Set Table Column Widths back to original width
    resetColumnWidths(event) {
        this._lastFocusedEl = event.target;
        this.dispatchEvent(new CustomEvent('resetcolumnwidths', { detail: {} } ));
    }
    // Handle New Record
    handleNew(event) {
        this._lastFocusedEl = event.target;
        this.dispatchEvent(new CustomEvent('newrecord', { detail: {} } ));
    }

    
    // Display the currently selected list view's title
    get listViewTitle() {

        if (this._currentListView && !this._groupedOptions?.length) {
            return this._currentListView;
        }

        if (this._currentListView && this._groupedOptions?.length) {
            for (const group of this._groupedOptions) {
                const val = group?.options?.find(opt => opt?.value === this._currentListView) 
                if (val?.label) {
                    return val.label;
                }
            }
        }
    }
    // Display the label of the currently selected listview  --> default to first option if no @api selectedListViewValue  not provided
    get selectedListViewLabel() {
        if (this.listViewOptions) {
            return this.selectedListViewValue 
                ? this.listViewOptions.find(option => this.selectedListViewValue === option.value).label
                : this.listViewOptions[0].label;
        }
    }
    // Display the 'New' Button Label by replacing the plural label's "s" or "ies" with singular label
    get newButtonLabel() {
        if (this.objectLabel) {
            return this.objectLabel.endsWith('ies') 
                ? `New ${this.objectLabel.slice(0,-3)}y`
                    : this.objectLabel.endsWith('s') 
                ? `New ${this.objectLabel.slice(0,-1)}`
                : `New ${this.objectLabel}`;
        }
        if (this.pageLabel) {
            return this.pageLabel.endsWith('ies') 
                ? `New ${this.pageLabel.slice(0,-3)}y`
                    : this.pageLabel.endsWith('s') 
                ? `New ${this.pageLabel.slice(0,-1)}`
                : `New ${this.pageLabel}`;
        }
    }

    get suppressBottomRow() {
        return [
            this.suppressCharts,
            this.suppressFilter,
            this.suppressSettings,
            this.suppressViewOptions,
            this.suppressNewRecord
        ].every(prop => prop);
    }



    // Close the popover combobox
    closeListViewOptions() {
        this._listViewTrigger.classList.remove('slds-is-open');
        this.template.querySelector('[data-id="popoverEdit"]').classList.add('slds-hide');
    }


    get headerCl() {
        return this.groupedOptions?.length 
            ? 'slds-page-header__name slds-type-focus triggerLink'
            : 'slds-page-header__name';
    }

    _isOpen = false;
    openPopover() {
        this._isOpen = true;
        this._listViewTrigger.classList.add('slds-is-open');
        const popoverEdit = this?.refs?.popoverEdit;    
        popoverEdit.classList.remove('slds-hide');
        requestAnimationFrame(() => this.positionPopover());
        window.addEventListener('scroll', this._onScroll, true);
        window.addEventListener('resize', this._onResize);
        this.positionPopover();
        setTimeout(() => {
            this.template.querySelector('c-slds-combobox-grouped').focusOpenMe();
        });
        
    }
    positionPopover() {
        const title = this?.refs?.listViewTitle;
        const pop = this?.refs?.popoverEdit;
        if (!title || !pop) return;
        const r = title.getBoundingClientRect();
        pop.style.position = 'fixed';
        pop.style.top  = `${Math.round(r.bottom)}px`;
        pop.style.left = `${Math.round(r.left)}px`;
    }
    _onScroll = () => { if (this._isOpen) this.positionPopover(); };
    _onResize = () => { if (this._isOpen) this.positionPopover(); };

    closePopover() {
        this._isOpen = false;
        this._listViewTrigger.classList.remove('slds-is-open');
        const pop = this?.refs?.popoverEdit;
        if (pop) {
            pop.classList.add('slds-hide');
        }
        window.removeEventListener('scroll', this._onScroll, true);
        window.removeEventListener('resize', this._onResize);
        this.focusListViewsButton(true);
    }

    handleSendCheckedRows() {
        this.dispatchEvent(new CustomEvent('sendcheckedrows', { 
            detail: 'sendcheckedrows',
            bubbles: true,
            composed: true
        }));
    }

    handleLinkClick(event) {
        this._lastFocusedEl = event.target;
        event.preventDefault();
        event.stopPropagation();
        this.toggleListViewOptions();
    }

    // Display the "Change List View" options
    toggleListViewOptions(event=null) {
        try {
            if (event) {
                this._lastFocusedEl = event.target;
            }
            if (!this._listViewTrigger) {
                this._listViewTrigger = this?.refs?.listViewTrigger;
            }

            if (this._listViewTrigger) {
                const isOpening = !this._listViewTrigger.classList.contains('slds-is-open');

                if (isOpening) {
                    this.openPopover();
                } else {
                    this.closePopover();
                }

            } 
        }catch(error) {
            console.error('sldsPageHeaderListView --> toggleListViewOptions()', error);
        }
    }
    // Handle the List View Value Custom Event sent by 'x-slds-combobox-grouped'
    handleNewListViewP(message) {
        // Get the new list view value from event sent by 'x-slds-combobox-grouped'
        const selection = message.detail.selection;

        // Hide the popover
        this.template.querySelector('[data-id="popoverEdit"]').classList.add('slds-hide');
        
        this._listViewTrigger.classList.remove('slds-is-open');
        
        if (selection && selection !== this._currentListView) {
            // Update the the current list view
            this._currentListView = typeof selection === 'object'
                ? selection.value
                : selection;

            this.dispatchEvent(new CustomEvent('listviewchange', { 
                detail: this._currentListView,
                bubbles: true,
                composed: true,
            } ));
        }

        this.focusListViewsButton(true);
    }

    focusListViewsButton(isAnimationFrame=false) {
        const btn = this?.refs?.listViewsButton;
        //console.log('here is active element: ', active);
        if (btn) {
            if (isAnimationFrame) {
                requestAnimationFrame(() => {btn.focus();})
            } else {
                btn.focus();
            }
        }
    }

    handleSettingsSelection(message) {
        try {
            const settingsButton = this?.refs?.settingsSelection;
            if (settingsButton) {
                this._lastFocusedEl = settingsButton;
            }
            const { id = null, selection = null } = message?.detail || {}; 
            this.dispatchEvent(new CustomEvent('settingsselected', { detail: selection} ));
        } catch(error) {
            this.showToast('Error in handleSettingsSelection() of sldsPageHeaderListView.js', getErrorMessage(error), 'error');
        }
    }

    handleSelection(event) {
        try {
            const selectionType = event.target.dataset.type;
            this.dispatchEvent(new CustomEvent('selection', { detail: {id: selectionType} } ));
        } catch(error) {
            this.showToast('Error in handleSelection() of sldsPageHeaderListView.js', getErrorMessage(error), 'error');
        }
    }

    dispatchFilter(event) {
        try {
            this._lastFocusedEl = event.target;
            this.dispatchEvent(new CustomEvent('filter', { detail: 'filter' } ));
        } catch(error) {
            this.showToast('Error in dispatchFilter() of sldsPageHeaderListView.js', getErrorMessage(error), 'error');
        }
    }

    @api focusMe() {
        if (this._lastFocusedEl) {
            this._lastFocusedEl.focus();
        }
    }
    @api resetLastRefresh() {
        this.lastRefreshed = new Date();
        this.currentTime = new Date();
    }
    callRefresh() {
        // Update the last refreshed date to "now"
        this.resetLastRefresh();
        this.dispatchEvent(new CustomEvent('refresh', {
            detail: '',
            bubbles: true,
            composed: true
        }));
    }

    callSort(event) {
        this._lastFocusedEl = event.target;
        this.dispatchEvent(new CustomEvent('editsort', { detail: 'editsort' } ));
    }

    // A getter that returns "x seconds ago", "10 minutes ago", etc.
    get lastRefreshedTimeAgo() {
        if (!this.lastRefreshed) {
            return '';
        }
        return formatTimeAgo(this.lastRefreshed, this.currentTime);
    }

    // Apply Styles to the host 👉 Can pass 1.Array of Arrays   2.Array of Object   3.Strings
    _applyVarsDirect(cssVar, varStyle=null) {

        // Check that CSS var starts with '--' and has a non-null stlye 
        const isValid = (cssVarP, varStyleP) => {
            return typeof cssVarP === 'string' && 
                typeof varStyleP === 'string' &&
                cssVarP?.startsWith('--') && 
                varStyleP;
        }



        const el = this.template.host;
        
        if (Array.isArray(cssVar)) {
            // Handle Array of vars
            cssVar.forEach(hostVar => {
                if (Array.isArray(hostVar) && isValid(hostVar[0], hostVar[1])) {
                    // Handle Array structure  (CSS var at index 0)
                    el.style.setProperty(hostVar[0], hostVar[1]);
                } else if (typeof hostVar === 'object' && isValid(hostVar.cssVar, hostVar.varStyle)) {
                    // Handle Object structure (cssVar & varStyle keys)
                    el.style.setProperty(hostVar.cssVar, hostVar.varStyle)
                }
            });
        } else if (isValid(cssVar, varStyle)) {
            // Handle string arguments
            el.style.setProperty(cssVar,  varStyle);
        }
    }

    get isButtonGroup() {
        return [
            this.suppressNewRecord === false, 
            this.sendCheckedLabel, 
            this.suppressOverflowMenu === false
        ].filter(Boolean)?.length >= 1;
    }
    get isIconButtonGroup() {
        return [
            this.suppressFilter === false, 
            this.suppressCharts === false
        ].filter(Boolean).length > 1;
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