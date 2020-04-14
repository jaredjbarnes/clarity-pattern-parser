import CursorHistory from "../CursorHistory.js";
import assert from "assert";
import { ValuePattern, ValueNode, Cursor } from "../index.js";
import sentence from "./patterns/sentence.js";

exports["CursorHistory: addMatch"] = () => {
  const cursorHistory = new CursorHistory();
  const pattern = new ValuePattern("T", "T");
  const node = new ValueNode("T", "T", "T", 0, 1);

  cursorHistory.addMatch(pattern, node);
  assert.equal(cursorHistory.getFurthestMatch().pattern, pattern);
  assert.equal(cursorHistory.getFurthestMatch().astNode, node);
};

exports["CursorHistory: addMatch with Recording"] = () => {
  const cursorHistory = new CursorHistory();
  const pattern = new ValuePattern("T", "T");
  const node = new ValueNode("T", "T", "T", 0, 1);

  cursorHistory.startRecording();
  cursorHistory.addMatch(pattern, node);

  assert.equal(cursorHistory.getFurthestMatch().pattern, pattern);
  assert.equal(cursorHistory.getFurthestMatch().astNode, node);
  assert.equal(cursorHistory.getLastMatch().pattern, pattern);
  assert.equal(cursorHistory.getLastMatch().astNode, node);
};

exports["CursorHistory: addError"] = () => {
  const cursorHistory = new CursorHistory();
  const error = new Error("Expected something else.");

  cursorHistory.addError(error);

  assert.equal(cursorHistory.getFurthestError(), error);
};

exports["CursorHistory: addError with recording"] = () => {
  const cursorHistory = new CursorHistory();
  const error = new Error("Expected something else.");

  cursorHistory.startRecording();
  cursorHistory.addError(error);

  assert.equal(cursorHistory.getFurthestError(), error);
  assert.equal(cursorHistory.getLastError(), error);
};

exports["CursorHistory: getLastError without any."] = () => {
  const cursorHistory = new CursorHistory();
  const error = new Error("Expected something else.");

  assert.equal(cursorHistory.getLastError(), null);
};

exports["CursorHistory: getFurthestMatch without an matches."] = () => {
  const cursorHistory = new CursorHistory();

  assert.equal(cursorHistory.getLastMatch().pattern, null);
  assert.equal(cursorHistory.getLastMatch().astNode, null);
  assert.equal(cursorHistory.getFurthestMatch().pattern, null);
  assert.equal(cursorHistory.getFurthestMatch().astNode, null);
};

exports[
  "CursorHistory: getFurthestMatch without an matches while recording."
] = () => {
  const cursorHistory = new CursorHistory();
  cursorHistory.startRecording();

  assert.equal(cursorHistory.getLastMatch().pattern, null);
  assert.equal(cursorHistory.getLastMatch().astNode, null);
  assert.equal(cursorHistory.getFurthestMatch().pattern, null);
  assert.equal(cursorHistory.getFurthestMatch().astNode, null);
};

exports[
  "CursorHistory: getAllParseStacks."
] = () => {
  const text = "Pat went to the";
  const cursor = new Cursor(text);
  cursor.startRecording();

  sentence.parse(cursor);

  const stacks = cursor.history.getAllParseStacks();
};

exports[
  "CursorHistory: getLastParseStack."
] = () => {
  const text = "Pat went to the";
  const cursor = new Cursor(text);
  cursor.startRecording();

  sentence.parse(cursor);

  const stack = cursor.history.getLastParseStack();

  assert.equal(stack.length, 5);
  assert.equal(stack[0].name, "pat");
  assert.equal(stack[1].name, "space");
  assert.equal(stack[2].name, "went-to");
  assert.equal(stack[3].name, "space");
  assert.equal(stack[4].name, "the");
};
