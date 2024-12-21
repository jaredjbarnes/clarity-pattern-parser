import { Or } from "../../patterns/Or";
import { Reference } from "../../patterns/Reference";
import { literal } from "./literal";
import { name } from "./name";
import { regexLiteral } from "./regexLiteral";

const patternName = name.clone("pattern-name");

export const anonymousLiterals = new Or("anonymous-literals", [
    literal,
    regexLiteral,
    patternName,
    new Reference("repeat-literal"),
]);

export const anonymousWrappedLiterals = new Or("anonymous-wrapped-literals", [
    new Reference("or-literal"),
    new Reference("and-literal"),
    new Reference("complex-anonymous-pattern")
]);