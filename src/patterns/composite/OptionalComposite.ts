import CompositePattern from "./CompositePattern";
import Pattern from "../Pattern";
import Cursor from "../../Cursor";

export default class OptionalComposite extends CompositePattern {
	public mark: any;

  constructor(pattern: Pattern) {
    super("optional-composite", "optional-composite", [pattern]);
  }

  parse(cursor: Cursor) {
    const mark = cursor.mark();
    this.mark = mark;

    const node = this.children[0].parse(cursor);

    if (cursor.hasUnresolvedError()) {
      cursor.resolveError();
      cursor.moveToMark(mark);
      return null;
    } else {
      if (node != null){
        cursor.addMatch(this, node);
      }
      return node;
    }
  }

  clone() {
    return new OptionalComposite(this.children[0]);
  }

  getTokens() {
    return this._children[0].getTokens();
  }
}
