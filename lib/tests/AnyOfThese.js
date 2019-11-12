"use strict";

var _AnyOfThese = _interopRequireDefault(require("../patterns/value/AnyOfThese.js"));

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["AnyOfThese: Empty constructor."] = function () {
  _assert.default.throws(function () {
    new _AnyOfThese.default();
  });
};

exports["AnyOfThese: No characters provided."] = function () {
  _assert.default.throws(function () {
    new _AnyOfThese.default("no-characters");
  });
};

exports["AnyOfThese: Empty string provided as characters."] = function () {
  _assert.default.throws(function () {
    new _AnyOfThese.default("no-characters", "");
  });
};

exports["AnyOfThese: Single character."] = function () {
  var lowerCaseA = new _AnyOfThese.default("lower-case-a", "a");
  var cursor = new _Cursor.default("a");
  var node = lowerCaseA.parse(cursor);

  _assert.default.equal(node.name, "lower-case-a");

  _assert.default.equal(node.value, "a");

  _assert.default.equal(node.startIndex, 0);

  _assert.default.equal(node.endIndex, 0);

  _assert.default.equal(cursor.isAtEnd(), true);

  _assert.default.equal(cursor.getChar(), "a");
};

exports["AnyOfThese: Uppercase A and lowercase A."] = function () {
  var letterA = new _AnyOfThese.default("letter-a", "Aa");
  var lowerCaseCursor = new _Cursor.default("a");
  var upperCaseCursor = new _Cursor.default("A");
  var lowerCaseNode = letterA.parse(lowerCaseCursor);
  var upperCaseNode = letterA.parse(upperCaseCursor);

  _assert.default.equal(lowerCaseNode.name, "letter-a");

  _assert.default.equal(lowerCaseNode.value, "a");

  _assert.default.equal(lowerCaseNode.startIndex, 0);

  _assert.default.equal(lowerCaseNode.endIndex, 0);

  _assert.default.equal(upperCaseNode.name, "letter-a");

  _assert.default.equal(upperCaseNode.value, "A");

  _assert.default.equal(upperCaseNode.startIndex, 0);

  _assert.default.equal(upperCaseNode.endIndex, 0);

  _assert.default.equal(upperCaseCursor.getChar(), "A");

  _assert.default.equal(upperCaseCursor.isAtEnd(), true);

  _assert.default.equal(lowerCaseCursor.getChar(), "a");

  _assert.default.equal(lowerCaseCursor.isAtEnd(), true);
};

exports["AnyOfThese: Match with long cursor."] = function () {
  var letterA = new _AnyOfThese.default("letter-a", "Aa");
  var cursor = new _Cursor.default("a12345");
  var node = letterA.parse(cursor);

  _assert.default.equal(node.name, "letter-a");

  _assert.default.equal(node.value, "a");

  _assert.default.equal(cursor.getChar(), "a");

  _assert.default.equal(cursor.getIndex(), 0);
};

exports["AnyOfThese: No match."] = function () {
  var letterA = new _AnyOfThese.default("letter-a", "Aa");
  var cursor = new _Cursor.default("12345");

  _assert.default.throws(function () {
    var node = letterA.parse(cursor);
  });
};

exports["AnyOfThese: Bad cursor."] = function () {
  var letterA = new _AnyOfThese.default("letter-a", "Aa");

  _assert.default.throws(function () {
    var node = letterA.parse();
  });
};

exports["AnyOfThese: Pattern Methods."] = function () {
  var letterA = new _AnyOfThese.default("letter-a", "Aa");

  _assert.default.equal(letterA.name, "letter-a");

  _assert.default.equal(letterA.children.length, 0);
};
//# sourceMappingURL=AnyOfThese.js.map