# Clarity Pattern Parser Grammar

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

## Expression Patterns
Support for recursive expression patterns with optional right association:
```
expression = ternary | variables
ternary = expression + " ? " + expression + " : " + expression
```

Add `right` keyword for right association:
```
expression = ternary right | variables
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