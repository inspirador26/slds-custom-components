/**
 * sldsPathBase — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/utils.
 * - Salesforce/platform modules: lwc.
 * - Bundle template: sldsPathBase.html; local styles: sldsPathBase.css. Salesforce SLDS styling is
 * expected.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-path-base') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - isWon (is-won): Compatibility property: marks the path's corresponding closed/outcome state; currently
 * stored/exposed but not consumed by this implementation. Declared default: false.
 *   Example: child.isWon = true;
 * - isLost (is-lost): Marks the path's corresponding closed/outcome state. Declared default: false.
 *   Example: child.isLost = true;
 * - isClosed (is-closed): Marks the path's corresponding closed/outcome state. Declared default: false.
 *   Example: child.isClosed = true;
 * - width (width): CSS width supplied to the path sizing logic.
 *   Example: child.width = "100%";
 * - coaching (coaching): Guidance keyed by step value, each containing an array of { header, text } items.
 *   Example: child.coaching = { New: [{ header: 'Review', text: 'Check the request.' }] };
 * - stepName (step-name): Name of the process field used in button text. Declared default: 'Stage'.
 *   Example: child.stepName = "Stage";
 * - customClosedLabel (custom-closed-label): Compatibility property: override text for the closed stage;
 * currently stored/exposed but not consumed by this implementation.
 *   Example: child.customClosedLabel = "Completed";
 * - currentStep (current-step): Current persisted step value; parent handles newstep and updates this
 * property.
 *   Example: child.currentStep = "New";
 * - steps (steps): Ordered path options with label and value.
 *   Example: child.steps = [{ label: 'New', value: 'New' }, { label: 'Working', value: 'Working' }];
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-slds-path-base steps={steps} current-step={stage}
 *         onnewstep={handleStep} onchangeclosed={handleClosed}></c-slds-path-base>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     steps = [{ label: 'New', value: 'New' }, { label: 'Working', value: 'Working' }, { label: 'Closed', value: 'Closed' }];
 *     stage = 'New';
 *     closedChangeRequested = false;
 *     handleStep(event) { this.stage = event.detail; }
 *     handleClosed() { this.closedChangeRequested = true; }
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Use to display process stages and request transitions. newstep.detail is the selected stage; the
 * parent owns persistence and should update current-step after a successful save. changeclosed requests
 * the parent's closed-state workflow. is-lost/is-closed alter outcome styling; is-won is currently an
 * unused compatibility flag; coaching provides per-stage guidance.
 */

/* Example Usage: 

    HTML:
        // step-name defaults to "Stage", change to "Status" for Lead
        <c-slds-path-base
            steps={statusOptions}
            current-step={currentStep}
            step-name="Stage"                   
            onnewstep={saveStage}
        ></c-slds-path-base>

    JavaScript:
        async saveStage(message) {
            const selectedStage = message.detail;
            const fields = { Id: this.recordId, Status: selectedStage };
            const recordInput = { fields };
            await updateRecord(recordInput);
        }

*/




import { LightningElement, api } from 'lwc';

import {iconMap as ICON_MAP} from 'c/utils';


// Find the index of the item in the array whose value matches <val>
const INDEX_OF_VAL = (val, arr) => {
    return val ? arr.findIndex(step => step.value === val)
        : -1
}

// Check if slds-is-active should be applied to the step
const IS_ACTIVE = (isActiveIdx, idx) => {
    return isActiveIdx === -1 ? false 
        : idx === isActiveIdx;
}

// Check if slds-is-current should be applied to the step
const IS_CURRENT = (isCurrentIdx, idx) => {
    return idx === isCurrentIdx;
}
// Check if slds-is-complete should be applied to the step
const IS_COMPLETE = (isCurrentIdx, idx, isLost) => {
    if (isLost) return false;
    return isCurrentIdx === -1 ? false
        : idx < isCurrentIdx;
}
// Check if slds-is-icomplete should be applied to the step
const IS_INCOMPLETE = (isCurrentIdx, idx, isLost) => {
    if (isLost) return true;
    return isCurrentIdx === -1 ? true 
        : idx > isCurrentIdx;
}

// Add/Remove Attributes from DOM elements
const TOGGLE_NODE_ATTRIBUTES = (nodes, attribute, activeNodeIdx, activeVal, inactiveVal) => {
    Array.from(nodes).forEach( (node, index) => {
        if (index === activeNodeIdx) {
            node.setAttribute(attribute, activeVal);
        } else {
            if (node.getAttribute(attribute) === activeVal) {
                node.setAttribute(attribute, inactiveVal);
            }
        }
    })
}
const TOGGLE_NODE_CLASS = (nodes, cl, activeNodeIdx) => {
    Array.from(nodes).forEach( (node, index) => {
        if (index === activeNodeIdx) {
            node.classList.add(cl);
        } else {
            if (node.classList.contains(cl)) {
                node.classList.remove(cl);
            }
        }
    });
}

let KEY_ID = 2837;

export default class SldsPathBase extends LightningElement {
    iconMap = ICON_MAP; // svg icons 

