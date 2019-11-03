We could potentially create validators on the parsers. So if the parsing may be valid but the value may be invalid. Custom Validators in the contructor of the parser would be the way to do it.

Maybe make the And and Or Either

Throw an error if there isn't a match.
Return null if optional match doesn't match. (Cursor needs to be placed at position the parser received it.)
Return Value Node or Composite Node on Match.
