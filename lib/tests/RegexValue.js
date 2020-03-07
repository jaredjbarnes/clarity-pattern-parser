"use strict";

var _index = require("../index.js");

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["RegexValue: exec."] = function () {
  var notA = new _index.RegexValue("not-a", "[^a]+");
  var result = notA.exec("John");
  var result2 = notA.exec("a");
  var expectedValue = {
    type: "regex-value",
    name: "not-a",
    startIndex: 0,
    endIndex: 3,
    value: "John"
  };

  _assert.default.equal(JSON.stringify(result), JSON.stringify(expectedValue));

  _assert.default.equal(result2, null);
};
//# sourceMappingURL=RegexValue.js.map