"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _CompositePattern = _interopRequireDefault(require("./CompositePattern.js"));

var _Pattern = _interopRequireDefault(require("../Pattern.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class OptionalComposite extends _Pattern.default {
  constructor(pattern) {
    super();
    this.pattern = pattern;
    this.assertArguments();
  }

  assertArguments() {
    if (!(this.pattern instanceof _CompositePattern.default)) {
      throw new Error("Invalid Arguments: Expected a CompositePattern.");
    }
  }

  getType() {
    return this.pattern.getType();
  }

  getName() {
    return this.pattern.getName();
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
    return new OptionalComposite(this.pattern);
  }

}

exports.default = OptionalComposite;
//# sourceMappingURL=OptionalComposite.js.map