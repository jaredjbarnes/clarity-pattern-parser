import ValuePattern from "./ValuePattern";
import ValueNode from "../../ast/ValueNode";
import ParseError from "../ParseError";
import OptionalValue from "./OptionalValue";
import Pattern from "../Pattern";
import Cursor from "../../Cursor";

export default class RepeatValue extends ValuePattern {
  public _pattern: ValuePattern;
  public _divider: ValuePattern;
  public nodes: ValueNode[] = [];
  public cursor!: Cursor;
  public mark: number = 0;
  public node: ValueNode | null = null;

  constructor(name: string, pattern: ValuePattern, divider?: ValuePattern) {
    super(
      "repeat-value",
      name,
      divider != null ? [pattern, divider] : [pattern]
    );

    this._pattern = this.children[0] as ValuePattern;
    this._divider = this.children[1] as ValuePattern;

    this._assertArguments();
  }

  private _assertArguments() {
    if (this._pattern instanceof OptionalValue) {
      throw new Error(
        "Invalid Arguments: The pattern cannot be a optional pattern."
      );
    }
  }

  private _reset(cursor: Cursor) {
    this.nodes = [];
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
      const node = this._pattern.parse(this.cursor) as ValueNode;

      if (this.cursor.hasUnresolvedError()) {
        this._processMatch();
        break;
      } else {
        this.nodes.push(node);

        if (node.endIndex === this.cursor.lastIndex()) {
          this._processMatch();
          break;
        }

        this.cursor.next();

        if (this._divider != null) {
          const mark = this.cursor.mark();
          const node = this._divider.parse(this.cursor) as ValueNode;

          if (this.cursor.hasUnresolvedError()) {
            this.cursor.moveToMark(mark);
            this._processMatch();
            break;
          } else {
            this.nodes.push(node);

            if (node.endIndex === this.cursor.lastIndex()) {
              this._processMatch();
              break;
            }

            this.cursor.next();
          }
        }
      }
    }
  }

  private _processMatch() {
    const endsOnDivider = this.nodes.length % 2 === 0;
    const noMatch = this.nodes.length === 0;
    const hasDivider = this._divider != null;

    this.cursor.resolveError();

    if ((hasDivider && endsOnDivider) || noMatch) {
      const parseError = new ParseError(
        `Did not find a repeating match of ${this.name}.`,
        this.mark,
        this
      );
      this.cursor.throwError(parseError);
      this.node = null;
    } else {
      const value = this.nodes.map((node) => node.value).join("");

      this.node = new ValueNode(
        "repeat-value",
        this.name,
        value,
        this.nodes[0].startIndex,
        this.nodes[this.nodes.length - 1].endIndex
      );

      this.cursor.index = this.node.endIndex;
      this.cursor.addMatch(this, this.node);
    }
  }

  clone(name?: string) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new RepeatValue(name, this._pattern, this._divider);
  }

  getTokens() {
    return this._pattern.getTokens();
  }
}
