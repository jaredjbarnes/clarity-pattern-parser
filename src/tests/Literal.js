import Literal from "../patterns/Literal.js";
import Cursor from "../Cursor.js";
import assert from "assert";

exports["Literal: One character, Exact."] = () => {
  const cursor = new Cursor("2");
  const literal = new Literal("two", "2");
  const node = literal.parse(cursor);

  assert.equal(node.value, "2");
  assert.equal(node.type, "two");
  assert.equal(node.startIndex, 0);
  assert.equal(node.endIndex, 0);
  assert.equal(cursor.lastIndex(), 0);
};

exports["Literal: Two characters, Exact."] = () => {
  const cursor = new Cursor("20");
  const literal = new Literal("twenty", "20");
  const node = literal.parse(cursor);

  assert.equal(node.value, "20");
  assert.equal(node.type, "twenty");
  assert.equal(node.startIndex, 0);
  assert.equal(node.endIndex, 1);
  assert.equal(cursor.lastIndex(), 1);
};

exports["Literal: One character, Within."] = () => {
  const cursor = new Cursor("200");
  const literal = new Literal("two", "2");
  const node = literal.parse(cursor);

  assert.equal(node.value, "2");
  assert.equal(node.type, "two");
  assert.equal(cursor.getIndex(), 1);
  assert.equal(cursor.getChar(), "0");
  assert.equal(node.startIndex, 0);
  assert.equal(node.endIndex, 0);
  assert.equal(cursor.lastIndex(), 2);
};

exports["Literal: Two characters, Within."] = () => {
  const cursor = new Cursor("200");
  const literal = new Literal("twenty", "20");
  const node = literal.parse(cursor);

  assert.equal(node.value, "20");
  assert.equal(node.type, "twenty");
  assert.equal(cursor.getIndex(), 2);
  assert.equal(cursor.getChar(), "0");
  assert.equal(node.startIndex, 0);
  assert.equal(node.endIndex, 1);
  assert.equal(cursor.lastIndex(), 2);
};
