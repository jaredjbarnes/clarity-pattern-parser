import { Literal } from "../../patterns/Literal";
import { And } from "../../patterns/And";
import { lineSpaces } from "./spaces";
import { primitiveLiterals, complexLiterals } from './literals';
import { Or } from "../../patterns/Or";

const inlinePatternOpenParen = new Literal("inline-pattern-open-paren", "(");
const inlinePatternCloseParen = new Literal("inline-pattern-close-paren", ")");
const optionalLineSpaces = lineSpaces.clone(undefined, true);

const complexInlinePattern = new And("complex-inline-pattern", [
    inlinePatternOpenParen,
    optionalLineSpaces,
    complexLiterals,
    optionalLineSpaces,
    inlinePatternCloseParen,
]);

export const inlinePattern = new Or("inline-pattern", [
    primitiveLiterals,
    complexInlinePattern
]);