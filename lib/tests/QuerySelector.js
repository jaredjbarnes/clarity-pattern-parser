"use strict";

var _QuerySelector = _interopRequireDefault(require("../QuerySelector.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["QuerySelector: Select by attribute."] = function () {
  var selector = "[type]='type-name'";
};

exports["QuerySelector: Select descendant."] = function () {
  var selector = "[type]='type' [name]='name'";
};

exports["QuerySelector: Select children."] = function () {
  var selector = "[type]='type' > [name]='name'";
};

exports["QuerySelector: Select grand-children."] = function () {
  var selector = "[type]='type' > [name]='name' > [type]='type'";
};
//# sourceMappingURL=QuerySelector.js.map