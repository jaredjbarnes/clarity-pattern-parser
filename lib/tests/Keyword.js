"use strict";

var assert = _interopRequireWildcard(require("assert"));

var _Keyword = _interopRequireDefault(require("../Keyword"));

var _Cursor = _interopRequireDefault(require("../Cursor"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

exports["Keyword: Bad constructor."] = function () {
  assert.throws(() => {
    new _Keyword.default();
  }, {
    message: "Illegal Argument: Keyword needs to have a value that has a length greater than 0."
  });
};

exports["Keyword: Constructor."] = function () {
  new _Keyword.default("Keyword");
};

exports["Keyword: full match parse()."] = function () {
  const cursor = new _Cursor.default("Keyword");
  const keyword = new _Keyword.default("Keyword");
  const value = keyword.parse(cursor);
  assert.equal(value, "Keyword");
};

exports["Keyword: beginning match parse()."] = function () {
  const cursor = new _Cursor.default("Keyword is in the beginning");
  const keyword = new _Keyword.default("Keyword");
  const value = keyword.parse(cursor);
  assert.equal(value, "Keyword");
  assert.equal(cursor.getChar(), " ");
};

exports["Keyword: end match parse()."] = function () {
  const cursor = new _Cursor.default(" keyword");
  const keyword = new _Keyword.default("keyword");
  cursor.next();
  const value = keyword.parse(cursor);
  assert.equal(value, "keyword");
  assert.equal(cursor.getChar(), "d");
};

exports["Keyword: no match parse()."] = function () {
  const cursor = new _Cursor.default("keyw");
  const keyword = new _Keyword.default("keyword");
  const value = keyword.parse(cursor);
  assert.equal(value, null);
  assert.equal(cursor.getChar(), "w");
};

exports["Keyword: no match with more characters parse()."] = function () {
  const cursor = new _Cursor.default("key wo");
  const keyword = new _Keyword.default("keyword");
  const value = keyword.parse(cursor);
  assert.equal(value, null);
  assert.equal(cursor.getChar(), " ");
};
//# sourceMappingURL=Keyword.js.map