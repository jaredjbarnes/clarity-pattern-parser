import { Sequence } from "../../patterns/Sequence";
import { Literal } from "../../patterns/Literal";
import { Options } from "../../patterns/Options";
import { Reference } from "../../patterns/Reference";
import { Regex } from "../../patterns/Regex";
import { Repeat } from "../../patterns/Repeat";
import { optionalSpaces } from "./optionalSpaces";

const divider = new Regex("invocation-divider", "\\s*,\\s*");

const invocationWithArguments = new Sequence("invocation-with-arguments", [
    new Literal("open-paren", "("),
    optionalSpaces,
    new Repeat("expressions", new Reference("expression"), { divider, min: 0 }),
    optionalSpaces,
    new Literal("close-paren", ")"),
]);

const emptyInvocation = new Sequence("empty-invocation", [
    new Literal("open-paren", "("),
    optionalSpaces,
    new Literal("close-paren", ")"),
]);

export const invocation = new Options("invocation", [
    emptyInvocation,
    invocationWithArguments
])