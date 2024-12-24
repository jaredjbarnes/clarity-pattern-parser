import { Sequence } from "../../patterns/Sequence";
import { Literal } from "../../patterns/Literal";
import { Options } from "../../patterns/Options";
import { Reference } from "../../patterns/Reference";
import { Regex } from "../../patterns/Regex";
import { Repeat } from "../../patterns/Repeat";
import { infixOperator } from "./infixOperator";
import { invocation } from "./invocation";
import { nullKeyword } from "./keywords";
import { literal } from "./literal";
import { name } from "./name";
import { objectAccess } from "./objectAccess";
import { optionalSpaces } from "./optionalSpaces";
import { prefixOperator } from "./prefixOperator";
import { propertyAccess } from "./propertyAccess";

const space = new Regex("space", "\\s+")
const newKeyword = new Literal("new-keyword", "new");
const deleteKeyword = new Literal("delete-keyword", "delete");

const newExpression = new Sequence("new-expression", [
    newKeyword,
    space,
    new Reference("expression")
]);

const deleteExpression = new Sequence("delete-expression", [
    deleteKeyword,
    space,
    new Reference("expression")
]);

const groupExpression = new Sequence("group-expression", [
    new Literal("open-paren", "("),
    optionalSpaces,
    new Reference("expression"),
    optionalSpaces,
    new Literal("close-paren", ")")
]);

const prefixExpression = new Sequence("prefix-expression", [
    prefixOperator,
    new Reference("expression")
]);

const memberAccess = new Repeat("member-access",
    new Options("member-access", [
        invocation,
        propertyAccess,
    ])
);


var variableName = name.clone("variable-name");

const expressions = new Options("expressions", [
    newExpression,
    deleteExpression,
    literal,
    nullKeyword,
    objectAccess,
    variableName,
    groupExpression,
    prefixExpression
]);

const expressionBody = new Sequence("expression-body", [
    expressions,
    memberAccess.clone(undefined, true),
]);

const infixExpression = new Sequence("infix-expression", [
    expressionBody,
    optionalSpaces,
    infixOperator,
    optionalSpaces,
    new Options("infix-right-operand", [
        new Reference("infix-expression"),
        expressionBody,
    ])
]);

const ternaryExpression = new Sequence("ternary", [
    new Options("ternary-condition", [
        infixExpression,
        expressionBody
    ]),
    optionalSpaces,
    new Literal("question-mark", "?"),
    optionalSpaces,
    new Reference("expression"),
    optionalSpaces,
    new Literal("colon", ":"),
    optionalSpaces,
    new Reference("expression")
]);

const expression = new Options("expression", [
    ternaryExpression,
    infixExpression,
    expressionBody
]);

export { expression }

