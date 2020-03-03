"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _index = require("../index.js");

var _elementSelector = _interopRequireDefault(require("./elementSelector.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var spaces = new _index.RegexValue("spaces", "\\s+");
var cssSelector = new _index.RecursivePattern("css-selector");
var descendantSelector = new _index.AndComposite("descendant-selector", [_elementSelector.default, spaces, cssSelector]);
var _default = descendantSelector;
exports.default = _default;
//# sourceMappingURL=descendantSelector.js.map