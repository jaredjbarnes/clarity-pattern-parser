"use strict";

var _Pattern = _interopRequireDefault(require("../patterns/Pattern.js"));

var _AndValue = _interopRequireDefault(require("../patterns/value/AndValue.js"));

var _OrValue = _interopRequireDefault(require("../patterns/value/OrValue.js"));

var _Literal = _interopRequireDefault(require("../patterns/value/Literal.js"));

var _RepeatValue = _interopRequireDefault(require("../patterns/value/RepeatValue.js"));

var _OptionalValue = _interopRequireDefault(require("../patterns/value/OptionalValue.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["Pattern: parse."] = function () {
  var valuePattern = new _Pattern.default("pattern-type", "pattern");

  _assert.default.throws(function () {
    valuePattern.parse();
  });
};

exports["Pattern: clone."] = function () {
  var valuePattern = new _Pattern.default("pattern-type", "pattern");

  _assert.default.throws(function () {
    valuePattern.clone();
  });
};

exports["Pattern: getPossibilities."] = function () {
  var valuePattern = new _Pattern.default("pattern-type", "pattern");

  _assert.default.throws(function () {
    valuePattern.getPossibilities();
  });
};

exports["Pattern: limited arguments."] = function () {
  new _Pattern.default(undefined, "name");
};

exports["Pattern: no arguments."] = function () {
  _assert.default.throws(function () {
    new _Pattern.default();
  });
};

exports["Pattern: set parent."] = function () {
  var parent = new _Pattern.default("pattern-type", "pattern");
  var child = new _Pattern.default("pattern-type", "pattern");
  child.parent = parent;
};

exports["Pattern: set invalid parent."] = function () {
  var child = new _Pattern.default("pattern-type", "pattern");
  child.parent = "";

  _assert.default.equal(child.parent, null);
};

exports["Pattern: getTokens"] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var lastName = new _Literal.default("last-name", "Doe");
  var fullName = new _AndValue.default("full-name", [firstName, lastName]);
  var tokens = firstName.getTokens();

  _assert.default.equal(tokens.length, 1);

  _assert.default.equal(tokens[0], "John");

  tokens = lastName.getTokens();

  _assert.default.equal(tokens.length, 1);

  _assert.default.equal(tokens[0], "Doe");

  tokens = fullName.getTokens();

  _assert.default.equal(tokens.length, 1);

  _assert.default.equal(tokens[0], "John");
};

exports["Pattern: getNextToken one deep."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var lastName = new _Literal.default("last-name", "Doe");
  var fullName = new _AndValue.default("full-name", [firstName, lastName]);
  var tokens = fullName.children[0].getNextTokens();

  _assert.default.equal(tokens.length, 1);

  _assert.default.equal(tokens[0], "Doe");
};

exports["Pattern: getNextToken two deep."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var lastName = new _Literal.default("last-name", "Doe");
  var otherLastName = new _Literal.default("other-last-name", "Smith");
  var lastNames = new _OrValue.default("last-names", [lastName, otherLastName]);
  var fullName = new _AndValue.default("full-name", [firstName, lastNames]);
  var tokens = fullName.children[0].getNextTokens();

  _assert.default.equal(tokens.length, 2);

  _assert.default.equal(tokens[0], "Doe");

  _assert.default.equal(tokens[1], "Smith");
};

exports["Pattern: getNextToken three deep."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var lastName = new _Literal.default("last-name", "Doe");
  var middleName = new _Literal.default("middle-name", "Moses");
  var otherMiddleName = new _Literal.default("other-middle-name", "Joshua");
  var middleNames = new _OrValue.default("middle-names", [middleName, otherMiddleName]);
  var otherLastName = new _Literal.default("other-last-name", "Smith");
  var lastNames = new _OrValue.default("last-names", [lastName, otherLastName]);
  var fullName = new _AndValue.default("full-name", [firstName, middleNames, lastNames]);
  var tokens = fullName.children[1].children[1].getNextTokens();

  _assert.default.equal(tokens.length, 2);

  _assert.default.equal(tokens[0], "Doe");

  _assert.default.equal(tokens[1], "Smith");
};

