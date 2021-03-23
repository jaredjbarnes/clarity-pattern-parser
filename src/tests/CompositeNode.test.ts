import CompositeNode from "../ast/CompositeNode";
import assert from "assert";
import { ValueNode } from "../index";

describe("CompositeNode", () => {
  test("CompositeNode: clone", () => {
    const node = new CompositeNode("type", "name", 0, 0);
    const valueNode = new ValueNode("value-type", "value-name", "t", 0, 0);

    node.children.push(valueNode);

    const clone = node.clone();

    expect(clone.type).toBe("type");
    expect(clone.name).toBe("name");
    expect(clone.children.length).toBe(1);
    expect(clone.children[0].type).toBe("value-type");
    expect(clone.children[0].name).toBe("value-name");
  });

  test("CompositeNode: constructor without default indexes.", () => {
    const node = new CompositeNode("type", "name");
    const valueNode = new ValueNode("value-type", "value-name", "t", 0, 0);

    node.children.push(valueNode);

    expect(node.type).toBe("type");
    expect(node.name).toBe("name");
    expect(node.children.length).toBe(1);
    expect(node.children[0].type).toBe("value-type");
    expect(node.children[0].name).toBe("value-name");
  });
});
