import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import {iconMap as ICON_MAP, isCommunitySetting} from 'c/utils';
const VARIANTS = ['notify', 'success', 'warning', 'error'];
const MODES = ['pester', 'dismissible', 'sticky'];

/* LWC Checklist
    1. Load on any DB with spinner (full visualization at all times)
    2. 

*/


/*
    Usage (with Record Id): 
        this.toastObj = { 
            variant: 'success', 
            mode: 'sticky', 
            header: { 
                recordId: newOpp.Id, 
                recordName: 'here',
                linkPrefix: 'Lead successfully converted.  View new Opportunity',
                text: '.'
            }        
        };
        
*/

export default class ToastLwc extends NavigationMixin(LightningElement) {
    @track _isClose = false;
    @track iconMap = ICON_MAP;
    @api variant = 'notify';
    @api mode = 'dismissible';

    _isCloseMouseOver = false;

    @api autoCloseMs; // optional override; if set, use this regardless of mode
     _timerId;
    _hoverPaused = false;

    @api 
    set topOffset(value) {
        this._topOffset = value;
        if (value) {
            this._applyVarsDirect('--toast-top-offset', value);
        }
    } 
    get topOffset() {
        return this._topOffset;
    }


    _startTimer() {
        if (this._isClose) {
            return;
        }
        this._clearTimer();
        const ms = this._computedTimeout;
        if (!ms) return;

        this._timerId = window.setTimeout(() => {
            if (!this.isConnected) return;

            if (this._hoverPaused || this._isClose || this._isCloseMouseOver) {
                return;
            }

            this._isClose = true;
            this._timerId = null;
        }, ms);
    }

    _clearTimer() {
        if (this._timerId) {
            clearTimeout(this._timerId);
            this._timerId = null;
        }
    }

    _pauseTimer = () => {
        if (this._isClose) {
            return;
        }
        this._hoverPaused = true;
        this._clearTimer();
    };

    _resumeTimer = () => {
        if (this._isClose) {
            return;
        }
        if (!this._hoverPaused) {
            return;
        }
        this._hoverPaused = false;
        this._startTimer();
    };
    

    // ================== Main Property ================== \\
    @api objectApiName;  // Need object api name for navigation mixin
    @track _header;
    // holds generated URL
    @track _headerUrl;   

    @api
    set header(value) {
        if (value && typeof value === 'object') {
            this._isClose = false;
            this._header = {
                recordId: value.recordId,
                recordName: value.recordName,
                linkPrefix: value.linkPrefix,
                objectApiName: value.objectApiName ?? null,
                text: value.text
            };

            this._buildHeaderUrl();

            if (!this._isClose && !this._isCloseMouseOver) {
                this._hoverPaused = false;
                this._clearTimer();
                //console.log('********** calling _startTimer() in set header() of toast lwc');
                this._startTimer();
            }
        } else {
            this._header = undefined;
            this._headerUrl = undefined;
            this._clearTimer();
        }
    }

    get header() {
        return this._header;
    }

    get headerUrl() {
        return this._headerUrl;
    }
    // =================================================== \\

    _message;
    @api
    set message(v) {
        this._message = v;
        this._isClose = false;
        if (v) {
            this._hoverPaused = false;
            this._clearTimer();
            this._startTimer();
        }
    }
    get message() { return this._message; }

    get isClose() {
        return this._isClose;
    }

    get notifyCl() {
        const base = 'slds-notify slds-notify_toast';
        const out  = { toastCl: base, iconName: 'utility:info' };

        const v = (this.variant || 'notify').toLowerCase();
        if (v === 'success') {
            out.toastCl = `${base} slds-theme_success`;
            out.iconName = 'utility:success';
        } else if (v === 'error') {
            out.toastCl = `${base} slds-theme_error`;
            out.iconName = 'utility:error';
        } else if (v === 'warning') {
            out.toastCl = `${base} slds-theme_warning`;
            out.iconName = 'utility:warning';
        }
        return out;
    }

    handleClose(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (this._isClose) {
            // already closed, do nothing
            return;
        }

        this._clearTimer();
        this._hoverPaused = false;
        this._isClose = true;
    }



    _buildHeaderUrl() {
        if (!this._header?.recordId || (!this.objectApiName && !this._header.objectApiName)) {
            this._headerUrl = undefined;
            return;
        }   

        const headerArr = [this._header];

        const pageRefs = headerArr.map(rec => ({
            type: 'standard__recordPage',
            attributes: {
                recordId: rec.recordId,
                objectApiName: rec.objectApiName,
                actionName: 'view'
            }
        }));

        Promise.resolve().then(async () => {
            const urls = await Promise.all(
                pageRefs.map(pr => this[NavigationMixin.GenerateUrl](pr))
            );
            if (urls?.length) {
                if (urls?.[0]?.startsWith('javascript')) {
                    this._headerUrl = undefined
                } else {
                    this._headerUrl = urls[0] ?? undefined;                    
                }
            }
        });
    }


    _didRender = false;
    renderedCallback() {
        if (!this._didRender) {
            if (isCommunitySetting()) {
                this._applyVarsDirect('--toast-top-offset', '150px');
            } else {
                this._applyVarsDirect('--toast-top-offset', '90px');
            }
            this._didRender = true;
        }
    }

    // NEW: does this toast render a link?
    get hasLink() {
        // anchor shows when header.recordId exists; support header.url too if you ever add it
        return this._headerUrl && this._headerUrl !== undefined;
    }

    // Replace your _computedTimeout getter with this:
    get _computedTimeout() {
        if (Number.isFinite(this.autoCloseMs)) return this.autoCloseMs; // explicit override wins
        const m = (this.mode || 'dismissible').toLowerCase();
        if (m === 'sticky') return 0;            // never auto-close
        if (m === 'pester') return 8000;         // keep your prior default
        // dismissible (and anything else): 4.8s without link, 9.6s with link
        return this.hasLink ? 9600 : 4800;
    }

    
    /* NEW TAB
    handleRecordClick(event) {
        event.preventDefault();
        const recId = event.currentTarget?.dataset?.recordId;
        if (!recId) return;

        const pageRef = {
            type: 'standard__recordPage',
            attributes: {
            recordId: recId,
            objectApiName: this.objectApiName || 'Lead',
            actionName: 'view'
            }
        };

        this[NavigationMixin.GenerateUrl](pageRef).then((url) => {
            // Must be in direct response to the click to avoid popup blockers
            const win = window.open(url, '_blank', 'noopener');
            if (!win) {
            // Fallback: same-tab navigate if popup blocked
            this[NavigationMixin.Navigate](pageRef);
            }
        });
    }
    */


    // Apply Styles to the host 👉 Can pass 1.Array of Arrays   2.Array of Object   3.Strings
    _applyVarsDirect(cssVar, varStyle=null) {

        // Check that CSS var starts with '--' and has a non-null stlye 
        const isValid = (cssVarP, varStyleP) => {
            return typeof cssVarP === 'string' && 
                typeof varStyleP === 'string' &&
                cssVarP?.startsWith('--') && 
                varStyleP;
        }

        // Get Host elements
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

}