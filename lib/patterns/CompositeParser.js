"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Parser = _interopRequireDefault(require("./Parser.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CompositeParser extends _Parser.default {
  getType() {
    return "composite";
  }

}

exports.default = CompositeParser;
//# sourceMappingURL=CompositeParser.js.map