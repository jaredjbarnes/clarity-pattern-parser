import CompositePattern from "./CompositePattern.js";
import Pattern from "../Pattern.js";

export default class OptionalComposite extends CompositePattern {
  constructor(pattern) {
    super("optional-composite", "optional-composite", [pattern]);
    this._assertArguments();
  }

  _assertArguments() {
    if (!(this.children[0] instanceof Pattern)) {
      throw new Error("Invalid Arguments: Expected a Pattern.");
    }
  }

  parse(cursor) {
    const mark = cursor.mark();
    this.mark = mark;

    const node = this.children[0].parse(cursor);

    if (cursor.hasUnresolvedError()) {
      cursor.resolveError();
      cursor.moveToMark(mark);
      return null;
    } else {
      cursor.addMatch(this, node);
      return node;
    }
  }

  clone() {
    return new OptionalComposite(this.children[0]);
  }

  getCurrentMark() {
    return this.mark;
  }

  getPossibilities() {
    return this.children[0].getPossibilities();
  }
}
