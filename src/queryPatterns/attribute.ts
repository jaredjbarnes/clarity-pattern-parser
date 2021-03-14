import Literal from "../patterns/value/Literal";
import RegexValue from "../patterns/value/RegexValue";
import RepeatValue from "../patterns/value/RepeatValue";
import OptionalValue from "../patterns/value/OptionalValue";
import OrValue from "../patterns/value/OrValue";
import { AndComposite } from "../index";

const openSquareBracket = new Literal("open-square-bracket", "[");
const closeSquareBracket = new Literal("close-square-bracket", "]");
const equal = new Literal("equal", "=");
const spaces = new RegexValue("spaces", "\\s+");
const optionalSpaces = new OptionalValue(spaces);
const singleQuote = new Literal("single-quote", "'");
const twoSingleQuotes = new Literal("two-single-quotes", "''");
const allowedValueCharacters = new RegexValue(
  "allowed-value-characters",
  "[^']+"
);
const name = new RegexValue("name", "[^\\]\\[=]+");
const valueCharacter = new OrValue("character", [
  allowedValueCharacters,
  twoSingleQuotes
]);
const valueCharacters = new RepeatValue("characters", valueCharacter);

const value = new AndComposite("value", [
  singleQuote,
  valueCharacters,
  singleQuote
]);

const attribute = new AndComposite("attribute", [
  openSquareBracket,
  optionalSpaces,
  name,
  optionalSpaces,
  equal,
  optionalSpaces,
  value,
  optionalSpaces,
  closeSquareBracket
]);

export default attribute;
