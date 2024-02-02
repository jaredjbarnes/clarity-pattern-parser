import { And } from "../patterns/And";
import { Literal } from "../patterns/Literal";
import { Or } from "../patterns/Or";
import { andLiteral } from "./andLiteral";
import { name } from "./name";
import { orLiteral } from "./orLiteral";
import { regexLiteral } from "./regexLiteral";
import { repeatLiteral } from "./repeatLiteral";
import { spaces } from "./spaces";
import { stringLiteral } from "./stringLiteral";
import { comment } from "./comment";

const optionalSpaces = spaces.clone("optional-spaces", true);
const assignOperator = new Literal("assign-operator", "=");
const optionalComment = comment.clone("inline-comment", true);

const statements = new Or("statements", [
    stringLiteral,
    regexLiteral,
    orLiteral,
    andLiteral,
    repeatLiteral,
]);

export const statement = new And("statement", [
    optionalSpaces,
    name,
    optionalSpaces,
    assignOperator,
    optionalSpaces,
    statements,
    optionalSpaces,
    optionalComment,
    optionalSpaces,
]);