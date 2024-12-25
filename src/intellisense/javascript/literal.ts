import { Options } from "../../patterns/Options";
import { arrayLiteral } from "./arrayLiteral";
import { numberLiteral } from "./numberLiteral";
import { objectLiteral } from "./objectLiteral";
import { stringLiteral } from "./stringLiteral";

const literal = new Options("literal", [
    numberLiteral,
    stringLiteral,
    arrayLiteral,
    objectLiteral,
]);

export { literal };
