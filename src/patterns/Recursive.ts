import Pattern from "./Pattern";
import ParserError from "./ParseError";
import Cursor from "../Cursor";

export default class Recursive extends Pattern {
  public isRecursing: boolean;
  public pattern: Pattern | null = null;

  constructor(name: string, isOptional = false) {
    super("recursive", name, [], isOptional);
    this.isRecursing = false;
  }

  getPattern() {
    return this.climb(this.parent, (pattern: Pattern | null) => {
      if (pattern == null) {
        return false;
      }
      return (
        pattern.type !== "recursive" &&
        pattern.name === this.name
      );
    });
  }

  private climb(
    pattern: Pattern | null,
    isMatch: (pattern: Pattern | null) => boolean
  ): Pattern | null {
    if (isMatch(pattern)) {
      return pattern;
    } else {
      if (pattern && pattern.parent != null) {
        return this.climb(pattern.parent, isMatch);
      }
      return null;
    }
  }

  parse(cursor: Cursor) {
    if (this.pattern == null) {
      const pattern = this.getPattern();

      if (pattern == null) {
        if (!this._isOptional) {
          cursor.throwError(
            new ParserError(
              `Couldn't find parent pattern to recursively parse, with the name ${this.name}.`,
              cursor.index,
              this
            )
          );
        }

        return null;
      }

      this.pattern = pattern.clone();
      this.pattern.parent = this;
    }

    const mark = cursor.mark();
    const node = this.pattern.parse(cursor);

    if (!cursor.hasUnresolvedError() && node != null) {
      cursor.addMatch(this, node);
    }

    if (cursor.hasUnresolvedError() && this._isOptional) {
      cursor.resolveError();
      cursor.moveToMark(mark);
    }

    return node;
  }

  clone(name?: string, isOptional?: boolean) {
    if (name == null) {
      name = this.name;
    }

    if (isOptional == null) {
      isOptional = this._isOptional;
    }

    return new Recursive(name, isOptional);
  }

  getTokens() {
    return this.getPattern()?.getTokens() || [];
  }
}
