import NotValue from "../patterns/value/NotValue";
import Literal from "../patterns/value/Literal";
import Cursor from "../Cursor";

describe("NotValue", () => {
  test("Empty Constructor.", () => {
    expect(() => {
      new (NotValue as any)();
    }).toThrow();
  });

  test("Invalid name.", () => {
    expect(() => {
      new (NotValue as any)([], new Literal("blah", "Blah"));
    }).toThrow();
  });

  test("No patterns", () => {
    expect(() => {
      new (NotValue as any)("and-value");
    }).toThrow();
  });

  test("Empty patterns", () => {
    expect(() => {
      new (NotValue as any)("and-value", null);
    }).toThrow();
  });

  test("Invalid patterns", () => {
    expect(() => {
      new (NotValue as any)("and-value", {});
    }).toThrow();
  });

  test("No Match", () => {
    const john = new Literal("john", "John");
    const notJohn = new NotValue("not-john", john);
    const cursor = new Cursor("John");

    notJohn.parse(cursor);
    expect(cursor.hasUnresolvedError()).toBe(true);
    expect(cursor.parseError?.message).toBe(
      "Didn't find any characters that didn't match the john pattern."
    );
  });

  test("Success", () => {
    const john = new Literal("john", "John");
    const notJohn = new NotValue("not-john", john);
    const cursor = new Cursor("Jane");
    const node = notJohn.parse(cursor);

    expect(node?.name).toBe("not-john");
    expect(node?.value).toBe("J");
    expect(node?.startIndex).toBe(0);
    expect(node?.endIndex).toBe(0);
    expect(cursor.getIndex()).toBe(0);
  });

  test("Clone.", () => {
    const john = new Literal("john", "John");
    const notJohn = new NotValue("not-john", john);
    const clone = notJohn.clone();

    expect(notJohn.name).toBe(clone.name);
  });
});
