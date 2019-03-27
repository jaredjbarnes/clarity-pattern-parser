"use strict";

var assert = _interopRequireWildcard(require("assert"));

var _Token = _interopRequireDefault(require("../Token"));

var _Cursor = _interopRequireDefault(require("../Cursor"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

exports["Token: Constructor."] = function () {
  const token = new _Token.default();
};

exports["Token: Single character."] = function () {
  const cursor = new _Cursor.default("k");
  const token = new _Token.default();
  const value = token.parse(cursor);
  assert.equal(value, "k");
};

exports["Token: Single space character."] = function () {
  const cursor = new _Cursor.default(" ");
  const token = new _Token.default();
  const value = token.parse(cursor);
  assert.equal(value, null);
};

exports["Token: Tab character."] = function () {
  const cursor = new _Cursor.default("\t");
  const token = new _Token.default();
  const value = token.parse(cursor);
  assert.equal(value, null);
};

exports["Token: Return character."] = function () {
  const cursor = new _Cursor.default("\r");
  const token = new _Token.default();
  const value = token.parse(cursor);
  assert.equal(value, null);
};

exports["Token: Newline character."] = function () {
  const cursor = new _Cursor.default("\n");
  const token = new _Token.default();
  const value = token.parse(cursor);
  assert.equal(value, null);
};

exports["Token: Single space character after token."] = function () {
  const cursor = new _Cursor.default("token ");
  const token = new _Token.default();
  const value = token.parse(cursor);
  assert.equal(value, "token");
  assert.equal(cursor.getChar(), " ");
};

exports["Token: Tab character after token."] = function () {
  const cursor = new _Cursor.default("token\t");
  const token = new _Token.default();
  const value = token.parse(cursor);
  assert.equal(value, "token");
  assert.equal(cursor.getChar(), "\t");
};

exports["Token: Return character after token."] = function () {
  const cursor = new _Cursor.default("token\r");
  const token = new _Token.default();
  const value = token.parse(cursor);
  assert.equal(value, "token");
  assert.equal(cursor.getChar(), "\r");
};

exports["Token: Newline character after token."] = function () {
  const cursor = new _Cursor.default("token\n");
  const token = new _Token.default();
  const value = token.parse(cursor);
  assert.equal(value, "token");
  assert.equal(cursor.getChar(), "\n");
};

exports["Token: Strange Token."] = function () {
  const cursor = new _Cursor.default("*`!@#%$\n");
  const token = new _Token.default();
  const value = token.parse(cursor);
  assert.equal(value, "*`!@#%$");
  assert.equal(cursor.getChar(), "\n");
};
//# sourceMappingURL=Token.js.map