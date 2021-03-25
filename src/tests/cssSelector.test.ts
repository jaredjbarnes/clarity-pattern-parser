/** @jest-environment node */
import attribute from "../queryPatterns/attribute";
import cssSelector from "../queryPatterns/cssSelector";
import Cursor from "../Cursor";

describe("attribute", () => {
  test("attribute: valid", () => {
    const cursor = new Cursor("[name='value']");
    const result = attribute.parse(cursor);

    expect(result?.name).toBe("attribute");
    expect(result?.children[1].name).toBe("name");
    expect(result?.children[1].value).toBe("name");
    expect(result?.children[2].name).toBe("equal");
    expect(result?.children[3].name).toBe("value");
    expect(result?.children[3].children[1].value).toBe("value");
    expect(cursor.didSuccessfullyParse()).toBe(true);
  });

  test("attribute: invalid", () => {
    const cursor = new Cursor("[name]='value']");
    const result = attribute.parse(cursor);

    expect(result).toBe(null);
    expect(cursor.didSuccessfullyParse()).toBe(false);
  });

  test("attribute: escaped single quotes.", () => {
    const cursor = new Cursor("[name='value''s']");
    const result = attribute.parse(cursor);

    expect(result?.name).toBe("attribute");
    expect(result?.children[1].name).toBe("name");
    expect(result?.children[1].value).toBe("name");
    expect(result?.children[2].name).toBe("equal");
    expect(result?.children[3].name).toBe("value");
    expect(result?.children[3].children[1].value).toBe("value''s");
    expect(cursor.didSuccessfullyParse()).toBe(true);
  });

  test("cssSelector: any element type", () => {
    const cursor = new Cursor("*");
    const result = cssSelector.parse(cursor);

    expect(result?.value).toBe("*");
    expect(result?.name).toBe("element-name");
    expect(result?.type).toBe("regex-value");
    expect(result?.startIndex).toBe(0);
    expect(result?.endIndex).toBe(0);
  });

  test("cssSelector: element with attribute", () => {
    const cursor = new Cursor("*[name='value']");
    const result = cssSelector.parse(cursor);

    expect(result?.type).toBe("and-composite");
    expect(result?.name).toBe("attribute-selector");
    expect(result?.children[0].name).toBe("element-name");
    expect(result?.children[0].value).toBe("*");
    expect(result?.children[1].name).toBe("attribute");
    expect(result?.startIndex).toBe(0);
    expect(result?.endIndex).toBe(14);
  });

  test("cssSelector: element with attribute and a child selector", () => {
    const cursor = new Cursor("element-name > *[name='value']");
    const result = cssSelector.parse(cursor);
  });

  test("cssSelector: element with attribute and two deep child selector", () => {
    const cursor = new Cursor("element-name > * > *[name='value']");
    const result = cssSelector.parse(cursor);
  });
});
