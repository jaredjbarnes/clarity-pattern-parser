import ValuePattern from "./ValuePattern";
import Pattern from "../Pattern";
import Cursor from "../../Cursor";

export default class OptionalValue extends ValuePattern {
  constructor(pattern: ValuePattern) {
    super("optional-value", "optional-value", [pattern]);
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
      cursor.moveToMark(mark);
      return null;
    } else {
      cursor.addMatch(this, node);
      return node;
    }
  }

  clone() {
    return new OptionalValue(this.children[0] as ValuePattern);
  }

  getTokens() {
    return this._children[0].getTokens();
  }
}
