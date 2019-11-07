import ValuePatterns from "./ValuePatterns.js";
import ValueNode from "../../ast/ValueNode.js";
import Cursor from "../../Cursor.js";
import ParseError from "../ParseError.js";

export default class OrValue extends ValuePatterns {
  constructor(name, patterns) {
    super(name, patterns);
    this.reset();
  }

  reset(cursor) {
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
    this.reset(cursor);
    this.assertCursor();
    this.tryPattern();

    return new ValueNode(this.name, this.node.value);
  }

  assertCursor() {
    if (!(this.cursor instanceof Cursor)) {
      throw new Error("Invalid Arguments: Expected a cursor.");
    }
  }

  tryPattern() {
    while (true) {
      const pattern = this.patterns[this.index];

      try {
        this.node = pattern.parse(this.cursor);
        break;
      } catch (error) {
        this.errors.push(error);

        if (this.index + 1 < this.patterns.length) {
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

    throw error;
  }

  clone() {
    return new OrValue(this.name, this.patterns);
  }
}
