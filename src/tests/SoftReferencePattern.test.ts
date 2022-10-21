import Cursor from "../Cursor";
import SoftReferencePattern from "../patterns/SoftReferencePattern";
import AndValue from "../patterns/value/AndValue";
import Literal from "../patterns/value/Literal";
import OrValue from "../patterns/value/OrValue";

describe("SoftReferencePattern", () => {
  test("Reference to node in different branch.", () => {
    const a = new Literal("a", "a");
    const b = new Literal("b", "b");
    const a_b_c = new AndValue("a-and-b-and-c", [
      a,
      b,
      new SoftReferencePattern("c"),
    ]);
    const c = new Literal("c", "c");
    const b_c = new AndValue("b-and-c", [b, c]);
    const main = new OrValue("main", [a_b_c, b_c]);

    const result = main.parse(new Cursor("abc"));
    const result2 = a_b_c.parse(new Cursor("ab"));

    expect(result2).not.toBeNull();
    expect(result).not.toBeNull();
  });
});
