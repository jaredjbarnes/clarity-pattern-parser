import { Repeat } from "../../patterns/Repeat"
import { Regex } from "../../patterns/Regex";
import { name } from "./name";
import { inlinePattern } from "./inlinePattern";
import { Or } from "../../patterns/Or";
import { And } from "../../patterns/And";
import { Literal } from "../../patterns/Literal";

const optionalNot = new Literal("not", "!", true);
const optionalIsOptional = new Literal("is-optional", "?", true);
const patternName = name.clone("pattern-name");
const patterns = new Or("and-patterns", [patternName, inlinePattern]);

export const pattern = new And("and-child-pattern", [
    optionalNot,
    patterns,
    optionalIsOptional,
]);

const divider = new Regex("and-divider", "\\s*[+]\\s*");
divider.setTokens([" + "]);

export const andLiteral = new Repeat("and-literal", pattern, { divider, min: 2, trimDivider: true });