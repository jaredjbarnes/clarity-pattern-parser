import Literal from "../../patterns/value/Literal.js";
import OrValue from "../../patterns/value/OrValue.js";
import RepeatValue from "../../patterns/value/RepeatValue.js";
import AndValue from "../../patterns/value/AndValue.js";
import AnyOfThese from "../../patterns/value/AnyofThese.js";
import OptionalValue from "../../patterns/value/OptionalValue.js";

const zero = new Literal("zero", "0");
const bigE = new Literal("big-e", "E");
const littleE = new Literal("little-e", "e");
const plus = new Literal("plus", "+");
const minus = new Literal("minus", "-");
const period = new Literal("period", ".");
const digit = new AnyOfThese("digit", "0987654321");
const nonZeroDigit = new AnyOfThese("non-zero-digit", "987654321");
const digitSequence = new RepeatValue("digit-sequence", digit);

const validDigitSequence = new AndValue("non-zero-start", [
  nonZeroDigit,
  new OptionalValue(digitSequence)
]);

const plusOrMinus = new OrValue("plus-or-minus", [plus, minus]);

const optionalPlusOrMinus = new OptionalValue(plusOrMinus);

const e = new OrValue("e", [bigE, littleE]);

const integer = new OrValue("integer", [zero, validDigitSequence]);

const fraction = new AndValue("fraction", [
  digitSequence,
  period,
  digitSequence
]);

const float = new OrValue("float", [
    fraction,
    integer
]);

const exponent = new AndValue("exponent", [
  float,
  e,
  optionalPlusOrMinus,
  digitSequence
]);

const number = new OrValue("number", [exponent, fraction, integer]);

export default number;
