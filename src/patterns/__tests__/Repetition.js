import Literal from "../Literal.js";
import Cursor from "../../Cursor.js";
import Repetition from "../Repetition.js";

describe("Repetition", () => {
  test("Repeat Literal twice.", () => {
      const cursor = new Cursor("JohnJohn");
      const literal = new Literal("name", "John");
      const repetition = new Repetition("stutter", literal);
      const node = repetition.parse(cursor);

      expect(node.type).toBe("stutter");      
      expect(node.children[0].type).toBe("name");      
      expect(node.children[0].value).toBe("John");      
      expect(node.children[1].type).toBe("name");      
      expect(node.children[1].value).toBe("John");      
  });

  test("Repeat Literal twice with divider.", () => {
    const cursor = new Cursor("John,John");
    const name = new Literal("name", "John");
    const comma = new Literal("comma", ",");
    const repetition = new Repetition("stutter", name, comma);
    const node = repetition.parse(cursor);

    expect(node.type).toBe("stutter");      
    expect(node.children[0].type).toBe("name");      
    expect(node.children[0].value).toBe("John");  
    expect(node.children[1].type).toBe("comma");      
    expect(node.children[1].value).toBe(",");      
    expect(node.children[2].type).toBe("name");      
    expect(node.children[2].value).toBe("John");      
});

});
