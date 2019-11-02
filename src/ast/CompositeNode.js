import Node from "./Node.js";

export default class CompositeNode extends Node {
  constructor(type, startIndex = 0, endIndex = 0) {
    super(type, startIndex, endIndex);
    this.children = [];
  }

  clone() {
    const node = new CompositeNode(this.type, this.startIndex, this.endIndex);
    node.children = this.children.map(child => {
      return child.clone();
    });

    return node;
  }
}
