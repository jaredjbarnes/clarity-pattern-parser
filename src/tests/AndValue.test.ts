import AndValue from "../patterns/value/AndValue";
import Literal from "../patterns/value/Literal";
import OptionalValue from "../patterns/value/OptionalValue";
import Cursor from "../Cursor";

describe("AndValue", () => {
  test("One Pattern", () => {
    expect(() => {
      new AndValue("and-value", [new Literal("literal", "LITERAL")]);
    }).toThrow();
  });

  test("Success", () => {
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe");
    const fullName = new AndValue("full-name", [firstName, lastName]);
    const cursor = new Cursor("JohnDoe");
    const node = fullName.parse(cursor);

    expect(node?.name).toBe("full-name");
    expect(node?.value).toBe("JohnDoe");
    expect(node?.startIndex).toBe(0);
    expect(node?.endIndex).toBe(6);
  });

  test("First Part Match with optional Second part.", () => {
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe");
    const fullName = new AndValue("full-name", [
      firstName,
      new OptionalValue(lastName),
    ]);
    const cursor = new Cursor("John");
    const node = fullName.parse(cursor);

    expect(node?.name).toBe("full-name");
    expect(node?.value).toBe("John");
    expect(node?.startIndex).toBe(0);
    expect(node?.endIndex).toBe(3);
  });

  test("First Part Match, but run out for second part.", () => {
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe");
    const fullName = new AndValue("full-name", [firstName, lastName]);
    const cursor = new Cursor("John");
    const node = fullName.parse(cursor);

    expect(node).toBe(null);
  });

  test("No Match", () => {
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe");
    const fullName = new AndValue("full-name", [firstName, lastName]);
    const cursor = new Cursor("JaneDoe");
    const node = fullName.parse(cursor);

    expect(node).toBe(null);
  });

  test("Partial Match without optional siblings.", () => {
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe");
    const fullName = new AndValue("full-name", [firstName, lastName]);
    const cursor = new Cursor("JohnSmith");
    const node = fullName.parse(cursor);

    expect(node).toBe(null);
  });

  test("Success with more to parse", () => {
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe");
    const fullName = new AndValue("full-name", [firstName, lastName]);
    const cursor = new Cursor("JohnDoe JaneDoe");
    const node = fullName.parse(cursor);

    expect(node?.name).toBe("full-name");
    expect(node?.value).toBe("JohnDoe");
    expect(node?.startIndex).toBe(0);
    expect(node?.endIndex).toBe(6);
  });

  test("Clone.", () => {
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe");
    const fullName = new AndValue("full-name", [firstName, lastName]);
    const clone = fullName.clone();

    const fullNamePatterns = fullName.children;
    const _cloneChildren = clone.children;

    expect(fullNamePatterns[0]).not.toBe(_cloneChildren[0]);
    expect(fullNamePatterns[1]).not.toBe(_cloneChildren[1]);
    expect(fullName.name).toBe(clone.name);
  });

  test("Clone with custom name.", () => {
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe");
    const fullName = new AndValue("full-name", [firstName, lastName]);
    const clone = fullName.clone("full-name-2");

    const fullNamePatterns = fullName.children;
    const _cloneChildren = clone.children;

    expect(fullNamePatterns[0]).not.toBe(_cloneChildren[0]);
    expect(fullNamePatterns[1]).not.toBe(_cloneChildren[1]);
    expect(clone.name).toBe("full-name-2");
  });

  test("Partial Match.", () => {
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe");
    const fullName = new AndValue("full-name", [
      firstName,
      new OptionalValue(lastName),
    ]);
    const result = fullName.parse(new Cursor("JohnBo"));

    expect(result?.type).toBe("and-value");
    expect(result?.name).toBe("full-name");
    expect(result?.value).toBe("John");
  });

  test("Partial Match with string running out, and optional last name.", () => {
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe");
    const fullName = new AndValue("full-name", [
      firstName,
      new OptionalValue(lastName),
    ]);
    const result = fullName.parse(new Cursor("JohnDo"));

    expect(result?.type).toBe("and-value");
    expect(result?.name).toBe("full-name");
    expect(result?.value).toBe("John");
  });

  test("Three parts first optional.", () => {
    const firstName = new Literal("first-name", "John");
    const middle = new Literal("middle", "Smith");
    const lastName = new Literal("last-name", "Doe");

    const fullName = new AndValue("full-name", [
      new OptionalValue(firstName),
      middle,
      lastName,
    ]);
    const result = fullName.parse(new Cursor("SmithDoe"));

    expect(result?.value).toBe("SmithDoe");
    expect(result?.type).toBe("and-value");
    expect(result?.name).toBe("full-name");
  });

  test("Three parts middle optional.", () => {
    const firstName = new Literal("first-name", "John");
    const middle = new Literal("middle", "Smith");
    const lastName = new Literal("last-name", "Doe");

    const fullName = new AndValue("full-name", [
      firstName,
      new OptionalValue(middle),
      lastName,
    ]);
    const result = fullName.parse(new Cursor("JohnDo"));

    expect(result).toBe(null);
  });

  test("Three parts third optional.", () => {
    const firstName = new Literal("first-name", "John");
    const middle = new Literal("middle", "Smith");
    const lastName = new Literal("last-name", "Doe");

    const fullName = new AndValue("full-name", [
      firstName,
      middle,
      new OptionalValue(lastName),
    ]);
    const result = fullName.parse(new Cursor("JohnSmith"));

    expect(result?.value).toBe("JohnSmith");
    expect(result?.type).toBe("and-value");
    expect(result?.name).toBe("full-name");
  });
});
