# Clarity Pattern Parser - Grammar Guide

## Table of Contents

1. [Quick Start](#quick-start)
2. [Grammar Syntax Reference](#grammar-syntax-reference)
3. [Pattern Types](#pattern-types)
4. [AST Output Reference](#ast-output-reference)
5. [Expression Patterns (Operator Precedence)](#expression-patterns)
6. [Block Patterns (Matched Delimiters)](#block-matched-delimiters)
7. [Imports and Parameters](#imports-and-parameters)
8. [Decorators](#decorators)
9. [Complete Examples](#complete-examples)

---

## Quick Start

### Using the Tagged Template Literal

```typescript
import { patterns } from "clarity-pattern-parser";

const { fullName } = patterns`
  first-name = /[A-Z][a-z]+/
  last-name = /[A-Z][a-z]+/
  space = " "
  full-name = first-name + space + last-name
`;

const result = fullName.exec("John Doe");

// result.ast is the AST Node (or null on failure)
// result.cursor contains error info on failure
console.log(result.ast?.value);  // "John Doe"
```

### Using the Grammar Class

```typescript
import { Grammar } from "clarity-pattern-parser";

const patterns = Grammar.parseString(`
  digit = /\\d/
  digits = (digit)+
`);

const result = patterns["digits"].exec("123");
console.log(result.ast?.value);  // "123"
```

> **Note**: In the tagged template literal, kebab-case names are auto-converted to camelCase for JavaScript access. `full-name` becomes `fullName`. In the `Grammar` class, names stay as-is.

---

## Grammar Syntax Reference

### Comments

```
# This is a comment (must be on its own line)
```

### Assignments

Every pattern is defined as a named assignment:

```
pattern-name = <pattern-definition>
```

Names must match: `/[a-zA-Z_-]+[a-zA-Z0-9_-]*/`

### Literals

Double-quoted exact string match:

```
greeting = "Hello"
newline = "\n"
quote = "\""
backslash = "\\"
```

Supported escape sequences: `\n`, `\r`, `\t`, `\b`, `\f`, `\v`, `\0`, `\xHH`, `\uHHHH`, `\"`, `\\`

### Regex

Forward-slash delimited regular expressions:

```
digits = /\d+/
word = /[a-zA-Z_]\w*/
```

- Do NOT include `^` or `$` anchors (they are added internally)
- Uses `gu` flags (global, unicode)
- Regex patterns match greedily from the current cursor position

### Sequence (AND)

Concatenation with `+` operator. All parts must match in order:

```
full-name = first-name + " " + last-name
greeting = "Hello" + space + name + "!"
```

### Options (OR)

Alternatives with `|` operator:

```
# Non-greedy (first match wins):
name = "John" | "Jane" | "Bob"

# Greedy (longest match wins) using <|>:
token = identifier <|> keyword <|> operator
```

The `|` operator tries alternatives in order and returns the first match. The `<|>` operator tries all alternatives and returns the longest match.

**Important**: When options contain self-referencing patterns (recursion), the parser automatically converts them into an `Expression` pattern for proper operator precedence handling. See [Expression Patterns](#expression-patterns).

### Repeat

Repetition with bounds and optional dividers:

```
# One or more:
digits = (digit)+

# Zero or more:
spaces = (space)*

# Exact count:
triple = (digit){3}

# Range (min, max):
few-digits = (digit){2,5}

# Min only (2 or more):
many = (digit){2,}

# Max only (0 to 3):
some = (digit){,3}
```

#### With Divider

```
# Comma-separated digits:
csv-digits = (digit, comma)+

# With trailing divider trimming:
items = (item, comma trim)+
```

The `trim` flag allows a trailing divider at the end (but doesn't require it).

### Optional

Append `?` to make a pattern optional in a sequence:

```
middle-name-section = middle-name + space
full-name = first-name + space + middle-name-section? + last-name
```

### Not (Negative Lookahead)

Prefix with `!` in a sequence to assert a pattern does NOT match:

```
# Match any first-name except "Jack":
full-name = !jack + first-name + space + last-name
```

`!` does not consume input. It only asserts that the pattern doesn't match at the current position.

### Block (Matched Delimiters)

Square brackets around a literal define a **block delimiter**. When a sequence starts and ends with block delimiters, it creates a `Block` pattern that solves the **sentinel problem** — correctly matching nested delimiters before parsing content.

```
body = ["{"] + statements + ["}"]
parens = ["("] + expr + [")"]
```

**How it works**: Instead of parsing content greedily and hoping to find the right closing delimiter, Block first scans the raw string using `indexOf` to find the **matching** close delimiter — counting nesting depth along the way. Only after the boundaries are known does it parse the content patterns inside.

This means nested structures are handled correctly without backtracking:

```
# This correctly parses "{ { } }" — the inner "}" doesn't
# prematurely close the outer block.
block = ["{"] + inner + ["}"]
```

**Why this matters**: In a traditional PEG parser, a content pattern like `/[^}]*/` would stop at the first `}`, even if that `}` belongs to a nested inner block. The Block pattern eliminates this ambiguity by finding the matching close delimiter first (a simple counting problem), then parsing content within known boundaries. The content patterns can be as complex as needed — recursive, greedy, anything — because the bookends are already locked in.

**Empty content**: Block delimiters with no content patterns between them are valid. The block still finds the matching close and consumes the full span:

```
braces = ["{"] + ["}"]
```

**Constraints**: Block delimiters must be literals (quoted strings). This enables the fast `indexOf`-based scan that makes Block efficient — no parsing overhead during the delimiter-matching phase.

### Take Until

Consume all characters until a terminating pattern:

```
script-content = ?->| "</script"
```

Matches everything from the current position up to (but not including) the terminator.

### Alias

Reference an existing pattern under a new name:

```
word = /\w+/
identifier = word    # alias: same regex, new name "identifier"
```

### Anonymous Patterns

Inline unnamed patterns in sequences and repeats:

```
# Inline literals and regex — fine, they get their value as the AST node name:
greeting = "Hello" + " " + /\w+/

# Complex inline patterns — avoid this:
items = ("item-a" <|> "item-b" <|> (thing)+)
```

**Recommendation: Only use literals and regex inline.** Inline sequences, options, and repeats produce anonymous AST nodes that are hard to query or work with. If you need to find or walk specific parts of the result, give them names.

```
# Avoid — anonymous nodes you can only navigate by index:
pairs = ("(" + /\w+/ + ")")+

# Prefer — every piece is addressable by name:
open = "("
close = ")"
word = /\w+/
pair = open + word + close
pairs = (pair)+
```

With named patterns, you can use `ast.find(n => n.name === "word")` or `ast.findAll(n => n.name === "pair")` to pull out exactly what you need. With anonymous inline patterns, you're stuck counting children by position.

Inline literals (`"text"`) and regex (`/pattern/`) are the exception — they use their content as the node name (`"Hello"` becomes a node named `Hello`, `/\d+/` becomes a node named `\d+`), so they remain useful inline.

### Export Names

Bare names at the end of a grammar re-export an imported pattern:

```
import { value } from "other.cpat"
value   # re-exports "value" as a top-level pattern
```

---

## Pattern Types

Each pattern type creates nodes with a specific `type` field:

| Grammar Syntax | Pattern Class | Node `type` |
|---|---|---|
| `"text"` | `Literal` | `"literal"` |
| `/regex/` | `Regex` | `"regex"` |
| `a + b` | `Sequence` | `"sequence"` |
| `a \| b` | `Options` | `"options"` |
| `a \| b` (with recursion) | `Expression` | `"expression"` |
| `(a)+` | `Repeat` | `"infinite-repeat"` or `"finite-repeat"` |
| `a?` | `Optional` | `"optional"` |
| `!a` | `Not` | `"not"` |
| `["{"] + a + ["}"]` | `Block` | `"block"` |
| `?->\| a` | `TakeUntil` | `"take-until"` |
| `alias = other` | Cloned pattern | Same as original |

---

## AST Output Reference

### Node Structure

Every successful parse returns a `Node` (or `null` on failure):

```typescript
interface ParseResult {
  ast: Node | null;    // The AST root node, or null if parsing failed
  cursor: Cursor;      // Cursor with error info if ast is null
}
```

A `Node` has:

```typescript
node.type        // string - pattern type ("literal", "regex", "sequence", "expression", etc.)
node.name        // string - the pattern name you defined in the grammar
node.value       // string - the matched text (leaf nodes store directly; composite nodes concatenate children)
node.startIndex  // number - 0-based inclusive start position in source text
node.endIndex    // number - 0-based exclusive end position in source text
node.children    // readonly Node[] - child nodes (empty for leaf nodes)
node.parent      // Node | null - parent node reference
node.isLeaf      // boolean - true if no children
node.hasChildren // boolean - true if has children
```

### Serialization

```typescript
// Cycle-free plain object (safe for JSON):
node.toCycleFreeObject()
// Returns: { id, type, name, value, startIndex, endIndex, children: [...] }

// JSON string:
node.toJson(2)  // pretty-printed with 2-space indent
```

### Output by Pattern Type

#### Literal

```
greeting = "Hello"
```

Parsing `"Hello"`:

```
Node {
  type: "literal"
  name: "greeting"
  value: "Hello"
  startIndex: 0
  endIndex: 5
  children: []      # Always empty - leaf node
}
```

#### Regex

```
digits = /\d+/
```

Parsing `"42"`:

```
Node {
  type: "regex"
  name: "digits"
  value: "42"
  startIndex: 0
  endIndex: 2
  children: []      # Always empty - leaf node
}
```

#### Sequence

```
first-name = /[A-Z][a-z]+/
space = " "
last-name = /[A-Z][a-z]+/
full-name = first-name + space + last-name
```

Parsing `"John Doe"`:

```
Node {
  type: "sequence"
  name: "full-name"
  value: "John Doe"
  startIndex: 0
  endIndex: 8
  children: [
    Node { type: "regex",   name: "first-name", value: "John", startIndex: 0, endIndex: 4 }
    Node { type: "literal", name: "space",      value: " ",    startIndex: 4, endIndex: 5 }
    Node { type: "regex",   name: "last-name",  value: "Doe",  startIndex: 5, endIndex: 8 }
  ]
}
```

**Key**: Sequence nodes contain one child per matched sub-pattern. Optional patterns that don't match are excluded from children.

#### Options

```
name = "John" | "Jane"
```

Parsing `"Jane"`:

```
Node {
  type: "literal"       # The winning alternative's type, NOT "options"
  name: "Jane"          # The winning alternative's name
  value: "Jane"
  startIndex: 0
  endIndex: 4
  children: []
}
```

**Key**: Options do NOT wrap the result. The node returned is the matched alternative directly.

#### Repeat

```
digit = /\d/
digits = (digit)+
```

Parsing `"123"`:

```
Node {
  type: "infinite-repeat"
  name: "digits"
  value: "123"
  startIndex: 0
  endIndex: 3
  children: [
    Node { type: "regex", name: "digit", value: "1", startIndex: 0, endIndex: 1 }
    Node { type: "regex", name: "digit", value: "2", startIndex: 1, endIndex: 2 }
    Node { type: "regex", name: "digit", value: "3", startIndex: 2, endIndex: 3 }
  ]
}
```

#### Repeat with Divider

```
digit = /\d+/
comma = ","
csv = (digit, comma)+
```

Parsing `"1,2,3"`:

```
Node {
  type: "infinite-repeat"
  name: "csv"
  value: "1,2,3"
  children: [
    Node { type: "regex",   name: "digit", value: "1" }
    Node { type: "literal", name: "comma", value: "," }
    Node { type: "regex",   name: "digit", value: "2" }
    Node { type: "literal", name: "comma", value: "," }
    Node { type: "regex",   name: "digit", value: "3" }
  ]
}
```

**Key**: Divider nodes are interleaved between the repeated pattern nodes. With `trim`, a trailing divider is allowed but included if present.

#### Optional (in Sequence)

```
middle = /[A-Z]\./
full = first + " " + middle? + " "? + last
```

If `middle` matches, it appears as a child. If it doesn't match, it's simply absent from the children array. No wrapper node is created.

#### Expression (Operator Precedence)

```
integer = /\d+/
add-expr = expr + " + " + expr
mul-expr = expr + " * " + expr
expr = mul-expr | add-expr | integer
```

Parsing `"1 + 2 * 3"`:

```
Node {
  type: "expression"
  name: "add-expr"
  value: "1 + 2 * 3"
  children: [
    Node { type: "regex", name: "integer", value: "1" }
    Node { type: "literal", name: " + ", value: " + " }
    Node {
      type: "expression"
      name: "mul-expr"
      value: "2 * 3"
      children: [
        Node { type: "regex", name: "integer", value: "2" }
        Node { type: "literal", name: " * ", value: " * " }
        Node { type: "regex", name: "integer", value: "3" }
      ]
    }
  ]
}
```

**Key**: The Expression pattern builds a proper precedence tree. Infix nodes have type `"expression"` and the name of the matched operator pattern. Children include the left operand, operator token(s), and right operand.

#### Prefix/Postfix Expression

```
integer = /\d+/
unary = "-" + expr
postfix = expr + "++"
binary = expr + " + " + expr
expr = postfix | unary | binary | integer
```

Parsing `"-10++"`:

```
Node {
  type: "expression"
  name: "unary"
  value: "-10++"
  children: [
    Node { type: "literal", name: "-", value: "-" }
    Node {
      type: "expression"
      name: "postfix"
      value: "10++"
      children: [
        Node { type: "regex", name: "integer", value: "10" }
        Node { type: "literal", name: "++", value: "++" }
      ]
    }
  ]
}
```

#### Take Until

```
content = ?->| "</script"
```

Parsing `"function(){}</script"`:

```
Node {
  type: "take-until"
  name: "content"
  value: "function(){}"
  startIndex: 0
  endIndex: 12
  children: []
}
```

**Key**: Consumes everything BEFORE the terminator. The terminator itself is NOT included.

#### Block

```
content = /[^{}]+/
body = ["{"] + content + ["}"]
```

Parsing `"{hello}"`:

```
Node {
  type: "block"
  name: "body"
  value: "{hello}"
  startIndex: 0
  endIndex: 7
  children: [
    Node { type: "literal", name: "open",    value: "{",     startIndex: 0, endIndex: 1 }
    Node { type: "regex",   name: "content", value: "hello", startIndex: 1, endIndex: 6 }
    Node { type: "literal", name: "close",   value: "}",     startIndex: 6, endIndex: 7 }
  ]
}
```

**Key**: The open and close delimiters are always included as the first and last children. Content nodes appear between them. The block finds the matching close delimiter before parsing content, so nested delimiters are handled correctly.

### Traversal and Manipulation

```typescript
const result = pattern.exec("some text");
const ast = result.ast;

// Find first node by predicate:
const nameNode = ast.find(n => n.name === "first-name");

// Find all nodes by predicate:
const allNames = ast.findAll(n => n.name.includes("name"));

// Walk tree (depth-first, children first):
ast.walkUp(node => {
  console.log(node.name, node.value);
  // Return false to stop walking
});

// Walk tree (depth-first, parent first):
ast.walkDown(node => {
  console.log(node.name, node.value);
});

// Walk breadth-first:
ast.walkBreadthFirst(node => { /* ... */ });

// Get leaf nodes only:
const leaves = ast.flatten();

// Remove whitespace nodes:
ast.findAll(n => n.name === "space").forEach(n => n.remove());

// Collapse node to single value (removes children):
node.compact();

// Transform with visitor pattern:
ast.transform({
  "space": (node) => { node.remove(); return node; },
  "name": (node) => { /* transform */ return node; }
});

// Navigate siblings:
const next = node.nextSibling();
const prev = node.previousSibling();

// Find ancestor:
const parent = node.findAncestor(n => n.name === "expression");
```

---

## Expression Patterns

Expression patterns handle operator precedence and associativity automatically. They're created implicitly when an options pattern (`|`) contains self-referencing alternatives.

### How Precedence Works

Precedence is determined by **declaration order** - patterns listed first have **higher precedence** (bind tighter):

```
integer = /\d+/
mul-expr = expr + " * " + expr     # Higher precedence (listed first)
add-expr = expr + " + " + expr     # Lower precedence (listed second)
expr = mul-expr | add-expr | integer
```

`2 + 3 * 4` parses as `2 + (3 * 4)` because `mul-expr` has higher precedence.

### Auto-Classification

The Expression pattern examines each alternative's structure:

| Structure | Classification | Example |
|---|---|---|
| No self-reference | **Atom** | `integer`, `"(" + expr + ")"` |
| Self-ref at end only | **Prefix** | `"-" + expr` |
| Self-ref at start only | **Postfix** | `expr + "++"` |
| Self-ref at both ends | **Infix** | `expr + " + " + expr` |

"Self-reference" means the pattern references the expression pattern itself (by name).

### Right Associativity

By default, infix operators are left-associative. Use the `right` keyword for right-associativity:

```
ternary = expr + " ? " + expr + " : " + expr
expr = ternary right | integer
```

`a ? b : c ? d : e` parses as `a ? b : (c ? d : e)` instead of `(a ? b : c) ? d : e`.

### Complete Expression Example

```
integer = /\d+/
variable = /[a-z]/
open-paren = "("
close-paren = ")"

group = open-paren + expr + close-paren
mul-expr = expr + " * " + expr
div-expr = expr + " / " + expr
add-expr = expr + " + " + expr
sub-expr = expr + " - " + expr
neg-expr = "-" + expr
post-inc = expr + "++"

expr = mul-expr | div-expr | add-expr | sub-expr | neg-expr | post-inc | group | integer | variable
```

---

## Imports and Parameters

### Importing Patterns

```
import { pattern-name } from "path/to/grammar.cpat"
import { old-name as new-name } from "grammar.cpat"
```

Multiple imports:

```
import { alpha, beta } from "greek.cpat"
import { one, two, three } from "numbers.cpat"
```

### Parameterized Grammars

Define parameters in the imported grammar:

```
# divider.cpat
use params { separator }
items = (item, separator)+
```

Pass values when importing:

```
import { items } from "divider.cpat" with params {
  separator = ","
}
```

Parameters with defaults:

```
use params {
  separator = default-separator
}
default-separator = ","
items = (item, separator)+
```

If a param is supplied, it overrides the default. Otherwise the default is used.

### Providing resolveImport

```typescript
const patterns = await Grammar.parse(grammarString, {
  resolveImport: async (resource, originResource) => {
    const content = await fs.readFile(resolve(originResource, resource), "utf-8");
    return { expression: content, resource };
  }
});

// Synchronous version:
const patterns = Grammar.parseString(grammarString, {
  resolveImportSync: (resource, originResource) => {
    const content = fs.readFileSync(resolve(originResource, resource), "utf-8");
    return { expression: content, resource };
  }
});
```

---

## Decorators

Decorators modify patterns before they're finalized:

```
# Method decorator with args:
@tokens([" ", "\t"])
whitespace = /\s+/

# Method decorator without args:
@tokens()
spaces = /\s+/

# Name decorator (no parens):
@myDecorator
pattern = /\w+/
```

### Built-in: @tokens

Sets the token hints used by intellisense:

```
@tokens(["(", ")"])
parens = /[()]/
```

### Custom Decorators

```typescript
import { createPatternsTemplate } from "clarity-pattern-parser";

const patterns = createPatternsTemplate({
  decorators: {
    myDecorator: (pattern, arg) => {
      // Modify the pattern
      console.log(`Decorated: ${pattern.name}`, arg);
    }
  }
});

const { result } = patterns`
  @myDecorator({"key": "value"})
  result = /\w+/
`;
```

Decorator arguments are JSON-parsed. Supported types: arrays, objects, strings, numbers, booleans, null.

---

## Complete Examples

### JSON Parser

```
true-value = "true"
false-value = "false"
null-value = "null"
comma = ","
colon = ":"
open-bracket = "["
close-bracket = "]"
open-brace = "{"
close-brace = "}"

spaces = /\s*/
string = /"([^"\\]|\\.)*"/
number = /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/

value = string | number | true-value | false-value | null-value | array | object

array-items = (value, /\s*,\s*/ trim)*
array = open-bracket + spaces + array-items + spaces + close-bracket

pair = spaces + string + spaces + colon + spaces + value + spaces
pairs = (pair, comma trim)*
object = open-brace + spaces + pairs + spaces + close-brace
```

### Simple Markup

```
tag-name = /[a-zA-Z_-]+[a-zA-Z0-9_-]*/
space = /\s+/
opening-tag = "<" + tag-name + space? + ">"
closing-tag = "</" + tag-name + space? + ">"
child = space? + element + space?
children = (child)*
element = opening-tag + children + closing-tag
body = space? + element + space?
```

### Math Expression

```
integer = /\d+/
operator = "+" | "-" | "*" | "/"
unary-operator = "+" | "-"
postfix-operator = "++" | "--"

binary-expr = expr + operator + expr
unary-expr = unary-operator + expr
postfix-expr = expr + postfix-operator

expr = postfix-expr | unary-expr | binary-expr | integer
```

### Recursive Array

```
digit = /\d+/
divider = /\s*,\s*/
spaces = /\s+/

items = digit | array
array-items = (items, divider trim)*
array = ["["] + spaces? + array-items + spaces? + ["]"]
```

Parsing `"[1, [2, 3], []]"` produces a nested AST matching the recursive structure. Using Block delimiters (`["["]` and `["]"]`) ensures the parser correctly finds the matching `]` even with nested arrays inside.

### Nested Code Blocks

Block delimiters shine when parsing nested structures where the sentinel problem would otherwise cause ambiguity:

```
ws = /\s*/
statement = /[^{}]+/
body = ["{"] + ws + statements + ws + ["}"]
statements = (statement | body)*
```

The Block pattern finds the matching `}` for each `{` by counting nesting depth, then parses content within those known boundaries. Without Block, a greedy content pattern would stop at the first `}` it finds — even if that `}` belongs to an inner block.
