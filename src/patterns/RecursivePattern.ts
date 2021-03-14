import Pattern from "./Pattern";
import ParserError from "./ParseError";
import Cursor from "../Cursor";

export default class RecursivePattern extends Pattern {
  public isRecursing: any;
  public pattern: any;

  constructor(name) {
    super("recursive", name);
    this.isRecursing = false;
  }

  getPattern() {
    return this._climb(this.parent, (pattern) => {
      if (pattern == null) {
        return false;
      }
      return pattern.name === this.name;
    });
  }

  _climb(pattern, isMatch) {
    if (isMatch(pattern)) {
      return pattern;
    } else {
      if (pattern && pattern.parent != null) {
        return this._climb(pattern.parent, isMatch);
      }
      return null;
    }
  }

  parse(cursor: Cursor) {
    if (this.pattern == null) {
      const pattern = this.getPattern();

      if (pattern == null) {
        cursor.throwError(
          new ParserError(
            `Couldn't find parent pattern to recursively parse, with the name ${this.name}.`,
            cursor.index,
            this
          )
        );
        return null;
      }

      this.pattern = pattern.clone();
      this.pattern.parent = this;
    }

    const node = this.pattern.parse(cursor);

    if (!cursor.hasUnresolvedError()) {
      cursor.addMatch(this, node);
    }

    return node;
  }

  clone(name?) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new RecursivePattern(name);
  }

  getPossibilities() {
    if (!this.isRecursing) {
      this.isRecursing = true;
      const possibilities = this.getPattern().getPossibilities();
      this.isRecursing = false;

      return possibilities;
    } else {
      return [`[${this.name}]`];
    }
  }

  getTokenValue() {
    return this.getPattern().getTokenValue();
  }

  getTokens() {
    if (!this.isRecursing) {
      this.isRecursing = true;
      const tokens = this.getPattern().getTokens();
      this.isRecursing = false;

      return tokens;
    }
  }
}
