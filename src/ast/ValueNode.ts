import Node from "./Node";

export default class ValueNode extends Node {
  constructor(
    type: string,
    name: string,
    value: string,
    startIndex = 0,
    endIndex = 0
  ) {
    super(type, name, startIndex, endIndex);
    this.value = value;
  }

  clone() {
    return new ValueNode(
      this.type,
      this.name,
      this.value || "",
      this.startIndex,
      this.endIndex
    );
  }

  toString() {
    return this.value || "";
  }
}
