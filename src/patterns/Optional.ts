import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";

let idIndex = 0;

export class Optional implements Pattern {
  private _id: string;
  private _type: string;
  private _name: string;
  private _parent: Pattern | null;
  private _children: Pattern[];

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

  constructor(name: string, pattern: Pattern) {
    this._id = `optional-${idIndex++}`;
    this._type = "optional";
    this._name = name;
    this._parent = null;
    this._children = [pattern.clone()];
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
    cursor.startParseWith(this);

    const firstIndex = cursor.index;
    const node = this._children[0].parse(cursor);

    if (cursor.hasError) {
      cursor.resolveError();
      cursor.moveTo(firstIndex);

      cursor.endParse();
      return null;
    } else {
      cursor.endParse();
      return node;
    }

  }

  clone(name = this._name): Pattern {
    const optional = new Optional(name, this._children[0]);
    optional._id = this._id;
    return optional;
  }

  getTokens(): string[] {
    return this._children[0].getTokens();
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
      return [];
    }

    return this.parent.getTokensAfter(this);
  }

  getPatterns(): Pattern[] {
    return this._children[0].getPatterns();
  }

  getPatternsAfter(_childReference: Pattern): Pattern[] {
    const parent = this._parent;

    if (parent != null) {
      return parent.getPatternsAfter(this);
    }

    return [];
  }

  getNextPatterns(): Pattern[] {
    if (this.parent == null) {
      return [];
    }

    return this.parent.getPatternsAfter(this);
  }

  find(predicate: (p: Pattern) => boolean): Pattern | null {
    return predicate(this._children[0]) ? this._children[0] : null;
  }

  isEqual(pattern: Optional): boolean {
    return pattern.type === this.type && this.children.every((c, index) => c.isEqual(pattern.children[index]));
  }
}
