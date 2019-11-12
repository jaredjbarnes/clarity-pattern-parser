"use strict";

var _RecursivePattern = _interopRequireDefault(require("../patterns/RecursivePattern.js"));

var _assert = _interopRequireDefault(require("assert"));

var _index = require("../index.js");

var _string = _interopRequireDefault(require("./javascriptPatterns/string"));

var _number = _interopRequireDefault(require("./javascriptPatterns/number"));

var _boolean = _interopRequireDefault(require("./javascriptPatterns/boolean"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["RecursivePattern: JSON"] = function () {
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
  var arrayValues = new _index.RepeatComposite("values", new _RecursivePattern.default("value"), divider);
  var optionalArrayValues = new _index.OptionalComposite(arrayValues);
  var array = new _index.AndComposite("array-literal", [openSquareBracket, optionalSpaces, optionalArrayValues, optionalSpaces, closeSquareBracket]);
  var value = new _index.OrComposite("value", [_number.default, _string.default, _boolean.default, nullLiteral, array, new _RecursivePattern.default("object-literal")]);
  var keyValue = new _index.AndComposite("key-value", [_string.default, optionalSpaces, colon, optionalSpaces, value]);
  var keyValues = new _index.RepeatComposite("key-values", keyValue, divider);
  var optionalKeyValues = new _index.OptionalComposite(keyValues);
  var jsonPattern = new _index.AndComposite("object-literal", [optionalSpaces, openCurlyBracket, optionalSpaces, optionalKeyValues, optionalSpaces, closeCurlyBracket, optionalSpaces]);
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

  try {
    var node = jsonPattern.parse(cursor);
    debugger;
  } catch (error) {
    debugger;
  }
};
//# sourceMappingURL=RecursivePattern.js.map