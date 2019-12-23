"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _index = require("../../index.js");

var _name = _interopRequireDefault(require("./name.js"));

var _optionalSpaces = _interopRequireDefault(require("./optionalSpaces.js"));

var _divider = _interopRequireDefault(require("./divider.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var openParen = new _index.Literal("open-paren", "(");
var closeParen = new _index.Literal("close-paren", ")");
var values = new _index.RecursivePattern("values");
var args = new _index.RepeatComposite("arguments", values, _divider.default);
var optionalArgs = new _index.OptionalComposite(args);
var method = new _index.AndComposite("method", [_name.default, openParen, _optionalSpaces.default, optionalArgs, _optionalSpaces.default, closeParen]);
var _default = method;
exports.default = _default;
//# sourceMappingURL=method.js.map