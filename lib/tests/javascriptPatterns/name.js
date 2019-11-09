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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var letter = new _AnyofThese.default("letter", "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
var digit = new _AnyofThese.default("digit", "0987654321");
var underbar = new _Literal.default("underbar", "_");
var character = new _OrValue.default("character", [letter, digit, underbar]);
var characterSequence = new _RepeatValue.default("character-sequence", character);
var optionalCharacter = new _OptionalValue.default(characterSequence);
var name = new _AndValue.default("name", [letter, optionalCharacter]);
var _default = name;
exports.default = _default;
//# sourceMappingURL=name.js.map