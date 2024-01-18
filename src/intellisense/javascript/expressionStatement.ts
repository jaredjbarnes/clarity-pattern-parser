import { And } from "../../patterns/And";
import { Literal } from "../../patterns/Literal";
import { Or } from "../../patterns/Or";
import { Repeat } from "../../patterns/Repeat";
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
]);

const expressionStatement = new And("expressionStatement", [
    new Repeat("assignments",
        assignment),
    optionalSpaces,
    expression
]);


export { expressionStatement }