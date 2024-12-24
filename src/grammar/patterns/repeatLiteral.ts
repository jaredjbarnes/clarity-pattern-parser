import { Sequence } from "../../patterns/Sequence";
import { Literal } from "../../patterns/Literal";
import { Options } from "../../patterns/Options";
import { Regex } from "../../patterns/Regex";
import { anonymousPattern } from "./anonymousPattern";
import { name } from "./name";
import { lineSpaces, spaces } from "./spaces";

const optionalSpaces = spaces.clone("optional-spaces", true);
const openBracket = new Literal("open-bracket", "{");
const closeBracket = new Literal("close-bracket", "}");
const comma = new Literal("comma", ",");

const integer = new Regex("integer", "([1-9][0-9]*)|0");
integer.setTokens(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);

const optionalInteger = integer.clone("integer", true);
const trimKeyword = new Literal("trim-keyword", "trim", true);
const trimFlag = new Sequence("trim-flag", [lineSpaces, trimKeyword], true);

const bounds = new Sequence("bounds", [
    openBracket,
    optionalSpaces,
    optionalInteger.clone("min"),
    optionalSpaces,
    comma,
    optionalSpaces,
    optionalInteger.clone("max"),
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
const patterns = new Options("or-patterns", [patternName, anonymousPattern]);
const dividerPattern = patterns.clone("divider-pattern");

export const repeatLiteral = new Sequence("repeat-literal", [
    openParen,
    optionalSpaces,
    patterns,
    new Sequence("optional-divider-section", [dividerComma, dividerPattern, trimFlag], true),
    optionalSpaces,
    closeParen,
    new Sequence("quantifier-section", [quantifier]),
]);