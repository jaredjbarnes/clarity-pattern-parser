/** @jest-environment node */
import RepeatComposite from "../patterns/composite/RepeatComposite";
import AndComposite from "../patterns/composite/AndComposite";
import OptionalComposite from "../patterns/composite/OptionalComposite";
import Literal from "../patterns/value/Literal";
import Cursor from "../Cursor";
import OrComposite from "../patterns/composite/OrComposite";

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

  test("parse.", () => {
    const a = new Literal("a", "A");
    const b = new Literal("b", "B");
    const space = new Literal("space", " ");
    const or = new OrComposite("names", [a, b]);

    const repeat = new RepeatComposite("repeat", or, space);
    const result = repeat.parse(new Cursor("A B"));

    expect(result?.children[0].value).toBe("A");
    expect(result?.children[0].name).toBe("a");
    expect(result?.children[1].value).toBe(" ");
    expect(result?.children[1].name).toBe("space");
    expect(result?.children[2].value).toBe("B");
    expect(result?.children[2].name).toBe("b");
  });

  test("Cannot end on a divider.", () => {
    const a = new Literal("a", "A");
    const b = new Literal("b", "B");
    const space = new Literal("space", " ");
    const or = new OrComposite("names", [a, b]);

    const repeat = new RepeatComposite("repeat", or, space);
    const result = repeat.parse(new Cursor("A B "));

    expect(result).toBe(null);
  });
});
