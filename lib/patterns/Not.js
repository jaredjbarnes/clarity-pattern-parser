"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ValueNode = _interopRequireDefault(require("../ast/ValueNode.js"));

var _ParseError = _interopRequireDefault(require("../ParseError.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Not {
  constructor(name, parser) {
    this.name = name;
    this.parser = parser;
    this.value = "";
    this.mark = null;
  }

  parse(cursor) {
    this.reset(cursor);
    return this.tryParser();
  }

  reset(cursor) {
    this.cursor = cursor;
    this.value = "";
    this.mark = this.cursor.mark();
  }

  tryParser() {
    const mark = this.cursor.mark();

    try {
      this.parser.parse(this.cursor);
      this.cursor.moveToMark(mark);

      if (this.value.length > 0) {
        return new _ValueNode.default(this.name, this.value, this.mark.index, this.mark.index + this.value.length - 1);
      } else {
        throw new _ParseError.default(`Couldn't find pattern not matching '${this.parser.name}' parser.`);
      }
    } catch (error) {
      this.value += this.cursor.getChar();

      if (this.cursor.hasNext()) {
        this.cursor.next();
        return this.tryParser();
      } else {
        return new _ValueNode.default(this.name, this.value, this.mark.index, this.mark.index + this.value.length - 1);
      }
    }
  }

  clone() {
    return new Not(this.name, this.parser);
  }

}

exports.default = Not;
//# sourceMappingURL=Not.js.map