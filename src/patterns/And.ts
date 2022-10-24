import ParseError from "../patterns/ParseError";
import Cursor from "../Cursor";
import Pattern from "./Pattern";
import Node from "../ast/Node";

export default class And extends Pattern {
  public onPatternIndex: number = 0;
  public nodes: (Node | null)[] = [];
  public node: Node | null = null;
  public cursor: Cursor | null = null;
  public mark: number = 0;

  constructor(name: string, patterns: Pattern[], isOptional = false) {
    super("and", name, patterns, isOptional);
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

    if (isOptional == null){
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

  private resetState(cursor: Cursor) {
    this.onPatternIndex = 0;
    this.nodes = [];
    this.node = null;
    this.cursor = cursor;
    this.mark = this.cursor.mark();
  }

  private tryToParse() {
    const cursor = this.safelyGetCursor();

    while (true) {
      const pattern = this._children[this.onPatternIndex];
      const node = pattern.parse(cursor);

      if (cursor.hasUnresolvedError()) {
        this.processError();
        break;
      } else {
        this.nodes.push(node);
      }

      if (!this.shouldProceed()) {
        this.processResult();
        break;
      }
    }
  }

  private safelyGetCursor() {
    const cursor = this.cursor;

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
      cursor.moveToMark(this.mark);
      cursor.resolveError();
    }
    this.node = null;
  }

  private shouldProceed() {
    const cursor = this.safelyGetCursor();

    if (this.hasMorePatterns()) {
      const lastNode = this.nodes[this.nodes.length - 1];
      const wasOptional = lastNode == null;

      if (cursor.hasNext()) {
        if (!wasOptional) {
          cursor.next();
        }

        this.onPatternIndex++;
        return true;
      } else if (wasOptional) {
        this.onPatternIndex++;
        return true;
      }

      this.assertRestOfPatternsAreOptional();
      return false;
    } else {
      return false;
    }
  }

  private hasMorePatterns() {
    return this.onPatternIndex + 1 < this._children.length;
  }

  private assertRestOfPatternsAreOptional() {
    const cursor = this.safelyGetCursor();
    const areTheRestOptional = this.areTheRemainingPatternsOptional();

    if (!areTheRestOptional) {
      const parseError = new ParseError(
        `Could not match ${this.name} before string ran out.`,
        this.onPatternIndex,
        this
      );

      cursor.throwError(parseError);
    }
  }

  private areTheRemainingPatternsOptional() {
    return this.children
      .slice(this.onPatternIndex + 1)
      .map((p) => p.isOptional)
      .every((r) => r);
  }

  private processSuccess() {
    const cursor = this.safelyGetCursor();
    const nodes = this.nodes.filter((node) => node != null) as Node[];
    this.nodes = nodes;

    const lastNode = nodes[this.nodes.length - 1];
    const startIndex = this.mark;
    const endIndex = lastNode.endIndex;
    const value = nodes.map((node) => node.value).join("");

    this.node = new Node("and", this.name, startIndex, endIndex, nodes, value);

    cursor.index = this.node.endIndex;
    cursor.addMatch(this, this.node);
  }
}
