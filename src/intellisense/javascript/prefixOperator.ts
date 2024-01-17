import { Literal } from "../../patterns/Literal";
import { Or } from "../../patterns/Or";
import { Regex } from "../../patterns/Regex";

const prefixOperator = new Or("prefix-operator", [
    new Literal("typeof", "typeof "),
    new Literal("to-number", "+"),
    new Literal("negate", "-"),
    new Literal("logical-not", "!"),
]);

prefixOperator.enableAstReduction();

export { prefixOperator }

