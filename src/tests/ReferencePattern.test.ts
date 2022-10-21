import Cursor from "../Cursor";
import ReferencePattern from "../patterns/ReferencePattern";
import AndValue from "../patterns/value/AndValue";
import Literal from "../patterns/value/Literal";
import OrValue from "../patterns/value/OrValue";

describe("ReferencePattern", () => {
  test("Reference to node in different branch.", () => {
    const a = new Literal("a", "a");
    const b = new Literal("b", "b");
    const c = new Literal("c", "c");
    const a_b_c = new AndValue("a-and-b-and-c", [
      a,
      b,
      new ReferencePattern("c"),
    ]);
    const b_c = new AndValue("b-and-c", [b, c]);
    const main = new OrValue("main", [a_b_c, b_c]);

    const result = main.parse(new Cursor("abc"));

    expect(result).not.toBeNull();
  });
});
