import ParseError from "../ParseError.js";
import ValueNode from "../../ast/ValueNode.js";
import ValuePattern from "./ValuePattern.js";

export default class Literal extends ValuePattern {
  constructor(name, literal) {
    super("literal", name);
    this.literal = literal;
    this._assertArguments();
  }

  _assertArguments() {
    if (typeof this.literal !== "string") {
      throw new Error(
        "Invalid Arguments: The literal argument needs to be a string of characters."
      );
    }

    if (this.literal.length < 1) {
      throw new Error(
        "Invalid Arguments: The literalString argument needs to be at least one character long."
      );
    }
  }

  parse(cursor) {
    this._reset(cursor);
    this._tryPattern();

    return this.node;
  }

  _reset(cursor) {
    this.cursor = cursor;
    this.mark = this.cursor.mark();
    this.substring = this.cursor.string.substring(
      this.mark,
      this.mark + this.literal.length
    );
    this.node = null;
  }

  _tryPattern() {
    if (this.substring === this.literal) {
      this._processMatch();
    } else {
      this._processError();
    }
  }

  _processError() {
    const message = `ParseError: Expected '${this.literal}' but found '${this.substring}'.`;

    const parseError = new ParseError(message, this.cursor.getIndex(), this);
    this.cursor.throwError(parseError);
  }

  _processMatch() {
    this.node = new ValueNode(
      "literal",
      this.name,
      this.substring,
      this.mark,
      this.mark + this.literal.length - 1
    );

    this.cursor.index = this.node.endIndex;
    this.cursor.addMatch(this, this.node);
  }

  clone(name) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new Literal(name, this.literal);
  }

  getCurrentMark() {
    return this.mark;
  }

  getPossibilities() {
    return [this.literal];
  }
}
