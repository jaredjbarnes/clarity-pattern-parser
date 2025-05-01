# Clarity Pattern Parser

A powerful pattern matching and parsing library that provides a flexible grammar for defining complex patterns. Perfect for building parsers, validators, and text processing tools.

> **Try it online!** 🚀 [Open in Playground](https://jaredjbarnes.github.io/cpat-editor/)

## Features

- 🎯 Flexible pattern matching with both grammar and direct API
- 🔄 Support for recursive patterns and expressions
- 🎨 Customizable pattern composition
- 🚀 High performance parsing
- 🔍 Built-in debugging support
- 📝 Rich AST manipulation capabilities
- 🔌 Extensible through custom patterns and decorators

## Installation

```bash
npm install clarity-pattern-parser
```

## Quick Start

### Using Grammar

```typescript
import { patterns } from "clarity-pattern-parser";

// Define patterns using grammar
const { fullName } = patterns`
    first-name = "John"
    last-name = "Doe"
    space = /\s+/
    full-name = first-name + space + last-name
`;

// Execute pattern
const result = fullName.exec("John Doe");
console.log(result.ast?.value); // "John Doe"
```

### Using Direct API

```typescript
import { Literal, Sequence } from "clarity-pattern-parser";

// Create patterns directly
const firstName = new Literal("first-name", "John");
const space = new Literal("space", " ");
const lastName = new Literal("last-name", "Doe");
const fullName = new Sequence("full-name", [firstName, space, lastName]);

// Execute pattern
const result = fullName.exec("John Doe");
console.log(result.ast?.value); // "John Doe"
```

## Online Playground

Try Clarity Pattern Parser in your browser with our interactive playground:

[Open in Playground](https://jaredjbarnes.github.io/cpat-editor/)

The playground allows you to:
- Write and test patterns in real-time
- See the AST visualization
- Debug pattern execution
- Share patterns with others
- Try out different examples

## Table of Contents

1. [Grammar Documentation](#grammar-documentation)
   - [Basic Patterns](#basic-patterns)
   - [Pattern Operators](#pattern-operators)
   - [Repetition](#repetition)
   - [Imports and Parameters](#imports-and-parameters)
   - [Decorators](#decorators)
   - [Comments](#comments)
   - [Pattern References](#pattern-references)
   - [Pattern Aliasing](#pattern-aliasing)
   - [String Template Patterns](#string-template-patterns)

2. [Direct Pattern Usage](#direct-pattern-usage)
   - [Basic Patterns](#basic-patterns-1)
   - [Composite Patterns](#composite-patterns)
   - [Pattern Context](#pattern-context)
   - [Pattern Reference](#pattern-reference)
   - [Pattern Execution](#pattern-execution)
   - [AST Manipulation](#ast-manipulation)

3. [Advanced Topics](#advanced-topics)
   - [Custom Patterns](#custom-patterns)
   - [Performance Tips](#performance-tips)
   - [Debugging](#debugging)
   - [Error Handling](#error-handling)

## Advanced Topics

### Custom Patterns

You can create custom patterns by extending the base `Pattern` class:

```typescript
import { Pattern } from "clarity-pattern-parser";

class CustomPattern extends Pattern {
    constructor(name: string) {
        super(name);
    }

    exec(text: string) {
        // Custom pattern implementation
    }
}
```

### Performance Tips

1. Use `test()` instead of `exec()` when you only need to check if a pattern matches
2. Cache frequently used patterns
3. Use `Reference` for recursive patterns instead of direct recursion
4. Minimize the use of optional patterns in sequences
5. Use bounded repetition when possible

### Debugging

Enable debug mode to get detailed information about pattern execution:

```typescript
const result = pattern.exec("some text", true);
// Debug information will be available in result.debug
```

### Error Handling

Pattern execution returns a `ParseResult` that includes error information:

```typescript
const result = pattern.exec("invalid text");
if (result.error) {
    console.error(result.error.message);
    console.error(result.error.expected);
    console.error(result.error.position);
}
```

## Examples

### JSON Parser
```typescript
const { json } = patterns`
    # Basic JSON grammar
    ws = /\s+/
    string = /"[^"]*"/
    number = /-?\d+(\.\d+)?/
    boolean = "true" | "false"
    null = "null"
    value = string | number | boolean | null | array | object
    array-items = (value, /\s*,\s*/)+
    array = "[" +ws? + array-items? + ws? + "]"
    object-property = string + ws? + ":" + ws? + value
    object-properties = (object-property, /\s*,\s*/ trim)+
    object = "{" + ws? + object-properties? + ws? + "}"
    json = ws? + value + ws?
`;
```

### HTML Parser
```typescript
const { html } = patterns`
    # Basic HTML grammar
    ws = /\s+/
    tag-name = /[a-zA-Z_-]+[a-zA-Z0-9_-]*/
    attribute-name = /[a-zA-Z_-]+[a-zA-Z0-9_-]*/
    attribute-value = /"[^"]*"/ 
    value-attribute = attribute-name + "=" + attribute-value
    bool-attribute = attribute-name
    attribute = value-attribute | bool-attribute
    attributes = (attribute, ws)*
    opening-tag = "<" + ws? + tag-name + ws? + attributes? + ">"
    closing-tag = "</" + ws? + tag-name + ws? + ">"
    text = /[^<]+/
    child = text | element
    children = (child, /\s*/)+
    element = opening-tag + children? + closing-tag
    html = ws? + element + ws?
`;
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Grammar Documentation

This document describes the grammar features supported by the Clarity Pattern Parser.

## Basic Patterns

### Literal Strings
Define literal string patterns using double quotes:
```
name = "John"
```

Escaped characters are supported in literals:
- `\n` - newline
- `\r` - carriage return
- `\t` - tab
- `\b` - backspace
- `\f` - form feed
- `\v` - vertical tab
- `\0` - null character
- `\x00` - hex character
- `\u0000` - unicode character
- `\"` - escaped quote
- `\\` - escaped backslash

### Regular Expressions
Define regex patterns using forward slashes:
```
name = /\w/
```

## Pattern Operators

### Options (|)
Match one of multiple patterns using the `|` operator. This is used for simple alternatives where order doesn't matter:
```
names = john | jane
```

### Expression (|)
Expression patterns also use the `|` operator but are used for defining operator precedence in expressions. The order of alternatives determines precedence, with earlier alternatives having higher precedence. By default, operators are left-associative.

Example of an arithmetic expression grammar:
```
prefix-operators = "+" | "-"
prefix-expression = prefix-operators + expression
postfix-operators = "++" | "--"
postfix-expression = expression + postfix-operators
add-sub-operators = "+" | "-"
add-sub-expression = expression + add-sub-operators + expression
mul-div-operators = "*" | "/"
mul-div-expression = expression + mul-div-operators + expression
expression = prefix-expression | mul-div-expression | add-sub-expression | postfix-expression
```

In this example:
- `prefix-expression` has highest precedence
- `mul-div-expression` has next highest precedence
- `add-sub-expression` has next highest precedence
- `postfix-expression` has lowest precedence

To make an operator right-associative, add the `right` keyword:
```
expression = prefix-expression | mul-div-expression | add-sub-expression right | postfix-expression
```

### Sequence (+)
Concatenate patterns in sequence using the `+` operator:
```
full-name = first-name + space + last-name
```

### Optional (?)
Make a pattern optional using the `?` operator:
```
full-name = first-name + space + middle-name? + last-name
```

### Not (!)
Negative lookahead using the `!` operator:
```
pattern = !excluded-pattern + actual-pattern
```

### Take Until (?->|)
Match all characters until a specific pattern is found:
```
script-text = ?->| "</script"
```

## Repetition

### Basic Repeat
Repeat a pattern one or more times using `+`:
```
digits = (digit)+
```

### Zero or More
Repeat a pattern zero or more times using `*`:
```
digits = (digit)*
```

### Bounded Repetition
Specify exact repetition counts using curly braces:
- `{n}` - Exactly n times: `(pattern){3}`
- `{n,}` - At least n times: `(pattern){1,}`
- `{,n}` - At most n times: `(pattern){,3}`
- `{n,m}` - Between n and m times: `(pattern){1,3}`

### Repetition with Divider
Repeat patterns with a divider between occurrences:
```
digits = (digit, comma){3}
```

Add `trim` keyword to trim the divider from the end:
```
digits = (digit, comma trim)+
```

## Imports and Parameters

### Basic Import
Import patterns from other files:
```
import { pattern-name } from "path/to/file.cpat"
```

### Import with Parameters
Import with custom parameters:
```
import { pattern } from "file.cpat" with params {
  custom-param = "value"
}
```

### Parameter Declaration
Declare parameters that can be passed to the grammar:
```
use params {
  param-name
}
```

### Default Parameters
Specify default values for parameters:
```
use params {
  param = default-value
}
```

## Decorators

Decorators can be applied to patterns using the `@` syntax:

### Token Decorator
Specify tokens for a pattern:
```
@tokens([" "])
spaces = /\s+/
```

### Custom Decorators
Support for custom decorators with various argument types:
```
@decorator()  // No arguments
@decorator(["value"])  // Array argument
@decorator({"prop": value})  // Object argument
```

## Comments
Add comments using the `#` symbol:
```
# This is a comment
pattern = "value"
```

## Pattern References
Reference other patterns by name:
```
pattern1 = "value"
pattern2 = pattern1
```

## Pattern Aliasing
Import patterns with aliases:
```
import { original as alias } from "file.cpat"
```

## String Template Patterns

Patterns can be defined inline using string templates. This allows for quick pattern definition and testing without creating separate files.

### Basic Example
```typescript
const { fullName } = patterns`
    first-name = "John"
    last-name = "Doe"
    space = /\s+/
    full-name = first-name + space + last-name
`;

const result = fullName.exec("John Doe");
// result.ast.value will be "John Doe"
```

### Complex Example (HTML-like Markup)
```typescript
const { body } = patterns`
    tag-name = /[a-zA-Z_-]+[a-zA-Z0-9_-]*/
    space = /\s+/
    opening-tag = "<" + tag-name + space? + ">"
    closing-tag = "</" + tag-name + space? + ">"
    child = space? + element + space?
    children = (child)*
    element = opening-tag + children + closing-tag
    body = space? + element + space?
`;

const result = body.exec(`
    <div>
        <div></div>
        <div></div>    
    </div>
`, true);

// Clean up spaces from the AST
result?.ast?.findAll(n => n.name.includes("space")).forEach(n => n.remove());
// result.ast.value will be "<div><div></div><div></div></div>"
```

### Key Features
1. Patterns are defined using backticks (`)
2. Each pattern definition is on a new line
3. The `patterns` function returns an object with all defined patterns
4. Patterns can be used immediately after definition
5. The AST can be manipulated after parsing (e.g., removing spaces)
6. The `exec` method can take an optional second parameter to enable debug mode

## Direct Pattern Usage

While the grammar provides a convenient way to define patterns, you can also use the Pattern classes directly for more control and flexibility.

### Basic Patterns

#### Literal
```typescript
import { Literal } from "clarity-pattern-parser";

const firstName = new Literal("first-name", "John");
const result = firstName.exec("John");
// result.ast.value will be "John"
```

#### Regex
```typescript
import { Regex } from "clarity-pattern-parser";

const digits = new Regex("digits", "\\d+");
const result = digits.exec("123");
// result.ast.value will be "123"
```

### Composite Patterns

#### Sequence
```typescript
import { Sequence, Literal } from "clarity-pattern-parser";

const firstName = new Literal("first-name", "John");
const space = new Literal("space", " ");
const lastName = new Literal("last-name", "Doe");
const fullName = new Sequence("full-name", [firstName, space, lastName]);

const result = fullName.exec("John Doe");
// result.ast.value will be "John Doe"
```

#### Options
```typescript
import { Options, Literal } from "clarity-pattern-parser";

const john = new Literal("john", "John");
const jane = new Literal("jane", "Jane");
const names = new Options("names", [john, jane]);

const result = names.exec("Jane");
// result.ast.value will be "Jane"
```

#### Expression
```typescript
import { Expression, Literal } from "clarity-pattern-parser";

const a = new Literal("a", "a");
const b = new Literal("b", "b");
const c = new Literal("c", "c");
const expression = new Expression("expression", [a, b, c]);

const result = expression.exec("a ? b : c");
// result.ast.value will be "a ? b : c"
```

#### Not (Negative Lookahead)
```typescript
import { Not, Literal, Sequence } from "clarity-pattern-parser";

const notJohn = new Not("not-john", new Literal("john", "John"));
const name = new Literal("name", "Jane");
const pattern = new Sequence("pattern", [notJohn, name]);

const result = pattern.exec("Jane");
// result.ast.value will be "Jane"
```

#### Repeat
```typescript
import { Repeat, Regex, Literal } from "clarity-pattern-parser";

const digit = new Regex("digit", "\\d+");
const comma = new Literal("comma", ",");
const digits = new Repeat("digits", digit, { divider: comma, min: 1, max: 3 });

const result = digits.exec("1,2,3");
// result.ast.value will be "1,2,3"
```

#### Take Until
```typescript
import { TakeUntil, Literal } from "clarity-pattern-parser";

const scriptText = new TakeUntil("script-text", new Literal("end-script", "</script>"));
const result = scriptText.exec("function() { return 1; }</script>");
// result.ast.value will be "function() { return 1; }"
```

### Pattern Context
```typescript
import { Context, Literal } from "clarity-pattern-parser";

const name = new Literal("name", "John");
const context = new Context("name-context", name);

const result = context.exec("John");
// result.ast.value will be "John"
```

### Pattern Reference
```typescript
import { Reference, Literal, Sequence } from "clarity-pattern-parser";

const name = new Literal("name", "John");
const reference = new Reference("name-ref", name);
const pattern = new Sequence("pattern", [reference]);

const result = pattern.exec("John");
// result.ast.value will be "John"
```

### Key Features of Direct Pattern Usage
1. Full control over pattern construction and configuration
2. Ability to create custom pattern types
3. Direct access to pattern execution and AST manipulation
4. Better performance for complex patterns
5. Easier debugging and testing
6. More flexible pattern composition

### Pattern Execution
All patterns support the following methods:
- `exec(text: string, debug?: boolean)`: Execute the pattern against the given text
- `test(text: string)`: Test if the pattern matches the given text
- `getTokens()`: Get the tokens that the pattern can match
- `getNextTokens(text: string)`: Get the next possible tokens based on the current text

### AST Manipulation
The AST (Abstract Syntax Tree) returned by pattern execution can be manipulated:
```typescript
const result = pattern.exec("some text");
if (result.ast) {
    // Find all nodes with a specific name
    const nodes = result.ast.findAll(n => n.name === "space");
    
    // Remove nodes
    nodes.forEach(n => n.remove());
    
    // Get the final value
    const value = result.ast.value;
}
```