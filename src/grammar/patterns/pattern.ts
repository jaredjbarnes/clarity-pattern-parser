import { Or } from "../../patterns/Or";
import { literal } from "./literal";
import { regexLiteral } from "./regexLiteral";
import { repeatLiteral } from "./repeatLiteral";
import { andLiteral } from "./andLiteral";
import { orLiteral } from "./orLiteral";
import { anonymousPattern } from "./anonymousPattern";
import { And } from "../../patterns/And";
import { Literal } from "../../patterns/Literal";
import { name } from "./name";

const aliasLiteral = name.clone("alias-literal");
const optionalIsOptional = new Literal("is-optional", "?", true);
const configurableAnonymousPattern = new And("configurable-anonymous-pattern", [anonymousPattern, optionalIsOptional]);

export const pattern = new Or("pattern", [
    literal,
    regexLiteral,
    repeatLiteral,
    aliasLiteral,
    orLiteral,
    andLiteral,
    configurableAnonymousPattern,
], false, true);
