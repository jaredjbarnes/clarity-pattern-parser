import { And } from "../../patterns/And";
import { Literal } from "../../patterns/Literal";
import { Or } from "../../patterns/Or";
import { Reference } from "../../patterns/Reference";
import { Regex } from "../../patterns/Regex";
import { Repeat } from "../../patterns/Repeat";
import { optionalSpaces } from "./optionalSpaces";

const divider = new Regex("array-divider", "\\s*,\\s*");
const arrayItems = new Repeat("array-items", new Reference("expression"), divider, true);

export const arrayLiteral = new Or("array-literal",
    [new And("empty-array-literal", [
        new Literal("open-square-bracket", "["),
        optionalSpaces,
        new Literal("close-square-bracket", "]"),
    ]),
    new And("array-literal", [
        new Literal("open-square-bracket", "["),
        optionalSpaces,
        arrayItems,
        optionalSpaces,
        new Literal("close-square-bracket", "]"),
    ])
    ]);