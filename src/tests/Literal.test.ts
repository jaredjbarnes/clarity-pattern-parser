/** @jest-environment node */
import { Literal, Cursor } from "../index";

describe("Literal", () => {
  test("Empty literal.", () => {
    expect(() => {
      new Literal("literal", "");
    }).toThrow();
  });

  test("exec.", () => {
    const john = new Literal("john", "John");

    const result = john.exec("John");
    const result2 = john.exec("Jane");

    const expectedValue = {
      type: "literal",
      name: "john",
      startIndex: 0,
      endIndex: 3,
      children: [],
      value: "John",
    };

    expect(JSON.stringify(result)).toBe(JSON.stringify(expectedValue));
    expect(result2).toBe(null);
  });

  test("Match.", () => {
    const variable = new Literal("variable", "var");
    const cursor = new Cursor("var foo = 'Hello World';");
    const node = variable.parse(cursor);

    expect(node?.name).toBe("variable");
    expect(node?.value).toBe("var");
    expect(cursor.getIndex()).toBe(2);
    expect(cursor.getChar()).toBe("r");
  });

  test("Match at end.", () => {
    const variable = new Literal("variable", "var");
    const cursor = new Cursor("var");
    const node = variable.parse(cursor);

    expect(node?.name).toBe("variable");
    expect(node?.value).toBe("var");
    expect(cursor.getIndex()).toBe(2);
    expect(cursor.getChar()).toBe("r");
    expect(cursor.isAtEnd()).toBe(true);
  });

  test("No match.", () => {
    const variable = new Literal("variable", "var");
    const cursor = new Cursor("vax");

    variable.parse(cursor);

    expect(cursor.hasUnresolvedError()).toBe(true);
    expect(cursor.getIndex()).toBe(0);
    expect(cursor.getChar()).toBe("v");
  });

  test("Bad cursor.", () => {
    const variable = new Literal("variable", "var");

    expect(() => {
      (variable as any).parse();
    }).toThrow();
  });

  test("Pattern methods.", () => {
    const variable = new Literal("variable", "var");
    const clone = variable.clone();

    expect(variable.name).toBe(clone.name);
    expect(variable.children.length).toBe(clone.children.length);
  });
});
