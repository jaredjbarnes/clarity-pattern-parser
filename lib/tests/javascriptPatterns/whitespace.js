"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _OrComposite = _interopRequireDefault(require("../../patterns/composite/OrComposite.js"));

var _Literal = _interopRequireDefault(require("../../patterns/value/Literal.js"));

var _NotValue = _interopRequireDefault(require("../../patterns/value/NotValue.js"));

var _OrValue = _interopRequireDefault(require("../../patterns/value/OrValue.js"));

var _RepeatValue = _interopRequireDefault(require("../../patterns/value/RepeatValue.js"));

var _AndValue = _interopRequireDefault(require("../../patterns/value/AndValue.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var space = new _Literal.default("space", " ");
var tab = new _Literal.default("tab", "\t");
var newLine = new _Literal.default("new-line", "\n");
var carriageReturn = new _Literal.default("carriage-return", "\r");
var windowsReturn = new _Literal.default("windows-return", "\r\n");
var doubleForwardSlash = new _Literal.default("double-forward-slash", "//");
var slashStar = new _Literal.default("slash-star", "/*");
var starSlash = new _Literal.default("star-slash", "*/");
var lineEnd = new _OrValue.default("lineEnd", [windowsReturn, newLine, carriageReturn]);
var lineCommentContent = new _RepeatValue.default("line-comment-content", new _NotValue.default("not-line-end", lineEnd));
var blockCommentContent = new _RepeatValue.default("block-comment-content", new _NotValue.default("not-start-slash", starSlash));
var lineComment = new _AndValue.default("line-comment", [doubleForwardSlash, lineCommentContent, lineEnd]);
var blockComment = new _AndValue.default("block-comment", [slashStar, blockCommentContent, starSlash]);
var whitespace = new _OrComposite.default("whitespace", [space, tab, lineComment, blockComment]);
var _default = whitespace;
exports.default = _default;
//# sourceMappingURL=whitespace.js.map