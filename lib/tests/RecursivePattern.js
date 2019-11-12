"use strict";

var _RecursivePattern = _interopRequireDefault(require("../patterns/RecursivePattern.js"));

var _assert = _interopRequireDefault(require("assert"));

var _index = require("../index.js");

var _string = _interopRequireDefault(require("./javascriptPatterns/string"));

var _number = _interopRequireDefault(require("./javascriptPatterns/number"));

var _boolean = _interopRequireDefault(require("./javascriptPatterns/boolean"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["RecursivePattern: JSON"] = function () {
  var openBracket = new _index.Literal("{", "{");
  var closeBracket = new _index.Literal("}", "}");
  var colon = new _index.Literal(":", ":");
  var space = new _index.Literal("space", " ");
  var spaces = new _index.RepeatValue("spaces", space);
  var optionalSpaces = new _index.OptionalValue(spaces);
  var nullLiteral = new _index.Literal("null", "null");
  var comma = new _index.Literal(",", ",");
  var divider = new _index.AndValue("divider", [optionalSpaces, comma, optionalSpaces]);
  var value = new _index.OrComposite("value", [_number.default, _string.default, _boolean.default, nullLiteral, new _RecursivePattern.default("json")]);
  var keyValue = new _index.AndComposite("key-value", [_string.default, optionalSpaces, colon, optionalSpaces, value]);
  var keyValues = new _index.RepeatComposite("key-values", keyValue, divider);
  var optionalKeyValues = new _index.OptionalComposite(keyValues);
  var jsonPattern = new _index.AndComposite("json", [openBracket, optionalSpaces, optionalKeyValues, optionalSpaces, closeBracket]);
  var json = JSON.stringify({
    string: "This is a string.",
    number: 1,
    boolean: true,
    null: null,
    json: {
      string: "This is a nested string."
    }
  });
  var cursor = new _index.Cursor(json);
  var node = jsonPattern.parse(cursor);
};
//# sourceMappingURL=RecursivePattern.js.map