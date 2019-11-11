import ValuePattern from "./ValuePattern.js";
import ValueNode from "../../ast/ValueNode.js";
import Cursor from "../../Cursor.js";

export default class OrValue extends ValuePattern {
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
  }

  _reset(cursor) {
    this.cursor = null;
    this.mark = null;
    this.index = 0;
    this.errors = [];
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

      try {
        const node = pattern.parse(this.cursor);

        if (node == null) {
          throw new ParserError(
            "Optional pattern did not match.",
            this.mark.index,
            this
          );
        }

        this.node = new ValueNode(
          this.name,
          node.value,
          node.startIndex,
          node.endIndex
        );
        break;
      } catch (error) {
        this.errors.push(error);

        if (this.index + 1 < this._children.length) {
          this.index++;
          this.cursor.moveToMark(this.mark);
        } else {
          this.throwError();
        }
      }
    }
  }

  throwError() {
    const error = this.errors.reduce((furthestError, nextError) => {
      if (furthestError.index > nextError.index) {
        return furthestError;
      } else {
        return nextError;
      }
    });

    error.stack.push(this.mark, this);

    throw error;
  }

  clone() {
    return new OrValue(this.name, this._children);
  }
}
