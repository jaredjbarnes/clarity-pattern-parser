"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ValuePatterns = _interopRequireDefault(require("./ValuePatterns"));

var _ValueNode = _interopRequireDefault(require("../../ast/ValueNode"));

var _Cursor = _interopRequireDefault(require("../../Cursor.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class AndValue extends _ValuePatterns.default {
  constructor(name, patterns) {
    super(name, patterns);
    this.reset();
  }

  reset(cursor) {
    this.cursor = null;
    this.index = 0;
    this.nodes = [];
    this.node = null;

    if (cursor != null) {
      this.cursor = cursor;
      this.mark = this.cursor.mark();
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
      this.nodes.push(pattern.parse(this.cursor));

      if (this.index + 1 < this.patterns.length) {
        const lastNode = this.nodes[this.nodes.length - 1];
        this.cursor.setIndex(lastNode.endIndex + 1);
        this.index++;
      } else {
        this.processValue();
        break;
      }
    }
  }

  processValue() {
    const lastNode = this.nodes[this.nodes.length - 1];
    const startIndex = this.mark.index;
    const endIndex = lastNode.endIndex;
    const value = this.nodes.map(node => node.value).join("");
    this.node = new _ValueNode.default(this.name, value, startIndex, endIndex);
  }

  clone() {
    return new AndValue(this.name, this.patterns);
  }

}

exports.default = AndValue;
//# sourceMappingURL=AndValue.js.map