"use strict";

var _ValuePattern = _interopRequireDefault(require("../patterns/value/ValuePattern.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["ValuePattern: Default state no children."] = function () {
  var valuePattern = new _ValuePattern.default("value-pattern");

  _assert.default.equal(valuePattern.children.length, 0);

  _assert.default.equal(valuePattern.name, "value-pattern");
};

exports["ValuePattern: Clone and parse."] = function () {
  var valuePattern = new _ValuePattern.default("value-pattern");

  _assert.default.throws(function () {
    valuePattern.clone();
  });

  _assert.default.throws(function () {
    valuePattern.parse();
  });
};
//# sourceMappingURL=ValuePattern.js.map