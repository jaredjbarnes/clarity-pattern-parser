import Literal from "../Literal.js";
import Cursor from "../../Cursor.js";
import Repetition from "../Repetition.js";

describe("Repetition", () => {
  test("Repeat Literal twice.", () => {
      const cursor = new Cursor("JohnJohn");
      const literal = new Literal("name", "John");
      const repeatition = new Repetition("stutter", literal);
      const node = repeatition.parse(cursor);

      expect(node.type).toBe("stutter");      
      expect(node.children[0].type).toBe("name");      
      expect(node.children[0].value).toBe("John");      
      expect(node.children[1].type).toBe("name");      
      expect(node.children[1].value).toBe("John");      
  });

});
