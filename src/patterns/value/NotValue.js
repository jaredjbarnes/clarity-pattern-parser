import ValuePattern from "./ValuePattern.js";
import ValueNode from "../../ast/ValueNode.js";
import ParseError from "../ParseError.js";
import Pattern from "../Pattern.js";

export default class NotValue extends Pattern {
  constructor(name, pattern) {
    super("not-value", name, [pattern]);
  }

  _assertChildren() {
    if (!(this.children[0] instanceof Pattern)) {
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
        this.mark,
        this
      );
      this.cursor.throwError(parseError);
    } else {
      this.node = new ValueNode(
        "not-value",
        this.name,
        this.match,
        this.mark,
        this.mark
      );

      this.cursor.index = this.node.endIndex;
      this.cursor.addMatch(this, this.node);
    }
  }

  clone(name) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new NotValue(name, this.children[0]);
  }

  getPossibilities() {
    return [];
  }

  getTokens() {
    return [];
  }
}
