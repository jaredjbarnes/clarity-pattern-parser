import CompositePattern from "../patterns/composite/CompositePattern";
import assert from "assert";

exports["CompositePattern: Clone"] = () => {
  const pattern = new CompositePattern("type", "name");
  assert.throws(() => {
    pattern.clone();
  });
};
