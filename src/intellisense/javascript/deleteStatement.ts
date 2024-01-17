import { And } from "../../patterns/And";
import { Literal } from "../../patterns/Literal";
import { Reference } from "../../patterns/Reference";
import { Regex } from "../../patterns/Regex";
import { refinement } from "./refinement";

const space = new Regex("space", "\\s+");
export const deleteStatement = new And("delete-statement", [
    new Literal("delete-keyword", "delete"),
    space,
    new Reference("expression"),
    refinement
]);

