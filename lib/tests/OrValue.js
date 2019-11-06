"use strict";

var _OrValue = _interopRequireDefault(require("../patterns/value/OrValue.js"));

var _AnyOfThese = _interopRequireDefault(require("../patterns/value/AnyOfThese.js"));

var _Literal = _interopRequireDefault(require("../patterns/value/Literal.js"));

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["OrValue: Empty constructor."] = () => {
  _assert.default.throws(() => {
    new _OrValue.default();
  });
};

exports["OrValue: Undefined parser."] = () => {
  _assert.default.throws(() => {
    new _OrValue.default("name");
  });
};

exports["OrValue: Null patterns."] = () => {
  _assert.default.throws(() => {
    new _OrValue.default("name", null);
  });
};

exports["OrValue: Empty array parser."] = () => {
  _assert.default.throws(() => {
    new _OrValue.default("name", []);
  });
};

exports["OrValue: One parser."] = () => {
  _assert.default.throws(() => {
    new _OrValue.default("name", [new _Literal.default("some-value")]);
  });
};

exports["OrValue: Name and patterns."] = () => {
  const letter = new _AnyOfThese.default("letter", "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
  const number = new _AnyOfThese.default("number", "0987654321");
  const alphaNumeric = new _OrValue.default("alpha-numeric", [letter, number]);
  const letterCursor = new _Cursor.default("a");
  const numberCursor = new _Cursor.default("1");
  const letterNode = alphaNumeric.parse(letterCursor);
  const numberNode = alphaNumeric.parse(numberCursor);

  _assert.default.equal(letterNode.type, "alpha-numeric");

  _assert.default.equal(letterNode.value, "a");

  _assert.default.equal(numberNode.type, "alpha-numeric");

  _assert.default.equal(numberNode.value, "1");
};

exports["OrValue: Optional Pattern as one of the patterns."] = () => {
  const letter = new _AnyOfThese.default("letter", "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
  const number = new _AnyOfThese.default("number", "0987654321");
  const alphaNumeric = new _OrValue.default("alpha-numeric", [letter, number]);
  const letterCursor = new _Cursor.default("a");
  const numberCursor = new _Cursor.default("1");
  const letterNode = alphaNumeric.parse(letterCursor);
  const numberNode = alphaNumeric.parse(numberCursor);

  _assert.default.equal(letterNode.type, "alpha-numeric");

  _assert.default.equal(letterNode.value, "a");

  _assert.default.equal(numberNode.type, "alpha-numeric");

  _assert.default.equal(numberNode.value, "1");
};

exports["OrValue: Fail."] = () => {
  const letter = new _AnyOfThese.default("some-letter", "abc");
  const number = new _AnyOfThese.default("some-number", "123");
  const alphaNumeric = new _OrValue.default("some-alpha-numeric", [letter, number]);
  const letterCursor = new _Cursor.default("d");
  const numberCursor = new _Cursor.default("4");

  _assert.default.throws(() => {
    const letterNode = alphaNumeric.parse(letterCursor);
  });

  _assert.default.throws(() => {
    const numberNode = alphaNumeric.parse(numberCursor);
  });
};

exports["OrValue: Clone."] = () => {
  const letter = new _AnyOfThese.default("some-letter", "abc");
  const number = new _AnyOfThese.default("some-number", "123");
  const alphaNumeric = new _OrValue.default("some-alpha-numeric", [letter, number]);
  const clone = alphaNumeric.clone();

  _assert.default.equal(alphaNumeric.getType(), clone.getType());

  _assert.default.equal(alphaNumeric.getValue(), clone.getValue());

  _assert.default.equal(alphaNumeric.getPatterns().length, clone.getPatterns().length);

  _assert.default.equal(alphaNumeric.getName(), clone.getName());
};

exports["OrValue: Invalid patterns."] = () => {
  _assert.default.throws(() => {
    new _OrValue.default("some-alpha-numeric", [{}, null]);
  });
};

exports["OrValue: Not enough patterns."] = () => {
  _assert.default.throws(() => {
    new _OrValue.default("some-alpha-numeric", [{}]);
  });
};

exports["OrValue: Bad name."] = () => {
  _assert.default.throws(() => {
    new _OrValue.default({}, [new _Literal.default("a", "a"), new _Literal.default("a", "a")]);
  });
};

exports["OrValue: Bad cursor."] = () => {
  _assert.default.throws(() => {
    new _OrValue.default("A", [new _Literal.default("a", "a"), new _Literal.default("a", "a")]).parse();
  });
};

exports["OrValue: Furthest Parse Error."] = () => {
  const longer = new _Literal.default("longer", "Longer");
  const bang = new _Literal.default("bang", "Bang");
  const orValue = new _OrValue.default("test", [longer, bang]);
  const cursor = new _Cursor.default("Longed");

  _assert.default.throws(() => {
    orValue.parse(cursor);
  });
};

exports["OrValue: Last pattern matches."] = () => {
  const longer = new _Literal.default("longer", "Longer");
  const bang = new _Literal.default("bang", "Bang");
  const orValue = new _OrValue.default("test", [longer, bang]);
  const cursor = new _Cursor.default("Bang");
  const node = orValue.parse(cursor);

  _assert.default.equal(node.type, "test");

  _assert.default.equal(node.value, "Bang");
};
//# sourceMappingURL=OrValue.js.map