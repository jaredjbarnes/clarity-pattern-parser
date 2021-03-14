import ParseError from "../ParseError";
import ValueNode from "../../ast/ValueNode";
import ValuePattern from "./ValuePattern";
import Cursor from "../../Cursor";

export default class Literal extends ValuePattern {
	public literal: string;
	public node: ValueNode;
	public cursor: Cursor;
	public mark: number;
	public substring: string;

  constructor(name: string, literal: string) {
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

  parse(cursor: Cursor) {
    this._reset(cursor);
    this._tryPattern();

    return this.node;
  }

  _reset(cursor: Cursor) {
    this.cursor = cursor;
    this.mark = this.cursor.mark();
    this.substring = this.cursor.text.substring(
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

  clone(name?: string) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new Literal(name, this.literal);
  }

  getPossibilities() {
    return [this.getTokenValue()];
  }

  getTokenValue() {
    return this.literal;
  }

  getTokens() {
    return [this.getTokenValue()];
  }
}
