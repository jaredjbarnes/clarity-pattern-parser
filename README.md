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
  NotValue,
  AndComposite
} from "clarity-pattern-parser";
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

  const expectedValue = {
    type: "and-value",
    name: "line-ending-comment",
    startIndex: 0,
    endIndex: 20,
    value: "// This is a comment\n"
  };

  assert.equal(JSON.stringify(node), JSON.stringify(expectedValue)); // --> true
};
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
} from "clarity-pattern-parser";
import assert from "assert";

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

  const expectedValue = {
    type: "and-composite",
    name: "line-ending-comment",
    startIndex: 0,
    endIndex: 20,
    children: [
      {
        type: "literal",
        name: "forward-slashes",
        startIndex: 0,
        endIndex: 1,
        value: "//"
      },
      {
        type: "repeat-value",
        name: "comment",
        startIndex: 2,
        endIndex: 19,
        value: " This is a comment"
      },
      {
        type: "or-value",
        name: "line-end",
        startIndex: 20,
        endIndex: 20,
        value: "\n"
      }
    ]
  };

  assert.equal(JSON.stringify(node), JSON.stringify(expectedValue)); // --> true
};
```

### Literal

```javascript
import { Literal } from "clarity-pattern-parser";
import assert from "assert";

// The first parameter is the name of the pattern, the second is the string you are matching.
const john = new Literal("john", "John");

const result = john.exec("John");
const result2 = john.exec("Jane");

const expectedValue = {
  type: "literal",
  name: "john",
  startIndex: 0,
  endIndex: 3,
  value: "John"
};

assert.equal(JSON.stringify(result), JSON.stringify(expectedValue));
assert.equal(result2, null);
```

### RegexValue

```javascript
import { RegexValue } from "clarity-pattern-parser";
import assert from "assert";

// Notice this isn't a regex literal /[^a]+/
// This is because we need to modify the expression to use it in the middle of a parse.
// This also means we shouldn't use things like the start "^" character or the end "$" character.
// There are several gotchas with RegexValue, however the speed gains are undeniable.
const notA = new RegexValue("not-a", "[^a]+");

const result = notA.exec("John");
const result2 = notA.exec("a");

const expectedValue = {
  type: "regex-value",
  name: "not-a",
  startIndex: 0,
  endIndex: 3,
  value: "John"
};

assert.equal(JSON.stringify(result), JSON.stringify(expectedValue));
assert.equal(result2, null);
```
