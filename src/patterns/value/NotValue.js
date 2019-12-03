import ValuePattern from "./ValuePattern.js";
import ValueNode from "../../ast/ValueNode.js";
import ParseError from "../ParseError.js";

export default class NotValue extends ValuePattern {
  constructor(name, pattern) {
    super(name, [pattern]);
    this._assertArguments();
  }

  _assertArguments() {
    if (!(this.children[0] instanceof ValuePattern)) {
      throw new Error(
        "Invalid Arguments: Expected the pattern to be a ValuePattern."
      );
    }

    if (typeof this.name !== "string") {
      throw new Error("Invalid Arguments: Expected name to be a string.");
    }
  }

  _reset(cursor) {
    this.match = "";
    this.node = null;
    this.cursor = cursor;
    this.mark = this.cursor.mark();
  }

  parse(cursor) {
    this._reset(cursor);
    this._tryPattern();

    return this.node;
  }

  _tryPattern() {
    while (true) {
      const mark = this.cursor.mark();
      this.children[0].parse(this.cursor);

      if (this.cursor.hasUnresolvedError()) {
        this.cursor.resolveError();
        this.cursor.moveToMark(mark);
        this.match += this.cursor.getChar();
        break;
      } else {
        this.cursor.moveToMark(mark);
        break;
      }
    }

    this._processMatch();
  }

  _processMatch() {
    if (this.match.length === 0) {
      const parseError = new ParseError(
        `Didn't find any characters that didn't match the ${this.children[0].name} pattern.`,
        this.mark.index,
        this
      );
      this.cursor.throwError(parseError);
    } else {
      this.node = new ValueNode(
        this.name,
        this.match,
        this.mark.index,
        this.mark.index
      );

      this.cursor.setIndex(this.node.endIndex);
    }
  }

  clone(name) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new NotValue(name, this.children[0]);
  }

  getCurrentMark() {
    return this.mark;
  }
}
