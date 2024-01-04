import ParseError from "../patterns/ParseError";
import Cursor from "./Cursor";
import Pattern from "./Pattern";
import Node from "../ast/Node";

export default class And extends Pattern {
  private _onPatternIndex: number = 0;
  private _nodes: (Node | null)[] = [];
  private _node: Node | null = null;
  private _cursor: Cursor | null = null;
  private _firstIndex: number = 0;
  private _reduceAst = false;

  constructor(name: string, patterns: Pattern[], isOptional = false) {
    super("and", name, patterns, isOptional);
  }

  parse(cursor: Cursor) {
    this.resetState(cursor);
    this.tryToParse();

    return this._node;
  }

  private resetState(cursor: Cursor) {
    this._onPatternIndex = 0;
    this._nodes = [];
    this._node = null;
    this._cursor = cursor;
    this._firstIndex = this._cursor.getIndex();
  }

  private tryToParse() {
    const cursor = this.safelyGetCursor();

    while (true) {
      const pattern = this._children[this._onPatternIndex];
      const node = pattern.parse(cursor);

      if (cursor.hasUnresolvedError()) {
        this.processError();
        break;
      } else {
        this._nodes.push(node);
      }

      if (!this.shouldProceed()) {
        this.processResult();
        break;
      }
    }
  }

  private safelyGetCursor() {
    const cursor = this._cursor;

    if (cursor == null) {
      throw new Error("Couldn't find cursor.");
    }
    return cursor;
  }

  private processResult() {
    const cursor = this.safelyGetCursor();

    if (cursor.hasUnresolvedError()) {
      this.processError();
    } else {
      this.processSuccess();
    }
  }

  private processError() {
    const cursor = this.safelyGetCursor();

    if (this.isOptional) {
      cursor.moveTo(this._firstIndex);
      cursor.resolveError();
    }
    this._node = null;
  }

  private shouldProceed() {
    const cursor = this.safelyGetCursor();

    if (this.hasMorePatterns()) {
      const lastNode = this._nodes[this._nodes.length - 1];
      const wasOptional = lastNode == null;

      if (cursor.hasNext()) {
        if (!wasOptional) {
          cursor.next();
        }

        this._onPatternIndex++;
        return true;
      } else if (wasOptional) {
        this._onPatternIndex++;
        return true;
      }

      this.assertRestOfPatternsAreOptional();
      return false;
    } else {
      return false;
    }
  }

  private hasMorePatterns() {
    return this._onPatternIndex + 1 < this._children.length;
  }

  private assertRestOfPatternsAreOptional() {
    const cursor = this.safelyGetCursor();
    const areTheRestOptional = this.areTheRemainingPatternsOptional();

    if (!areTheRestOptional) {
      const parseError = new ParseError(
        `Could not match ${this.name} before string ran out.`,
        this._onPatternIndex,
        this
      );

      cursor.throwError(parseError);
    }
  }

  private areTheRemainingPatternsOptional() {
    return this.children
      .slice(this._onPatternIndex + 1)
      .map((p) => p.isOptional)
      .every((r) => r);
  }

  private processSuccess() {
    const cursor = this.safelyGetCursor();
    const nodes = this._nodes.filter((node) => node != null) as Node[];
    this._nodes = nodes;

    const lastNode = nodes[this._nodes.length - 1];
    const startIndex = this._firstIndex;
    const endIndex = lastNode.lastIndex;
    const value = nodes.map((node) => node.value).join("");

    const children = this._reduceAst ? [] : nodes;
    this._node = new Node(
      "and",
      this.name,
      startIndex,
      endIndex,
      children,
      value
    );

    cursor.index = this._node.lastIndex;
    cursor.addMatch(this, this._node);
  }

  clone(name?: string, isOptional?: boolean) {
    if (name == null) {
      name = this.name;
    }

    if (isOptional == null) {
      isOptional = this._isOptional;
    }

    return new And(name, this._children, isOptional);
  }

  getTokens() {
    let tokens: string[] = [];

    for (let x = 0; x < this._children.length; x++) {
      const child = this._children[x];

      if (child.isOptional) {
        tokens = tokens.concat(child.getTokens());
      } else {
        tokens = tokens.concat(child.getTokens());
        break;
      }
    }

    return tokens;
  }

  getNextTokens(reference: Pattern): string[] {
    let nextSibling: Pattern | null = null;
    let nextSiblingIndex = -1;
    let index = -1;
    const tokens: string[] = [];

    for (let i = 0; i < this._children.length; i++) {
      const child = this._children[i];
      if (child === reference) {
        if (i + 1 < this._children.length) {
          nextSibling = this._children[i + 1];
        }
        nextSiblingIndex = i + 1;
        index = i;
        break;
      }
    }

    // If the last match isn't a child of this pattern.
    if (index === -1) {
      return [];
    }

    // If the last match was on our last child, then go to the next pattern.
    if (nextSiblingIndex === this._children.length && this._parent != null) {
      return this._parent.getNextTokens(this);
    }

    // If the next child isn't optional then send back those options.
    if (nextSibling != null && !nextSibling.isOptional) {
      return nextSibling.getTokens();
    }

    // We can accumulate all the optional patterns that are consecutive here.
    if (nextSibling != null && nextSibling.isOptional) {
      for (let i = nextSiblingIndex; i < this._children.length; i++) {
        const child = this._children[i];
        const parent = this._parent;
        tokens.push(...child.getTokens());

        if (!child.isOptional) {
          break;
        }

        if (i === this._children.length - 1 && parent != null) {
          tokens.push(...parent.getNextTokens(this));
        }
      }
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
