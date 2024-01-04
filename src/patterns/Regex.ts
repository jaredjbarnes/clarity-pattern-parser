import ParseError from "./ParseError";
import Node from "../ast/Node";
import Pattern from "./Pattern";
import Cursor from "./Cursor";

export default class Regex extends Pattern {
  private _regexString: string;
  private _regex: RegExp;
  private _node: Node | null = null;
  private _cursor: Cursor | null = null;
  private _substring: string = "";
  private _tokens: string[] = [];
  private _hasContextualTokenAggregation = false;

  constructor(name: string, regex: string, isOptional = false) {
    super("regex", name, [], isOptional);
    this._regexString = regex;
    this._regex = new RegExp(`^${regex}`, "g");
    this.assertArguments();
  }

  private assertArguments() {
    if (this._regexString.length < 1) {
      throw new Error(
        "Invalid Arguments: The regex string argument needs to be at least one character long."
      );
    }

    if (this._regexString.charAt(0) === "^") {
      throw new Error(
        "Invalid Arguments: The regex string cannot start with a '^' because it is expected to be in the middle of a string."
      );
    }

    if (this._regexString.charAt(this._regexString.length - 1) === "$") {
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
    this._substring = this._cursor.text.substr(this._cursor.getIndex());
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
    const currentIndex = cursor.getIndex();
    const newIndex = currentIndex + result[0].length - 1;

    this._node = new Node(
      "regex",
      this.name,
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
      const message = `ParseError: Expected regex pattern of '${this._regexString}' but found '${this._substring}'.`;
      const parseError = new ParseError(message, cursor.getIndex(), this);

      cursor.throwError(parseError);
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
    const pattern = new Regex(name, this._regexString, isOptional);
    pattern._tokens = this._tokens.slice();
    pattern._hasContextualTokenAggregation =
      this._hasContextualTokenAggregation;
    return pattern;
  }

  getTokens() {
    const parent = this._parent;
    const hasParent = parent != null;

    if (this._hasContextualTokenAggregation && hasParent) {
      const tokens = this._tokens;
      const aggregateTokens: string[] = [];
      const nextTokens = parent.getNextTokens(this);

      for (let nextToken of nextTokens) {
        for (let token of tokens) {
          aggregateTokens.push(token + nextToken);
        }
      }

      return aggregateTokens;
    }

    return this._tokens;
  }

  setTokens(tokens: string[]) {
    this._tokens = tokens;
  }

  enableContextTokenAggregation() {
    this._hasContextualTokenAggregation = true;
  }

  disableContextTokenAggregation() {
    this._hasContextualTokenAggregation = false;
  }

  getNextTokens(_reference: Pattern): string[] {
    return [];
  }
}
