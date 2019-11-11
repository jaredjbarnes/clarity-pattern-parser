import ValuePattern from "./ValuePattern.js";
import ParseError from "../ParseError.js";
import ValueNode from "../../ast/ValueNode.js";
import Cursor from "../../Cursor.js";

export default class AnyOfThese extends ValuePattern {
  constructor(name, characters) {
    super(name);
    this.characters = characters;

    this._reset();
    this._assertArguments();
  }

  _assertArguments() {
    if (typeof this.characters !== "string") {
      throw new Error(
        "Invalid Arguments: The characters argument needs to be a string of characters."
      );
    }

    if (this.characters.length < 1) {
      throw new Error(
        "Invalid Arguments: The characters argument needs to be at least one character long."
      );
    }
  }

  parse(cursor) {
    this._reset(cursor);
    this._assertCursor();
    this._tryPattern();
    return this.node;
  }

  _assertCursor() {
    if (!(this.cursor instanceof Cursor)) {
      throw new Error("Invalid Arguments: Expected a cursor.");
    }
  }

  _reset(cursor) {
    if (cursor == null) {
      this.cursor = null;
      this.mark = null;
    } else {
      this.cursor = cursor;
      this.mark = this.cursor.mark();
    }

    this.node = null;
  }

  _tryPattern() {
    if (this._isMatch()) {
      const value = this.cursor.getChar();
      const index = this.cursor.getIndex();

      this.node = new ValueNode(this.name, value, index, index);
      this.incrementCursor();
    } else {
      this._processError();
    }
  }

  _isMatch() {
    return this.characters.indexOf(this.cursor.getChar()) > -1;
  }

  _processError() {
    const message = `ParseError: Expected one of these characters, '${
      this.characters
    }' but found '${this.cursor.getChar()}' while parsing for '${this.name}'.`;

    throw new ParseError(message, this.cursor.getIndex(), this);
  }

  incrementCursor() {
    if (this.cursor.hasNext()) {
      this.cursor.next();
    }
  }

  clone() {
    return new AnyOfThese(this.name, this.characters);
  }

}
