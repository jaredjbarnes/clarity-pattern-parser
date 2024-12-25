import { Sequence } from "../../patterns/Sequence";
import { Literal } from "../../patterns/Literal";
import { Options } from "../../patterns/Options";
import { Regex } from "../../patterns/Regex";

const e = new Options("e", [
    new Literal("e", "e"),
    new Literal("e", "E")
]);

const optionalSign = new Options("sign", [
    new Literal("plus", "+"),
    new Literal("minus", "-")
], true);

const digit = new Regex("digit", "\\d+");

const exponent = new Sequence("exponent", [
    e,
    optionalSign,
    digit,
]);

export { exponent };