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
      visitor.selectRoot().flatten();

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

  test("wrap and unwrap", () => {
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

      let wrappers = NodeVisitor.select(node, (n) => n.type === "wrapper")
        .selectedNodes;
      let children = NodeVisitor.select(node, (n) => n.type === "child")
        .selectedNodes;

      expect(wrappers.length).toBe(10);
      expect(children.length).toBe(10);

      visitor.select((n) => n.type === "child").unwrap();

      wrappers = visitor.select((n) => n.type === "wrapper").selectedNodes;
      children = visitor.select((n) => n.type === "child").selectedNodes;

      expect(wrappers.length).toBe(0);
      expect(children.length).toBe(10);
    }
  });

  test("prepend", () => {
    const node = createContext();

    if (node != null) {
      const visitor = new NodeVisitor(node);
      visitor
        .select((n) => n.type === "child")
        .prepend((n) => {
          const sibling = new ValueNode("sibling", "sibling", n.value || "");

          return sibling;
        });

      const siblings = visitor.select((n) => n.type === "sibling")
        .selectedNodes;
      const parent = visitor.select((n) => n.type === "parent")
        .selectedNodes[0];

      const children = parent.children;

      expect(siblings.length).toBe(10);

      expect(children[0]?.type).toBe("sibling");
      expect(children[0]?.value).toBe("0");

      expect(children[1]?.type).toBe("child");
      expect(children[1]?.value).toBe("0");

      expect(children[2]?.type).toBe("sibling");
      expect(children[2]?.value).toBe("1");

      expect(children[3]?.type).toBe("child");
      expect(children[3]?.value).toBe("1");

      expect(children[4]?.type).toBe("sibling");
      expect(children[4]?.value).toBe("2");

      expect(children[5]?.type).toBe("child");
      expect(children[5]?.value).toBe("2");

      expect(children[6]?.type).toBe("sibling");
      expect(children[6]?.value).toBe("3");

      expect(children[7]?.type).toBe("child");
      expect(children[7]?.value).toBe("3");

      expect(children[8]?.type).toBe("sibling");
      expect(children[8]?.value).toBe("4");

      expect(children[9]?.type).toBe("child");
      expect(children[9]?.value).toBe("4");

      expect(children[10]?.type).toBe("sibling");
      expect(children[10]?.value).toBe("5");

      expect(children[11]?.type).toBe("child");
      expect(children[11]?.value).toBe("5");

      expect(children[12]?.type).toBe("sibling");
      expect(children[12]?.value).toBe("6");

      expect(children[13]?.type).toBe("child");
      expect(children[13]?.value).toBe("6");

      expect(children[14]?.type).toBe("sibling");
      expect(children[14]?.value).toBe("7");

      expect(children[15]?.type).toBe("child");
      expect(children[15]?.value).toBe("7");

      expect(children[16]?.type).toBe("sibling");
      expect(children[16]?.value).toBe("8");

      expect(children[17]?.type).toBe("child");
      expect(children[17]?.value).toBe("8");

      expect(children[18]?.type).toBe("sibling");
      expect(children[18]?.value).toBe("9");

      expect(children[19]?.type).toBe("child");
      expect(children[19]?.value).toBe("9");
    }
  });

  test("append", () => {
    const node = createContext();

    if (node != null) {
      const visitor = new NodeVisitor(node);
      visitor
        .select((n) => n.type === "child")
        .append((n) => {
          const sibling = new ValueNode("sibling", "sibling", n.value || "");

          return sibling;
        });

      const siblings = visitor.select((n) => n.type === "sibling")
        .selectedNodes;
      const parent = visitor.select((n) => n.type === "parent")
        .selectedNodes[0];

      const children = parent.children;

      expect(siblings.length).toBe(10);

      expect(children[0]?.type).toBe("child");
      expect(children[0]?.value).toBe("0");

      expect(children[1]?.type).toBe("sibling");
      expect(children[1]?.value).toBe("0");

      expect(children[2]?.type).toBe("child");
      expect(children[2]?.value).toBe("1");

      expect(children[3]?.type).toBe("sibling");
      expect(children[3]?.value).toBe("1");

      expect(children[4]?.type).toBe("child");
      expect(children[4]?.value).toBe("2");

      expect(children[5]?.type).toBe("sibling");
      expect(children[5]?.value).toBe("2");

      expect(children[6]?.type).toBe("child");
      expect(children[6]?.value).toBe("3");

      expect(children[7]?.type).toBe("sibling");
      expect(children[7]?.value).toBe("3");

      expect(children[8]?.type).toBe("child");
      expect(children[8]?.value).toBe("4");

      expect(children[9]?.type).toBe("sibling");
      expect(children[9]?.value).toBe("4");

      expect(children[10]?.type).toBe("child");
      expect(children[10]?.value).toBe("5");

      expect(children[11]?.type).toBe("sibling");
      expect(children[11]?.value).toBe("5");

      expect(children[12]?.type).toBe("child");
      expect(children[12]?.value).toBe("6");

      expect(children[13]?.type).toBe("sibling");
      expect(children[13]?.value).toBe("6");

      expect(children[14]?.type).toBe("child");
      expect(children[14]?.value).toBe("7");

      expect(children[15]?.type).toBe("sibling");
      expect(children[15]?.value).toBe("7");

      expect(children[16]?.type).toBe("child");
      expect(children[16]?.value).toBe("8");

      expect(children[17]?.type).toBe("sibling");
      expect(children[17]?.value).toBe("8");

      expect(children[18]?.type).toBe("child");
      expect(children[18]?.value).toBe("9");

      expect(children[19]?.type).toBe("sibling");
      expect(children[19]?.value).toBe("9");
    }
  });

  test("selectAll", () => {
    const node = createContext();

    if (node != null) {
      const visitor = new NodeVisitor(node);
      const all = visitor.selectAll().selectedNodes;

      expect(all.length).toBe(12);
      expect(all[0]?.type).toBe("grand-parent");
      expect(all[1]?.type).toBe("parent");
      expect(all[2]?.type).toBe("child");
      expect(all[3]?.type).toBe("child");
      expect(all[4]?.type).toBe("child");
      expect(all[5]?.type).toBe("child");
      expect(all[6]?.type).toBe("child");
      expect(all[7]?.type).toBe("child");
      expect(all[8]?.type).toBe("child");
      expect(all[9]?.type).toBe("child");
    }
  });

  test("selectNode", () => {
    const node = createContext();

    if (node != null) {
      const visitor = new NodeVisitor(node);
      const selected = visitor.selectNode(node).selectedNodes;

      expect(selected.length).toBe(1);
      expect(selected[0]?.type).toBe("grand-parent");
    }
  });

  test("selectNode then deselectNode", () => {
    const node = createContext();

    if (node != null) {
      const visitor = new NodeVisitor(node);
      const selected = visitor.selectNode(node).deselectNode(node)
        .selectedNodes;

      expect(selected.length).toBe(0);
    }
  });

  test("forEach", () => {
    const node = createContext();
    let count = 0;

    if (node != null) {
      const visitor = new NodeVisitor(node);
      const selected = visitor.selectAll().forEach(()=>count++)
        .selectedNodes;

      expect(selected.length).toBe(12);
      expect(count).toBe(12);
    }
  });
});
