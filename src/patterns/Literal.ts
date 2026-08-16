import { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";

export class Literal extends BasePattern {
  private _token: string;
  private _lastIndex: number;

  get token(): string {
    return this._token;
  }

  constructor(name: string, value: string) {
    if (value.length === 0) {
      throw new Error("Value Cannot be empty.");
    }

    super("literal", name);

    this._token = value;
    this._lastIndex = 0;
  }

  parse(cursor: Cursor): Node | null {
    this._firstIndex = cursor.index;
    this._lastIndex = cursor.index;
    const passed = this._tryToParse(cursor);

    if (passed) {
      cursor.resolveError();
      const node = this._createNode();
      cursor.recordMatch(this, node);

      return node;
    }

    cursor.recordErrorAt(this._firstIndex, this._lastIndex, this);
    return null;
  }

  private _tryToParse(cursor: Cursor): boolean {
    const token = this._token;
    const compareToToken = cursor.text.slice(
      this._firstIndex,
      this._firstIndex + this._token.length
    );
    const length = Math.min(token.length, compareToToken.length);

    for (let i = 0; i < length; i++) {
      if (token[i] !== compareToToken[i]) {
        this._lastIndex = this._firstIndex + i;
        cursor.moveTo(this._lastIndex);
        return false;
      }
    }

    if (token !== compareToToken) {
      this._lastIndex = this._firstIndex + compareToToken.length - 1;
      cursor.moveTo(this._lastIndex);
      return false;
    }

    this._lastIndex = this._firstIndex + this._token.length - 1;
    cursor.moveTo(this._lastIndex);
    return true;
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
    clone._cloneIdFrom(this);
    return clone;
  }

  getTokens(): string[] {
    return [this._token];
  }

  getTokensAfter(_lastMatched: Pattern): string[] {
    return [];
  }

  getPatterns(): Pattern[] {
    return [this];
  }

  getPatternsAfter(): Pattern[] {
    return [];
  }

  find(_predicate: (p: Pattern) => boolean): Pattern | null {
    return null;
  }

  isEqual(pattern: Literal): boolean {
    return pattern.type === this.type && pattern._token === this._token;
  }
}
