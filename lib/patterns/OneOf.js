"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ParseError = _interopRequireDefault(require("../ParseError.js"));

var _ValueNode = _interopRequireDefault(require("../ast/ValueNode.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class OneOf {
  constructor(name, values, {
    min,
    max
  } = {}) {
    this.name = name;
    this.values = values;
    this.cursor = null;
    this.match = "";
    this.max = typeof max === "number" ? max : Infinity;
    this.min = typeof min === "number" > 0 ? min : 0;
    this.assertValidity();
  }

  assertValidity() {
    if (this.isNullOrEmpty(this.values)) {
      throw new Error("Illegal Argument: Any needs to have a value that has a length greater than 0.");
    }
  }

  isNullOrEmpty(value) {
    return value == null || value.length === 0;
  }

  isMatch() {
    return this.values.indexOf(this.cursor.getChar()) > -1;
  }

  reset(cursor) {
    this.match = "";
    this.cursor = cursor;
  }

  parse(cursor) {
    const startIndex = cursor.getIndex();
    this.reset(cursor);

    while (this.isMatch() && this.match.length <= this.max) {
      this.match += cursor.getChar();

      if (cursor.hasNext()) {
        cursor.next();
      } else {
        break;
      }
    }

    if (this.match.length < this.min) {
      throw new _ParseError.default(`A '${this.name}' needs to be at least ${this.min} character(s) long.`);
    }

    const endIndex = startIndex + this.match.length - 1;
    return new _ValueNode.default(this.name, this.match, startIndex, endIndex);
  }

  clone() {
    return new OneOf(this.name, this.values, {
      min: this.min,
      max: this.max
    });
  }

}

exports.default = OneOf;
//# sourceMappingURL=OneOf.js.map