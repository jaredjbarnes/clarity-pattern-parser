import ValuePattern from "../patterns/value/ValuePattern";
import assert from "assert";

exports["ValuePattern: Default state no children."] = () => {
  const valuePattern = new ValuePattern("type", "name");

  assert.equal(valuePattern.children.length, 0);
  assert.equal(valuePattern.name, "name");
  assert.equal(valuePattern.type, "type");
};

exports["ValuePattern: Clone and parse."] = () => {
  const valuePattern = new ValuePattern("type", "name");

  assert.throws(() => {
    valuePattern.clone();
  });

  assert.throws(() => {
    valuePattern.parse();
  });
};
