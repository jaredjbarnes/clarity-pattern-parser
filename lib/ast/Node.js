"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class Node {
  constructor(type) {
    this.type = type;
  }

  clone() {
    throw new Error("Not Implemented Exception: expected subclass to override this method.");
  }

}

exports.default = Node;
//# sourceMappingURL=Node.js.map