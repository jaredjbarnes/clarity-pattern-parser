import Pattern from "../patterns/Pattern.js";
import assert from "assert";

exports["Pattern: parse."] = () => {
  const valuePattern = new Pattern();
  assert.throws(() => {
    valuePattern.parse();
  });
};

exports["Pattern: getName."] = () => {
  const valuePattern = new Pattern();
  assert.throws(() => {
    valuePattern.getName();
  });
};

exports["Pattern: getType."] = () => {
  const valuePattern = new Pattern();
  assert.throws(() => {
    valuePattern.getType();
  });
};

exports["Pattern: clone."] = () => {
  const valuePattern = new Pattern();
  assert.throws(() => {
    valuePattern.clone();
  });
};

exports["Pattern: getPatterns."] = () => {
  const valuePattern = new Pattern();
  assert.throws(() => {
    valuePattern.getPatterns();
  });
};
