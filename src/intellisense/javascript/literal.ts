import { Or } from "../../patterns/Or";
import { arrayLiteral } from "./arrayLiteral";
import { numberLiteral } from "./numberLiteral";
import { objectLiteral } from "./objectLiteral";
import { stringLiteral } from "./stringLiteral";

const literal = new Or("literal", [
    numberLiteral,
    stringLiteral,
    arrayLiteral,
    objectLiteral,
]);

export { literal }
