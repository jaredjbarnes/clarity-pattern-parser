"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _index = require("../index.js");

var _elementSelector = _interopRequireDefault(require("./elementSelector.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var greaterThan = new _index.Literal(">", ">");
var spaces = new _index.RegexValue("spaces", "\\s+");
var optionalSpaces = new _index.OptionalValue(spaces);
var cssSelector = new _index.RecursivePattern("css-selector");
var childSelector = new _index.AndComposite("child-selector", [_elementSelector.default, optionalSpaces, greaterThan, optionalSpaces, cssSelector]);
var _default = childSelector;
exports.default = _default;
//# sourceMappingURL=childSelector.js.map