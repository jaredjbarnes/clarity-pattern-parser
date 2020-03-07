import Node from "./Node.js";

export default class ValueNode extends Node {
  constructor(type, name, value, startIndex = 0, endIndex = 0) {
    super(type, name, startIndex, endIndex);
    this.value = value;
  }

  clone() {
    return new ValueNode(this.type, this.name, this.value, this.startIndex, this.endIndex);
  }

  filter(isMatch, context){
    const match = isMatch(this, context);

    if (match){
      return [this];
    }

    return [];
  }

  toString(){
    return this.value;
  }
}
