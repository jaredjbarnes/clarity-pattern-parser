import AndComposite from "../patterns/composite/AndComposite.js";
import Literal from "../patterns/value/Literal.js";
import assert from "assert";
import { Cursor } from "../index.js";

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
    assert.equal(cursor.parseError.message, "ParseError: Expected 'Doe' but found 'Smi'.");
  };
