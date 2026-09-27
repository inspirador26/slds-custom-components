import { createElement } from '@lwc/engine-dom';
import SldsSortLayout from 'c/sldsSortLayout';

jest.mock('c/sharedStylesSldsCombobox', () => () => '', { virtual: true });

jest.mock(
    'c/sldsCombobox',
    () => {
        const { LightningElement } = require('lwc');
        return class SldsCombobox extends LightningElement {};
    },
    { virtual: true }
);

jest.mock(
    'c/sldsRadioButtonGroup',
    () => {
        const { LightningElement } = require('lwc');
        return class SldsRadioButtonGroup extends LightningElement {};
    },
    { virtual: true }
);

const flushPromises = () => Promise.resolve();

describe('c-slds-sort-layout', () => {
    beforeEach(() => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
        console.warn.mockRestore();
    });

    it('tracks parent-provided sorts and emits changes without querying data', async () => {
        const element = createElement('c-slds-sort-layout', {
            is: SldsSortLayout
        });
        element.sortFieldOptions = [
            { label: 'Name', value: 'Name' },
            { label: 'Created Date', value: 'CreatedDate' }
        ];
        element.orderedBy = [{ fieldApiName: 'Name', isAscending: true }];
        const handler = jest.fn();
        element.addEventListener('sortchange', handler);

        document.body.appendChild(element);
        await flushPromises();

        const radio = element.shadowRoot.querySelector('c-slds-radio-button-group');
        radio.dispatchEvent(new CustomEvent('change', { detail: false }));
        await flushPromises();

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler.mock.calls[0][0].detail.usableOrderedBy).toEqual([
            {
                fieldApiName: 'Name',
                label: 'Name',
                isAscending: false,
                direction: 'desc'
            }
        ]);
    });

    it('adds and removes local sort rows', async () => {
        const element = createElement('c-slds-sort-layout', {
            is: SldsSortLayout
        });
        element.sortFieldOptions = [
            { label: 'Name', value: 'Name' },
            { label: 'Created Date', value: 'CreatedDate' }
        ];
        element.orderedBy = [{ fieldApiName: 'Name', isAscending: true }];

        document.body.appendChild(element);
        await flushPromises();

        const addButton = Array.from(element.shadowRoot.querySelectorAll('button'))
            .find((button) => button.textContent.includes('Add a sort column'));
        addButton.click();
        await flushPromises();

        expect(element.getOrderedBy()).toHaveLength(2);

        const comboboxes = element.shadowRoot.querySelectorAll('c-slds-combobox-portal');
        comboboxes[1].dispatchEvent(
            new CustomEvent('selected', { detail: 'CreatedDate' })
        );
        await flushPromises();

        expect(element.getOrderedBy()[1].fieldApiName).toBe('CreatedDate');

        const removeButtons = element.shadowRoot.querySelectorAll(
            'button[title="Remove sort column"]'
        );
        removeButtons[1].click();
        await flushPromises();

        expect(element.getOrderedBy()).toHaveLength(1);
    });

    it('removes fields selected in other rows from subsequent combobox options', async () => {
        const element = createElement('c-slds-sort-layout', {
            is: SldsSortLayout
        });
        element.sortFieldOptions = [
            { label: 'Name', value: 'Name' },
            { label: 'Created Date', value: 'CreatedDate' },
            { label: 'Owner', value: 'Owner.Name' }
        ];
        element.orderedBy = [{ fieldApiName: 'Name', isAscending: true }];

        document.body.appendChild(element);
        await flushPromises();

        const addButton = Array.from(element.shadowRoot.querySelectorAll('button'))
            .find((button) => button.textContent.includes('Add a sort column'));
        addButton.click();
        await flushPromises();

        let comboboxes = element.shadowRoot.querySelectorAll('c-slds-combobox-portal');
        expect(comboboxes[0].options.map((option) => option.value)).toEqual([
            'Name',
            'CreatedDate',
            'Owner.Name'
        ]);
        expect(comboboxes[1].options.map((option) => option.value)).toEqual([
            'CreatedDate',
            'Owner.Name'
        ]);

        comboboxes[1].dispatchEvent(
            new CustomEvent('selected', { detail: 'CreatedDate' })
        );
        await flushPromises();

        comboboxes = element.shadowRoot.querySelectorAll('c-slds-combobox-portal');
        expect(comboboxes[0].options.map((option) => option.value)).toEqual([
            'Name',
            'Owner.Name'
        ]);
        expect(comboboxes[1].options.map((option) => option.value)).toEqual([
            'CreatedDate',
            'Owner.Name'
        ]);
    });
});
