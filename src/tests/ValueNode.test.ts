import ValueNode from "../ast/ValueNode";
import assert from "assert";

describe("ValueNode", () => {
  test("clone.", () => {
    const node = new ValueNode("type", "name", "value", 0, 1);
    const clone = node.clone();

    assert.equal(node.name, clone.name);
    assert.equal(node.value, clone.value);
    assert.equal(node.startIndex, clone.startIndex);
    assert.equal(node.endIndex, clone.endIndex);
  });

  test("Without indexes.", () => {
    const node = new ValueNode("type", "name", "value");

    assert.equal(node.name, "name");
    assert.equal(node.value, "value");
    assert.equal(node.startIndex, 0);
    assert.equal(node.endIndex, 0);
  });
});
