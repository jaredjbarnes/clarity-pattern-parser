"use strict";

var _Pattern = _interopRequireDefault(require("../patterns/Pattern.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["Pattern: parse."] = function () {
  var valuePattern = new _Pattern.default();

  _assert.default.throws(function () {
    valuePattern.parse();
  });
};

exports["Pattern: getName."] = function () {
  var valuePattern = new _Pattern.default();

  _assert.default.throws(function () {
    valuePattern.getName();
  });
};

exports["Pattern: getType."] = function () {
  var valuePattern = new _Pattern.default();

  _assert.default.throws(function () {
    valuePattern.getType();
  });
};

exports["Pattern: clone."] = function () {
  var valuePattern = new _Pattern.default();

  _assert.default.throws(function () {
    valuePattern.clone();
  });
};

exports["Pattern: getPatterns."] = function () {
  var valuePattern = new _Pattern.default();

  _assert.default.throws(function () {
    valuePattern.getPatterns();
  });
};
//# sourceMappingURL=Pattern.js.map