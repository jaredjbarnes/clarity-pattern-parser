import Pattern from "./Pattern";
import Node from "../ast/Node";
import ParseError from "./ParseError";
import Cursor from "./Cursor";

export default class Repeat extends Pattern {
  private _pattern: Pattern;
  private _divider: Pattern;
  private _nodes: Node[] = [];
  private _cursor!: Cursor;
  private _firstIndex: number = 0;
  private _node: Node | null = null;
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

  parse(cursor: Cursor) {
    this._reset(cursor);
    this.tryToParse();

    return this._node;
  }

  private _reset(cursor: Cursor) {
    this._nodes = [];
    this._cursor = cursor;
    this._firstIndex = this._cursor.getIndex();
  }

  private tryToParse() {
    const cursor = this.safelyGetCursor();

    while (true) {
      const node = this._pattern.parse(cursor);

      if (cursor.hasUnresolvedError()) {
        this.processResult();
        break;
      } else if (node != null) {
        this._nodes.push(node);

        if (node.lastIndex === cursor.lastIndex()) {
          this.processResult();
          break;
        }

        cursor.next();

        if (this._divider != null) {
          const mark = cursor.getIndex();
          const node = this._divider.parse(cursor);

          if (cursor.hasUnresolvedError()) {
            cursor.moveTo(mark);
            this.processResult();
            break;
          } else if (node != null) {
            this._nodes.push(node);

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
    const endsOnDivider = this._nodes.length % 2 === 0;
    const noMatch = this._nodes.length === 0;
    const hasDivider = this._divider != null;

    this._cursor.resolveError();

    if ((hasDivider && endsOnDivider) || noMatch) {
      if (this._isOptional) {
        this._cursor.moveTo(this._firstIndex);
      } else {
        const parseError = new ParseError(
          `Did not find a repeating match of ${this.name}.`,
          this._firstIndex,
          this
        );
        this._cursor.throwError(parseError);
      }
      this._node = null;
    } else {
      const value = this._nodes.map((node) => node.value).join("");
      const firstIndex = this._nodes[0].firstIndex;
      const lastIndex = this._nodes[this._nodes.length - 1].lastIndex;
      const children = this._reduceAst ? [] : this._nodes;

      this._node = new Node(
        "repeat",
        this.name,
        firstIndex,
        lastIndex,
        children,
        value
      );

      this._cursor.index = this._node.lastIndex;
      this._cursor.addMatch(this, this._node);
    }
  }

  private safelyGetCursor() {
    const cursor = this._cursor;

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
