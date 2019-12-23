"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _index = require("../../index.js");

var _divider = _interopRequireDefault(require("./divider.js"));

var _values = _interopRequireDefault(require("./values.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cssValue = new _index.RepeatComposite("css-value", _values.default, _divider.default);
var _default = cssValue;
exports.default = _default;
//# sourceMappingURL=cssValue.js.map