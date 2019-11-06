"use strict";

var _AnyOfThese = _interopRequireDefault(require("../patterns/value/AnyOfThese.js"));

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["AnyOfThese: Empty constructor."] = () => {
  _assert.default.throws(() => {
    new _AnyOfThese.default();
  });
};

exports["AnyOfThese: No characters provided."] = () => {
  _assert.default.throws(() => {
    new _AnyOfThese.default("no-characters");
  });
};

exports["AnyOfThese: Empty string provided as characters."] = () => {
  _assert.default.throws(() => {
    new _AnyOfThese.default("no-characters", "");
  });
};

exports["AnyOfThese: Single character."] = () => {
  const lowerCaseA = new _AnyOfThese.default("lower-case-a", "a");
  const cursor = new _Cursor.default("a");
  const node = lowerCaseA.parse(cursor);

  _assert.default.equal(node.type, "lower-case-a");

  _assert.default.equal(node.value, "a");

  _assert.default.equal(node.startIndex, 0);

  _assert.default.equal(node.endIndex, 0);

  _assert.default.equal(cursor.isAtEnd(), true);

  _assert.default.equal(cursor.getChar(), "a");
};

exports["AnyOfThese: Uppercase A and lowercase A."] = () => {
  const letterA = new _AnyOfThese.default("letter-a", "Aa");
  const lowerCaseCursor = new _Cursor.default("a");
  const upperCaseCursor = new _Cursor.default("A");
  const lowerCaseNode = letterA.parse(lowerCaseCursor);
  const upperCaseNode = letterA.parse(upperCaseCursor);

  _assert.default.equal(lowerCaseNode.type, "letter-a");

  _assert.default.equal(lowerCaseNode.value, "a");

  _assert.default.equal(lowerCaseNode.startIndex, 0);

  _assert.default.equal(lowerCaseNode.endIndex, 0);

  _assert.default.equal(upperCaseNode.type, "letter-a");

  _assert.default.equal(upperCaseNode.value, "A");

  _assert.default.equal(upperCaseNode.startIndex, 0);

  _assert.default.equal(upperCaseNode.endIndex, 0);

  _assert.default.equal(upperCaseCursor.getChar(), "A");

  _assert.default.equal(upperCaseCursor.isAtEnd(), true);

  _assert.default.equal(lowerCaseCursor.getChar(), "a");

  _assert.default.equal(lowerCaseCursor.isAtEnd(), true);
};

exports["AnyOfThese: Match with long cursor."] = () => {
  const letterA = new _AnyOfThese.default("letter-a", "Aa");
  const cursor = new _Cursor.default("a12345");
  const node = letterA.parse(cursor);

  _assert.default.equal(node.type, "letter-a");

  _assert.default.equal(node.value, "a");

  _assert.default.equal(cursor.getChar(), "1");

  _assert.default.equal(cursor.getIndex(), 1);
};

exports["AnyOfThese: No match."] = () => {
  const letterA = new _AnyOfThese.default("letter-a", "Aa");
  const cursor = new _Cursor.default("12345");

  _assert.default.throws(() => {
    const node = letterA.parse(cursor);
  });
};

exports["AnyOfThese: Bad cursor."] = () => {
  const letterA = new _AnyOfThese.default("letter-a", "Aa");

  _assert.default.throws(() => {
    const node = letterA.parse();
  });
};

exports["AnyOfThese: Pattern Methods."] = () => {
  const letterA = new _AnyOfThese.default("letter-a", "Aa");

  _assert.default.equal(letterA.getName(), "letter-a");

  _assert.default.equal(letterA.getType(), "value");

  _assert.default.equal(letterA.getValue(), "Aa");

  _assert.default.equal(letterA.getPatterns(), null);
};
//# sourceMappingURL=AnyOfThese.js.map