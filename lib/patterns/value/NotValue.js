"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ValuePattern = _interopRequireDefault(require("./ValuePattern"));

var _ValueNode = _interopRequireDefault(require("../../ast/ValueNode"));

var _ParseError = _interopRequireDefault(require("../ParseError.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class NotValue extends _ValuePattern.default {
  constructor(name, pattern) {
    super();
    this.name = name;
    this.pattern = pattern.clone();
    this.patterns = [pattern];
    this.assertArguments();
    this.reset();
  }

  assertArguments() {
    if (!(this.pattern instanceof _ValuePattern.default)) {
      throw new Error("Invalid Arguments: Expected the pattern to be a ValuePattern.");
    }

    if (typeof this.name !== "string") {
      throw new Error("Invalid Arguments: Expected name to be a string.");
    }
  }

  reset(cursor) {
    this.cursor = null;
    this.mark = null;
    this.match = "";
    this.node = null;

    if (cursor != null) {
      this.cursor = cursor;
      this.mark = this.cursor.mark();
    }
  }

  parse(cursor) {
    this.reset(cursor);
    this.tryPattern();
    return this.node;
  }

  tryPattern() {
    while (true) {
      const mark = this.cursor.mark();

      try {
        this.pattern.parse(this.cursor);
        this.cursor.moveToMark(mark);
        break;
      } catch (error) {
        this.cursor.moveToMark(mark);
        this.match += this.cursor.getChar();

        if (this.cursor.hasNext()) {
          this.cursor.next();
        }

        break;
      }
    }

    this.processMatch();
  }

  processMatch() {
    if (this.match.length === 0) {
      throw new _ParseError.default(`Didn't find any characters the didn't match the ${this.pattern.getName()} pattern.`, this.mark.index, this);
    } else {
      this.node = new _ValueNode.default(this.name, this.match, this.mark.index, this.mark.index);
    }
  }

  getName() {
    return this.name;
  }

  getPatterns() {
    return this.patterns;
  }

  getValue() {
    return null;
  }

  clone() {
    return new NotValue(this.name, this.pattern);
  }

}

exports.default = NotValue;
//# sourceMappingURL=NotValue.js.map