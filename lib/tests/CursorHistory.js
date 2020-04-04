"use strict";

var _CursorHistory = _interopRequireDefault(require("../CursorHistory.js"));

var _assert = _interopRequireDefault(require("assert"));

var _index = require("../index.js");

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
//# sourceMappingURL=CursorHistory.js.map