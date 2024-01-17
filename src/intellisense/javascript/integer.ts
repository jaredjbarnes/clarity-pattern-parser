import { And } from "../../patterns/And";
import { Literal } from "../../patterns/Literal";
import { Or } from "../../patterns/Or";
import { Regex } from "../../patterns/Regex";

const zero = new Literal("zero", "0");
const nonZeroDigit = new Regex("non-zero-digit", "[1-9]");
const digit = new Regex("digit", "\\d+", true);

const integer = new Or("integer", [
    zero,
    new And("digits", [nonZeroDigit, digit])
]);

integer.enableAstReduction();

export {
    integer
}