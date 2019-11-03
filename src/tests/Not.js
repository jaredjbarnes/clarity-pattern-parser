import Not from "../patterns/Not.js";
import Literal from "../patterns/Literal.js";
import Cursor from "../Cursor.js";
import assert from "assert";

exports["Parse twice with same parser."] = () => {
  const cursor = new Cursor("1");
  const not = new Not("not-two", new Literal("two", "2"));
  const node = not.parse(cursor);

  cursor.moveToBeginning();

  const node2 = not.parse(cursor);

  assert.equal(node.value, "1");
  assert.equal(node.type, "not-two");
  assert.equal(node2.value, "1");
  assert.equal(node2.type, "not-two");
};

exports["One character, Exact."] = () => {
  const cursor = new Cursor("1");
  const not = new Not("not-two", new Literal("two", "2"));
  const node = not.parse(cursor);

  assert.equal(node.value, "1");
  assert.equal(node.type, "not-two");
};

exports["Two characters, Exact."] = () => {
  const cursor = new Cursor("10");
  const not = new Not("not-twenty", new Literal("twenty", "20"));
  const node = not.parse(cursor);

  assert.equal(node.value, "10");
  assert.equal(node.type, "not-twenty");
};

exports["One character, Within."] = () => {
  const cursor = new Cursor("12");
  const not = new Not("not-two", new Literal("two", "2"));
  const node = not.parse(cursor);

  assert.equal(node.value, "1");
  assert.equal(node.type, "not-two");
  assert.equal(cursor.getChar(), "2");
};

exports["Two characters, Within."] = () => {
  const cursor = new Cursor("1020");
  const not = new Not("not-twenty", new Literal("twenty", "20"));
  const node = not.parse(cursor);

  assert.equal(node.value, "10");
  assert.equal(node.type, "not-twenty");
  assert.equal(cursor.getChar(), "2");
};
