import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";

export class Literal implements Pattern {
  private _patternType: string;
  private _name: string;
  private _parent: Pattern | null;
  private _isOptional: boolean;
  private _literal: string;
  private _runes: string[];
  private _firstIndex: number;
  private _lastIndex: number;
  private _hasContextualTokenAggregation: boolean;
  private _isRetrievingContextualTokens: boolean;

  get type(): string {
    return this._patternType;
  }

  get name(): string {
    return this._name;
  }

  get parent(): Pattern | null {
    return this._parent;
  }

  set parent(pattern: Pattern) {
    this._parent = pattern;
  }

  get children(): Pattern[] {
    return [];
  }

  get isOptional(): boolean {
    return this._isOptional;
  }

  constructor(name: string, value: string, isOptional = false) {
    this._patternType = "literal";
    this._name = name;
    this._literal = value;
    this._runes = Array.from(value);
    this._isOptional = isOptional;
    this._parent = null;
    this._firstIndex = 0;
    this._lastIndex = 0;
    this._hasContextualTokenAggregation = false;
    this._isRetrievingContextualTokens = false;
  }

  parse(cursor: Cursor): Node | null {
    this._firstIndex = cursor.index;

    const passed = this._tryToParse(cursor);

    if (passed) {
      cursor.resolveError();
      const node = this._createNode(cursor);
      cursor.addMatch(this, node);

      return node;
    }

    if (!this._isOptional) {
      cursor.throwError(cursor.index, this)
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

  private _createNode(cursor: Cursor): Node | null {
    if (cursor === null) {
      return null;
    }

    return new Node(
      "literal",
      this._name,
      this._firstIndex,
      this._lastIndex,
      [],
      this._literal
    );
  }

  clone(name = this._name, isOptional = this._isOptional): Pattern {
    return new Literal(name, this._literal, isOptional);
  }

  getTokens(): string[] {
    const parent = this._parent;
    const hasParent = parent !== null;

    if (
      this._hasContextualTokenAggregation &&
      hasParent &&
      !this._isRetrievingContextualTokens
    ) {
      this._isRetrievingContextualTokens = true;

      const aggregateTokens: string[] = [];
      const nextTokens = parent.getNextTokens(this);

      for (const nextToken of nextTokens) {
        aggregateTokens.push(this._literal + nextToken);
      }

      this._isRetrievingContextualTokens = false;
      return aggregateTokens;
    } else {
      return [this._literal];
    }
  }

  getNextTokens(_lastMatched: Pattern): string[] {
    return [];
  }

  enableContextualTokenAggregation(): void {
    this._hasContextualTokenAggregation = true;
  }

  disableContextualTokenAggregation(): void {
    this._hasContextualTokenAggregation = false;
  }

}