    isCoaching = false;
    activeCoaching;

    
    @api isWon = false;
    @api isLost = false;
    @api isClosed = false;

    _allWidths = [];
    @api 
    set width(val) {
        this._width = val;
        if (val) {
            this._allWidths = [...this._allWidths, val];
            //this.handlePathWidthV2();
        }
    }
    get width() {
        return this._width;
    }

    @api
    set coaching(val) {
        if (val) {
            this.isCoaching = true;
            this._coaching = val;
        }
    }
    get coaching() {
        return this._coaching ?? null;
    }

    @api stepName = 'Stage';

    @api customClosedLabel;

    _isNewStepVal = false;

    _tooltipText = '';

    _hasRendered = false;
    _isCurrentActive = false;
    _activeStepLabel;

    _currentStep;
    _activeStep;  // on load: current step  --->  after load: most recently clicked step 
    @api 
    set currentStep(val) {
        if (val) {
            this._currentStep = val;
            this._hasRendered = false;
        }
    }
    get currentStep() {
        return this._currentStep;
    }


    _closedLabel;
    // Path Steps
    _steps = [];
    @api 
    set steps(val) {
        KEY_ID = 2837;
        if (val && val.length) {
            this._hasRendered = false;
            this._steps = val.map(step => ({...step, keyId: KEY_ID++}));
            const closedLabel = val[val.length -1]?.label;
            if(closedLabel?.toLowerCase()?.includes('won')) {
                this._closedLabel = closedLabel.replace('Won', '').trim();
            } else if (closedLabel?.toLowerCase()?.includes('lost')) {
                this._closedLabel = closedLabel.replace('Lost', '').trim();
            } else {
                this._closedLabel = closedLabel;
            }
        } else {
            this._steps = [];
        }
    }
    get steps() {
        return this._steps || [];
    }

    // Toggle pathItems 'slds-is-active' class and pathLink 'tabindex' attribute
    handleActiveStepProperties(activeStepIdx, isFocusLink=false) {
        if (activeStepIdx ===  -1) return;

        // Get the active Stage from the steps array
        const active = this.localSteps[activeStepIdx];

        // Update button type triggers
        this._activeStep = active?.value;
        this._activeStepLabel = active?.label;
        this._isCurrentActive = active?.isCurrent;

        // Update node elements
        const pathItems = this.getNodeElements('.slds-path__item');
        const pathLinks = this.getNodeElements('.slds-path__link');
        if (pathItems) {
            TOGGLE_NODE_CLASS(pathItems, 'slds-is-active', activeStepIdx);
        }
        if (pathLinks) {
            TOGGLE_NODE_ATTRIBUTES(pathLinks, "tabindex", activeStepIdx, "0", "-1");

            if (this.isCoaching) {
                TOGGLE_NODE_ATTRIBUTES(pathItems, 'aria-selected', activeStepIdx);
            }

            if (isFocusLink) {
                const focusedLink = pathLinks[activeStepIdx];
                if (focusedLink) {
                    focusedLink.focus();
                }
            }   
        }

        if (this.isCoaching && this.coaching) {
            this.activeCoaching = this.coaching[this._activeStep] || null;
        }
    }


