import { createElement } from '@lwc/engine-dom';
import SldsComboboxMultiAddon from 'c/sldsComboboxMultiAddon';

jest.mock('c/sharedStylesSldsCombobox', () => () => '', { virtual: true });
jest.mock('c/sharedStylesGlobal', () => () => '', { virtual: true });

const flushPromises = () => Promise.resolve();

describe('c-slds-combobox-multi-addon', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('clears selected pills through the public clearSelections api', async () => {
        const element = createElement('c-slds-combobox-multi-addon', {
            is: SldsComboboxMultiAddon
        });
        element.hideNone = true;
        element.switcherOptions = [
            {
                label: 'File Name',
                value: 'File_Name__c'
            }
        ];
        element.optionSets = {
            File_Name__c: {
                options: [
                    {
                        label: 'file_1.txt',
                        value: 'file_1.txt'
                    }
                ]
            }
        };
        element.initialScope = 'File_Name__c';
        element.initialSelectionsByScope = {
            File_Name__c: ['file_1.txt']
        };
        const selectionHandler = jest.fn();
        element.addEventListener('combomultiselection', selectionHandler);

        document.body.appendChild(element);
        await flushPromises();

        expect(element.shadowRoot.querySelectorAll('.slds-pill')).toHaveLength(1);

        element.clearSelections();
        await flushPromises();

        expect(element.shadowRoot.querySelectorAll('.slds-pill')).toHaveLength(0);
        expect(selectionHandler).toHaveBeenCalledTimes(1);
        expect(selectionHandler.mock.calls[0][0].detail).toEqual({});
    });
});
