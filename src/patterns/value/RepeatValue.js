import ValuePattern from "./ValuePattern.js";
import ValueNode from "../../ast/ValueNode";
import ParseError from "../ParseError.js";
import OptionalValue from "./OptionalValue.js";

export default class RepeatValue extends ValuePattern {
  constructor(name, pattern) {
    super(name, [pattern]);

    this._assertArguments();
    this._reset();
  }

  _assertArguments() {
    if (this.children[0] instanceof OptionalValue) {
      throw new Error(
        "Invalid Arguments: The pattern cannot be a optional pattern."
      );
    }
  }

  _reset(cursor) {
    this.cursor = null;
    this.mark = null;
    this.nodes = [];

    if (cursor != null) {
      this.cursor = cursor;
      this.mark = this.cursor.mark();
    }
  }

  parse(cursor) {
    this._reset(cursor);
    this._tryPattern();

    return this.node;
  }

  _tryPattern() {
    while (true) {
      const mark = this.cursor.mark();

      try {
        const node = this.children[0].parse(this.cursor);
        this.nodes.push(node);

        if (node.endIndex === this.cursor.lastIndex()){
          this._processMatch();
          break;
        }
      } catch (error) {
        this._processMatch();
        this.cursor.moveToMark(mark);
        break;
      }
    }
  }

  _processMatch() {
    if (this.nodes.length === 0) {
      throw new ParseError(
        `Did not find a repeating match of ${this.children[0].name}.`,
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

  clone() {
    return new RepeatValue(this.name, this.children[0]);
  }
}
