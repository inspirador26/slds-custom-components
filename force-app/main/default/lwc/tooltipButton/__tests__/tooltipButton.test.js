import { createElement } from '@lwc/engine-dom';
import TooltipButton from 'c/tooltipButton';

describe('c-tooltip-button', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    const createTooltipButton = ({ stealFocus = false } = {}) => {
        const element = createElement('c-tooltip-button', {
            is: TooltipButton
        });
        element.stealFocus = stealFocus;
        const trigger = document.createElement('button');
        trigger.setAttribute('slot', 'tipTrigger');
        trigger.textContent = 'Trigger';

        element.appendChild(trigger);
        document.body.appendChild(element);

        return {
            element,
            trigger,
            tooltip: element.shadowRoot.querySelector('[data-id="help-tooltip"]')
        };
    };

    const dispatchFocusIn = (trigger) => {
        trigger.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }));
    };

    const dispatchFocusOut = (trigger, relatedTarget = null) => {
        trigger.dispatchEvent(new FocusEvent('focusout', {
            bubbles: true,
            composed: true,
            relatedTarget
        }));
    };

    const dispatchKeyDown = (trigger, key) => {
        const event = new KeyboardEvent('keydown', {
            bubbles: true,
            composed: true,
            cancelable: true,
            key
        });
        trigger.dispatchEvent(event);
        return event;
    };

    it('shows the tooltip when the tip trigger receives focus', () => {
        const { trigger, tooltip } = createTooltipButton({ stealFocus: true });

        dispatchFocusIn(trigger);

        expect(tooltip.classList).not.toContain('slds-hide');
        expect(tooltip.classList).not.toContain('slds-fall-into-ground');
        expect(tooltip.classList).toContain('slds-rise-from-ground');
    });

    it('does not show the tooltip on focus unless stealFocus is true', () => {
        const { trigger, tooltip } = createTooltipButton();

        dispatchFocusIn(trigger);

        expect(tooltip.classList).toContain('slds-hide');
        expect(tooltip.classList).not.toContain('slds-rise-from-ground');
    });

    it('hides the tooltip when the tip trigger loses focus', () => {
        const { trigger, tooltip } = createTooltipButton({ stealFocus: true });

        dispatchFocusIn(trigger);
        dispatchFocusOut(trigger);
        tooltip.dispatchEvent(new CustomEvent('animationend'));

        expect(tooltip.classList).toContain('slds-hide');
        expect(tooltip.classList).toContain('slds-fall-into-ground');
        expect(tooltip.classList).not.toContain('slds-rise-from-ground');
    });

    it('keeps the tooltip visible when the trigger loses focus while hovered', () => {
        const { element, trigger, tooltip } = createTooltipButton({ stealFocus: true });

        element.shadowRoot.querySelector('div').dispatchEvent(new CustomEvent('mouseenter'));
        dispatchFocusIn(trigger);
        dispatchFocusOut(trigger);

        expect(tooltip.classList).not.toContain('slds-hide');
        expect(tooltip.classList).toContain('slds-rise-from-ground');
    });

    it('keeps the tooltip visible when the mouse leaves while the trigger is focused', () => {
        const { element, trigger, tooltip } = createTooltipButton({ stealFocus: true });

        element.shadowRoot.querySelector('div').dispatchEvent(new CustomEvent('mouseenter'));
        dispatchFocusIn(trigger);
        element.shadowRoot.querySelector('div').dispatchEvent(new CustomEvent('mouseleave'));

        expect(tooltip.classList).not.toContain('slds-hide');
        expect(tooltip.classList).toContain('slds-rise-from-ground');
    });

    it('hides the tooltip when focus moves to another tooltip trigger', () => {
        const first = createTooltipButton({ stealFocus: true });
        const second = createTooltipButton({ stealFocus: true });

        dispatchFocusIn(first.trigger);
        dispatchFocusOut(first.trigger, second.trigger);
        first.tooltip.dispatchEvent(new CustomEvent('animationend'));
        dispatchFocusIn(second.trigger);

        expect(first.tooltip.classList).toContain('slds-hide');
        expect(first.tooltip.classList).toContain('slds-fall-into-ground');
        expect(second.tooltip.classList).not.toContain('slds-hide');
        expect(second.tooltip.classList).toContain('slds-rise-from-ground');
    });

    it('prevents default, stops propagation, and closes the tooltip when Escape is pressed on the focused trigger', () => {
        const { trigger, tooltip } = createTooltipButton({ stealFocus: true });
        const bodyKeyDownHandler = jest.fn();

        document.body.addEventListener('keydown', bodyKeyDownHandler);
        dispatchFocusIn(trigger);
        const event = dispatchKeyDown(trigger, 'Escape');
        document.body.removeEventListener('keydown', bodyKeyDownHandler);
        tooltip.dispatchEvent(new CustomEvent('animationend'));

        expect(event.defaultPrevented).toBe(true);
        expect(bodyKeyDownHandler).not.toHaveBeenCalled();
        expect(tooltip.classList).toContain('slds-hide');
        expect(tooltip.classList).toContain('slds-fall-into-ground');
        expect(tooltip.classList).not.toContain('slds-rise-from-ground');
    });
});
