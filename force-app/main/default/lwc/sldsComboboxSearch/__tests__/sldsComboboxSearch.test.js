import { createElement } from '@lwc/engine-dom';
import SldsComboboxSearch from 'c/sldsComboboxSearch';

const flushPromises = () => Promise.resolve();

describe('c-slds-combobox-search', () => {
    beforeAll(() => {
        global.IntersectionObserver = class {
            observe() {}
            disconnect() {}
            unobserve() {}
        };
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('selects an overload option outside the initial batch', async () => {
        const element = createElement('c-slds-combobox-search', {
            is: SldsComboboxSearch
        });

        element.isSelectionVariant = true;
        element.options = Array.from({ length: 51 }, (_, idx) => ({
            label: `Option ${idx + 1}`,
            value: `value-${idx + 1}`
        }));

        document.body.appendChild(element);
        await flushPromises();

        element._value = {
            label: 'Option 51',
            value: 'value-51'
        };

        element.handleSelectionVariant();

        expect(element._selectedOption).toMatchObject({
            label: 'Option 51',
            value: 'value-51'
        });
    });
});
