"use strict";

var _CompositeNode = _interopRequireDefault(require("../ast/CompositeNode.js"));

var _assert = _interopRequireDefault(require("assert"));

var _index = require("../index.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["CompositeNode: clone"] = function () {
  var node = new _CompositeNode.default("type", "name", 0, 0);
  var valueNode = new _index.ValueNode("value-type", "value-name", "t", 0, 0);
  node.children.push(valueNode);
  var clone = node.clone();

  _assert.default.equal(clone.type, "type");

  _assert.default.equal(clone.name, "name");

  _assert.default.equal(clone.children.length, 1);

  _assert.default.equal(clone.children[0].type, "value-type");

  _assert.default.equal(clone.children[0].name, "value-name");
};

exports["CompositeNode: constructor without default indexes."] = function () {
  var node = new _CompositeNode.default("type", "name");
  var valueNode = new _index.ValueNode("value-type", "value-name", "t", 0, 0);
  node.children.push(valueNode);

  _assert.default.equal(node.type, "type");

  _assert.default.equal(node.name, "name");

  _assert.default.equal(node.children.length, 1);

  _assert.default.equal(node.children[0].type, "value-type");

  _assert.default.equal(node.children[0].name, "value-name");
};
//# sourceMappingURL=CompositeNode.js.map