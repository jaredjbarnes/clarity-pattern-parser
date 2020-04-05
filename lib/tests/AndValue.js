"use strict";

var _AndValue = _interopRequireDefault(require("../patterns/value/AndValue.js"));

var _Literal = _interopRequireDefault(require("../patterns/value/Literal.js"));

var _OptionalValue = _interopRequireDefault(require("../patterns/value/OptionalValue.js"));

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

var _assert = _interopRequireDefault(require("assert"));

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

  _assert.default.equal(node.name, "full-name");

  _assert.default.equal(node.value, "JohnDoe");

  _assert.default.equal(node.startIndex, 0);

  _assert.default.equal(node.endIndex, 6);
};

exports["AndValue: First Part Match with optional Second part."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var lastName = new _Literal.default("last-name", "Doe");
  var fullName = new _AndValue.default("full-name", [firstName, new _OptionalValue.default(lastName)]);
  var cursor = new _Cursor.default("John");
  var node = fullName.parse(cursor);

  _assert.default.equal(node.name, "full-name");

  _assert.default.equal(node.value, "John");

  _assert.default.equal(node.startIndex, 0);

  _assert.default.equal(node.endIndex, 3);
};

exports["AndValue: First Part Match, but run out for second part."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var lastName = new _Literal.default("last-name", "Doe");
  var fullName = new _AndValue.default("full-name", [firstName, lastName]);
  var cursor = new _Cursor.default("John");
  var node = fullName.parse(cursor);

  _assert.default.equal(node, null);
};

exports["AndValue: No Match"] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var lastName = new _Literal.default("last-name", "Doe");
  var fullName = new _AndValue.default("full-name", [firstName, lastName]);
  var cursor = new _Cursor.default("JaneDoe");
  var node = fullName.parse(cursor);

  _assert.default.equal(node, null);
};

exports["AndValue: Partial Match without optional siblings."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var lastName = new _Literal.default("last-name", "Doe");
  var fullName = new _AndValue.default("full-name", [firstName, lastName]);
  var cursor = new _Cursor.default("JohnSmith");
  var node = fullName.parse(cursor);

  _assert.default.equal(node, null);
};

exports["AndValue: Success with more to parse"] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var lastName = new _Literal.default("last-name", "Doe");
  var fullName = new _AndValue.default("full-name", [firstName, lastName]);
  var cursor = new _Cursor.default("JohnDoe JaneDoe");
  var node = fullName.parse(cursor);

  _assert.default.equal(node.name, "full-name");

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

exports["AndValue: Clone with custom name."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var lastName = new _Literal.default("last-name", "Doe");
  var fullName = new _AndValue.default("full-name", [firstName, lastName]);
  var clone = fullName.clone("full-name-2");
  var fullNamePatterns = fullName.children;
  var _cloneChildren = clone.children;

  _assert.default.notEqual(fullNamePatterns[0], _cloneChildren[0]);

  _assert.default.notEqual(fullNamePatterns[1], _cloneChildren[1]);

  _assert.default.equal(clone.name, "full-name-2");
};

exports["AndValue: getPossibilities."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var lastName = new _Literal.default("last-name", "Doe");
  var fullName = new _AndValue.default("full-name", [firstName, lastName]);
  var possibilities = fullName.getPossibilities();

  _assert.default.equal(possibilities.length, 1);

  _assert.default.equal(possibilities[0], "JohnDoe");
};

exports["AndValue: getPossibilities with itself being the root pattern."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var lastName = new _Literal.default("last-name", "Doe");
  var fullName = new _AndValue.default("full-name", [firstName, lastName]);
  var possibilities = fullName.getPossibilities(fullName);

  _assert.default.equal(possibilities.length, 1);

  _assert.default.equal(possibilities[0], "JohnDoe");
};

exports["AndValue: getPossibilities with a invalid root."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var lastName = new _Literal.default("last-name", "Doe");
  var fullName = new _AndValue.default("full-name", [firstName, lastName]);
  var possibilities = fullName.getPossibilities("");

  _assert.default.equal(possibilities.length, 1);

  _assert.default.equal(possibilities[0], "JohnDoe");
};

exports["AndValue: Partial Match."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var lastName = new _Literal.default("last-name", "Doe");
  var fullName = new _AndValue.default("full-name", [firstName, new _OptionalValue.default(lastName)]);
  var result = fullName.parse(new _Cursor.default("JohnBo"));

  _assert.default.equal(result.type, "and-value");

  _assert.default.equal(result.name, "full-name");

  _assert.default.equal(result.value, "John");
};

exports["AndValue: Partial Match with string running out, and optional last name."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var lastName = new _Literal.default("last-name", "Doe");
  var fullName = new _AndValue.default("full-name", [firstName, new _OptionalValue.default(lastName)]);
  var result = fullName.parse(new _Cursor.default("JohnDo"));

  _assert.default.equal(result.type, "and-value");

  _assert.default.equal(result.name, "full-name");

  _assert.default.equal(result.value, "John");
};

exports["AndValue: Three parts first optional."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var middle = new _Literal.default("middle", "Smith");
  var lastName = new _Literal.default("last-name", "Doe");
  var fullName = new _AndValue.default("full-name", [new _OptionalValue.default(firstName), middle, lastName]);
  var result = fullName.parse(new _Cursor.default("SmithDoe"));

  _assert.default.equal(result.value, "SmithDoe");

  _assert.default.equal(result.type, "and-value");

  _assert.default.equal(result.name, "full-name");
};

exports["AndValue: Three parts middle optional."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var middle = new _Literal.default("middle", "Smith");
  var lastName = new _Literal.default("last-name", "Doe");
  var fullName = new _AndValue.default("full-name", [firstName, new _OptionalValue.default(middle), lastName]);
  var result = fullName.parse(new _Cursor.default("JohnDo"));

  _assert.default.equal(result, null);
};

exports["AndValue: Three parts third optional."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var middle = new _Literal.default("middle", "Smith");
  var lastName = new _Literal.default("last-name", "Doe");
  var fullName = new _AndValue.default("full-name", [firstName, middle, new _OptionalValue.default(lastName)]);
  var result = fullName.parse(new _Cursor.default("JohnSmith"));

  _assert.default.equal(result.value, "JohnSmith");

  _assert.default.equal(result.type, "and-value");

  _assert.default.equal(result.name, "full-name");
};
//# sourceMappingURL=AndValue.js.map