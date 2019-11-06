import ValuePatterns from "../patterns/value/ValuePatterns.js";
import assert from "assert";
import Literal from "../patterns/value/Literal.js";

exports["ValuePattern: getValue."] = () => {
  const valuePatterns = new ValuePatterns("name", [
    new Literal("a", "a"),
    new Literal("a", "a")
  ]);

  assert.throws(() => {
    valuePatterns.clone();
  });
};
