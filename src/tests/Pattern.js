import Pattern from "../patterns/Pattern.js";
import AndValue from "../patterns/value/AndValue.js";
import OrValue from "../patterns/value/OrValue.js";
import Literal from "../patterns/value/Literal.js";
import assert from "assert";
import RepeatValue from "../patterns/value/RepeatValue.js";

exports["Pattern: parse."] = () => {
  const valuePattern = new Pattern("pattern-type", "pattern");
  assert.throws(() => {
    valuePattern.parse();
  });
};

exports["Pattern: clone."] = () => {
  const valuePattern = new Pattern("pattern-type", "pattern");
  assert.throws(() => {
    valuePattern.clone();
  });
};

exports["Pattern: getPossibilities."] = () => {
  const valuePattern = new Pattern("pattern-type", "pattern");
  assert.throws(() => {
    valuePattern.getPossibilities();
  });
};

exports["Pattern: limited arguments."] = () => {
  new Pattern(undefined, "name");
};

exports["Pattern: no arguments."] = () => {
  assert.throws(() => {
    new Pattern();
  });
};

exports["Pattern: set parent."] = () => {
  const parent = new Pattern("pattern-type", "pattern");
  const child = new Pattern("pattern-type", "pattern");

  child.parent = parent;
};

exports["Pattern: set invalid parent."] = () => {
  const child = new Pattern("pattern-type", "pattern");
  child.parent = "";

  assert.equal(child.parent, null);
};

exports["Pattern: getTokens"] = () => {
  const firstName = new Literal("first-name", "John");
  const lastName = new Literal("last-name", "Doe");
  const fullName = new AndValue("full-name", [firstName, lastName]);

  let tokens = firstName.getTokens();
  assert.equal(tokens.length, 1);
  assert.equal(tokens[0], "John");

  tokens = lastName.getTokens();
  assert.equal(tokens.length, 1);
  assert.equal(tokens[0], "Doe");

  tokens = fullName.getTokens();
  assert.equal(tokens.length, 1);
  assert.equal(tokens[0], "John");
};

exports["Pattern: getNextToken one deep."] = () => {
  const firstName = new Literal("first-name", "John");
  const lastName = new Literal("last-name", "Doe");
  const fullName = new AndValue("full-name", [firstName, lastName]);

  const tokens = fullName.children[0].getNextTokens();
  assert.equal(tokens.length, 1);
  assert.equal(tokens[0], "Doe");
};

exports["Pattern: getNextToken two deep."] = () => {
  const firstName = new Literal("first-name", "John");
  const lastName = new Literal("last-name", "Doe");
  const otherLastName = new Literal("other-last-name", "Smith");
  const lastNames = new OrValue("last-names", [lastName, otherLastName]);
  const fullName = new AndValue("full-name", [firstName, lastNames]);

  const tokens = fullName.children[0].getNextTokens();
  assert.equal(tokens.length, 2);
  assert.equal(tokens[0], "Doe");
  assert.equal(tokens[1], "Smith");
};

exports["Pattern: getNextToken three deep."] = () => {
  const firstName = new Literal("first-name", "John");
  const lastName = new Literal("last-name", "Doe");
  const middleName = new Literal("middle-name", "Moses");
  const otherMiddleName = new Literal("other-middle-name", "Joshua");
  const middleNames = new OrValue("middle-names", [
    middleName,
    otherMiddleName,
  ]);
  const otherLastName = new Literal("other-last-name", "Smith");
  const lastNames = new OrValue("last-names", [lastName, otherLastName]);
  const fullName = new AndValue("full-name", [
    firstName,
    middleNames,
    lastNames,
  ]);

  const tokens = fullName.children[1].children[1].getNextTokens();
  assert.equal(tokens.length, 2);
  assert.equal(tokens[0], "Doe");
  assert.equal(tokens[1], "Smith");
};

