import { Regex } from "../..";
import { And } from "../../patterns/And";
import { Literal } from "../../patterns/Literal";
import { Or } from "../../patterns/Or";
import { Reference } from "../../patterns/Reference";
import { Repeat } from "../../patterns/Repeat";
import { infixOperator } from "./infixOperator";
import { invocation } from "./invocation";
import { literal } from "./literal";
import { name } from "./name";
import { optionalSpaces } from "./optionalSpaces";
import { prefixOperator } from "./prefixOperator";
import { propertyAccess } from "./propertyAccess";

const space = new Regex("space", "\\s+")
const newKeyword = new Literal("new-keyword", "new");
const deleteKeyword = new Literal("delete-keyword", "delete");

const newExpression = new And("new-expression", [
    newKeyword,
    space,
    new Reference("expression")
]);

const deleteExpression = new And("delete-expression", [
    deleteKeyword,
    space,
    new Reference("expression")
]);

const groupExpression = new And("group-expression", [
    new Literal("open-paren", "("),
    optionalSpaces,
    new Reference("expression"),
    optionalSpaces,
    new Literal("close-paren", ")")
]);

const prefixExpression = new And("prefix-expression", [
    prefixOperator,
    new Reference("expression")
]);

const optionalInfix = new And("infix-expression", [
    infixOperator,
    optionalSpaces,
    new Reference("expression"),
], true);

const optionalTernary = new And("ternary", [
    new Literal("question-mark", "?"),
    optionalSpaces,
    new Reference("expression"),
    optionalSpaces,
    new Literal("colon", ":"),
    optionalSpaces,
    new Reference("expression")
], true);

const optionalMemberAccesses = new Repeat("object-member-accesses",
    new Or("object-member-access", [
        invocation,
        propertyAccess,
    ]),
    undefined, true
);

var variableName = name.clone("variable-name");

const expressions = new Or("expressions", [
    newExpression,
    deleteExpression,
    groupExpression,
    prefixExpression,
    literal,
    variableName,
]);

const expression = new And("expression", [
    expressions,
    optionalInfix,
    optionalTernary,
    optionalMemberAccesses
]);

export { expression }

