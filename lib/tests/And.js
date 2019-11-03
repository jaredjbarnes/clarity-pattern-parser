"use strict";

var _Literal = _interopRequireDefault(require("../patterns/Literal.js"));

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

var _And = _interopRequireDefault(require("../patterns/And.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["And: And twice"] = () => {
  const cursor = new _Cursor.default("JohnDoe");
  const firstName = new _Literal.default("first-name", "John");
  const lastName = new _Literal.default("last-name", "Doe");
  const fullName = new _And.default("full-name", [firstName, lastName]);
  const node = fullName.parse(cursor);

  _assert.default.equal(node.type, "full-name");

  _assert.default.equal(node.children[0].type, "first-name");

  _assert.default.equal(node.children[0].value, "John");

  _assert.default.equal(node.children[1].type, "last-name");

  _assert.default.equal(node.children[1].value, "Doe");

  _assert.default.equal(cursor.isAtEnd(), true);

  _assert.default.equal(node.startIndex, 0);

  _assert.default.equal(cursor.lastIndex(), node.endIndex);
};

exports["And: Twice as Value"] = () => {
  const cursor = new _Cursor.default("JohnDoe");
  const firstName = new _Literal.default("first-name", "John");
  const lastName = new _Literal.default("last-name", "Doe");
  const fullName = new _And.default("full-name", [firstName, lastName], true);
  const node = fullName.parse(cursor);

  _assert.default.equal(node.type, "full-name");

  _assert.default.equal(node.value, "JohnDoe");

  _assert.default.equal(cursor.lastIndex(), node.endIndex);
};
//# sourceMappingURL=And.js.map