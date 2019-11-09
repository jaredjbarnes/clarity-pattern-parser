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

var zero = new _Literal.default("zero", "0");
var bigE = new _Literal.default("big-e", "E");
var littleE = new _Literal.default("little-e", "e");
var plus = new _Literal.default("plus", "+");
var minus = new _Literal.default("minus", "-");
var period = new _Literal.default("period", ".");
var digit = new _AnyofThese.default("digit", "0987654321");
var nonZeroDigit = new _AnyofThese.default("non-zero-digit", "987654321");
var digitSequence = new _RepeatValue.default("digit-sequence", digit);
var validDigitSequence = new _AndValue.default("non-zero-start", [nonZeroDigit, digitSequence]);
var plusOrMinus = new _OrValue.default("plus-or-minus", [plus, minus]);
var optionalPlusOrMinus = new _OptionalValue.default(plusOrMinus);
var e = new _OrValue.default("e", [bigE, littleE]);
var integer = new _OrValue.default("integer", [zero, validDigitSequence]);
var fraction = new _AndValue.default("fraction", [digitSequence, period, digitSequence]);
var float = new _OrValue.default("float", [fraction, integer]);
var exponent = new _AndValue.default("exponent", [float, e, optionalPlusOrMinus, digitSequence]);
var number = new _OrValue.default("number", [exponent, fraction, integer]);
var _default = number;
exports.default = _default;
//# sourceMappingURL=number.js.map