import ValuePattern from "./ValuePattern.js";
import ValueNode from "../../ast/ValueNode.js";
import ParseError from "../ParseError.js";

export default class NotValue extends ValuePattern {
  constructor(name, pattern) {
    super(name, [pattern]);
    this._assertArguments();
    this._reset();
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

  _reset(cursor, parseError) {
    this.cursor = null;
    this.mark = null;
    this.match = "";
    this.node = null;
    this.parseError = parseError;

    if (cursor != null) {
      this.cursor = cursor;
      this.mark = this.cursor.mark();
    }

    if (parseError == null) {
      this.parseError = new ParseError();
    }
  }

  parse(cursor, parseError) {
    this._reset(cursor, parseError);
    this._tryPattern();

    return this.node;
  }

  _tryPattern() {
    while (true) {
      const mark = this.cursor.mark();

      try {
        this.children[0].parse(this.cursor, this.parseError);
        this.cursor.moveToMark(mark);
        break;
      } catch (error) {
        this.cursor.moveToMark(mark);
        this.match += this.cursor.getChar();
        break;
      }
    }

    this._processMatch();
  }

  _processMatch() {
    if (this.match.length === 0) {
      this.parserError.message = `Didn't find any characters the didn't match the ${this.children[0].name} pattern.`;
      this.parseError.index = this.mark.index;
      this.parserError.pattern = this;

      throw this.parseError;
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
