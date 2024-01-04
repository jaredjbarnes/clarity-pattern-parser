/** @jest-environment node */
import And from "../patterns/And";
import Literal from "../patterns/Literal";
import Cursor from "../patterns/Cursor";
import Regex from "../patterns/Regex";
import Repeat from "../patterns/Repeat";
import LookAhead from "../patterns/LookAhead";
import Not from "../patterns/Not";
import Node from "../ast/Node";

describe("And", () => {
  test("Success", () => {
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe");
    const fullName = new And("full-name", [firstName, lastName]);
    const cursor = new Cursor("JohnDoe");
    const node = fullName.parse(cursor);

    expect(node?.name).toBe("full-name");
    expect(node?.value).toBe("JohnDoe");
    expect(node?.firstIndex).toBe(0);
    expect(node?.lastIndex).toBe(6);
  });

  test("First Part Match with optional Second part.", () => {
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe", true);
    const fullName = new And("full-name", [firstName, lastName]);
    const cursor = new Cursor("John");
    const node = fullName.parse(cursor);

    expect(node?.name).toBe("full-name");
    expect(node?.value).toBe("John");
    expect(node?.firstIndex).toBe(0);
    expect(node?.lastIndex).toBe(3);
  });

  test("First Part Match, but run out for second part.", () => {
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe");
    const fullName = new And("full-name", [firstName, lastName]);
    const cursor = new Cursor("John");
    const node = fullName.parse(cursor);

    expect(node).toBe(null);
  });

  test("No Match", () => {
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe");
    const fullName = new And("full-name", [firstName, lastName]);
    const cursor = new Cursor("JaneDoe");
    const node = fullName.parse(cursor);

    expect(node).toBe(null);
  });

  test("Partial Match without optional siblings.", () => {
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe");
    const fullName = new And("full-name", [firstName, lastName]);
    const cursor = new Cursor("JohnSmith");
    const node = fullName.parse(cursor);

    expect(node).toBe(null);
  });

  test("Success with more to parse", () => {
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe");
    const fullName = new And("full-name", [firstName, lastName]);
    const cursor = new Cursor("JohnDoe JaneDoe");
    const node = fullName.parse(cursor);

    expect(node?.name).toBe("full-name");
    expect(node?.value).toBe("JohnDoe");
    expect(node?.firstIndex).toBe(0);
    expect(node?.lastIndex).toBe(6);
  });

  test("Clone.", () => {
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe");
    const fullName = new And("full-name", [firstName, lastName]);
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
    const fullName = new And("full-name", [firstName, lastName]);
    const clone = fullName.clone("full-name-2");

    const fullNamePatterns = fullName.children;
    const _cloneChildren = clone.children;

    expect(fullNamePatterns[0]).not.toBe(_cloneChildren[0]);
    expect(fullNamePatterns[1]).not.toBe(_cloneChildren[1]);
    expect(clone.name).toBe("full-name-2");
  });

  test("Partial Match.", () => {
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe", true);
    const fullName = new And("full-name", [firstName, lastName]);
    const result = fullName.parse(new Cursor("JohnBo"));

    expect(result?.type).toBe("and");
    expect(result?.name).toBe("full-name");
    expect(result?.value).toBe("John");
  });

  test("Partial Match with string running out, and optional last name.", () => {
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe", true);
    const fullName = new And("full-name", [firstName, lastName]);
    const result = fullName.parse(new Cursor("JohnDo"));

    expect(result?.type).toBe("and");
    expect(result?.name).toBe("full-name");
    expect(result?.value).toBe("John");
  });

  test("Three parts first optional.", () => {
    const firstName = new Literal("first-name", "John", true);
    const middle = new Literal("middle", "Smith");
    const lastName = new Literal("last-name", "Doe");

    const fullName = new And("full-name", [firstName, middle, lastName]);
    const result = fullName.parse(new Cursor("SmithDoe"));

    expect(result?.value).toBe("SmithDoe");
    expect(result?.type).toBe("and");
    expect(result?.name).toBe("full-name");
  });

  test("Three parts middle optional.", () => {
    const firstName = new Literal("first-name", "John");
    const middle = new Literal("middle", "Smith", true);
    const lastName = new Literal("last-name", "Doe");

    const fullName = new And("full-name", [firstName, middle, lastName]);
    const result = fullName.parse(new Cursor("JohnDo"));

    expect(result).toBe(null);
  });

  test("Three parts third optional.", () => {
    const firstName = new Literal("first-name", "John");
    const middle = new Literal("middle", "Smith");
    const lastName = new Literal("last-name", "Doe", true);

    const fullName = new And("full-name", [firstName, middle, lastName]);
    const result = fullName.parse(new Cursor("JohnSmith"));

    expect(result?.value).toBe("JohnSmith");
    expect(result?.type).toBe("and");
    expect(result?.name).toBe("full-name");
  });

  test("Three parts third optional.", () => {
    const anotherExample = `
        column = {
                  [CHANNEL_TYPE == 'sms']:1;
                  [CHANNEL_TYPE == 'phone']:2;
                 }
    
    `
    const stringToParse =
      "firstName = if (CHANNEL_TYPE == 'sms') 1; else if (CHANNEL_TYPE == 'phone') 2; else 0;";
    const property = new Regex("property", "[a-zA-Z]+[a-zA-Z0-9_-]*");
    const ifLiteral = new Literal("if", "if");
    const elseLiteral = new Literal("else", "else");
    const elseIfLiteral = new Literal("else-if", "else if");
    const openParen = new Literal("open-paren", "(");
    const closeParen = new Literal("close-paren", ")");
    const semiColon = new Literal("semi-colon", ";");
    const isEqual = new Literal("is-equal", "==");
    const assignmentOperator = new Literal("assignment-operator", "=");
    const optionalSpaces = new Regex("optional-spaces", "\\s+", true);
    const spaces = new Regex("spaces", "\\s+");
    const quote = new Literal("quote", "'");
    const stringContent = new Regex("string-content", "[^']+");
    const string = new And("string", [quote, stringContent, quote]);
    const ifResult = new Regex(
      "number",
      "[-+]?[0-9]*[.]?[0-9]+([eE][-+]?[0-9]+)?"
    );
    const isEqualExpression = new And("is-equal", [
      property,
      optionalSpaces,
      isEqual,
      optionalSpaces,
      string,
    ]);

    const ifCondition = new And("if-condition", [
      ifLiteral,
      optionalSpaces,
      openParen,
      optionalSpaces,
      isEqualExpression,
      optionalSpaces,
      closeParen,
    ]);

    const ifBody = new And("if-body", [optionalSpaces, ifResult, semiColon]);
    const ifStatement = new And("if-statement", [ifCondition, ifBody]);
    const elseStatement = new And("else-statement", [elseLiteral, ifBody]);

    const elseIfStatement = new And("else-if-statement", [
      elseIfLiteral,
      optionalSpaces,
      openParen,
      optionalSpaces,
      isEqualExpression,
      optionalSpaces,
      closeParen,
      ifBody
    ]);

    const elseIfStatements = new Repeat(
      "else-if-statements",
      elseIfStatement,
      undefined,
      true
    );

    const complexIfStatement = new And("complex-if-statement", [
      ifStatement,
      spaces,
      elseIfStatements,
      spaces,
      elseStatement,
    ]);

    const assignment = new And("assignment", [
      property,
      optionalSpaces,
      assignmentOperator,
      optionalSpaces,
      complexIfStatement,
    ]);

    const cursor = new Cursor(stringToParse);
    cursor.startRecording();

    const result = assignment.parse(cursor);

    expect(result).toBe(true);
  });
  
});


