import Node from "./Node.js";

export default class CompositeNode extends Node {
  constructor(name, startIndex = 0, endIndex = 0) {
    super(name, startIndex, endIndex);
    this.children = [];
  }

  clone() {
    const node = new CompositeNode(this.name, this.startIndex, this.endIndex);
    node.children = this.children.map(child => {
      return child.clone();
    });

    return node;
  }
}
