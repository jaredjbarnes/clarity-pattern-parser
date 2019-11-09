"use strict";

var _ValuePattern = _interopRequireDefault(require("../patterns/value/ValuePattern.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["ValuePattern: getType."] = function () {
  var valuePattern = new _ValuePattern.default("name", "value");

  _assert.default.equal(valuePattern.getType(), "value");
};

exports["ValuePattern: getPatterns."] = function () {
  var valuePattern = new _ValuePattern.default();

  _assert.default.equal(valuePattern.getPatterns(), null);
};

exports["ValuePattern: getValue."] = function () {
  var valuePattern = new _ValuePattern.default();

  _assert.default.throws(function () {
    valuePattern.getValue();
  });
};
//# sourceMappingURL=ValuePattern.js.map