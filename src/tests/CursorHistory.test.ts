/** @jest-environment node */
import CursorHistory from "../patterns/CursorHistory";
import { Literal, Node, Cursor, ParseError } from "../index";
import sentence from "./patterns/sentence";
describe("CursorHistory", () => {
  test("addMatch", () => {
    const cursorHistory = new CursorHistory();
    const pattern = new Literal("T", "T");
    const node = new Node("T", "T", 0, 1, [], "T");

    cursorHistory.addMatch(pattern, node);
    expect(cursorHistory.getFurthestMatch().pattern).toBe(pattern);
    expect(cursorHistory.getFurthestMatch().node).toBe(node);
  });

  test("addMatch with Recording", () => {
    const cursorHistory = new CursorHistory();
    const pattern = new Literal("T", "T");
    const node = new Node("T", "T", 0, 1, [], "T");

    cursorHistory.startRecording();
    cursorHistory.addMatch(pattern, node);

    expect(cursorHistory.getFurthestMatch().pattern).toBe(pattern);
    expect(cursorHistory.getFurthestMatch().node).toBe(node);
    expect(cursorHistory.getLastMatch().pattern).toBe(pattern);
    expect(cursorHistory.getLastMatch().node).toBe(node);
  });

  test("addError", () => {
    const cursorHistory = new CursorHistory();
    const error = new ParseError(
      "Expected something else.",
      0,
      new Literal("T", "T")
    );

    cursorHistory.addError(error);

    expect(cursorHistory.getFurthestError()).toBe(error);
  });

  test("addError with recording", () => {
    const cursorHistory = new CursorHistory();
    const error = new ParseError(
      "Expected something else.",
      0,
      new Literal("T", "T")
    );

    cursorHistory.startRecording();
    cursorHistory.addError(error);

    expect(cursorHistory.getFurthestError()).toBe(error);
    expect(cursorHistory.getLastError()).toBe(error);
  });

  test("getLastError without any.", () => {
    const cursorHistory = new CursorHistory();
    expect(cursorHistory.getLastError()).toBe(null);
  });

  test("getFurthestMatch without an matches.", () => {
    const cursorHistory = new CursorHistory();

    expect(cursorHistory.getLastMatch().pattern).toBe(null);
    expect(cursorHistory.getLastMatch().node).toBe(null);
    expect(cursorHistory.getFurthestMatch().pattern).toBe(null);
    expect(cursorHistory.getFurthestMatch().node).toBe(null);
  });

  test("getFurthestMatch without an matches while recording.", () => {
    const cursorHistory = new CursorHistory();
    cursorHistory.startRecording();

    expect(cursorHistory.getLastMatch().pattern).toBe(null);
    expect(cursorHistory.getLastMatch().node).toBe(null);
    expect(cursorHistory.getFurthestMatch().pattern).toBe(null);
    expect(cursorHistory.getFurthestMatch().node).toBe(null);
  });

  test("getAllParseStacks.", () => {
    const text = "Pat went to the";
    const cursor = new Cursor(text);
    cursor.startRecording();

    sentence.parse(cursor);
    cursor.history.getAllParseStacks();
  });

  test("getLastParseStack.", () => {
    const text = "Pat went to the";
    const cursor = new Cursor(text);
    cursor.startRecording();

    sentence.parse(cursor);

    const stack = cursor.history.getLastParseStack();

    expect(stack.length).toBe(5);
    expect(stack[0].name).toBe("noun");
    expect(stack[1].name).toBe("space");
    expect(stack[2].name).toBe("verb");
    expect(stack[3].name).toBe("space");
    expect(stack[4].name).toBe("article");
  });
});
