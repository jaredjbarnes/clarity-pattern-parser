"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ParseError = function ParseError(message, index, pattern) {
  _classCallCheck(this, ParseError);

  this.message = message;
  this.name = 'ParseError';
  this.index = index;
  this.pattern = pattern;
};

exports.default = ParseError;
//# sourceMappingURL=ParseError.js.map