import OrComposite from "../../patterns/composite/OrComposite.js";
import Literal from "../../patterns/value/Literal.js";
import NotValue from "../../patterns/value/NotValue.js";
import OrValue from "../../patterns/value/OrValue.js";
import RepeatValue from "../../patterns/value/RepeatValue.js";
import AndValue from "../../patterns/value/AndValue.js";
import AnyOfThese from "../../patterns/value/AnyofThese.js";
import OptionalValue from "../../patterns/value/OptionalValue.js";

const singleQuote = new Literal("single-quote", "'");
const doubleQuote = new Literal("double-quote", '"');
const backslash = new Literal("double-quote", "\\");

const singleQuoteOrBackslash = new OrValue("single-quote-or-backslash", [
  singleQuote,
  backslash
]);

const doubleQuoteOrBackslash = new OrValue("single-quote-or-backslash", [
  singleQuote,
  backslash
]);

const unescapedSinlgeCharacter = new NotValue(
  "unescaped-single-character",
  singleQuoteOrBackslash
);
const unescapedDoubleCharacter = new NotValue(
  "unescaped-double-character",
  doubleQuoteOrBackslash
);
const escapedSingleQuote = new Literal("escaped-single-quote", "\\'");
const escapedDoubleQuote = new Literal("escaped-double-quote", '\\"');
const escapedBackslash = new Literal("escaped-backslash", "\\/");
const escapedSlash = new Literal("escaped-slash", "\\/");
const escapedBackspace = new Literal("escaped-backspace", "\\b");
const escapedformFeed = new Literal("escaped-form-feed", "\\f");
const escapedNewLine = new Literal("escaped-new-line", "\\n");
const escapedCarriageReturn = new Literal("escaped-carriage-return", "\\r");
const escapedTab = new Literal("escaped-tab", "\\t");

const singleQuoteCharacter = new OrValue("character", [
  escapedSingleQuote,
  escapedDoubleQuote,
  escapedBackslash,
  escapedSlash,
  escapedBackspace,
  escapedformFeed,
  escapedNewLine,
  escapedCarriageReturn,
  escapedTab,
  unescapedSinlgeCharacter
]);

const doubleQuoteCharacter = new OrValue("character", [
  escapedSingleQuote,
  escapedDoubleQuote,
  escapedBackslash,
  escapedSlash,
  escapedBackspace,
  escapedformFeed,
  escapedNewLine,
  escapedCarriageReturn,
  escapedTab,
  unescapedDoubleCharacter
]);

const singleCharacterSequence = new RepeatValue("string-content", singleQuoteCharacter);
const doubleCharacterSequence = new RepeatValue("string-content", doubleQuoteCharacter);

const singleQuoteString = new AndValue("single-quote-string", [
  singleQuote,
  singleCharacterSequence,
  singleQuote
]);

const doubleQuoteString = new AndValue("double-quote-string", [
  doubleQuote,
  doubleCharacterSequence,
  doubleQuote
]);

const string = new OrValue("string", [singleQuoteString, doubleQuoteString]);

export default string;
