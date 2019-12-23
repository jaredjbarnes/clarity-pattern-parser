"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _index = require("../../index.js");

var _unit = _interopRequireDefault(require("./unit.js"));

var _hex = _interopRequireDefault(require("./hex.js"));

var _number = _interopRequireDefault(require("./number.js"));

var _method = _interopRequireDefault(require("./method.js"));

var _name = _interopRequireDefault(require("./name.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var value = new _index.OrComposite("value", [_hex.default, _method.default, _unit.default, _number.default, _name.default]);
var _default = value;
exports.default = _default;
//# sourceMappingURL=value.js.map