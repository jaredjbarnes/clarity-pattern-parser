import ValuePattern from "../patterns/value/ValuePattern.js";
import assert from "assert";

exports["ValuePattern: Default state no children."] = () => {
  const valuePattern = new ValuePattern("value-pattern");

  assert.equal(valuePattern.children.length, 0);
  assert.equal(valuePattern.name, "value-pattern");
};

exports["ValuePattern: Clone and parse."] = () => {
  const valuePattern = new ValuePattern("value-pattern");

  assert.throws(() => {
    valuePattern.clone();
  });

  assert.throws(() => {
    valuePattern.parse();
  });
};
