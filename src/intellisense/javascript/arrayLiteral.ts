import { And } from "../../patterns/And";
import { Literal } from "../../patterns/Literal";
import { Reference } from "../../patterns/Reference";
import { Regex } from "../../patterns/Regex";
import { Repeat } from "../../patterns/Repeat";
import { optionalSpaces } from "./optionalSpaces";

const divider = new Regex("array-divider", "\\s*,\\s*");
const arrayItems = new Repeat("array-item", new Reference("expression"), divider);

export const arrayLiteral = new And("array-literal", [
    new Literal("open-square-bracket", "["),
    optionalSpaces,
    arrayItems,
    optionalSpaces,
    new Literal("close-square-bracket", "]"),
]);