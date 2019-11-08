"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ValuePatterns = _interopRequireDefault(require("./ValuePatterns.js"));

var _ValueNode = _interopRequireDefault(require("../../ast/ValueNode.js"));

var _Cursor = _interopRequireDefault(require("../../Cursor.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class OrValue extends _ValuePatterns.default {
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
    return this.node;
  }

  assertCursor() {
    if (!(this.cursor instanceof _Cursor.default)) {
      throw new Error("Invalid Arguments: Expected a cursor.");
    }
  }

  tryPattern() {
    while (true) {
      const pattern = this.patterns[this.index];

      try {
        const node = pattern.parse(this.cursor);

        if (node == null) {
          throw new ParserError("Optional pattern did not match.", this.mark.index, this);
        }

        this.node = new _ValueNode.default(this.name, node.value, node.startIndex, node.endIndex);
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

exports.default = OrValue;
//# sourceMappingURL=OrValue.js.map