import Cursor from "../Cursor";
import ParseError from "./ParseError";
import Pattern from "./Pattern";

export default class LookAhead extends Pattern {
  constructor(pattern: Pattern) {
    super("look-ahead", "look-ahead", [pattern]);
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
    return new LookAhead(this.children[0].clone());
  }

  getTokens() {
    return [];
  }
}
