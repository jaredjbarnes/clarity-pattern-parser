import { And } from "../../patterns/And";
import { Literal } from "../../patterns/Literal";
import { Or } from "../../patterns/Or";
import { Reference } from "../../patterns/Reference";
import { Regex } from "../../patterns/Regex";
import { Repeat } from "../../patterns/Repeat";
import { optionalSpaces } from "./optionalSpaces";

const divider = new Regex("invocation-divider", "\\s*,\\s*");

const invocationWithArguments = new And("invocation-with-arguments", [
    new Literal("open-paren", "("),
    optionalSpaces,
    new Repeat("expressions", new Reference("expression"), divider, true),
    optionalSpaces,
    new Literal("close-paren", ")"),
]);

const emptyInvocation = new And("empty-invocation", [
    new Literal("open-paren", "("),
    optionalSpaces,
    new Literal("close-paren", ")"),
]);

export const invocation = new Or("invocation", [
    emptyInvocation,
    invocationWithArguments
])