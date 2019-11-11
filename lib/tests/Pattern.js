"use strict";

var _Pattern = _interopRequireDefault(require("../patterns/Pattern.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["Pattern: parse."] = function () {
  var valuePattern = new _Pattern.default("pattern");

  _assert.default.throws(function () {
    valuePattern.parse();
  });
};

exports["Pattern: clone."] = function () {
  var valuePattern = new _Pattern.default("pattern");

  _assert.default.throws(function () {
    valuePattern.clone();
  });
};
//# sourceMappingURL=Pattern.js.map