"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Literal = _interopRequireDefault(require("../../patterns/value/Literal.js"));

var _NotValue = _interopRequireDefault(require("../../patterns/value/NotValue.js"));

var _OrValue = _interopRequireDefault(require("../../patterns/value/OrValue.js"));

var _RepeatValue = _interopRequireDefault(require("../../patterns/value/RepeatValue.js"));

var _AndValue = _interopRequireDefault(require("../../patterns/value/AndValue.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var singleQuote = new _Literal.default("single-quote", "'");
var doubleQuote = new _Literal.default("double-quote", '"');
var backslash = new _Literal.default("double-quote", "\\");
var singleQuoteOrBackslash = new _OrValue.default("single-quote-or-backslash", [singleQuote, backslash]);
var doubleQuoteOrBackslash = new _OrValue.default("single-quote-or-backslash", [doubleQuote, backslash]);
var unescapedSingleCharacter = new _NotValue.default("unescaped-single-character", singleQuoteOrBackslash);
var unescapedDoubleCharacter = new _NotValue.default("unescaped-double-character", doubleQuoteOrBackslash);
var escapedSingleQuote = new _Literal.default("escaped-single-quote", "\\'");
var escapedDoubleQuote = new _Literal.default("escaped-double-quote", '\\"');
var escapedBackslash = new _Literal.default("escaped-backslash", "\\/");
var escapedSlash = new _Literal.default("escaped-slash", "\\/");
var escapedBackspace = new _Literal.default("escaped-backspace", "\\b");
var escapedformFeed = new _Literal.default("escaped-form-feed", "\\f");
var escapedNewLine = new _Literal.default("escaped-new-line", "\\n");
var escapedCarriageReturn = new _Literal.default("escaped-carriage-return", "\\r");
var escapedTab = new _Literal.default("escaped-tab", "\\t");
var singleQuoteCharacter = new _OrValue.default("character", [escapedSingleQuote, escapedDoubleQuote, escapedBackslash, escapedSlash, escapedBackspace, escapedformFeed, escapedNewLine, escapedCarriageReturn, escapedTab, unescapedSingleCharacter]);
var doubleQuoteCharacter = new _OrValue.default("character", [escapedSingleQuote, escapedDoubleQuote, escapedBackslash, escapedSlash, escapedBackspace, escapedformFeed, escapedNewLine, escapedCarriageReturn, escapedTab, unescapedDoubleCharacter]);
var singleCharacterSequence = new _RepeatValue.default("string-content", singleQuoteCharacter);
var doubleCharacterSequence = new _RepeatValue.default("string-content", doubleQuoteCharacter);
var singleQuoteString = new _AndValue.default("single-quote-string", [singleQuote, singleCharacterSequence, singleQuote]);
var doubleQuoteString = new _AndValue.default("double-quote-string", [doubleQuote, doubleCharacterSequence, doubleQuote]);
var string = new _OrValue.default("string", [singleQuoteString, doubleQuoteString]);
var _default = string;
exports.default = _default;
//# sourceMappingURL=string.js.map