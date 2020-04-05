import OptionalComposite from "../patterns/composite/OptionalComposite.js";
import Literal from "../patterns/value/Literal.js";
import assert from "assert";

exports[
  "OptionalComposite: getPossibilities with no rootPattern supplied."
] = () => {
  const literal = new Literal("Jared", "Jared");
  const pattern = new OptionalComposite(literal);

  const possibilities = pattern.getPossibilities();

  assert.equal(possibilities.length, 1);
  assert.equal(possibilities[0], "Jared");
};
