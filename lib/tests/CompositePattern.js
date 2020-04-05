"use strict";

var _CompositePattern = _interopRequireDefault(require("../patterns/composite/CompositePattern"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["CompositePattern: Clone"] = function () {
  var pattern = new _CompositePattern.default("type", "name");

  _assert.default.throws(function () {
    pattern.clone();
  });
};
//# sourceMappingURL=CompositePattern.js.map