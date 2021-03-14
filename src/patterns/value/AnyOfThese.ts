import ValuePattern from "./ValuePattern";
import ParseError from "../ParseError";
import ValueNode from "../../ast/ValueNode";
import Pattern from "../Pattern";
import Cursor from "../../Cursor";

export default class AnyOfThese extends ValuePattern {
  public characters: string;
  public node: ValueNode;
  public cursor: Cursor;
  public mark: number;

  constructor(name: string, characters: string) {
    super("any-of-these", name);
    this.characters = characters;
    this._assertArguments();
  }

  private _assertArguments() {
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

  parse(cursor: Cursor) {
    this._reset(cursor);
    this._tryPattern();
    return this.node;
  }

  private _reset(cursor: Cursor) {
    this.cursor = cursor;
    this.mark = this.cursor.mark();
    this.node = null;
  }

  private _tryPattern() {
    if (this._isMatch()) {
      const value = this.cursor.getChar();
      const index = this.cursor.getIndex();

      this.node = new ValueNode("any-of-these", this.name, value, index, index);

      this.cursor.addMatch(this, this.node);
    } else {
      this._processError();
    }
  }

  private _isMatch() {
    return this.characters.indexOf(this.cursor.getChar()) > -1;
  }

  private _processError() {
    const message = `ParseError: Expected one of these characters, '${
      this.characters
    }' but found '${this.cursor.getChar()}' while parsing for '${this.name}'.`;

    const parseError = new ParseError(message, this.cursor.getIndex(), this);
    this.cursor.throwError(parseError);
  }

  clone(name?: string) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new AnyOfThese(name, this.characters);
  }

  getPossibilities(rootPattern?: Pattern) {
    if (rootPattern == null || !(rootPattern instanceof Pattern)) {
      rootPattern = this;
    }

    return this.getTokens();
  }

  getTokens() {
    return this.characters.split("");
  }
}
