import { Options } from "../../patterns/Options";
import { Reference } from "../../patterns/Reference";
import { literal } from "./literal";
import { name } from "./name";
import { regexLiteral } from "./regexLiteral";

const patternName = name.clone("pattern-name");

export const anonymousLiterals = new Options("anonymous-literals", [
    literal,
    regexLiteral,
    patternName,
    new Reference("repeat-literal"),
]);

export const anonymousWrappedLiterals = new Options("anonymous-wrapped-literals", [
    new Reference("or-literal"),
    new Reference("sequence-literal"),
    new Reference("complex-anonymous-pattern")
]);