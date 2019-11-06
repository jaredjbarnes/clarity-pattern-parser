"use strict";

var _AndValue = _interopRequireDefault(require("../patterns/value/AndValue.js"));

var _Literal = _interopRequireDefault(require("../patterns/value/Literal.js"));

var _assert = _interopRequireDefault(require("assert"));

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["AndValue: Empty Constructor."] = () => {
  _assert.default.throws(() => {
    new _AndValue.default();
  });
};

exports["AndValue: No patterns"] = () => {
  _assert.default.throws(() => {
    new _AndValue.default("and-value");
  });
};

exports["AndValue: Empty patterns"] = () => {
  _assert.default.throws(() => {
    new _AndValue.default("and-value", []);
  });
};

exports["AndValue: Invalid patterns"] = () => {
  _assert.default.throws(() => {
    new _AndValue.default("and-value", [{}, []]);
  });
};

exports["AndValue: One Pattern"] = () => {
  _assert.default.throws(() => {
    new _AndValue.default("and-value", [new _Literal.default("literal")]);
  });
};

exports["AndValue: Success"] = () => {
  const firstName = new _Literal.default("first-name", "John");
  const lastName = new _Literal.default("last-name", "Doe");
  const fullName = new _AndValue.default("full-name", [firstName, lastName]);
  const cursor = new _Cursor.default("JohnDoe");
  const node = fullName.parse(cursor);

  _assert.default.equal(node.type, "full-name");

  _assert.default.equal(node.value, "JohnDoe");

  _assert.default.equal(node.startIndex, 0);

  _assert.default.equal(node.endIndex, 6);
};

exports["AndValue: Success with more to parse"] = () => {
  const firstName = new _Literal.default("first-name", "John");
  const lastName = new _Literal.default("last-name", "Doe");
  const fullName = new _AndValue.default("full-name", [firstName, lastName]);
  const cursor = new _Cursor.default("JohnDoe JaneDoe");
  const node = fullName.parse(cursor);

  _assert.default.equal(node.type, "full-name");

  _assert.default.equal(node.value, "JohnDoe");

  _assert.default.equal(node.startIndex, 0);

  _assert.default.equal(node.endIndex, 6);
};

exports["AndValue: Bad cursor."] = () => {
  const firstName = new _Literal.default("first-name", "John");
  const lastName = new _Literal.default("last-name", "Doe");
  const fullName = new _AndValue.default("full-name", [firstName, lastName]);

  _assert.default.throws(() => {
    fullName.parse();
  });
};

exports["AndValue: Clone."] = () => {
  const firstName = new _Literal.default("first-name", "John");
  const lastName = new _Literal.default("last-name", "Doe");
  const fullName = new _AndValue.default("full-name", [firstName, lastName]);
  const clone = fullName.clone();
  const fullNamePatterns = fullName.getPatterns();
  const clonePatterns = clone.getPatterns();

  _assert.default.notEqual(fullNamePatterns[0], clonePatterns[0]);

  _assert.default.notEqual(fullNamePatterns[1], clonePatterns[1]);

  _assert.default.equal(fullName.getName(), clone.getName());

  _assert.default.equal(fullName.getValue(), clone.getValue());
};
//# sourceMappingURL=AndValue.js.map