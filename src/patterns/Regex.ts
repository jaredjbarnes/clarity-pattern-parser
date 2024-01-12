import { Node } from "../ast/Node";
import { Pattern } from "./Pattern";
import { Cursor } from "./Cursor";

export class Regex implements Pattern {
  private _type: string;
  private _name: string;
  private _isOptional: boolean;
  private _parent: Pattern | null;
  private _originalRegexString: string;
  private _regex: RegExp;
  private _node: Node | null = null;
  private _cursor: Cursor | null = null;
  private _substring: string = "";
  private _tokens: string[] = [];
  private _hasContextualTokenAggregation = false;
  private _isRetrievingContextualTokens: boolean = false;

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

  constructor(name: string, regex: string, isOptional = false) {
    this._type = "regex"
    this._name = name;
    this._isOptional = isOptional;
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

  parse(cursor: Cursor) {
    this.resetState(cursor);
    this.tryToParse();

    return this._node;
  }

  private resetState(cursor: Cursor) {
    this._cursor = cursor;
    this._regex.lastIndex = 0;
    this._substring = this._cursor.text.substr(this._cursor.index);
    this._node = null;
  }

  private tryToParse() {
    const result = this._regex.exec(this._substring);

    if (result != null && result.index === 0) {
      this.processResult(result);
    } else {
      this.processError();
    }
  }

  private processResult(result: RegExpExecArray) {
    const cursor = this.safelyGetCursor();
    const currentIndex = cursor.index;
    const newIndex = currentIndex + result[0].length - 1;

    this._node = new Node(
      "regex",
      this._name,
      currentIndex,
      newIndex,
      [],
      result[0]
    );

    cursor.moveTo(newIndex);
    cursor.addMatch(this, this._node);
  }

  private processError() {
    const cursor = this.safelyGetCursor();

    if (!this._isOptional) {
      cursor.throwError(cursor.index, this);
    }

    this._node = null;
  }

  private safelyGetCursor() {
    const cursor = this._cursor;

    if (cursor == null) {
      throw new Error("Couldn't find cursor.");
    }
    return cursor;
  }

  clone(name = this._name, isOptional = this._isOptional) {
    const pattern = new Regex(name, this._originalRegexString, isOptional);
    pattern._tokens = this._tokens.slice();
    pattern._hasContextualTokenAggregation =
      this._hasContextualTokenAggregation;

    return pattern;
  }

  getTokens() {
    const parent = this._parent;

    if (this._hasContextualTokenAggregation &&
      parent != null &&
      !this._isRetrievingContextualTokens
    ) {
      this._isRetrievingContextualTokens = true;

      const tokens = this._tokens;
      const aggregateTokens: string[] = [];
      const nextTokens = parent.getNextTokens(this);

      for (let nextToken of nextTokens) {
        for (let token of tokens) {
          aggregateTokens.push(token + nextToken);
        }
      }

      this._isRetrievingContextualTokens = false
      return aggregateTokens;
    }

    return this._tokens;
  }

  getNextTokens(_reference: Pattern): string[] {
    return [];
  }

  setTokens(tokens: string[]) {
    this._tokens = tokens;
  }

  enableContextualTokenAggregation() {
    this._hasContextualTokenAggregation = true;
  }

  disableContextualTokenAggregation() {
    this._hasContextualTokenAggregation = false;
  }

}
