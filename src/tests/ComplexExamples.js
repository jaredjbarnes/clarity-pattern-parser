import whitespace from "./javascriptPatterns/whitespace.js";
import name from "./javascriptPatterns/name.js";
import number from "./javascriptPatterns/number.js";
import Cursor from "../Cursor.js";
import filter from "./naturalLanguage/filter.js";
import assert from "assert";

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

  assert.equal(validNode.type, "name");
  assert.equal(validNode.value, "firstName1_2");

  assert.throws(() => {
    name.parse(invalidName);
  });
};

exports["Complex Examples: number"] = () => {
  const validNumber = new Cursor("1234");
  const invalidNumber = new Cursor("01234");
  const validFraction = new Cursor("0.1");
  const validExponent = new Cursor("1.23e+5");

  const validNumberNode = number.parse(validNumber);
  const validFractionNode = number.parse(validFraction);
  const validExponentNode = number.parse(validExponent);

  assert.equal(validNumberNode.type, "number");
  assert.equal(validNumberNode.value, "1234");

  assert.equal(validFractionNode.type, "number");
  assert.equal(validFractionNode.value, "0.1");

  assert.equal(validExponentNode.type, "number");
  assert.equal(validExponentNode.value, "1.23e+5");

  assert.throws(() => {
    name.parse(invalidNumber);
  });
};

exports["Complex Examples: Natural Language."] = () => {
    const validCursor = new Cursor("Match records where firstName is 'John' and lastName is 'Barnes'.");
    const invalidCursor = new Cursor("Match records where firstName");
    const node = filter.parse(validCursor);

    try{
        filter.parse(invalidCursor);
    } catch(error){
        debugger;
    }
};
