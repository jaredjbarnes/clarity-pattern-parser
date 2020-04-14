"use strict";

var _CursorHistory = _interopRequireDefault(require("../CursorHistory.js"));

var _assert = _interopRequireDefault(require("assert"));

var _index = require("../index.js");

var _sentence = _interopRequireDefault(require("./patterns/sentence.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["CursorHistory: addMatch"] = function () {
  var cursorHistory = new _CursorHistory.default();
  var pattern = new _index.ValuePattern("T", "T");
  var node = new _index.ValueNode("T", "T", "T", 0, 1);
  cursorHistory.addMatch(pattern, node);

  _assert.default.equal(cursorHistory.getFurthestMatch().pattern, pattern);

  _assert.default.equal(cursorHistory.getFurthestMatch().astNode, node);
};

exports["CursorHistory: addMatch with Recording"] = function () {
  var cursorHistory = new _CursorHistory.default();
  var pattern = new _index.ValuePattern("T", "T");
  var node = new _index.ValueNode("T", "T", "T", 0, 1);
  cursorHistory.startRecording();
  cursorHistory.addMatch(pattern, node);

  _assert.default.equal(cursorHistory.getFurthestMatch().pattern, pattern);

  _assert.default.equal(cursorHistory.getFurthestMatch().astNode, node);

  _assert.default.equal(cursorHistory.getLastMatch().pattern, pattern);

  _assert.default.equal(cursorHistory.getLastMatch().astNode, node);
};

exports["CursorHistory: addError"] = function () {
  var cursorHistory = new _CursorHistory.default();
  var error = new Error("Expected something else.");
  cursorHistory.addError(error);

  _assert.default.equal(cursorHistory.getFurthestError(), error);
};

exports["CursorHistory: addError with recording"] = function () {
  var cursorHistory = new _CursorHistory.default();
  var error = new Error("Expected something else.");
  cursorHistory.startRecording();
  cursorHistory.addError(error);

  _assert.default.equal(cursorHistory.getFurthestError(), error);

  _assert.default.equal(cursorHistory.getLastError(), error);
};

exports["CursorHistory: getLastError without any."] = function () {
  var cursorHistory = new _CursorHistory.default();
  var error = new Error("Expected something else.");

  _assert.default.equal(cursorHistory.getLastError(), null);
};

exports["CursorHistory: getFurthestMatch without an matches."] = function () {
  var cursorHistory = new _CursorHistory.default();

  _assert.default.equal(cursorHistory.getLastMatch().pattern, null);

  _assert.default.equal(cursorHistory.getLastMatch().astNode, null);

  _assert.default.equal(cursorHistory.getFurthestMatch().pattern, null);

  _assert.default.equal(cursorHistory.getFurthestMatch().astNode, null);
};

exports["CursorHistory: getFurthestMatch without an matches while recording."] = function () {
  var cursorHistory = new _CursorHistory.default();
  cursorHistory.startRecording();

  _assert.default.equal(cursorHistory.getLastMatch().pattern, null);

  _assert.default.equal(cursorHistory.getLastMatch().astNode, null);

  _assert.default.equal(cursorHistory.getFurthestMatch().pattern, null);

  _assert.default.equal(cursorHistory.getFurthestMatch().astNode, null);
};

exports["CursorHistory: getAllParseStacks."] = function () {
  var text = "Pat went to the";
  var cursor = new _index.Cursor(text);
  cursor.startRecording();

  _sentence.default.parse(cursor);

  var stacks = cursor.history.getAllParseStacks();
};

exports["CursorHistory: getLastParseStack."] = function () {
  var text = "Pat went to the";
  var cursor = new _index.Cursor(text);
  cursor.startRecording();

  _sentence.default.parse(cursor);

  var stack = cursor.history.getLastParseStack();

  _assert.default.equal(stack.length, 5);

  _assert.default.equal(stack[0].name, "pat");

  _assert.default.equal(stack[1].name, "space");

  _assert.default.equal(stack[2].name, "went-to");

  _assert.default.equal(stack[3].name, "space");

  _assert.default.equal(stack[4].name, "the");
};
//# sourceMappingURL=CursorHistory.js.map