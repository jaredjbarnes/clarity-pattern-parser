## Installation

```
npm install clarity-pattern-parser
```

## Literal
```ts
import { Literal } from "clarity-pattern-parser";

const john = new Literal("john", "John");
const { ast } = john.parseText("John");

ast.type // ==> "literal"
ast.name // ==> "john"
ast.value // ==> "John"
```

### Error
```ts
import { Literal } from "clarity-pattern-parser";

const john = new Literal("john", "John");
const { ast, cursor } = john.parseText("Jane");

ast // ==> null
cursor.hasError // ==> true
```

### Optional
```ts
import { Literal } from "clarity-pattern-parser";

const john = new Literal("john", "John", true);
const { ast, cursor } = john.parseText("Jane");

ast // ==> null
cursor.hasError // ==> false
```

## Regex
```ts
import { Regex } from "clarity-pattern-parser";

const digits = new Regex("digits", "\\d+");
const { ast } = digit.parseText("12");

ast.type // ==> "regex"
ast.name // ==> "digits"
ast.value // ==> "12"
```

### Optional 
```ts
import { Regex } from "clarity-pattern-parser";

const digits = new Regex("digits", "\\d+", true);
const { ast, cursor } = digit.parseText("Text");

ast // ==> null
cursor.hasError // ==> false
```

### Regex Caveats
Do not use "^" at the beginning or "$" at the end of your regular expression. If you are creating a regular expression that is concerned about the beginning and end of the text you should probably just use a regular expression.

## And
```ts
import { And, Literal } from "clarity-pattern-parser";

const jane = new Literal("jane", "Jane");
const space = new Literal("space", " ");
const doe = new Literal("doe", "Doe");

const fullName = new And("full-name", [jane, space, doe]);

const { ast } = fullName.parseText("Jane Doe");

ast.toJson(); // Look Below for output
```

```json
{
    "type": "and",
    "name": "full-name",
    "value": "Jane Doe",
    "children"

}
```