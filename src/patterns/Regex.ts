import { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";

export class Regex extends BasePattern {
  private _originalRegexString: string;
  private _regex: RegExp;
  private _node: Node | null = null;
  private _substring = "";
  private _tokens: string[] = [];

  get regex(): string {
    return this._originalRegexString;
  }

  constructor(name: string, regex: string) {
    super("regex", name);

    this._originalRegexString = regex;
    this._regex = new RegExp(`^${regex}`, "gu");
    this._assertArguments();
  }

  private _assertArguments() {
    if (this._originalRegexString.length < 1) {
      throw new Error(
        "Invalid Arguments: The regex string argument needs to be at least one character long."
      );
    }

    if (this._originalRegexString.charAt(0) === "^") {
      throw new Error(
        "Invalid Arguments: The regex string cannot start with a '^' because it is expected to be in the middle of a string."
      );
    }

    if (this._originalRegexString.charAt(this._originalRegexString.length - 1) === "$") {
      throw new Error(
        "Invalid Arguments: The regex string cannot end with a '$' because it is expected to be in the middle of a string."
      );
    }
  }

  parse(cursor: Cursor) {
    this._firstIndex = cursor.index;
    this._resetState(cursor);
    this._tryToParse(cursor);

    return this._node;
  }

  private _resetState(cursor: Cursor) {
    this._regex.lastIndex = 0;
    this._substring = cursor.text.slice(cursor.index);
    this._node = null;
  }

  private _tryToParse(cursor: Cursor) {
    const result = this._regex.exec(this._substring);

    if (result != null && result[0].length > 0 && result.index === 0) {
      this._processResult(cursor, result);
    } else {
      this._processError(cursor);
    }
  }

  private _processResult(cursor: Cursor, result: RegExpExecArray) {
    const currentIndex = cursor.index;
    const match = result[0];
    const lastIndex = cursor.getCharLastIndex(currentIndex + match.length - 1);

    this._node = new Node(
      "regex",
      this._name,
      currentIndex,
      lastIndex,
      undefined,
      result[0]
    );

    cursor.moveTo(lastIndex);
    cursor.recordMatch(this, this._node);
  }

  private _processError(cursor: Cursor) {
    cursor.recordErrorAt(this._firstIndex, this._firstIndex, this);
    this._node = null;
  }

  clone(name = this._name) {
    const clone = new Regex(name, this._originalRegexString);
    clone._tokens = this._tokens.slice();
    clone._cloneIdFrom(this);

    return clone;
  }

  getTokens() {
    return this._tokens;
  }

  getTokensAfter(_childReference: Pattern): string[] {
    return [];
  }

  getPatterns(): Pattern[] {
    return [this];
  }

  getPatternsAfter(_childReference: Pattern): Pattern[] {
    return [];
  }

  find(_predicate: (p: Pattern) => boolean): Pattern | null {
    return null;
  }

  setTokens(tokens: string[]) {
    this._tokens = tokens;
  }

  isEqual(pattern: Regex): boolean {
    return (
      pattern.type === this.type &&
      pattern._originalRegexString === this._originalRegexString
    );
  }
}
