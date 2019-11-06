import ValuePattern from "../patterns/value/ValuePattern.js";
import assert from "assert";

exports["ValuePattern: getType."] = () => {
  const valuePattern = new ValuePattern("name", "value");
  assert.equal(valuePattern.getType(), "value");
};

exports["ValuePattern: getPatterns."] = () => {
  const valuePattern = new ValuePattern();
  assert.equal(valuePattern.getPatterns(), null);
};

exports["ValuePattern: getValue."] = () => {
  const valuePattern = new ValuePattern();
  assert.throws(() => {
   valuePattern.getValue();
  });
};
