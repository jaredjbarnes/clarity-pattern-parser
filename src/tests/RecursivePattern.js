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
  const openBracket = new Literal("{", "{");
  const closeBracket = new Literal("}", "}");
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

  const value = new OrComposite("value", [
    number,
    string,
    boolean,
    nullLiteral,
    new RecursivePattern("json")
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

  const jsonPattern = new AndComposite("json", [
    openBracket,
    optionalSpaces,
    optionalKeyValues,
    optionalSpaces,
    closeBracket
  ]);

  const json = JSON.stringify({
    string: "This is a string.",
    number: 1,
    boolean: true,
    null: null,
    json: {
      string: "This is a nested string."
    }
  });

  const cursor = new Cursor(json);
  const node = jsonPattern.parse(cursor);
};
