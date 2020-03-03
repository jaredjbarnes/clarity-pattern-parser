"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _elementName = _interopRequireDefault(require("./elementName.js"));

var _attribute = _interopRequireDefault(require("./attribute.js"));

var _index = require("../index.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var attributeSelector = new _index.AndComposite("attribute-selector", [_elementName.default, _attribute.default]);
var elementSelector = new _index.OrComposite("element-selector", [attributeSelector, _elementName.default]);
var _default = elementSelector;
exports.default = _default;
//# sourceMappingURL=elementSelector.js.map