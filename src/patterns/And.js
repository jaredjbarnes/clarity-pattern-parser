import CompositeNode from "../ast/CompositeNode.js";

export default class And {
  constructor(name, parsers) {
    this.name = name;
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

    const node = new CompositeNode(
      this.name,
      nodes[0].startIndex,
      nodes[nodes.length - 1].endIndex
    );
    node.children = nodes;
    return node;
  }

  clone() {
    return new And(name, parsers);
  }
}