exports["Pattern: getNextToken end of patterns."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var lastName = new _Literal.default("last-name", "Doe");
  var middleName = new _Literal.default("middle-name", "Moses");
  var otherMiddleName = new _Literal.default("other-middle-name", "Joshua");
  var middleNames = new _OrValue.default("middle-names", [middleName, otherMiddleName]);
  var otherLastName = new _Literal.default("other-last-name", "Smith");
  var lastNames = new _OrValue.default("last-names", [lastName, otherLastName]);
  var fullName = new _AndValue.default("full-name", [firstName, middleNames, lastNames]);
  var tokens = fullName.children[2].children[1].getNextTokens();

  _assert.default.equal(tokens.length, 0);
};

exports["Pattern: getNextToken end of patterns."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var lastName = new _Literal.default("last-name", "Doe");
  var moses = new _Literal.default("moses", "Moses");
  var joshua = new _Literal.default("other-middle-name", "Joshua");
  var moreLastNames = new _OrValue.default("more-last-names", [moses, joshua]);
  var otherLastName = new _Literal.default("other-last-name", "Smith");
  var lastNames = new _OrValue.default("last-names", [moreLastNames, lastName, otherLastName]);
  var fullName = new _AndValue.default("full-name", [firstName, lastNames]);
  var tokens = fullName.children[0].getNextTokens();

  _assert.default.equal(tokens.length, 4);

  _assert.default.equal(tokens[0], "Moses");

  _assert.default.equal(tokens[1], "Joshua");

  _assert.default.equal(tokens[2], "Doe");

  _assert.default.equal(tokens[3], "Smith");
};

exports["Pattern: getNextTokens, with repeat."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var edward = new _Literal.default("edward", "Edward");
  var middleName = new _RepeatValue.default("middle-names", edward);
  var lastName = new _Literal.default("lastName", "Doe");
  var fullName = new _AndValue.default("full-name", [firstName, middleName, lastName]);
  var tokens = fullName.children[0].getNextTokens();

  _assert.default.equal(tokens.length, 1);

  _assert.default.equal(tokens[0], "Edward");

  tokens = fullName.children[1].children[0].getNextTokens();

  _assert.default.equal(tokens.length, 2);

  _assert.default.equal(tokens[0], "Edward");

  _assert.default.equal(tokens[1], "Doe");
};

exports["Pattern: getNextTokens, with repeat and divider."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var edward = new _Literal.default("edward", "Edward");
  var stewart = new _Literal.default("stewart", "Stewart");
  var middleName = new _RepeatValue.default("middle-names", edward, stewart);
  var lastName = new _Literal.default("lastName", "Doe");
  var fullName = new _AndValue.default("full-name", [firstName, middleName, lastName]);
  var tokens = fullName.children[0].getNextTokens();

  _assert.default.equal(tokens.length, 1);

  _assert.default.equal(tokens[0], "Edward");

  tokens = fullName.children[1].children[0].getNextTokens();

  _assert.default.equal(tokens.length, 2);

  _assert.default.equal(tokens[0], "Stewart");

  _assert.default.equal(tokens[1], "Doe");

  tokens = fullName.children[1].children[1].getNextTokens();

  _assert.default.equal(tokens.length, 2);

  _assert.default.equal(tokens[0], "Edward");

  _assert.default.equal(tokens[1], "Doe");
};

exports["Pattern: getNextTokens, has child and at the beginning."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var edward = new _Literal.default("edward", "Edward");
  var stewart = new _Literal.default("stewart", "Stewart");
  var middleName = new _RepeatValue.default("middle-names", edward, stewart);
  var lastName = new _Literal.default("lastName", "Doe");
  var fullName = new _AndValue.default("full-name", [firstName, middleName, lastName]);
  var tokens = fullName.getTokens();

  _assert.default.equal(tokens.length, 1);

  _assert.default.equal(tokens[0], "John");
};

exports["Pattern: getNextTokens, has no child and is at the beginning."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var tokens = firstName.getTokens();

  _assert.default.equal(tokens.length, 1);

  _assert.default.equal(tokens[0], "John");
};

exports["Pattern: getNextTokens, and with optional start."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var middleName = new _Literal.default("middle-name", "Edward");
  var lastName = new _Literal.default("last-name", "Doe");
  var fullName = new _AndValue.default("full-name", [new _OptionalValue.default(firstName), middleName, lastName]);
  var tokens = fullName.getTokens();

  _assert.default.equal(tokens.length, 2);

  _assert.default.equal(tokens[0], "John");

  _assert.default.equal(tokens[1], "Edward");
};

