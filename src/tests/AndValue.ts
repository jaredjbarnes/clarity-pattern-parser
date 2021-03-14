import AndValue from "../patterns/value/AndValue";
import Literal from "../patterns/value/Literal";
import OptionalValue from "../patterns/value/OptionalValue";
import Cursor from "../Cursor";
import assert from "assert";

exports["AndValue: Empty Constructor."] = () => {
  assert.throws(() => {
    new AndValue();
  });
};

exports["AndValue: No patterns"] = () => {
  assert.throws(() => {
    new AndValue("and-value");
  });
};

exports["AndValue: Empty patterns"] = () => {
  assert.throws(() => {
    new AndValue("and-value", []);
  });
};

exports["AndValue: Invalid patterns"] = () => {
  assert.throws(() => {
    new AndValue("and-value", [{}, []]);
  });
};

exports["AndValue: One Pattern"] = () => {
  assert.throws(() => {
    new AndValue("and-value", [new Literal("literal")]);
  });
};

exports["AndValue: Success"] = () => {
  const firstName = new Literal("first-name", "John");
  const lastName = new Literal("last-name", "Doe");
  const fullName = new AndValue("full-name", [firstName, lastName]);
  const cursor = new Cursor("JohnDoe");
  const node = fullName.parse(cursor);

  assert.equal(node.name, "full-name");
  assert.equal(node.value, "JohnDoe");
  assert.equal(node.startIndex, 0);
  assert.equal(node.endIndex, 6);
};

exports["AndValue: First Part Match with optional Second part."] = () => {
  const firstName = new Literal("first-name", "John");
  const lastName = new Literal("last-name", "Doe");
  const fullName = new AndValue("full-name", [
    firstName,
    new OptionalValue(lastName),
  ]);
  const cursor = new Cursor("John");
  const node = fullName.parse(cursor);

  assert.equal(node.name, "full-name");
  assert.equal(node.value, "John");
  assert.equal(node.startIndex, 0);
  assert.equal(node.endIndex, 3);
};

exports["AndValue: First Part Match, but run out for second part."] = () => {
  const firstName = new Literal("first-name", "John");
  const lastName = new Literal("last-name", "Doe");
  const fullName = new AndValue("full-name", [firstName, lastName]);
  const cursor = new Cursor("John");
  const node = fullName.parse(cursor);

  assert.equal(node, null);
};

exports["AndValue: No Match"] = () => {
  const firstName = new Literal("first-name", "John");
  const lastName = new Literal("last-name", "Doe");
  const fullName = new AndValue("full-name", [firstName, lastName]);
  const cursor = new Cursor("JaneDoe");
  const node = fullName.parse(cursor);

  assert.equal(node, null);
};

exports["AndValue: Partial Match without optional siblings."] = () => {
  const firstName = new Literal("first-name", "John");
  const lastName = new Literal("last-name", "Doe");
  const fullName = new AndValue("full-name", [firstName, lastName]);
  const cursor = new Cursor("JohnSmith");
  const node = fullName.parse(cursor);

  assert.equal(node, null);
};

exports["AndValue: Success with more to parse"] = () => {
  const firstName = new Literal("first-name", "John");
  const lastName = new Literal("last-name", "Doe");
  const fullName = new AndValue("full-name", [firstName, lastName]);
  const cursor = new Cursor("JohnDoe JaneDoe");
  const node = fullName.parse(cursor);

  assert.equal(node.name, "full-name");
  assert.equal(node.value, "JohnDoe");
  assert.equal(node.startIndex, 0);
  assert.equal(node.endIndex, 6);
};

exports["AndValue: Bad cursor."] = () => {
  const firstName = new Literal("first-name", "John");
  const lastName = new Literal("last-name", "Doe");
  const fullName = new AndValue("full-name", [firstName, lastName]);

  assert.throws(() => {
    fullName.parse();
  });
};

exports["AndValue: Clone."] = () => {
  const firstName = new Literal("first-name", "John");
  const lastName = new Literal("last-name", "Doe");
  const fullName = new AndValue("full-name", [firstName, lastName]);
  const clone = fullName.clone();

  const fullNamePatterns = fullName.children;
  const _cloneChildren = clone.children;

  assert.notEqual(fullNamePatterns[0], _cloneChildren[0]);
  assert.notEqual(fullNamePatterns[1], _cloneChildren[1]);
  assert.equal(fullName.name, clone.name);
};

