import Pattern from "./Pattern";
import ParseError from "./ParseError";
import Cursor from "./Cursor";

export default class Not extends Pattern {
  private _cursor!: Cursor;
  private _firstIndex: number = 0;

  constructor(pattern: Pattern) {
    super("not", `not-${pattern.name}`, [pattern]);
    this._isOptional = true;
  }

  parse(cursor: Cursor) {
    this._cursor = cursor;
    this._firstIndex = cursor.getIndex();
    this.tryToParse();
    return null;
  }

  private tryToParse() {
    const firstIndex = this._cursor.getIndex();
    this.children[0].parse(this._cursor);

    if (this._cursor.hasUnresolvedError()) {
      this._cursor.resolveError();
      this._cursor.moveTo(firstIndex);
    } else {
      this._cursor.moveTo(firstIndex);
      const parseError = new ParseError(
        `Match invalid pattern: ${this.children[0].name}.`,
        this._firstIndex,
        this
      );
      this._cursor.throwError(parseError);
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
