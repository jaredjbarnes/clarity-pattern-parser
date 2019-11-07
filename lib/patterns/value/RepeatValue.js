"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ValuePattern = _interopRequireDefault(require("./ValuePattern.js"));

var _ValueNode = _interopRequireDefault(require("../../ast/ValueNode"));

var _ParseError = _interopRequireDefault(require("../ParseError.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class RepeatValue extends _ValuePattern.default {
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
    this.nodes = [];

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
        this.nodes.push(this.pattern.parse(this.cursor));
      } catch (error) {
        this.processMatch();
        this.cursor.moveToMark(mark);
        break;
      }
    }
  }

  processMatch() {
    if (this.nodes.length === 0) {
      throw new _ParseError.default(``);
    } else {
      const value = this.nodes.map(node => node.value).join("");
      this.node = new _ValueNode.default(this.name, value, this.nodes[0].startIndex, this.nodes[this.nodes.length - 1].endIndex);
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
    return new RepeatValue(this.name, this.pattern);
  }

}

exports.default = RepeatValue;
//# sourceMappingURL=RepeatValue.js.map