exports["Pattern: getNextToken end of patterns."] = () => {
  const firstName = new Literal("first-name", "John");
  const lastName = new Literal("last-name", "Doe");
  const middleName = new Literal("middle-name", "Moses");
  const otherMiddleName = new Literal("other-middle-name", "Joshua");
  const middleNames = new OrValue("middle-names", [
    middleName,
    otherMiddleName,
  ]);
  const otherLastName = new Literal("other-last-name", "Smith");
  const lastNames = new OrValue("last-names", [lastName, otherLastName]);
  const fullName = new AndValue("full-name", [
    firstName,
    middleNames,
    lastNames,
  ]);

  const tokens = fullName.children[2].children[1].getNextTokens();
  assert.equal(tokens.length, 0);
};

exports["Pattern: getNextToken end of patterns."] = () => {
  const firstName = new Literal("first-name", "John");
  const lastName = new Literal("last-name", "Doe");
  const moses = new Literal("moses", "Moses");
  const joshua = new Literal("other-middle-name", "Joshua");
  const moreLastNames = new OrValue("more-last-names", [
    moses,
    joshua,
  ]);
  const otherLastName = new Literal("other-last-name", "Smith");
  const lastNames = new OrValue("last-names", [moreLastNames, lastName, otherLastName]);
  const fullName = new AndValue("full-name", [
    firstName,
    lastNames,
  ]);

  const tokens = fullName.children[0].getNextTokens();
  assert.equal(tokens.length, 4);
  assert.equal(tokens[0], "Moses");
  assert.equal(tokens[1], "Joshua");
  assert.equal(tokens[2], "Doe");
  assert.equal(tokens[3], "Smith");

};

exports["Pattern: with repeat."] = () => {
  const firstName = new Literal("first-name", "John");
  const edward = new Literal("edward", "Edward");
  const middleName = new RepeatValue("middle-names", edward);
  const lastName = new Literal("lastName", "Doe");
  const fullName = new AndValue("full-name", [firstName, middleName, lastName]);
  
  let tokens = fullName.children[0].getNextTokens();
  assert.equal(tokens.length, 1);
  assert.equal(tokens[0], "Edward");

  tokens = fullName.children[1].children[0].getNextTokens();
  assert.equal(tokens.length, 2);
  assert.equal(tokens[0], "Edward");
  assert.equal(tokens[1], "Doe");
};

exports["Pattern: with repeat and divider."] = () => {
  const firstName = new Literal("first-name", "John");
  const edward = new Literal("edward", "Edward");
  const stewart = new Literal("stewart", "Stewart");
  const middleName = new RepeatValue("middle-names", edward, stewart);
  const lastName = new Literal("lastName", "Doe");
  const fullName = new AndValue("full-name", [firstName, middleName, lastName]);
  
  let tokens = fullName.children[0].getNextTokens();
  assert.equal(tokens.length, 1);
  assert.equal(tokens[0], "Edward");

  tokens = fullName.children[1].children[0].getNextTokens();
  assert.equal(tokens.length, 2);
  assert.equal(tokens[0], "Stewart");
  assert.equal(tokens[1], "Doe");

  tokens = fullName.children[1].children[1].getNextTokens();
  assert.equal(tokens.length, 2);
  assert.equal(tokens[0], "Edward");
  assert.equal(tokens[1], "Doe");
};

exports["Pattern: Has child and at the beginning."] = () => {
  const firstName = new Literal("first-name", "John");
  const edward = new Literal("edward", "Edward");
  const stewart = new Literal("stewart", "Stewart");
  const middleName = new RepeatValue("middle-names", edward, stewart);
  const lastName = new Literal("lastName", "Doe");
  const fullName = new AndValue("full-name", [firstName, middleName, lastName]);
  
  let tokens = fullName.getNextTokens();
  assert.equal(tokens.length, 1);
  assert.equal(tokens[0], "John");
};

exports["Pattern: Has no child and is at the beginning."] = () => {
  const firstName = new Literal("first-name", "John");
  
  let tokens = firstName.getNextTokens();
  assert.equal(tokens.length, 1);
  assert.equal(tokens[0], "John");
};

