import Literal from "../Literal.js";
import Cursor from "../../Cursor.js";
import And from "../And.js";

describe("And", () => {
  test("And Twice", () => {
    const cursor = new Cursor("JohnDoe");
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe");
    const fullName = new And("full-name", [firstName, lastName]);
    const node = fullName.parse(cursor);

    expect(node.type).toBe("full-name");
    expect(node.children[0].type).toBe("first-name");
    expect(node.children[0].value).toBe("John");
    expect(node.children[1].type).toBe("last-name");
    expect(node.children[1].value).toBe("Doe");
    expect(cursor.isAtEnd()).toBe(true);
    expect(node.startIndex).toBe(0);
    expect(cursor.lastIndex()).toBe(node.endIndex);
  });

  test("And Twice as Value", () => {
    const cursor = new Cursor("JohnDoe");
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe");
    const fullName = new And("full-name", [firstName, lastName], true);
    const node = fullName.parse(cursor);

    expect(node.type).toBe("full-name");
    expect(node.value).toBe("JohnDoe");
    expect(cursor.lastIndex()).toBe(node.endIndex);
  });
});
