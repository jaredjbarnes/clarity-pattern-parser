import { Literal } from "../../patterns/Literal";
import { Sequence } from "../../patterns/Sequence";
import { lineSpaces } from "./spaces";
import { anonymousLiterals, anonymousWrappedLiterals } from './literals';
import { Options } from "../../patterns/Options";
import { Optional } from "../../patterns/Optional";

const inlinePatternOpenParen = new Literal("anonymous-pattern-open-paren", "(");
const inlinePatternCloseParen = new Literal("anonymous-pattern-close-paren", ")");
const optionalLineSpaces = new Optional("optional-line-spaces", lineSpaces);

const complexAnonymousPattern = new Sequence("complex-anonymous-pattern", [
    inlinePatternOpenParen,
    optionalLineSpaces,
    anonymousWrappedLiterals,
    optionalLineSpaces,
    inlinePatternCloseParen,
]);

export const anonymousPattern = new Options("anonymous-pattern", [
    anonymousLiterals,
    complexAnonymousPattern
]);