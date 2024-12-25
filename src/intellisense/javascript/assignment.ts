import { Sequence } from "../../patterns/Sequence";
import { Literal } from "../../patterns/Literal";
import { Options } from "../../patterns/Options";
import { Reference } from "../../patterns/Reference";
import { expression } from "./expression";
import { optionalSpaces } from "./optionalSpaces";

const assignmentOperators = new Options("assignment-operators", [
    new Literal("assign", "="),
    new Literal("addition-assign", "+="),
    new Literal("subtraction-assign", "-="),
]);

const assignment = new Sequence("assignment", [
    expression,
    optionalSpaces,
    assignmentOperators,
    optionalSpaces,
    new Options("assignment-right-operand", [
        new Reference("assignment"),
        expression
    ]),
]);




export { assignment };