import { Literal } from "../../patterns/Literal";
import { Options } from "../../patterns/Options";

const multiply = new Literal("multiply", "*");
const divide = new Literal("divide", "/");
const remainder = new Literal("remainder", "%");
const add = new Literal("add", "+");
const subtract = new Literal("subtract", "-");
const greaterOptionsEqual = new Literal("greater-or-equal", ">=");
const lessOptionsEqual = new Literal("less-or-equal", "<=");
const greater = new Literal("greater", ">");
const less = new Literal("less", "<");
const equal = new Literal("equal", "==");
const notEqual = new Literal("not-equal", "!=");
const strictEqual = new Literal("strict-equal", "===");
const strictNotEqual = new Literal("strict-not-equal", "!==");
const logicalOptions = new Literal("logical-or", "||");
const logicalAnd = new Literal("logical-and", "&&");

const infixOperator = new Options("infix-operator", [
    multiply,
    divide,
    remainder,
    add,
    subtract,
    greaterOptionsEqual,
    lessOptionsEqual,
    greater,
    less,
    strictEqual,
    strictNotEqual,
    equal,
    notEqual,
    logicalOptions,
    logicalAnd
]);

export { infixOperator };


