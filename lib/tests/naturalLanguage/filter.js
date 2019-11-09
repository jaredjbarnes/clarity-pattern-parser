"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Literal = _interopRequireDefault(require("../../patterns/value/Literal.js"));

var _name = _interopRequireDefault(require("../javascriptPatterns/name.js"));

var _number = _interopRequireDefault(require("../javascriptPatterns/number.js"));

var _string = _interopRequireDefault(require("../javascriptPatterns/string.js"));

var _OrComposite = _interopRequireDefault(require("../../patterns/composite/OrComposite.js"));

var _AndComposite = _interopRequireDefault(require("../../patterns/composite/AndComposite.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var space = new _Literal.default("space", " ");
var equalTo = new _Literal.default("=", "is");
var notEqualTo = new _Literal.default("!=", "is not");
var isGreaterThan = new _Literal.default(">", "is greater than");
var isLessThan = new _Literal.default("<", "is less than");
var isGreaterThanOrEqualTo = new _Literal.default(">=", "is greater or the same as");
var isLessThanOrEqualTo = new _Literal.default("<=", "is less than or the same as");
var startsWith = new _Literal.default("starts-with", "starts with");
var endsWith = new _Literal.default("ends-with", "ends with");
var contains = new _Literal.default("contains", "has");
var value = new _OrComposite.default("value", [_number.default, _string.default, _name.default]);
var operator = new _OrComposite.default("operator", [equalTo, notEqualTo, isGreaterThan, isLessThan, isGreaterThanOrEqualTo, isLessThanOrEqualTo, startsWith, endsWith, contains]);
var predicate = new _AndComposite.default("predicate", [_name.default, space, operator, space, value]);
var match = new _Literal.default("match", "Match records where");
var filter = new _AndComposite.default("filter", [match, space, predicate]);
var _default = filter;
exports.default = _default;
//# sourceMappingURL=filter.js.map