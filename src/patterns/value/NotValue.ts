import ValuePattern from "./ValuePattern";
import ValueNode from "../../ast/ValueNode";
import ParseError from "../ParseError";
import Pattern from "../Pattern";
import Cursor from "../../Cursor";

export default class NotValue extends Pattern {
  public match: string = "";
  public node: ValueNode | null = null;
  public cursor!: Cursor;
  public mark: number = 0;

  constructor(name: string, pattern: Pattern) {
    super("not-value", name, [pattern]);
    this._assertArguments();
  }

  private _assertArguments() {
    if (!(this.children[0] instanceof Pattern)) {
      throw new Error(
        "Invalid Arguments: Expected the pattern to be a ValuePattern."
      );
    }

    if (typeof this.name !== "string") {
      throw new Error("Invalid Arguments: Expected name to be a string.");
    }
  }

  private _reset(cursor: Cursor) {
    this.match = "";
    this.node = null;
    this.cursor = cursor;
    this.mark = this.cursor.mark();
  }

  parse(cursor: Cursor) {
    this._reset(cursor);
    this._tryPattern();

    return this.node;
  }

  private _tryPattern() {
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

  private _processMatch() {
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

  clone(name: string) {
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
