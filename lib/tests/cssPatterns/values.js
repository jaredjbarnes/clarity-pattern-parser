"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _index = require("../../index.js");

var _value = _interopRequireDefault(require("./value.js"));

var _spaces = _interopRequireDefault(require("./spaces.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var values = new _index.RepeatComposite("values", _value.default, _spaces.default);
var _default = values;
exports.default = _default;
//# sourceMappingURL=values.js.map