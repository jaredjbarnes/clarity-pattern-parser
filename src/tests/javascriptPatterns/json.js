import RecursivePattern from "../../patterns/RecursivePattern.js";
import {
  Literal,
  AndComposite,
  RepeatValue,
  OptionalValue,
  RepeatComposite,
  OptionalComposite,
  OrComposite,
  AndValue,
} from "../../index.js";

import string from "./string.js";
import number from "./number.js";
import boolean from "./boolean.js";

const openCurlyBracket = new Literal("open-curly-bracket", "{");
const closeCurlyBracket = new Literal("close-curly-bracket", "}");
const openSquareBracket = new Literal("open-square-bracket", "[");
const closeSquareBracket = new Literal("close-square-bracket", "]");
const colon = new Literal(":", ":");
const space = new Literal("space", " ");
const spaces = new RepeatValue("spaces", space);
const optionalSpaces = new OptionalValue(spaces);
const nullLiteral = new Literal("null", "null");
const comma = new Literal(",", ",");

const divider = new AndValue("divider", [
  optionalSpaces,
  comma,
  optionalSpaces,
]);

const arrayValues = new RepeatComposite(
  "values",
  new RecursivePattern("literals"),
  divider
);
const optionalArrayValues = new OptionalComposite(arrayValues);

const arrayLiteral = new AndComposite("array-literal", [
  openSquareBracket,
  optionalSpaces,
  optionalArrayValues,
  optionalSpaces,
  closeSquareBracket,
]);

const keyValue = new AndComposite("key-value", [
  string,
  optionalSpaces,
  colon,
  optionalSpaces,
  new RecursivePattern("literals"),
]);

const keyValues = new RepeatComposite("key-values", keyValue, divider);
const optionalKeyValues = new OptionalComposite(keyValues);

const objectLiteral = new AndComposite("object-literal", [
  openCurlyBracket,
  optionalSpaces,
  optionalKeyValues,
  optionalSpaces,
  closeCurlyBracket,
]);

const json = new OrComposite("literals", [
  number,
  string,
  boolean,
  nullLiteral,
  objectLiteral,
  arrayLiteral,
]);

export default json;
