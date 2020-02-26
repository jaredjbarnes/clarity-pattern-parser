"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Maybe we could make this into a ParseInformation and save the last pattern, ast and expectations.
var StackInformation = function StackInformation(mark, pattern) {
  _classCallCheck(this, StackInformation);

  this.mark = mark;
  this.pattern = pattern;
  this.expectations = [];
};

exports.default = StackInformation;
//# sourceMappingURL=StackInformation.js.map