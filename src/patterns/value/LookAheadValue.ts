import ValuePattern from "./ValuePattern";
import Cursor from "../../Cursor";
import ParseError from "../ParseError";

export default class LookAheadValue extends ValuePattern {
  constructor(pattern: ValuePattern) {
    super("look-ahead", "look-ahead", [pattern]);
    this._assertArguments();
  }

  private _assertArguments() {
    if (!(this.children[0] instanceof ValuePattern)) {
      throw new Error("Invalid Arguments: Expected a ValuePattern.");
    }
  }

  parse(cursor: Cursor) {
    const mark = cursor.mark();
    const node = this.children[0].parse(cursor);

    if (cursor.hasUnresolvedError() || node == null) {
      cursor.resolveError();
      cursor.throwError(
        new ParseError("Couldn't find look ahead pattern.", mark, this.children[0])
      );
      cursor.moveToMark(mark);
    }

    return null;
  }

  clone() {
    return new LookAheadValue(this.children[0] as ValuePattern);
  }

  getTokens() {
    return [];
  }
}
