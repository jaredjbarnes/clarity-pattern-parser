import { Sequence } from "../../patterns/Sequence";
import { Literal } from "../../patterns/Literal";
import { Regex } from "../../patterns/Regex";

const period = new Literal("period", ".");
const digit = new Regex("digit", "\\d+");
const fraction = new Sequence("fraction", [period, digit]);

export {
    fraction
};