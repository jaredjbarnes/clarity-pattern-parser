import { Options } from "../../patterns/Options";
import { literal } from "./literal";
import { regexLiteral } from "./regexLiteral";
import { repeatLiteral } from "./repeatLiteral";
import { sequenceLiteral } from "./sequenceLiteral";
import { optionsLiteral } from "./optionsLiteral";
import { anonymousPattern } from "./anonymousPattern";
import { takeUntilLiteral } from "./takeUtilLiteral";
import { Sequence } from "../../patterns/Sequence";
import { Literal } from "../../patterns/Literal";
import { name } from "./name";
import { Optional } from "../../patterns/Optional";

const aliasLiteral = name.clone("alias-literal");
aliasLiteral.setTokens(["[ALIAS_LITERAL]"]);

const optionalIsOptional = new Optional("optional-flag", new Literal("is-optional", "?"));
const configurableAnonymousPattern = new Sequence("configurable-anonymous-pattern", [anonymousPattern, optionalIsOptional]);

export const pattern = new Options("pattern", [
    literal,
    regexLiteral,
    repeatLiteral,
    takeUntilLiteral,
    aliasLiteral,
    optionsLiteral,
    sequenceLiteral,
    configurableAnonymousPattern,
], true);
