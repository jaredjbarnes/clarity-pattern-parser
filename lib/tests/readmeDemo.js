"use strict";

var _index = require("../index.js");

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["readme.md: value"] = function () {
  var forwardSlashes = new _index.Literal("forward-slashes", "//");
  var newLine = new _index.Literal("new-line", "\n");
  var returnCarriage = new _index.Literal("return-carriage", "\r");
  var windowsNewLine = new _index.AndValue("windows-new-line", [returnCarriage, newLine]);
  var lineEnd = new _index.OrValue("line-end", [newLine, windowsNewLine]);
  var character = new _index.NotValue("character", lineEnd);
  var comment = new _index.RepeatValue("comment", character);
  var lineEndingComment = new _index.AndValue("line-ending-comment", [forwardSlashes, comment, lineEnd]);
  var string = "// This is a comment\n";
  var cursor = new _index.Cursor(string);
  var node = lineEndingComment.parse(cursor);

  _assert.default.equal(node.name, "line-ending-comment"); // --> true


  _assert.default.equal(node.value, string); // --> true


  _assert.default.equal(JSON.stringify(node), '{"type":"and-value","name":"line-ending-comment","startIndex":0,"endIndex":20,"value":"// This is a comment\\n"}'); // --> true

};

exports["readme.md: composite"] = function () {
  var forwardSlashes = new _index.Literal("forward-slashes", "//");
  var newLine = new _index.Literal("new-line", "\n");
  var returnCarriage = new _index.Literal("return-carriage", "\r");
  var windowsNewLine = new _index.AndValue("windows-new-line", [returnCarriage, newLine]);
  var lineEnd = new _index.OrValue("line-end", [newLine, windowsNewLine]);
  var character = new _index.NotValue("character", lineEnd);
  var comment = new _index.RepeatValue("comment", character);
  var lineEndingComment = new _index.AndComposite("line-ending-comment", [forwardSlashes, comment, lineEnd]);
  var string = "// This is a comment\n";
  var cursor = new _index.Cursor(string);
  var node = lineEndingComment.parse(cursor);

  _assert.default.equal(node.name, "line-ending-comment");

  _assert.default.equal(node.children[0].name, "forward-slashes");

  _assert.default.equal(node.children[0].value, "//");

  _assert.default.equal(node.children[1].name, "comment");

  _assert.default.equal(node.children[1].value, " This is a comment");

  _assert.default.equal(node.children[2].name, "line-end");

  _assert.default.equal(node.children[2].value, "\n");

  _assert.default.equal(JSON.stringify(node), '{"type":"and-composite","name":"line-ending-comment","startIndex":0,"endIndex":20,"children":[{"type":"literal","name":"forward-slashes","startIndex":0,"endIndex":1,"value":"//"},{"type":"repeat-value","name":"comment","startIndex":2,"endIndex":19,"value":" This is a comment"},{"type":"or-value","name":"line-end","startIndex":20,"endIndex":20,"value":"\\n"}]}');
};
//# sourceMappingURL=readmeDemo.js.map