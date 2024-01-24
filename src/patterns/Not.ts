import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { getNextPattern } from "./getNextPattern";
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
    const { ast, cursor } = this.parseText(text);
    return !cursor.hasError &&
      (ast?.value.length === text.length || this.isOptional)
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

  getNextPattern(): Pattern | null {
    return getNextPattern(this)
  }

  getTokens(): string[] {
    return [];
  }

  getNextTokens(_lastMatched: Pattern): string[] {
    const parent = this._parent;

    if (parent != null) {
      parent.getNextTokens(this);
    }

    return [];
  }

  findPattern(predicate: (p: Pattern) => boolean): Pattern | null {
    return predicate(this._children[0]) ? this._children[0] : null;
  }

}
