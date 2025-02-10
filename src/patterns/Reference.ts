import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";
import { findPattern } from "./findPattern";
import { ParseResult } from "./ParseResult";
import { Context } from "./Context";
import { testPattern } from "./testPattern";
import { execPattern } from "./execPattern";

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
  private _cachedAncestors: boolean;
  private _recursiveAncestors: Reference[];

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
    this._cachedAncestors = false;
    this._recursiveAncestors = [];
  }

  test(text: string, record = false): boolean {
    return testPattern(this, text, record);
  }

  exec(text: string, record = false): ParseResult {
    return execPattern(this, text, record);
  }

  parse(cursor: Cursor): Node | null {
    this._firstIndex = cursor.index;
    
    const pattern = this.getReferencePatternSafely();
    
    this._cacheAncestors(pattern.id);
    if (this._isBeyondRecursiveAllowance()) {
      cursor.recordErrorAt(this._firstIndex, this._firstIndex, this);
      return null;
    }

    return pattern.parse(cursor);
  }

  private _cacheAncestors(id: string) {
    if (!this._cachedAncestors) {
      let pattern: Pattern | null = this.parent;

      while (pattern != null) {
        if (pattern.id === id) {
          this._recursiveAncestors.push(pattern as Reference);
        }
        pattern = pattern.parent;
      }
    }
  }

  private _isBeyondRecursiveAllowance() {
    let depth = 0;

    for (let pattern of this._recursiveAncestors) {
      if (pattern._firstIndex === this._firstIndex) {
        depth++;

        if (depth > 0) {
          return true;
        }
      }
    }

    return false;
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
