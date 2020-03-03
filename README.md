## Installation

```
npm install clarity-pattern-parser
```

## How to use
There are two constructs within clarity pattern parser. The first is value based patterns. The second is composite based patterns. 

Value patterns can be composed, however, they are reduced to a single value even if they are composed of many parts. 

Composite patterns can also be composed, however, they are left with their parts. The best way to understand this is by an example. 

We will create a pattern for line ending comments, first with value based patterns, and second with some composite based patterns. 

### Value based comment
```javascript
import {
    Cursor,
    Literal,
    AndValue,
    OrValue,
    RepeatValue,
    NotValue
 } from 'clarity-pattern-parser';
 import assert from "assert";

const forwardSlashes = new Literal("forward-slashes", "//");
const newLine = new Literal("new-line", "\n");
const returnCarriage = new Literal("return-carriage", "\r");
const windowsNewLine = new AndValue("windows-new-line", [returnCarriage, newLine]);
const lineEnd = new OrValue("line-end", [newLine, windowNewLine]);
const character = new NotValue("character", lineEnd);
const comment = new RepeatValue("comment", character);

const lineEndingComment = AndValue("line-ending-comment", [
    forwardSlashes,
    comment,
    lineEnd
]);

const string = "// This is a comment\n";
const cursor = new Cursor(string);
const node = lineEndingComment.parse(cursor);

assert.equal(node.name, "line-ending-comment"); // --> true 
assert.equal(node.value, string); // --> true
```

### Composite based comment
```javascript
import {
    Cursor,
    Literal,
    AndValue,
    OrValue,
    RepeatValue,
    NotValue,
    AndComposite
 } from 'clarity-pattern-parser';
 import assert from "assert";

const forwardSlashes = new Literal("forward-slashes", "//");
const newLine = new Literal("new-line", "\n");
const returnCarriage = new Literal("return-carriage", "\r");
const windowsNewLine = new AndValue("windows-new-line", [returnCarriage, newLine]);
const lineEnd = new OrValue("line-end", [newLine, windowNewLine]);
const character = new NotValue("character", lineEnd);
const comment = new RepeatValue("comment", character);

const lineEndingComment = AndComposite("line-ending-comment", [
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

```

## Notes
