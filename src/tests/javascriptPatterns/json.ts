import { Literal, And, Repeat, Or, Recursive } from "../../index";

import string from "./string";
import number from "./number";
import boolean from "./boolean";

const openCurlyBracket = new Literal("open-curly-bracket", "{");
const closeCurlyBracket = new Literal("close-curly-bracket", "}");
const openSquareBracket = new Literal("open-square-bracket", "[");
const closeSquareBracket = new Literal("close-square-bracket", "]");
const colon = new Literal(":", ":");
const space = new Literal("space", " ");
const spaces = new Repeat("spaces", space);
const optionalSpaces = spaces.clone("optional-spaces", true);
const nullLiteral = new Literal("null", "null");
const comma = new Literal(",", ",");

const divider = new And("divider", [
  optionalSpaces,
  comma,
  optionalSpaces,
]);

const arrayValues = new Repeat(
  "values",
  new Recursive("literals"),
  divider
);
const optionalArrayValues = arrayValues.clone("optional-values", true);

const arrayLiteral = new And("array-literal", [
  openSquareBracket,
  optionalSpaces,
  optionalArrayValues,
  optionalSpaces,
  closeSquareBracket,
]);

const keyValue = new And("key-value", [
  string,
  optionalSpaces,
  colon,
  optionalSpaces,
  new Recursive("literals"),
]);

const keyValues = new Repeat("key-values", keyValue, divider);
const optionalKeyValues = keyValues.clone("optional-key-values", true);

const objectLiteral = new And("object-literal", [
  openCurlyBracket,
  optionalSpaces,
  optionalKeyValues,
  optionalSpaces,
  closeCurlyBracket,
]);

const json = new Or("literals", [
  number,
  string,
  boolean,
  nullLiteral,
  objectLiteral,
  arrayLiteral,
]);

export default json;
