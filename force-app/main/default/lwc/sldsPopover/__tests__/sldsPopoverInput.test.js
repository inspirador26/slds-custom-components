import { createElement } from '@lwc/engine-dom';
import SldsPopover from 'c/sldsPopover';

describe('c-slds-popover', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('applies horizontal and vertical popover adjustments to host vars', () => {
        const element = createElement('c-slds-popover', {
            is: SldsPopover
        });
        document.body.appendChild(element);

        element.adjustHorizontal = '12px';
        element.adjustVertical = '0.5rem';

        expect(element.adjustHorizontal).toBe('12px');
        expect(element.adjustVertical).toBe('0.5rem');
        expect(element.style.getPropertyValue('--popover-adjust-x')).toBe('12px');
        expect(element.style.getPropertyValue('--popover-adjust-y')).toBe('-0.5rem');
    });

    it('falls back to zero adjustments for invalid values', () => {
        const element = createElement('c-slds-popover', {
            is: SldsPopover
        });
        document.body.appendChild(element);

        element.adjustHorizontal = '12%';
        element.adjustVertical = 'not-a-size';

        expect(element.adjustHorizontal).toBe('0px');
        expect(element.adjustVertical).toBe('0px');
        expect(element.style.getPropertyValue('--popover-adjust-x')).toBe('0px');
        expect(element.style.getPropertyValue('--popover-adjust-y')).toBe('0px');
    });
});
