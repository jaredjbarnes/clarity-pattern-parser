import Literal from "../patterns/Literal.js";
import Cursor from "../Cursor.js";
import Repeat from "../patterns/Repeat.js";
import assert from "assert";

exports["Repeat Literal twice."] = () => {
  const cursor = new Cursor("JohnJohn");
  const literal = new Literal("name", "John");
  const repetition = new Repeat("stutter", literal);
  const node = repetition.parse(cursor);

  assert.equal(node.type, "stutter");
  assert.equal(node.children[0].type, "name");
  assert.equal(node.children[0].value, "John");
  assert.equal(node.children[1].type, "name");
  assert.equal(node.children[1].value, "John");
};

exports["Repeat Literal twice with divider."] = () => {
  const cursor = new Cursor("John,John");
  const name = new Literal("name", "John");
  const comma = new Literal("comma", ",");
  const repetition = new Repeat("stutter", name, comma);
  const node = repetition.parse(cursor);

  assert.equal(node.type, "stutter");
  assert.equal(node.children[0].type, "name");
  assert.equal(node.children[0].value, "John");
  assert.equal(node.children[1].type, "comma");
  assert.equal(node.children[1].value, ",");
  assert.equal(node.children[2].type, "name");
  assert.equal(node.children[2].value, "John");
};

exports["Repeat Literal three with divider."] = () => {
  const cursor = new Cursor("John,John,John");
  const name = new Literal("name", "John");
  const comma = new Literal("comma", ",");
  const repetition = new Repeat("stutter", name, comma);
  const node = repetition.parse(cursor);

  assert.equal(node.type, "stutter");
  assert.equal(node.children[0].type, "name");
  assert.equal(node.children[0].value, "John");
  assert.equal(node.children[1].type, "comma");
  assert.equal(node.children[1].value, ",");
  assert.equal(node.children[2].type, "name");
  assert.equal(node.children[2].value, "John");
  assert.equal(node.children[3].type, "comma");
  assert.equal(node.children[3].value, ",");
  assert.equal(node.children[4].type, "name");
  assert.equal(node.children[4].value, "John");
};

exports["Repeat Literal three with trailing divider."] = () => {
  const cursor = new Cursor("John,John,John,");
  const name = new Literal("name", "John");
  const comma = new Literal("comma", ",");
  const repetition = new Repeat("stutter", name, comma);
  const node = repetition.parse(cursor);

  assert.equal(node.type, "stutter");
  assert.equal(node.children[0].type, "name");
  assert.equal(node.children[0].value, "John");
  assert.equal(node.children[1].type, "comma");
  assert.equal(node.children[1].value, ",");
  assert.equal(node.children[2].type, "name");
  assert.equal(node.children[2].value, "John");
  assert.equal(node.children[3].type, "comma");
  assert.equal(node.children[3].value, ",");
  assert.equal(node.children[4].type, "name");
  assert.equal(node.children[4].value, "John");
  assert.equal(node.children[5].type, "comma");
  assert.equal(node.children[5].value, ",");
};
