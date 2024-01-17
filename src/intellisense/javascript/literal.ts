import { Or } from "../../patterns/Or";
import { arrayLiteral } from "./arrayLiteral";
import { numberLiteral } from "./numberLiteral";
import { objectLiteral } from "./objectLiteral";
import { stringLiteral } from "./stringLiteral";

export const literal = new Or("literal", [
    numberLiteral,
    stringLiteral,
    objectLiteral,
    arrayLiteral
]);
