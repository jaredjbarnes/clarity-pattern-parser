"use strict";

var assert = _interopRequireWildcard(require("assert"));

var _Cursor = _interopRequireDefault(require("../Cursor"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

exports["Cursor: Bad constructor."] = function () {
  assert.throws(() => {
    new _Cursor.default();
  }, {
    message: "Illegal Argument: Cursor needs to have a string that has a length greater than 0."
  });
};

exports["Cursor: Constructor."] = function () {
  new _Cursor.default("String of Text!");
};

exports["Cursor: moveToLast()"] = function () {
  const cursor = new _Cursor.default("abc");
  cursor.moveToLast();
  assert.equal(cursor.getChar(), "c");
};

exports["Cursor: moveToBeginning()"] = function () {
  const cursor = new _Cursor.default("abc");
  cursor.moveToBeginning();
  assert.equal(cursor.getChar(), "a");
};

exports["Cursor: next()."] = function () {
  const cursor = new _Cursor.default("abc");
  assert.equal(cursor.getChar(), "a");
  cursor.next();
  assert.equal(cursor.getChar(), "b");
  cursor.next();
  assert.equal(cursor.getChar(), "c");
};

exports["Cursor: Unchecked next()."] = function () {
  const cursor = new _Cursor.default("a");
  assert.throws(() => {
    cursor.next();
  }, {
    message: "Out of Bounds Exception."
  });
};

exports["Cursor: previous()."] = function () {
  const cursor = new _Cursor.default("abc");
  cursor.moveToLast();
  assert.equal(cursor.getChar(), "c");
  cursor.previous();
  assert.equal(cursor.getChar(), "b");
  cursor.previous();
  assert.equal(cursor.getChar(), "a");
};

exports["Cursor: Unchecked previous()."] = function () {
  const cursor = new _Cursor.default("a");
  assert.throws(() => {
    cursor.previous();
  }, {
    message: "Out of Bounds Exception."
  });
};

exports["Cursor: hasNext()."] = function () {
  const cursor = new _Cursor.default("a");
  assert.equal(cursor.hasNext(), false);
};

exports["Cursor: hasPrevious()."] = function () {
  const cursor = new _Cursor.default("a");
  assert.equal(cursor.hasPrevious(), false);
};

exports["Cursor: getIndex()."] = function () {
  const cursor = new _Cursor.default("ab");
  assert.equal(cursor.getIndex(), 0);
  cursor.next();
  assert.equal(cursor.getIndex(), 1);
};

exports["Cursor: mark() and moveToMark()."] = function () {
  const cursor = new _Cursor.default("abc");
  const mark = cursor.mark();
  cursor.next();
  cursor.next();
  assert.equal(cursor.getIndex(), 2);
  cursor.moveToMark(mark);
  assert.equal(cursor.getIndex(), 0);
};

exports["Cursor: Bad mark, moveToMark()."] = function () {
  const cursor = new _Cursor.default("abc");
  assert.throws(() => {
    cursor.moveToMark({
      index: 0
    });
  }, {
    message: "Illegal Argument: The mark needs to be an instance of Mark and created by this cursor."
  });
};
//# sourceMappingURL=Cursor.js.map