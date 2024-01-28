## Grammar Ideas
```
#comment
integer = /0|([1-9][0-9]+)/
method-name = "subtract" | "add" | "multiply"
divider = /\s*,\s*/
open-paren = "("
close-paren = ")"
argument = integer | method
arguments = argument* divider
not-integer = !integer
optional-integer = integer?
method = method-name & open-paren & arguments & close-paren

integer.tokens = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
integer.enableContextualTokenAggregation
arguments.shouldReduceAst

export (method, arguments)
```

Using Grammar for a simple JSON Parser
```
# Number Integer
integer = /([1-9][0-9])*|0/ 
digit = /\d+/

# Number Fraction
period = "."
fraction = period & digit

# Number Exponent
e = "e" | "E"
sign = "+" | "-"
number-exponent = e & sign? & digit

# Number
number = integer & fraction? & number-exponent?

# String Unicode
hex-digit = /[0-9a-fA-F]/
unicode =  "u" & hex-digit & hex-digit & hex-digit & hex-digit
special-character = 
    "'"     | 
    "\""    |  
    "\\"    |
    "/"     | 
    "b"     |
    "f"     | 
    "n"     |
    "r"     | 
    "t"     |
    unicode

normal-character = /[^\\"]+/
escaped-character = "\\" & special-character  
character = normal-character | special-character
characters = character*

# String
string = "\"" & characters & "\""

# Boolean
boolean = "true" | "false"

spaces /\s+/

array-item = number | boolean | string | array | object
array-items = array-items* /\s+,\s+/
array = "[" & spaces? & array-items & spaces? & "]"


```

// Other file
import (method, arguments) from "./method.grammar"



We can easily make this parser a breadth first parser by adding a custom parser to essentially count brackets until its whole, so capture a full block, then allow another system handle each block.

By default this parser is depth first. 