"use strict";

var _Pattern = _interopRequireDefault(require("../patterns/Pattern.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["Pattern: parse."] = function () {
  var valuePattern = new _Pattern.default("pattern-type", "pattern");

  _assert.default.throws(function () {
    valuePattern.parse();
  });
};

exports["Pattern: clone."] = function () {
  var valuePattern = new _Pattern.default("pattern-type", "pattern");

  _assert.default.throws(function () {
    valuePattern.clone();
  });
};

exports["Pattern: getPossibilities."] = function () {
  var valuePattern = new _Pattern.default("pattern-type", "pattern");

  _assert.default.throws(function () {
    valuePattern.getPossibilities();
  });
};

exports["Pattern: limited arguments."] = function () {
  new _Pattern.default(undefined, "name");
};

exports["Pattern: no arguments."] = function () {
  _assert.default.throws(function () {
    new _Pattern.default();
  });
};

exports["Pattern: set parent."] = function () {
  var parent = new _Pattern.default("pattern-type", "pattern");
  var child = new _Pattern.default("pattern-type", "pattern");
  child.parent = parent;
};

exports["Pattern: set invalid parent."] = function () {
  var child = new _Pattern.default("pattern-type", "pattern");
  child.parent = "";

  _assert.default.equal(child.parent, null);
};
//# sourceMappingURL=Pattern.js.map