"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Node = _interopRequireDefault(require("./Node.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CompositeNode extends _Node.default {
  constructor(type, startIndex = 0, endIndex = 0) {
    super(type, startIndex, endIndex);
    this.children = [];
  }

  clone() {
    const node = new CompositeNode(this.type, this.startIndex, this.endIndex);
    node.children = this.children.map(child => {
      return child.clone();
    });
    return node;
  }

}

exports.default = CompositeNode;
//# sourceMappingURL=CompositeNode.js.map