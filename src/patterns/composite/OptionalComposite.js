import CompositePattern from "./CompositePattern.js";

export default class OptionalComposite extends CompositePattern {
  constructor(pattern) {
    super("optional-composite", [pattern]);
    this._assertArguments();
  }

  _assertArguments() {
    if (!(this.children[0] instanceof CompositePattern)) {
      throw new Error("Invalid Arguments: Expected a CompositePattern.");
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
      return node;
    }
  }

  clone() {
    return new OptionalComposite(this.children[0]);
  }

  getCurrentMark() {
    return this.mark;
  }
}
