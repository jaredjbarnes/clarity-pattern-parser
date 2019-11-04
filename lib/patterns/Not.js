"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ValueNode = _interopRequireDefault(require("../ast/ValueNode.js"));

var _ParseError = _interopRequireDefault(require("../ParseError.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Not {
  constructor(name, parser, options) {
    this.name = name;
    this.parser = parser;
    this.options = options;
    this.value = "";
    this.startingMark = null;
    this.assertParser();
    this.recoverFromBadOptions();
  }

  assertParser() {
    if (this.parser == null || this.parser && typeof this.parser.parse !== "function") {
      throw new Error("Invalid Arguments: Expected a 'parser' to have a parse function.");
    }
  }

  recoverFromBadOptions() {
    if (typeof this.options !== "object" || this.options == null) {
      this.options = {};
      this.options.isOptional = false;
    } else {
      if (typeof this.options.isOptional !== "boolean") {
        this.options.isOptional = false;
      }
    }
  }

  parse(cursor) {
    this.reset(cursor);
    return this.tryParser();
  }

  reset(cursor) {
    this.cursor = cursor;
    this.startingMark = this.cursor.mark();
    this.value = "";
  }

  tryParser() {
    const mark = this.cursor.mark();

    try {
      this.parser.parse(this.cursor);
      this.cursor.moveToMark(mark);

      if (this.value.length > 0) {
        return new _ValueNode.default(this.name, this.value, this.startingMark.index, this.startingMark.index + this.value.length - 1);
      } else {
        if (this.options.isOptional) {
          return null;
        }

        throw new _ParseError.default(`Couldn't find pattern not matching '${this.parser.name}' parser.`);
      }
    } catch (error) {
      this.cursor.moveToMark(mark);
      this.value += this.cursor.getChar();

      if (this.cursor.hasNext()) {
        this.cursor.next();
        return this.tryParser();
      } else {
        return new _ValueNode.default(this.name, this.value, this.startingMark.index, this.startingMark.index + this.value.length - 1);
      }
    }
  }

  clone() {
    return new Not(this.name, this.parser, this.options);
  }

}

exports.default = Not;
//# sourceMappingURL=Not.js.map