import CompositeNode from "../ast/CompositeNode.js";
import ParseError from "../ParseError.js";

export default class Repetition {
  constructor(name, parser) {
    this.name = name;
    this.parser = parser.clone();
    this.cursor = null;
    this.nodes = [];
    this.compositeNode = null;

    this.assertParser();
  }

  assertParser() {
    if (typeof this.parser.parse !== "function") {
      throw new Error(
        "Invalid Argument: A Repetition can only accept a parser."
      );
    }
  }

  parse(cursor) {
    this.reset(cursor);
    this.tryParser();
    this.createCompositeNode();

    return this.compositeNode;
  }

  reset(cursor) {
    this.cursor = cursor;
    this.nodes = [];
    this.compositeNode = null;
  }

  tryParser() {
    const mark = this.cursor.mark();

    try {
      const node = this.parser.parse(this.cursor);
      this.nodes.push(node);

      if (!this.cursor.isAtEnd()){
        this.tryParser();
      }
      
    } catch (error) {
      if (this.nodes.length === 0) {
        throw new ParseError(`Expected a ${this.name}.`);
      }

      this.cursor.moveToMark(mark);
    }
  }

  createCompositeNode() {
    this.compositeNode = new CompositeNode(this.name);
    this.compositeNode.children = this.nodes;
  }

  clone() {
    return new Repetition(this.name, this.parser);
  }
}
