import ParseError from "../ParseError.js";
import Cursor from "../../Cursor.js";
import ValueNode from "../../ast/ValueNode.js";
import ValuePattern from "./ValuePattern.js";

export default class Literal extends ValuePattern {
  constructor(name, literal) {
    super(name);
    this.literal = literal;

    this._reset(null);
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
    } else {
      this.cursor = null;
      this.mark = null;
    }

    this.index = 0;
    this.match = "";
    this.node = null;
  }

  _assertCursor() {
    if (!(this.cursor instanceof Cursor)) {
      throw new Error("Invalid Arguments: Expected a cursor.");
    }
  }

  _tryPattern() {
    if (this._doesCharacterMatch()) {
      this._processCharacterMatch();
    } else {
      this._processError();
    }
  }

  _doesCharacterMatch() {
    return this.literal.charAt(this.index) === this.cursor.getChar();
  }

  _processCharacterMatch() {
    this._saveMatch();

    if (this._isComplete()) {
      this.node = new ValueNode(
        this.name,
        this.literal,
        this.mark.index,
        this.cursor.getIndex()
      );

      this._incrementIndex();
    } else {
      this._incrementIndex();
      this._tryPattern();
    }
  }

  _saveMatch() {
    this.match += this.cursor.getChar();
  }

  _isComplete() {
    return this.match === this.literal;
  }

  _incrementIndex() {
    if (this.cursor.hasNext()) {
      this.cursor.next();
      this.index++;
    }
  }

  _processError() {
    const message = `ParseError: Expected '${this.literal.charAt(
      this.index
    )}' but found '${this.cursor.getChar()}' while parsing for '${this.name}'.`;

    throw new ParseError(message, this.cursor.getIndex(), this);
  }

  clone() {
    return new Literal(this.name, this.literal);
  }

}
