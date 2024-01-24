import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";

export class Not implements Pattern {
  private _type: string;
  private _name: string;
  private _parent: Pattern | null;
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
    return this._children;
  }

  get isOptional(): boolean {
    return false;
  }

  constructor(name: string, pattern: Pattern) {
    this._type = "not";
    this._name = name;
    this._parent = null;
    this._children = [pattern.clone(pattern.name, false)];
    this._children[0].parent = this;
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
    const firstIndex = cursor.index;
    this._children[0].parse(cursor);

    if (cursor.hasError) {
      cursor.resolveError();
      cursor.moveTo(firstIndex);
    } else {
      cursor.moveTo(firstIndex);
      cursor.resolveError();
      cursor.recordErrorAt(firstIndex, this);
    }

    return null;
  }

  clone(name = this._name): Pattern {
    const not = new Not(name, this._children[0]);
    return not;
  }

  getTokens(): string[] {
    return [];
  }

  getTokensAfter(_lastMatched: Pattern): string[] {
    const parent = this._parent;

    if (parent != null) {
      return parent.getTokensAfter(this);
    }

    return [];
  }

  getNextTokens(): string[] {
    if (this.parent == null) {
      return []
    }

    return this.parent.getTokensAfter(this);
  }

  getPatternsAfter(): Pattern[] {
    const parent = this._parent;

    if (parent != null) {
      return parent.getPatternsAfter(this);
    }

    return []
  }

  getNextPatterns(): Pattern[] {
    if (this.parent == null) {
      return [];
    }

    return this.parent.getPatternsAfter(this)
  }

  findPattern(predicate: (p: Pattern) => boolean): Pattern | null {
    return predicate(this._children[0]) ? this._children[0] : null;
  }

}