exports["Pattern: getNextTokens, and with optional middle."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var middleName = new _Literal.default("middle-name", "Edward");
  var lastName = new _Literal.default("last-name", "Doe");
  var fullName = new _AndValue.default("full-name", [firstName, new _OptionalValue.default(middleName), lastName]);
  var tokens = fullName.children[0].getNextTokens();

  _assert.default.equal(tokens.length, 2);

  _assert.default.equal(tokens[0], "Edward");

  _assert.default.equal(tokens[1], "Doe");

  tokens = fullName.children[1].getNextTokens();

  _assert.default.equal(tokens.length, 1);

  _assert.default.equal(tokens[0], "Doe");

  tokens = fullName.children[2].getNextTokens();

  _assert.default.equal(tokens.length, 0);
};

exports["Pattern: getNextTokens, and with optional last."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var middleName = new _Literal.default("middle-name", "Edward");
  var lastName = new _Literal.default("last-name", "Doe");
  var fullName = new _AndValue.default("full-name", [firstName, middleName, new _OptionalValue.default(lastName)]);
  var tokens = fullName.children[0].getNextTokens();

  _assert.default.equal(tokens.length, 1);

  _assert.default.equal(tokens[0], "Edward");

  tokens = fullName.children[1].getNextTokens();

  _assert.default.equal(tokens.length, 1);

  _assert.default.equal(tokens[0], "Doe");

  tokens = fullName.children[2].getNextTokens();

  _assert.default.equal(tokens.length, 0);
};

exports["Pattern: getNextTokens, first two optional."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var middleName = new _Literal.default("middle-name", "Edward");
  var lastName = new _Literal.default("last-name", "Doe");
  var fullName = new _AndValue.default("full-name", [new _OptionalValue.default(firstName), new _OptionalValue.default(middleName), lastName]);
  var tokens = fullName.getTokens();

  _assert.default.equal(tokens.length, 3);

  _assert.default.equal(tokens[0], "John");

  _assert.default.equal(tokens[1], "Edward");

  _assert.default.equal(tokens[2], "Doe");

  tokens = fullName.children[0].getNextTokens();

  _assert.default.equal(tokens.length, 2);

  _assert.default.equal(tokens[0], "Edward");

  _assert.default.equal(tokens[1], "Doe");

  tokens = fullName.children[1].getNextTokens();

  _assert.default.equal(tokens.length, 1);

  _assert.default.equal(tokens[0], "Doe");

  tokens = fullName.children[2].getNextTokens();

  _assert.default.equal(tokens.length, 0);
};

exports["Pattern: getNextTokens, last two optional."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var middleName = new _Literal.default("middle-name", "Edward");
  var lastName = new _Literal.default("last-name", "Doe");
  var fullName = new _AndValue.default("full-name", [firstName, new _OptionalValue.default(middleName), new _OptionalValue.default(lastName)]);
  var tokens = fullName.getTokens();

  _assert.default.equal(tokens.length, 1);

  _assert.default.equal(tokens[0], "John");

  tokens = fullName.children[0].getNextTokens();

  _assert.default.equal(tokens.length, 2);

  _assert.default.equal(tokens[0], "Edward");

  _assert.default.equal(tokens[1], "Doe");

  tokens = fullName.children[1].getNextTokens();

  _assert.default.equal(tokens.length, 1);

  _assert.default.equal(tokens[0], "Doe");

  tokens = fullName.children[2].getNextTokens();

  _assert.default.equal(tokens.length, 0);
};

exports["Pattern: getNextTokens, all three optional."] = function () {
  var firstName = new _Literal.default("first-name", "John");
  var middleName = new _Literal.default("middle-name", "Edward");
  var lastName = new _Literal.default("last-name", "Doe");
  var fullName = new _AndValue.default("full-name", [new _OptionalValue.default(firstName), new _OptionalValue.default(middleName), new _OptionalValue.default(lastName)]);
  var tokens = fullName.getTokens();

  _assert.default.equal(tokens.length, 3);

  _assert.default.equal(tokens[0], "John");

  _assert.default.equal(tokens[1], "Edward");

  _assert.default.equal(tokens[2], "Doe");

  tokens = fullName.children[0].getNextTokens();

  _assert.default.equal(tokens.length, 2);

  _assert.default.equal(tokens[0], "Edward");

  _assert.default.equal(tokens[1], "Doe");

  tokens = fullName.children[1].getNextTokens();

  _assert.default.equal(tokens.length, 1);

  _assert.default.equal(tokens[0], "Doe");

  tokens = fullName.children[2].getNextTokens();

  _assert.default.equal(tokens.length, 0);
};
//# sourceMappingURL=Pattern.js.map