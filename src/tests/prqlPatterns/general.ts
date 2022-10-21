import {
  Literal,
  RepeatValue,
  OrValue,
  NotValue,
  RegexValue,
  AndValue,
} from "../../index";

const space = new Literal('space', ' ');
const tab = new Literal('tab', '\t');
export const whitespace = new OrValue('whitespace', [space, tab]);

const newline = new Literal('newline', '\n');
export const newlines = new RepeatValue('newlines', newline);
export const notNewline = new NotValue('not-newline', newline);

export const asciiDigit = new RegexValue('ascii-digit', '[0-9]');
export const asciiDigits = new RepeatValue('ascii-digit', asciiDigit);

export const endExpression = new RegexValue('end-expression', '$|[,)\]\n \t]|..')

const prqlKeyword = new Literal('prql', 'prql');
const tableKeyword = new Literal('table', 'table');
const funcKeyword = new Literal('func', 'func');
const keywordOption = new OrValue('keyword-option', [prqlKeyword, tableKeyword, funcKeyword]);
export const keyword = new AndValue('keyword', [keywordOption, whitespace]);
