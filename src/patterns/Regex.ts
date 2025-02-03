import { Node } from "../ast/Node";
import { Pattern } from "./Pattern";
import { Cursor } from "./Cursor";
import { ParseResult } from "./ParseResult";
import { testPattern } from "./testPattern";
import { execPattern } from "./execPattern";

let idIndex = 0;

export class Regex implements Pattern {
  private _id: string;
  private _type: string;
  private _name: string;
  private _parent: Pattern | null;
  private _originalRegexString: string;
  private _regex: RegExp;
  private _node: Node | null = null;
  private _cursor: Cursor | null = null;
  private _firstIndex = 0;
  private _substring = "";
  private _tokens: string[] = [];

  get id(): string {
    return this._id;
  }

  get type(): string {
    return this._type;
  }

  get name(): string {
    return this._name;
  }

  get regex(): string {
    return this._originalRegexString;
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

  get startedOnIndex() {
    return this._firstIndex;
  }

  constructor(name: string, regex: string) {
    this._id = `regex-${idIndex++}`;
    this._type = "regex";
    this._name = name;
    this._parent = null;
    this._originalRegexString = regex;
    this._regex = new RegExp(`^${regex}`, "g");
    this.assertArguments();
  }

  private assertArguments() {
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

  test(text: string, record = false): boolean {
    return testPattern(this, text, record);
  }

  exec(text: string, record = false): ParseResult {
    return execPattern(this, text, record);
  }

  parse(cursor: Cursor) {
    this._firstIndex = cursor.index;
    this.resetState(cursor);
    this.tryToParse(cursor);

    return this._node;
  }

  private resetState(cursor: Cursor) {
    this._cursor = cursor;
    this._regex.lastIndex = 0;
    this._substring = this._cursor.text.substr(this._cursor.index);
    this._node = null;
  }

  private tryToParse(cursor: Cursor) {
    const result = this._regex.exec(this._substring);

    if (result != null && result.index === 0) {
      this.processResult(cursor, result);
    } else {
      this.processError(cursor);
    }
  }

  private processResult(cursor: Cursor, result: RegExpExecArray) {
    const currentIndex = cursor.index;
    const newIndex = currentIndex + result[0].length - 1;

    this._node = new Node(
      "regex",
      this._name,
      currentIndex,
      newIndex,
      undefined,
      result[0]
    );

    cursor.moveTo(newIndex);
    cursor.recordMatch(this, this._node);
  }

  private processError(cursor: Cursor) {
    cursor.recordErrorAt(this._firstIndex, this._firstIndex, this);
    this._node = null;
  }

  clone(name = this._name) {
    const clone = new Regex(name, this._originalRegexString);
    clone._tokens = this._tokens.slice();
    clone._id = this._id;

    return clone;
  }

  getTokens() {
    return this._tokens;
  }

  getTokensAfter(_childReference: Pattern): string[] {
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

  getPatternsAfter(_childReference: Pattern): Pattern[] {
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

  setTokens(tokens: string[]) {
    this._tokens = tokens;
  }

  isEqual(pattern: Regex): boolean {
    return pattern.type === this.type && pattern._originalRegexString === this._originalRegexString;
  }

}
