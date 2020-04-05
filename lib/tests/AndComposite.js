"use strict";

var _AndComposite = _interopRequireDefault(require("../patterns/composite/AndComposite.js"));

var _Literal = _interopRequireDefault(require("../patterns/value/Literal.js"));

var _OptionalValue = _interopRequireDefault(require("../patterns/value/OptionalValue.js"));

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

exports["AndComposite: test."] = function () {
  var john = new _Literal.default("john", "John");
  var doe = new _Literal.default("doe", "Doe");
  var name = new _AndComposite.default("name", [john, doe]);
  var isMatch = name.test("JohnDoe");

  _assert.default.equal(isMatch, true);
};

exports["AndComposite: no children."] = function () {
  _assert.default.throws(function () {
    new _AndComposite.default("name");
  });
};

exports["AndComposite: string runs out before match is done."] = function () {
  var first = new _Literal.default("first", "John");
  var last = new _Literal.default("last", "Doe");
  var name = new _AndComposite.default("name", [first, last]);
  var cursor = new _index.Cursor("JohnDo");
  var result = name.parse(cursor);
};

exports["AndComposite: last name is optional."] = function () {
  var first = new _Literal.default("first", "John");
  var last = new _OptionalValue.default(new _Literal.default("last", "Boe"));
  var name = new _AndComposite.default("name", [first, last]);
  var cursor = new _index.Cursor("JohnDo");
  var result = name.parse(cursor);

  _assert.default.equal(result.name, "name");

  _assert.default.equal(result.type, "and-composite");

  _assert.default.equal(result.children[0].value, "John");

  _assert.default.equal(result.children[0].name, "first");

  _assert.default.equal(result.children[0].type, "literal");
};

exports["AndComposite: three non-optional patterns."] = function () {
  var first = new _Literal.default("first", "John");
  var middle = new _Literal.default("middle", "Smith");
  var last = new _Literal.default("last", "Doe");
  var name = new _AndComposite.default("name", [first, middle, last]);
  var cursor = new _index.Cursor("JohnDoe");
  var result = name.parse(cursor);
};

exports["AndComposite: full name, middle optional, and last name isn't."] = function () {
  var first = new _Literal.default("first", "John");
  var middle = new _OptionalValue.default(new _Literal.default("middle", "Smith"));
  var last = new _Literal.default("last", "Doe");
  var name = new _AndComposite.default("name", [first, middle, last]);
  var cursor = new _index.Cursor("JohnDoe");
  var result = name.parse(cursor);
};

exports["AndComposite: clone."] = function () {
  var john = new _Literal.default("john", "John");
  var doe = new _Literal.default("doe", "Doe");
  var name = new _AndComposite.default("name", [john, doe]);
  var clone = name.clone("name2");

  _assert.default.equal(clone.name, "name2");
};
//# sourceMappingURL=AndComposite.js.map