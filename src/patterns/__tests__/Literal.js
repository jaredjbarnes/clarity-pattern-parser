import Literal from "../Literal.js";
import Cursor from "../../Cursor.js";

describe("Literal", () => {
  test("Zero characters, should throw.", () => {
    expect(() => {
      const cursor = new Cursor("");
    }).toThrow();
  });

  test("One character, Exact.", () => {
    const cursor = new Cursor("2");
    const literal = new Literal("two", "2");
    const node = literal.parse(cursor);

    expect(node.value).toBe("2");
    expect(node.type).toBe("two");
    expect(node.startIndex).toBe(0);
    expect(node.endIndex).toBe(0);
    expect(cursor.lastIndex()).toBe(0);
  });

  test("Two characters, Exact.", () => {
    const cursor = new Cursor("20");
    const literal = new Literal("twenty", "20");
    const node = literal.parse(cursor);

    expect(node.value).toBe("20");
    expect(node.type).toBe("twenty");
    expect(node.startIndex).toBe(0);
    expect(node.endIndex).toBe(1);
    expect(cursor.lastIndex()).toBe(1);
  });

  test("One character, Within.", () => {
    const cursor = new Cursor("200");
    const literal = new Literal("two", "2");
    const node = literal.parse(cursor);

    expect(node.value).toBe("2");
    expect(node.type).toBe("two");
    expect(cursor.getIndex()).toBe(1);
    expect(cursor.getChar()).toBe("0");
    expect(node.startIndex).toBe(0);
    expect(node.endIndex).toBe(0);
    expect(cursor.lastIndex()).toBe(2);
  });

  test("Two characters, Within.", () => {
    const cursor = new Cursor("200");
    const literal = new Literal("twenty", "20");
    const node = literal.parse(cursor);

    expect(node.value).toBe("20");
    expect(node.type).toBe("twenty");
    expect(cursor.getIndex()).toBe(2);
    expect(cursor.getChar()).toBe("0");
    expect(node.startIndex).toBe(0);
    expect(node.endIndex).toBe(1);
    expect(cursor.lastIndex()).toBe(2);
  });
});
