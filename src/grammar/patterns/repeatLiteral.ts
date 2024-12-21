import { And } from "../../patterns/And";
import { Literal } from "../../patterns/Literal";
import { Or } from "../../patterns/Or";
import { Regex } from "../../patterns/Regex";
import { anonymousPattern } from "./anonymousPattern";
import { name } from "./name";
import { spaces } from "./spaces";

const optionalSpaces = spaces.clone("optional-spaces", true);
const openBracket = new Literal("open-bracket", "{");
const closeBracket = new Literal("close-bracket", "}");
const comma = new Literal("comma", ",");
const integer = new Regex("integer", "([1-9][0-9]*)|0");
integer.setTokens(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);

const optionalInteger = integer.clone("integer", true);
const trimFlag = new Literal("trim-flag", "t", true);
const optionalFlag = new And("optional-trim-flag", [
    optionalSpaces,
    comma,
    optionalSpaces,
    trimFlag,
], true);

const bounds = new And("bounds", [
    openBracket,
    optionalSpaces,
    optionalInteger.clone("min"),
    optionalSpaces,
    comma,
    optionalSpaces,
    optionalInteger.clone("max"),
    optionalFlag,
    optionalSpaces,
    closeBracket
]);

const justFlag = new And("bounds", [
    openBracket,
    trimFlag,
    closeBracket
]);

const exactCount = new And("exact-count", [
    openBracket,
    optionalSpaces,
    integer,
    optionalSpaces,
    closeBracket,
]);

const quantifierShorthand = new Regex("quantifier-shorthand", "\\*|\\+");
quantifierShorthand.setTokens(["*", "+"]);
const quantifier = new Or("quantifier", [
    quantifierShorthand,
    justFlag,
    exactCount,
    bounds
]);

const openParen = new Literal("repeat-open-paren", "(");
const closeParen = new Literal("repeat-close-paren", ")");
const dividerComma = new Regex("divider-comma", "\\s*,\\s*");
dividerComma.setTokens([", "]);


const patternName = name.clone("pattern-name");
const patterns = new Or("or-patterns", [patternName, anonymousPattern]);
const dividerPattern = patterns.clone("divider-pattern");

export const repeatLiteral = new And("repeat-literal", [
    openParen,
    optionalSpaces,
    patterns,
    new And("optional-divider-section", [dividerComma, dividerPattern], true),
    optionalSpaces,
    closeParen,
    new And("quantifier-section", [quantifier]),
]);