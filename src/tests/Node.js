import Node from "../ast/Node.js";
import assert from "assert";

exports["Node: clone."] = () => {
  assert.throws(() => {
    new Node("type", "name", 0, 1).clone();
  });
};

exports["Node: fitler."] = () => {
  assert.throws(() => {
    new Node("type", "name", 0, 1).filter();
  });
};

exports["Node: toString."] = () => {
  assert.throws(() => {
    new Node("type", "name", 0, 1).toString();
  });
};

exports["Node: With no startIndex."] = () => {
  assert.throws(() => {
    new Node("type", "name", undefined, 1);
  });
};

exports["Node: With no endIndex."] = () => {
  assert.throws(() => {
    new Node("type", "name", 0);
  });
};
