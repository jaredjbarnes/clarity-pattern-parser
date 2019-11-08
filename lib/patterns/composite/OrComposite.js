"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _CompositePatterns = _interopRequireDefault(require("./CompositePatterns.js"));

var _CompositeNode = _interopRequireDefault(require("../../ast/CompositeNode.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class OrComposite extends _CompositePatterns.default {
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
      const mark = this.cursor.mark();

      try {
        const result = this.patterns[this.index].parse(this.cursor);
        this.node = new _CompositeNode.default(this.name, result.startIndex, result.endIndex);
        this.node.children.push(result);
        break;
      } catch (error) {
        if (this.index + 1 < this.patterns.length) {
          this.cursor.moveToMark(mark);
          this.index++;
        } else {
          throw error;
        }
      }
    }
  }

  clone() {
    return new OrComposite(this.name, this.patterns);
  }

}

exports.default = OrComposite;
//# sourceMappingURL=OrComposite.js.map