NEVER BE TEMPTED TO PUT LOGIC IN SYNTAX. THIS IS MEANT TO BE DECLARATIVE AND COMPOSABLE. If you want a different behavior from a parse, then compose it.


We need to make the Pattern interface an abstract class that handles some methods that are the same accross the patterns and create an id for pattern so we can detect cyclical parses.