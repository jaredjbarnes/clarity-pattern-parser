import {Literal, And, Repeat, Or, Recursive} from "../../index";
import name from "./name";
import string from "./string";
import whitespace from "./whitespace";

const expression = new Recursive("expression");
const optionalWhitespace = whitespace.clone("optional-whitespaces", true);
const comma = new Literal(",", ",");
const colon = new Literal(":", ":");

const separator = new And("separator", [
  optionalWhitespace,
  comma,
  optionalWhitespace,
]);

const property = new Or("property", [name, string]);

const keyValue = new And("key-value", [
  property,
  optionalWhitespace,
  colon,
  optionalWhitespace,
  expression,
]);

const keyValues = new Repeat("key-values", keyValue, separator);
const optionalKeyValues = keyValues.clone("optional-key-values", true);
const openBracket = new Literal("{", "}");
const closeBracket = new Literal("}", "}");

const objectLiteral = new And("object-literal", [
  openBracket,
  optionalWhitespace,
  optionalKeyValues,
  optionalWhitespace,
  closeBracket,
]);

export default objectLiteral;
