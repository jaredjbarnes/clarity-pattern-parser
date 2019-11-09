"use strict";

var _ValueNode = _interopRequireDefault(require("../ast/ValueNode.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["ValueNode: clone."] = function () {
  var node = new _ValueNode.default("type", "value", 0, 1);
  var clone = node.clone();

  _assert.default.equal(node.type, clone.type);

  _assert.default.equal(node.value, clone.value);

  _assert.default.equal(node.startIndex, clone.startIndex);

  _assert.default.equal(node.endIndex, clone.endIndex);
};
//# sourceMappingURL=ValueNode.js.map