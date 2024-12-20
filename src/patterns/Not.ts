import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { ParseResult } from "./ParseResult";
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

  test(text: string) {
    const cursor = new Cursor(text);
    this.parse(cursor);

    return !cursor.hasError;
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

    const firstIndex = cursor.index;
    this._children[0].parse(cursor);

    if (cursor.hasError) {
      cursor.resolveError();
      cursor.moveTo(firstIndex);
    } else {
      cursor.moveTo(firstIndex);
      cursor.resolveError();
      cursor.recordErrorAt(firstIndex, firstIndex, this);
    }

    cursor.popPatternStack();
    return null;
  }

  clone(name = this._name): Pattern {
    const not = new Not(name, this._children[0]);
    return not;
  }

  getTokens(): string[] {
    const parent = this._parent;

    if (parent != null) {
      return parent.getTokensAfter(this);
    }

    return [];
  }

  getTokensAfter(_childReference: Pattern): string[] {
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

  getPatterns(): Pattern[] {
    return [...this.getNextPatterns().map(p => p.getPatterns()).flat()];
  }

  getPatternsAfter(_childReference: Pattern): Pattern[] {
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

  find(predicate: (p: Pattern) => boolean): Pattern | null {
    return predicate(this._children[0]) ? this._children[0] : null;
  }

}
