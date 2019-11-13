import ParseError from "../ParseError.js";
import Cursor from "../../Cursor.js";
import ValueNode from "../../ast/ValueNode.js";
import ValuePattern from "./ValuePattern.js";

export default class Literal extends ValuePattern {
  constructor(name, literal) {
    super(name);
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
    this._assertCursor();
    this._tryPattern();

    return this.node;
  }

  _reset(cursor) {
    if (cursor != null) {
      this.cursor = cursor;
      this.mark = this.cursor.mark();
      this.substring = this.cursor.string.substring(
        this.mark.index,
        this.mark.index + this.literal.length
      );
    } else {
      this.cursor = null;
      this.mark = null;
      this.substring = null;
    }

    this.node = null;
  }

  _assertCursor() {
    if (!(this.cursor instanceof Cursor)) {
      throw new Error("Invalid Arguments: Expected a cursor.");
    }
  }

  _tryPattern() {
    if (this.substring === this.literal) {
      this._processMatch();
    } else {
      this._processError();
    }
  }

  _processError() {
    const message = `ParseError: Expected '${this.literal.charAt(
      this.index
    )}' but found '${this.cursor.getChar()}' while parsing for '${this.name}'.`;

    throw new ParseError(message, this.cursor.getIndex(), this);
  }

  _processMatch() {
    this.node = new ValueNode(
      this.name,
      this.substring,
      this.mark.index,
      this.mark.index + this.literal.length - 1
    );

    this.cursor.setIndex(this.node.endIndex);
  }

  clone(name) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new Literal(name, this.literal);
  }
}
