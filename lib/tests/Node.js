"use strict";

var _Node = _interopRequireDefault(require("../ast/Node.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["Node: clone."] = () => {
  _assert.default.throws(() => {
    new _Node.default("type", 0, 1).clone();
  });
};

exports["Node: With no startIndex."] = () => {
  _assert.default.throws(() => {
    new _Node.default("type", undefined, 1).clone();
  });
};

exports["Node: With no endIndex."] = () => {
  _assert.default.throws(() => {
    new _Node.default("type", 0).clone();
  });
};
//# sourceMappingURL=Node.js.map