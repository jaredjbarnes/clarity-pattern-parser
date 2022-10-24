/** @jest-environment node */
import { Literal, Cursor, LookAhead, Not } from "../index";

describe("LookAheadValue", () => {
  test("Look for pattern.", () => {
    const john = new Literal("john", "John");
    const lookAheadValue = new LookAhead(john);
    const cursor = new Cursor("John");
    const node = lookAheadValue.parse(cursor);

    expect(node).toBe(null);
    expect(cursor.hasUnresolvedError()).toBe(false);
  });

  test("Look for a not pattern.", () => {
    const john = new Literal("john", "John");
    const lookAheadValue = new Not(new LookAhead(john));
    const cursor = new Cursor("Joel");
    const node = lookAheadValue.parse(cursor);

    expect(node).toBe(null);
    expect(cursor.hasUnresolvedError()).toBe(false);
  });

  test("Fail looking for a pattern.", () => {
    const john = new Literal("john", "John");
    const lookAheadValue = new LookAhead(john);
    const cursor = new Cursor("Joel");
    const node = lookAheadValue.parse(cursor);

    expect(node).toBe(null);
    expect(cursor.hasUnresolvedError()).toBe(true);
  });

  test("And a look ahead together.", () => {
    const john = new Literal("john", "John");
    const lookAheadValue = new LookAhead(john);
    const cursor = new Cursor("Joel");
    const node = lookAheadValue.parse(cursor);

    expect(node).toBe(null);
    expect(cursor.hasUnresolvedError()).toBe(true);
  });
});
