import Pattern from "./Pattern";
import ParseError from "./ParseError";
import Cursor from "./Cursor";
import Node from "../ast/Node";

export default class Or extends Pattern {
  private _patternIndex: number = 0;
  private _node: Node | null = null;
  private _cursor: Cursor | null = null;
  private _firstIndex: number = 0;
  private _reduceAst = false;

  constructor(name: string, patterns: Pattern[], isOptional = false) {
    super("or", name, patterns, isOptional);
    this.assertArguments();
  }

  private assertArguments() {
    if (this._children.length < 2) {
      throw new Error(
        "Invalid Argument: OrValue needs to have more than one value pattern."
      );
    }

    const hasOptionalChildren = this._children.some(
      (pattern) => pattern.isOptional
    );

    if (hasOptionalChildren) {
      throw new Error("OrValues cannot have optional patterns.");
    }
  }

  private resetState(cursor: Cursor) {
    this._patternIndex = 0;
    this._node = null;
    this._cursor = cursor;
    this._firstIndex = cursor.getIndex();
  }

  private safelyGetCursor() {
    const cursor = this._cursor;

    if (cursor == null) {
      throw new Error("Couldn't find cursor.");
    }
    return cursor;
  }

  parse(cursor: Cursor) {
    this.resetState(cursor);
    this.tryToParse();

    return this._node;
  }

  private tryToParse() {
    const cursor = this.safelyGetCursor();

    while (true) {
      const pattern = this._children[this._patternIndex];
      const node = pattern.parse(cursor);
      const hasError = cursor.hasUnresolvedError();

      if (hasError) {
        const shouldBreak = this.processError();
        if (shouldBreak) {
          break;
        }
      } else if (node != null) {
        this.processResult(node);
        break;
      }
    }
  }

  private processError() {
    const cursor = this.safelyGetCursor();
    const isLastPattern = this._patternIndex + 1 === this._children.length;

    if (!isLastPattern) {
      this._patternIndex++;
      cursor.resolveError();
      cursor.moveTo(this._firstIndex);
      return false;
    } else {
      if (this._isOptional) {
        cursor.resolveError();
        cursor.moveTo(this._firstIndex);
      }
      this._node = null;
      return true;
    }
  }

  private processResult(node: Node) {
    const cursor = this.safelyGetCursor();
    const children = [];

    if (!this._reduceAst) {
      children.push(node);
    }

    this._node = new Node(
      "or",
      this.name,
      node.firstIndex,
      node.lastIndex,
      children,
      node.value
    );

    cursor.index = this._node.lastIndex;
    cursor.addMatch(this, this._node);
  }

  clone(name = this._name, isOptional = this._isOptional) {
    const pattern = new Or(name, this._children, isOptional);
    pattern._reduceAst = this._reduceAst;
    return pattern;
  }

  getTokens() {
    return this._children.reduce<string[]>(
      (acc, c) => acc.concat(c.getTokens()),
      []
    );
  }

  getNextTokens(reference: Pattern): string[] {
    const parent = this._parent;
    if (parent == null) {
      return [];
    }

    return parent.getNextTokens(this);
  }

  reduceAst() {
    this._reduceAst = true;
  }

  expandAst() {
    this._reduceAst = false;
  }
}
