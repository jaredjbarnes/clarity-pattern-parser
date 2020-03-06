"use strict";

var _assert = _interopRequireDefault(require("assert"));

var _element = _interopRequireDefault(require("./htmlPatterns/element.js"));

var _index = require("../index.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["Filter Nodes: Get open div node."] = function () {
  var cursor = new _index.Cursor("<div><div><span></span></div></div>");

  var node = _element.default.parse(cursor);

  var matches = node.filter(function (node) {
    return node.value === "div" && node.name === "open-element-name";
  });

  _assert.default.equal(matches.length, 2);

  _assert.default.equal(matches.every(function (n) {
    return n.name === "open-element-name";
  }), true);

  _assert.default.equal(matches.every(function (n) {
    return n.value === "div";
  }), true);
};

exports["Filter Nodes: Get div elements."] = function () {
  var cursor = new _index.Cursor("<div><div><span></span></div></div>");

  var node = _element.default.parse(cursor);

  var matches = node.filter(function (node) {
    return node.name === "element" && node.children[1].name === "open-element-name" && node.children[1].value === "div";
  });

  _assert.default.equal(matches.length, 2);

  _assert.default.equal(matches.every(function (n) {
    return n.name === "element";
  }), true);
};
//# sourceMappingURL=FilterNodes.js.map