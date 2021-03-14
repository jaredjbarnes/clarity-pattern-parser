import AndComposite from "../patterns/composite/AndComposite";
import Literal from "../patterns/value/Literal";
import OptionalValue from "../patterns/value/OptionalValue";
import assert from "assert";
import { Cursor } from "../index";

exports["AndComposite: Match."] = () => {
  const john = new Literal("john", "John");
  const doe = new Literal("doe", "Doe");
  const cursor = new Cursor("JohnDoe");
  const name = new AndComposite("name", [john, doe]);

  const node = name.parse(cursor);

  assert.equal(node.name, "name");
  assert.equal(node.children[0].name, "john");
  assert.equal(node.children[1].name, "doe");
  assert.equal(node.children[0].value, "John");
  assert.equal(node.children[1].value, "Doe");
};

exports["AndComposite: No Match"] = () => {
  const john = new Literal("john", "John");
  const doe = new Literal("doe", "Doe");
  const cursor = new Cursor("JohnSmith");
  const name = new AndComposite("name", [john, doe]);

  const node = name.parse(cursor);

  assert.equal(node, null);
  assert.equal(cursor.getIndex(), 0);
  assert.equal(cursor.hasUnresolvedError(), true);
  assert.equal(
    cursor.parseError.message,
    "ParseError: Expected 'Doe' but found 'Smi'."
  );
};

exports["AndComposite: test."] = () => {
  const john = new Literal("john", "John");
  const doe = new Literal("doe", "Doe");
  const name = new AndComposite("name", [john, doe]);
  const isMatch = name.test("JohnDoe");

  assert.equal(isMatch, true);
};

exports["AndComposite: no children."] = () => {
  assert.throws(() => {
    new AndComposite("name");
  });
};

exports["AndComposite: string runs out before match is done."] = () => {
  const first = new Literal("first", "John");
  const last = new Literal("last", "Doe");
  const name = new AndComposite("name", [first, last]);
  const cursor = new Cursor("JohnDo");
  const result = name.parse(cursor);

};

exports["AndComposite: last name is optional."] = () => {
  const first = new Literal("first", "John");
  const last = new OptionalValue(new Literal("last", "Boe"));
  const name = new AndComposite("name", [first, last]);
  const cursor = new Cursor("JohnDo");
  const result = name.parse(cursor);

  assert.equal(result.name, "name");
  assert.equal(result.type, "and-composite");
  assert.equal(result.children[0].value, "John");
  assert.equal(result.children[0].name, "first");
  assert.equal(result.children[0].type, "literal");
};

exports["AndComposite: three non-optional patterns."] = () => {
  const first = new Literal("first", "John");
  const middle = new Literal("middle", "Smith");
  const last = new Literal("last", "Doe");
  const name = new AndComposite("name", [first, middle, last]);
  const cursor = new Cursor("JohnDoe");
  const result = name.parse(cursor);
};

exports[
  "AndComposite: full name, middle optional, and last name isn't."
] = () => {
  const first = new Literal("first", "John");
  const middle = new OptionalValue(new Literal("middle", "Smith"));
  const last = new Literal("last", "Doe");
  const name = new AndComposite("name", [first, middle, last]);
  const cursor = new Cursor("JohnDoe");
  const result = name.parse(cursor);
};

exports["AndComposite: clone."] = () => {
  const john = new Literal("john", "John");
  const doe = new Literal("doe", "Doe");
  const name = new AndComposite("name", [john, doe]);
  const clone = name.clone("name2");

  assert.equal(clone.name, "name2");
};
