import OptionalComposite from "../patterns/composite/OptionalComposite";
import Literal from "../patterns/value/Literal";
import assert from "assert";

test(
  "OptionalComposite: getPossibilities with no rootPattern supplied."
,() => {
  const literal = new Literal("Jared", "Jared");
  const pattern = new OptionalComposite(literal);

  const possibilities = pattern.getPossibilities();

  expect(possibilities.length).toBe(1);
  expect(possibilities[0]).toBe("Jared");
});
