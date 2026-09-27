import { createElement } from "@lwc/engine-dom";
import SldsMenuPopoverButton from "c/sldsMenuPopoverButton";

jest.mock("c/sharedStylesGlobal", () => () => "", { virtual: true });

const flushPromises = () => Promise.resolve();

describe("c-slds-menu-popover-button", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.restoreAllMocks();
  });

  it("portals the menu to the body so overflow ancestors do not clip it", async () => {
    jest
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        callback();
        return 0;
      });

    const element = createElement("c-slds-menu-popover-button", {
      is: SldsMenuPopoverButton
    });
    element.options = [{ label: "Edit", value: "edit" }];

    const trigger = document.createElement("button");
    trigger.textContent = "Actions";
    element.appendChild(trigger);

    document.body.appendChild(element);
    await flushPromises();

    jest
      .spyOn(HTMLSlotElement.prototype, "assignedElements")
      .mockReturnValue([trigger]);
    element.shadowRoot.querySelector("div[aria-expanded]").click();
    await flushPromises();
    await flushPromises();

    const portalRoot = document.body.querySelector("#slds-portal-root");
    expect(portalRoot).not.toBeNull();
    expect(portalRoot.querySelector("c-slds-menu-popover-menu")).not.toBeNull();
    expect(
      element.shadowRoot.querySelector("c-slds-menu-popover-menu")
    ).toBeNull();
  });

  it("closes the portalled menu when the menu dispatches a selection", async () => {
    jest
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        callback();
        return 0;
      });

    const element = createElement("c-slds-menu-popover-button", {
      is: SldsMenuPopoverButton
    });
    element.options = [{ label: "Edit", value: "edit" }];

    const trigger = document.createElement("button");
    trigger.textContent = "Actions";
    element.appendChild(trigger);

    const selectionHandler = jest.fn();
    element.addEventListener("selection", selectionHandler);

    document.body.appendChild(element);
    await flushPromises();

    jest
      .spyOn(HTMLSlotElement.prototype, "assignedElements")
      .mockReturnValue([trigger]);
    element.shadowRoot.querySelector("div[aria-expanded]").click();
    await flushPromises();
    await flushPromises();

    const portalRoot = document.body.querySelector("#slds-portal-root");
    const menu = portalRoot.querySelector("c-slds-menu-popover-menu");
    expect(typeof menu.selectionCallback).toBe("function");
    const originalSelectionCallback = menu.selectionCallback;
    const callbackSpy = jest.fn((detail) => originalSelectionCallback(detail));
    menu.selectionCallback = callbackSpy;
    menu.shadowRoot.querySelector('[role="menuitem"]').click();
    await flushPromises();

    expect(callbackSpy).toHaveBeenCalledTimes(1);
    expect(selectionHandler).toHaveBeenCalledTimes(1);
    expect(menu.style.display).toBe("none");
    expect(
      element.shadowRoot.querySelector("div[aria-expanded]").ariaExpanded
    ).toBe("false");
  });
});
