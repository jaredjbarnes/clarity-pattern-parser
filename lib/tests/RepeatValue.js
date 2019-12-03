"use strict";

var _RepeatValue = _interopRequireDefault(require("../patterns/value/RepeatValue.js"));

var _Literal = _interopRequireDefault(require("../patterns/value/Literal.js"));

var _OptionalValue = _interopRequireDefault(require("../patterns/value/OptionalValue.js"));

var _assert = _interopRequireDefault(require("assert"));

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["RepeatValue: Empty Constructor."] = function () {
  _assert.default.throws(function () {
    new _RepeatValue.default();
  });
};

exports["RepeatValue: Invalid name."] = function () {
  _assert.default.throws(function () {
    new _RepeatValue.default([], new _Literal.default("blah", "Blah"));
  });
};

exports["RepeatValue: No patterns"] = function () {
  _assert.default.throws(function () {
    new _RepeatValue.default("and-value");
  });
};

exports["RepeatValue: Empty patterns"] = function () {
  _assert.default.throws(function () {
    new _RepeatValue.default("and-value", null);
  });
};

exports["RepeatValue: Invalid patterns"] = function () {
  _assert.default.throws(function () {
    new _RepeatValue.default("and-value", {});
  });
};

exports["RepeatValue: No Match"] = function () {
  var john = new _Literal.default("john", "John");
  var johns = new _RepeatValue.default("johns", john);
  var cursor = new _Cursor.default("JaneJane");
  johns.parse(cursor);

  _assert.default.equal(cursor.hasUnresolvedError(), true);
};

exports["RepeatValue: Success, one John"] = function () {
  var john = new _Literal.default("john", "John");
  var johns = new _RepeatValue.default("johns", john);
  var cursor = new _Cursor.default("John");
  var node = johns.parse(cursor);

  _assert.default.equal(node.name, "johns");

  _assert.default.equal(node.value, "John");

  _assert.default.equal(node.startIndex, 0);

  _assert.default.equal(node.endIndex, 3);
};

exports["RepeatValue: Success with a terminating match."] = function () {
  var john = new _Literal.default("john", "John");
  var johns = new _RepeatValue.default("johns", john);
  var cursor = new _Cursor.default("JohnJohnJane");
  var node = johns.parse(cursor);

  _assert.default.equal(node.name, "johns");

  _assert.default.equal(node.value, "JohnJohn");

  _assert.default.equal(node.startIndex, 0);

  _assert.default.equal(node.endIndex, 7);

  _assert.default.equal(cursor.getIndex(), 7);
};

exports["RepeatValue: Bad cursor."] = function () {
  var john = new _Literal.default("john", "John");
  var johns = new _RepeatValue.default("johns", john);

  _assert.default.throws(function () {
    johns.parse(cursor);
  });
};

exports["RepeatValue: Clone."] = function () {
  var john = new _Literal.default("john", "John");
  var johns = new _RepeatValue.default("johns", john);
  var clone = johns.clone();

  _assert.default.equal(johns.name, clone.name);
};

exports["RepeatValue: Try Optional."] = function () {
  var john = new _Literal.default("john", "John");

  _assert.default.throws(function () {
    new _RepeatValue.default("johns", new _OptionalValue.default(john));
  });
};

exports["RepeatValue: With divider."] = function () {
  var cursor = new _Cursor.default("John,John");
  var john = new _Literal.default("john", "John");
  var divider = new _Literal.default("divider", ",");
  var node = new _RepeatValue.default("johns", john, divider).parse(cursor);

  _assert.default.equal(node.name, "johns");

  _assert.default.equal(node.value, "John,John");
};
//# sourceMappingURL=RepeatValue.js.map