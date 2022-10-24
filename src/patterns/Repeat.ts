import Pattern from "./Pattern";
import Node from "../ast/Node";
import ParseError from "./ParseError";
import Cursor from "../Cursor";

export default class Repeat extends Pattern {
  public _pattern: Pattern;
  public _divider: Pattern;
  public nodes: Node[] = [];
  public cursor!: Cursor;
  public mark: number = 0;
  public node: Node | null = null;

  constructor(
    name: string,
    pattern: Pattern,
    divider?: Pattern,
    isOptional = false
  ) {
    super(
      "repeat",
      name,
      divider != null ? [pattern, divider] : [pattern],
      isOptional
    );

    this._pattern = this.children[0];
    this._divider = this.children[1];
    this.assertArguments();
  }

  private assertArguments() {
    if (this._pattern.isOptional) {
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
    this.tryToParse();

    return this.node;
  }

  private tryToParse() {
    const cursor = this.safelyGetCursor();

    while (true) {
      const node = this._pattern.parse(cursor);

      if (cursor.hasUnresolvedError()) {
        this.processResult();
        break;
      } else if (node != null) {
        this.nodes.push(node);

        if (node.endIndex === cursor.lastIndex()) {
          this.processResult();
          break;
        }

        cursor.next();

        if (this._divider != null) {
          const mark = cursor.mark();
          const node = this._divider.parse(cursor);

          if (cursor.hasUnresolvedError()) {
            cursor.moveToMark(mark);
            this.processResult();
            break;
          } else if (node != null) {
            this.nodes.push(node);

            if (node.endIndex === cursor.lastIndex()) {
              this.processResult();
              break;
            }

            cursor.next();
          }
        }
      }
    }
  }

  private processResult() {
    const endsOnDivider = this.nodes.length % 2 === 0;
    const noMatch = this.nodes.length === 0;
    const hasDivider = this._divider != null;

    this.cursor.resolveError();

    if ((hasDivider && endsOnDivider) || noMatch) {
      if (this._isOptional) {
        this.cursor.moveToMark(this.mark);
      } else  {
        const parseError = new ParseError(
          `Did not find a repeating match of ${this.name}.`,
          this.mark,
          this
        );
        this.cursor.throwError(parseError);
      }
      this.node = null;
    } else {
      const value = this.nodes.map((node) => node.value).join("");

      this.node = new Node(
        "repeat",
        this.name,
        this.nodes[0].startIndex,
        this.nodes[this.nodes.length - 1].endIndex,
        this.nodes,
        value
      );

      this.cursor.index = this.node.endIndex;
      this.cursor.addMatch(this, this.node);
    }
  }

  private safelyGetCursor() {
    const cursor = this.cursor;

    if (cursor == null) {
      throw new Error("Couldn't find cursor.");
    }
    return cursor;
  }

  clone(name?: string, isOptional?: boolean) {
    if (name == null) {
      name = this.name;
    }

    if (isOptional == null) {
      isOptional = this._isOptional;
    }

    return new Repeat(name, this._pattern, this._divider, isOptional);
  }

  getTokens() {
    return this._pattern.getTokens();
  }
}
