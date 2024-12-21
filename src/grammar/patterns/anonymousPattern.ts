import { Literal } from "../../patterns/Literal";
import { And } from "../../patterns/And";
import { lineSpaces } from "./spaces";
import { anonymousLiterals, anonymousWrappedLiterals } from './literals';
import { Or } from "../../patterns/Or";

const inlinePatternOpenParen = new Literal("anonymous-pattern-open-paren", "(");
const inlinePatternCloseParen = new Literal("anonymous-pattern-close-paren", ")");
const optionalLineSpaces = lineSpaces.clone(undefined, true);

const complexAnonymousPattern = new And("complex-anonymous-pattern", [
    inlinePatternOpenParen,
    optionalLineSpaces,
    anonymousWrappedLiterals,
    optionalLineSpaces,
    inlinePatternCloseParen,
]);

export const anonymousPattern = new Or("anonymous-pattern", [
    anonymousLiterals,
    complexAnonymousPattern
]);