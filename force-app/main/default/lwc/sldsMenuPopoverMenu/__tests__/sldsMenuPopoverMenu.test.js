import { createElement } from "@lwc/engine-dom";
import SldsMenuPopoverMenu from "c/sldsMenuPopoverMenu";

jest.mock("c/sharedStylesGlobal", () => () => "", { virtual: true });

const flushPromises = () => Promise.resolve();

describe("c-slds-menu-popover-menu", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.restoreAllMocks();
  });

  it("renders group options as menu subheaders", async () => {
    const element = createElement("c-slds-menu-popover-menu", {
      is: SldsMenuPopoverMenu
    });
    element.options = [
      { group: "My Custom Subheader" },
      { label: "Option 1", value: "Option 1" },
      { group: "My Custom Subheader 2" },
      { label: "Option 2", value: "Option 2" }
    ];

    document.body.appendChild(element);
    await flushPromises();

    const headers = Array.from(
      element.shadowRoot.querySelectorAll(".slds-dropdown__header")
    );
    const menuItems = Array.from(
      element.shadowRoot.querySelectorAll('[role="menuitem"]')
    );

    expect(headers.map((header) => header.textContent.trim())).toEqual([
      "My Custom Subheader",
      "My Custom Subheader 2"
    ]);
    expect(
      headers.every((header) => header.getAttribute("role") === "presentation")
    ).toBe(true);
    expect(menuItems.map((item) => item.textContent.trim())).toEqual([
      "Option 1",
      "Option 2"
    ]);
  });

  it("does not dispatch a selection for group subheaders", async () => {
    const element = createElement("c-slds-menu-popover-menu", {
      is: SldsMenuPopoverMenu
    });
    element.options = [
      { group: "My Custom Subheader" },
      { label: "Option 1", value: "Option 1" }
    ];

    const selectionHandler = jest.fn();
    element.addEventListener("selection", selectionHandler);

    document.body.appendChild(element);
    await flushPromises();

    element.shadowRoot.querySelector(".slds-dropdown__header").click();
    expect(selectionHandler).not.toHaveBeenCalled();

    element.shadowRoot.querySelector('[role="menuitem"]').click();
    expect(selectionHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { id: null, selection: "Option 1" }
      })
    );
  });
});
