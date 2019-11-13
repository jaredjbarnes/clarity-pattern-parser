Parsers
===
OrValue
AndValue
RepeatValue
LiteralValue
AnyOfThese

OrComposite
AndComposite
RepeatComposite

Optional

When a parser cannot match against a cursor it will:
* A - Throw an error if it wasn't a optional parser, or
* B - return null if its an optional parser.

All parsers are responsible to increment to the next slot if a match has been made, unless it has reached the end, in which case the cursor remains at the end.

If a child parser throws, the parent parser is responsible to recover from the error. 

`null` is a implicit optional no match. So they can be filtered out.

```javascript 

const letter = new AnyOfThese("letter", "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
const digit = new AnyOfThese("digit", "0987654321");
const alphaNumericCharacter = new OrValue([letter, digit]);
const alphaNumeric = new RepeatValue("alpha-numeric", alphaNumericCharacter);
const identifier = new AndValue("identifier", [letter, new Optional(alphaNumeric)]);


```

Min Max on Repeat as well as divider Parser.

Patterns can give intellisense with traversing the patterns. Pattern validation happens during parsing, and value validation happens when visiting the nodes.