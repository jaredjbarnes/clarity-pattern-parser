"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ValueNode = _interopRequireDefault(require("../ast/ValueNode.js"));

var _Literal = _interopRequireDefault(require("./Literal.js"));

var _ParseError = _interopRequireDefault(require("../ParseError.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Not {
  constructor(name, value) {
    this.name = name;
    this.literal = new _Literal.default(name, value);
    this.notMatchingValue = value;
    this.value = "";
  }

  parse(cursor) {
    this.reset(cursor);
    return this.tryLiteral();
  }

  reset(cursor) {
    this.cursor = cursor;
    this.value = "";
  }

  tryLiteral() {
    const mark = this.cursor.mark();

    try {
      this.literal.parse(this.cursor);
      this.cursor.moveToMark(mark);

      if (this.value.length > 0) {
        return new _ValueNode.default(this.name, this.value);
      } else {
        throw new _ParseError.default(`Couldn't find pattern not matching '${this.notMatchingValue}'.`);
      }
    } catch (error) {
      this.value += this.cursor.getChar();

      if (this.cursor.hasNext()) {
        this.cursor.next();
        return this.tryLiteral();
      } else {
        return new _ValueNode.default(this.name, this.value);
      }
    }
  }

  clone() {
    return new Not(this.name, this.notMatchingValue);
  }

}

exports.default = Not;
//# sourceMappingURL=Not.js.map