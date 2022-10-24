import ParseError from "./ParseError";
import Node from "../ast/Node";
import Pattern from "./Pattern";
import Cursor from "../Cursor";

export default class Regex extends Pattern {
  private regexString: string;
  private regex: RegExp;
  private node: Node | null = null;
  private cursor: Cursor | null = null;
  private substring: string = "";

  constructor(name: string, regex: string, isOptional = false) {
    super("regex", name, [], isOptional);
    this.regexString = regex;
    this.regex = new RegExp(`^${regex}`, "g");
    this.assertArguments();
  }

  private assertArguments() {
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
    this.resetState(cursor);
    this.tryToParse();

    return this.node;
  }

  private resetState(cursor: Cursor) {
    this.cursor = cursor;
    this.regex.lastIndex = 0;
    this.substring = this.cursor.text.substr(this.cursor.getIndex());
    this.node = null;
  }

  private tryToParse() {
    const result = this.regex.exec(this.substring);

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

    this.node = new Node(
      "regex",
      this.name,
      currentIndex,
      newIndex,
      [],
      result[0]
    );

    cursor.moveToMark(newIndex);
    cursor.addMatch(this, this.node);
  }

  private processError() {
    const cursor = this.safelyGetCursor();

    if (!this._isOptional) {
      const message = `ParseError: Expected regex pattern of '${this.regexString}' but found '${this.substring}'.`;
      const parseError = new ParseError(message, cursor.getIndex(), this);

      cursor.throwError(parseError);
    }

    this.node = null;
  }

  private safelyGetCursor() {
    const cursor = this.cursor;

    if (cursor == null) {
      throw new Error("Couldn't find cursor.");
    }
    return cursor;
  }

  clone(name?: string, isOptional?: boolean) {
    if (name == null) {
      name = this.name;
    }

    if (isOptional == null) {
      isOptional = this._isOptional;
    }

    return new Regex(name, this.regexString, isOptional);
  }

  getTokenValue() {
    return this.name;
  }

  getTokens() {
    return [this.name];
  }
}