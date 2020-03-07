"use strict";

var _Literal = _interopRequireDefault(require("../patterns/value/Literal.js"));

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["Literal: Empty constructor."] = function () {
  _assert.default.throws(function () {
    new _Literal.default();
  });
};

exports["Literal: Undefined literal."] = function () {
  _assert.default.throws(function () {
    new _Literal.default("literal");
  });
};

exports["Literal: Null literal."] = function () {
  _assert.default.throws(function () {
    new _Literal.default("literal", null);
  });
};

exports["Literal: Empty literal."] = function () {
  _assert.default.throws(function () {
    new _Literal.default("literal", "");
  });
};

exports["Literal: exec."] = function () {
  var john = new _Literal.default("john", "John");
  var result = john.exec("John");
  var result2 = john.exec("Jane");
  var expectedValue = {
    type: "literal",
    name: "john",
    startIndex: 0,
    endIndex: 3,
    value: "John"
  };

  _assert.default.equal(JSON.stringify(result), JSON.stringify(expectedValue));

  _assert.default.equal(result2, null);
};

exports["Literal: Match."] = function () {
  var variable = new _Literal.default("variable", "var");
  var cursor = new _Cursor.default("var foo = 'Hello World';");
  var node = variable.parse(cursor);

  _assert.default.equal(node.name, "variable");

  _assert.default.equal(node.value, "var");

  _assert.default.equal(cursor.getIndex(), 2);

  _assert.default.equal(cursor.getChar(), "r");
};

exports["Literal: Match at end."] = function () {
  var variable = new _Literal.default("variable", "var");
  var cursor = new _Cursor.default("var");
  var node = variable.parse(cursor);

  _assert.default.equal(node.name, "variable");

  _assert.default.equal(node.value, "var");

  _assert.default.equal(cursor.getIndex(), 2);

  _assert.default.equal(cursor.getChar(), "r");

  _assert.default.equal(cursor.isAtEnd(), true);
};

exports["Literal: No match."] = function () {
  var variable = new _Literal.default("variable", "var");
  var cursor = new _Cursor.default("vax");
  variable.parse(cursor);

  _assert.default.equal(cursor.hasUnresolvedError(), true);

  _assert.default.equal(cursor.getIndex(), 0);

  _assert.default.equal(cursor.getChar(), "v");
};

exports["Literal: Bad cursor."] = function () {
  var variable = new _Literal.default("variable", "var");

  _assert.default.throws(function () {
    variable.parse();
  });
};

exports["Literal: Pattern methods."] = function () {
  var variable = new _Literal.default("variable", "var");
  var clone = variable.clone();

  _assert.default.equal(variable.name, clone.name);

  _assert.default.equal(variable.children.length, clone.children.length);
};
//# sourceMappingURL=Literal.js.map