/** @jest-environment node */
import Or from "../patterns/Or";
import Literal from "../patterns/Literal";
import Cursor from "../Cursor";

describe("Or", () => {
  test("Or: Empty array parser.", () => {
    expect(() => {
      new Or("name", []);
    }).toThrow();
  });

  test("Or: One Pattern.", () => {
    expect(() => {
      new Or("name", [new Literal("some-value", "")]);
    }).toThrow();
  });

  test("Or: Name and patterns.", () => {
    const letter = new Literal("a", "a");
    const number = new Literal("1", "1");
    const alphaNumeric = new Or("alpha-numeric", [letter, number]);

    const letterCursor = new Cursor("a");
    const numberCursor = new Cursor("1");

    const letterNode = alphaNumeric.parse(letterCursor);
    const numberNode = alphaNumeric.parse(numberCursor);

    expect(letterNode?.name).toBe("alpha-numeric");
    expect(letterNode?.value).toBe("a");

    expect(numberNode?.name).toBe("alpha-numeric");
    expect(numberNode?.value).toBe("1");
  });

  test("Or: Fail.", () => {
    const letter = new Literal("a", "a");
    const number = new Literal("1", "1");
    const alphaNumeric = new Or("alpha-numeric", [letter, number]);

    const letterCursor = new Cursor("b");
    const numberCursor = new Cursor("2");

    const letterNode = alphaNumeric.parse(letterCursor);
    const numberNode = alphaNumeric.parse(numberCursor);

    expect(letterNode).toBe(null);
    expect(numberNode).toBe(null);
  });

  test("Or: Clone.", () => {
    const letter = new Literal("a", "a");
    const number = new Literal("1", "1");
    const alphaNumeric = new Or("alpha-numeric", [letter, number]);

    const clone = alphaNumeric.clone();

    expect(alphaNumeric.children.length).toBe(clone.children.length);
    expect(alphaNumeric.name).toBe(clone.name);
  });

  test("Or: Invalid patterns.", () => {
    expect(() => {
      new (Or as any)("some-alpha-numeric", [{}, null]);
    });
  });

  test("Or: Not enough patterns.", () => {
    expect(() => {
      new (Or as any)("some-alpha-numeric", [{}]);
    });
  });

  test("Or: Bad name.", () => {
    expect(() => {
      new (Or as any)({}, [new Literal("a", "a"), new Literal("a", "a")]);
    });
  });

  test("Or: Bad cursor.", () => {
    expect(() => {
      new (Or as any)("A", [
        new Literal("a", "a"),
        new Literal("a", "a"),
      ]).parse();
    });
  });

  test("Or: Furthest Parse Error.", () => {
    const longer = new Literal("longer", "Longer");
    const bang = new Literal("bang", "Bang");
    const orValue = new (Or as any)("test", [longer, bang]);
    const cursor = new Cursor("Longed");

    orValue.parse(cursor);

    expect(cursor.getIndex()).toBe(0);
    expect(cursor.hasUnresolvedError()).toBe(true);
  });

  test("Or: Last pattern matches.", () => {
    const longer = new Literal("longer", "Longer");
    const bang = new Literal("bang", "Bang");
    const orValue = new (Or as any)("test", [longer, bang]);
    const cursor = new Cursor("Bang");

    const node = orValue.parse(cursor);

    expect(node.name).toBe("test");
    expect(node.value).toBe("Bang");
  });
});
