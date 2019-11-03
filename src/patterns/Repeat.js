import CompositeNode from "../ast/CompositeNode.js";
import ParseError from "../ParseError.js";
import ValueNode from "../ast/ValueNode.js";

export default class Repeat {
  constructor(name, parser, options) {
    this.name = name;
    this.parser = parser.clone();
    this.options = options;
    this.cursor = null;
    this.nodes = [];
    this.value = null;

    this.assertParser();
    this.recoverFromBadOptions();
  }

  assertParser() {
    if (typeof this.parser.parse !== "function") {
      throw new Error(
        "Invalid Argument: A Repetition can only accept a parser."
      );
    }
  }

  recoverFromBadOptions() {
    if (this.options == null) {
      this.options.isValue = false;
      this.options.isOptional = false;
      this.options.dividerParser = null;
    } else {
      if (typeof this.options.isValue !== "boolean") {
        this.options.isValue = false;
      }

      if (typeof this.options.isOptional !== "boolean") {
        this.options.isOptional = false;
      }

      if (
        this.options.dividerParser != null &&
        typeof this.options.dividerParser.parse !== "function"
      ) {
        this.options.dividerParser = null;
      }
    }
  }

  parse(cursor) {
    this.reset(cursor);
    this.tryParser();
    this.createValue();

    return this.value;
  }

  reset(cursor) {
    this.cursor = cursor;
    this.nodes = [];
    this.value = null;
  }

  tryParser() {
    const mark = this.cursor.mark();

    try {
      const node = this.parser.parse(this.cursor);

      if (node == null) {
        throw new ParseError(
          `Repeat cannot have an optional parser. It will infinitely retry parsing. Change ${this.parser.name} to not be optional.`
        );
      }

      this.nodes.push(node);

      if (node.endIndex !== this.cursor.lastIndex()) {
        if (this.options.dividerParser != null) {
          this.tryDividerParser();
        }

        this.tryParser();
      }
    } catch (error) {
      if (this.nodes.length === 0) {
        if (this.options.isOptional) {
          this.value = null;
        }
        throw new ParseError(`Expected a ${this.name}.`);
      }

      this.cursor.moveToMark(mark);
    }
  }

  tryDividerParser() {
    const mark = this.cursor.mark();

    try {
      const node = this.dividerParser.parse(this.cursor);
      this.nodes.push(node);
    } catch (error) {
      this.cursor.moveToMark(mark);
    }
  }

  createValue() {
    if (this.nodes.length === 0) {
      return;
    }

    if (
      this.options.isValue &&
      this.nodes.every(node => node instanceof ValueNode)
    ) {
      this.value = new ValueNode(
        this.name,
        this.nodes.map(node => node.value).join(""),
        this.nodes[0].startIndex,
        this.nodes[this.nodes.length - 1].endIndex
      );
    } else {
      this.value = new CompositeNode(
        this.name,
        this.nodes[0].startIndex,
        this.nodes[this.nodes.length - 1].endIndex
      );
      this.value.children = this.nodes;
    }
  }

  clone() {
    return new Repeat(this.name, this.parser);
  }
}
