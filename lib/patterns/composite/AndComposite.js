"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _CompositePatterns = _interopRequireDefault(require("./CompositePatterns.js"));

var _CompositeNode = _interopRequireDefault(require("../../ast/CompositeNode.js"));

var _StackInformation = _interopRequireDefault(require("../StackInformation.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class AndComposite extends _CompositePatterns.default {
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
    this.tryPattern();
    return this.node;
  }

  tryPattern() {
    while (true) {
      try {
        this.nodes.push(this.patterns[this.index].parse(this.cursor));
      } catch (error) {
        error.stack.push(new _StackInformation.default(this.mark, this));
        throw error;
      }

      if (this.index + 1 < this.patterns.length) {
        this.index++;
      } else {
        break;
      }
    }

    this.processValue();
  }

  processValue() {
    this.nodes = this.nodes.filter(node => node != null);
    this.node = new _CompositeNode.default(this.name, this.nodes[0].startIndex, this.nodes[this.nodes.length - 1].endIndex);
    this.node.children = this.nodes;
  }

  clone() {
    return new AndComposite(this.name, this.patterns);
  }

}

exports.default = AndComposite;
//# sourceMappingURL=AndComposite.js.map