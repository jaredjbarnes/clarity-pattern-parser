import RepeatComposite from "../patterns/composite/RepeatComposite";
import AndComposite from "../patterns/composite/AndComposite";
import OptionalComposite from "../patterns/composite/OptionalComposite";
import Literal from "../patterns/value/Literal";
import assert from "assert";

exports["RepeatComposite: Cannot use optional patterns."] = () => {
  const firstName = new Literal("John", "John");
  const lastName = new Literal("Doe", "Doe");
  const andComposite = new AndComposite("full-name", [firstName, lastName]);

  assert.throws(() => {
    new RepeatComposite("full-names", new OptionalComposite(andComposite));
  });
};

exports["RepeatComposite: clone with custom name."] = () => {
  const firstName = new Literal("John", "John");
  const lastName = new Literal("Doe", "Doe");
  const andComposite = new AndComposite("full-name", [firstName, lastName]);
  const fullnames = new RepeatComposite("full-names", andComposite);
  const clone = fullnames.clone("full-names-2");

  assert.equal(clone.name, "full-names-2");
};
