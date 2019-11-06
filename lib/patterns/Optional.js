"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Pattern = _interopRequireDefault(require("./Pattern.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Optional extends CompositePattern {
  constructor(pattern) {
    this.pattern = pattern;
    this.assertArguments();
  }

  assertArguments() {
    if (!(this.pattern instanceof _Pattern.default)) {
      throw new Error("Invalid Arguments: Expected a Pattern.");
    }
  }

  getName() {
    return this.pattern.getName();
  }

  getType() {
    return this.pattern.getType();
  }

  getPatterns() {
    return [this.pattern];
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
    return new Optional(this.pattern);
  }

}

exports.default = Optional;
//# sourceMappingURL=Optional.js.map