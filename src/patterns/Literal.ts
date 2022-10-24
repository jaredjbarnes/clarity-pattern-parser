import ParseError from "./ParseError";
import Node from "../ast/Node";
import Pattern from "./Pattern";
import Cursor from "../Cursor";

export default class Literal extends Pattern {
  public literal: string;
  public node: Node | null = null;
  public cursor!: Cursor;
  public mark: number = 0;
  public substring: string = "";

  constructor(name: string, literal: string, isOptional = false) {
    super("literal", name, [], isOptional);
    this.literal = literal;
    this.assertArguments();
  }

  parse(cursor: Cursor) {
    this.resetState(cursor);
    this.tryToParse();

    return this.node;
  }

  clone(name?: string, isOptional?: boolean) {
    if (name == null) {
      name = this.name;
    }

    if (isOptional == null) {
      isOptional = this._isOptional;
    }
    
    return new Literal(name, this.literal, isOptional);
  }

  getTokens() {
    return [this.literal];
  }

  private assertArguments() {
    if (this.literal.length < 1) {
      throw new Error(
        "Invalid Arguments: The `literal` argument needs to be at least one character long."
      );
    }
  }

  private resetState(cursor: Cursor) {
    this.cursor = cursor;
    this.mark = this.cursor.mark();
    this.substring = this.cursor.text.substring(
      this.mark,
      this.mark + this.literal.length
    );
    this.node = null;
  }

  private tryToParse() {
    if (this.substring === this.literal) {
      this.processResult();
    } else {
      this.processError();
    }
  }

  private processError() {
    this.node = null;

    if (!this._isOptional) {
      const message = `ParseError: Expected '${this.literal}' but found '${this.substring}'.`;
      const parseError = new ParseError(message, this.cursor.getIndex(), this);
      this.cursor.throwError(parseError);
    }
  }

  private processResult() {
    this.node = new Node(
      "literal",
      this.name,
      this.mark,
      this.mark + this.literal.length - 1,
      [],
      this.substring
    );

    this.cursor.index = this.node.endIndex;
    this.cursor.addMatch(this, this.node);
  }
}
