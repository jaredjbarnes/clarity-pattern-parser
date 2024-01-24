import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";
import { findPattern } from "./findPattern";

export class Reference implements Pattern {
  private _type: string;
  private _name: string;
  private _parent: Pattern | null;
  private _isOptional: boolean;
  private _pattern: Pattern | null;
  private _children: Pattern[];

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
    return this._children
  }

  get isOptional(): boolean {
    return this._isOptional;
  }

  constructor(name: string, isOptional: boolean = false) {
    this._type = "reference";
    this._name = name;
    this._parent = null;
    this._isOptional = isOptional;
    this._pattern = null;
    this._children = [];
  }

  testText(text: string) {
    if (this.isOptional) {
      return true;
    }

    const { ast } = this.parseText(text);
    return ast?.value.length === text.length
  }

  parseText(text: string) {
    const cursor = new Cursor(text);
    const ast = this.parse(cursor)

    return {
      ast,
      cursor
    };
  }

  parse(cursor: Cursor): Node | null {
    return this._getPatternSafely().parse(cursor);
  }

  private _getPatternSafely(): Pattern {
    if (this._pattern === null) {
      const pattern = this._findPattern();

      if (pattern === null) {
        throw new Error(`Couldn't find '${this._name}' pattern within tree.`);
      }

      const clonedPattern = pattern.clone(this._name, this._isOptional);
      clonedPattern.parent = this;

      this._pattern = clonedPattern;
      this._children = [this._pattern];
    }

    return this._pattern;
  }

  private _findPattern(): Pattern | null {
    const root = this._getRoot();

    return findPattern(root, (pattern: Pattern) => {
      return pattern.name === this._name && pattern.type !== "reference";
    });
  }

  private _getRoot(): Pattern {
    let node: Pattern = this;

    while (true) {
      const parent = node.parent;

      if (parent == null) {
        break;
      } else {
        node = parent
      }
    }

    return node;
  }

  getTokens(): string[] {
    return this._getPatternSafely().getTokens();
  }

  getTokensAfter(_lastMatched: Pattern): string[] {
    if (this._parent == null) {
      return [];
    }

    return this._parent.getTokensAfter(this);
  }

  getNextTokens(): string[] {
    if (this.parent == null) {
      return []
    }

    return this.parent.getTokensAfter(this);
  }

  getPatternsAfter(): Pattern[] {
    if (this._parent == null) {
      return [];
    }

    return this._parent.getPatternsAfter(this);
  }

  getNextPatterns(): Pattern[] {
    if (this.parent == null) {
      return [];
    }

    return this.parent.getPatternsAfter(this)
  }

  findPattern(_predicate: (p: Pattern) => boolean): Pattern | null {
    return null;
  }

  clone(name = this._name, isOptional = this._isOptional): Pattern {
    return new Reference(name, isOptional);
  }
}
