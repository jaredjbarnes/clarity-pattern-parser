import { Or } from "../../patterns/Or";
import { Reference } from "../../patterns/Reference";
import { literal } from "./literal";
import { regexLiteral } from "./regexLiteral";

export const primitiveLiterals = new Or("literals", [
    literal,
    regexLiteral,
]);

export const complexLiterals = new Or("complex-literals", [
    new Reference("repeat-literal"),
    new Reference("or-literal"),
    new Reference("and-literal"),
    new Reference("inline-pattern")
]);