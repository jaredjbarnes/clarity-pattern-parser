import Node from "./Node";

export default class CompositeNode extends Node {
  constructor(type: string, name: string, startIndex = 0, endIndex = 0) {
    super(type, name, startIndex, endIndex, true);
  }

  clone() {
    const node = new CompositeNode(
      this.type,
      this.name,
      this.startIndex,
      this.endIndex
    );

    node.children = this.children.map((child) => {
      return child.clone();
    });

    return node;
  }

  toString() {
    return this.children.map((child) => child.toString()).join("");
  }
}
