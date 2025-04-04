# Grammar

## Literal

```
name = "Literal"
```

## Regex

```
digits = /\d+/
```

### Regex Caveats

Do not use "^" at the beginning or "$" at the end of your regular expression. If
you are creating a regular expression that is concerned about the beginning and
end of the text you should probably just use a regular expression.

## Or
This succeeds if it matches any of the options.
```
multiply = "*"
divide = "/"
operators = mulitply | divide
```

## And
This succeeds if it matches all of the patterns in the order they are placed.
```
space = " "
first-name = "John"
last-name = "Doe"
full-name = first-name & space & last-name
```

### Optional pattern
Patterns within the and sequence can be optional.
```
space = " "
first-name = /\w+/
last-name = /\w+/
middle-name = /\w+/
middle-name-with-space = middle-name & space

full-name = first-name & space & middle-name-with-space? & last-name
```

### Negative Look Ahead
This will ensure that the first name isn't `Jack` before continuing to match for
a name.

```
space = " "
first-name = /\w+/
last-name = /\w+/
middle-name = /\w+/
middle-name-with-space = m-middle-name & space
jack = "Jack"

full-name = !jack & first-name & space & middle-name-with-space? & last-name
```

## Repeat
```
digit = /\d/
digits = (digit)*
```

### Zero Or More Pattern
```
digit = /\d/
comma = ","
digits = (digit, comma)*
```

### Zero Or More & Trim Trailing Divider
```
digit = /\d/
comma = ","
digits = (digit, comma){t}
```

This is a useful feature if you don't want the divider to be the last pattern found. Let's look at the example below to understand.

```ts
const expression = `
    digit = /\d/
    comma = ","
    digits = (digit, comma){t}
`;

const { digits } = Gammar.parse(expression);

let result = digits.exec("1,2,3");
expect(result.ast?.value).toBe("1,2,3");

result = digits.exec("1,2,");
expect(result.ast).toBeNull();
```

### Zero Or More

```
digit = /\d/
comma = ","
digits = (digit, comma)*
```

### Upper Limit

```
digit = /\d/
comma = ","
digits = (digit, comma){,3}
```

### Bounded

```
digit = /\d/
comma = ","
digits = (digit, comma){1,3}
```

### Lower Limit

```
digit = /\d/
comma = ","
digits = (digit, comma){1,}
```

### Import
```
import { spaces } from "https://some.cdn.com/some/spaces.cpat"

first-name = "John"
last-name = "Doe"
full-name = first-name & spaces & last-name
```

### Muliple Named Imports
```
import { spaces, first-name } from "https://some.cdn.com/some/spaces.cpat"

last-name = "Doe"
full-name = first-name & spaces & last-name
```

### Muliple Imports
```
import { spaces, first-name } from "https://some.cdn.com/some/patterns.cpat"
import { last-name } from "https://some.cdn.com/some/last-name.cpat"

full-name = first-name & spaces & last-name
```

### Import Params
This allows you to inject patterns within another pattern.
```ts
const firstName = new Literal("first-name", "Jared");
const grammar = Grammar.import('file.cpat', {params: [firstName, LastName]})
```
file.cpat
```
import params { first-names, last-names } 

full-name = first-names & spaces & last-names
```

### Imports with Params
```
import params { other-pattern }
import { first-names, last-names } from "some-file.cpat" with params {
    some-pattern = "Some Pattern"
    some-pattern2 = other-pattern
}

full-name = first-names & spaces & last-names
```
