import CompositeNode from "../ast/CompositeNode";
import assert from "assert";
import { ValueNode } from "../index";

exports["CompositeNode: clone"] = () => {
  const node = new CompositeNode("type", "name", 0, 0);
  const valueNode = new ValueNode("value-type", "value-name", "t", 0, 0);

  node.children.push(valueNode);

  const clone = node.clone();

  assert.equal(clone.type, "type");
  assert.equal(clone.name, "name");
  assert.equal(clone.children.length, 1);
  assert.equal(clone.children[0].type, "value-type");
  assert.equal(clone.children[0].name, "value-name");
};

exports["CompositeNode: constructor without default indexes."] = () => {
  const node = new CompositeNode("type", "name");
  const valueNode = new ValueNode("value-type", "value-name", "t", 0, 0);

  node.children.push(valueNode);

  assert.equal(node.type, "type");
  assert.equal(node.name, "name");
  assert.equal(node.children.length, 1);
  assert.equal(node.children[0].type, "value-type");
  assert.equal(node.children[0].name, "value-name");
};
