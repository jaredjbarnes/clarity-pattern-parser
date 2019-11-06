"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class ParseError extends Error {
  constructor(message, index, pattern) {
    super(message);
    this.name = 'ParseError';
    this.index = index;
    this.pattern = pattern;
  }

}

exports.default = ParseError;
//# sourceMappingURL=ParseError.js.map