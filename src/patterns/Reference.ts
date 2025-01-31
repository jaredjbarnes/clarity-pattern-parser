import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";
import { findPattern } from "./findPattern";
import { ParseResult } from "./ParseResult";
import { Context } from "./Context";

let idIndex = 0;

export class Reference implements Pattern {
  private _id: string;
  private _type: string;
  private _name: string;
  private _parent: Pattern | null;
  private _cachedPattern: Pattern | null;
  private _pattern: Pattern | null;
  private _children: Pattern[];
  private _firstIndex: number;

  shouldCompactAst = false;

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

  get startedOnIndex() {
    return this._firstIndex;
  }

  constructor(name: string) {
    this._id = `reference-${idIndex++}`;
    this._type = "reference";
    this._name = name;
    this._parent = null;
    this._pattern = null;
    this._cachedPattern = null;
    this._children = [];
    this._firstIndex = 0;
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
    this._firstIndex = cursor.index;
    return this.getReferencePatternSafely().parse(cursor);
  }

  getReferencePatternSafely(): Pattern {
    if (this._pattern === null) {
      let pattern: Pattern | null = null;

      if (this._cachedPattern == null) {
        pattern = this._findPattern();
      } else {
        pattern = this._cachedPattern;
      }

      if (pattern === null) {
        throw new Error(`Couldn't find '${this._name}' pattern within tree.`);
      }

      const clonedPattern = pattern.clone();
      clonedPattern.parent = this;

      this._pattern = clonedPattern;
      this._children = [this._pattern];
    }

    return this._pattern;
  }

  private _findPattern(): Pattern | null {
    let pattern = this._parent;

    while (pattern != null) {
      if (pattern.type !== "context") {
        pattern = pattern.parent;
        continue;
      }

      const foundPattern = (pattern as Context).getPatternWithinContext(this.name);

      if (foundPattern != null && this._isValidPattern(foundPattern)) {
        return foundPattern;
      }

      pattern = pattern.parent;
    }

    const root = this._getRoot();
    return findPattern(root, (pattern: Pattern) => {
      return pattern.name === this._name && this._isValidPattern(pattern);
    });
  }

  private _isValidPattern(pattern: Pattern) {
    if (pattern.type === "reference") {
      return false;
    }

    if (pattern.type === "context" && pattern.children[0].type === "reference") {
      return false;
    }

    return true;
  }

  private _getRoot(): Pattern {
    let node: Pattern = this;

    while (true) {
      const parent = node.parent;

      if (parent == null) {
        break;
      } else {
        node = parent;
      }
    }

    return node;
  }

  getTokens(): string[] {
    return this.getReferencePatternSafely().getTokens();
  }

  getTokensAfter(_lastMatched: Pattern): string[] {
    if (this._parent == null) {
      return [];
    }

    return this._parent.getTokensAfter(this);
  }

  getNextTokens(): string[] {
    if (this.parent == null) {
      return [];
    }

    return this.parent.getTokensAfter(this);
  }

  getPatterns(): Pattern[] {
    return this.getReferencePatternSafely().getPatterns();
  }

  getPatternsAfter(_childReference: Pattern): Pattern[] {
    if (this._parent == null) {
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

  find(_predicate: (p: Pattern) => boolean): Pattern | null {
    return null;
  }

  clone(name = this._name): Pattern {
    const clone = new Reference(name);
    clone._id = this._id;
    clone.shouldCompactAst = this.shouldCompactAst;

    // Optimize future clones, by caching the pattern we already found.
    if (this._pattern != null) {
      clone._cachedPattern = this._pattern;
    }

    return clone;
  }

  isEqual(pattern: Reference): boolean {
    return pattern.type === this.type && pattern.name === this.name;
  }
}
