"use strict";

var _NotValue = _interopRequireDefault(require("../patterns/value/NotValue.js"));

var _Literal = _interopRequireDefault(require("../patterns/value/Literal.js"));

var _assert = _interopRequireDefault(require("assert"));

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["NotValue: Empty Constructor."] = () => {
  _assert.default.throws(() => {
    new _NotValue.default();
  });
};

exports["NotValue: Invalid name."] = () => {
  _assert.default.throws(() => {
    new _NotValue.default([], new _Literal.default("blah", "Blah"));
  });
};

exports["NotValue: No patterns"] = () => {
  _assert.default.throws(() => {
    new _NotValue.default("and-value");
  });
};

exports["NotValue: Empty patterns"] = () => {
  _assert.default.throws(() => {
    new _NotValue.default("and-value", null);
  });
};

exports["NotValue: Invalid patterns"] = () => {
  _assert.default.throws(() => {
    new _NotValue.default("and-value", {});
  });
};

exports["NotValue: No Match"] = () => {
  const john = new _Literal.default("john", "John");
  const notJohn = new _NotValue.default("not-john", john);
  const cursor = new _Cursor.default("John");

  _assert.default.throws(() => {
    notJohn.parse(cursor);
  });
};

exports["NotValue: GetValue"] = () => {
  const john = new _Literal.default("john", "John");
  const notJohn = new _NotValue.default("not-john", john);

  _assert.default.equal(notJohn.getValue(), null);
};

exports["NotValue: Success"] = () => {
  const john = new _Literal.default("john", "John");
  const notJohn = new _NotValue.default("not-john", john);
  const cursor = new _Cursor.default("Jane");
  const node = notJohn.parse(cursor);

  _assert.default.equal(node.type, "not-john");

  _assert.default.equal(node.value, "Jane");

  _assert.default.equal(node.startIndex, 0);

  _assert.default.equal(node.endIndex, 3);
};

exports["NotValue: Success with a terminating match."] = () => {
  const john = new _Literal.default("john", "John");
  const notJohn = new _NotValue.default("not-john", john);
  const cursor = new _Cursor.default("JaneJohn");
  const node = notJohn.parse(cursor);

  _assert.default.equal(node.type, "not-john");

  _assert.default.equal(node.value, "Jane");

  _assert.default.equal(node.startIndex, 0);

  _assert.default.equal(node.endIndex, 3);

  _assert.default.equal(cursor.getIndex(), 4);
};

exports["NotValue: Success with an almost terminating match."] = () => {
  const john = new _Literal.default("john", "John");
  const notJohn = new _NotValue.default("not-john", john);
  const cursor = new _Cursor.default("JaneJoh");
  const node = notJohn.parse(cursor);

  _assert.default.equal(node.type, "not-john");

  _assert.default.equal(node.value, "JaneJoh");

  _assert.default.equal(node.startIndex, 0);

  _assert.default.equal(node.endIndex, 6);

  _assert.default.equal(cursor.getIndex(), 6);
};

exports["NotValue: Bad cursor."] = () => {
  const john = new _Literal.default("john", "John");
  const notJohn = new _NotValue.default("not-john", john);

  _assert.default.throws(() => {
    notJohn.parse(cursor);
  });
};

exports["NotValue: Clone."] = () => {
  const john = new _Literal.default("john", "John");
  const notJohn = new _NotValue.default("not-john", john);
  const clone = notJohn.clone();

  _assert.default.equal(notJohn.getType(), clone.getType());

  _assert.default.equal(notJohn.getName(), clone.getName());
};
//# sourceMappingURL=NotValue.js.map