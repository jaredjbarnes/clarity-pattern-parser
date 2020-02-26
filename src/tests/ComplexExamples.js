import whitespace from "./javascriptPatterns/whitespace.js";
import name from "./javascriptPatterns/name.js";
import number from "./javascriptPatterns/number.js";
import Cursor from "../Cursor.js";
import filter from "./naturalLanguage/filter.js";
import assert from "assert";
import string from "./javascriptPatterns/string.js";

exports["Complex Examples: A Comment"] = () => {
  const cursor = new Cursor(`/*
          This is the comment!
      */`);

  const node = whitespace.parse(cursor);
};

exports["Complex Examples: name"] = () => {
  const validName = new Cursor("firstName1_2");
  const invalidName = new Cursor("1_firstName");
  const validNode = name.parse(validName);

  assert.equal(validNode.name, "name");
  assert.equal(validNode.value, "firstName1_2");

  name.parse(invalidName);
  assert.equal(invalidName.hasUnresolvedError(), true);
};

exports["Complex Examples: number"] = () => {
  const validNumber = new Cursor("1234");
  const invalidNumber = new Cursor("01234");
  const validFraction = new Cursor("0.1");
  const validExponent = new Cursor("1.23e+5");
  const singleNumber = new Cursor("1");

  const validNumberNode = number.parse(validNumber);
  const validFractionNode = number.parse(validFraction);
  const validExponentNode = number.parse(validExponent);
  const singleNumberNode = number.parse(singleNumber);

  assert.equal(validNumberNode.name, "number");
  assert.equal(validNumberNode.value, "1234");

  assert.equal(validFractionNode.name, "number");
  assert.equal(validFractionNode.value, "0.1");

  assert.equal(validExponentNode.name, "number");
  assert.equal(validExponentNode.value, "1.23e+5");
  assert.equal(validExponent.didSuccessfullyParse(), true);

  assert.equal(singleNumberNode.name, "number");
  assert.equal(singleNumberNode.value, "1");

  name.parse(invalidNumber);
  assert.equal(invalidNumber.hasUnresolvedError(), true);
};

exports["Complex Examples: string"] = () => {
  const testString = `"This is a string!."`;
  const validString = new Cursor(testString);
  const validStringNode = string.parse(validString);

  assert.equal(validStringNode.name, "string");
  assert.equal(validStringNode.value, testString);
};

exports["Complex Examples: Natural Language."] = () => {
  const validCursor = new Cursor(
    "Match records where firstName is 'John' and lastName is 'Barnes'."
  );
  const invalidCursor = new Cursor("Match records where firstName ");
  const node = filter.parse(validCursor);

  try {
    filter.parse(invalidCursor);
  } catch (error) {}
};

exports["Complex Examples: cssMethod"] = () => {
  const cursor = new Cursor(
    "linear-gradient(to left, #333, #333 50%, #eee 75%, #333 75%)"
  );
};