exports["AndValue: Clone with custom name."] = () => {
  const firstName = new Literal("first-name", "John");
  const lastName = new Literal("last-name", "Doe");
  const fullName = new AndValue("full-name", [firstName, lastName]);
  const clone = fullName.clone("full-name-2");

  const fullNamePatterns = fullName.children;
  const _cloneChildren = clone.children;

  assert.notEqual(fullNamePatterns[0], _cloneChildren[0]);
  assert.notEqual(fullNamePatterns[1], _cloneChildren[1]);
  assert.equal(clone.name, "full-name-2");
};

exports["AndValue: getPossibilities."] = () => {
  const firstName = new Literal("first-name", "John");
  const lastName = new Literal("last-name", "Doe");
  const fullName = new AndValue("full-name", [firstName, lastName]);

  const possibilities = fullName.getPossibilities();

  assert.equal(possibilities.length, 1);
  assert.equal(possibilities[0], "JohnDoe");
};

exports[
  "AndValue: getPossibilities with itself being the root pattern."
] = () => {
  const firstName = new Literal("first-name", "John");
  const lastName = new Literal("last-name", "Doe");
  const fullName = new AndValue("full-name", [firstName, lastName]);

  const possibilities = fullName.getPossibilities(fullName);

  assert.equal(possibilities.length, 1);
  assert.equal(possibilities[0], "JohnDoe");
};

exports["AndValue: getPossibilities with a invalid root."] = () => {
  const firstName = new Literal("first-name", "John");
  const lastName = new Literal("last-name", "Doe");
  const fullName = new AndValue("full-name", [firstName, lastName]);

  const possibilities = fullName.getPossibilities("");

  assert.equal(possibilities.length, 1);
  assert.equal(possibilities[0], "JohnDoe");
};

exports["AndValue: Partial Match."] = () => {
  const firstName = new Literal("first-name", "John");
  const lastName = new Literal("last-name", "Doe");
  const fullName = new AndValue("full-name", [
    firstName,
    new OptionalValue(lastName),
  ]);
  const result = fullName.parse(new Cursor("JohnBo"));

  assert.equal(result.type, "and-value");
  assert.equal(result.name, "full-name");
  assert.equal(result.value, "John");
};

exports[
  "AndValue: Partial Match with string running out, and optional last name."
] = () => {
  const firstName = new Literal("first-name", "John");
  const lastName = new Literal("last-name", "Doe");
  const fullName = new AndValue("full-name", [
    firstName,
    new OptionalValue(lastName),
  ]);
  const result = fullName.parse(new Cursor("JohnDo"));

  assert.equal(result.type, "and-value");
  assert.equal(result.name, "full-name");
  assert.equal(result.value, "John");
};

exports["AndValue: Three parts first optional."] = () => {
  const firstName = new Literal("first-name", "John");
  const middle = new Literal("middle", "Smith");
  const lastName = new Literal("last-name", "Doe");

  const fullName = new AndValue("full-name", [
    new OptionalValue(firstName),
    middle,
    lastName,
  ]);
  const result = fullName.parse(new Cursor("SmithDoe"));

  assert.equal(result.value, "SmithDoe");
  assert.equal(result.type, "and-value");
  assert.equal(result.name, "full-name");
};

exports["AndValue: Three parts middle optional."] = () => {
  const firstName = new Literal("first-name", "John");
  const middle = new Literal("middle", "Smith");
  const lastName = new Literal("last-name", "Doe");

  const fullName = new AndValue("full-name", [
    firstName,
    new OptionalValue(middle),
    lastName,
  ]);
  const result = fullName.parse(new Cursor("JohnDo"));

  assert.equal(result, null);
};

exports["AndValue: Three parts third optional."] = () => {
  const firstName = new Literal("first-name", "John");
  const middle = new Literal("middle", "Smith");
  const lastName = new Literal("last-name", "Doe");

  const fullName = new AndValue("full-name", [
    firstName,
    middle,
    new OptionalValue(lastName),
  ]);
  const result = fullName.parse(new Cursor("JohnSmith"));

  assert.equal(result.value, "JohnSmith");
  assert.equal(result.type, "and-value");
  assert.equal(result.name, "full-name");
};
