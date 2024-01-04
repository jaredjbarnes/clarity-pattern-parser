import Pattern from "./Pattern";
import ParseError from "./ParseError";
import Cursor from "./Cursor";

export default class Not extends Pattern {
  public cursor!: Cursor;
  public mark: number = 0;

  constructor(pattern: Pattern) {
    super("not", `not-${pattern.name}`, [pattern]);
    this._isOptional = true;
  }

  parse(cursor: Cursor) {
    this.cursor = cursor;
    this.mark = cursor.mark();
    this.tryToParse();
    return null;
  }

  private tryToParse() {
    const mark = this.cursor.mark();
    this.children[0].parse(this.cursor);

    if (this.cursor.hasUnresolvedError()) {
      this.cursor.resolveError();
      this.cursor.moveToMark(mark);
    } else {
      this.cursor.moveToMark(mark);
      const parseError = new ParseError(
        `Match invalid pattern: ${this.children[0].name}.`,
        this.mark,
        this
      );
      this.cursor.throwError(parseError);
    }
  }

  clone() {
    return new Not(this.children[0]);
  }

  getTokens() {
    return [];
  }

  getNextTokens(reference: Pattern): string[] {
    return [];
  }
}
