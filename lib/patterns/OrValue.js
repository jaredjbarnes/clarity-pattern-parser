"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ValuePattern = _interopRequireDefault(require("./ValuePattern.js"));

var _ValueNode = _interopRequireDefault(require("../ast/ValueNode.js"));

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class OrValue extends _ValuePattern.default {
  constructor(name, patterns) {
    super();
    this.name = name;
    this.patterns = patterns;
    this.assertArguments();
    this.reset();
    this.clonePatterns();
  }

  assertArguments() {
    if (!Array.isArray(this.patterns)) {
      throw new Error("Invalid Arguments: The patterns argument need to be an array of ValuePatterns.");
    }

    const areAllPatterns = this.patterns.every(pattern => pattern instanceof _ValuePattern.default);

    if (!areAllPatterns) {
      throw new Error("Invalid Argument: All patterns need to be an instance of ValuePattern.");
    }

    if (this.patterns.length < 2) {
      throw new Error("Invalid Argument: OrValue needs to have more than one value pattern.");
    }

    if (typeof this.name !== "string") {
      throw new Error("Invalid Argument: OrValue needs to have a name that's a string.");
    }
  }

  reset(cursor) {
    this.cursor = null;
    this.mark = null;
    this.index = 0;
    this.errors = [];
    this.node = null;

    if (cursor != null) {
      this.cursor = cursor;
      this.mark = cursor.mark();
    }
  }

  clonePatterns() {
    // We need to clone the patterns so nested patterns can be parsed.
    this.patterns = this.patterns.map(pattern => pattern.clone());
  }

  parse(cursor) {
    this.reset(cursor);
    this.assertCursor();
    this.tryPattern();
    return new _ValueNode.default(this.name, this.node.value);
  }

  assertCursor() {
    if (!(this.cursor instanceof _Cursor.default)) {
      throw new ParseError("Invalid Arguments: Expected a cursor.");
    }
  }

  tryPattern() {
    const pattern = this.patterns[this.index];

    try {
      this.node = pattern.parse(this.cursor);
    } catch (error) {
      this.processError(error);
    }
  }

  processError(error) {
    this.errors.push(error);

    if (this.index + 1 < this.patterns.length) {
      this.index++;
      this.cursor.moveToMark(this.mark);
      this.tryPattern();
    } else {
      this.throwError();
    }
  }

  throwError() {
    const error = this.errors.reduce((furthestError, nextError) => {
      if (furthestError.index > nextError.index) {
        return furthestError;
      } else {
        return nextError;
      }
    });
    throw error;
  }

  getName() {
    return this.name;
  }

  getValue() {
    return null;
  }

  getPatterns() {
    return this.patterns;
  }

  clone() {
    return new OrValue(this.name, this.patterns);
  }

}

exports.default = OrValue;
//# sourceMappingURL=OrValue.js.map