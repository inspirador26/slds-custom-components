import { createElement } from "@lwc/engine-dom";
import SldsComboboxPortal from "c/sldsComboboxPortal";

jest.mock("c/sharedStylesSldsCombobox", () => () => "", { virtual: true });

const flushPromises = () => Promise.resolve();

describe("c-slds-combobox-portal", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.restoreAllMocks();
  });

  it("portals the dropdown to the body so overflow ancestors do not clip it", async () => {
    jest
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        callback();
        return 0;
      });

    const element = createElement("c-slds-combobox-portal", {
      is: SldsComboboxPortal
    });
    element.options = [{ label: "Alpha", value: "alpha" }];

    document.body.appendChild(element);
    await flushPromises();

    element.shadowRoot.querySelector('[data-id="combobox"]').click();
    await flushPromises();
    await flushPromises();

    expect(
      element.shadowRoot.querySelector("c-slds-combobox-portal-dropdown")
    ).toBeNull();
    const portalRoot = document.body.querySelector("#slds-portal-root");
    expect(portalRoot).not.toBeNull();
    expect(
      portalRoot.querySelector("c-slds-combobox-portal-dropdown")
    ).not.toBeNull();
  });

  it("positions the portalled dropdown against the input viewport rect", async () => {
    jest
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        callback();
        return 0;
      });

    jest
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function () {
        if (this.dataset?.id === "sldsComboboxInput") {
          return {
            left: 260,
            top: 140,
            right: 744,
            bottom: 206,
            width: 484,
            height: 66
          };
        }

        if (this.dataset?.element === "dropdown") {
          return {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            width: 484,
            height: 224
          };
        }

        return {
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          width: 0,
          height: 0
        };
      });

    const element = createElement("c-slds-combobox-portal", {
      is: SldsComboboxPortal
    });
    element.options = [{ label: "Alpha", value: "alpha" }];

    document.body.appendChild(element);
    await flushPromises();

    element.shadowRoot.querySelector('[data-id="combobox"]').click();
    await flushPromises();
    await flushPromises();

    const portalRoot = document.body.querySelector("#slds-portal-root");
    const dropdown = portalRoot.querySelector(
      "c-slds-combobox-portal-dropdown"
    );
    const dropdownPanel = dropdown.shadowRoot.querySelector(
      '[data-element="dropdown"]'
    );

    expect(dropdownPanel.style.left).toBe("260px");
    expect(dropdownPanel.style.top).toBe("206px");
    expect(dropdownPanel.style.width).toBe("484px");
  });

  it("closes the portalled dropdown when an option is selected", async () => {
    jest
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        callback();
        return 0;
      });

    const element = createElement("c-slds-combobox-portal", {
      is: SldsComboboxPortal
    });
    element.options = [
      { label: "Alpha", value: "alpha" },
      { label: "Beta", value: "beta" }
    ];

    document.body.appendChild(element);
    await flushPromises();

    element.shadowRoot.querySelector('[data-id="combobox"]').click();
    await flushPromises();
    await flushPromises();

    const portalRoot = document.body.querySelector("#slds-portal-root");
    const dropdown = portalRoot.querySelector(
      "c-slds-combobox-portal-dropdown"
    );
    expect(typeof dropdown.selectionCallback).toBe("function");

    dropdown.shadowRoot.querySelector('[data-value="beta"]').click();
    await flushPromises();

    expect(dropdown.style.display).toBe("none");
    expect(portalRoot.querySelector("c-slds-combobox-portal-dropdown")).toBe(
      dropdown
    );
    expect(
      element.shadowRoot.querySelector('[data-id="combobox"]').ariaExpanded
    ).toBe("false");
  });

  it("returns focus to the input when a portalled option is selected", async () => {
    jest
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        callback();
        return 0;
      });
    jest.useFakeTimers();

    const element = createElement("c-slds-combobox-portal", {
      is: SldsComboboxPortal
    });
    element.options = [
      { label: "Alpha", value: "alpha" },
      { label: "Beta", value: "beta" }
    ];
    const selectedHandler = jest.fn();
    element.addEventListener("selected", selectedHandler);

    document.body.appendChild(element);
    await flushPromises();

    element.shadowRoot.querySelector('[data-id="combobox"]').click();
    await flushPromises();
    await flushPromises();

    const input = element.shadowRoot.querySelector(
      '[data-id="sldsComboboxInput"]'
    );
    const focusSpy = jest.spyOn(input, "focus");
    const portalRoot = document.body.querySelector("#slds-portal-root");
    const dropdown = portalRoot.querySelector(
      "c-slds-combobox-portal-dropdown"
    );

    dropdown.selectionCallback("beta");
    await flushPromises();
    jest.runOnlyPendingTimers();
    await flushPromises();

    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
    expect(element.getValue()).toBe("beta");
    expect(element.shadowRoot.activeElement).toBe(input);
    expect(selectedHandler).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  it("keeps focus on the input through portalled option pointerdown, mousedown, blur, and click", async () => {
    jest
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        callback();
        return 0;
      });
    jest.useFakeTimers();

    const element = createElement("c-slds-combobox-portal", {
      is: SldsComboboxPortal
    });
    element.options = [
      { label: "Alpha", value: "alpha" },
      { label: "Beta", value: "beta" }
    ];
    const selectedHandler = jest.fn();
    element.addEventListener("selected", selectedHandler);

    document.body.appendChild(element);
    await flushPromises();

    element.shadowRoot.querySelector('[data-id="combobox"]').click();
    await flushPromises();
    await flushPromises();

    const input = element.shadowRoot.querySelector(
      '[data-id="sldsComboboxInput"]'
    );
    const focusSpy = jest.spyOn(input, "focus");
    const portalRoot = document.body.querySelector("#slds-portal-root");
    const dropdown = portalRoot.querySelector(
      "c-slds-combobox-portal-dropdown"
    );
    const option = dropdown.shadowRoot.querySelector('[data-value="beta"]');

    const pointerDown = new MouseEvent("pointerdown", {
      bubbles: true,
      composed: true,
      cancelable: true
    });
    const mouseDown = new MouseEvent("mousedown", {
      bubbles: true,
      composed: true,
      cancelable: true
    });

    option.dispatchEvent(pointerDown);
    option.dispatchEvent(mouseDown);
    input.dispatchEvent(new FocusEvent("blur"));
    option.click();
    await flushPromises();
    jest.runOnlyPendingTimers();
    await flushPromises();
    jest.runOnlyPendingTimers();

    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
    expect(pointerDown.defaultPrevented).toBe(true);
    expect(mouseDown.defaultPrevented).toBe(true);
    expect(element.getValue()).toBe("beta");
    expect(element.shadowRoot.activeElement).toBe(input);
    expect(document.activeElement).not.toBe(document.body);
    expect(selectedHandler).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  it("can reopen a previous combobox after another combobox portals its dropdown", async () => {
    jest
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        callback();
        return 0;
      });
    jest.useFakeTimers();

    const first = createElement("c-slds-combobox-portal", {
      is: SldsComboboxPortal
    });
    first.options = [
      { label: "Alpha", value: "alpha" },
      { label: "Beta", value: "beta" }
    ];

    const second = createElement("c-slds-combobox-portal", {
      is: SldsComboboxPortal
    });
    second.options = [
      { label: "Gamma", value: "gamma" },
      { label: "Delta", value: "delta" }
    ];

    document.body.appendChild(first);
    document.body.appendChild(second);
    await flushPromises();

    first.shadowRoot.querySelector('[data-id="combobox"]').click();
    await flushPromises();
    await flushPromises();

    const portalRoot = document.body.querySelector("#slds-portal-root");
    const firstDropdown = portalRoot.querySelector(
      "c-slds-combobox-portal-dropdown"
    );

    firstDropdown.selectionCallback("alpha");
    await flushPromises();
    jest.runAllTimers();
    await flushPromises();

    second.shadowRoot.querySelector('[data-id="combobox"]').click();
    await flushPromises();
    await flushPromises();

    expect(firstDropdown.isConnected).toBe(true);

    const dropdownsAfterSecondOpen = portalRoot.querySelectorAll(
      "c-slds-combobox-portal-dropdown"
    );
    expect(dropdownsAfterSecondOpen).toHaveLength(2);

    const secondDropdown = Array.from(dropdownsAfterSecondOpen).find(
      (dropdown) => dropdown !== firstDropdown
    );
    secondDropdown.selectionCallback("gamma");
    await flushPromises();
    jest.runAllTimers();
    await flushPromises();

    first.shadowRoot.querySelector('[data-id="combobox"]').click();
    await flushPromises();
    await flushPromises();

    expect(firstDropdown.isConnected).toBe(true);
    expect(firstDropdown.style.display).toBe("");
    expect(firstDropdown.getAttribute("aria-hidden")).toBeNull();
    expect(firstDropdown.currentValue).toBe("alpha");

    jest.useRealTimers();
  });
});
