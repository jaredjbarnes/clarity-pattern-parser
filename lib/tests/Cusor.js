"use strict";

var _assert = _interopRequireDefault(require("assert"));

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

var _ValueNode = _interopRequireDefault(require("../ast/ValueNode.js"));

var _ValuePattern = _interopRequireDefault(require("../patterns/value/ValuePattern.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["Cursor: addMatch."] = function () {
  var cursor = new _Cursor.default("Text");
  var node = new _ValueNode.default("text-node", "Text", "Text", 0, 3);
  var pattern = new _ValuePattern.default("text", "Text");
  cursor.setIndex(3);
  cursor.addMatch(pattern, node);

  _assert.default.equal(cursor.history.furthestMatch.astNode, node);

  _assert.default.equal(cursor.history.furthestMatch.pattern, pattern);
};

exports["Cursor: addMatch that isn't as far."] = function () {
  var cursor = new _Cursor.default("Text");
  var node = new _ValueNode.default("text-node", "Text", "Text", 0, 3);
  var pattern = new _ValuePattern.default("text", "Text Node");
  var shorterNode = new _ValueNode.default("tex-node", "Tex", "Tex", 0, 2);
  var shorterPattern = new _ValuePattern.default("tex", "Tex");
  cursor.setIndex(3);
  cursor.addMatch(pattern, node);

  _assert.default.equal(cursor.history.furthestMatch.astNode, node);

  _assert.default.equal(cursor.history.furthestMatch.pattern, pattern);

  cursor.setIndex(2);
  cursor.addMatch(shorterPattern, shorterNode);

  _assert.default.equal(cursor.history.furthestMatch.astNode, node);

  _assert.default.equal(cursor.history.furthestMatch.pattern, pattern);
};

exports["Cursor: didSuccessfullyParse."] = function () {
  var cursor = new _Cursor.default("Text");
  cursor.setIndex(3);

  _assert.default.equal(cursor.didSuccessfullyParse(), true);

  cursor.throwError(new Error("Failed To Parse."));

  _assert.default.equal(cursor.didSuccessfullyParse(), false);
};

exports["Cursor: getChar."] = function () {
  var cursor = new _Cursor.default("Text");

  _assert.default.equal(cursor.getChar(), "T");

  cursor.setIndex(3);

  _assert.default.equal(cursor.getChar(), "t");
};

exports["Cursor: getIndex."] = function () {
  var cursor = new _Cursor.default("Text");

  _assert.default.equal(cursor.getIndex(), 0);

  cursor.setIndex(3);

  _assert.default.equal(cursor.getIndex(), 3);
};

exports["Cursor: hasNext."] = function () {
  var cursor = new _Cursor.default("Text");

  _assert.default.equal(cursor.hasNext(), true);

  cursor.setIndex(3);

  _assert.default.equal(cursor.hasNext(), false);
};

exports["Cursor: hasPrevious."] = function () {
  var cursor = new _Cursor.default("Text");

  _assert.default.equal(cursor.hasPrevious(), false);

  cursor.setIndex(3);

  _assert.default.equal(cursor.hasPrevious(), true);
};

exports["Cursor: recording history."] = function () {
  var cursor = new _Cursor.default("Text");
  var tNode = new _ValueNode.default("T", "T", "T", 0, 0);
  var tPattern = new _ValuePattern.default("T", "T");
  var eNode = new _ValueNode.default("e", "e", "e", 1, 1);
  var ePattern = new _ValuePattern.default("e", "e");
  var xNode = new _ValueNode.default("x", "x", "x", 2, 2);
  var xPattern = new _ValuePattern.default("x", "x");
  cursor.startRecording();
  cursor.addMatch(tPattern, tNode);
  cursor.addMatch(ePattern, eNode);

  _assert.default.equal(cursor.history.patterns.length, 2);

  _assert.default.equal(cursor.history.astNodes.length, 2);

  _assert.default.equal(cursor.history.getFurthestMatch().astNode, eNode);

  _assert.default.equal(cursor.history.getFurthestMatch().pattern, ePattern);

  _assert.default.equal(cursor.history.getLastMatch().astNode, eNode);

  _assert.default.equal(cursor.history.getLastMatch().pattern, ePattern);

  cursor.stopRecording();
  cursor.addMatch(xPattern, xNode);

  _assert.default.equal(cursor.history.patterns.length, 0);

  _assert.default.equal(cursor.history.astNodes.length, 0);

  _assert.default.equal(cursor.history.getFurthestMatch().astNode, xNode);

  _assert.default.equal(cursor.history.getFurthestMatch().pattern, xPattern);

  _assert.default.equal(cursor.history.getLastMatch().astNode, xNode);

  _assert.default.equal(cursor.history.getLastMatch().pattern, xPattern);
};

exports["Cursor: moveToBeginning."] = function () {
  var cursor = new _Cursor.default("Text");
  cursor.setIndex(3);
  cursor.moveToBeginning();

  _assert.default.equal(cursor.getIndex(), 0);
};

exports["Cursor: moveToEnd."] = function () {
  var cursor = new _Cursor.default("Text");
  cursor.moveToEnd();

  _assert.default.equal(cursor.getIndex(), 3);
};

exports["Cursor: setIndex outside of bounds."] = function () {
  var cursor = new _Cursor.default("Text");

  _assert.default.throws(function () {
    cursor.setIndex(4);
  });
};

exports["Cursor: empty constructor."] = function () {
  _assert.default.throws(function () {
    new _Cursor.default();
  });
};

exports["Cursor: next out of bounds."] = function () {
  var cursor = new _Cursor.default("Text");
  cursor.setIndex(3);

  _assert.default.throws(function () {
    cursor.next();
  });
};

exports["Cursor: previous out of bounds."] = function () {
  var cursor = new _Cursor.default("Text");

  _assert.default.throws(function () {
    cursor.previous();
  });
};

exports["Cursor: previous."] = function () {
  var cursor = new _Cursor.default("Text");
  cursor.setIndex(1);
  cursor.previous();

  _assert.default.equal(cursor.getIndex(), 0);
};

exports["Cursor: isAtBeginning."] = function () {
  var cursor = new _Cursor.default("Text");
  cursor.isAtBeginning();

  _assert.default.equal(cursor.getIndex(), 0);

  _assert.default.equal(cursor.isAtBeginning(), true);
};

exports["Cursor: setIndex invalid number."] = function () {
  var cursor = new _Cursor.default("Text");

  _assert.default.throws(function () {
    cursor.setIndex(-1);
  });
};

exports["Cursor: setIndex invalid with string."] = function () {
  var cursor = new _Cursor.default("Text");
  cursor.setIndex("");
};
//# sourceMappingURL=Cusor.js.map