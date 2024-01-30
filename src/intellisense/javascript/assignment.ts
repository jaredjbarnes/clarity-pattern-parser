import { And } from "../../patterns/And";
import { Literal } from "../../patterns/Literal";
import { Or } from "../../patterns/Or";
import { Reference } from "../../patterns/Reference";
import { expression } from "./expression";
import { optionalSpaces } from "./optionalSpaces";

const assignmentOperators = new Or("assignment-operators", [
    new Literal("assign", "="),
    new Literal("addition-assign", "+="),
    new Literal("subtraction-assign", "-="),
]);

const assignment = new And("assignment", [
    expression,
    optionalSpaces,
    assignmentOperators,
    optionalSpaces,
    new Or("assignment-right-operand", [
        new Reference("assignment"),
        expression
    ]),
]);




export { assignment }