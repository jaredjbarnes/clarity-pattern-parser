import Node from "./Node.js";

export default class CompositeNode extends Node {
  constructor(type) {
    super(type);
    this.children = [];
  }

  clone() {
    const node = new CompositeNode(this.type);
    node.children = this.children.map(child => {
      return child.clone();
    });

    return node;
  }

}
