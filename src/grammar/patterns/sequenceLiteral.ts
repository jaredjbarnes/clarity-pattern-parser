import { Repeat } from "../../patterns/Repeat";
import { Regex } from "../../patterns/Regex";
import { name } from "./name";
import { anonymousPattern } from "./anonymousPattern";
import { Options } from "../../patterns/Options";
import { Sequence } from "../../patterns/Sequence";
import { Literal } from "../../patterns/Literal";
import { Optional } from "../../patterns/Optional";

const optionalNot = new Optional("optional-not", new Literal("not", "!"));
const optionalIsOptional = new Optional("optional-is-optional", new Literal("is-optional", "?"));
const patternName = name.clone("pattern-name");
const patterns = new Options("sequence-patterns", [patternName, anonymousPattern]);

export const pattern = new Sequence("sequence-child-pattern", [
    optionalNot,
    patterns,
    optionalIsOptional,
]);

const divider = new Regex("sequence-divider", "\\s*[+]\\s*");
divider.setTokens([" + "]);

export const sequenceLiteral = new Repeat("sequence-literal", pattern, { divider, min: 2, trimDivider: true });