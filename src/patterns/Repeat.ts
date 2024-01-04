import Pattern from "./Pattern";
import Node from "../ast/Node";
import ParseError from "./ParseError";
import Cursor from "./Cursor";

export default class Repeat extends Pattern {
  public _pattern: Pattern;
  public _divider: Pattern;
  public nodes: Node[] = [];
  public cursor!: Cursor;
  public mark: number = 0;
  public node: Node | null = null;
  private _reduceAst = false;

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

        if (node.lastIndex === cursor.lastIndex()) {
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

            if (node.lastIndex === cursor.lastIndex()) {
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
      } else {
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
      const firstIndex = this.nodes[0].firstIndex;
      const lastIndex = this.nodes[this.nodes.length - 1].lastIndex;
      const children = this._reduceAst ? [] : this.nodes;

      this.node = new Node(
        "repeat",
        this.name,
        firstIndex,
        lastIndex,
        children,
        value
      );

      this.cursor.index = this.node.lastIndex;
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

  clone(name = this._name, isOptional = this._isOptional) {
    const pattern = new Repeat(name, this._pattern, this._divider, isOptional);
    pattern._reduceAst = this._reduceAst;
    return pattern;
  }

  getTokens() {
    return this._pattern.getTokens();
  }

  getNextTokens(reference: Pattern): string[] {
    let index = -1;
    const tokens: string[] = [];
    const parent = this._parent;

    for (let i = 0; i < this._children.length; i++) {
      const child = this._children[i];
      if (child == reference) {
        index = i;
      }
    }

    // If the last match isn't a child of this pattern.
    if (index === -1) {
      return [];
    }

    // If the last match was the repeated patterns, then suggest the divider.
    if (index === 0 && this._divider != null) {
      tokens.push(...this.children[1].getTokens());

      if (parent != null) {
        tokens.push(...parent.getNextTokens(this));
      }
    }

    if (index === 1) {
      // Suggest the pattern because the divider was the last match.
      tokens.push(...this._children[0].getTokens());
    }

    if (index === 0 && this._divider == null && parent != null) {
      tokens.push(...parent.getNextTokens(this));
    }

    return tokens;
  }

  shouldReduceAst() {
    this._reduceAst = true;
  }

  shouldNotReduceAst() {
    this._reduceAst = false;
  }
}
