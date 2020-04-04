"use strict";

var _Node = _interopRequireDefault(require("../ast/Node.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["Node: clone."] = function () {
  _assert.default.throws(function () {
    new _Node.default("type", "name", 0, 1).clone();
  });
};

exports["Node: fitler."] = function () {
  _assert.default.throws(function () {
    new _Node.default("type", "name", 0, 1).filter();
  });
};

exports["Node: toString."] = function () {
  _assert.default.throws(function () {
    new _Node.default("type", "name", 0, 1).toString();
  });
};

exports["Node: With no startIndex."] = function () {
  _assert.default.throws(function () {
    new _Node.default("type", "name", undefined, 1);
  });
};

exports["Node: With no endIndex."] = function () {
  _assert.default.throws(function () {
    new _Node.default("type", "name", 0);
  });
};
//# sourceMappingURL=Node.js.map