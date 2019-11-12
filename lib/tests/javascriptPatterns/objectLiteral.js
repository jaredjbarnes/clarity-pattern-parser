"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Literal = require("../../patterns/value/Literal.js");

var _AndComposite = _interopRequireDefault(require("../../patterns/composite/AndComposite.js"));

var _RepeatComposite = _interopRequireDefault(require("../../patterns/composite/RepeatComposite.js"));

var _OptionalComposite = _interopRequireDefault(require("../../patterns/composite/OptionalComposite.js"));

var _OrValue = _interopRequireDefault(require("../../patterns/value/OrValue.js"));

var _OptionalValue = _interopRequireDefault(require("../../patterns/value/OptionalValue.js"));

var _RecursivePattern = require("../../patterns/RecursivePattern.js");

var _name = _interopRequireDefault(require("./name.js"));

var _string = _interopRequireDefault(require("./string.js"));

var _whitespace = _interopRequireDefault(require("./whitespace.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var expression = new _RecursivePattern.RecursivePattern("expression");
var optionalWhitespace = new _OptionalValue.default(_whitespace.default);
var comma = new _Literal.Literal(",", ",");
var colon = new _Literal.Literal(":", ":");
var separator = new AndValue("separator", [optionalWhitespace, comma, optionalWhitespace]);
var property = new _OrValue.default("property", [_name.default, _string.default]);
var keyValue = new _AndComposite.default("key-value", [property, optionalWhitespace, colon, optionalWhitespace, expression]);
var keyValues = new _RepeatComposite.default("key-values", keyValue, separator);
var optionalKeyValues = new _OptionalComposite.default(keyValues);
var openBracket = new _Literal.Literal("{", "}");
var closeBracket = new _Literal.Literal("}", "}");
var objectLiteral = new _AndComposite.default("object-literal", [openBracket, optionalWhitespace, optionalKeyValues, optionalWhitespace, closeBracket]);
var _default = objectLiteral;
exports.default = _default;
//# sourceMappingURL=objectLiteral.js.map