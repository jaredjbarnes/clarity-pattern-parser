/** @jest-environment node */
import { Cursor, Literal, ParseError, Node } from "../index";

describe("Cursor", () => {
  test("addMatch.", () => {
    const cursor = new Cursor("Text");
    const node = new Node("text-node", "Text", 0, 3, [], "Text");
    const pattern = new Literal("text", "Text");

    cursor.setIndex(3);
    cursor.addMatch(pattern, node);

    expect(cursor.history.furthestMatch.astNode).toBe(node);
    expect(cursor.history.furthestMatch.pattern).toBe(pattern);
  });

  test("addMatch that isn't as far.", () => {
    const cursor = new Cursor("Text");
    const node = new Node("text-node", "Text", 0, 3, [], "Text");
    const pattern = new Literal("text", "Text Node");

    const shorterNode = new Node("tex-node", "Tex", 0, 2, [], "Tex2");
    const shorterPattern = new Literal("tex", "Tex");

    cursor.setIndex(3);
    cursor.addMatch(pattern, node);

    expect(cursor.history.furthestMatch.astNode).toBe(node);
    expect(cursor.history.furthestMatch.pattern).toBe(pattern);

    cursor.setIndex(2);
    cursor.addMatch(shorterPattern, shorterNode);

    expect(cursor.history.furthestMatch.astNode).toBe(node);
    expect(cursor.history.furthestMatch.pattern).toBe(pattern);
  });

  test("didSuccessfullyParse.", () => {
    const cursor = new Cursor("Text");
    cursor.setIndex(3);
    expect(cursor.didSuccessfullyParse()).toBe(true);

    cursor.throwError(
      new ParseError("Failed To Parse.", 0, new Literal("T", "T"))
    );

    expect(cursor.didSuccessfullyParse()).toBe(false);
  });

  test("getChar.", () => {
    const cursor = new Cursor("Text");
    expect(cursor.getChar()).toBe("T");
    cursor.setIndex(3);
    expect(cursor.getChar()).toBe("t");
  });

  test("getIndex.", () => {
    const cursor = new Cursor("Text");
    expect(cursor.getIndex()).toBe(0);
    cursor.setIndex(3);
    expect(cursor.getIndex()).toBe(3);
  });

  test("hasNext.", () => {
    const cursor = new Cursor("Text");
    expect(cursor.hasNext()).toBe(true);
    cursor.setIndex(3);
    expect(cursor.hasNext()).toBe(false);
  });

  test("hasPrevious.", () => {
    const cursor = new Cursor("Text");
    expect(cursor.hasPrevious()).toBe(false);
    cursor.setIndex(3);
    expect(cursor.hasPrevious()).toBe(true);
  });

  test("recording history.", () => {
    const cursor = new Cursor("Text");
    const tNode = new Node("T", "T", 0, 0, [], "T");
    const tPattern = new Literal("T", "T");

    const eNode = new Node("e", "e", 1, 1, [], "e");
    const ePattern = new Literal("e", "e");

    const xNode = new Node("x", "x", 2, 2, [], "x");
    const xPattern = new Literal("x", "x");

    cursor.startRecording();

    cursor.addMatch(tPattern, tNode);
    cursor.addMatch(ePattern, eNode);

    expect(cursor.history.patterns.length).toBe(2);
    expect(cursor.history.astNodes.length).toBe(2);
    expect(cursor.history.getFurthestMatch().astNode).toBe(eNode);
    expect(cursor.history.getFurthestMatch().pattern).toBe(ePattern);
    expect(cursor.history.getLastMatch().astNode).toBe(eNode);
    expect(cursor.history.getLastMatch().pattern).toBe(ePattern);

    cursor.stopRecording();

    cursor.addMatch(xPattern, xNode);

    expect(cursor.history.patterns.length).toBe(0);
    expect(cursor.history.astNodes.length).toBe(0);
    expect(cursor.history.getFurthestMatch().astNode).toBe(xNode);
    expect(cursor.history.getFurthestMatch().pattern).toBe(xPattern);
    expect(cursor.history.getLastMatch().astNode).toBe(xNode);
    expect(cursor.history.getLastMatch().pattern).toBe(xPattern);
  });

  test("moveToBeginning.", () => {
    const cursor = new Cursor("Text");
    cursor.setIndex(3);
    cursor.moveToBeginning();

    expect(cursor.getIndex()).toBe(0);
  });

  test("moveToEnd.", () => {
    const cursor = new Cursor("Text");
    cursor.moveToEnd();

    expect(cursor.getIndex()).toBe(3);
  });

  test("setIndex outside of bounds.", () => {
    const cursor = new Cursor("Text");
    expect(() => {
      cursor.setIndex(4);
    }).toThrow();
  });

  test("next out of bounds.", () => {
    const cursor = new Cursor("Text");
    cursor.setIndex(3);

    expect(() => {
      cursor.next();
    }).toThrow();
  });

  test("previous out of bounds.", () => {
    const cursor = new Cursor("Text");

    expect(() => {
      cursor.previous();
    }).toThrow();
  });

  test("previous.", () => {
    const cursor = new Cursor("Text");
    cursor.setIndex(1);
    cursor.previous();

    expect(cursor.getIndex()).toBe(0);
  });

  test("isAtBeginning.", () => {
    const cursor = new Cursor("Text");
    cursor.isAtBeginning();

    expect(cursor.getIndex()).toBe(0);
    expect(cursor.isAtBeginning()).toBe(true);
  });

  test("setIndex invalid number.", () => {
    const cursor = new Cursor("Text");
    expect(() => {
      cursor.setIndex(-1);
    });
  });
});
