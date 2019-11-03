import ValueNode from "../ast/ValueNode.js";
import ParseError from "../ParseError.js";
import CompositeNode from "../ast/CompositeNode.js";

export default class Any {
  constructor(name, parsers, options) {
    this.name = name;
    this.parsers = parsers.map(parser => parser.clone());
    this.options = options;
    this.cursor = null;
    this.index = 0;
    this.mark = null;
    this.errors = [];
    this.nodes = [];
    this.filteredNodes = [];
    this.value = null;
    this.options = options;

    this.assertParsers();
    this.recoverFromBadOptions();
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

  recoverFromBadOptions() {
    if (this.options == null) {
      this.options.isValue = false;
      this.options.isOptional = false;
    } else {
      if (typeof this.options.isValue !== "boolean") {
        this.options.isValue = false;
      }

      if (typeof this.options.isOptional !== "boolean") {
        this.options.isOptional = false;
      }
    }
  }

  parse(cursor) {
    this.reset(cursor);
    this.tryParser();
    this.reduceValue();

    return this.value;
  }

  reset(cursor) {
    this.cursor = cursor;
    this.index = 0;
    this.mark = this.cursor.mark();
    this.errors = [];
    this.nodes = [];
    this.filteredNodes = [];
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
        this.cursor.next();
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
    this.filteredNodes = this.nodes.filter(node => node != null);

    if (this.filteredNodes.length === 0) {
      if (this.options.isOptional) {
        this.cursor.moveToMark(this.mark);
        this.value = null;
        return;
      } else {
        throw new ParseError(`Couldn't find a match for ${this.name}.`);
      }
    }

    if (this.options.isValue) {
      this.value = this.filteredNodes.map(node => node.value).join("");

      this.value = new ValueNode(
        this.name,
        this.value,
        this.filteredNodes[0].startIndex,
        this.filteredNodes[this.filteredNodes.length - 1].endIndex
      );
    } else {
      this.value = new CompositeNode(
        this.name,
        this.filteredNodes[0].startIndex,
        this.filteredNodes[this.filteredNodes.length - 1].endIndex
      );

      this.value.nodes = this.filteredNodes;
    }
  }

  clone() {
    return new Any(this.name, this.parsers, this.options);
  }
}
