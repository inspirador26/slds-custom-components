import { createElement } from '@lwc/engine-dom';
import SldsDatePicker from 'c/sldsDatePicker';

describe('c-slds-date-picker', () => {
    const mockDropdownRectFromInlineStyle = (dropdown, fallback = {}) => {
        dropdown.getBoundingClientRect = jest.fn(() => {
            const styleLeft = Number.parseFloat(dropdown.style.left) || fallback.left || 0;
            const styleTop = Number.parseFloat(dropdown.style.top) || fallback.top || 0;
            const left = styleLeft + (fallback.renderedOffsetLeft ?? 0);
            const top = styleTop + (fallback.renderedOffsetTop ?? 0);
            const width = Number.parseFloat(dropdown.style.width) || fallback.width || 281.85;
            const height = Number.parseFloat(dropdown.style.height) || fallback.height || 356;

            return {
                bottom: top + height,
                height,
                left,
                right: left + width,
                top,
                width
            };
        });
    };

    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('renders the input and calendar when created with defaults', () => {
        const element = createElement('c-slds-date-picker', {
            is: SldsDatePicker
        });

        document.body.appendChild(element);

        expect(element.shadowRoot.querySelector('[data-id="date-input"]')).not.toBeNull();
        expect(element.shadowRoot.querySelector('.slds-datepicker')).not.toBeNull();
        expect(element.shadowRoot.querySelectorAll('td[role="gridcell"]').length).toBeGreaterThan(0);
        expect(element.shadowRoot.querySelectorAll('.slds-day[role="button"]').length).toBeGreaterThan(0);
        expect(element.shadowRoot.querySelector('td[data-value] .slds-day[role="button"]')).not.toBeNull();
        expect(element.shadowRoot.querySelector('td.slds-day_adjacent-month .slds-day').getAttribute('tabindex')).toBe('false');
    });

    it('renders a provided current value in the input', () => {
        const element = createElement('c-slds-date-picker', {
            is: SldsDatePicker
        });

        element.minDate = '2026-01-01';
        element.currentValue = '2026-04-28';
        document.body.appendChild(element);

        const input = element.shadowRoot.querySelector('[data-id="date-input"]');
        expect(input.value).toBe('04/28/2026');
    });

    it('renders and validates required state', async () => {
        jest.useFakeTimers();
        const element = createElement('c-slds-date-picker', {
            is: SldsDatePicker
        });
        const outsideButton = document.createElement('button');

        element.label = 'Date';
        element.isRequired = true;
        document.body.appendChild(element);
        document.body.appendChild(outsideButton);

        const input = element.shadowRoot.querySelector('[data-id="date-input"]');
        expect(input.required).toBe(true);
        expect(element.shadowRoot.querySelector('.slds-required').textContent).toBe('* ');

        input.dispatchEvent(new FocusEvent('blur'));
        input.dispatchEvent(new FocusEvent('focusout', {
            bubbles: true,
            relatedTarget: outsideButton
        }));
        jest.runOnlyPendingTimers();
        await Promise.resolve();

        expect(element.shadowRoot.querySelector('.slds-dropdown-trigger').classList).toContain('slds-has-error');
        expect(input.getAttribute('aria-invalid')).toBe('true');
        const errorMessage = element.shadowRoot.querySelector('[id^="date-input-error"]');
        expect(input.getAttribute('aria-describedby')).toBe(errorMessage.id);
        expect(errorMessage.textContent).toContain('Enter a value.');

        input.value = '04/28/2026';
        input.dispatchEvent(new InputEvent('input', { bubbles: true }));
        await Promise.resolve();

        expect(element.shadowRoot.querySelector('.slds-dropdown-trigger').classList).not.toContain('slds-has-error');

        jest.useRealTimers();
    });

    it('does not open the calendar when the input receives focus', () => {
        const element = createElement('c-slds-date-picker', {
            is: SldsDatePicker
        });

        document.body.appendChild(element);

        const input = element.shadowRoot.querySelector('[data-id="date-input"]');
        const trigger = element.shadowRoot.querySelector('.slds-dropdown-trigger');

        input.dispatchEvent(new FocusEvent('focus'));

        expect(trigger.classList).not.toContain('slds-is-open');
    });

    it('opens the calendar when the input is clicked or Enter is pressed', () => {
        const element = createElement('c-slds-date-picker', {
            is: SldsDatePicker
        });

        document.body.appendChild(element);

        const input = element.shadowRoot.querySelector('[data-id="date-input"]');
        const trigger = element.shadowRoot.querySelector('.slds-dropdown-trigger');

        input.click();
        expect(trigger.classList).toContain('slds-is-open');

        input.dispatchEvent(new KeyboardEvent('keydown', {
            bubbles: true,
            composed: true,
            key: 'Enter'
        }));
        expect(trigger.classList).not.toContain('slds-is-open');

        input.dispatchEvent(new KeyboardEvent('keydown', {
            bubbles: true,
            composed: true,
            key: ' '
        }));
        expect(trigger.classList).not.toContain('slds-is-open');

        input.dispatchEvent(new KeyboardEvent('keydown', {
            bubbles: true,
            composed: true,
            key: 'Enter'
        }));
        expect(trigger.classList).toContain('slds-is-open');
    });

    it('positions the dropdown as fixed when portal mode is enabled', () => {
        const element = createElement('c-slds-date-picker', {
            is: SldsDatePicker
        });

        element.portal = true;
        document.body.appendChild(element);

        const input = element.shadowRoot.querySelector('[data-id="date-input"]');
        const calendarButton = element.shadowRoot.querySelector('[data-id="button-calendar"]');
        const trigger = element.shadowRoot.querySelector('.slds-dropdown-trigger');
        const dropdown = element.shadowRoot.querySelector('[data-id="date-dropdown"]');
        const rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
            callback();
            return 0;
        });

        input.getBoundingClientRect = jest.fn(() => ({
            bottom: 130,
            height: 32,
            left: 25,
            right: 250,
            top: 98,
            width: 225
        }));
        calendarButton.getBoundingClientRect = jest.fn(() => ({
            bottom: 130,
            height: 32,
            left: 205,
            right: 225,
            top: 98,
            width: 20
        }));
        mockDropdownRectFromInlineStyle(dropdown);

        input.click();

        expect(trigger.classList).toContain('slds-is-open');
        expect(dropdown.classList).toContain('datepicker-portal');
        expect(dropdown.style.position).toBe('fixed');
        expect(Number.parseFloat(dropdown.style.left) + Number.parseFloat(dropdown.style.width)).toBeCloseTo(250);
        expect(dropdown.style.width).toBe('281.85px');
        expect(dropdown.style.height).toBe('356px');
        expect(dropdown.style.minWidth).toBe('281.85px');
        expect(dropdown.style.maxWidth).toBe('281.85px');
        expect(dropdown.style.minHeight).toBe('356px');
        expect(dropdown.style.maxHeight).toBe('356px');

        rafSpy.mockRestore();
    });

    it('aligns the portal dropdown right edge to the input right edge inside an SLDS modal', () => {
        const modal = document.createElement('section');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.className = 'slds-modal slds-fade-in-open';

        const container = document.createElement('div');
        container.className = 'slds-modal__container';

        const content = document.createElement('div');
        content.className = 'slds-modal__content slds-p-around_medium';

        const element = createElement('c-slds-date-picker', {
            is: SldsDatePicker
        });

        element.portal = true;
        content.appendChild(element);
        container.appendChild(content);
        modal.appendChild(container);
        document.body.appendChild(modal);

        const input = element.shadowRoot.querySelector('[data-id="date-input"]');
        const dropdown = element.shadowRoot.querySelector('[data-id="date-dropdown"]');
        const rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
            callback();
            return 0;
        });

        input.getBoundingClientRect = jest.fn(() => ({
            bottom: 710,
            height: 32,
            left: 255,
            right: 1283,
            top: 678,
            width: 1028
        }));
        mockDropdownRectFromInlineStyle(dropdown, { renderedOffsetLeft: 580 });

        input.click();

        const left = Number.parseFloat(dropdown.style.left);
        const renderedRect = dropdown.getBoundingClientRect();
        expect(dropdown.style.position).toBe('fixed');
        expect(left).toBeCloseTo(421.15);
        expect(renderedRect.right).toBeCloseTo(1283);

        rafSpy.mockRestore();
    });

    it('keeps the portal dropdown open when required validation rerenders the component', async () => {
        const rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
            callback();
            return 0;
        });
        const element = createElement('c-slds-date-picker', {
            is: SldsDatePicker
        });

        element.portal = true;
        element.isRequired = true;
        document.body.appendChild(element);

        const input = element.shadowRoot.querySelector('[data-id="date-input"]');
        const calendarButton = element.shadowRoot.querySelector('[data-id="button-calendar"]');
        const dropdown = element.shadowRoot.querySelector('[data-id="date-dropdown"]');

        input.getBoundingClientRect = jest.fn(() => ({
            bottom: 130,
            height: 32,
            left: 25,
            right: 250,
            top: 98,
            width: 225
        }));
        calendarButton.getBoundingClientRect = jest.fn(() => ({
            bottom: 130,
            height: 32,
            left: 205,
            right: 225,
            top: 98,
            width: 20
        }));
        mockDropdownRectFromInlineStyle(dropdown);

        input.click();
        input.dispatchEvent(new FocusEvent('blur'));
        await Promise.resolve();

        const trigger = element.shadowRoot.querySelector('.slds-dropdown-trigger');
        expect(trigger.classList).toContain('slds-is-open');
        expect(trigger.classList).toContain('slds-has-error');
        expect(dropdown.style.position).toBe('fixed');
        expect(Number.parseFloat(dropdown.style.left) + Number.parseFloat(dropdown.style.width)).toBeCloseTo(250);
        expect(dropdown.style.width).toBe('281.85px');
        expect(dropdown.style.height).toBe('356px');

        rafSpy.mockRestore();
    });

    it('moves to the next month when ArrowRight is pressed on the last day in portal mode', async () => {
        const rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
            callback();
            return 0;
        });
        const element = createElement('c-slds-date-picker', {
            is: SldsDatePicker
        });

        element.portal = true;
        element.minDate = '2026-01-01';
        element.maxDate = '2026-12-31';
        element.currentValue = '2026-04-28';
        document.body.appendChild(element);

        const april30 = element.shadowRoot.querySelector('.slds-day[role="button"][data-iso="2026-04-30"]');
        april30.focus();

        april30.dispatchEvent(new KeyboardEvent('keydown', {
            bubbles: true,
            composed: true,
            key: 'ArrowRight'
        }));
        await Promise.resolve();

        const may1 = element.shadowRoot.querySelector('.slds-day[role="button"][data-iso="2026-05-01"]');
        expect(element.shadowRoot.querySelector('h3').textContent).toBe('May');
        expect(may1).not.toBeNull();
        expect(may1.getAttribute('tabindex')).toBe('0');

        rafSpy.mockRestore();
    });

    it('focuses the selected day when the calendar button is clicked', () => {
        jest.useFakeTimers();
        const rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
            callback();
            return 0;
        });
        const element = createElement('c-slds-date-picker', {
            is: SldsDatePicker
        });

        element.minDate = '2026-01-01';
        element.currentValue = '2026-04-28';
        document.body.appendChild(element);

        const calendarButton = element.shadowRoot.querySelector('[data-id="button-calendar"]');
        const selectedDay = element.shadowRoot.querySelector('.slds-day[role="button"][data-iso="2026-04-28"]');
        const focusSpy = jest.spyOn(selectedDay, 'focus');

        calendarButton.click();
        jest.runOnlyPendingTimers();

        expect(focusSpy).toHaveBeenCalled();
        expect(selectedDay.getAttribute('tabindex')).toBe('0');

        rafSpy.mockRestore();
        jest.useRealTimers();
    });

    it('closes the calendar when Escape is pressed from a focused calendar day', () => {
        jest.useFakeTimers();
        const rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
            callback();
            return 0;
        });
        const element = createElement('c-slds-date-picker', {
            is: SldsDatePicker
        });

        element.portal = true;
        element.minDate = '2026-01-01';
        element.currentValue = '2026-04-28';
        document.body.appendChild(element);

        const calendarButton = element.shadowRoot.querySelector('[data-id="button-calendar"]');
        const trigger = element.shadowRoot.querySelector('.slds-dropdown-trigger');
        const selectedDay = element.shadowRoot.querySelector('.slds-day[role="button"][data-iso="2026-04-28"]');

        calendarButton.click();
        jest.runOnlyPendingTimers();
        expect(trigger.classList).toContain('slds-is-open');

        selectedDay.dispatchEvent(new KeyboardEvent('keydown', {
            bubbles: true,
            composed: true,
            key: 'Escape'
        }));

        expect(trigger.classList).not.toContain('slds-is-open');

        rafSpy.mockRestore();
        jest.useRealTimers();
    });

    it('closes the portal calendar when a day is clicked', () => {
        jest.useFakeTimers();
        const rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
            callback();
            return 0;
        });
        const element = createElement('c-slds-date-picker', {
            is: SldsDatePicker
        });

        element.portal = true;
        element.minDate = '2026-01-01';
        element.currentValue = '2026-04-28';
        document.body.appendChild(element);

        const calendarButton = element.shadowRoot.querySelector('[data-id="button-calendar"]');
        const trigger = element.shadowRoot.querySelector('.slds-dropdown-trigger');

        calendarButton.click();
        jest.runOnlyPendingTimers();
        expect(trigger.classList).toContain('slds-is-open');

        element.shadowRoot.querySelector('.slds-day[role="button"][data-iso="2026-04-29"]').click();

        expect(trigger.classList).not.toContain('slds-is-open');

        rafSpy.mockRestore();
        jest.useRealTimers();
    });

    it('closes the portal calendar when Enter or Space selects a focused day', () => {
        jest.useFakeTimers();
        const rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
            callback();
            return 0;
        });
        const element = createElement('c-slds-date-picker', {
            is: SldsDatePicker
        });

        element.portal = true;
        element.minDate = '2026-01-01';
        element.currentValue = '2026-04-28';
        document.body.appendChild(element);

        const calendarButton = element.shadowRoot.querySelector('[data-id="button-calendar"]');
        const trigger = element.shadowRoot.querySelector('.slds-dropdown-trigger');
        const selectedDay = element.shadowRoot.querySelector('.slds-day[role="button"][data-iso="2026-04-28"]');

        calendarButton.click();
        jest.runOnlyPendingTimers();
        expect(trigger.classList).toContain('slds-is-open');

        selectedDay.dispatchEvent(new KeyboardEvent('keydown', {
            bubbles: true,
            composed: true,
            key: 'Enter'
        }));
        expect(trigger.classList).not.toContain('slds-is-open');

        calendarButton.click();
        jest.runOnlyPendingTimers();
        expect(trigger.classList).toContain('slds-is-open');

        selectedDay.dispatchEvent(new KeyboardEvent('keydown', {
            bubbles: true,
            composed: true,
            key: ' '
        }));
        expect(trigger.classList).not.toContain('slds-is-open');

        rafSpy.mockRestore();
        jest.useRealTimers();
    });

    it('closes the calendar when focus moves outside the date picker', () => {
        jest.useFakeTimers();
        const rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
            callback();
            return 0;
        });
        const element = createElement('c-slds-date-picker', {
            is: SldsDatePicker
        });
        const outsideButton = document.createElement('button');

        document.body.appendChild(element);
        document.body.appendChild(outsideButton);

        const input = element.shadowRoot.querySelector('[data-id="date-input"]');
        const trigger = element.shadowRoot.querySelector('.slds-dropdown-trigger');

        input.click();
        expect(trigger.classList).toContain('slds-is-open');

        input.blur();
        input.dispatchEvent(new FocusEvent('focusout', {
            bubbles: true,
            relatedTarget: outsideButton
        }));
        jest.runOnlyPendingTimers();

        expect(trigger.classList).not.toContain('slds-is-open');

        rafSpy.mockRestore();
        jest.useRealTimers();
    });
});
