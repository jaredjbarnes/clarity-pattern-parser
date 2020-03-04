import {
  Cursor,
  Literal,
  AndValue,
  OrValue,
  RepeatValue,
  NotValue,
  AndComposite
} from "../index.js";
import assert from "assert";

exports["readme.md: value"] = () => {
  const forwardSlashes = new Literal("forward-slashes", "//");
  const newLine = new Literal("new-line", "\n");
  const returnCarriage = new Literal("return-carriage", "\r");
  const windowsNewLine = new AndValue("windows-new-line", [
    returnCarriage,
    newLine
  ]);
  const lineEnd = new OrValue("line-end", [newLine, windowsNewLine]);
  const character = new NotValue("character", lineEnd);
  const comment = new RepeatValue("comment", character);

  const lineEndingComment = new AndValue("line-ending-comment", [
    forwardSlashes,
    comment,
    lineEnd
  ]);

  const string = "// This is a comment\n";
  const cursor = new Cursor(string);
  const node = lineEndingComment.parse(cursor);

  assert.equal(node.name, "line-ending-comment"); // --> true
  assert.equal(node.value, string); // --> true
  assert.equal(
    JSON.stringify(node),
    '{"type":"and-value","name":"line-ending-comment","startIndex":0,"endIndex":20,"value":"// This is a comment\\n"}'
  ); // --> true
};

exports["readme.md: composite"] = () => {
  const forwardSlashes = new Literal("forward-slashes", "//");
  const newLine = new Literal("new-line", "\n");
  const returnCarriage = new Literal("return-carriage", "\r");
  const windowsNewLine = new AndValue("windows-new-line", [
    returnCarriage,
    newLine
  ]);
  const lineEnd = new OrValue("line-end", [newLine, windowsNewLine]);
  const character = new NotValue("character", lineEnd);
  const comment = new RepeatValue("comment", character);

  const lineEndingComment = new AndComposite("line-ending-comment", [
    forwardSlashes,
    comment,
    lineEnd
  ]);

  const string = "// This is a comment\n";
  const cursor = new Cursor(string);
  const node = lineEndingComment.parse(cursor);

  assert.equal(node.name, "line-ending-comment");

  assert.equal(node.children[0].name, "forward-slashes");
  assert.equal(node.children[0].value, "//");

  assert.equal(node.children[1].name, "comment");
  assert.equal(node.children[1].value, " This is a comment");

  assert.equal(node.children[2].name, "line-end");
  assert.equal(node.children[2].value, "\n");

  assert.equal(
    JSON.stringify(node),
    '{"type":"and-composite","name":"line-ending-comment","startIndex":0,"endIndex":20,"children":[{"type":"literal","name":"forward-slashes","startIndex":0,"endIndex":1,"value":"//"},{"type":"repeat-value","name":"comment","startIndex":2,"endIndex":19,"value":" This is a comment"},{"type":"or-value","name":"line-end","startIndex":20,"endIndex":20,"value":"\\n"}]}'
  );
};
