import RepeatComposite from "../patterns/composite/RepeatComposite";
import AndComposite from "../patterns/composite/AndComposite";
import OptionalComposite from "../patterns/composite/OptionalComposite";
import Literal from "../patterns/value/Literal";
import assert from "assert";

describe("RepeatComposite", () => {
  test("Cannot use optional patterns.", () => {
    const firstName = new Literal("John", "John");
    const lastName = new Literal("Doe", "Doe");
    const andComposite = new AndComposite("full-name", [firstName, lastName]);

    expect(() => {
      new RepeatComposite("full-names", new OptionalComposite(andComposite));
    }).toThrow();
  });

  test("clone with custom name.", () => {
    const firstName = new Literal("John", "John");
    const lastName = new Literal("Doe", "Doe");
    const andComposite = new AndComposite("full-name", [firstName, lastName]);
    const fullnames = new RepeatComposite("full-names", andComposite);
    const clone = fullnames.clone("full-names-2");

    expect(clone.name).toBe("full-names-2");
  });
});
