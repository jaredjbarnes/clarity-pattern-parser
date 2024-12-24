import { Repeat } from "../../patterns/Repeat"
import { Regex } from "../../patterns/Regex";
import { name } from "./name";
import { anonymousPattern } from "./anonymousPattern";
import { Options } from "../../patterns/Options";
import { Sequence } from "../../patterns/Sequence";
import { Literal } from "../../patterns/Literal";

const optionalNot = new Literal("not", "!", true);
const optionalIsOptional = new Literal("is-optional", "?", true);
const patternName = name.clone("pattern-name");
const patterns = new Options("and-patterns", [patternName, anonymousPattern]);

export const pattern = new Sequence("and-child-pattern", [
    optionalNot,
    patterns,
    optionalIsOptional,
]);

const divider = new Regex("and-divider", "\\s*[+]\\s*");
divider.setTokens([" + "]);

export const sequenceLiteral = new Repeat("sequence-literal", pattern, { divider, min: 2, trimDivider: true });