## Grammar Ideas
```
#comment
integer = /0|([1-9][0-9]+)/
method-name = /[a-zA-Z_-]+[a-zA-Z0-9_-]*/
divider = /\s*,\s*/
open-paren = "("
close-paren = ")"
argument = integer | method
arguments = argument+ divider # Normal Repeat
arguments = argument* divider # Optional Repeat 
arguments = argument{,3} divider # optionally up to 3 
arguments = argument{1,3} divider # 1 to 3
arguments = argument{2,} divider # 2 or more
arguments = argument{3} divider # Match 3
arguments = argument{0,} divider # Optional Repeat 
not-integer = !integer
optional-integer = integer?
method = method-name & open-paren & arguments & close-paren

export (method, arguments)
```

Using Grammar for a simple JSON Parser
```
# Number Integer
integer = /([1-9][0-9]*)|0/ 
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


In order to keep intellisense working we need to create BoundedRepeat pattern. This would 
allow us to stamp out the patterns as described exactly. The reason Repeat can't do this
is because we don't have the context of how many matches went before. But if we have
a pattern for each match we can. 

We need both repeats to support a min, but one is upper bound.

So we should call it FiniteRepeat.