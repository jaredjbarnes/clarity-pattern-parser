import { patterns } from "../grammar/patterns";

const { expression } = patterns`
number = /[+-]?(\\d+(\\.\\d*)?|\\.\\d+)([eE][+-]?\\d+)?/
spaces = /\\s+/
single-quote-string-literal = /'(?:\\\\.|[^'\\\\])*'/
name = /[a-zA-Z_-]+[a-zA-Z0-9_-]*/
comma = /\\s*,\\s*/
wild-card = "*"
equal = "="
not-equal = "!="
starts-with = "^="
ends-with = "$="
contains = "*="
greater-than-or-equal = ">="
less-than-or-equal = "<="
greater-than = ">"
less-than = "<"
operators =      equal |
             not-equal | 
           starts-with | 
             ends-with | 
              contains | 
 greater-than-or-equal | 
    less-than-or-equal | 
          greater-than | 
             less-than
             
attribute-name = name
value = name
attribute-value = single-quote-string-literal | number | value
attribute-selector = "[" + spaces? + attribute-name + spaces? + operators + spaces? + attribute-value + "]"

adjacent = spaces? + "+" + spaces?
after = spaces? + "~" + spaces?
direct-child = spaces? + ">" + spaces?
descendant = spaces

combinators =  adjacent | after | direct-child | descendant
name-selector = name-selector-expression + attribute-selector
name-selector-expression = name-selector | name
node-selector = wild-card | attribute-selector | name-selector-expression
or-selector = (node-selector, comma){2}

selector-expression = expression + combinators + expression
expression = selector-expression | or-selector | node-selector 
`;

export const selectorParser = expression;