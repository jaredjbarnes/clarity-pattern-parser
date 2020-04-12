* Pull out getPossibilities and getNextTokens methods from the patterns and put them in a utility.

* Make TextInspector use the cursor history to find the furthest point in the parse. If there is a match at the furthest point with more than one, then call getNextToken on all those points.