import Node from "../ast/Node.js";
import assert from "assert";

exports["Node: clone."] = () => {
  assert.throws(() => {
    new Node("type", 0, 1).clone();
  });
};

exports["Node: With no startIndex."] = () => {
  assert.throws(() => {
    new Node("type", undefined, 1).clone();
  });
};

exports["Node: With no endIndex."] = () => {
  assert.throws(() => {
    new Node("type", 0).clone();
  });
};
