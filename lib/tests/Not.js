"use strict";

var _Not = _interopRequireDefault(require("../patterns/Not.js"));

var _Literal = _interopRequireDefault(require("../patterns/Literal.js"));

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["Parse twice with same parser."] = () => {
  const cursor = new _Cursor.default("1");
  const not = new _Not.default("not-two", new _Literal.default("two", "2"));
  const node = not.parse(cursor);
  cursor.moveToBeginning();
  const node2 = not.parse(cursor);

  _assert.default.equal(node.value, "1");

  _assert.default.equal(node.type, "not-two");

  _assert.default.equal(node2.value, "1");

  _assert.default.equal(node2.type, "not-two");
};

exports["One character, Exact."] = () => {
  const cursor = new _Cursor.default("1");
  const not = new _Not.default("not-two", new _Literal.default("two", "2"));
  const node = not.parse(cursor);

  _assert.default.equal(node.value, "1");

  _assert.default.equal(node.type, "not-two");
};

exports["Two characters, Exact."] = () => {
  const cursor = new _Cursor.default("10");
  const not = new _Not.default("not-twenty", new _Literal.default("twenty", "20"));
  const node = not.parse(cursor);

  _assert.default.equal(node.value, "10");

  _assert.default.equal(node.type, "not-twenty");
};

exports["One character, Within."] = () => {
  const cursor = new _Cursor.default("12");
  const not = new _Not.default("not-two", new _Literal.default("two", "2"));
  const node = not.parse(cursor);

  _assert.default.equal(node.value, "1");

  _assert.default.equal(node.type, "not-two");

  _assert.default.equal(cursor.getChar(), "2");
};

exports["Two characters, Within."] = () => {
  const cursor = new _Cursor.default("1025");
  const not = new _Not.default("not-twenty", new _Literal.default("twenty-five", "25"));
  const node = not.parse(cursor);

  _assert.default.equal(node.value, "10");

  _assert.default.equal(node.type, "not-twenty");

  _assert.default.equal(cursor.getChar(), "2");
};

exports["Two characters, Within deeper."] = () => {
  const cursor = new _Cursor.default("102025");
  const not = new _Not.default("not-twenty", new _Literal.default("twenty-five", "25"));
  const node = not.parse(cursor);

  _assert.default.equal(node.value, "1020");

  _assert.default.equal(node.type, "not-twenty");

  _assert.default.equal(cursor.getChar(), "2");
};
//# sourceMappingURL=Not.js.map