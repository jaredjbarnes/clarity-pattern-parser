import { Sequence } from "../../patterns/Sequence";
import { Literal } from "../../patterns/Literal";
import { Options } from "../../patterns/Options";
import { Reference } from "../../patterns/Reference";
import { Regex } from "../../patterns/Regex";
import { Repeat } from "../../patterns/Repeat";
import { optionalSpaces } from "./optionalSpaces";

const divider = new Regex("array-divider", "\\s*,\\s*");
const arrayItems = new Repeat("array-items", new Reference("expression"), { divider, min: 0 });

export const arrayLiteral = new Options("array-literal",
    [new Sequence("empty-array-literal", [
        new Literal("open-square-bracket", "["),
        optionalSpaces,
        new Literal("close-square-bracket", "]"),
    ]),
    new Sequence("array-literal", [
        new Literal("open-square-bracket", "["),
        optionalSpaces,
        arrayItems,
        optionalSpaces,
        new Literal("close-square-bracket", "]"),
    ])
    ]);