import { createElement } from '@lwc/engine-dom';
import SldsDockedUtilityBar from 'c/sldsDockedUtilityBar';

describe('c-slds-docked-utility-bar', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('resets the active utility button when the panel closes', () => {
        const element = createElement('c-slds-docked-utility-bar', {
            is: SldsDockedUtilityBar
        });
        element.utility1 = {
            icon: 'utility:reminder',
            label: 'Reminders'
        };

        document.body.appendChild(element);

        const utilityButton = element.shadowRoot.querySelector('[data-value="utility1"]');
        utilityButton.click();

        expect(utilityButton.classList).toContain('slds-is-active');

        element.shadowRoot.querySelector('[title="Close Panel"]').click();

        expect(utilityButton.classList).not.toContain('slds-is-active');
        expect(utilityButton.getAttribute('aria-pressed')).toBe('false');
    });

    it('resets the active utility button when slotted panel content emits panelclose', () => {
        const element = createElement('c-slds-docked-utility-bar', {
            is: SldsDockedUtilityBar
        });
        element.utility1 = {
            icon: 'utility:reminder',
            label: 'Reminders'
        };

        document.body.appendChild(element);

        const utilityButton = element.shadowRoot.querySelector('[data-value="utility1"]');
        const panel = element.shadowRoot.querySelector('.slds-utility-panel');
        utilityButton.click();

        expect(utilityButton.classList).toContain('slds-is-active');

        panel.dispatchEvent(new CustomEvent('panelclose', {
            bubbles: true,
            composed: true
        }));

        expect(utilityButton.classList).not.toContain('slds-is-active');
        expect(utilityButton.getAttribute('aria-pressed')).toBe('false');
    });
});
