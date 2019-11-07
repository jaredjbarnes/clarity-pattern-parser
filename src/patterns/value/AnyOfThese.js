import ValuePattern from "./ValuePattern.js";
import ParseError from "../ParseError.js";
import ValueNode from "../../ast/ValueNode.js";
import Cursor from "../../Cursor.js";

export default class AnyOfThese extends ValuePattern {
  constructor(name, characters) {
    super();
    this.name = name;
    this.characters = characters;

    this.reset();
    this.assertArguments();
  }

  assertArguments() {
    if (typeof this.name !== "string") {
      throw new Error("Invalid Arguments: The name needs to be a string.");
    }

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

  getName() {
    return this.name;
  }

  parse(cursor) {
    this.reset(cursor);
    this.assertCursor();
    this.tryPattern();
    return this.node;
  }

  assertCursor() {
    if (!(this.cursor instanceof Cursor)) {
      throw new Error("Invalid Arguments: Expected a cursor.");
    }
  }

  reset(cursor) {
    if (cursor == null) {
      this.cursor = null;
      this.mark = null;
    } else {
      this.cursor = cursor;
      this.mark = this.cursor.mark();
    }

    this.node = null;
  }

  tryPattern() {
    if (this.isMatch()) {
      const value = this.cursor.getChar();
      const index = this.mark.index;

      this.node = new ValueNode(this.name, value, index, index);
      this.incrementCursor();
    } else {
      this.processError();
    }
  }

  isMatch() {
    return this.characters.indexOf(this.cursor.getChar()) > -1;
  }

  processError() {
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

  getValue() {
    return this.characters;
  }
}
