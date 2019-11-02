import ValueNode from "../ast/ValueNode.js";
import ParseError from "../ParseError.js";

export default class Either {
  constructor(name, parsers) {
    this.name = name;
    this.parsers = parsers.map(parser => parser.clone());
    this.cursor = null;
    this.index = 0;
    this.mark = null;
    this.errors = [];
    this.nodes = [];
    this.value = null;

    this.assertParsers();
  }

  assertParsers() {
    this.parsers.forEach(parser => {
      if (typeof parser.parse !== "function") {
        throw new Error(
          "Invalid Argument: An Alternation can only accept parsers."
        );
      }
    });

    if (this.parsers.length < 2) {
      throw new Error(
        "Invalid Arguments: An Alternation needs at least two options."
      );
    }
  }

  parse(cursor) {
    this.reset(cursor);
    this.tryParser();
    this.reduceValue();

    return new ValueNode(
      this.name,
      this.value,
      this.nodes[0].startIndex,
      this.nodes[this.nodes.length-1].endIndex 
    );
  }

  reset(cursor) {
    this.cursor = cursor;
    this.index = 0;
    this.mark = this.cursor.mark();
    this.errors = [];
    this.value = null;
  }

  tryParser() {
    const parser = this.parsers[this.index];

    try {
      const node = parser.parse(this.cursor);

      if (!(node instanceof ValueNode)) {
        throw new Error(
          `Invalid Arguments: 'Any Parser' expects all parsers to return a Value node, but received something else on a ${parser.name} parser.`
        );
      }

      this.nodes.push(node);

      this.index = 0;
      this.errors = [];

      if (node.endIndex !== this.cursor.lastIndex()) {
        this.mark = this.cursor.mark();
        this.tryParser();
      }
    } catch (error) {
      this.errors.push(error);

      if (this.index + 1 < this.parsers.length) {
        this.index++;
        this.cursor.moveToMark(this.mark);
        return this.tryParser();
      }

      this.throwError();
    }
  }

  throwError() {
    const furthestError = this.errors.reduce((furthestError, error) => {
      return furthestError.index > error.index ? furthestError : error;
    });

    if (furthestError != null) {
      throw furthestError;
    }
  }

  reduceValue() {
    if (this.nodes.length < 1) {
      throw new ParseError(`Couldn't find a match for ${this.name}.`);
    }

    this.value = this.nodes.map(node => node.value).join("");
  }

  clone() {
    return new Either(this.name, this.parsers);
  }
}
