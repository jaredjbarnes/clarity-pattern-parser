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

exports["Method Invocation."] = () => {
  const number = new _OneOf.default("number", "0123456789");
  const openParen = new _Literal.default("openParen", "(");
  const closeParen = new _Literal.default("closeParen", ")");
  const letter = new _OneOf.default("letter", "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz");
  const dash = new _Literal.default("dash", "-");
  const underscore = new _Literal.default("underscore", "_");
  const acceptableCharacters = new _Any.default("letter-number-dash-underscore", [letter, number, dash, underscore]);
  const identifier = new _And.default("identifier", [letter, acceptableCharacters], true);
  const comma = new _Literal.default("comma", ",");
  const space = new _Literal.default("space", " ");
  const spaces = new _Repeat.default("spaces", space);
  const surroundWithSpace = new _And.default(" , ", [spaces, comma, spaces]);
  const beginWithSpace = new _And.default(" ,", [spaces, comma]);
  const endWithSpace = new _And.default(", ", [comma, spaces]);
  const divider = new _Any.default("comma", [comma, surroundWithSpace, beginWithSpace, endWithSpace]);
  const notADivider = new _Not.default("argument", divider);
  const args = new _Repeat.default("arguments", notADivider, divider);
  const methodSignature = new _And.default("method-signature", [identifier, openParen, closeParen]);
  const cursor = new _Cursor.default("methodName()");
  const node = methodSignature.parse(cursor);
};
//# sourceMappingURL=Combination.js.map