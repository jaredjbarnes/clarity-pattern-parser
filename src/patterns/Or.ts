import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";
import { clonePatterns } from "./clonePatterns";
import { findPattern } from "./findPattern";
import { ParseResult } from "./ParseResult";

export class Or implements Pattern {
  private _type: string;
  private _name: string;
  private _parent: Pattern | null;
  private _children: Pattern[];
  private _isOptional: boolean;
  private _isGreedy: boolean;
  private _firstIndex: number;

  get type(): string {
    return this._type;
  }

  get name(): string {
    return this._name;
  }

  get parent(): Pattern | null {
    return this._parent;
  }

  set parent(pattern: Pattern | null) {
    this._parent = pattern;
  }

  get children(): Pattern[] {
    return this._children;
  }

  get isOptional(): boolean {
    return this._isOptional;
  }

  constructor(name: string, options: Pattern[], isOptional = false, isGreedy = false) {
    if (options.length === 0) {
      throw new Error("Need at least one pattern with an 'or' pattern.");
    }

    const children = clonePatterns(options, false);
    this._assignChildrenToParent(children);

    this._type = "or";
    this._name = name;
    this._parent = null;
    this._children = children;
    this._isOptional = isOptional;
    this._firstIndex = 0;
    this._isGreedy = isGreedy;
  }

  private _assignChildrenToParent(children: Pattern[]): void {
    for (const child of children) {
      child.parent = this;
    }
  }

  test(text: string) {
    const cursor = new Cursor(text);
    const ast = this.parse(cursor);

    return ast?.value === text;
  }

  exec(text: string, record = false): ParseResult {
    const cursor = new Cursor(text);
    record && cursor.startRecording();
    
    const ast = this.parse(cursor);

    return {
      ast: ast?.value === text ? ast : null,
      cursor
    };
  }

  parse(cursor: Cursor): Node | null {
    cursor.pushPatternStack(this);
    this._firstIndex = cursor.index;

    const node = this._tryToParse(cursor);

    if (node != null) {
      cursor.moveTo(node.lastIndex);
      cursor.resolveError();

      cursor.popPatternStack();
      return node;
    }

    if (!this._isOptional) {
      cursor.recordErrorAt(this._firstIndex, this._firstIndex, this);

      cursor.popPatternStack();
      return null;
    }

    cursor.resolveError();
    cursor.moveTo(this._firstIndex);

    cursor.popPatternStack();
    return null;
  }

  private _tryToParse(cursor: Cursor): Node | null {
    const results: (Node | null)[] = [];

    for (const pattern of this._children) {
      cursor.moveTo(this._firstIndex);
      const result = pattern.parse(cursor);
      if (this._isGreedy) {
        results.push(result);
      }

      if (!cursor.hasError && !this._isGreedy) {
        return result;
      }

      cursor.resolveError();
    }

    const nonNullResults = results.filter(r => r != null) as Node[];
    nonNullResults.sort((a, b) => b.endIndex - a.endIndex);

    return nonNullResults[0] || null;
  }

  getTokens(): string[] {
    const tokens: string[] = [];

    for (const child of this._children) {
      tokens.push(...child.getTokens());
    }

    return tokens;
  }

  getTokensAfter(_childReference: Pattern): string[] {
    if (this._parent === null) {
      return [];
    }

    return this._parent.getTokensAfter(this);
  }

  getNextTokens(): string[] {
    if (this._parent == null) {
      return []
    }

    return this._parent.getTokensAfter(this);
  }

  getPatterns(): Pattern[] {
    const patterns: Pattern[] = [];

    for (const pattern of this._children) {
      patterns.push(...pattern.getPatterns());
    }

    return patterns;
  }

  getPatternsAfter(_childReference: Pattern): Pattern[] {
    if (this._parent === null) {
      return [];
    }

    return this._parent.getPatternsAfter(this)
  }

  getNextPatterns(): Pattern[] {
    if (this.parent == null) {
      return [];
    }

    return this.parent.getPatternsAfter(this)
  }

  find(predicate: (p: Pattern) => boolean): Pattern | null {
    return findPattern(this, predicate);
  }

  clone(name = this._name, isOptional = this._isOptional): Pattern {
    const or = new Or(name, this._children, isOptional, this._isGreedy);
    return or;
  }
}
