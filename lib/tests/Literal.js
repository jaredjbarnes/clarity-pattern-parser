"use strict";

var _Literal = _interopRequireDefault(require("../patterns/Literal.js"));

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["Literal: One character, Exact."] = () => {
  const cursor = new _Cursor.default("2");
  const literal = new _Literal.default("two", "2");
  const node = literal.parse(cursor);

  _assert.default.equal(node.value, "2");

  _assert.default.equal(node.type, "two");

  _assert.default.equal(node.startIndex, 0);

  _assert.default.equal(node.endIndex, 0);

  _assert.default.equal(cursor.lastIndex(), 0);
};

exports["Literal: Two characters, Exact."] = () => {
  const cursor = new _Cursor.default("20");
  const literal = new _Literal.default("twenty", "20");
  const node = literal.parse(cursor);

  _assert.default.equal(node.value, "20");

  _assert.default.equal(node.type, "twenty");

  _assert.default.equal(node.startIndex, 0);

  _assert.default.equal(node.endIndex, 1);

  _assert.default.equal(cursor.lastIndex(), 1);
};

exports["Literal: One character, Within."] = () => {
  const cursor = new _Cursor.default("200");
  const literal = new _Literal.default("two", "2");
  const node = literal.parse(cursor);

  _assert.default.equal(node.value, "2");

  _assert.default.equal(node.type, "two");

  _assert.default.equal(cursor.getIndex(), 1);

  _assert.default.equal(cursor.getChar(), "0");

  _assert.default.equal(node.startIndex, 0);

  _assert.default.equal(node.endIndex, 0);

  _assert.default.equal(cursor.lastIndex(), 2);
};

exports["Literal: Two characters, Within."] = () => {
  const cursor = new _Cursor.default("200");
  const literal = new _Literal.default("twenty", "20");
  const node = literal.parse(cursor);

  _assert.default.equal(node.value, "20");

  _assert.default.equal(node.type, "twenty");

  _assert.default.equal(cursor.getIndex(), 2);

  _assert.default.equal(cursor.getChar(), "0");

  _assert.default.equal(node.startIndex, 0);

  _assert.default.equal(node.endIndex, 1);

  _assert.default.equal(cursor.lastIndex(), 2);
};
//# sourceMappingURL=Literal.js.map