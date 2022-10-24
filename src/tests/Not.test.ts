import Cursor from "../Cursor";
import And from "../patterns/And";
import Literal from "../patterns/Literal";
import Not from "../patterns/Not";
import Or from "../patterns/Or";
import Regex from "../patterns/Regex";

describe("Not", () => {
  test("Negate pattern with literal.", () => {
    const greaterThan = new Literal("greater-than", ">");
    const lessThan = new Literal("less-than", "<");
    const from = new Literal("from", "FROM");
    const table = new Literal("table", "Table");
    const operator = new Or("operator", [lessThan, greaterThan]);
    const keywords = new And("keywords-with-space", [
      new Or("keywords", [from, table]),
      new Literal("space", " "),
    ]);
    const identFirstPart = new Regex(
      "ident-first-part",
      "[a-zA-Z_$][a-zA-Z0-9_]*"
    );
    const identity = new And("identity", [
      new Not(keywords),
      new Not(operator),
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
