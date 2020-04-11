"use strict";

var _RecursivePattern = _interopRequireDefault(require("../patterns/RecursivePattern.js"));

var _assert = _interopRequireDefault(require("assert"));

var _index = require("../index.js");

var _string = _interopRequireDefault(require("./javascriptPatterns/string.js"));

var _number = _interopRequireDefault(require("./javascriptPatterns/number.js"));

var _boolean = _interopRequireDefault(require("./javascriptPatterns/boolean.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var openCurlyBracket = new _index.Literal("open-curly-bracket", "{");
var closeCurlyBracket = new _index.Literal("close-curly-bracket", "}");
var openSquareBracket = new _index.Literal("open-square-bracket", "[");
var closeSquareBracket = new _index.Literal("close-square-bracket", "]");
var colon = new _index.Literal(":", ":");
var space = new _index.Literal("space", " ");
var spaces = new _index.RepeatValue("spaces", space);
var optionalSpaces = new _index.OptionalValue(spaces);
var nullLiteral = new _index.Literal("null", "null");
var comma = new _index.Literal(",", ",");
var divider = new _index.AndValue("divider", [optionalSpaces, comma, optionalSpaces]);
var arrayValues = new _index.RepeatComposite("values", new _RecursivePattern.default("literals"), divider);
var optionalArrayValues = new _index.OptionalComposite(arrayValues);
var arrayLiteral = new _index.AndComposite("array-literal", [openSquareBracket, optionalSpaces, optionalArrayValues, optionalSpaces, closeSquareBracket]);
var keyValue = new _index.AndComposite("key-value", [_string.default, optionalSpaces, colon, optionalSpaces, new _RecursivePattern.default("literals")]);
var keyValues = new _index.RepeatComposite("key-values", keyValue, divider);
var optionalKeyValues = new _index.OptionalComposite(keyValues);
var objectLiteral = new _index.AndComposite("object-literal", [openCurlyBracket, optionalSpaces, optionalKeyValues, optionalSpaces, closeCurlyBracket]);
var literals = new _index.OrComposite("literals", [_number.default, _string.default, _boolean.default, nullLiteral, objectLiteral, arrayLiteral]);

exports["RecursivePattern: JSON"] = function () {
  var json = JSON.stringify({
    string: "This is a string.",
    number: 1,
    boolean: true,
    json: {
      string: "This is a nested string."
    },
    null: null,
    array: [1, "Blah", {
      prop1: true
    }]
  });
  var cursor = new _index.Cursor(json);
  var cursor2 = new _index.Cursor(JSON.stringify([{
    foo: "bar"
  }]));
  var object = literals.parse(cursor);
  var array = literals.parse(cursor2);

  _assert.default.equal(object.name, "object-literal");

  _assert.default.equal(array.name, "array-literal");

  _assert.default.equal(object.toString(), json);
};

exports["RecursivePattern: No pattern"] = function () {
  var node = new _RecursivePattern.default("nothing");
  var result = node.exec("Some string.");

  _assert.default.equal(result, null);
};

exports["RecursivePattern: clone."] = function () {
  var node = new _RecursivePattern.default("nothing");
  var clone = node.clone();

  _assert.default.equal(node.name, clone.name);

  var otherClone = node.clone("nothing2");

  _assert.default.equal(otherClone.name, "nothing2");
};

exports["RecursivePattern: getNextTokens."] = function () {
  var tokens = literals.getTokens();
  tokens = literals.children[0].getNextTokens();
  tokens = literals.children[4].getTokens();
  tokens = literals.children[4].children[1].getNextTokens();
  tokens = literals.children[4].children[2].getNextTokens();
  tokens = literals.children[4].children[2].children[0].children[0].children[0].children[0].getTokens();
  tokens = literals.children[4].children[2].children[0].children[0].getNextTokens();
  tokens = literals.children[4].children[3].getNextTokens();
};

exports["RecursivePattern: getPossibilities."] = function () {
  var possibilities = literals.getPossibilities();
};
//# sourceMappingURL=RecursivePattern.js.map