"use strict";

var _OrComposite = _interopRequireDefault(require("../patterns/composite/OrComposite.js"));

var _Literal = _interopRequireDefault(require("../patterns/value/Literal.js"));

var _OptionalValue = _interopRequireDefault(require("../patterns/value/OptionalValue.js"));

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

exports["OrComposite: Supplied only one option."] = function () {
  var john = new _Literal.default("john", "John");

  _assert.default.throws(function () {
    new _OrComposite.default("name", [john]);
  });
};

exports["OrComposite: Optional Children."] = function () {
  var john = new _Literal.default("john", "John");
  var jane = new _Literal.default("jane", "Jane");

  _assert.default.throws(function () {
    new _OrComposite.default("name", [new _OptionalValue.default(john), new _OptionalValue.default(jane)]);
  });
};

exports["OrComposite: getPossibilities."] = function () {
  var john = new _Literal.default("john", "John");
  var jane = new _Literal.default("jane", "Jane");
  var name = new _OrComposite.default("name", [john, jane]);
  var possibilities = name.getPossibilities();

  _assert.default.equal(possibilities.length, 2);

  _assert.default.equal(possibilities[0], "John");

  _assert.default.equal(possibilities[1], "Jane");
};

exports["OrComposite: parse with null cursor."] = function () {
  var john = new _Literal.default("john", "John");
  var jane = new _Literal.default("jane", "Jane");
  var cursor = new _index.Cursor("John");
  var name = new _OrComposite.default("name", [john, jane]);
  var node = name.parse(cursor);

  _assert.default.equal(node.name, "john");

  _assert.default.equal(node.value, "John");
};

exports["OrComposite: clone."] = function () {
  var john = new _Literal.default("john", "John");
  var jane = new _Literal.default("jane", "Jane");
  var name = new _OrComposite.default("name", [john, jane]);
  var clone = name.clone("name2");

  _assert.default.equal(clone.name, "name2");

  _assert.default.equal(clone.children.length, 2);

  _assert.default.equal(clone.children[0].name, "john");

  _assert.default.equal(clone.children[1].name, "jane");
};
//# sourceMappingURL=OrComposite.js.map