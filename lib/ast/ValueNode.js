"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Node = _interopRequireDefault(require("./Node.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// We might want reference to the pattern on the node.
class ValueNode extends _Node.default {
  constructor(type, value, startIndex = 0, endIndex = 0) {
    super(type, startIndex, endIndex);
    this.value = value;
  }

  clone() {
    return new ValueNode(this.type, this.value, this.startIndex, this.endIndex);
  }

}

exports.default = ValueNode;
//# sourceMappingURL=ValueNode.js.map