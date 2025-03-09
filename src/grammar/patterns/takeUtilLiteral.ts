import { Literal } from "../../patterns/Literal"
import { Optional } from "../../patterns/Optional";
import { Sequence } from "../../patterns/Sequence";
import { lineSpaces } from "./spaces";
import { Reference } from "../../patterns/Reference";

const anyChar = new Literal("any-char", "?");
const upTo = new Literal("up-to", "->");
const wall = new Literal("wall", "|");
const optionalLineSpaces = new Optional("optional-line-spaces", lineSpaces);

export const takeUntilLiteral = new Sequence("take-until-literal", [
    anyChar,
    optionalLineSpaces,
    upTo,
    optionalLineSpaces,
    wall,
    optionalLineSpaces,
    new Reference("pattern")
]);