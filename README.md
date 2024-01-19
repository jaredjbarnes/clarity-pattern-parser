## Installation

```
npm install clarity-pattern-parser
```
## Overview
All patterns will either return an AST node or null. If the pattern returns null, it didn't find the pattern. If the pattern returned null and the cursor has an error, then something is wrong with the text you are parsing. If the pattern returned null and the cursor doesn't have an error then the pattern is optional. 

## Literal
Literal uses a string literal to match patterns.
```ts
import { Literal } from "clarity-pattern-parser";

const firstName = new Literal("first-name", "John");
const { ast } = firstName.parseText("John");

ast.type // ==> "literal"
ast.name // ==> "first-name"
ast.value // ==> "John"
```

## Regex
Regex uses regular expressions to match patterns 
```ts
import { Regex } from "clarity-pattern-parser";

const digits = new Regex("digits", "\\d+");
const { ast } = digit.parseText("12");

ast.type // ==> "regex"
ast.name // ==> "digits"
ast.value // ==> "12"
```

### Regex Caveats
Do not use "^" at the beginning or "$" at the end of your regular expression. If you are creating a regular expression that is concerned about the beginning and end of the text you should probably just use a regular expression. 

## And
And is a way to make a sequence pattern. And accepts any other patterns as children, even other and patterns. 
```ts
import { And, Literal } from "clarity-pattern-parser";

const jane = new Literal("first-name", "Jane");
const space = new Literal("space", " ");
const doe = new Literal("last-name", "Doe");

const fullName = new And("full-name", [jane, space, doe]);

const { ast } = fullName.parseText("Jane Doe");

ast.toJson(); // Look Below for output
```

```json
{
    "type": "and",
    "name": "full-name",
    "value": "Jane Doe",
    "firstIndex": 0,
    "lastIndex": 7,
    "startIndex": 0,
    "endIndex": 8,
    "children": [
        {
            "type": "literal",
            "name": "first-name",
            "value": "Jane",
            "firstIndex": 0,
            "lastIndex": 3,
            "startIndex": 0,
            "endIndex": 4,
            "children": []
        },
        {
            "type": "and",
            "name": "space",
            "value": " ",
            "firstIndex": 4,
            "lastIndex": 4,
            "startIndex": 4,
            "endIndex": 5,
            "children": []
        },
        {
            "type": "and",
            "name": "last-name",
            "value": "Doe",
            "firstIndex": 5,
            "lastIndex": 7,
            "startIndex": 5,
            "endIndex": 8,
            "children": []
        }         
    ]
}
```

## Or

```ts
import { Or, Literal } from "clarity-pattern-parser";

const jane = new Literal("jane", "Jane");
const john = new Literal("john", "John");
const firstName = new Or("first-name", [jane, john]);

let ast= firstName.parseText("Jane").ast;

ast.type // ==> "literal"
ast.name // ==> "jane"
ast.value // ==> "Jane"

ast = firstName.parseText("John").ast;

ast.type // ==> "literal"
ast.name // ==> "john"
ast.value // ==> "John"
```

## Error Handling