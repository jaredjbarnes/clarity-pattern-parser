import AndComposite from "../patterns/composite/AndComposite";
import Literal from "../patterns/value/Literal";
import OptionalValue from "../patterns/value/OptionalValue";
import Cursor from "../Cursor";

describe("AndComposite", () => {
  test("Match", () => {
    const john = new Literal("john", "John");
    const doe = new Literal("doe", "Doe");
    const cursor = new Cursor("JohnDoe");
    const name = new AndComposite("name", [john, doe]);

    const node = name.parse(cursor);

    expect(node?.name).toBe("name");
    expect(node?.children[0].name).toBe("john");
    expect(node?.children[1].name).toBe("doe");
    expect(node?.children[0].value).toBe("John");
    expect(node?.children[1].value).toBe("Doe");
  });

  test("AndComposite: No Match", () => {
    const john = new Literal("john", "John");
    const doe = new Literal("doe", "Doe");
    const cursor = new Cursor("JohnSmith");
    const name = new AndComposite("name", [john, doe]);

    const node = name.parse(cursor);

    expect(node).toBe(null);
    expect(cursor.getIndex()).toBe(0);
    expect(cursor.hasUnresolvedError()).toBe(true);
    expect(cursor.parseError?.message).toBe(
      "ParseError: Expected 'Doe' but found 'Smi'."
    );
  });

  test("AndComposite: test.", () => {
    const john = new Literal("john", "John");
    const doe = new Literal("doe", "Doe");
    const name = new AndComposite("name", [john, doe]);
    const isMatch = name.test("JohnDoe");

    expect(isMatch).toBe(true);
  });

  test("AndComposite: no children.", () => {
    expect(() => {
      new AndComposite("name");
    }).toThrow();
  });

  test("AndComposite: string runs out before match is done.", () => {
    const first = new Literal("first", "John");
    const last = new Literal("last", "Doe");
    const name = new AndComposite("name", [first, last]);
    const cursor = new Cursor("JohnDo");
    const result = name.parse(cursor);
  });

  test("AndComposite: last name is optional.", () => {
    const first = new Literal("first", "John");
    const last = new OptionalValue(new Literal("last", "Boe"));
    const name = new AndComposite("name", [first, last]);
    const cursor = new Cursor("JohnDo");
    const result = name.parse(cursor);

    expect(result?.name).toBe("name");
    expect(result?.type).toBe("and-composite");
    expect(result?.children[0].value).toBe("John");
    expect(result?.children[0].name).toBe("first");
    expect(result?.children[0].type).toBe("literal");
  });

  test("AndComposite: three non-optional patterns.", () => {
    const first = new Literal("first", "John");
    const middle = new Literal("middle", "Smith");
    const last = new Literal("last", "Doe");
    const name = new AndComposite("name", [first, middle, last]);
    const cursor = new Cursor("JohnDoe");
    const result = name.parse(cursor);
  });

  test("AndComposite: full name, middle optional, and last name isn't.", () => {
    const first = new Literal("first", "John");
    const middle = new OptionalValue(new Literal("middle", "Smith"));
    const last = new Literal("last", "Doe");
    const name = new AndComposite("name", [first, middle, last]);
    const cursor = new Cursor("JohnDoe");
    const result = name.parse(cursor);
  });

  test("AndComposite: clone.", () => {
    const john = new Literal("john", "John");
    const doe = new Literal("doe", "Doe");
    const name = new AndComposite("name", [john, doe]);
    const clone = name.clone("name2");

    expect(clone.name).toBe("name2");
  });
});
