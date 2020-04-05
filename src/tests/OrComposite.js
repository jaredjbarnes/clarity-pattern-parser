import OrComposite from "../patterns/composite/OrComposite.js";
import Literal from "../patterns/value/Literal.js";
import OptionalValue from "../patterns/value/OptionalValue.js";
import assert from "assert";
import { Cursor } from "../index.js";

exports["OrComposite: Match."] = () => {
  const john = new Literal("john", "John");
  const jane = new Literal("jane", "Jane");
  const cursor = new Cursor("John");
  const name = new OrComposite("name", [john, jane]);

  const node = name.parse(cursor);

  assert.equal(node.name, "john");
  assert.equal(node.value, "John");
};

exports["OrComposite: No Match"] = () => {
  const john = new Literal("john", "John");
  const jane = new Literal("jane", "Jane");
  const cursor = new Cursor("Jeffrey");
  const name = new OrComposite("name", [john, jane]);

  const node = name.parse(cursor);

  assert.equal(node, null);
  assert.equal(cursor.getIndex(), 0);
  assert.equal(cursor.hasUnresolvedError(), true);
};

exports["OrComposite: Supplied only one option."] = () => {
  const john = new Literal("john", "John");

  assert.throws(() => {
    new OrComposite("name", [john]);
  });
};

exports["OrComposite: Optional Children."] = () => {
  const john = new Literal("john", "John");
  const jane = new Literal("jane", "Jane");

  assert.throws(() => {
    new OrComposite("name", [new OptionalValue(john), new OptionalValue(jane)]);
  });
};

exports["OrComposite: getPossibilities."] = () => {
  const john = new Literal("john", "John");
  const jane = new Literal("jane", "Jane");
  const name = new OrComposite("name", [john, jane]);

  const possibilities = name.getPossibilities();

  assert.equal(possibilities.length, 2);
  assert.equal(possibilities[0], "John");
  assert.equal(possibilities[1], "Jane");
};

exports["OrComposite: parse with null cursor."] = () => {
  const john = new Literal("john", "John");
  const jane = new Literal("jane", "Jane");
  const cursor = new Cursor("John");
  const name = new OrComposite("name", [john, jane]);

  const node = name.parse(cursor);

  assert.equal(node.name, "john");
  assert.equal(node.value, "John");
};

exports["OrComposite: clone."] = () => {
  const john = new Literal("john", "John");
  const jane = new Literal("jane", "Jane");

  const name = new OrComposite("name", [john, jane]);
  const clone = name.clone("name2");

  assert.equal(clone.name, "name2");
  assert.equal(clone.children.length, 2);
  assert.equal(clone.children[0].name, "john");
  assert.equal(clone.children[1].name, "jane");
};