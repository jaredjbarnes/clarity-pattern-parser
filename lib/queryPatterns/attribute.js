"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Literal = _interopRequireDefault(require("../patterns/value/Literal.js"));

var _RegexValue = _interopRequireDefault(require("../patterns/value/RegexValue.js"));

var _RepeatValue = _interopRequireDefault(require("../patterns/value/RepeatValue.js"));

var _OptionalValue = _interopRequireDefault(require("../patterns/value/OptionalValue.js"));

var _OrValue = _interopRequireDefault(require("../patterns/value/OrValue.js"));

var _index = require("../index.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var openSquareBracket = new _Literal.default("open-square-bracket", "[");
var closeSquareBracket = new _Literal.default("close-square-bracket", "]");
var equal = new _Literal.default("equal", "=");
var spaces = new _RegexValue.default("spaces", "\\s+");
var optionalSpaces = new _OptionalValue.default(spaces);
var singleQuote = new _Literal.default("single-quote", "'");
var twoSingleQuotes = new _Literal.default("two-single-quotes", "''");
var allowedValueCharacters = new _RegexValue.default("allowed-value-characters", "[^']+");
var name = new _RegexValue.default("name", "[^\\]\\[=]+");
var valueCharacter = new _OrValue.default("character", [allowedValueCharacters, twoSingleQuotes]);
var valueCharacters = new _RepeatValue.default("characters", valueCharacter);
var value = new _index.AndComposite("value", [singleQuote, valueCharacters, singleQuote]);
var attribute = new _index.AndComposite("attribute", [openSquareBracket, optionalSpaces, name, optionalSpaces, equal, optionalSpaces, value, optionalSpaces, closeSquareBracket]);
var _default = attribute;
exports.default = _default;
//# sourceMappingURL=attribute.js.map