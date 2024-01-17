import { And } from "../../patterns/And";
import { Literal } from "../../patterns/Literal";
import { Reference } from "../../patterns/Reference";
import { Regex } from "../../patterns/Regex";
import { Repeat } from "../../patterns/Repeat";
import { optionalSpaces } from "./optionalSpaces";

const divider = new Regex("invocation-divider", "\\s*,\\s*");

export const invocation = new And("invocation", [
    new Literal("open-paren", "("),
    optionalSpaces,
    new Repeat("expressions", new Reference("expression"), divider),
    optionalSpaces,
    new Literal("close-paren", ")"),
]);