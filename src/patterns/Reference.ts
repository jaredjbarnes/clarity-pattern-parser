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

  get type(): string {
    return this._type;
  }

  get name(): string {
    return this._name;
  }

  get isOptional(): boolean {
    return this._isOptional;
  }

  get parent(): Pattern | null {
    return this._parent;
  }

  get children(): Pattern[] {
    return this._getPatternSafely().children;
  }

  constructor(name: string, isOptional: boolean = false) {
    this._type = "reference";
    this._name = name;
    this._parent = null;
    this._isOptional = isOptional;
    this._pattern = null;
  }

  parse(cursor: Cursor): Node | null {
    return this._getPatternSafely().parse(cursor);
  }

  clone(name = this._name, isOptional = this._isOptional): Pattern {
    return new Reference(name, isOptional);
  }

  getTokens(): string[] {
    return this._getPatternSafely().getTokens();
  }

  getNextTokens(_lastMatched: Pattern): string[] {
    return this.parent!.getNextTokens(this);
  }

  assignParent(parent: Pattern): void {
    this._parent = parent;
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
      const parent = this._parent;

      if (parent == null) {
        break;
      } else {
        node = parent
      }
    }

    return node;
  }
}
