import Pattern from "../patterns/Pattern.js";
import assert from "assert";

exports["Pattern: parse."] = () => {
  const valuePattern = new Pattern("pattern");
  assert.throws(() => {
    valuePattern.parse();
  });
};

exports["Pattern: clone."] = () => {
  const valuePattern = new Pattern("pattern");
  assert.throws(() => {
    valuePattern.clone();
  });
};
