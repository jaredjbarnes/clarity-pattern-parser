import Not from "../Not.js";
import Literal from "../Literal.js";
import Cursor from "../../Cursor.js";

describe("Not", () => {
  test("Zero characters, should throw.", () => {
    expect(() => {
      const cursor = new Cursor("");
    }).toThrow();
  });

  test("Parse twice with same parser.", () => {
    const cursor = new Cursor("1");
    const not = new Not("not-two", new Literal("two", "2"));
    const node = not.parse(cursor);

    cursor.moveToBeginning();

    const node2 = not.parse(cursor);

    expect(node.value).toBe("1");
    expect(node.type).toBe("not-two");
    expect(node2.value).toBe("1");
    expect(node2.type).toBe("not-two");
  });

  test("One character, Exact.", () => {
    const cursor = new Cursor("1");
    const not = new Not("not-two", new Literal("two", "2"));
    const node = not.parse(cursor);

    expect(node.value).toBe("1");
    expect(node.type).toBe("not-two");
  });

  test("Two characters, Exact.", () => {
    const cursor = new Cursor("10");
    const not = new Not("not-twenty", new Literal("twenty", "20"));
    const node = not.parse(cursor);

    expect(node.value).toBe("10");
    expect(node.type).toBe("not-twenty");
  });

  test("One character, Within.", () => {
    const cursor = new Cursor("12");
    const not = new Not("not-two", new Literal("two", "2"));
    const node = not.parse(cursor);

    expect(node.value).toBe("1");
    expect(node.type).toBe("not-two");
    expect(cursor.getChar()).toBe("2");
  });

  test("Two characters, Within.", () => {
    const cursor = new Cursor("1020");
    const not = new Not("not-twenty", new Literal("twenty", "20"));
    const node = not.parse(cursor);

    expect(node.value).toBe("10");
    expect(node.type).toBe("not-twenty");
    expect(cursor.getChar()).toBe("2");
  });

});
