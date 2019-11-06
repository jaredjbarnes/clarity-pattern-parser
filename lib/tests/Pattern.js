"use strict";

var _Pattern = _interopRequireDefault(require("../patterns/Pattern.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["Pattern: parse."] = () => {
  const valuePattern = new _Pattern.default();

  _assert.default.throws(() => {
    valuePattern.parse();
  });
};

exports["Pattern: getName."] = () => {
  const valuePattern = new _Pattern.default();

  _assert.default.throws(() => {
    valuePattern.getName();
  });
};

exports["Pattern: getType."] = () => {
  const valuePattern = new _Pattern.default();

  _assert.default.throws(() => {
    valuePattern.getType();
  });
};

exports["Pattern: clone."] = () => {
  const valuePattern = new _Pattern.default();

  _assert.default.throws(() => {
    valuePattern.clone();
  });
};

exports["Pattern: getPatterns."] = () => {
  const valuePattern = new _Pattern.default();

  _assert.default.throws(() => {
    valuePattern.getPatterns();
  });
};
//# sourceMappingURL=Pattern.js.map