import RepeatValue from "../patterns/value/RepeatValue";
import Literal from "../patterns/value/Literal";
import OptionalValue from "../patterns/value/OptionalValue";
import assert from "assert";
import Cursor from "../Cursor";

describe("RepeatValue", function () {
  test("Empty Constructor.", () => {
    assert.throws(() => {
      new (RepeatValue as any)();
    });
  });

  test("Invalid name.", () => {
    assert.throws(() => {
      new (RepeatValue as any)([], new Literal("blah", "Blah"));
    });
  });

  test("No patterns", () => {
    assert.throws(() => {
      new (RepeatValue as any)("and-value");
    });
  });

  test("Empty patterns", () => {
    assert.throws(() => {
      new (RepeatValue as any)("and-value", null);
    });
  });

  test("Invalid patterns", () => {
    assert.throws(() => {
      new (RepeatValue as any)("and-value", {});
    });
  });

  test("No Match", () => {
    const john = new Literal("john", "John");
    const johns = new RepeatValue("johns", john);
    const cursor = new Cursor("JaneJane");

    johns.parse(cursor);
    expect(cursor.hasUnresolvedError()).toBe(true);
  });

  test("Success, one John", () => {
    const john = new Literal("john", "John");
    const johns = new RepeatValue("johns", john);
    const cursor = new Cursor("John");
    const node = johns.parse(cursor);

    expect(node?.name).toBe("johns");
    expect(node?.value).toBe("John");
    expect(node?.startIndex).toBe(0);
    expect(node?.endIndex).toBe(3);
  });

  test("Success with a terminating match.", () => {
    const john = new Literal("john", "John");
    const johns = new RepeatValue("johns", john);
    const cursor = new Cursor("JohnJohnJane");
    const node = johns.parse(cursor);

    expect(node?.name).toBe("johns");
    expect(node?.value).toBe("JohnJohn");
    expect(node?.startIndex).toBe(0);
    expect(node?.endIndex).toBe(7);
    expect(cursor.getIndex()).toBe(7);
  });

  test("Bad cursor.", () => {
    const john = new Literal("john", "John");
    const johns = new RepeatValue("johns", john);

    expect(() => {
      (johns as any).parse("");
    }).toThrow();
  });

  test("Clone.", () => {
    const john = new Literal("john", "John");
    const johns = new RepeatValue("johns", john);
    const clone = johns.clone();

    expect(johns.name).toBe(clone.name);
  });

  test("Try Optional.", () => {
    const john = new Literal("john", "John");

    assert.throws(() => {
      new RepeatValue("johns", new OptionalValue(john));
    });
  });

  test("With divider.", () => {
    const cursor = new Cursor("John,John");
    const john = new Literal("john", "John");
    const divider = new Literal("divider", ",");

    const node = new RepeatValue("johns", john, divider).parse(cursor);

    expect(node?.name).toBe("johns");
    expect(node?.value).toBe("John,John");
  });
});
