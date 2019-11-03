"use strict";

var _Literal = _interopRequireDefault(require("../patterns/Literal.js"));

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

var _Repeat = _interopRequireDefault(require("../patterns/Repeat.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["Repeat Literal twice."] = () => {
  const cursor = new _Cursor.default("JohnJohn");
  const literal = new _Literal.default("name", "John");
  const repetition = new _Repeat.default("stutter", literal);
  const node = repetition.parse(cursor);

  _assert.default.equal(node.type, "stutter");

  _assert.default.equal(node.children[0].type, "name");

  _assert.default.equal(node.children[0].value, "John");

  _assert.default.equal(node.children[1].type, "name");

  _assert.default.equal(node.children[1].value, "John");
};

exports["Repeat Literal twice with divider."] = () => {
  const cursor = new _Cursor.default("John,John");
  const name = new _Literal.default("name", "John");
  const comma = new _Literal.default("comma", ",");
  const repetition = new _Repeat.default("stutter", name, comma);
  const node = repetition.parse(cursor);

  _assert.default.equal(node.type, "stutter");

  _assert.default.equal(node.children[0].type, "name");

  _assert.default.equal(node.children[0].value, "John");

  _assert.default.equal(node.children[1].type, "comma");

  _assert.default.equal(node.children[1].value, ",");

  _assert.default.equal(node.children[2].type, "name");

  _assert.default.equal(node.children[2].value, "John");
};

exports["Repeat Literal three with divider."] = () => {
  const cursor = new _Cursor.default("John,John,John");
  const name = new _Literal.default("name", "John");
  const comma = new _Literal.default("comma", ",");
  const repetition = new _Repeat.default("stutter", name, comma);
  const node = repetition.parse(cursor);

  _assert.default.equal(node.type, "stutter");

  _assert.default.equal(node.children[0].type, "name");

  _assert.default.equal(node.children[0].value, "John");

  _assert.default.equal(node.children[1].type, "comma");

  _assert.default.equal(node.children[1].value, ",");

  _assert.default.equal(node.children[2].type, "name");

  _assert.default.equal(node.children[2].value, "John");

  _assert.default.equal(node.children[3].type, "comma");

  _assert.default.equal(node.children[3].value, ",");

  _assert.default.equal(node.children[4].type, "name");

  _assert.default.equal(node.children[4].value, "John");
};

exports["Repeat Literal three with trailing divider."] = () => {
  const cursor = new _Cursor.default("John,John,John,");
  const name = new _Literal.default("name", "John");
  const comma = new _Literal.default("comma", ",");
  const repetition = new _Repeat.default("stutter", name, comma);
  const node = repetition.parse(cursor);

  _assert.default.equal(node.type, "stutter");

  _assert.default.equal(node.children[0].type, "name");

  _assert.default.equal(node.children[0].value, "John");

  _assert.default.equal(node.children[1].type, "comma");

  _assert.default.equal(node.children[1].value, ",");

  _assert.default.equal(node.children[2].type, "name");

  _assert.default.equal(node.children[2].value, "John");

  _assert.default.equal(node.children[3].type, "comma");

  _assert.default.equal(node.children[3].value, ",");

  _assert.default.equal(node.children[4].type, "name");

  _assert.default.equal(node.children[4].value, "John");

  _assert.default.equal(node.children[5].type, "comma");

  _assert.default.equal(node.children[5].value, ",");
};
//# sourceMappingURL=Repeat.js.map