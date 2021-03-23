import whitespace from "./javascriptPatterns/whitespace";
import name from "./javascriptPatterns/name";
import number from "./javascriptPatterns/number";
import Cursor from "../Cursor";
import filter from "./naturalLanguage/filter";
import string from "./javascriptPatterns/string";
import cssValue from "./cssPatterns/cssValue";

describe("Complex Examples", () => {
  test("Complex Examples: A Comment", () => {
    const cursor = new Cursor(`/*
          This is the comment!
      */`);

    const node = whitespace.parse(cursor);
  });

  test("Complex Examples: name", () => {
    const validName = new Cursor("firstName1_2");
    const invalidName = new Cursor("1_firstName");
    const validNode = name.parse(validName);

    expect(validNode?.name).toBe("name");
    expect(validNode?.value).toBe("firstName1_2");

    name.parse(invalidName);
    expect(invalidName.hasUnresolvedError()).toBe(true);
  });

  test("Complex Examples: number", () => {
    const validNumber = new Cursor("1234");
    const invalidNumber = new Cursor("01234");
    const validFraction = new Cursor("0.1");
    const validExponent = new Cursor("1.23e+5");
    const singleNumber = new Cursor("1");

    const validNumberNode = number.parse(validNumber);
    const validFractionNode = number.parse(validFraction);
    const validExponentNode = number.parse(validExponent);
    const singleNumberNode = number.parse(singleNumber);

    expect(validNumberNode?.name).toBe("number");
    expect(validNumberNode?.value).toBe("1234");

    expect(validFractionNode?.name).toBe("number");
    expect(validFractionNode?.value).toBe("0.1");

    expect(validExponentNode?.name).toBe("number");
    expect(validExponentNode?.value).toBe("1.23e+5");
    expect(validExponent.didSuccessfullyParse()).toBe(true);

    expect(singleNumberNode?.name).toBe("number");
    expect(singleNumberNode?.value).toBe("1");

    name.parse(invalidNumber);
    expect(invalidNumber.hasUnresolvedError()).toBe(true);
  });

  test("Complex Examples: string", () => {
    const testString = `"This is a string!."`;
    const validString = new Cursor(testString);
    const validStringNode = string.parse(validString);

    expect(validStringNode?.name).toBe("string");
    expect(validStringNode?.value).toBe(testString);
  });

  test("Complex Examples: Natural Language.", () => {
    const validCursor = new Cursor(
      "Match records where firstName is 'John' and lastName is 'Barnes'."
    );
    const invalidCursor = new Cursor("Match records where firstName ");
    const node = filter.parse(validCursor);

    try {
      filter.parse(invalidCursor);
    } catch (error) {}
  });

  test("Complex Examples: cssMethod", () => {
    const result = cssValue.exec(
      "linear-gradient(to left, #333, #333 50%, #eee 75%, #333 75%)"
    );
  });
});
