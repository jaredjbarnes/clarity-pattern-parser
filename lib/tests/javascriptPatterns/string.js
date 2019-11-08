"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _OrComposite = _interopRequireDefault(require("../../patterns/composite/OrComposite.js"));

var _Literal = _interopRequireDefault(require("../../patterns/value/Literal.js"));

var _NotValue = _interopRequireDefault(require("../../patterns/value/NotValue.js"));

var _OrValue = _interopRequireDefault(require("../../patterns/value/OrValue.js"));

var _RepeatValue = _interopRequireDefault(require("../../patterns/value/RepeatValue.js"));

var _AndValue = _interopRequireDefault(require("../../patterns/value/AndValue.js"));

var _AnyofThese = _interopRequireDefault(require("../../patterns/value/AnyofThese.js"));

var _OptionalValue = _interopRequireDefault(require("../../patterns/value/OptionalValue.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const singleQuote = new _Literal.default("single-quote", "'");
const doubleQuote = new _Literal.default("double-quote", '"');
const backslash = new _Literal.default("double-quote", "\\");
const singleQuoteOrBackslash = new _OrValue.default("single-quote-or-backslash", [singleQuote, backslash]);
const doubleQuoteOrBackslash = new _OrValue.default("single-quote-or-backslash", [singleQuote, backslash]);
const unescapedSinlgeCharacter = new _NotValue.default("unescaped-single-character", singleQuoteOrBackslash);
const unescapedDoubleCharacter = new _NotValue.default("unescaped-double-character", doubleQuoteOrBackslash);
const escapedSingleQuote = new _Literal.default("escaped-single-quote", "\\'");
const escapedDoubleQuote = new _Literal.default("escaped-double-quote", '\\"');
const escapedBackslash = new _Literal.default("escaped-backslash", "\\/");
const escapedSlash = new _Literal.default("escaped-slash", "\\/");
const escapedBackspace = new _Literal.default("escaped-backspace", "\\b");
const escapedformFeed = new _Literal.default("escaped-form-feed", "\\f");
const escapedNewLine = new _Literal.default("escaped-new-line", "\\n");
const escapedCarriageReturn = new _Literal.default("escaped-carriage-return", "\\r");
const escapedTab = new _Literal.default("escaped-tab", "\\t");
const singleQuoteCharacter = new _OrValue.default("character", [escapedSingleQuote, escapedDoubleQuote, escapedBackslash, escapedSlash, escapedBackspace, escapedformFeed, escapedNewLine, escapedCarriageReturn, escapedTab, unescapedSinlgeCharacter]);
const doubleQuoteCharacter = new _OrValue.default("character", [escapedSingleQuote, escapedDoubleQuote, escapedBackslash, escapedSlash, escapedBackspace, escapedformFeed, escapedNewLine, escapedCarriageReturn, escapedTab, unescapedDoubleCharacter]);
const singleCharacterSequence = new _RepeatValue.default("string-content", singleQuoteCharacter);
const doubleCharacterSequence = new _RepeatValue.default("string-content", doubleQuoteCharacter);
const singleQuoteString = new _AndValue.default("single-quote-string", [singleQuote, singleCharacterSequence, singleQuote]);
const doubleQuoteString = new _AndValue.default("double-quote-string", [doubleQuote, doubleCharacterSequence, doubleQuote]);
const string = new _OrValue.default("string", [singleQuoteString, doubleQuoteString]);
var _default = string;
exports.default = _default;
//# sourceMappingURL=string.js.map