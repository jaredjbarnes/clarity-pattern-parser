import { Options } from "../../patterns/Options";
import { literal } from "./literal";
import { regexLiteral } from "./regexLiteral";
import { repeatLiteral } from "./repeatLiteral";
import { sequenceLiteral } from "./sequenceLiteral";
import { orLiteral } from "./orLiteral";
import { anonymousPattern } from "./anonymousPattern";
import { Sequence } from "../../patterns/Sequence";
import { Literal } from "../../patterns/Literal";
import { name } from "./name";

const aliasLiteral = name.clone("alias-literal");
aliasLiteral.setTokens(["[ALIAS_LITERAL]"]);

const optionalIsOptional = new Literal("is-optional", "?", true);
const configurableAnonymousPattern = new Sequence("configurable-anonymous-pattern", [anonymousPattern, optionalIsOptional]);

export const pattern = new Options("pattern", [
    literal,
    regexLiteral,
    repeatLiteral,
    aliasLiteral,
    orLiteral,
    sequenceLiteral,
    configurableAnonymousPattern,
], false, true);
