"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _RecursivePattern = _interopRequireDefault(require("../../patterns/RecursivePattern.js"));

var _index = require("../../index.js");

var _string = _interopRequireDefault(require("./string.js"));

var _number = _interopRequireDefault(require("./number.js"));

var _boolean = _interopRequireDefault(require("./boolean.js"));

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
var json = new _index.OrComposite("literals", [_number.default, _string.default, _boolean.default, nullLiteral, objectLiteral, arrayLiteral]);
var _default = json;
exports.default = _default;
//# sourceMappingURL=json.js.map