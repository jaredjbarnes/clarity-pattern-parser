import { Sequence } from "../../patterns/Sequence";
import { Literal } from "../../patterns/Literal";
import { Regex } from "../../patterns/Regex";
import { expression } from "./expression";
import { propertyAccess } from "./propertyAccess";

const space = new Regex("space", "\\s+");
export const deleteStatement = new Sequence("delete-statement", [
    new Literal("delete-keyword", "delete"),
    space,
    expression,
    propertyAccess
]);

