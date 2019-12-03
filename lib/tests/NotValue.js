"use strict";

var _NotValue = _interopRequireDefault(require("../patterns/value/NotValue.js"));

var _OrValue = _interopRequireDefault(require("../patterns/value/OrValue.js"));

var _Literal = _interopRequireDefault(require("../patterns/value/Literal.js"));

var _assert = _interopRequireDefault(require("assert"));

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["NotValue: Empty Constructor."] = function () {
  _assert.default.throws(function () {
    new _NotValue.default();
  });
};

exports["NotValue: Invalid name."] = function () {
  _assert.default.throws(function () {
    new _NotValue.default([], new _Literal.default("blah", "Blah"));
  });
};

exports["NotValue: No patterns"] = function () {
  _assert.default.throws(function () {
    new _NotValue.default("and-value");
  });
};

exports["NotValue: Empty patterns"] = function () {
  _assert.default.throws(function () {
    new _NotValue.default("and-value", null);
  });
};

exports["NotValue: Invalid patterns"] = function () {
  _assert.default.throws(function () {
    new _NotValue.default("and-value", {});
  });
};

exports["NotValue: No Match"] = function () {
  var john = new _Literal.default("john", "John");
  var notJohn = new _NotValue.default("not-john", john);
  var cursor = new _Cursor.default("John");
  notJohn.parse(cursor);

  _assert.default.equal(cursor.hasUnresolvedError(), true);

  _assert.default.equal(cursor.parseError.message, "Didn't find any characters that didn't match the john pattern.");
};

exports["NotValue: Success"] = function () {
  var john = new _Literal.default("john", "John");
  var notJohn = new _NotValue.default("not-john", john);
  var cursor = new _Cursor.default("Jane");
  var node = notJohn.parse(cursor);

  _assert.default.equal(node.name, "not-john");

  _assert.default.equal(node.value, "J");

  _assert.default.equal(node.startIndex, 0);

  _assert.default.equal(node.endIndex, 0);

  _assert.default.equal(cursor.getIndex(), 0);
};

exports["NotValue: Clone."] = function () {
  var john = new _Literal.default("john", "John");
  var notJohn = new _NotValue.default("not-john", john);
  var clone = notJohn.clone();

  _assert.default.equal(notJohn.name, clone.name);
};
//# sourceMappingURL=NotValue.js.map