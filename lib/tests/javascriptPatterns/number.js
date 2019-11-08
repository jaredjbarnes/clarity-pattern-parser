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

const zero = new _Literal.default("zero", "0");
const bigE = new _Literal.default("big-e", "E");
const littleE = new _Literal.default("little-e", "e");
const plus = new _Literal.default("plus", "+");
const minus = new _Literal.default("minus", "-");
const period = new _Literal.default("period", ".");
const digit = new _AnyofThese.default("digit", "0987654321");
const nonZeroDigit = new _AnyofThese.default("non-zero-digit", "987654321");
const digitSequence = new _RepeatValue.default("digit-sequence", digit);
const validDigitSequence = new _AndValue.default("non-zero-start", [nonZeroDigit, digitSequence]);
const plusOrMinus = new _OrValue.default("plus-or-minus", [plus, minus]);
const optionalPlusOrMinus = new _OptionalValue.default(plusOrMinus);
const e = new _OrValue.default("e", [bigE, littleE]);
const integer = new _OrValue.default("integer", [zero, validDigitSequence]);
const fraction = new _AndValue.default("fraction", [digitSequence, period, digitSequence]);
const float = new _OrValue.default("float", [fraction, integer]);
const exponent = new _AndValue.default("exponent", [float, e, optionalPlusOrMinus, digitSequence]);
const number = new _OrValue.default("number", [exponent, fraction, integer]);
var _default = number;
exports.default = _default;
//# sourceMappingURL=number.js.map