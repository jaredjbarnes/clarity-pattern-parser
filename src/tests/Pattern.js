import Pattern from "../patterns/Pattern.js";
import assert from "assert";

exports["Pattern: parse."] = () => {
  const valuePattern = new Pattern("pattern-type", "pattern");
  assert.throws(() => {
    valuePattern.parse();
  });
};

exports["Pattern: clone."] = () => {
  const valuePattern = new Pattern("pattern-type", "pattern");
  assert.throws(() => {
    valuePattern.clone();
  });
};

exports["Pattern: getPossibilities."] = () => {
  const valuePattern = new Pattern("pattern-type", "pattern");
  assert.throws(() => {
    valuePattern.getPossibilities();
  });
};

exports["Pattern: limited arguments."] = () => {
  new Pattern(undefined, "name");
};

exports["Pattern: no arguments."] = () => {
  assert.throws(() => {
    new Pattern();
  });
};

exports["Pattern: set parent."] = () => {
  const parent = new Pattern("pattern-type", "pattern");
  const child = new Pattern("pattern-type", "pattern");

  child.parent = parent;
};

exports["Pattern: set invalid parent."] = () => {
  const child = new Pattern("pattern-type", "pattern");
  child.parent = "";

  assert.equal(child.parent, null);
};
