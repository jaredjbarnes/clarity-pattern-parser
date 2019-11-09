"use strict";

var _OrValue = _interopRequireDefault(require("../patterns/value/OrValue.js"));

var _AnyOfThese = _interopRequireDefault(require("../patterns/value/AnyOfThese.js"));

var _Literal = _interopRequireDefault(require("../patterns/value/Literal.js"));

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["OrValue: Empty constructor."] = function () {
  _assert.default.throws(function () {
    new _OrValue.default();
  });
};

exports["OrValue: Undefined parser."] = function () {
  _assert.default.throws(function () {
    new _OrValue.default("name");
  });
};

exports["OrValue: Null patterns."] = function () {
  _assert.default.throws(function () {
    new _OrValue.default("name", null);
  });
};

exports["OrValue: Empty array parser."] = function () {
  _assert.default.throws(function () {
    new _OrValue.default("name", []);
  });
};

exports["OrValue: One parser."] = function () {
  _assert.default.throws(function () {
    new _OrValue.default("name", [new _Literal.default("some-value")]);
  });
};

exports["OrValue: Name and patterns."] = function () {
  var letter = new _AnyOfThese.default("letter", "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
  var number = new _AnyOfThese.default("number", "0987654321");
  var alphaNumeric = new _OrValue.default("alpha-numeric", [letter, number]);
  var letterCursor = new _Cursor.default("a");
  var numberCursor = new _Cursor.default("1");
  var letterNode = alphaNumeric.parse(letterCursor);
  var numberNode = alphaNumeric.parse(numberCursor);

  _assert.default.equal(letterNode.type, "alpha-numeric");

  _assert.default.equal(letterNode.value, "a");

  _assert.default.equal(numberNode.type, "alpha-numeric");

  _assert.default.equal(numberNode.value, "1");
};

exports["OrValue: Optional Pattern as one of the patterns."] = function () {
  var letter = new _AnyOfThese.default("letter", "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
  var number = new _AnyOfThese.default("number", "0987654321");
  var alphaNumeric = new _OrValue.default("alpha-numeric", [letter, number]);
  var letterCursor = new _Cursor.default("a");
  var numberCursor = new _Cursor.default("1");
  var letterNode = alphaNumeric.parse(letterCursor);
  var numberNode = alphaNumeric.parse(numberCursor);

  _assert.default.equal(letterNode.type, "alpha-numeric");

  _assert.default.equal(letterNode.value, "a");

  _assert.default.equal(numberNode.type, "alpha-numeric");

  _assert.default.equal(numberNode.value, "1");
};

exports["OrValue: Fail."] = function () {
  var letter = new _AnyOfThese.default("some-letter", "abc");
  var number = new _AnyOfThese.default("some-number", "123");
  var alphaNumeric = new _OrValue.default("some-alpha-numeric", [letter, number]);
  var letterCursor = new _Cursor.default("d");
  var numberCursor = new _Cursor.default("4");

  _assert.default.throws(function () {
    var letterNode = alphaNumeric.parse(letterCursor);
  });

  _assert.default.throws(function () {
    var numberNode = alphaNumeric.parse(numberCursor);
  });
};

exports["OrValue: Clone."] = function () {
  var letter = new _AnyOfThese.default("some-letter", "abc");
  var number = new _AnyOfThese.default("some-number", "123");
  var alphaNumeric = new _OrValue.default("some-alpha-numeric", [letter, number]);
  var clone = alphaNumeric.clone();

  _assert.default.equal(alphaNumeric.getType(), clone.getType());

  _assert.default.equal(alphaNumeric.getValue(), clone.getValue());

  _assert.default.equal(alphaNumeric.getPatterns().length, clone.getPatterns().length);

  _assert.default.equal(alphaNumeric.getName(), clone.getName());
};

exports["OrValue: Invalid patterns."] = function () {
  _assert.default.throws(function () {
    new _OrValue.default("some-alpha-numeric", [{}, null]);
  });
};

exports["OrValue: Not enough patterns."] = function () {
  _assert.default.throws(function () {
    new _OrValue.default("some-alpha-numeric", [{}]);
  });
};

exports["OrValue: Bad name."] = function () {
  _assert.default.throws(function () {
    new _OrValue.default({}, [new _Literal.default("a", "a"), new _Literal.default("a", "a")]);
  });
};

exports["OrValue: Bad cursor."] = function () {
  _assert.default.throws(function () {
    new _OrValue.default("A", [new _Literal.default("a", "a"), new _Literal.default("a", "a")]).parse();
  });
};

exports["OrValue: Furthest Parse Error."] = function () {
  var longer = new _Literal.default("longer", "Longer");
  var bang = new _Literal.default("bang", "Bang");
  var orValue = new _OrValue.default("test", [longer, bang]);
  var cursor = new _Cursor.default("Longed");

  _assert.default.throws(function () {
    orValue.parse(cursor);
  });
};

exports["OrValue: Last pattern matches."] = function () {
  var longer = new _Literal.default("longer", "Longer");
  var bang = new _Literal.default("bang", "Bang");
  var orValue = new _OrValue.default("test", [longer, bang]);
  var cursor = new _Cursor.default("Bang");
  var node = orValue.parse(cursor);

  _assert.default.equal(node.type, "test");

  _assert.default.equal(node.value, "Bang");
};
//# sourceMappingURL=OrValue.js.map