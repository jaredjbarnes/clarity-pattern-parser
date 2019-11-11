"use strict";

var _whitespace = _interopRequireDefault(require("./javascriptPatterns/whitespace.js"));

var _name = _interopRequireDefault(require("./javascriptPatterns/name.js"));

var _number = _interopRequireDefault(require("./javascriptPatterns/number.js"));

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

var _filter = _interopRequireDefault(require("./naturalLanguage/filter.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["Complex Examples: A Comment"] = function () {
  var cursor = new _Cursor.default("/*\n          This is the comment!\n      */");

  var node = _whitespace.default.parse(cursor);
};

exports["Complex Examples: name"] = function () {
  var validName = new _Cursor.default("firstName1_2");
  var invalidName = new _Cursor.default("1_firstName");

  var validNode = _name.default.parse(validName);

  _assert.default.equal(validNode.type, "name");

  _assert.default.equal(validNode.value, "firstName1_2");

  _assert.default.throws(function () {
    _name.default.parse(invalidName);
  });
};

exports["Complex Examples: number"] = function () {
  var validNumber = new _Cursor.default("1234");
  var invalidNumber = new _Cursor.default("01234");
  var validFraction = new _Cursor.default("0.1");
  var validExponent = new _Cursor.default("1.23e+5");

  var validNumberNode = _number.default.parse(validNumber);

  var validFractionNode = _number.default.parse(validFraction);

  var validExponentNode = _number.default.parse(validExponent);

  _assert.default.equal(validNumberNode.type, "number");

  _assert.default.equal(validNumberNode.value, "1234");

  _assert.default.equal(validFractionNode.type, "number");

  _assert.default.equal(validFractionNode.value, "0.1");

  _assert.default.equal(validExponentNode.type, "number");

  _assert.default.equal(validExponentNode.value, "1.23e+5");

  _assert.default.throws(function () {
    _name.default.parse(invalidNumber);
  });
};

exports["Complex Examples: Natural Language."] = function () {
  var validCursor = new _Cursor.default("Match records where firstName is 'John' and lastName is 'Barnes'.");
  var invalidCursor = new _Cursor.default("Match records where firstName ");

  var node = _filter.default.parse(validCursor);

  try {
    _filter.default.parse(invalidCursor);
  } catch (error) {
    debugger;
  }
};

exports["Complex Examples: cssMethod"] = function () {
  var cursor = new _Cursor.default("linear-gradient(to left, #333, #333 50%, #eee 75%, #333 75%);");
};
//# sourceMappingURL=ComplexExamples.js.map