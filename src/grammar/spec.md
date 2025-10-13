# Grammar Documentation

This guide describes the syntax rules and composition patterns supported by cpat. Each section shows how to define reusable parsing rules.

---

## Literals

A **literal** matches an exact string.

```grammar
name = "Literal"
```

---

## Regex

A **regex** pattern matches text using a regular expression.

```grammar
digits = /\d+/
```

### Regex Caveats
Do **not** use `^` at the start or `$` at the end of your regex. If you want to constrain the beginning or end of the input, use a dedicated pattern instead.

---

## Sequence

A **sequence** succeeds only if all patterns match in the given order.

```grammar
space = " "
first-name = "John"
last-name = "Doe"
full-name = first-name + space + last-name
```

---

## Optional Pattern

Patterns in a sequence may be marked **optional**.

```grammar
space = " "
first-name = /\w+/
last-name = /\w+/
middle-name = /\w+/
middle-name-with-space = middle-name + space

full-name = first-name + space + middle-name-with-space? + last-name
```

---

## Negative Lookahead

Use `!` to prevent a specific pattern from matching.

```grammar
space = " "
first-name = /\w+/
last-name = /\w+/
jack = "Jack"

full-name = !jack + first-name + space + last-name
```

This ensures the first name is not `"Jack"`.

---

## Options

An **options** pattern succeeds if *any one* of the choices matches.

```grammar
multiply = "*"
divide = "/"
operators = multiply | divide
```

---

## Repeat

### Zero or More

```grammar
digit = /\d/
digits = (digit)*
```

### Zero or More with Delimiters

```grammar
digit = /\d/
comma = ","
digits = (digit, comma)*
```

### One or More with Trimmed Trailing Delimiter

```grammar
digit = /\d/
comma = ","
digits = (digit, comma trim)+
```

This prevents trailing commas from being accepted.

---

### One or More

```grammar
digit = /\d/
digits = (digit)+
```

### Exact Count

```grammar
digit = /\d/
digits = (digit){2}
```

### Bounded Repeats

```grammar
digit = /\d/
digits = (digit){1,3}   # between 1 and 3
digits = (digit){,3}    # up to 3
```

---

## Expressions

Expressions support **prefix**, **infix**, **postfix**, and **right-associative** notation, with operator precedence and recursion.

- **Prefix**: Operator(s) come before the expression. The sequence must end with the name of the expression being made.  
- **Infix**: Operator(s) come between expressions.  
- **Postfix**: Operator(s) come after the expression.  
- **Right-associative**: Operator(s) group toward the right.  

### Prefix Expression

```grammar
increment = "++"
integer = /[1-9][0-9]*/
space = /\s+/

prefix-expr = increment + space? + expr
expr = prefix-expr | integer
```

Examples:  
- `++5`  
- `++ 10`

---

### Infix Expression

```grammar
add-sub = "+" | "-"
mul-div = "*" | "/"
integer = /[1-9][0-9]*/
space = /\s+/

add-sub-expr = expr + space? + add-sub + space? + expr
mul-div-expr = expr + space? + mul-div + space? + expr

expr = mul-div-expr | add-sub-expr | integer
```

Examples:  
- `4 * 2`  
- `7 + 3`  

---

### Postfix Expression

```grammar
factorial = "!"
integer = /[1-9][0-9]?/
space = /\s+/

postfix-expr = expr + space? + factorial
expr = postfix-expr | integer
```

Examples:  
- `5!`  
- `10 !`  

---

### Combined Expressions

By layering them into a single `expr` rule, you can combine prefix, infix, and postfix with precedence:

```grammar
increment = "++"
factorial = "!"
add-sub = "+" | "-"
mul-div = "*" | "/"

integer = /[1-9][0-9]*/
space = /\s+/

prefix-expr   = increment + space? + expr
postfix-expr  = expr + space? + factorial
mul-div-expr  = expr + space? + mul-div + space? + expr
add-sub-expr  = expr + space? + add-sub + space? + expr

expr = postfix-expr 
     | prefix-expr 
     | mul-div-expr 
     | add-sub-expr 
     | integer
```

Examples:  
- `++5`  
- `5!`  
- `++5!`  
- `2 + 3 * 4`  

---

### Recursive Expressions

Since each rule references `expr`, the grammar is recursive and can handle deeply nested inputs.

Examples:  
- `7++` → `postfix-expr`  
- `7++ * 9` → `mul-div-expr`  
- `7++ * 9 + 10` → `(7++) * 9 + 10` with correct precedence  

---

### Right-Associative Expressions

Some operators must associate to the **right**. Mark the operator with `right` to enforce this.

```grammar
power = "^"
integer = /[1-9][0-9]*/
space = /\s+/

power-expr = expr + space? + power + space? + expr
expr = power-expr right | integer
```

Examples:  
- `2 ^ 3 ^ 2`  
  - Right-associative → `2 ^ (3 ^ 2)` = `512`  
  - Left-associative → `(2 ^ 3) ^ 2` = `64`  

---


## Imports

### Basic Import

```grammar
import { spaces } from "https://some.cdn.com/some/spaces.cpat"

first-name = "John"
last-name = "Doe"
full-name = first-name + spaces + last-name
```

### Multiple Named Imports

```grammar
import { spaces, first-name } from "https://some.cdn.com/some/spaces.cpat"

last-name = "Doe"
full-name = first-name + spaces + last-name
```

### Multiple Imports

```grammar
import { spaces, first-name } from "https://some.cdn.com/some/patterns.cpat"
import { last-name } from "https://some.cdn.com/some/last-name.cpat"

full-name = first-name + spaces + last-name
```

---

## Import Parameters

You can inject parameters into imported patterns.

**File:** `main.ts`
```ts
const firstName = new Literal("first-name", "John");
const lastName = new Literal("last-name", "Doe");
const grammar = Grammar.import('file.cpat', { params: [firstName, LastName] });
```

**File:** `file.cpat`
```grammar
use params { first-name, last-name }

full-name = first-name + spaces + last-name
```

### Imports with Params

```grammar
use params { other-pattern }
import { first-names, last-names } from "some-file.cpat" with params {
    some-pattern = "Some Pattern"
    some-pattern2 = other-pattern
}

full-name = first-names + spaces + last-names
```

---
