import { Literal } from "../../patterns/value/Literal";
import AndComposite from "../../patterns/composite/AndComposite";
import RepeatComposite from "../../patterns/composite/RepeatComposite";
import OptionalComposite from "../../patterns/composite/OptionalComposite";
import OrValue from "../../patterns/value/OrValue";
import OptionalValue from "../../patterns/value/OptionalValue";
import { RecursivePattern } from "../../patterns/RecursivePattern";
import name from "./name";
import string from "./string";
import whitespace from "./whitespace";

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
