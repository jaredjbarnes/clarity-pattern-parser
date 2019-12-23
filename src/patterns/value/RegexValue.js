import ParseError from "../ParseError.js";
import Cursor from "../../Cursor.js";
import ValueNode from "../../ast/ValueNode.js";
import ValuePattern from "./ValuePattern.js";

export default class RegexValue extends ValuePattern {
  constructor(name, regex) {
    super(name);
    this.regexString = regex;
    this.regex = new RegExp(`^${regex}`, "g");
    this._assertArguments();
  }

  _assertArguments() {
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

  parse(cursor) {
    this._reset(cursor);
    this._tryPattern();

    return this.node;
  }

  _reset(cursor) {
    this.cursor = cursor;
    this.regex.lastIndex = 0;
    this.substring = this.cursor.string.substr(this.cursor.getIndex());
    this.node = null;
  }

  _assertCursor() {
    if (!(this.cursor instanceof Cursor)) {
      throw new Error("Invalid Arguments: Expected a cursor.");
    }
  }

  _tryPattern() {
    const result = this.regex.exec(this.substring);

    if (result != null && result.index === 0) {
      const currentIndex = this.cursor.getIndex();
      const newIndex = currentIndex + result[0].length - 1;

      this.node = new ValueNode(this.name, result[0], currentIndex, newIndex);

      this.cursor.setIndex(newIndex);
    } else {
      this._processError();
    }
  }

  _processError() {
    const message = `ParseError: Expected regex pattern of '${this.regexString}' but found '${this.substring}'.`;
    const parseError = new ParseError(message, this.cursor.getIndex(), this);

    this.cursor.throwError(parseError);
  }

  clone(name) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new RegexValue(name, this.regexString);
  }

  getCurrentMark() {
    return this.cursor.getIndex();
  }
}
