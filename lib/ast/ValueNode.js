"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Node = _interopRequireDefault(require("./Node.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ValueNode extends _Node.default {
  constructor(type, value) {
    super(type);
    this.value = value;
  }

  clone() {
    return new ValueNode(this.type, this.value);
  }

}

exports.default = ValueNode;
//# sourceMappingURL=ValueNode.js.map