"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Pattern = _interopRequireDefault(require("../Pattern.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ValuePattern extends _Pattern.default {
  getType() {
    return "value";
  }

  getPatterns() {
    return null;
  }

  getValue() {
    throw new Error("Method Not Impelemented");
  }

}

exports.default = ValuePattern;
//# sourceMappingURL=ValuePattern.js.map