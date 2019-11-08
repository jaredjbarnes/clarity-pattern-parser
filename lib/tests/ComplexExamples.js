"use strict";

var _whitespace = _interopRequireDefault(require("./javascriptPatterns/whitespace.js"));

var _name = _interopRequireDefault(require("./javascriptPatterns/name.js"));

var _number = _interopRequireDefault(require("./javascriptPatterns/number.js"));

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

var _filter = _interopRequireDefault(require("./naturalLanguage/filter.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["Complex Examples: A Comment"] = () => {
  const cursor = new _Cursor.default(`/*
          This is the comment!
      */`);

  const node = _whitespace.default.parse(cursor);
};

exports["Complex Examples: name"] = () => {
  const validName = new _Cursor.default("firstName1_2");
  const invalidName = new _Cursor.default("1_firstName");

  const validNode = _name.default.parse(validName);

  _assert.default.equal(validNode.type, "name");

  _assert.default.equal(validNode.value, "firstName1_2");

  _assert.default.throws(() => {
    _name.default.parse(invalidName);
  });
};

exports["Complex Examples: number"] = () => {
  const validNumber = new _Cursor.default("1234");
  const invalidNumber = new _Cursor.default("01234");
  const validFraction = new _Cursor.default("0.1");
  const validExponent = new _Cursor.default("1.23e+5");

  const validNumberNode = _number.default.parse(validNumber);

  const validFractionNode = _number.default.parse(validFraction);

  const validExponentNode = _number.default.parse(validExponent);

  _assert.default.equal(validNumberNode.type, "number");

  _assert.default.equal(validNumberNode.value, "1234");

  _assert.default.equal(validFractionNode.type, "number");

  _assert.default.equal(validFractionNode.value, "0.1");

  _assert.default.equal(validExponentNode.type, "number");

  _assert.default.equal(validExponentNode.value, "1.23e+5");

  _assert.default.throws(() => {
    _name.default.parse(invalidNumber);
  });
};

exports["Complex Examples: Natural Language."] = () => {
  const validCursor = new _Cursor.default("Match records when firstName is 'John' and lastName is 'Barnes'.");
  const invalidCursor = new _Cursor.default("Match records when firstName ");

  const node = _filter.default.parse(validCursor);

  try {
    _filter.default.parse(invalidCursor);
  } catch (error) {
    debugger;
  }
};
//# sourceMappingURL=ComplexExamples.js.map