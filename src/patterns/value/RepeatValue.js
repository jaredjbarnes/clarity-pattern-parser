import ValuePattern from "./ValuePattern.js";
import ValueNode from "../../ast/ValueNode";
import ParseError from "../ParseError.js";
import OptionalValue from "./OptionalValue.js";

export default class RepeatValue extends ValuePattern {
  constructor(name, pattern) {
    super();
    this.name = name;
    this.pattern = pattern.clone();
    this.patterns = [pattern];

    this.assertArguments();
    this.reset();
  }

  assertArguments() {
    if (!(this.pattern instanceof ValuePattern)) {
      throw new Error(
        "Invalid Arguments: Expected the pattern to be a ValuePattern."
      );
    }

    if (this.pattern instanceof OptionalValue) {
      throw new Error(
        "Invalid Arguments: The pattern cannot be a optional pattern."
      );
    }

    if (typeof this.name !== "string") {
      throw new Error("Invalid Arguments: Expected name to be a string.");
    }
  }

  reset(cursor) {
    this.cursor = null;
    this.mark = null;
    this.nodes = [];

    if (cursor != null) {
      this.cursor = cursor;
      this.mark = this.cursor.mark();
    }
  }

  parse(cursor) {
    this.reset(cursor);
    this.tryPattern();

    return this.node;
  }

  tryPattern() {
    while (true) {
      const mark = this.cursor.mark();

      try {
        const node = this.pattern.parse(this.cursor);
        this.nodes.push(node);

        if (node.endIndex === this.cursor.lastIndex()){
          this.processMatch();
          break;
        }
      } catch (error) {
        this.processMatch();
        this.cursor.moveToMark(mark);
        break;
      }
    }
  }

  processMatch() {
    if (this.nodes.length === 0) {
      throw new ParseError(
        `Did not find a repeating match of ${this.pattern.getName()}.`,
        this.mark.index,
        this
      );
    } else {
      const value = this.nodes.map(node => node.value).join("");

      this.node = new ValueNode(
        this.name,
        value,
        this.nodes[0].startIndex,
        this.nodes[this.nodes.length - 1].endIndex
      );
    }
  }

  getName() {
    return this.name;
  }

  getPatterns() {
    return this.patterns;
  }

  getValue() {
    return null;
  }

  clone() {
    return new RepeatValue(this.name, this.pattern);
  }
}
