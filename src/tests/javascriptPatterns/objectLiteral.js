import { Literal } from "../../patterns/value/Literal.js";
import AndComposite from "../../patterns/composite/AndComposite.js";
import RepeatComposite from "../../patterns/composite/RepeatComposite.js";
import OptionalComposite from "../../patterns/composite/OptionalComposite.js";
import OrValue from "../../patterns/value/OrValue.js";
import OptionalValue from "../../patterns/value/OptionalValue.js";
import { RecursivePattern } from "../../patterns/RecursivePattern.js";
import name from "./name.js";
import string from "./string.js";
import whitespace from "./whitespace.js";

const expression = new RecursivePattern("expression");
const optionalWhitespace = new OptionalValue(whitespace);
const comma = new Literal(",", ",");
const colon = new Literal(":", ":");

const separator = new AndValue("separator", [
  optionalWhitespace,
  comma,
  optionalWhitespace
]);

const property = new OrValue("property", [name, string]);

const keyValue = new AndComposite("key-value", [
  property,
  optionalWhitespace,
  colon,
  optionalWhitespace,
  expression
]);

const keyValues = new RepeatComposite("key-values", keyValue, separator);
const optionalKeyValues = new OptionalComposite(keyValues);
const openBracket = new Literal("{", "}");
const closeBracket = new Literal("}", "}");

const objectLiteral = new AndComposite("object-literal", [
  openBracket,
  optionalWhitespace,
  optionalKeyValues,
  optionalWhitespace,
  closeBracket
]);

export default objectLiteral;
