import { And } from "../../patterns/And";
import { Literal } from "../../patterns/Literal";
import { Or } from "../../patterns/Or";
import { Regex } from "../../patterns/Regex";

const e = new Or("e", [
    new Literal("e", "e"),
    new Literal("e", "E")
]);

const optionalSign = new Or("sign", [
    new Literal("plus", "+"),
    new Literal("minus", "-")
], true);

const digit = new Regex("digit", "\\d+");

const exponent = new And("exponent", [
    e,
    optionalSign,
    digit,
]);

exponent.enableAstReduction();

export { exponent }