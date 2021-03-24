import ParseError from "../ParseError";
import ValueNode from "../../ast/ValueNode";
import ValuePattern from "./ValuePattern";
import Cursor from "../../Cursor";

export default class RegexValue extends ValuePattern {
  public regexString: string;
  public regex: RegExp;
  public node: ValueNode | null = null;
  public cursor!: Cursor;
  public substring: string = "";

  constructor(name: string, regex: string) {
    super("regex-value", name);
    this.regexString = regex;
    this.regex = new RegExp(`^${regex}`, "g");
    this._assertArguments();
  }

  private _assertArguments() {
    if (typeof this.regexString !== "string") {
      throw new Error(
        "Invalid Arguments: The regex argument needs to be a string of regex."
      );
    }

    if (this.regexString.length < 1) {
      throw new Error(
        "Invalid Arguments: The regex string argument needs to be at least one character long."
      );
    }

    if (this.regexString.charAt(0) === "^") {
      throw new Error(
        "Invalid Arguments: The regex string cannot start with a '^' because it is expected to be in the middle of a string."
      );
    }

    if (this.regexString.charAt(this.regexString.length - 1) === "$") {
      throw new Error(
        "Invalid Arguments: The regex string cannot end with a '$' because it is expected to be in the middle of a string."
      );
    }
  }

  parse(cursor: Cursor) {
    this._reset(cursor);
    this._tryPattern();

    return this.node;
  }

  private _reset(cursor: Cursor) {
    this.cursor = cursor;
    this.regex.lastIndex = 0;
    this.substring = this.cursor.text.substr(this.cursor.getIndex());
    this.node = null;
  }

  private _tryPattern() {
    const result = this.regex.exec(this.substring);

    if (result != null && result.index === 0) {
      const currentIndex = this.cursor.getIndex();
      const newIndex = currentIndex + result[0].length - 1;

      this.node = new ValueNode(
        "regex-value",
        this.name,
        result[0],
        currentIndex,
        newIndex
      );

      this.cursor.index = newIndex;
      this.cursor.addMatch(this, this.node);
    } else {
      this._processError();
    }
  }

  private _processError() {
    const message = `ParseError: Expected regex pattern of '${this.regexString}' but found '${this.substring}'.`;
    const parseError = new ParseError(message, this.cursor.getIndex(), this);

    this.cursor.throwError(parseError);
  }

  clone(name: string) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new RegexValue(name, this.regexString);
  }

  getTokenValue() {
    return this.name;
  }

  getTokens() {
    return [this.name];
  }
}
