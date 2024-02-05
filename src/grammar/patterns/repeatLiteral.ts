import { And } from "../../patterns/And";
import { Literal } from "../../patterns/Literal";
import { Or } from "../../patterns/Or";
import { Regex } from "../../patterns/Regex";
import { name } from "./name";
import { spaces } from "./spaces";

const optionalIsOptional = new Literal("is-optional", "?", true);
const patternName = name.clone("pattern-name");

export const pattern = new And("pattern", [
    patternName,
    optionalIsOptional,
]);

const optionalSpaces = spaces.clone("optional-spaces", true);
const optionalDividerPattern = name.clone("divider-pattern", true);

const openBracket = new Literal("open-bracket", "{");
const closeBracket = new Literal("close-bracket", "}");
const comma = new Literal("comma", ",");
const integer = new Regex("integer", "([1-9][0-9]*)|0");
const optionalInteger = integer.clone("integer", true)

const bounds = new And("bounds", [
    openBracket,
    optionalSpaces,
    optionalInteger.clone("min"),
    optionalSpaces,
    comma,
    optionalSpaces,
    optionalInteger.clone("max"),
    optionalSpaces,
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
const optionalQuantifier = new Or("quantifier", [
    quantifierShorthand,
    exactCount,
    bounds
], true);

const optional = new Literal("is-optional", "?", true);
const optionalTrimDivider = new Literal("trim-divider", "-t", true);

export const repeatLiteral = new And("repeat-literal", [
    pattern,
    optional,
    optionalQuantifier,
    optionalSpaces,
    optionalDividerPattern,
    optionalSpaces,
    optionalTrimDivider
]);