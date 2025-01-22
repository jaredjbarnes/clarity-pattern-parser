import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";
import { clonePatterns } from "./clonePatterns";
import { findPattern } from "./findPattern";
import { ParseResult } from "./ParseResult";
import { DepthCache } from './DepthCache';

/*
  The following is created to reduce the overhead of recursion check. 
*/

const depthCache = new DepthCache();
let idIndex = 0;

export class Options implements Pattern {
  private _id: string;
  private _type: string;
  private _name: string;
  private _parent: Pattern | null;
  private _children: Pattern[];
  private _isGreedy: boolean;
  private _firstIndex: number;

  get id(): string {
    return this._id;
  }

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

  constructor(name: string, options: Pattern[], isGreedy = false) {
    if (options.length === 0) {
      throw new Error("Need at least one pattern with an 'or' pattern.");
    }

    const children = clonePatterns(options);
    this._assignChildrenToParent(children);

    this._id = `options-${idIndex++}`;
    this._type = "options";
    this._name = name;
    this._parent = null;
    this._children = children;
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
    // This is a cache to help with speed
    this._firstIndex = cursor.index;
    depthCache.incrementDepth(this._id, this._firstIndex);

    this._firstIndex = cursor.index;
    const node = this._tryToParse(cursor);

    depthCache.decrementDepth(this._id, this._firstIndex);

    if (node != null) {
      cursor.moveTo(node.lastIndex);
      cursor.resolveError();
      return node;
    }

    cursor.recordErrorAt(this._firstIndex, this._firstIndex, this);
    return null;
  }

  private _tryToParse(cursor: Cursor): Node | null {
    if (depthCache.getDepth(this._id, this._firstIndex) > 2) {
      cursor.recordErrorAt(this._firstIndex, this._firstIndex, this);
      return null;
    }

    const results: (Node | null)[] = [];

    for (const pattern of this._children) {
      cursor.moveTo(this._firstIndex);
      let result = null;

      result = pattern.parse(cursor);

      if (this._isGreedy) {
        results.push(result);
      }

      if (result != null && !this._isGreedy) {
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
      return [];
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

    return this._parent.getPatternsAfter(this);
  }

  getNextPatterns(): Pattern[] {
    if (this.parent == null) {
      return [];
    }

    return this.parent.getPatternsAfter(this);
  }

  find(predicate: (p: Pattern) => boolean): Pattern | null {
    return findPattern(this, predicate);
  }

  clone(name = this._name): Pattern {
    const or = new Options(name, this._children, this._isGreedy);
    or._id = this._id;
    return or;
  }

  isEqual(pattern: Options): boolean {
    return pattern.type === this.type && this.children.every((c, index) => c.isEqual(pattern.children[index]));
  }
}
