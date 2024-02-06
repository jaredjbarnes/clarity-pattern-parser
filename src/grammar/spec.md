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

### Zero Or More Pattern

```
digit = /\d/
comma = ","
digits = digit* comma
```

### Zero Or More & Trim Trailing Divider
```
digit = /\d/
comma = ","
digits = digit* comma -t
```

This is a useful feature if you don't want the divider to be the last pattern found. Let's look at the example below to understand.

```ts
const expression = `
    digit = /\d/
    comma = ","
    digits = digit* comma -t
`;

const { digits } = Gammar.parse(expression);

let result = digits.exec("1,2,3");
expect(result.ast?.value).toBe("1,2,3");

result = digits.exec("1,2,");
expect(result.ast).toBeNull();
```

### Zero Or More With Optional Repeated Pattern

```
digit = /\d/
comma = ","
digits = digit?* comma
```

### One Or More With Optional Repeated Pattern

```
digit = /\d/
comma = ","
digits = digit?+ comma
```

### Upper Limit

```
digit = /\d/
comma = ","
digits = digit{,3} comma
```

### Bounded

```
digit = /\d/
comma = ","
digits = digit{1,3} comma
```

### Lower Limit

```
digit = /\d/
comma = ","
digits = digit{1,3} comma
```
