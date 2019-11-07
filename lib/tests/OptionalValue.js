"use strict";

var _Literal = _interopRequireDefault(require("../patterns/value/Literal.js"));

var _OptionalValue = _interopRequireDefault(require("../patterns/value/OptionalValue.js"));

var _assert = _interopRequireDefault(require("assert"));

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["OptionalValue: Empty constructor."] = () => {
  _assert.default.throws(() => {
    new _OptionalValue.default();
  });
};

exports["OptionalValue: Empty pattern."] = () => {
  _assert.default.throws(() => {
    new _OptionalValue.default();
  });
};

exports["OptionalValue: Invalid pattern."] = () => {
  _assert.default.throws(() => {
    new _OptionalValue.default({});
  });
};

exports["OptionalValue: Match pattern."] = () => {
  const john = new _Literal.default("john", "John");
  const optionalValue = new _OptionalValue.default(john);
  const cursor = new _Cursor.default("John");
  const node = optionalValue.parse(cursor);

  _assert.default.equal(node.type, "john");

  _assert.default.equal(node.value, "John");
};

exports["OptionalValue: No Match pattern."] = () => {
  const john = new _Literal.default("john", "John");
  const optionalValue = new _OptionalValue.default(john);
  const cursor = new _Cursor.default("Jane");
  const node = optionalValue.parse(cursor);

  _assert.default.equal(node, null);
};
//# sourceMappingURL=OptionalValue.js.map