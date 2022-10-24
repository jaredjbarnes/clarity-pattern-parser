import { Literal, Not, Or, Repeat, And, Regex } from "../../index";

const singleQuote = new Literal("single-quote", "'");
const doubleQuote = new Literal("double-quote", '"');
const backslash = new Literal("double-quote", "\\");

const singleQuoteOrBackslash = new Or("single-quote-or-backslash", [
  singleQuote,
  backslash,
]);

const doubleQuoteOrBackslash = new Or("single-quote-or-backslash", [
  doubleQuote,
  backslash,
]);

const unescapedSingleCharacter = new Regex(
  "unescaped-single-character",
  "[^'\\\\]"
);
const unescapedDoubleCharacter = new Regex(
  "unescaped-double-character",
  `[^"\\\\]`
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

const singleQuoteCharacter = new Or("character", [
  escapedSingleQuote,
  escapedDoubleQuote,
  escapedBackslash,
  escapedSlash,
  escapedBackspace,
  escapedformFeed,
  escapedNewLine,
  escapedCarriageReturn,
  escapedTab,
  unescapedSingleCharacter,
]);

const doubleQuoteCharacter = new Or("character", [
  escapedSingleQuote,
  escapedDoubleQuote,
  escapedBackslash,
  escapedSlash,
  escapedBackspace,
  escapedformFeed,
  escapedNewLine,
  escapedCarriageReturn,
  escapedTab,
  unescapedDoubleCharacter,
]);

const singleCharacterSequence = new Repeat(
  "string-content",
  singleQuoteCharacter
);
const doubleCharacterSequence = new Repeat(
  "string-content",
  doubleQuoteCharacter
);

const singleQuoteString = new And("single-quote-string", [
  singleQuote,
  singleCharacterSequence,
  singleQuote,
]);

const doubleQuoteString = new And("double-quote-string", [
  doubleQuote,
  doubleCharacterSequence,
  doubleQuote,
]);

const string = new Or("string", [singleQuoteString, doubleQuoteString]);

export default string;
