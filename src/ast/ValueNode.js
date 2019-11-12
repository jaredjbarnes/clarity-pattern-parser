import Node from "./Node.js";
// We might want reference to the pattern on the node.
export default class ValueNode extends Node {
  constructor(name, value, startIndex = 0, endIndex = 0) {
    super(name, startIndex, endIndex);
    this.value = value;
  }

  clone() {
    return new ValueNode(this.name, this.value, this.startIndex, this.endIndex);
  }
}
