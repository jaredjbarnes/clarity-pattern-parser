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

ast.toJson(2)
```
```json
{
  "type": "literal",
  "name": "first-name",
  "value": "John",
  "firstIndex": 0,
  "lastIndex": 3,
  "startIndex": 0,
  "endIndex": 4,
  "children": []
}
```

## Regex
The "Regex" pattern uses regular expressions to match patterns 
```ts
import { Regex } from "clarity-pattern-parser";

const digits = new Regex("digits", "\\d+");

const { ast } = digits.parseText("12");

ast.toJson(2);
```
```json
{
  "type": "regex",
  "name": "digits",
  "value": "12",
  "firstIndex": 0,
  "lastIndex": 1,
  "startIndex": 0,
  "endIndex": 2,
  "children": []
}
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

ast.toJson(2); // Look Below for output
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
const { ast }= firstName.parseText("Jane");

ast.toJson(2)
```
```json
{
  "type": "literal",
  "name": "jane",
  "value": "Jane",
  "firstIndex": 0,
  "lastIndex": 3,
  "startIndex": 0,
  "endIndex": 4,
  "children": []
}
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
The `Reference` pattern traverses the pattern composition to find the pattern that matches the one given to it at construction. It will then clone that pattern and tell that pattern to parse the text. If it cannot find the pattern with the given name, it will throw a runtime error.
## Not

## Intellisense
Because the patterns are composed in a tree and the cursor remembers what patterns matched last, we can ask what tokens are next. We will discuss how you can use clarity-pattern-parser for text auto complete and other interesting approaches for intellisense.

## GetTokens
The `getTokens` method allow you to ask the pattern what tokens it is looking for. The Regex pattern was the only pattern that didn't already intrinsically know what patterns it was looking for, and we solved this by adding a `setTokens` to its class. This allows you to define a regexp that can capture infinitely many patterns, but suggest a finite set. We will discuss this further in the setTokens section. For now we will demonstrate what `getTokens` does.

```ts
import { Or, Literal } from "clarity-pattern-parser";

const jane = new Literal("jane", "Jane");
const john = new Literal("john", "John");
const jack = new Literal("jack", "Jack");
const jill = new Literal("jill", "Jill");

const names = new Or("names", [jane, john, jack, jill]);

names.getTokens();
```
```json
["Jane", "John", "Jack", "Jill"]
```
## GetNextTokens

## SetTokens

## Error Handling