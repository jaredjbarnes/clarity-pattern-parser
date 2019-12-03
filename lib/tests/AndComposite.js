"use strict";

var _AndComposite = _interopRequireDefault(require("../patterns/composite/AndComposite.js"));

var _Literal = _interopRequireDefault(require("../patterns/value/Literal.js"));

var _assert = _interopRequireDefault(require("assert"));

var _index = require("../index.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["AndComposite: Match."] = function () {
  var john = new _Literal.default("john", "John");
  var doe = new _Literal.default("doe", "Doe");
  var cursor = new _index.Cursor("JohnDoe");
  var name = new _AndComposite.default("name", [john, doe]);
  var node = name.parse(cursor);

  _assert.default.equal(node.name, "name");

  _assert.default.equal(node.children[0].name, "john");

  _assert.default.equal(node.children[1].name, "doe");

  _assert.default.equal(node.children[0].value, "John");

  _assert.default.equal(node.children[1].value, "Doe");
};

exports["AndComposite: No Match"] = function () {
  var john = new _Literal.default("john", "John");
  var doe = new _Literal.default("doe", "Doe");
  var cursor = new _index.Cursor("JohnSmith");
  var name = new _AndComposite.default("name", [john, doe]);
  var node = name.parse(cursor);

  _assert.default.equal(node, null);

  _assert.default.equal(cursor.getIndex(), 0);

  _assert.default.equal(cursor.hasUnresolvedError(), true);

  _assert.default.equal(cursor.parseError.message, "ParseError: Expected 'Doe' but found 'Smi'.");
};
//# sourceMappingURL=AndComposite.js.map