    _regionCl = 'path-region';
    windowWidth;
    _boundHandleResize;
    _resizeTimeout;
    connectedCallback() {
        this._boundHandleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this._boundHandleResize);
        this.handleResize(); // initial measurement
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this._boundHandleResize);
    }

    handleResize() {
        clearTimeout(this._resizeTimeout);

        this._resizeTimeout = setTimeout(() => {
            const w = window.innerWidth;
            if (w === this.windowWidth) return;
            this.windowWidth = w;

            const host = this.template.host;
            if (host) {
                host.style.setProperty('--path-width', `calc(${w}px - 4rem)`);
            }

            if (w >= 360 && w <= 564) {
                this._regionCl = 'path-region slds-region_small';
            } else if (w >= 565 && w <= 1280) {
                this._regionCl = 'path-region slds-region_medium';
            } else {
                this._regionCl = 'path-region';
            }
        }, 120); // 100–150ms is the sweet spot
    }

    // Set current step as active on load
    renderedCallback() {
        if (!this._hasRendered && this.localSteps.length && this._currentStep) {
            if (this._currentStep) {
                const currentIdx = this.localSteps.findIndex(step => step.value === this._currentStep);
                this.handleActiveStepProperties(currentIdx);
            }
            this._hasRendered = true;
        }

        if (this.isClosed) {
            const current = this.template.querySelector('.slds-is-current');
            const closedCl = this.isLost ? 'slds-is-lost' : 'slds-is-won';
            if (current) {
                current.classList.add(closedCl);
            }
        
        }
    }
    


    // Add isActive, isCurrent, isComplete, isIncomplete booleans to the Steps array
    get localSteps() {
        if (this._steps?.length) {
            // Get current step index
            const isCurrentIdx = INDEX_OF_VAL(this._currentStep, this._steps);
            const lost = this.isLost; 
            // Add Boolean properties to the steps
            return this._steps.map((step, index) => {

                return {
                    ...step,
                    isCurrent: IS_CURRENT(isCurrentIdx, index),
                    isComplete: IS_COMPLETE(isCurrentIdx, index, lost),
                    isIncomplete: IS_INCOMPLETE(isCurrentIdx, index, lost),
                };
            });

        }
        return [];
    }

    // ================ Active Step Navigation ================ \\
    // Change active step properties
    handleStepClick(event) {
        event.preventDefault();
        event.stopPropagation();

        // Get the click <a> element
        const pathLink = event.currentTarget;

        if (pathLink) {
            // Get the link's parent <li> element
            const pathItem = pathLink.closest('.slds-path__item');

            if (pathItem) {
                // Get the index of the <li> element
                const index = pathItem.dataset.index;
                // convert index to number
                const idx = Number(index);

                // DON'T do `if (index)` because 0 is falsy
                if (!Number.isNaN(idx)) {
                    // Update node properties of tabIndex and slds-is-active 
                    this.handleActiveStepProperties(idx);
                }
            }
            // Focus the clicked path item
            pathLink.focus();
        }
    }
    // Handle left and right arrow keys on the Stages
    handleKeyDown(event) {
        const { key } = event;
        if (key !== 'ArrowRight' && key !== 'ArrowLeft') {
            return;
        }

        event.preventDefault();

        // current active node in DOM
        const activeStepNode = this.template.querySelector('.slds-path__item.slds-is-active');
        if (!activeStepNode) return;

        const activeIdxStr = activeStepNode.dataset.index;
        if (activeIdxStr === undefined) return;

        const currentIdx = Number(activeIdxStr);
        if (Number.isNaN(currentIdx)) return;

        const total = this.steps.length;
        const lastIdx = total - 1;

        let nextIdx;

        if (key === 'ArrowRight') {
            // wrap to 0 if we're at the end
            nextIdx = currentIdx === lastIdx ? 0 : currentIdx + 1;
        } else {
            // ArrowLeft — wrap to last if we're at 0
            nextIdx = currentIdx === 0 ? lastIdx : currentIdx - 1;
        }
        // 4) update UI + state
        this.handleActiveStepProperties(nextIdx, true);
    }
    // ========================================================= \\

    toggleCoaching(event) {
        const coachingBtn = event?.currentTarget?.closest('button');

        if (coachingBtn) {
            const isExpanded = coachingBtn.getAttribute('aria-expanded') === "true";
            const pathContent = this.template.querySelector('.slds-path__content');
            const pathWrapper = this.template.querySelector('slds-path');

            if (isExpanded) {
                coachingBtn.classList.remove('slds-path__trigger_open');
                coachingBtn.setAttribute('aria-expanded', "false");
                if (pathContent) {
                    pathContent.classList.add('slds-is-collapsed');
                }
                if (pathWrapper) {
                    pathWrapper.classList.remove('slds-is-expanded');
                }
            } else {
                coachingBtn.classList.add('slds-path__trigger_open');
                coachingBtn.setAttribute('aria-expanded', "true");
                if (pathContent) {
                    pathContent.classList.remove('slds-is-collapsed');
                }
                
                if (pathWrapper) {
                    pathWrapper.classList.add('slds-is-expanded');
                }
            }
        }
    }



    // ========== TOOLTIP STUFF ========== \\
    showTooltip(event) {
        const li = event.currentTarget;
        const index = Number(li.dataset.index);
        if (Number.isNaN(index)) return;

        const step = this.localSteps[index];
        this._tooltipText = step?.label ?? '';

        const tooltip = this.template.querySelector('[data-el="tooltip"]');
        if (!tooltip) return;

        tooltip.classList.remove('slds-hide');
        tooltip.classList.add('slds-show');

        // Wait for DOM to update before measuring
        requestAnimationFrame(() => {
            const liRect = li.getBoundingClientRect();
            const tipRect = tooltip.getBoundingClientRect();

            const left = liRect.left + liRect.width / 2 - tipRect.width / 2;
            const top = liRect.bottom + 9;

            tooltip.style.position = 'fixed';
            tooltip.style.left = `${Math.max(4, Math.min(left, window.innerWidth - tipRect.width - 4))}px`;
            tooltip.style.top = `${top}px`;
            tooltip.style.zIndex = 9999;
        });
    }
    hideTooltip() {
        const tooltip = this.template.querySelector('[data-el="tooltip"]');
        if (!tooltip) return;
        tooltip.classList.replace('slds-show', 'slds-hide');
    }   
    // =================================== \\


    // use querySelectorAll to get all elements by selector
    getNodeElements(selector) {
        return this.template.querySelectorAll(selector);
    }

    // Send Button click event to parent
    sendNewStage() {
        if (this._isCurrentActive) {
            const currentIdx = this.localSteps.findIndex(step => step.value === this._currentStep);
            this._activeStep = this.localSteps[currentIdx + 1].value;
        }

        if (this._activeStep) {
            this.dispatchEvent(new CustomEvent('newstep', { detail: this._activeStep } ));
        } 
    }

    changeClosedStage() {
        this.dispatchEvent(new CustomEvent('changeclosed', { detail: 'changeclosed' } ));
    }

}