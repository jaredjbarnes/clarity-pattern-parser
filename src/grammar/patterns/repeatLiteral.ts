import { Sequence } from "../../patterns/Sequence";
import { Literal } from "../../patterns/Literal";
import { Options } from "../../patterns/Options";
import { Regex } from "../../patterns/Regex";
import { anonymousPattern } from "./anonymousPattern";
import { name } from "./name";
import { lineSpaces, spaces } from "./spaces";
import { Optional } from "../../patterns/Optional";

const optionalSpaces = new Optional("optional-spaces", spaces);
const openBracket = new Literal("open-bracket", "{");
const closeBracket = new Literal("close-bracket", "}");
const comma = new Literal("comma", ",");

const integer = new Regex("integer", "([1-9][0-9]*)|0");
integer.setTokens(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);

const min = new Optional("optional-min", integer.clone("min"));
const max = new Optional("optional-max", integer.clone("max"));
const trimKeyword = new Literal("trim-keyword", "trim");
const trimFlag = new Optional("optional-trim-flag", new Sequence("trim-flag", [lineSpaces, trimKeyword]));

const bounds = new Sequence("bounds", [
    openBracket,
    optionalSpaces,
    min,
    optionalSpaces,
    comma,
    optionalSpaces,
    max,
    closeBracket
]);

const exactCount = new Sequence("exact-count", [
    openBracket,
    optionalSpaces,
    integer,
    optionalSpaces,
    closeBracket,
]);

const quantifierShorthand = new Regex("quantifier-shorthand", "\\*|\\+");
quantifierShorthand.setTokens(["*", "+"]);

const quantifier = new Options("quantifier", [
    quantifierShorthand,
    exactCount,
    bounds
]);

const openParen = new Literal("repeat-open-paren", "(");
const closeParen = new Literal("repeat-close-paren", ")");
const dividerComma = new Regex("divider-comma", "\\s*,\\s*");
dividerComma.setTokens([", "]);


const patternName = name.clone("pattern-name");
const patterns = new Options("options-patterns", [patternName, anonymousPattern]);
const dividerPattern = patterns.clone("divider-pattern");
const dividerSection = new Sequence("divider-section", [dividerComma, dividerPattern, trimFlag]);
const optionalDividerSection = new Optional("optional-divider-section", dividerSection);

export const repeatLiteral = new Sequence("repeat-literal", [
    openParen,
    optionalSpaces,
    patterns,
    optionalDividerSection,
    optionalSpaces,
    closeParen,
    new Sequence("quantifier-section", [quantifier]),
]);