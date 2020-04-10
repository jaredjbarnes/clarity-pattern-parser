import CompositePattern from "./CompositePattern.js";
import OptionalValue from "../value/OptionalValue.js";
import OptionalComposite from "./OptionalComposite.js";
import Pattern from "../Pattern.js";

export default class OrComposite extends CompositePattern {
  constructor(name, patterns) {
    super("or-composite", name, patterns);
    this._assertArguments();
  }

  _assertArguments() {
    if (this._children.length < 2) {
      throw new Error(
        "Invalid Argument: OrValue needs to have more than one value pattern."
      );
    }

    const hasOptionalChildren = this._children.some(
      (pattern) =>
        pattern instanceof OptionalValue || pattern instanceof OptionalComposite
    );

    if (hasOptionalChildren) {
      throw new Error("OrComposite cannot have optional values.");
    }
  }

  _reset(cursor) {
    this.cursor = cursor;
    this.mark = null;
    this.index = 0;
    this.node = null;
    this.mark = cursor.mark();
  }

  parse(cursor) {
    this._reset(cursor);
    this._tryPattern();

    if (this.node != null) {
      this.cursor.addMatch(this, this.node);
    }

    return this.node;
  }

  _tryPattern() {
    while (true) {
      const pattern = this._children[this.index];

      this.node = pattern.parse(this.cursor);

      if (this.cursor.hasUnresolvedError()) {
        if (this.index + 1 < this._children.length) {
          this.cursor.resolveError();
          this.index++;
          this.cursor.moveToMark(this.mark);
        } else {
          this.node = null;
          break;
        }
      } else {
        this.cursor.index = this.node.endIndex;
        break;
      }
    }
  }

  clone(name) {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new OrComposite(name, this._children);
  }

  getPossibilities(rootPattern) {
    if (rootPattern == null || !(rootPattern instanceof Pattern)) {
      rootPattern = this;
    }

    return this.children
      .map((child) => {
        return child.getPossibilities(rootPattern);
      })
      .reduce((acc, value) => {
        return acc.concat(value);
      }, []);
  }

  getTokens() {
    const tokens = this._children.map((c) => c.getTokens());

    const hasPrimitiveTokens = tokens.every((t) =>
      t.every((value) => typeof value === "string")
    );

    if (hasPrimitiveTokens && tokens.length > 0) {
      return tokens.reduce((acc, t) => acc.concat(t), []);
    }

    return this._children[0].getTokens();
  }
}
