import ParseError from "./ParseError.js";
import Cursor from "../Cursor.js";
import ValueNode from "../ast/ValueNode.js";
import ValuePattern from "./ValuePattern.js";

export default class Literal extends ValuePattern {
  constructor(name, literalString) {
    super();

    this.name = name;
    this.literal = literalString;

    this.reset(null);
    this.assertArguments();
  }

  assertArguments() {
    if (typeof this.name !== "string") {
      throw new Error("Invalid Arguments: The name needs to be a string.");
    }

    if (typeof this.literal !== "string") {
      throw new Error(
        "Invalid Arguments: The literalString argument needs to be a string of characters."
      );
    }

    if (this.literal.length < 1) {
      throw new Error(
        "Invalid Arguments: The literalString argument needs to be at least one character long."
      );
    }
  }

  getName() {
    return this.name;
  }

  parse(cursor) {
    this.reset(cursor);
    this.assertCursor();
    this.tryParse();

    return this.node;
  }

  reset(cursor) {
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

  assertCursor() {
    if (!(this.cursor instanceof Cursor)) {
      throw new ParseError("Invalid Arguments: Expected a cursor.");
    }
  }

  tryParse() {
    if (this.doesCharacterMatch()) {
      this.processCharacterMatch();
    } else {
      this.processError();
    }
  }

  doesCharacterMatch() {
    return this.literal.charAt(this.index) === this.cursor.getChar();
  }

  processCharacterMatch() {
    this.saveMatch();

    if (this.isComplete()) {
      this.node = new ValueNode(
        this.name,
        this.literal,
        this.mark.index,
        this.cursor.getIndex()
      );

      this.incrementIndex();
    } else {
      this.incrementIndex();
      this.tryParse();
    }
  }

  saveMatch() {
    this.match += this.cursor.getChar();
  }

  isComplete() {
    return this.match === this.literal;
  }

  incrementIndex() {
    if (this.cursor.hasNext()) {
      this.cursor.next();
      this.index++;
    }
  }

  processError() {
    const message = `ParseError: Expected '${this.literal.charAt(
      this.index
    )}' but found '${this.cursor.getChar()}' while parsing for '${this.name}'.`;

    throw new ParseError(message, this.cursor.getIndex());
  }

  clone() {
    return new Literal(this.name, this.literal);
  }

  getValue() {
    return this.literal;
  }
}
