"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _RegexValue = _interopRequireDefault(require("../../patterns/value/RegexValue.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// const letter = new AnyOfThese("letter", "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
// const digit = new AnyOfThese("digit", "0987654321");
// const underbar = new Literal("underbar", "_");
// const character = new OrValue("character", [
//     letter,
//     digit,
//     underbar
// ]);
// const characterSequence = new RepeatValue("character-sequence", character);
// const optionalCharacter = new OptionalValue(characterSequence);
// const name = new AndValue("name", [
//     letter,
//     optionalCharacter
// ]);
var name = new _RegexValue.default("name", "[a-zA-Z]+[a-zA-Z0-9_]*");
var _default = name;
exports.default = _default;
//# sourceMappingURL=name.js.map