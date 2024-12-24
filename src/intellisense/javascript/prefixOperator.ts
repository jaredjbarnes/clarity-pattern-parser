import { Literal } from "../../patterns/Literal";
import { Options } from "../../patterns/Options";

const prefixOperator = new Options("prefix-operator", [
    new Literal("typeof", "typeof "),
    new Literal("to-number", "+"),
    new Literal("negate", "-"),
    new Literal("logical-not", "!"),
]);

export { prefixOperator }

