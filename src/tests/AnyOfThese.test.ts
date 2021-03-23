import AnyOfThese from "../patterns/value/AnyOfThese";
import Cursor from "../Cursor";

describe("AnyOfThese", () => {
  test("Empty string provided as characters.", () => {
    expect(() => {
      new AnyOfThese("no-characters", "");
    }).toThrow();
  });

  test("Single character.", () => {
    const lowerCaseA = new AnyOfThese("lower-case-a", "a");
    const cursor = new Cursor("a");
    const node = lowerCaseA.parse(cursor);

    expect(node?.name).toBe("lower-case-a");
    expect(node?.value).toBe("a");
    expect(node?.startIndex).toBe(0);
    expect(node?.endIndex).toBe(0);
    expect(cursor.isAtEnd()).toBe(true);
    expect(cursor.getChar()).toBe("a");
  });

  test("Uppercase A and lowercase A.", () => {
    const letterA = new AnyOfThese("letter-a", "Aa");
    const lowerCaseCursor = new Cursor("a");
    const upperCaseCursor = new Cursor("A");
    const lowerCaseNode = letterA.parse(lowerCaseCursor);
    const upperCaseNode = letterA.parse(upperCaseCursor);

    expect(lowerCaseNode?.name).toBe("letter-a");
    expect(lowerCaseNode?.value).toBe("a");
    expect(lowerCaseNode?.startIndex).toBe(0);
    expect(lowerCaseNode?.endIndex).toBe(0);

    expect(upperCaseNode?.name).toBe("letter-a");
    expect(upperCaseNode?.value).toBe("A");
    expect(upperCaseNode?.startIndex).toBe(0);
    expect(upperCaseNode?.endIndex).toBe(0);

    expect(upperCaseCursor.getChar()).toBe("A");
    expect(upperCaseCursor.isAtEnd()).toBe(true);

    expect(lowerCaseCursor.getChar()).toBe("a");
    expect(lowerCaseCursor.isAtEnd()).toBe(true);
  });

  test("Match with long cursor.", () => {
    const letterA = new AnyOfThese("letter-a", "Aa");
    const cursor = new Cursor("a12345");
    const node = letterA.parse(cursor);

    expect(node?.name).toBe("letter-a");
    expect(node?.value).toBe("a");
    expect(cursor.getChar()).toBe("a");
    expect(cursor.getIndex()).toBe(0);
  });

  test("No match.", () => {
    const letterA = new AnyOfThese("letter-a", "Aa");
    const cursor = new Cursor("12345");
    const node = letterA.parse(cursor);

    expect(node).toBe(null);
  });

  test("Pattern Methods.", () => {
    const letterA = new AnyOfThese("letter-a", "Aa");

    expect(letterA.name).toBe("letter-a");
    expect(letterA.children.length).toBe(0);
  });
});
