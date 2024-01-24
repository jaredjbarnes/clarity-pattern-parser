## Installation

```
npm install clarity-pattern-parser
```
## Overview

### Leaf Patterns
* Literal
* Regex

### Composing Patterns
* And
* Or
* Repeat
* Reference
* Not

The "Not" pattern is a negative look ahead and mostly used with the "And" pattern. This will be illustrated in more detail within the "Not" pattern section.


## Literal
The "Literal" pattern uses a string literal to match patterns.
```ts
import { Literal } from "clarity-pattern-parser";

const firstName = new Literal("first-name", "John");
const { ast } = firstName.parseText("John");

ast.type // ==> "literal"
ast.name // ==> "first-name"
ast.value // ==> "John"
```

## Regex
The "Regex" pattern uses regular expressions to match patterns 
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
The "And" pattern is a way to make a sequence pattern. And accepts all other patterns as children. 
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
The "Or" pattern mathes any of the patterns given to the constructor. 
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

## Repeat
The "Repeat" patterns allows you to match repeating patterns with, or without a divider.

For example you may want to match a pattern like so.
```
1,2,3
```
Here is the code to do so. 
```ts
import { Repeat, Literal, Regex } from "clarity-pattern-parser";

const digit = new Regex("digit", "\\d+");
const commaDivider = new Literal("comma", ",");
const numberList = new Repeat("number-list", digit, commaDivider);

const ast = numberList.parseText("1,2,3").ast;

ast.type // ==> "repeat"
ast.name // ==> "number-list"
ast.value // ==> "1,2,3

ast.children[0].value // ==> "1"
ast.children[1].value // ==> ","
ast.children[2].value // ==> "2"
ast.children[3].value // ==> ","
ast.children[4].value // ==> "3"
```

If there is a trailing divider without the repeating pattern, it will not include the trailing divider as part of the result. Here is an example.

```ts
import { Repeat, Literal, Regex } from "clarity-pattern-parser";

const digit = new Regex("digit", "\\d+");
const commaDivider = new Literal("comma", ",");
const numberList = new Repeat("number-list", digit, commaDivider);

const ast = numberList.parseText("1,2,").ast;

ast.type // ==> "repeat"
ast.name // ==> "number-list"
ast.value // ==> "1,2

ast.children[0].value // ==> "1"
ast.children[1].value // ==> ","
ast.children[2].value // ==> "2"
ast.children.length // ==> 3
```

