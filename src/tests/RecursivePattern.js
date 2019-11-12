import RecursivePattern from "../patterns/RecursivePattern.js";
import assert from "assert";
import {
  Literal,
  AndComposite,
  RepeatValue,
  OptionalValue,
  RepeatComposite,
  OptionalComposite,
  OrComposite,
  Cursor,
  AndValue
} from "../index.js";
import string from "./javascriptPatterns/string";
import number from "./javascriptPatterns/number";
import boolean from "./javascriptPatterns/boolean";

exports["RecursivePattern: JSON"] = () => {
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
    optionalSpaces
  ]);

  const arrayValues = new RepeatComposite(
    "values",
    new RecursivePattern("value"),
    divider
  );
  const optionalArrayValues = new OptionalComposite(arrayValues);

  const array = new AndComposite("array-literal", [
    openSquareBracket,
    optionalSpaces,
    optionalArrayValues,
    optionalSpaces,
    closeSquareBracket
  ]);

  const value = new OrComposite("value", [
    number,
    string,
    boolean,
    nullLiteral,
    array,
    new RecursivePattern("object-literal")
  ]);

  const keyValue = new AndComposite("key-value", [
    string,
    optionalSpaces,
    colon,
    optionalSpaces,
    value
  ]);

  const keyValues = new RepeatComposite("key-values", keyValue, divider);
  const optionalKeyValues = new OptionalComposite(keyValues);

  const jsonPattern = new AndComposite("object-literal", [
    optionalSpaces,
    openCurlyBracket,
    optionalSpaces,
    optionalKeyValues,
    optionalSpaces,
    closeCurlyBracket,
    optionalSpaces
  ]);

  const json = JSON.stringify({
    string: "This is a string.",
    number: 1,
    boolean: true,
    json: {
      string: "This is a nested string."
    },
    null: null,
    array: [1, "Blah", { prop1: true }]
  });

  const cursor = new Cursor(json);
  try {
    const node = jsonPattern.parse(cursor);
    debugger;
  } catch (error) {
    debugger;
  }
};
