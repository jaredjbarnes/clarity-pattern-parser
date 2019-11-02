import Node from "./Node.js";

export default class ValueNode extends Node {
  constructor(type, value, startIndex = 0, endIndex = 0) {
    super(type, startIndex, endIndex);
    this.value = value;
  }

  clone() {
    return new ValueNode(this.type, this.value, this.startIndex, this.endIndex);
  }
}
