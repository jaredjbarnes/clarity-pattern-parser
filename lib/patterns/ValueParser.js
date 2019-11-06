"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Parser = _interopRequireDefault(require("./Parser.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ValueParser extends _Parser.default {
  getType() {
    return "value";
  }

}

exports.default = ValueParser;
//# sourceMappingURL=ValueParser.js.map