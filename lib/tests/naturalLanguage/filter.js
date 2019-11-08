"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Literal = _interopRequireDefault(require("../../patterns/value/Literal.js"));

var _OrValue = _interopRequireDefault(require("../../patterns/value/OrValue.js"));

var _RepeatValue = _interopRequireDefault(require("../../patterns/value/RepeatValue.js"));

var _AndValue = _interopRequireDefault(require("../../patterns/value/AndValue.js"));

var _AnyofThese = _interopRequireDefault(require("../../patterns/value/AnyofThese.js"));

var _OptionalValue = _interopRequireDefault(require("../../patterns/value/OptionalValue.js"));

var _name = _interopRequireDefault(require("../javascriptPatterns/name.js"));

var _number = _interopRequireDefault(require("../javascriptPatterns/number.js"));

var _string = _interopRequireDefault(require("../javascriptPatterns/string.js"));

var _OrComposite = _interopRequireDefault(require("../../patterns/composite/OrComposite.js"));

var _AndComposite = _interopRequireDefault(require("../../patterns/composite/AndComposite.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const space = new _Literal.default("space", " ");
const equalTo = new _Literal.default("=", "is");
const notEqualTo = new _Literal.default("!=", "is not");
const isGreaterThan = new _Literal.default(">", "is greater than");
const isLessThan = new _Literal.default("<", "is less than");
const isGreaterThanOrEqualTo = new _Literal.default(">=", "is greater or the same as");
const isLessThanOrEqualTo = new _Literal.default("<=", "is less than or the same as");
const startsWith = new _Literal.default("starts-with", "starts with");
const endsWith = new _Literal.default("ends-with", "ends with");
const contains = new _Literal.default("contains", "has");
const value = new _OrComposite.default("value", [_number.default, _string.default, _name.default]);
const operator = new _OrComposite.default("operator", [equalTo, notEqualTo, isGreaterThan, isLessThan, isGreaterThanOrEqualTo, isLessThanOrEqualTo, startsWith, endsWith, contains]);
const predicate = new _AndComposite.default("predicate", [_name.default, space, operator, space, value]);
const match = new _Literal.default("match", "Match records when");
const filter = new _AndComposite.default("filter", [match, space, predicate]);
var _default = filter;
exports.default = _default;
//# sourceMappingURL=filter.js.map