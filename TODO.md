* Anonymous patterns within cpat files.
```
pattern = ("Name" | "Name") & "Blah" & /foo/
```
* Aliasing imports.
* Send through params 

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