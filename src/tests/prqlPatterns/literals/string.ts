import {
  Literal,
  AndValue,
  OrValue,
  NotValue,
  RepeatValue,
  OptionalValue,
} from "../../../index";

const singleQuote = new Literal('single-quote', "'");
const notSingleQuote = new NotValue('not-single-quote', singleQuote);
const doubleQuote = new Literal('double-quote', '"');
const notDoubleQuote = new NotValue('not-double-quote', doubleQuote);

const repeatedNotSingleQuote = new RepeatValue('repeated-not-single-quote', notSingleQuote);
const singleQuoteInnerString = new OptionalValue(repeatedNotSingleQuote);
const singleQuoteString = new AndValue('single-quote-string', [singleQuote, singleQuoteInnerString, singleQuote]);

const repeatedNotDoubleQuote = new RepeatValue('repeated-not-single-quote', notDoubleQuote);
const doubleQuoteInnerString = new OptionalValue(repeatedNotDoubleQuote);
const doubleQuoteString = new AndValue('double-quote-string', [doubleQuote, doubleQuoteInnerString, doubleQuote]);

export const stringLiteral = new OrValue('string', [singleQuoteString, doubleQuoteString]);
