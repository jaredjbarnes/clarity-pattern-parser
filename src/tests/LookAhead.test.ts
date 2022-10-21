/** @jest-environment node */
import Literal from "../patterns/value/Literal";
import Cursor from "../Cursor";
import LookAhead from "../patterns/LookAhead";
import NotValue from "../patterns/value/NotValue";
import OrValue from "../patterns/value/OrValue";
import RegexValue from "../patterns/value/RegexValue";
import AndValue from "../patterns/value/AndValue";

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
    const lookAheadValue = new LookAhead(new NotValue("not-john", john));
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

  test("Negate pattern with literal.", () => {
    const greaterThan = new Literal("greater-than", ">");
    const lessThan = new Literal("less-than", "<");
    const from = new Literal("from", "FROM");
    const table = new Literal("table", "Table");
    const operator = new OrValue("operator", [lessThan, greaterThan]);
    const keywords = new AndValue("keywords-with-space", [
      new OrValue("keywords", [from, table]),
      new Literal("space", " "),
    ]);
    const identFirstPart = new RegexValue(
      "ident-first-part",
      "[a-zA-Z_$][a-zA-Z0-9_]*"
    );
    const identity = new AndValue("identity", [
      new LookAhead(new NotValue("not-keywords", keywords)),
      new LookAhead(new NotValue("not-operator", operator)),
      identFirstPart,
    ]);

    const result = identity.parse(new Cursor("_goodName"));

    expect(result).not.toBeNull();

    const cursor1 = new Cursor("<badName");
    const result1 = identity.parse(cursor1);

    expect(result1).toBe(null);
    expect(cursor1.hasUnresolvedError()).toBe(true);

    const cursor2 = new Cursor("FROM_IS_OKAY");
    const result2 = identity.parse(cursor2);

    expect(result2).not.toBe(null);
    expect(cursor2.hasUnresolvedError()).toBe(false);

    const cursor3 = new Cursor("FROM ISBAD");
    const result3 = identity.parse(cursor3);

    expect(result3).toBe(null);
    expect(cursor3.hasUnresolvedError()).toBe(true);
  });
});
