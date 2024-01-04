## Installation

```
npm install clarity-pattern-parser
```

## Grammar Ideas
integer = /[1-9][0-9]+/
method-name = "subtract" | "add" | "multiply"
divider = /\s*,\s*/
open-paren = "("
close-paren = ")"
argument = integer | method
arguments = argument* divider
not-integer = !integer
method = method-name & open-paren & arguments & close-paren

integer.tokens = "1", "2", "3", "4"
integer.enableContextualTokenAggregation
arguments.shouldReduceAst

export method, arguments

// Other file
import method, arguments from "./method.grammar"




