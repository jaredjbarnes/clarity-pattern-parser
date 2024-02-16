import { And } from "../../patterns/And";
import { Literal } from "../../patterns/Literal";
import { Or } from "../../patterns/Or";
import { andLiteral } from "./andLiteral";
import { name } from "./name";
import { orLiteral } from "./orLiteral";
import { regexLiteral } from "./regexLiteral";
import { repeatLiteral } from "./repeatLiteral";
import { spaces } from "./spaces";
import { literal } from "./literal";
import { comment } from "./comment";

const optionalSpaces = spaces.clone("optional-spaces", true);
const assignOperator = new Literal("assign-operator", "=");
const optionalComment = comment.clone("inline-comment", true);

const statements = new Or("statements", [
    literal,
    regexLiteral,
    orLiteral,
    andLiteral,
    repeatLiteral,
    name.clone("alias-literal"),
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