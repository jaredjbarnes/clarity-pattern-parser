"use strict";

var _Literal = _interopRequireDefault(require("../patterns/value/Literal.js"));

var _OptionalValue = _interopRequireDefault(require("../patterns/value/OptionalValue.js"));

var _assert = _interopRequireDefault(require("assert"));

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["OptionalValue: Empty constructor."] = function () {
  _assert.default.throws(function () {
    new _OptionalValue.default();
  });
};

exports["OptionalValue: Empty pattern."] = function () {
  _assert.default.throws(function () {
    new _OptionalValue.default();
  });
};

exports["OptionalValue: Invalid pattern."] = function () {
  _assert.default.throws(function () {
    new _OptionalValue.default({});
  });
};

exports["OptionalValue: Match pattern."] = function () {
  var john = new _Literal.default("john", "John");
  var optionalValue = new _OptionalValue.default(john);
  var cursor = new _Cursor.default("John");
  var node = optionalValue.parse(cursor);

  _assert.default.equal(node.name, "john");

  _assert.default.equal(node.value, "John");
};

exports["OptionalValue: No Match pattern."] = function () {
  var john = new _Literal.default("john", "John");
  var optionalValue = new _OptionalValue.default(john);
  var cursor = new _Cursor.default("Jane");
  var node = optionalValue.parse(cursor);

  _assert.default.equal(node, null);
};

exports["OptionalValue: Name"] = function () {
  var john = new _Literal.default("john", "John");
  var optionalValue = new _OptionalValue.default(john);

  _assert.default.equal(optionalValue.name, "optional-value");
};
//# sourceMappingURL=OptionalValue.js.map