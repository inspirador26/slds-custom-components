import { createElement } from "@lwc/engine-dom";
import SldsTableAuto from "c/sldsTableAuto";

describe("c-slds-table-auto", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("normalizes an ascending sorted column for subsequent async sorting", () => {
    const element = createElement("c-slds-table-auto", {
      is: SldsTableAuto
    });

    element.sortedCol = {
      fieldName: "Name",
      label: "Name",
      type: "asc",
      dtype: "text"
    };
    document.body.appendChild(element);

    expect(element.sortedCol.isAsc).toBe(true);
  });

  it("normalizes a descending sorted column for subsequent async sorting", () => {
    const element = createElement("c-slds-table-auto", {
      is: SldsTableAuto
    });

    element.sortedCol = {
      fieldName: "Name",
      label: "Name",
      type: "desc",
      dtype: "text"
    };
    document.body.appendChild(element);

    expect(element.sortedCol.isAsc).toBe(false);
  });
});
