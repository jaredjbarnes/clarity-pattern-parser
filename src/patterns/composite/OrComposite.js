import CompositePattern from "./CompositePattern.js";
import Cursor from "../../Cursor.js";
import StackInformation from "../StackInformation.js";
import OptionalValue from "../value/OptionalValue.js";
import OptionalComposite from "./OptionalComposite.js";
import ParseError from "../ParseError.js";

export default class OrComposite extends CompositePattern {
  constructor(name, patterns) {
    super(name, patterns);
    this._assertArguments();
  }

  _assertArguments() {
    if (this._children.length < 2) {
      throw new Error(
        "Invalid Argument: OrValue needs to have more than one value pattern."
      );
    }

    const hasOptionalChildren = this._children.some(
      pattern =>
        pattern instanceof OptionalValue || pattern instanceof OptionalComposite
    );

    if (hasOptionalChildren) {
      throw new Error("OrComposite cannot have optional values.");
    }
  }

  _reset(cursor) {
    this.cursor = null;
    this.mark = null;
    this.index = 0;
    this.node = null;

    if (cursor != null) {
      this.cursor = cursor;
      this.mark = cursor.mark();
    }
  }

  parse(cursor) {
    this._reset(cursor);
    this._assertCursor();
    this._tryPattern();

    return this.node;
  }

  _assertCursor() {
    if (!(this.cursor instanceof Cursor)) {
      throw new Error("Invalid Arguments: Expected a cursor.");
    }
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
        this.cursor.setIndex(this.node.endIndex);
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

  getCurrentMark() {
    return this.mark;
  }
}
