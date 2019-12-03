"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _index = require("../../index.js");

var zero = new _index.Literal("zero", "0");
var bigE = new _index.Literal("big-e", "E");
var littleE = new _index.Literal("little-e", "e");
var plus = new _index.Literal("plus", "+");
var minus = new _index.Literal("minus", "-");
var period = new _index.Literal("period", ".");
var digit = new _index.AnyOfThese("digit", "0987654321");
var nonZeroDigit = new _index.AnyOfThese("non-zero-digit", "987654321");
var digitSequence = new _index.RepeatValue("digit-sequence", digit);
var plusOrMinus = new _index.OrValue("plus-or-minus", [plus, minus]);
var optionalPlusOrMinus = new _index.OptionalValue(plusOrMinus);
var validDigitSequence = new _index.AndValue("non-zero-start", [optionalPlusOrMinus, nonZeroDigit, new _index.OptionalValue(digitSequence)]);
var e = new _index.OrValue("e", [bigE, littleE]);
var integer = new _index.OrValue("integer", [zero, validDigitSequence]);
var fraction = new _index.AndValue("fraction", [optionalPlusOrMinus, digitSequence, period, digitSequence]);
var float = new _index.OrValue("float", [fraction, integer]);
var exponent = new _index.AndValue("exponent", [float, e, optionalPlusOrMinus, digitSequence]);
var number = new _index.OrValue("number", [exponent, fraction, integer]);
var _default = number;
exports.default = _default;
//# sourceMappingURL=number.js.map