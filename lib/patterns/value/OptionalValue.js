"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ValuePattern = _interopRequireDefault(require("./ValuePattern.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class OptionalValue extends _ValuePattern.default {
  constructor(pattern) {
    this.pattern = pattern;
    this.assertArguments();
  }

  assertArguments() {
    if (!(this.pattern instanceof _ValuePattern.default)) {
      throw new Error("Invalid Arguments: Expected a ValuePattern.");
    }
  }

  getName() {
    return this.pattern.getName();
  }

  getType() {
    return this.pattern.getType();
  }

  getPatterns() {
    return this.pattern.getPatterns();
  }

  parse(cursor) {
    const mark = cursor.mark();

    try {
      return this.pattern.parse(cursor);
    } catch (error) {
      cursor.moveToMark(mark);
      return null;
    }
  }

  clone() {
    return new OptionalValue(this.pattern);
  }

}

exports.default = OptionalValue;
//# sourceMappingURL=OptionalValue.js.map