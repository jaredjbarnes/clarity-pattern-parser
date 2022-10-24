import { Cursor, Reference, And, Literal, Or } from "../index";

describe("ReferencePattern", () => {
  test("Reference to node in different branch.", () => {
    const a = new Literal("a", "a");
    const b = new Literal("b", "b");
    const a_b_c = new And("a-and-b-and-c", [a, b, new Reference("c")]);
    const c = new Literal("c", "c");
    const b_c = new And("b-and-c", [b, c]);
    const main = new Or("main", [a_b_c, b_c]);

    const result = main.parse(new Cursor("abc"));

    expect(result).not.toBeNull();
  });
});
