import AndValue from "../patterns/value/AndValue.js";
import Literal from "../patterns/value/Literal.js";
import assert from "assert";
import Cursor from "../Cursor.js";

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
