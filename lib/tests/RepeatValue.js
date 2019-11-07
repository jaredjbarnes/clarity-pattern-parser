"use strict";

var _RepeatValue = _interopRequireDefault(require("../patterns/value/RepeatValue.js"));

var _Literal = _interopRequireDefault(require("../patterns/value/Literal.js"));

var _OptionalValue = _interopRequireDefault(require("../patterns/value/OptionalValue.js"));

var _assert = _interopRequireDefault(require("assert"));

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["RepeatValue: Empty Constructor."] = () => {
  _assert.default.throws(() => {
    new _RepeatValue.default();
  });
};

exports["RepeatValue: Invalid name."] = () => {
  _assert.default.throws(() => {
    new _RepeatValue.default([], new _Literal.default("blah", "Blah"));
  });
};

exports["RepeatValue: No patterns"] = () => {
  _assert.default.throws(() => {
    new _RepeatValue.default("and-value");
  });
};

exports["RepeatValue: Empty patterns"] = () => {
  _assert.default.throws(() => {
    new _RepeatValue.default("and-value", null);
  });
};

exports["RepeatValue: Invalid patterns"] = () => {
  _assert.default.throws(() => {
    new _RepeatValue.default("and-value", {});
  });
};

exports["RepeatValue: No Match"] = () => {
  const john = new _Literal.default("john", "John");
  const johns = new _RepeatValue.default("johns", john);
  const cursor = new _Cursor.default("JaneJane");

  _assert.default.throws(() => {
    johns.parse(cursor);
  });
};

exports["RepeatValue: GetValue"] = () => {
  const john = new _Literal.default("john", "John");
  const johns = new _RepeatValue.default("johns", john);

  _assert.default.equal(johns.getValue(), null);
};

exports["RepeatValue: Success, one John"] = () => {
  const john = new _Literal.default("john", "John");
  const johns = new _RepeatValue.default("johns", john);
  const cursor = new _Cursor.default("John");
  const node = johns.parse(cursor);

  _assert.default.equal(node.type, "johns");

  _assert.default.equal(node.value, "John");

  _assert.default.equal(node.startIndex, 0);

  _assert.default.equal(node.endIndex, 3);
};

exports["RepeatValue: Success with a terminating match."] = () => {
  const john = new _Literal.default("john", "John");
  const johns = new _RepeatValue.default("johns", john);
  const cursor = new _Cursor.default("JohnJohnJane");
  const node = johns.parse(cursor);

  _assert.default.equal(node.type, "johns");

  _assert.default.equal(node.value, "JohnJohn");

  _assert.default.equal(node.startIndex, 0);

  _assert.default.equal(node.endIndex, 7);

  _assert.default.equal(cursor.getIndex(), 8);
};

exports["RepeatValue: Bad cursor."] = () => {
  const john = new _Literal.default("john", "John");
  const johns = new _RepeatValue.default("johns", john);

  _assert.default.throws(() => {
    johns.parse(cursor);
  });
};

exports["RepeatValue: Clone."] = () => {
  const john = new _Literal.default("john", "John");
  const johns = new _RepeatValue.default("johns", john);
  const clone = johns.clone();

  _assert.default.equal(johns.getType(), clone.getType());

  _assert.default.equal(johns.getName(), clone.getName());
};

exports["RepeatValue: Try Optional."] = () => {
  const john = new _Literal.default("john", "John");

  _assert.default.throws(() => {
    new _RepeatValue.default("johns", new _OptionalValue.default(john));
  });
};
//# sourceMappingURL=RepeatValue.js.map