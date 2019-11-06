"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class Node {
  constructor(type, startIndex, endIndex) {
    this.type = type;
    this.startIndex = startIndex;
    this.endIndex = endIndex;

    if (typeof this.startIndex !== "number" || typeof this.endIndex !== "number") {
      throw new Error("Invalid Arguments: startIndex and endIndex need to be number.");
    }
  }

  clone() {
    throw new Error("Not Implemented Exception: expected subclass to override this method.");
  }

}

exports.default = Node;
//# sourceMappingURL=Node.js.map