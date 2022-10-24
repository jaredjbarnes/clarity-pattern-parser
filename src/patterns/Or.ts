import Pattern from "./Pattern";
import ParseError from "./ParseError";
import Cursor from "../Cursor";
import Node from "../ast/Node";

export default class Or extends Pattern {
  public patternIndex: number = 0;
  public errors: ParseError[] = [];
  public node: Node | null = null;
  public cursor: Cursor | null = null;
  public mark: number = 0;
  public parseError: ParseError | null = null;

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
    this.patternIndex = 0;
    this.errors = [];
    this.node = null;
    this.cursor = cursor;
    this.mark = cursor.mark();
  }

  private safelyGetCursor() {
    const cursor = this.cursor;

    if (cursor == null) {
      throw new Error("Couldn't find cursor.");
    }
    return cursor;
  }

  parse(cursor: Cursor) {
    this.resetState(cursor);
    this.tryToParse();

    return this.node;
  }

  private tryToParse() {
    const cursor = this.safelyGetCursor();

    while (true) {
      const pattern = this._children[this.patternIndex];
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
    const isLastPattern = this.patternIndex + 1 === this._children.length;

    if (!isLastPattern) {
      this.patternIndex++;
      cursor.resolveError();
      cursor.moveToMark(this.mark);
      return false;
    } else {
      if (this._isOptional) {
        cursor.resolveError();
        cursor.moveToMark(this.mark);
      }
      this.node = null;
      return true;
    }
  }

  private processResult(node: Node) {
    const cursor = this.safelyGetCursor();

    this.node = new Node(
      "or",
      this.name,
      node.startIndex,
      node.endIndex,
      [node],
      node.value
    );

    cursor.index = this.node.endIndex;
    cursor.addMatch(this, this.node);
  }

  clone(name?: string, isOptional?: boolean) {
    if (name == null) {
      name = this.name;
    }

    if (isOptional == null) {
      isOptional = this._isOptional;
    }

    return new Or(name, this._children, isOptional);
  }

  getTokens() {
    return this._children.reduce<string[]>(
      (acc, c) => acc.concat(c.getTokens()),
      []
    );
  }
}
