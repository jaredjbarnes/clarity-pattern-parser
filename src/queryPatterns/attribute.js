import Literal from "../patterns/value/Literal.js";
import RegexValue from "../patterns/value/RegexValue.js";
import RepeatValue  from "../patterns/value/RepeatValue.js";
import OptionalValue from "../patterns/value/OptionalValue.js";
import NotValue from "../patterns/value/NotValue.js";
import OrValue  from "../patterns/value/OrValue.js";
import { AndComposite } from "../index.js";

const openSquareBracket = new Literal("open-square-bracket", "[");
const closeSquareBracket = new Literal("close-square-bracket", "]");
const equal = new Literal("equal", "=");
const space = new Literal("space", " ");
const spaces = new RepeatValue("spaces", space);
const optionalSpaces = new OptionalValue(spaces);
const singleQuote = new Literal("single-quote", "'");
const twoSingleQuotes = new Literal("two-single-quotes", "''");
const allowedValueCharacters = new RegexValue("allowed-value-characters", "[^']+");
const allowedNameCharacters = new RegexValue("characters", "[^\\]]+");
const valueCharacter = new OrValue("character", [allowedValueCharacters, twoSingleQuotes]);
const valueCharacters = new RepeatValue("characters", valueCharacter);

const name = new AndComposite("name", [openSquareBracket, allowedNameCharacters, closeSquareBracket]);
const value = new AndComposite("value", [singleQuote, valueCharacters, singleQuote]);

const attribute = new AndComposite("attribute", [name, optionalSpaces, equal, optionalSpaces, value]);

export default attribute;

