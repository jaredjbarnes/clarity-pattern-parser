"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Possibilities = function Possibilities(options, isComplete, hasError) {
  _classCallCheck(this, Possibilities);

  this.options = Array.isArray(options) ? options : [];
  this.isComplete = typeof isComplete === "boolean" ? isComplete : false;
  this.hasError = _typeof(hasError) ? hasError : false;
};

exports.default = Possibilities;
//# sourceMappingURL=Possibilities.js.map