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
  AndValue,
} from "../index.js";
import string from "./javascriptPatterns/string.js";
import number from "./javascriptPatterns/number.js";
import boolean from "./javascriptPatterns/boolean.js";

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

const literals = new OrComposite("literals", [
  number,
  string,
  boolean,
  nullLiteral,
  objectLiteral,
  arrayLiteral,
]);

exports["RecursivePattern: JSON"] = () => {
  const json = JSON.stringify({
    string: "This is a string.",
    number: 1,
    boolean: true,
    json: {
      string: "This is a nested string.",
    },
    null: null,
    array: [1, "Blah", { prop1: true }],
  });

  const cursor = new Cursor(json);
  const cursor2 = new Cursor(JSON.stringify([{ foo: "bar" }]));

  const object = literals.parse(cursor);
  const array = literals.parse(cursor2);

  assert.equal(object.name, "object-literal");
  assert.equal(array.name, "array-literal");
  assert.equal(object.toString(), json);
};

exports["RecursivePattern: No pattern"] = () => {
  const node = new RecursivePattern("nothing");
  const result = node.exec("Some string.");

  assert.equal(result, null);
};

exports["RecursivePattern: clone."] = () => {
  const node = new RecursivePattern("nothing");
  const clone = node.clone();

  assert.equal(node.name, clone.name);

  const otherClone = node.clone("nothing2");

  assert.equal(otherClone.name, "nothing2");
};

exports["RecursivePattern: getNextTokens."] = () => {
  let tokens = literals.getTokens();

  tokens = literals.children[0].getNextTokens();

  tokens = literals.children[4].getTokens();
  tokens = literals.children[4].children[1].getNextTokens();
  tokens = literals.children[4].children[2].getNextTokens();

  tokens = literals.children[4].children[2].children[0].children[0].children[0].children[0].getTokens();
  tokens = literals.children[4].children[2].children[0].children[0].getNextTokens();

  tokens = literals.children[4].children[3].getNextTokens();
};


exports["RecursivePattern: getPossibilities."] = () => {
  const possibilities = literals.getPossibilities();
  
};
