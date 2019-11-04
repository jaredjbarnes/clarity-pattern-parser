import Literal from "../patterns/Literal.js";
import Cursor from "../Cursor.js";
import And from "../patterns/And.js";
import assert from "assert";

exports["And: And twice"] = () => {
  const cursor = new Cursor("JohnDoe");
  const firstName = new Literal("first-name", "John");
  const lastName = new Literal("last-name", "Doe");
  const fullName = new And("full-name", [firstName, lastName]);
  const node = fullName.parse(cursor);

  assert.equal(node.type, "full-name");
  assert.equal(node.children[0].type, "first-name");
  assert.equal(node.children[0].value, "John");
  assert.equal(node.children[1].type, "last-name");

  assert.equal(node.children[1].value, "Doe");
  assert.equal(cursor.isAtEnd(), true);
  assert.equal(node.startIndex, 0);
  assert.equal(cursor.lastIndex(), node.endIndex);
};

exports["And: Twice as Value"] = () => {
  const cursor = new Cursor("JohnDoe");
  const firstName = new Literal("first-name", "John");
  const lastName = new Literal("last-name", "Doe");
  const fullName = new And("full-name", [firstName, lastName], {
    isValue: true
  });
  const node = fullName.parse(cursor);

  assert.equal(node.type, "full-name");
  assert.equal(node.value, "JohnDoe");
  assert.equal(cursor.lastIndex(), node.endIndex);
};
