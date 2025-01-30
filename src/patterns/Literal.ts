import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";

let idIndex = 0;

export class Literal implements Pattern {
  private _id: string;
  private _type: string;
  private _name: string;
  private _parent: Pattern | null;
  private _token: string;
  private _runes: string[];
  private _firstIndex: number;
  private _lastIndex: number;
  private _endIndex: number;

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

  get token(): string {
    return this._token;
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

  constructor(name: string, value: string) {
    if (value.length === 0) {
      throw new Error("Value Cannot be empty.");
    }

    this._id = `literal-${idIndex++}`;
    this._type = "literal";
    this._name = name;
    this._token = value;
    this._runes = Array.from(value);
    this._parent = null;
    this._firstIndex = 0;
    this._lastIndex = 0;
    this._endIndex = 0;
  }

  test(text: string, record = false) {
    const cursor = new Cursor(text);
    record && cursor.startRecording();

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
    const passed = this._tryToParse(cursor);

    if (passed) {
      cursor.resolveError();
      const node = this._createNode();
      cursor.recordMatch(this, node);

      return node;
    }

    cursor.recordErrorAt(this._firstIndex, this._endIndex, this);
    return null;
  }

  private _tryToParse(cursor: Cursor): boolean {
    let passed = false;
    const literalRuneLength = this._runes.length;

    for (let i = 0; i < literalRuneLength; i++) {
      const literalRune = this._runes[i];
      const cursorRune = cursor.currentChar;

      if (literalRune !== cursorRune) {
        this._endIndex = cursor.index;
        break;
      }

      if (i + 1 === literalRuneLength) {
        this._lastIndex = this._firstIndex + this._token.length - 1;
        passed = true;
        break;
      }

      if (!cursor.hasNext()) {
        this._endIndex = cursor.index + 1;
        break;
      }

      cursor.next();
    }

    return passed;
  }

  private _createNode(): Node {
    return new Node(
      "literal",
      this._name,
      this._firstIndex,
      this._lastIndex,
      undefined,
      this._token
    );
  }

  clone(name = this._name): Pattern {
    const clone = new Literal(name, this._token);
    clone._id = this._id;
    clone.shouldCompactAst = this.shouldCompactAst;
    return clone;
  }

  getTokens(): string[] {
    return [this._token];
  }

  getTokensAfter(_lastMatched: Pattern): string[] {
    return [];
  }

  getNextTokens(): string[] {
    if (this.parent == null) {
      return [];
    }

    return this.parent.getTokensAfter(this);
  }

  getPatterns(): Pattern[] {
    return [this];
  }

  getPatternsAfter(): Pattern[] {
    return [];
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

  isEqual(pattern: Literal) {
    return pattern.type === this.type && pattern._token === this._token;
  }
}
