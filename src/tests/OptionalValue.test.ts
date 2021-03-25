/** @jest-environment node */
import Literal from "../patterns/value/Literal";
import OptionalValue from "../patterns/value/OptionalValue";
import Cursor from "../Cursor";

describe("OptionalValue", () => {
  test("Empty constructor.", () => {
    expect(() => {
      new (OptionalValue as any)();
    }).toThrow();
  });

  test("Empty pattern.", () => {
    expect(() => {
      new (OptionalValue as any)();
    }).toThrow();
  });

  test("Invalid pattern.", () => {
    expect(() => {
      new (OptionalValue as any)({});
    }).toThrow();
  });

  test("Match pattern.", () => {
    const john = new Literal("john", "John");
    const optionalValue = new OptionalValue(john);
    const cursor = new Cursor("John");
    const node = optionalValue.parse(cursor);

    expect(node?.name).toBe("john");
    expect(node?.value).toBe("John");
  });

  test("No Match pattern.", () => {
    const john = new Literal("john", "John");
    const optionalValue = new OptionalValue(john);
    const cursor = new Cursor("Jane");
    const node = optionalValue.parse(cursor);

    expect(node).toBe(null);
  });

  test("Name", () => {
    const john = new Literal("john", "John");
    const optionalValue = new OptionalValue(john);

    expect(optionalValue.name).toBe("optional-value");
  });
});
