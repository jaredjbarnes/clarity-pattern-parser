"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Literal = _interopRequireDefault(require("../../patterns/value/Literal.js"));

var _OrValue = _interopRequireDefault(require("../../patterns/value/OrValue.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var trueLiteral = new _Literal.default("true", "true");
var falseLiteral = new _Literal.default("false", "false");
var boolean = new _OrValue.default("boolean", [trueLiteral, falseLiteral]);
var _default = boolean;
exports.default = _default;
//# sourceMappingURL=boolean.js.map