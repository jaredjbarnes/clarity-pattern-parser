"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Pattern = _interopRequireDefault(require("../Pattern.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CompositePattern extends _Pattern.default {
  getType() {
    return "composite";
  }

  getValue() {
    return null;
  }

  getPatterns() {
    return null;
  }

  clone() {
    throw new Error("Not Yet Implemented");
  }

}

exports.default = CompositePattern;
//# sourceMappingURL=CompositePattern.js.map