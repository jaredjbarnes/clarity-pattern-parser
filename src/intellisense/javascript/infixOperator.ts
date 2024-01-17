import { Literal } from "../../patterns/Literal"
import { Or } from "../../patterns/Or";

const multiply = new Literal("multiply", "*");
const divide = new Literal("divide", "/");
const remainder = new Literal("remainder", "%");
const add = new Literal("add", "+");
const subtract = new Literal("subtract", "-");
const greaterOrEqual = new Literal("greater-or-equal", ">=");
const lessOrEqual = new Literal("less-or-equal", "<=");
const greater = new Literal("greater", ">");
const less = new Literal("less", "<");
const equal = new Literal("equal", "===");
const notEqual = new Literal("not-equal", "!==");
const logicalOr = new Literal("logical-or", "||");
const logicalAnd = new Literal("logical-and", "&&");

const infixOperator = new Or("infix-operator", [
    multiply,
    divide,
    remainder,
    add,
    subtract,
    greaterOrEqual,
    lessOrEqual,
    greater,
    less,
    equal,
    notEqual,
    logicalOr,
    logicalAnd
]);

infixOperator.enableAstReduction();

export { infixOperator }


