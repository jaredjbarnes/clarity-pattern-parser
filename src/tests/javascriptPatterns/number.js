import {
  Literal,
  OrValue,
  RepeatValue,
  AndValue,
  AnyOfThese,
  OptionalValue
} from "../../index.js";

const zero = new Literal("zero", "0");
const bigE = new Literal("big-e", "E");
const littleE = new Literal("little-e", "e");
const plus = new Literal("plus", "+");
const minus = new Literal("minus", "-");
const period = new Literal("period", ".");
const digit = new AnyOfThese("digit", "0987654321");
const nonZeroDigit = new AnyOfThese("non-zero-digit", "987654321");
const digitSequence = new RepeatValue("digit-sequence", digit);

const plusOrMinus = new OrValue("plus-or-minus", [plus, minus]);

const optionalPlusOrMinus = new OptionalValue(plusOrMinus);

const validDigitSequence = new AndValue("non-zero-start", [
  optionalPlusOrMinus,
  nonZeroDigit,
  new OptionalValue(digitSequence)
]);

const e = new OrValue("e", [bigE, littleE]);

const integer = new OrValue("integer", [zero, validDigitSequence]);

const fraction = new AndValue("fraction", [
  optionalPlusOrMinus,
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
