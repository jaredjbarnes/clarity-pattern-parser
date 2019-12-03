import OrComposite from "../patterns/composite/OrComposite.js";
import Literal from "../patterns/value/Literal.js";
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
