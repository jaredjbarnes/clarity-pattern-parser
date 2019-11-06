"use strict";

var _Literal = _interopRequireDefault(require("../patterns/value/Literal.js"));

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["Literal: Empty constructor."] = () => {
  _assert.default.throws(() => {
    new _Literal.default();
  });
};

exports["Literal: Undefined literal."] = () => {
  _assert.default.throws(() => {
    new _Literal.default("literal");
  });
};

exports["Literal: Null literal."] = () => {
  _assert.default.throws(() => {
    new _Literal.default("literal", null);
  });
};

exports["Literal: Empty literal."] = () => {
  _assert.default.throws(() => {
    new _Literal.default("literal", "");
  });
};

exports["Literal: Match."] = () => {
  const variable = new _Literal.default("variable", "var");
  const cursor = new _Cursor.default("var foo = 'Hello World';");
  const node = variable.parse(cursor);

  _assert.default.equal(node.type, "variable");

  _assert.default.equal(node.value, "var");

  _assert.default.equal(cursor.getIndex(), 3);

  _assert.default.equal(cursor.getChar(), " ");
};

exports["Literal: Match at end."] = () => {
  const variable = new _Literal.default("variable", "var");
  const cursor = new _Cursor.default("var");
  const node = variable.parse(cursor);

  _assert.default.equal(node.type, "variable");

  _assert.default.equal(node.value, "var");

  _assert.default.equal(cursor.getIndex(), 2);

  _assert.default.equal(cursor.getChar(), "r");

  _assert.default.equal(cursor.isAtEnd(), true);
};

exports["Literal: No match."] = () => {
  const variable = new _Literal.default("variable", "var");
  const cursor = new _Cursor.default("vax");

  _assert.default.throws(() => {
    variable.parse(cursor);
  });

  _assert.default.equal(cursor.getIndex(), 2);

  _assert.default.equal(cursor.getChar(), "x");
};

exports["Literal: Bad cursor."] = () => {
  const variable = new _Literal.default("variable", "var");

  _assert.default.throws(() => {
    variable.parse();
  });
};

exports["Literal: Pattern methods."] = () => {
  const variable = new _Literal.default("variable", "var");
  const clone = variable.clone();

  _assert.default.equal(variable.getName(), clone.getName());

  _assert.default.equal(variable.getType(), clone.getType());

  _assert.default.equal(variable.getValue(), clone.getValue());

  _assert.default.equal(variable.getPatterns(), clone.getPatterns());
};
//# sourceMappingURL=Literal.js.map