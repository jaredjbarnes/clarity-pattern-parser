import OrValue from "../patterns/value/OrValue";
import AnyOfThese from "../patterns/value/AnyOfThese";
import Literal from "../patterns/value/Literal";
import Cursor from "../Cursor";

describe("OrValue", () => {
  test("OrValue: Empty constructor.", () => {
    expect(() => {
      new (OrValue as any)();
    }).toThrow();
  });

  test("OrValue: Undefined parser.", () => {
    expect(() => {
      new (OrValue as any)("name");
    }).toThrow();
  });

  test("OrValue: Null patterns.", () => {
    expect(() => {
      new (OrValue as any)("name", null);
    }).toThrow();
  });

  test("OrValue: Empty array parser.", () => {
    expect(() => {
      new (OrValue as any)("name", []);
    }).toThrow();
  });

  test("OrValue: One parser.", () => {
    expect(() => {
      new (OrValue as any)("name", [new Literal("some-value", "")]);
    }).toThrow();
  });

  test("OrValue: Name and patterns.", () => {
    const letter = new AnyOfThese(
      "letter",
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    );
    const number = new AnyOfThese("number", "0987654321");
    const alphaNumeric = new (OrValue as any)("alpha-numeric", [
      letter,
      number,
    ]);

    const letterCursor = new Cursor("a");
    const numberCursor = new Cursor("1");

    const letterNode = alphaNumeric.parse(letterCursor);
    const numberNode = alphaNumeric.parse(numberCursor);

    expect(letterNode.name).toBe("alpha-numeric");
    expect(letterNode.value).toBe("a");

    expect(numberNode.name).toBe("alpha-numeric");
    expect(numberNode.value).toBe("1");
  });

  test("OrValue: Optional Pattern as one of the patterns.", () => {
    const letter = new AnyOfThese(
      "letter",
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    );
    const number = new AnyOfThese("number", "0987654321");
    const alphaNumeric = new (OrValue as any)("alpha-numeric", [
      letter,
      number,
    ]);

    const letterCursor = new Cursor("a");
    const numberCursor = new Cursor("1");

    const letterNode = alphaNumeric.parse(letterCursor);
    const numberNode = alphaNumeric.parse(numberCursor);

    expect(letterNode.name).toBe("alpha-numeric");
    expect(letterNode.value).toBe("a");

    expect(numberNode.name).toBe("alpha-numeric");
    expect(numberNode.value).toBe("1");
  });

  test("OrValue: Fail.", () => {
    const letter = new AnyOfThese("some-letter", "abc");
    const number = new AnyOfThese("some-number", "123");
    const alphaNumeric = new (OrValue as any)("some-alpha-numeric", [
      letter,
      number,
    ]);

    const letterCursor = new Cursor("d");
    const numberCursor = new Cursor("4");

    const letterNode = alphaNumeric.parse(letterCursor);
    const numberNode = alphaNumeric.parse(numberCursor);

    expect(letterCursor.getIndex()).toBe(0);
    expect(letterCursor.hasUnresolvedError()).toBe(true);

    expect(numberCursor.getIndex()).toBe(0);
    expect(numberCursor.hasUnresolvedError()).toBe(true);
  });

  test("OrValue: Clone.", () => {
    const letter = new AnyOfThese("some-letter", "abc");
    const number = new AnyOfThese("some-number", "123");
    const alphaNumeric = new (OrValue as any)("some-alpha-numeric", [
      letter,
      number,
    ]);

    const clone = alphaNumeric.clone();

    expect(alphaNumeric.children.length).toBe(clone.children.length);
    expect(alphaNumeric.name).toBe(clone.name);
  });

  test("OrValue: Invalid patterns.", () => {
    expect(() => {
      new (OrValue as any)("some-alpha-numeric", [{}, null]);
    });
  });

  test("OrValue: Not enough patterns.", () => {
    expect(() => {
      new (OrValue as any)("some-alpha-numeric", [{}]);
    });
  });

  test("OrValue: Bad name.", () => {
    expect(() => {
      new (OrValue as any)({}, [new Literal("a", "a"), new Literal("a", "a")]);
    });
  });

  test("OrValue: Bad cursor.", () => {
    expect(() => {
      new (OrValue as any)("A", [
        new Literal("a", "a"),
        new Literal("a", "a"),
      ]).parse();
    });
  });

  test("OrValue: Furthest Parse Error.", () => {
    const longer = new Literal("longer", "Longer");
    const bang = new Literal("bang", "Bang");
    const orValue = new (OrValue as any)("test", [longer, bang]);
    const cursor = new Cursor("Longed");

    orValue.parse(cursor);

    expect(cursor.getIndex()).toBe(0);
    expect(cursor.hasUnresolvedError()).toBe(true);
  });

  test("OrValue: Last pattern matches.", () => {
    const longer = new Literal("longer", "Longer");
    const bang = new Literal("bang", "Bang");
    const orValue = new (OrValue as any)("test", [longer, bang]);
    const cursor = new Cursor("Bang");

    const node = orValue.parse(cursor);

    expect(node.name).toBe("test");
    expect(node.value).toBe("Bang");
  });
});
