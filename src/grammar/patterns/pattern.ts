import { Or } from "../../patterns/Or";
import { literal } from "./literal";
import { regexLiteral } from "./regexLiteral";
import { repeatLiteral } from "./repeatLiteral";
import { andLiteral } from "./andLiteral";
import { orLiteral } from "./orLiteral";
import { inlinePattern } from "./inlinePattern";
import { And } from "../../patterns/And";
import { Literal } from "../../patterns/Literal";

const optionalIsOptional = new Literal("is-optional", "?", true);
const configurableInlinePattern = new And("configurable-inline-pattern", [inlinePattern, optionalIsOptional]);

export const pattern = new Or("pattern", [
    literal,
    regexLiteral,
    repeatLiteral,
    orLiteral,
    andLiteral,
    configurableInlinePattern,
], false, true);
