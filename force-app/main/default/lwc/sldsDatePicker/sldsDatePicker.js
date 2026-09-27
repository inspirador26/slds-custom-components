/**
 * sldsDatePicker — parent integration guide
 *
 * 1. Dependencies
 * - JavaScript modules: c/utils.
 * - Salesforce/platform modules: lwc.
 * - Template children (including conditional UI): c-toast-lwc.
 * - Bundle template: sldsDatePicker.html; local styles: sldsDatePicker.css. Salesforce SLDS styling is
 * expected.
 *
 * 2. Public properties
 * Names below are JavaScript names; use kebab-case attributes in parent HTML.
 * Examples use child = this.template.querySelector('c-slds-date-picker') after render.
 * Pass booleans as {trueFlag}/{falseFlag}
 * bindings; do not use the literal attribute string "false" for boolean fields.
 * - alwaysFlip (always-flip): Forces the calendar's upward flip behavior. Declared default: false.
 *   Example: child.alwaysFlip = true;
 * - portal (portal): Uses the calendar's portal positioning behavior to escape clipping. Declared default:
 * false.
 *   Example: child.portal = true;
 * - fullVariant (full-variant): Uses the full calendar variant with borderless input styling.
 *   Example: child.fullVariant = true;
 * - suppressIconButton (suppress-icon-button): Hides the calendar icon button.
 *   Example: child.suppressIconButton = true;
 * - label (label): Visible control label.
 *   Example: child.label = "Status";
 * - placeHolder (place-holder): Prompt shown when the input has no selection or text.
 *   Example: child.placeHolder = "Select an option";
 * - dropdownDirection (dropdown-direction): Calendar alignment: left maps to right-aligned, right to
 * left-aligned, top to top dropdown class.
 *   Example: child.dropdownDirection = "left";
 * - isMultiSelect (is-multi-select): Keeps the calendar open after selecting a date; events still contain
 * one date. Declared default: false.
 *   Example: child.isMultiSelect = true;
 * - isRequired (is-required): Marks the control as required; validation behavior is component-specific.
 *   Example: child.isRequired = true;
 * - currentValue (current-value): Date input normalized for display; use an ISO date and read
 * change.detail.value for ISO output.
 *   Example: child.currentValue = "2026-10-01";
 * - minDate (min-date): Earliest allowed date; accepts a date value or the special string today.
 *   Example: child.minDate = "today";
 * - maxDate (max-date): Latest allowed date.
 *   Example: child.maxDate = "2027-12-31";
 * - suppressBorder (suppress-border): Removes the input border.
 *   Example: child.suppressBorder = true;
 * - inputHeight (input-height): CSS input/control height, including units.
 *   Example: child.inputHeight = "2rem";
 * - borderRadius (border-radius): CSS corner radius, including units.
 *   Example: child.borderRadius = "0.25rem";
 * - fontSize (font-size): CSS text size, including units.
 *   Example: child.fontSize = "0.875rem";
 * - suppressFlip (suppress-flip): Disables automatic calendar flipping. Declared default: false.
 *   Example: child.suppressFlip = true;
 * - unified (unified): Applies unified borderless form styling.
 *   Example: child.unified = true;
 *
 * Public methods (call on the rendered child):
 * - getValue(): Read the current component value.
 * - errorMe(errMsg=null): Mark the control invalid; accepts an optional error message where supported.
 * - removeErrorMe(): Clear the externally marked validation error.
 * - checkValidity(): Return whether the current date passes validation.
 * - reportValidity(): Validate and display the current validation error.
 * - focusMe(): Focus the component input/control.
 *
 * 3. Example usage
 * parent.html
 * <template>
 *     <c-slds-date-picker label="Due date" current-value={date}
 *         min-date="today" onchange={handleDate}></c-slds-date-picker>
 * </template>
 *
 * parent.js
 * import { LightningElement } from 'lwc';
 * export default class Parent extends LightningElement {
 *     date;
 *     handleDate(event) { this.date = event.detail.value; }
 * }
 *
 * parent.css (layout of the parent/host; internal styles use public properties)
 * :host { display: block; }
 *
 * 4. Notes
 * - Use for a date-only field with a custom calendar. change.detail is { value: 'YYYY-MM-DD', date: Date
 * }; getValue() also returns an ISO date or null, while currentValue is formatted for display. Set
 * min-date/max-date for bounds.
 * - Overlay variant: set portal={enabled}, with enabled = true, when the containing layout clips the
 * calendar. full-variant and suppress-icon-button customize its presentation. is-multi-select only keeps
 * the calendar open; it does not return an array of dates.
 */

import { LightningElement, track, api  } from 'lwc';

import {
    iconMap as ICON_MAP,
    getErrorMessage,
} from 'c/utils';


