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

  get isOptional(): boolean {
    return false;
  }

  get parent(): Pattern | null {
    return this._parent;
  }

  set parent(pattern: Pattern) {
    this._parent = pattern;
  }

  get children(): Pattern[] {
    return this._children;
  }

  constructor(pattern: Pattern) {
    this._type = "not";
    this._name = `not-${pattern.name}`;
    this._parent = null;
    this._children = [pattern.clone(pattern.name, false)];
  }

  parse(cursor: Cursor): Node | null {
    const firstIndex = cursor.index;
    this._children[0].parse(cursor);

    if (cursor.hasUnresolvedError) {
      cursor.resolveError();
      cursor.moveTo(firstIndex);
    } else {
      cursor.moveTo(firstIndex);
      cursor.resolveError();
      cursor.throwError(firstIndex, this);
    }

    return null;
  }

  clone(): Pattern {
    const not = new Not(this._children[0]);
    return not;
  }

  getTokens(): string[] {
    return [];
  }

  getNextTokens(_lastMatched: Pattern): string[] {
    return [];
  }

}
