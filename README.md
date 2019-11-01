We could potentially create validators on the parsers. So if the parsing may be valid but the value may be invalid. Custom Validators in the contructor of the parser would be the way to do it.


Need to make this repeater take an optional divider parser.
'1,2,3,4'
the numbers with in the sequence could be a number parser, and the 
commas could done with a divider parser looking for commas.
The dividers are stored as values. Or maybe be stored in an object 
that has a values, and dividers array.

letter = 
singleQuote = "'";
doubleQuote = "\"";
anyCharacterButSingleQuote = !"'";
anyCharacterButSingleQuote = !"\"";

singleQuoteString = singleQuote & anyCharacterButSingleQuote & singleQuote;
doubleQuoteString = doubleQuote & anyCharacterButSingleQuote & doubleQuote;

divider