const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const fmtMMDDYYYY = (d) => `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
//const fmtDDMMYYYY = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

const truthyAttr = (value) => value === true || value === '' || value === 'true' || value === '1';
const PORTAL_DROPDOWN_WIDTH = 281.85;
const PORTAL_DROPDOWN_HEIGHT = 356;


//let KEY_ID = 1111;


function handleUnifiedClick(cmp, event, onlyFocus=false) {
    const trgt = event.target;
    if (
        !trgt.classList.contains('gw-unified-form-element') &&
        !trgt.classList.contains('slds-form-element__label') &&
        !trgt.classList.contains('slds-form-element') &&
        !trgt.classList.contains('slds-button_icon')
    ) {
        return;
    }

    if (cmp._unifiedCl && !cmp._unifiedCl.includes('slds-is-disabled')) {
        const trigger = cmp.template.querySelector('.slds-dropdown-trigger');
        const inp = cmp.template.querySelector('.slds-input');
        if (trigger) {
            inp.focus();
            if (!onlyFocus) {
                trigger.click();
            }
        }
    }
}

function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function parseIncomingDate(v) {
    if (!v) return null;

    // Date object (when set from JS, not markup)
    if (v instanceof Date && !isNaN(v.getTime())) {
        return startOfDay(v);
    }

    // Expect ISO string "YYYY-MM-DD"
    if (typeof v === 'string') {
        const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (m) {
            const y = Number(m[1]);
            const mo = Number(m[2]) - 1;
            const d = Number(m[3]);
            return new Date(y, mo, d); // local midnight
        }

        // Fallback (try, but avoid sending MM/DD/YYYY from parent)
        const dt = new Date(v);
        return isNaN(dt.getTime()) ? null : startOfDay(dt);
    }

    return null;
}

function handleDropdownFlip(cmp) {
    if (cmp.isPortal) {
        cmp.positionPortalDropdown();
        return;
    }

    if (cmp.suppressFlip) {return;}
    const dropdown = cmp.template.querySelector('.slds-dropdown');
    if (!dropdown) return;

    if (cmp.alwaysFlip) {
        if (!dropdown.classList.contains('dropdown-up')) {
            dropdown.classList.add('dropdown-up');
        }
        return;
    }

    // Reset any previous flip
    dropdown.classList.remove('dropdown-up');
    cmp.alignDropdownToCalendarIcon(dropdown);

    const rect = dropdown.getBoundingClientRect();
    const overflowBottom = rect.bottom > window.innerHeight;
    const overflowTop = rect.top < 0;

    // If it overflows below the viewport and has more space above, flip it
    if (overflowBottom && rect.top > rect.height) {
        dropdown.classList.add('dropdown-up');
        cmp.alignDropdownToCalendarIcon(dropdown);
    } else if (overflowTop) {
        // In case it somehow renders above the viewport already
        dropdown.classList.remove('dropdown-up');
        cmp.alignDropdownToCalendarIcon(dropdown);
    }
}


export default class SldsDatePicker extends LightningElement {
    _dropdownTrigger;
    _isOpen = false;
    iconMap = ICON_MAP;

    @api alwaysFlip = false;
    @api portal = false;

    get isPortal() {
        return truthyAttr(this.portal);
    }

    _rootCl;
    @api
    set fullVariant(val) {
        this._fullVariant = val;
        if (val) {
            this._applyVarsDirect('--input-border', 'none');
            this._rootCl = 'full-variant';
        }
    }
    get fullVariant() {
        return this._fullVariant;
    }

    @api
    set suppressIconButton(val) {
        this._suppressIconButton = val;
    }
    get suppressIconButton() {
        return this._suppressIconButton ?? false;
    }

    @api
    set label(val) {
        this._label = val;
    }
    get label() {
        return this._label;
    }
    // placeholder of input element
    @api
    set placeHolder(val) {
        this._placeHolder = val;
    }
    get placeHolder() {
        return this._placeHolder;
    }
    @api dropdownDirection;

    @api isMultiSelect = false;

    _isRequired = false;
    @api
    set isRequired(val) {
        this._isRequired = truthyAttr(val);
    }
    get isRequired() {
        return this._isRequired;
    }

    hasError = false;
    _errorMessage;

    _pendingCurrentValue;
    _currentValue = '';
    @api
    set currentValue(val) {
        this._pendingCurrentValue = val; // store it no matter what
        this._applyCurrentValueIfReady();
    }
    get currentValue() {
        return this._currentValue;
    }

    @api
    get minDate() { return this._minDate; }
    set minDate(v) {
        const today = typeof v === 'string' && v === 'today';
        this._minDate = this.normalizeDateInput(today ? new Date() : v);
        this._initIfReady();
    }
    @api
    get maxDate() { return this._maxDate; }
    set maxDate(v) {
        this._maxDate = this.normalizeDateInput(v);
        this._initIfReady();
    }

    @api
    set suppressBorder(val) {
        this._suppressBorder = val;
        if (val) {
            this._applyVarsDirect('--input-border', 'none');
        }
    }
    get suppressBorder() {
        return this._suppressBorder ?? false;
    }
    @api
    set inputHeight(val) {
        this._inputHeight = val;
        if (val) this._applyVarsDirect('--input-height', val);
    }
    get inputHeight() {
        return this._inputHeight;
    }
    @api
    set borderRadius(val) {
        this._borderRadius = val;
        if (val) {
            this._applyVarsDirect('--input-radius', val);
            this._applyVarsDirect('--slds-c-input-radius-border', val);
        }

    }
    get borderRadius() {
        return this._borderRadius;
    }
    @api
    set fontSize(val) {
        this._fontSize = val;
        if (val) this._applyVarsDirect('--input-font-size', val);

    }
    get fontSize() {
        return this._fontSize;
    }


    @api suppressFlip = false;

    // Public Methods
    @api getValue() {
        return this.selectedDate ? toISO(this.selectedDate) : null;
    }
    @api errorMe(errMsg=null) {
        this._errorMessage = errMsg || 'This field is required.';
        this.hasError = true;
    }
    @api removeErrorMe() {
        this.hasError = false;
        if (this._errorMessage) this._errorMessage = null;
    }
    @api checkValidity() {
        return !this.isRequired || !!this._currentValue;
    }
    @api reportValidity() {
        const isValid = this.checkValidity();
        if (isValid) {
            this.removeErrorMe();
        } else {
            this.errorMe('Enter a value.');
        }
        return isValid;
    }
    _renderFocus = false;
    @api focusMe() {
        const inp = this.template.querySelector('[data-id="date-input"]');
        if (inp) {
            this._renderFocus = true;
            inp.focus();
        }
    }


    @track years = [];
    @track weeks = [];
    viewDate;      // Date representing the current visible month (any day inside that month)
    selectedDate;  // Date or null
    rangeStart;    // Date
    rangeEnd;      // Date

    templateLabels = {
        nextMonth: 'Next Month',
        pickAYear: 'Pick a Year',
        previousMonth: 'Previous Month',
        today: 'Today'
    };

    normalizeDateInput(v) {
        return new Date(v);
    }

    connectedCallback() {
        try {
            // If min/max not provided yet, set defaults now (+/- 100y)
            const today = startOfDay(new Date());

            if (!this._minDate) {
                const d = new Date(today);
                d.setFullYear(today.getFullYear() - 100);
                this._minDate = d;
            }
            if (!this._maxDate) {
                const d = new Date(today);
                d.setFullYear(today.getFullYear() + 100);
                this._maxDate = d;
            }
            this._initIfReady();
        } catch(error) {
            this.showToast('Error in connectedCallback() of sldsDatePicker.js', getErrorMessage(error), 'error');
        }
    }

    yIsSelected(y) {
        return Number(y) === this.viewYear;
    }

    get viewYearStr() {
        return String(this.viewDate.getFullYear());
    }
    get dropdownCl() {
        const base = 'slds-datepicker slds-dropdown';
        const portalCl = this.isPortal ? 'datepicker-portal' : '';

        const directionCl = this.dropdownDirection === 'left' ? 'slds-dropdown_right'
            : this.dropdownDirection === 'right' ? 'slds-dropdown_left'
            : this.dropdownDirection === 'top' ? 'slds-dropdown_top'
            : '';

        return `${base} ${directionCl} ${portalCl}`.trim();
    }
    get formElementClass() {
        const classes = ['slds-form-element', 'slds-dropdown-trigger', 'slds-dropdown-trigger_click'];
        if (this._isOpen) classes.push('slds-is-open');
        if (this.hasError) classes.push('slds-has-error');
        return classes.join(' ');
    }
    get inputAriaDescribedBy() {
        return this.hasError ? 'date-input-error' : null;
    }
    _applyCurrentValueIfReady() {
        try {
            // don’t apply until range is initialized
            if (!this.rangeStart || !this.rangeEnd) return;

            const parsed = parseIncomingDate(this._pendingCurrentValue);
            if (!parsed) return;

            // clamp to range
            const date = parsed < this.rangeStart ? this.rangeStart
                : parsed > this.rangeEnd ? this.rangeEnd
                : parsed;

            this.selectedDate = date;
            this.viewDate = new Date(date.getFullYear(), date.getMonth(), 1);

            // keep your display format in the input
            this._currentValue = fmtMMDDYYYY(date);
            this.removeErrorMe();

            this.buildYears();
            this.buildCalendar();
        } catch(error) {
            this.showToast('Error in _applyCurrentValueIfReady() of sldsDatePicker.js', getErrorMessage(error), 'error');
        }
    }
    // ---------- init & helpers ----------
    _initIfReady() {
        try {
            if (!this._minDate || !this._maxDate) return;

            const [min, max] = this._minDate <= this._maxDate
                ? [this._minDate, this._maxDate]
                : [this._maxDate, this._minDate];

            this.rangeStart = startOfDay(min);
            this.rangeEnd = startOfDay(max);

            const today = startOfDay(new Date());
            const initial = today < this.rangeStart ? this.rangeStart
                : today > this.rangeEnd ? this.rangeEnd
                : today;

            this.viewDate = new Date(initial.getFullYear(), initial.getMonth(), 1);

            // ❌ remove these two lines (they blow away parent-set currentValue)
            // this.selectedDate = null;
            // this._currentValue = '';

            this.buildYears();

            // ✅ apply parent value if present, else just build a normal calendar
            this._applyCurrentValueIfReady();
            if (!this.selectedDate) this.buildCalendar();
        } catch(error) {
            this.showToast('Error in _initIfReady() of sldsDatePicker.js', getErrorMessage(error), 'error');
        }
    }
    get viewYear() { return this.viewDate.getFullYear(); }

    // ---------- UI derived ----------
    get monthLabel() {
        return this.viewDate
            ? this.viewDate.toLocaleString('en-US', { month: 'long' })
            : '';
    }
    get prevDisabled() {
        if (!this.viewDate || !this.rangeStart) return true;

        const prevMonth = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
        const minMonth = new Date(this.rangeStart.getFullYear(), this.rangeStart.getMonth(), 1);
        return prevMonth < minMonth;
    }
    get nextDisabled() {
        if (!this.viewDate || !this.rangeEnd) return true;

        const nextMonth = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
        const maxMonth = new Date(this.rangeEnd.getFullYear(), this.rangeEnd.getMonth(), 1);
        return nextMonth > maxMonth;
    }
    get todayDisabled() {
        if (!this.rangeStart || !this.rangeEnd) return true;

        const today = startOfDay(new Date());
        return today < this.rangeStart || today > this.rangeEnd;
    }
    buildYears() {
        try {
            const ys = [];
            const selectedYear = this.viewYear;
            for (let y = this.rangeStart.getFullYear(); y <= this.rangeEnd.getFullYear(); y++) {
                ys.push({
                    value: String(y),
                    label: String(y),
                    isSelected: y === selectedYear
                });
            }
            this.years = ys;
        } catch(error) {
            this.showToast('Error in buildYears() of sldsDatePicker.js', getErrorMessage(error), 'error');
        }
    }
    buildCalendar() {
        try {
            this.buildYears();

            const year = this.viewDate.getFullYear();
            const month = this.viewDate.getMonth();

            const firstOfMonth = new Date(year, month, 1);
            const startDow = firstOfMonth.getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const prevMonthDays = new Date(year, month, 0).getDate();

            const cells = [];

            // Leading
            for (let i = startDow - 1; i >= 0; i--) {
                const d = new Date(year, month - 1, prevMonthDays - i);
                cells.push(this.dayCell(d, true));
            }

            // Current
            for (let d = 1; d <= daysInMonth; d++) {
                cells.push(this.dayCell(new Date(year, month, d), false));
            }

            // Trailing
            while (cells.length % 7 !== 0) {
                const nextDay = cells.length - (startDow + daysInMonth) + 1;
                cells.push(this.dayCell(new Date(year, month + 1, nextDay), true));
            }

            // If nothing selected, give focus to first valid day
            if (!this.selectedDate) {
                const firstValid = cells.find(c => !c.disabled);
                if (firstValid) firstValid.tabIndex = '0';
            }
            cells.forEach((c, i) => { c.idx = i; });

            // Build week objects WITH STABLE KEY
            const weeks = [];
            let wkCnt = 0;
            for (let i = 0; i < cells.length; i += 7) {
                const weekCells = cells.slice(i, i + 7);
                weeks.push({
                    keyId: weekCells[0].iso,   // stable key based on first day in week
                    days: weekCells,
                    weekNum: wkCnt++
                });
            }
            this.weeks = weeks;
        } catch(error) {
            this.showToast('Error in buildCalendar() of sldsDatePicker.js', getErrorMessage(error), 'error');
        }
    }
    dayCell(dateObj, isAdjacent) {
        try {
            const iso = toISO(dateObj);
            const isInRange = dateObj >= this.rangeStart && dateObj <= this.rangeEnd;
            const isToday = iso === toISO(startOfDay(new Date()));
            const isSelected = this.selectedDate && iso === toISO(this.selectedDate);
            const disabled = !isInRange || isAdjacent;

            const classes = [];
            if (isAdjacent) classes.push('slds-day_adjacent-month');
            if (isToday) classes.push('slds-is-today');
            if (isSelected) classes.push('slds-is-selected');
            if (disabled) {
                classes.push('slds-disabled-text');
                classes.push('slds-is-disabled');
            }

            return {
                key: iso,
                iso,
                day: dateObj.getDate(),
                aria: iso,
                isToday,
                isSelected,
                disabled,
                tdClass: classes.join(' '),
                tabIndex: disabled ? 'false' : isSelected ? '0' : '-1'
            };
        } catch(error) {
            this.showToast('Error in dayCell() of sldsDatePicker.js', getErrorMessage(error), 'error');
            return null;
        }
    }

    _setInactiveDayTabIndexes() {
        this.template.querySelectorAll('.slds-day[role="button"]').forEach((day) => {
            const td = day.closest('td[role="gridcell"]');
            day.setAttribute('tabindex', td?.getAttribute('aria-disabled') === 'true' ? 'false' : '-1');
        });
    }

    _focusCellByIdx(idx) {
        const day = this.template.querySelector(`.slds-day[role="button"][data-idx="${idx}"]`);
        if (!day) return;

        this._setInactiveDayTabIndexes();

        day.setAttribute('tabindex', '0');
        day.focus();
    }

    _focusDate(dateObj) {
        try {
            const iso = toISO(dateObj);
            Promise.resolve().then(() => requestAnimationFrame(() => {
                const day = this.template.querySelector(`.slds-day[role="button"][data-iso="${iso}"]`);
                if (!day) return;

                this._setInactiveDayTabIndexes();

                day.setAttribute('tabindex', '0');
                day.focus();

                if (this.isPortal) {
                    this.positionPortalDropdown();
                }
            }));
        } catch(error) {
            this.showToast('Error in _focusDate() of sldsDatePicker.js', getErrorMessage(error), 'error');
        }
    }

    _focusSelectedOrActiveDay() {
        try {
            const selectedIso = this.selectedDate ? toISO(this.selectedDate) : null;
            const selectedDay = selectedIso
                ? this.template.querySelector(`.slds-day[role="button"][data-iso="${selectedIso}"]`)
                : null;
            const fallbackDay = this.template.querySelector('.slds-day[role="button"][tabindex="0"]');
            const day = selectedDay || fallbackDay;
            if (!day) return;

            this._setInactiveDayTabIndexes();
            day.setAttribute('tabindex', '0');
            day.focus();

            if (this.isPortal) {
                this.positionPortalDropdown();
            }
        } catch(error) {
            this.showToast('Error in _focusSelectedOrActiveDay() of sldsDatePicker.js', getErrorMessage(error), 'error');
        }
    }

    _getDateFromCell(cell) {
        try {
            const iso = cell?.dataset?.iso;
            if (!iso) return null;

            const [year, month, day] = iso.split('-').map(Number);
            return new Date(year, month - 1, day);
        } catch(error) {
            this.showToast('Error in _getDateFromCell() of sldsDatePicker.js', getErrorMessage(error), 'error');
            return null;
        }
    }

    _isDateInRange(dateObj) {
        return dateObj >= this.rangeStart && dateObj <= this.rangeEnd;
    }

    handleTbodyKeydown(event) {
        try {
            const key = event.key;

            const delta = key === 'ArrowRight' ? 1
                : key === 'ArrowLeft' ? -1
                : key === 'ArrowDown' ? 7
                : key === 'ArrowUp' ? -7
                : 0;

            if (!delta && key !== 'Enter' && key !== ' ') return;

            event.stopPropagation();

            const active = event.target?.dataset?.idx !== undefined
                ? event.target
                : this.template.activeElement;
            const idxStr = active?.dataset?.idx;
            if (idxStr === undefined) return;

            if (key === 'Enter' || key === ' ') {
                event.preventDefault();
                const td = active.closest('td[role="gridcell"]');
                if (td?.getAttribute('aria-disabled') !== 'true') active.click();
                return;
            }

            event.preventDefault();

            const activeDate = this._getDateFromCell(active);
            if (!activeDate) return;

            const nextDate = new Date(activeDate);
            nextDate.setDate(activeDate.getDate() + delta);
            if (!this._isDateInRange(nextDate)) return;

            const nextMonthStart = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
            const currentMonthStart = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1);

            if (nextMonthStart.getTime() !== currentMonthStart.getTime()) {
                this.viewDate = nextMonthStart;
                this.buildYears();
                this.buildCalendar();
                this._focusDate(nextDate);
                return;
            }

            const idx = Number(idxStr);
            if (Number.isNaN(idx)) return;

            const days = Array.from(this.template.querySelectorAll('.slds-day[role="button"]'));
            if (!days.length) return;

            const step = delta > 0 ? 1 : -1;
            let next = idx + delta;

            while (next >= 0 && next < days.length) {
                const day = days[next];
                const td = day.closest('td[role="gridcell"]');
                const isDisabled = td.getAttribute('aria-disabled') === 'true' || td.classList.contains('slds-is-disabled');

                if (!isDisabled) {
                    this._setInactiveDayTabIndexes();
                    day.setAttribute('tabindex', '0');
                    day.focus();
                    return;
                }

                next += step; // keep walking until a non-disabled day
            }
        } catch(error) {
            this.showToast('Error in handleTbodyKeydown() of sldsDatePicker.js', getErrorMessage(error), 'error');
        }
    }
    handleDayFocus(event) {
        try {
            this._btnDidFocus = true;
            const day = event.currentTarget;
            const td = day.closest('td[role="gridcell"]');
            const isDisabled = td.getAttribute('aria-disabled') === 'true' || td.classList.contains('slds-is-disabled');
            if (!isDisabled) return;

            // move focus to nearest enabled cell (prefer forward)
            const days = Array.from(this.template.querySelectorAll('.slds-day[role="button"]'));
            const idx = Number(day.dataset.idx);

            for (let i = idx + 1; i < days.length; i++) {
                const nextTd = days[i].closest('td[role="gridcell"]');
                if (nextTd.getAttribute('aria-disabled') !== 'true' && !nextTd.classList.contains('slds-is-disabled')) {
                    this._focusCellByIdx(i);
                    return;
                }
            }
            for (let i = idx - 1; i >= 0; i--) {
                const prevTd = days[i].closest('td[role="gridcell"]');
                if (prevTd.getAttribute('aria-disabled') !== 'true' && !prevTd.classList.contains('slds-is-disabled')) {
                    this._focusCellByIdx(i);
                    return;
                }
            }
        } catch(error) {
            this.showToast('Error in handleDayFocus() of sldsDatePicker.js', getErrorMessage(error), 'error');
        }
    }

    _btnDidFocus = false;
    handleBtnFocus() {
        this._btnDidFocus = true;
        if (!this._isOpen) {
            this.openDatePicker();
        }
    }


    handlePrevMonth = () => {
        try {
            if (this.prevDisabled) return;
            this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
            this.buildCalendar();
            requestAnimationFrame(() => {
                const btn = this?.refs?.leftbutton;
                btn.focus();
            })
        } catch(error) {
            this.showToast('Error in handlePrevMonth() of sldsDatePicker.js', getErrorMessage(error), 'error');
        }
    };
    handleNextMonth = () => {
        try {
            if (this.nextDisabled) return;
            this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
            this.buildCalendar();
            requestAnimationFrame(() => {
                const btn = this?.refs?.rightbutton;
                btn.focus();
            });
        } catch(error) {
            this.showToast('Error in handleNextMonth() of sldsDatePicker.js', getErrorMessage(error), 'error');
        }
    };


    handleYearChange = (evt) => {
        try {
            const newYear = parseInt(evt.target.value, 10);
            const newView = new Date(newYear, this.viewDate.getMonth(), 1);

            // clamp to range month-wise
            const minMonth = new Date(this.rangeStart.getFullYear(), this.rangeStart.getMonth(), 1);
            const maxMonth = new Date(this.rangeEnd.getFullYear(), this.rangeEnd.getMonth(), 1);
            this.viewDate = newView < minMonth ? minMonth : newView > maxMonth ? maxMonth : newView;

            this.buildCalendar();
        } catch(error) {
            this.showToast('Error in handleYearChange() of sldsDatePicker.js', getErrorMessage(error), 'error');
        }
    };

    handleDayClick = (evt) => {
        try {
            const iso = evt.currentTarget?.dataset?.iso;
            if (!iso) return;

            const [y, m, d] = iso.split('-').map(Number);
            const date = new Date(y, m - 1, d);
            if (date < this.rangeStart || date > this.rangeEnd) return;

            this.selectedDate = date;
            this._currentValue = fmtMMDDYYYY(date);
            this.removeErrorMe();
            this.buildCalendar();

            if (!this.isMultiSelect) {
                this.closeDatePicker({ restoreFocus: true });
            }

            // notify parent
            this.dispatchEvent(new CustomEvent('change', {
                detail: { value: iso, date: new Date(date) }
            }));
        } catch(error) {
            this.showToast('Error in handleDayClick() of sldsDatePicker.js', getErrorMessage(error), 'error');
        }
    };

    handleToday = () => {
        try {
            if (this.todayDisabled) return;
            const t = startOfDay(new Date());
            this.viewDate = new Date(t.getFullYear(), t.getMonth(), 1);
            this.selectedDate = t;
            this._currentValue = fmtMMDDYYYY(t);
            this.removeErrorMe();
            this.buildCalendar();
            this.dispatchEvent(new CustomEvent('change', {
                detail: { value: toISO(t), date: new Date(t) }
            }));
        } catch(error) {
            this.showToast('Error in handleToday() of sldsDatePicker.js', getErrorMessage(error), 'error');
        }
    };
    assignToday = () => {
        this.handleToday();
    };


    handleToggleButtonFocus() {
        this._btnDidFocus = true;
    }
    handleTriggerKeyDown(event) {
        if (!this.suppressIconButton) {
            event.stopPropagation();
            //event.preventDefault();
        }
        const key = event?.key;
        if (key) {
            if (['Enter', ' '].some(openKey => key === openKey)) {
                if (!this.suppressIconButton && event.key === ' ') {
                    event.stopPropagation();
                }
                this.handleToggleOpen();
            } else if(event?.key === 'Escape' && this._isOpen) {
                event.preventDefault();
                this.closeDatePicker({ restoreFocus: true });
            }
        }
    }

    handleTextInput(event) {
        try {
            const raw = event.target.value || '';
            this._currentValue = raw;
            if (raw) {
                this.removeErrorMe();
            }

            const preview = this.parsePartialMMDDYYYY(raw);
            if (!preview) return;

            const { date, hasMonth, hasDay, hasYear } = preview;

            // month-only: jump to the first valid year that has that month
            if (hasMonth && !hasDay) {
                const monthIdx = date.getMonth();
                const monthStart = this._findFirstInRangeMonth(monthIdx);

                this.viewDate = monthStart;      // already set to day 1
                this.selectedDate = null;
                this.removeErrorMe();

                this.buildYears();
                this.buildCalendar();
                return;
            }


            // clamp
            const clamped = date < this.rangeStart ? this.rangeStart
                : date > this.rangeEnd ? this.rangeEnd
                : date;

            // always jump month if month is present
            this.viewDate = new Date(clamped.getFullYear(), clamped.getMonth(), 1);

            //requestAnimationFrame(() => {
            //    const sel = this.template.querySelector('.slds-select');
            //    if (sel) sel.value = String(this.viewDate.getFullYear());
            //});

            // only “select” a day when day is present (05/25 or 05/25/1994)
            this.selectedDate = (hasDay ? startOfDay(clamped) : null);
            this.removeErrorMe();

            this.buildYears();
            this.buildCalendar();

            // OPTIONAL: only notify parent when year is present (full date typed)
            if (hasMonth && hasDay && hasYear) {
                this.dispatchEvent(new CustomEvent('change', {
                    detail: { value: toISO(startOfDay(clamped)), date: new Date(startOfDay(clamped)) }
                }));
            }
        } catch(error) {
            this.showToast('Error in handleTextInput() of sldsDatePicker.js', getErrorMessage(error), 'error');
        }
    }
    /**
     * Accepts partial input:
     * "05" -> month preview (current year, day 1)
     * "05/25" -> month/day preview (current year)
     * "05/25/1994" -> full date
     */
    parsePartialMMDDYYYY(raw) {
        const s = String(raw).trim();
        if (!s) return null;

        // allow "10", "10/1", "10/12", "10/12/2", "10/12/2022"
        const m = s.match(/^(\d{1,2})(?:\/(\d{0,2}))?(?:\/(\d{0,4}))?$/);
        if (!m) return null;

        const mm = Number(m[1]);
        if (mm < 1 || mm > 12) return null;

        const ddRaw = m[2] ?? '';
        const yyRaw = m[3] ?? '';

        const hasDay = ddRaw.length > 0;
        const hasYear = yyRaw.length === 4;

        const year = hasYear ? Number(yyRaw) : this.viewDate?.getFullYear?.() ?? new Date().getFullYear();
        const monthIdx = mm - 1;

        // month-only: jump to month (keep selectedDate null)
        if (!hasDay) {
            return { date: new Date(year, monthIdx, 1), hasMonth: true, hasDay: false, hasYear };
        }

        const dd = Number(ddRaw);
        if (dd < 1 || dd > 31) return null;

        // validate actual day-in-month
        const dim = new Date(year, monthIdx + 1, 0).getDate();
        if (dd > dim) return null;

        return { date: new Date(year, monthIdx, dd), hasMonth: true, hasDay: true, hasYear };

    }
    _findFirstInRangeMonth(monthIdx) {
        try {
            // first day of that month in min year
            let y = this.rangeStart.getFullYear();
            let candidate = new Date(y, monthIdx, 1);

            // if that month starts before min, jump to next year
            if (candidate < new Date(this.rangeStart.getFullYear(), this.rangeStart.getMonth(), 1)) {
                y += 1;
                candidate = new Date(y, monthIdx, 1);
            }

            // now ensure it's within [rangeStart, rangeEnd] month-wise
            const minMonth = new Date(this.rangeStart.getFullYear(), this.rangeStart.getMonth(), 1);
            const maxMonth = new Date(this.rangeEnd.getFullYear(), this.rangeEnd.getMonth(), 1);

            if (candidate < minMonth) candidate = minMonth;
            if (candidate > maxMonth) candidate = maxMonth;

            return candidate;
        } catch(error) {
            this.showToast('Error in _findFirstInRangeMonth() of sldsDatePicker.js', getErrorMessage(error), 'error');
            return null;
        }
    }

    handleDateChange(event) {
        const input = event.target;
        input.blur();
    }
    handleRequiredError() {
        if (!this.isRequired) return;

        if (this._currentValue) {
            this.removeErrorMe();
        } else {
            this.errorMe('Enter a value.');
        }
    }
    handleInputKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const trigger = event.target.closest('.slds-dropdown-trigger');
            if (trigger) {
                this.handleToggleOpen();
            }
            return;
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            this.closeDatePicker({ restoreFocus: true });
        }
    }

    toggleDatePicker(event) {
        const isCalendarButton = event.target?.dataset?.id === 'button-calendar'
            || event.currentTarget?.dataset?.id === 'button-calendar';

        if (isCalendarButton) {
            event.stopPropagation();
        }
        if (event?.key && (event.key === ' ' || event.key === 'Enter')) {
            return;
        }
        if (this._dropdownTrigger) {
            this.handleToggleOpen();
        }

        if (isCalendarButton) {
            setTimeout(() => {
                this.openDatePicker({ focusSelected: true });
            }, 40);
        }
    }

    handleInputFocus() {
        if (this._renderFocus) {
            this._renderFocus = false;
        }
    }
    handleInputBlur() {
        this.handleRequiredError();
    }

    _gotRoot = false;
    renderedCallback() {
        const dropdownTrigger = this.template.querySelector('.slds-dropdown-trigger');
        if (dropdownTrigger) this._dropdownTrigger = dropdownTrigger;

        // ensure the select shows today's year
        const sel = this.template.querySelector('.slds-select');
        if (sel && sel.value !== this.viewYearStr) {
            sel.value = this.viewYearStr;
        }

        if (!this._gotRoot) {
            const root = this?.refs?.datepickerRoot;
            if (root) {
                root.addEventListener('focusin', this.handleRootFocusIn.bind(this));
                root.addEventListener('focusout', this.handleRootFocusOut.bind(this));
                this._gotRoot = true;
            }
        }

        if (this._dropdownTrigger) {
            this._dropdownTrigger.classList.toggle('slds-is-open', this._isOpen);
        }

        if (this.isPortal && this._isOpen) {
            this.syncPortalListeners();
            requestAnimationFrame(() => this.positionPortalDropdown());
        } else {
            this.removePortalListeners();
            if (!this.isPortal) {
                this.resetPortalDropdown();
            }
        }
    }

    disconnectedCallback() {
        this.removePortalListeners();
    }

    handleRootFocusOut(evt) {
        if (this._isElementInsideDatePicker(evt.relatedTarget)) {
            return;
        }

        setTimeout(() => {
            if (this._isElementInsideDatePicker(this.template.activeElement)) {
                return;
            }

            if (this._mouseDidDown) {
                this._mouseDidDown = false;
                return;
            }

            this._btnDidFocus = false;
            this.closeDatePicker();
            this.handleRequiredError();
        }, 50);
    }
    handleRootKeyDown(event) {
        if (event.key !== 'Escape' || !this._isOpen) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        this.closeDatePicker({ restoreFocus: true });
    }
    handleRootFocusIn(event) {
        if (
            event.target?.classList.contains('slds-input') &&
            event.target?.dataset?.component === 'sldsDatePicker'
        ) {
            return;
        }
        if (!this._isOpen) {
            if (this._btnDidFocus) return;
            this.openDatePicker();
        }
    }

    get evenHeightArr() {
        const len = 7 - (this.weeks?.length ?? 0);
        return len > 0
            ? Array.from({ length: len }, (_, i) => `empty-${i}`)
            : [];
    }

    handleToggleOpen() {
        if (this._isOpen) {
            this.closeDatePicker();
        } else {
            this.openDatePicker();
        }
    }

    openDatePicker({ focusSelected = false } = {}) {
        this._isOpen = true;
        if (this._dropdownTrigger) {
            this._dropdownTrigger.classList.add('slds-is-open');
        }
        this.syncPortalListeners();
        requestAnimationFrame(() => {
            handleDropdownFlip(this);
            if (focusSelected) {
                this._focusSelectedOrActiveDay();
            }
        });
    }

    closeDatePicker({ restoreFocus = false } = {}) {
        this._isOpen = false;

        if (this._dropdownTrigger) {
            this._dropdownTrigger.classList.remove('slds-is-open');
        }
        this.removePortalListeners();

        if (restoreFocus) {
            const input = this.template.querySelector('[data-id="date-input"]');
            if (input && this.template.activeElement !== input) {
                this._renderFocus = true;
                input.focus();
            }
        }
    }

    _isElementInsideDatePicker(element) {
        const root = this?.refs?.datepickerRoot;
        return Boolean(element && root && (element === root || root.contains(element)));
    }

    _hasPortalListeners = false;
    _handlePortalPosition = () => {
        if (this._isOpen) {
            this.positionPortalDropdown();
        }
    };

    syncPortalListeners() {
        if (!this.isPortal || this._hasPortalListeners) return;

        window.addEventListener('resize', this._handlePortalPosition);
        window.addEventListener('scroll', this._handlePortalPosition, true);
        this._hasPortalListeners = true;
    }

    removePortalListeners() {
        if (!this._hasPortalListeners) return;

        window.removeEventListener('resize', this._handlePortalPosition);
        window.removeEventListener('scroll', this._handlePortalPosition, true);
        this._hasPortalListeners = false;
    }

    resetPortalDropdown() {
        const dropdown = this.template.querySelector('[data-id="date-dropdown"]');
        if (!dropdown) return;

        dropdown.style.removeProperty('position');
        dropdown.style.removeProperty('z-index');
        dropdown.style.removeProperty('top');
        dropdown.style.removeProperty('left');
        dropdown.style.removeProperty('right');
        dropdown.style.removeProperty('width');
        dropdown.style.removeProperty('height');
        dropdown.style.removeProperty('min-width');
        dropdown.style.removeProperty('max-width');
        dropdown.style.removeProperty('min-height');
        dropdown.style.removeProperty('max-height');
    }

    getDropdownAnchorElement() {
        return this.template.querySelector('[data-id="button-calendar"]')
            || this.template.querySelector('[data-id="date-input"]');
    }

    alignDropdownToCalendarIcon(dropdown = this.template.querySelector('[data-id="date-dropdown"]')) {
        const anchor = this.getDropdownAnchorElement();
        const trigger = this._dropdownTrigger;
        if (!dropdown || !anchor || !trigger) return;

        const anchorRect = anchor.getBoundingClientRect();
        const triggerRect = trigger.getBoundingClientRect();
        const dropdownWidth = dropdown.getBoundingClientRect().width || dropdown.offsetWidth || PORTAL_DROPDOWN_WIDTH;
        const left = anchorRect.right - triggerRect.left - dropdownWidth;

        dropdown.style.right = 'auto';
        dropdown.style.left = `${left}px`;
    }

    positionPortalDropdown() {
        const dropdown = this.template.querySelector('[data-id="date-dropdown"]');
        const input = this.template.querySelector('[data-id="date-input"]');
        if (!dropdown || !input) return;

        const inputRect = input.getBoundingClientRect();
        const margin = 8;
        const gap = 2;
        const width = PORTAL_DROPDOWN_WIDTH;
        const height = PORTAL_DROPDOWN_HEIGHT;

        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

        const belowTop = inputRect.bottom + gap;
        const aboveTop = inputRect.top - height - gap;
        const hasMoreSpaceAbove = inputRect.top > viewportHeight - inputRect.bottom;

        const left = inputRect.right - width;

        const top = hasMoreSpaceAbove && aboveTop >= margin
            ? aboveTop
            : Math.min(belowTop, viewportHeight - height - margin);
        const adjustedTop = Math.max(margin, top);

        dropdown.classList.remove('dropdown-up');

        dropdown.style.position = 'fixed';
        dropdown.style.zIndex = '10002';
        dropdown.style.left = `${left}px`;
        dropdown.style.right = 'auto';
        dropdown.style.top = `${adjustedTop}px`;

        dropdown.style.width = `${width}px`;
        dropdown.style.height = `${height}px`;
        dropdown.style.minWidth = `${width}px`;
        dropdown.style.maxWidth = `${width}px`;
        dropdown.style.minHeight = `${height}px`;
        dropdown.style.maxHeight = `${height}px`;

        this.correctPortalDropdownRenderedPosition(dropdown, inputRect.right, adjustedTop);
    }

    correctPortalDropdownRenderedPosition(dropdown, expectedRight, expectedTop) {
        const rect = dropdown.getBoundingClientRect();
        const currentLeft = Number.parseFloat(dropdown.style.left) || 0;
        const currentTop = Number.parseFloat(dropdown.style.top) || 0;
        const rightDelta = expectedRight - rect.right;
        const topDelta = expectedTop - rect.top;

        if (Math.abs(rightDelta) > 0.5) {
            dropdown.style.left = `${currentLeft + rightDelta}px`;
        }
        if (Math.abs(topDelta) > 0.5) {
            dropdown.style.top = `${currentTop + topDelta}px`;
        }
    }

    _mouseDidDown = false;
    handleComponentMousedown() {
        this._mouseDidDown = true;
        setTimeout(() => {this._mouseDidDown = false;}, 90);
    }

    handleUnifiedClick(event) {
        if (event.target.dataset.id === 'rightbutton' || event.target.dataset.id === 'leftbutton') {
            return;
        }
        handleUnifiedClick(this, event);
    }


    _unifiedCl = '';
    @api
    set unified(val) {
        this._unified = val;
        if (val) {
            this._applyVarsDirect('--input-border', 'none');
            this._unifiedCl = `${this._unifiedCl} gw-unified-form-element`.trim();
        }
    }
    get unified() {
        return this._unified;
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
