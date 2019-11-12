import ValueNode from "../ast/ValueNode.js";
import assert from "assert";

exports["ValueNode: clone."] = () => {
  const node = new ValueNode("type", "value", 0, 1);
  const clone = node.clone();

  assert.equal(node.name, clone.name);
  assert.equal(node.value, clone.value);
  assert.equal(node.startIndex, clone.startIndex);
  assert.equal(node.endIndex, clone.endIndex);
};
