* Add a Context Pattern
This will allow you to store a list of patterns and the pattern you want to start a parse from. This will hold the context of many patterns
that perhaps are references but are by way of the context. This will be helpful with cpat files.

* Optimizations We can add a map to the cursor where we can search through previous matches and if the match for this pattern with this id has already matched in other bracnhes of the parse it can just use the node and clone it and skip the full parse and speed up things tremendously


* Generate typescript files from cpat

* We should make a Block, Segments Pattern. These will be breadth first patterns. It look something like this.

```ts
new Block(startPattern,contentPattern,endPattern);
```

```
block = [start-pattern, end-pattern];
```

It will count the startPattern and only be done when its ends equal to end Pattern. It will store the internal pattern needed for its content. This is what is lazily done at some point in the future.

```ts
new Segments(segmentPattern);

```



NEVER BE TEMPTED TO PUT LOGIC IN SYNTAX. THIS IS MEANT TO BE DECLARATIVE AND COMPOSABLE. If you want a different behavior from a parse, then compose it.


We need to make the Pattern interface an abstract class that handles some methods that are the same accross the patterns and create an id for pattern so we can detect cyclical parses.