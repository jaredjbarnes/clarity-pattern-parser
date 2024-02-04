import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";

export class Literal implements Pattern {
  private _type: string;
  private _name: string;
  private _parent: Pattern | null;
  private _isOptional: boolean;
  private _literal: string;
  private _runes: string[];
  private _firstIndex: number;
  private _lastIndex: number;

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
    return [];
  }

  get isOptional(): boolean {
    return this._isOptional;
  }

  constructor(name: string, value: string, isOptional = false) {
    if (value.length === 0) {
      throw new Error("Value Cannot be empty.");
    }

    this._type = "literal";
    this._name = name;
    this._literal = value;
    this._runes = Array.from(value);
    this._isOptional = isOptional;
    this._parent = null;
    this._firstIndex = 0;
    this._lastIndex = 0;
  }

  test(text: string) {
    const cursor = new Cursor(text);
    const ast = this.parse(cursor);

    return ast?.value === text;
  }

  exec(text: string) {
    const cursor = new Cursor(text);
    const ast = this.parse(cursor);

    return {
      ast: ast?.value === text ? ast : null,
      cursor
    };
  }

  parse(cursor: Cursor): Node | null {
    this._firstIndex = cursor.index;

    const passed = this._tryToParse(cursor);

    if (passed) {
      cursor.resolveError();
      const node = this._createNode();
      cursor.recordMatch(this, node);

      return node;
    }

    if (!this._isOptional) {
      cursor.recordErrorAt(cursor.index, this)
      return null;
    }

    cursor.resolveError();
    cursor.moveTo(this._firstIndex);
    return null;
  }

  private _tryToParse(cursor: Cursor): boolean {
    let passed = false;
    const literalRuneLength = this._runes.length;

    for (let i = 0; i < literalRuneLength; i++) {
      const literalRune = this._runes[i];
      const cursorRune = cursor.currentChar;

      if (literalRune !== cursorRune) {
        break
      }

      if (i + 1 === literalRuneLength) {
        this._lastIndex = this._firstIndex + this._literal.length - 1;
        passed = true;
        break;
      }

      if (!cursor.hasNext()) {
        break;
      }

      cursor.next();
    }

    return passed
  }

  private _createNode(): Node {
    return new Node(
      "literal",
      this._name,
      this._firstIndex,
      this._lastIndex,
      undefined,
      this._literal
    );
  }

  clone(name = this._name, isOptional = this._isOptional): Pattern {
    const clone = new Literal(name, this._literal, isOptional);
    return clone;
  }

  getTokens(): string[] {
    return [this._literal];
  }

  getTokensAfter(_lastMatched: Pattern): string[] {
    return [];
  }

  getNextTokens(): string[] {
    if (this.parent == null) {
      return []
    }

    return this.parent.getTokensAfter(this);
  }

  getPatterns(): Pattern[] {
    return [this];
  }

  getPatternsAfter(): Pattern[] {
    return []
  }

  getNextPatterns(): Pattern[] {
    if (this.parent == null) {
      return [];
    }

    return this.parent.getPatternsAfter(this)
  }

  find(_predicate: (p: Pattern) => boolean): Pattern | null {
    return null;
  }

}
