/** @jest-environment node */
import {Repeat, Cursor, Literal} from "../index";

describe("Repeat", function () {

  test("No Match", () => {
    const john = new Literal("john", "John");
    const johns = new Repeat("johns", john);
    const cursor = new Cursor("JaneJane");

    johns.parse(cursor);
    expect(cursor.hasUnresolvedError()).toBe(true);
  });

  test("Success, one John", () => {
    const john = new Literal("john", "John");
    const johns = new Repeat("johns", john);
    const cursor = new Cursor("John");
    const node = johns.parse(cursor);

    expect(node?.name).toBe("johns");
    expect(node?.value).toBe("John");
    expect(node?.startIndex).toBe(0);
    expect(node?.endIndex).toBe(3);
  });

  test("Success with a terminating match.", () => {
    const john = new Literal("john", "John");
    const johns = new Repeat("johns", john);
    const cursor = new Cursor("JohnJohnJane");
    const node = johns.parse(cursor);

    expect(node?.name).toBe("johns");
    expect(node?.value).toBe("JohnJohn");
    expect(node?.startIndex).toBe(0);
    expect(node?.endIndex).toBe(7);
    expect(cursor.getIndex()).toBe(7);
  });

  test("Bad cursor.", () => {
    const john = new Literal("john", "John");
    const johns = new Repeat("johns", john);

    expect(() => {
      (johns as any).parse("");
    }).toThrow();
  });

  test("Clone.", () => {
    const john = new Literal("john", "John");
    const johns = new Repeat("johns", john);
    const clone = johns.clone();

    expect(johns.name).toBe(clone.name);
  });

  test("Try Optional.", () => {
    const john = new Literal("john", "John", true);

    expect(() => {
      new Repeat("johns", john);
    });
  });

  test("With divider.", () => {
    const cursor = new Cursor("John,John");
    const john = new Literal("john", "John");
    const divider = new Literal("divider", ",");

    const node = new Repeat("johns", john, divider).parse(cursor);

    expect(node?.name).toBe("johns");
    expect(node?.value).toBe("John,John");
  });
});
