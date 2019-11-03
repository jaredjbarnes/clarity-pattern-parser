import CompositeNode from "../ast/CompositeNode.js";
import ValueNode from "../ast/ValueNode.js";

export default class And {
  constructor(name, parsers, isValue = false) {
    this.name = name;
    this.isValue = isValue;
    this.parsers = parsers.map(parser => parser.clone());

    this.assertParsers();
  }

  assertParsers() {
    this.parsers.forEach(parser => {
      if (typeof parser.parse !== "function") {
        throw new Error(
          "Invalid Argument: A Sequence can only accept parsers."
        );
      }
    });

    if (this.parsers.length < 2) {
      throw new Error(
        "Invalid Arguments: A Sequence needs at least two options."
      );
    }
  }

  parse(cursor) {
    const nodes = [];

    for (let x = 0; x < this.parsers.length; x++) {
      nodes.push(this.parsers[x].parse(cursor));
    }

    // If all nodes that match are ValueNodes than we reduce them into one Value node.
    // This is a design decision that I'm still unsure about. However, I think it may be beneificial.
    if (this.isValue && nodes.every(node=>node instanceof ValueNode)){
      const value = nodes.map(node=>node.value).join("");
      return new ValueNode(this.name, value, nodes[0].startIndex, nodes[nodes.length - 1].endIndex);
    }

    const node = new CompositeNode(
      this.name,
      nodes[0].startIndex,
      nodes[nodes.length - 1].endIndex
    );
    node.children = nodes;
    return node;
  }

  clone() {
    return new And(this.name, this.parsers);
  }
}
