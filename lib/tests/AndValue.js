"use strict";

var _AndValue = _interopRequireDefault(require("../patterns/value/AndValue.js"));

var _Literal = _interopRequireDefault(require("../patterns/value/Literal.js"));

var _assert = _interopRequireDefault(require("assert"));

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["AndValue: Empty Constructor."] = function () {
  _assert.default.throws(function () {
    new _AndValue.default();
  });
};

exports["AndValue: No patterns"] = function () {
  _assert.default.throws(function () {
    new _AndValue.default("and-value");
  });
};

exports["AndValue: Empty patterns"] = function () {
  _assert.default.throws(function () {
    new _AndValue.default("and-value", []);
  });
};

exports["AndValue: Invalid patterns"] = function () {
  _assert.default.throws(function () {
    new _AndValue.default("and-value", [{}, []]);
  });
};

exports["AndValue: One Pattern"] = function () {
  _assert.default.throws(function () {
    new _AndValue.default("and-value", [new _Literal.default("literal")]);
  });
};

exports["AndValue: Success"] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var lastName = new _Literal.default("last-name", "Doe");
  var fullName = new _AndValue.default("full-name", [firstName, lastName]);
  var cursor = new _Cursor.default("JohnDoe");
  var node = fullName.parse(cursor);

  _assert.default.equal(node.type, "full-name");

  _assert.default.equal(node.value, "JohnDoe");

  _assert.default.equal(node.startIndex, 0);

  _assert.default.equal(node.endIndex, 6);
};

exports["AndValue: Success with more to parse"] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var lastName = new _Literal.default("last-name", "Doe");
  var fullName = new _AndValue.default("full-name", [firstName, lastName]);
  var cursor = new _Cursor.default("JohnDoe JaneDoe");
  var node = fullName.parse(cursor);

  _assert.default.equal(node.type, "full-name");

  _assert.default.equal(node.value, "JohnDoe");

  _assert.default.equal(node.startIndex, 0);

  _assert.default.equal(node.endIndex, 6);
};

exports["AndValue: Bad cursor."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var lastName = new _Literal.default("last-name", "Doe");
  var fullName = new _AndValue.default("full-name", [firstName, lastName]);

  _assert.default.throws(function () {
    fullName.parse();
  });
};

exports["AndValue: Clone."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var lastName = new _Literal.default("last-name", "Doe");
  var fullName = new _AndValue.default("full-name", [firstName, lastName]);
  var clone = fullName.clone();
  var fullNamePatterns = fullName.children;
  var _cloneChildren = clone.children;

  _assert.default.notEqual(fullNamePatterns[0], _cloneChildren[0]);

  _assert.default.notEqual(fullNamePatterns[1], _cloneChildren[1]);

  _assert.default.equal(fullName.name, clone.name);
};
//# sourceMappingURL=AndValue.js.map