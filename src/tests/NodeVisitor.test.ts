/** @jest-environment node */
import CompositeNode from "../ast/CompositeNode";
import NodeVisitor from "../ast/NodeVisitor";
import ValueNode from "../ast/ValueNode";
import Cursor from "../Cursor";
import cssValue from "./cssPatterns/cssValue";

function createContext(amount: number = 10) {
  const grandParent = new CompositeNode("grand-parent", "grand-parent");
  const parent = new CompositeNode("parent", "parent");
  const children: ValueNode[] = [];

  for (let x = 0; x < amount; x++) {
    const child = new ValueNode("child", "child", x.toString());
    children.push(child);
  }

  parent.children = children;
  grandParent.children.push(parent);

  return grandParent;
}

describe("NodeVisitor", () => {
  test("flatten", () => {
    const cursor = new Cursor(
      "linear-gradient(to left, #333, #333 50%, #eee 75%, #333 75%), linear-gradient(to bottom, #555, #555 50%, #eee 75%, #555 75%)"
    );
    const node = cssValue.parse(cursor);

    if (node != null) {
      const visitor = new NodeVisitor(node);
      visitor.flatten();

      expect(node.children.length).toBe(47);
    }
  });

  test("remove", () => {
    const cursor = new Cursor(
      "linear-gradient(to left, #333, #333 50%, #eee 75%, #333 75%), linear-gradient(to bottom, #555, #555 50%, #eee 75%, #555 75%)"
    );
    const node = cssValue.parse(cursor);

    if (node != null) {
      const visitor = new NodeVisitor(node);
      visitor
        .selectRoot()
        .flatten()
        .select((node) => {
          return node.name === "spaces" || node.value === " ";
        })
        .remove();

      expect(node.children.length).toBe(39);
    }
  });

  test("wrap", () => {
    const node = createContext();

    if (node != null) {
      const visitor = new NodeVisitor(node);
      const stringResult = visitor
        .select((n) => n.name === "child")
        .wrap((node) => {
          const wrapper = new CompositeNode("wrapper", "wrapper");
          wrapper.children.push(node);
          return wrapper;
        });

      visitor.unwrap();

      expect(node.children.length).toBe(1);
    }
  });
});
