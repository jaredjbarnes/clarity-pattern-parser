import { And } from "../../patterns/And";
import { Literal } from "../../patterns/Literal";
import { Or } from "../../patterns/Or";
import { Regex } from "../../patterns/Regex";
import { name } from "./name";
import { spaces } from "./spaces";

const optionalSpaces = spaces.clone("optional-spaces", true);
const pattern = name.clone("pattern");
const optionalDividerPattern = pattern.clone("divider-pattern", true);

const openBracket = new Literal("open-bracket", "{");
const closeBracket = new Literal("close-bracket", "}");
const comma = new Literal("comma", ",");
const integer = new Regex("integer", "([1-9][0-9]*)|0");
const optionalInteger = integer.clone("integer", true)

const bounds = new And("bounds", [
    openBracket,
    optionalSpaces,
    optionalInteger,
    optionalSpaces,
    comma,
    optionalSpaces,
    optionalInteger,
    optionalSpaces,
    closeBracket
]);

const exactCount = new And("bounds", [
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

export const repeatLiteral = new And("repeat-literal", [
    pattern,
    optionalQuantifier,
    optionalSpaces,
    optionalDividerPattern,
]);