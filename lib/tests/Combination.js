"use strict";

var _Literal = _interopRequireDefault(require("../patterns/Literal.js"));

var _Or = _interopRequireDefault(require("../patterns/Or.js"));

var _And = _interopRequireDefault(require("../patterns/And.js"));

var _Not = _interopRequireDefault(require("../patterns/Not.js"));

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

var _Repeat = _interopRequireDefault(require("../patterns/Repeat.js"));

var _OneOf = _interopRequireDefault(require("../patterns/OneOf.js"));

var _Any = _interopRequireDefault(require("../patterns/Any.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["Whitespace."] = () => {
  const space = new _Literal.default("space", " ");
  const carriageReturn = new _Literal.default("carriage-return", "\r");
  const newLine = new _Literal.default("new-line", "\n");
  const tab = new _Literal.default("tab", "\t");
  const doubleSlash = new _Literal.default("double-slash", "//");
  const slashStar = new _Literal.default("slash-star", "/*");
  const starSlash = new _Literal.default("star-slash", "*/");
  const lineEnd = new _Or.default([carriageReturn, newLine]);
  const anyCharacterButLineEnd = new _Not.default("comment", lineEnd);
  const anyCharacterButStarSlash = new _Not.default("comment", starSlash);
  const singleLineComment = new _And.default("single-line-comment", [doubleSlash, anyCharacterButLineEnd, lineEnd]);
  const multilineComment = new _And.default("multiline-comment", [slashStar, anyCharacterButStarSlash, starSlash]);
  const whitespaceOptions = new _Or.default([space, lineEnd, tab, singleLineComment, multilineComment]);
  const whitespace = new _Repeat.default("whitespace", whitespaceOptions);
  const cursor = new _Cursor.default(`
            //This is a single line comment!

            /*
                First line!
                Second line!
            */
        `);
  const node = whitespace.parse(cursor);
};

exports["Optional."] = () => {};
//# sourceMappingURL=Combination.js.map