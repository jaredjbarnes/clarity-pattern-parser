"use strict";

var _ValuePatterns = _interopRequireDefault(require("../patterns/value/ValuePatterns.js"));

var _assert = _interopRequireDefault(require("assert"));

var _Literal = _interopRequireDefault(require("../patterns/value/Literal.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["ValuePattern: getValue."] = () => {
  const valuePatterns = new _ValuePatterns.default("name", [new _Literal.default("a", "a"), new _Literal.default("a", "a")]);

  _assert.default.throws(() => {
    valuePatterns.clone();
  });
};
//# sourceMappingURL=ValuePatterns.js.map