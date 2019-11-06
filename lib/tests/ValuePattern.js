"use strict";

var _ValuePattern = _interopRequireDefault(require("../patterns/ValuePattern.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["ValuePattern: getType."] = () => {
  const valuePattern = new _ValuePattern.default();

  _assert.default.equal(valuePattern.getType(), "value");
};

exports["ValuePattern: getPatterns."] = () => {
  const valuePattern = new _ValuePattern.default();

  _assert.default.equal(valuePattern.getPatterns(), null);
};

exports["ValuePattern: getValue."] = () => {
  const valuePattern = new _ValuePattern.default();

  _assert.default.throws(() => {
    valuePattern.getValue();
  });
};
//# sourceMappingURL=ValuePattern.js.map