## Reference
Reference is a way to handle cyclical patterns. An example of this would be arrays within arrays. Lets say we want to make a pattern that matches an array that can store numbers and arrays.
```
[[1, [1]], 1, 2, 3]
```
Here is an example of using `Reference` to parse this pattern.
```ts
import { Regex, Literal, Or, Repeat, And, Reference } from "clarity-pattern-parser";

const integer = new Regex("integer", "\\d+");
const commaDivider = new Regex("comma-divider", "\\s*,\\s*");

const openBracket = new Literal("open-bracket", "[");
const closeBracket = new Literal("close-bracket", "]");
const item = new Or("item", [integer, new Reference("array")]);
const items = new Repeat("items", item, commaDivider);

const array = new And("array", [openBracket, items, closeBracket]);
const { ast } = array.parseText("[[1, [1]], 1, 2, 3]");

ast.toJson();
```
```json
{
  "type": "and",
  "name": "array",
  "value": "[[1, [1]], 1, 2, 3]",
  "firstIndex": 0,
  "lastIndex": 18,
  "startIndex": 0,
  "endIndex": 19,
  "children": [
    {
      "type": "literal",
      "name": "open-bracket",
      "value": "[",
      "firstIndex": 0,
      "lastIndex": 0,
      "startIndex": 0,
      "endIndex": 1,
      "children": []
    },
    {
      "type": "repeat",
      "name": "items",
      "value": "[1, [1]], 1, 2, 3",
      "firstIndex": 1,
      "lastIndex": 17,
      "startIndex": 1,
      "endIndex": 18,
      "children": [
        {
          "type": "and",
          "name": "array",
          "value": "[1, [1]]",
          "firstIndex": 1,
          "lastIndex": 8,
          "startIndex": 1,
          "endIndex": 9,
          "children": [
            {
              "type": "literal",
              "name": "open-bracket",
              "value": "[",
              "firstIndex": 1,
              "lastIndex": 1,
              "startIndex": 1,
              "endIndex": 2,
              "children": []
            },
            {
              "type": "repeat",
              "name": "items",
              "value": "1, [1]",
              "firstIndex": 2,
              "lastIndex": 7,
              "startIndex": 2,
              "endIndex": 8,
              "children": [
                {
                  "type": "regex",
                  "name": "integer",
                  "value": "1",
                  "firstIndex": 2,
                  "lastIndex": 2,
                  "startIndex": 2,
                  "endIndex": 3,
                  "children": []
                },
                {
                  "type": "regex",
                  "name": "comma-divider",
                  "value": ", ",
                  "firstIndex": 3,
                  "lastIndex": 4,
                  "startIndex": 3,
                  "endIndex": 5,
                  "children": []
                },
                {
                  "type": "and",
                  "name": "array",
                  "value": "[1]",
                  "firstIndex": 5,
                  "lastIndex": 7,
                  "startIndex": 5,
                  "endIndex": 8,
                  "children": [
                    {
                      "type": "literal",
                      "name": "open-bracket",
                      "value": "[",
                      "firstIndex": 5,
                      "lastIndex": 5,
                      "startIndex": 5,
                      "endIndex": 6,
                      "children": []
                    },
                    {
                      "type": "repeat",
                      "name": "items",
                      "value": "1",
                      "firstIndex": 6,
                      "lastIndex": 6,
                      "startIndex": 6,
                      "endIndex": 7,
                      "children": [
                        {
                          "type": "regex",
                          "name": "integer",
                          "value": "1",
                          "firstIndex": 6,
                          "lastIndex": 6,
                          "startIndex": 6,
                          "endIndex": 7,
                          "children": []
                        }
                      ]
                    },
                    {
                      "type": "literal",
                      "name": "close-bracket",
                      "value": "]",
                      "firstIndex": 7,
                      "lastIndex": 7,
                      "startIndex": 7,
                      "endIndex": 8,
                      "children": []
                    }
                  ]
                }
              ]
            },
            {
              "type": "literal",
              "name": "close-bracket",
              "value": "]",
              "firstIndex": 8,
              "lastIndex": 8,
              "startIndex": 8,
              "endIndex": 9,
              "children": []
            }
          ]
        },
        {
          "type": "regex",
          "name": "comma-divider",
          "value": ", ",
          "firstIndex": 9,
          "lastIndex": 10,
          "startIndex": 9,
          "endIndex": 11,
          "children": []
        },
        {
          "type": "regex",
          "name": "integer",
          "value": "1",
          "firstIndex": 11,
          "lastIndex": 11,
          "startIndex": 11,
          "endIndex": 12,
          "children": []
        },
        {
          "type": "regex",
          "name": "comma-divider",
          "value": ", ",
          "firstIndex": 12,
          "lastIndex": 13,
          "startIndex": 12,
          "endIndex": 14,
          "children": []
        },
        {
          "type": "regex",
          "name": "integer",
          "value": "2",
          "firstIndex": 14,
          "lastIndex": 14,
          "startIndex": 14,
          "endIndex": 15,
          "children": []
        },
        {
          "type": "regex",
          "name": "comma-divider",
          "value": ", ",
          "firstIndex": 15,
          "lastIndex": 16,
          "startIndex": 15,
          "endIndex": 17,
          "children": []
        },
        {
          "type": "regex",
          "name": "integer",
          "value": "3",
          "firstIndex": 17,
          "lastIndex": 17,
          "startIndex": 17,
          "endIndex": 18,
          "children": []
        }
      ]
    },
    {
      "type": "literal",
      "name": "close-bracket",
      "value": "]",
      "firstIndex": 18,
      "lastIndex": 18,
      "startIndex": 18,
      "endIndex": 19,
      "children": []
    }
  ]
}
```

## Not


## Error Handling