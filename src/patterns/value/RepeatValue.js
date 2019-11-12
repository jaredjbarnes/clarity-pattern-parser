import ValuePattern from "./ValuePattern.js";
import ValueNode from "../../ast/ValueNode.js";
import ParseError from "../ParseError.js";
import OptionalValue from "./OptionalValue.js";

export default class RepeatValue extends ValuePattern {
  constructor(name, pattern, divider) {
    super(name, divider != null ? [pattern, divider] : [pattern]);

    this._pattern = this.children[0];
    this._divider = this.children[1];

    this._assertArguments();
    this._reset();
  }

  _assertArguments() {
    if (this._pattern instanceof OptionalValue) {
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
      let mark = this.cursor.mark();

      try {
        const node = this._pattern.parse(this.cursor);
        this.nodes.push(node);

        if (node.endIndex === this.cursor.lastIndex()) {
          this._processMatch();
          break;
        }

        mark = this.cursor.mark();

        this.cursor.next();

        if (this._divider != null) {
          const mark = this.cursor.mark();
          try {
            this.nodes.push(this._divider.parse(this.cursor));
            this.cursor.next();
          } catch (error) {
            this.cursor.moveToMark(mark);
            this._processMatch();
            break;
          }
        }
      } catch (error) {
        this._processMatch();
        break;
      }
    }
  }

  _processMatch() {
    if (this.nodes.length === 0) {
      throw new ParseError(
        `Did not find a repeating match of ${this.name}.`,
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

      this.cursor.setIndex(this.node.endIndex);
    }
  }

  clone() {
    return new RepeatValue(this.name, this._pattern, this._divider);
  }
}
