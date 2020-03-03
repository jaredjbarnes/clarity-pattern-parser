"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _childSelector = _interopRequireDefault(require("./childSelector.js"));

var _elementSelector = _interopRequireDefault(require("./elementSelector.js"));

var _index = require("../index.js");

var _descendantSelector = _interopRequireDefault(require("./descendantSelector.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cssSelector = new _index.OrComposite("css-selector", [_childSelector.default, _descendantSelector.default, _elementSelector.default]);
var _default = cssSelector;
exports.default = _default;
//# sourceMappingURL=cssSelector.js.map