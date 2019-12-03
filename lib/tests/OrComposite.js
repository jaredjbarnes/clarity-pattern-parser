"use strict";

var _OrComposite = _interopRequireDefault(require("../patterns/composite/OrComposite.js"));

var _Literal = _interopRequireDefault(require("../patterns/value/Literal.js"));

var _assert = _interopRequireDefault(require("assert"));

var _index = require("../index.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["OrComposite: Match."] = function () {
  var john = new _Literal.default("john", "John");
  var jane = new _Literal.default("jane", "Jane");
  var cursor = new _index.Cursor("John");
  var name = new _OrComposite.default("name", [john, jane]);
  var node = name.parse(cursor);

  _assert.default.equal(node.name, "john");

  _assert.default.equal(node.value, "John");
};

exports["OrComposite: No Match"] = function () {
  var john = new _Literal.default("john", "John");
  var jane = new _Literal.default("jane", "Jane");
  var cursor = new _index.Cursor("Jeffrey");
  var name = new _OrComposite.default("name", [john, jane]);
  var node = name.parse(cursor);

  _assert.default.equal(node, null);

  _assert.default.equal(cursor.getIndex(), 0);

  _assert.default.equal(cursor.hasUnresolvedError(), true);
};
//# sourceMappingURL=OrComposite.js.map