# Clarity Pattern Parser - Architecture

## Overview

Clarity Pattern Parser is a composable parsing library for TypeScript/JavaScript. It builds parsers from pattern primitives (literals, regex, sequences, options, repeats, expressions) and returns a rich AST (Abstract Syntax Tree) on successful match. Grammars can be defined programmatically via classes or declaratively via `.cpat` grammar strings.

## What Makes This Parser Different

Most parsers force you to choose between **recursive descent** (readable, composable, but can't handle left recursion) and **Pratt/precedence parsing** (handles operator precedence naturally, but requires a different mental model with binding power numbers and nud/led functions). This parser eliminates that tradeoff entirely.

When you write what looks like simple recursive options:

```
mul-expr = expr + " * " + expr
add-expr = expr + " + " + expr
expr = mul-expr | add-expr | integer
```

The grammar system detects the self-references at build time, auto-classifies each alternative as atom, prefix, postfix, or infix, and silently swaps in a Pratt precedence parser — while everything else stays recursive descent. Precedence is determined by declaration order (first = highest). You never need to manually eliminate left recursion, define precedence tables, or restructure your grammar.

Compare this to what traditional recursive descent requires to avoid left recursion:

```
# What you're forced to write in most parsers:
expr = term + addTail
addTail = "+" + term + addTail | empty
term = factor + mulTail
mulTail = "*" + factor + mulTail | empty
factor = integer | "(" + expr + ")"
```

That grammar no longer resembles the language it describes. With Clarity Pattern Parser, you stay in one mental model everywhere — literals, sequences, options, and expressions all use the same intuitive syntax. Someone can write a full expression grammar with precedence, associativity, prefix, postfix, and grouping that looks almost identical to the BNF you'd find in a language spec.

## Modular Grammar Composition

Most parser generators treat grammars as monolithic single files. ANTLR has `import` but it's just grammar inheritance. PEG.js/Peggy and Tree-sitter have no import system at all. Nearley has `@include`, which is text concatenation.

Clarity Pattern Parser has a full module system closer to how programming languages handle imports:

- **Selective imports**: `import { just-this } from "file.cpat"` — pick only the patterns you need
- **Aliasing**: `import { value as my-value }` — rename on import to avoid collisions
- **Parameterized grammars**: `import { items } from "list.cpat" with params { separator = "," }` — inject patterns into imported grammars
- **Default parameters**: `use params { value = default-value }` — fallbacks when no param is supplied
- **User-controlled resolution**: the `resolveImport` callback means grammars can live anywhere — filesystem, network, database, or bundled strings

The parameter system is what makes this truly unique. You can write a generic `delimited-list.cpat` once and import it everywhere with different separators, item patterns, and bounds. A `string.cpat` could accept a quote character as a parameter. A `block.cpat` could accept open/close delimiters. Grammars become reusable components rather than copy-paste templates.

## Built-in Grammar Introspection

Most parsers have a hard wall between grammar definition and execution — once built, you can't inspect what the grammar expects at runtime. ANTLR gives you flat token vocabulary lists after compilation. PEG.js compiles to a black-box function with no introspection API. Tree-sitter lets you query the output AST but not the grammar structure. Nearley exposes internal Earley chart state, but it's not designed for consumption.

Clarity Pattern Parser makes introspection a first-class part of the pattern interface. Every pattern in the tree implements:

- `getTokens()` — what literal tokens could this pattern match right now?
- `getNextTokens()` — what tokens could follow after this pattern completes?
- `getPatterns()` — what pattern objects are expected at this position?
- `getNextPatterns()` — what patterns could follow after this one?
- `getPatternsAfter(child)` — given a specific matched child, what comes next?

This isn't bolted on — it's woven into every pattern type with context-aware forwarding. A Sequence knows to ask its parent for next tokens when its last child completes. An Expression knows to suggest postfix and infix tokens after an atom matches. An Optional knows to include both its own tokens and its next sibling's.

This powers the `AutoComplete` system — real grammar-aware suggestions at any cursor position, not just keyword lists. Most editors that provide autocomplete for custom languages have to build that infrastructure entirely separate from the parser. Here it's intrinsic to the pattern tree itself.

## Extensible Decorators

Most parsers handle pattern-level configuration outside the grammar definition. ANTLR has `@header` and `@members` for injecting code into the generated parser, but nothing that annotates individual rules. PEG.js/Peggy attaches JavaScript action blocks `{ return ... }` — powerful but messy inline code, not declarative metadata. Tree-sitter has `prec()` / `prec.left()` function calls in its JavaScript DSL, but those are limited to precedence. Nearley has per-rule postprocessors, which are again inline code.

Clarity Pattern Parser takes a declarative approach:

```
@tokens([" ", "\t"])
whitespace = /\s+/
```

The grammar stays clean. The decorator is metadata *about* the pattern, not code *inside* the pattern. And it's extensible — you pass custom decorator functions via options and they receive the pattern object to modify however you need:

```typescript
const patterns = createPatternsTemplate({
  decorators: {
    record: (pattern) => { /* modify pattern */ },
    config: (pattern, arg) => { /* arg is JSON-parsed */ }
  }
});
```

This is a clean plugin point for grammar-level concerns without polluting pattern definitions. Custom decorators can accept JSON arguments — arrays, objects, strings, numbers — keeping everything declarative while remaining open to any use case.

## Project Structure

```
src/
  ast/
    Node.ts              # AST node class (the parse output)
    compact.ts           # Collapse subtrees into single value nodes
    remove.ts            # Remove nodes from tree
  patterns/
    Pattern.ts           # Pattern interface (all patterns implement this)
    Literal.ts           # Exact string match
    Regex.ts             # Regular expression match
    Sequence.ts          # Ordered concatenation (AND)
    Options.ts           # Alternatives (OR)
    Expression.ts        # Operator precedence parsing (recursive expressions)
    Repeat.ts            # Repetition with bounds and dividers
    InfiniteRepeat.ts    # Unbounded repetition implementation
    FiniteRepeat.ts      # Bounded repetition implementation
    Optional.ts          # Zero-or-one match
    Not.ts               # Negative lookahead
    TakeUntil.ts         # Consume text until terminator pattern
    Reference.ts         # Named reference to another pattern (enables recursion)
    Context.ts           # Scoped pattern resolution (wraps each grammar pattern)
    RightAssociated.ts   # Marks a pattern as right-associative in Expressions
    Cursor.ts            # Text traversal state (position, grapheme-aware)
    CursorHistory.ts     # Match/error recording for debugging and intellisense
    ParseError.ts        # Error position and pattern info
    ParseResult.ts       # { ast: Node | null, cursor: Cursor }
    PrecedenceTree.ts    # Builds precedence-correct AST for Expression
    execPattern.ts       # Main execution: creates Cursor, runs parse, checks full match
    testPattern.ts       # Boolean test: did the pattern match the full text?
  grammar/
    Grammar.ts           # Parses .cpat grammar strings into Pattern objects
    patterns.ts          # Tagged template literal API: patterns`...`
    patterns/
      grammar.ts         # The grammar pattern itself (bootstrapped)
      body.ts            # Body section of grammar (statements)
      statement.ts       # Assignment statements
      pattern.ts         # Right-hand side pattern dispatch
      literal.ts         # "string" literals in grammar
      regexLiteral.ts    # /regex/ literals in grammar
      sequenceLiteral.ts # a + b + c sequences in grammar
      optionsLiteral.ts  # a | b | c options in grammar
      repeatLiteral.ts   # (pattern){n,m} repeats in grammar
      takeUtilLiteral.ts # ?->| pattern take-until in grammar
      anonymousPattern.ts# Inline anonymous patterns in grammar
      import.ts          # import/use params statements in grammar
      comment.ts         # # comments in grammar
      spaces.ts          # Whitespace patterns
    decorators/
      tokens.ts          # @tokens decorator implementation
  intellisense/
    AutoComplete.ts      # Autocomplete suggestions from pattern structure
    Suggestion.ts        # Suggestion result type
  query/
    selector.ts          # CSS-like selectors for AST querying
    query.ts             # Query API for AST
```

## Core Architecture

### Pattern Hierarchy

Every parser component implements the `Pattern` interface:

```
Pattern (interface)
  parse(cursor: Cursor): Node | null    # Core parsing method
  exec(text: string): ParseResult       # Convenience: parse full text
  test(text: string): boolean            # Convenience: boolean match
  clone(name?): Pattern                  # Deep copy
  getTokens(): string[]                  # Intellisense support
```

**Leaf Patterns** (match text directly):
- `Literal` - exact string match, type = `"literal"`
- `Regex` - regex match (auto-prepends `^`, uses `gu` flags), type = `"regex"`

**Composite Patterns** (compose other patterns):
- `Sequence` - all children must match in order, type = `"sequence"`
- `Options` - first matching child wins (or longest if greedy), type = `"options"`
- `Expression` - operator precedence with prefix/postfix/infix, type = `"expression"`
- `Repeat` - bounded repetition with optional divider, type = `"infinite-repeat"` or `"finite-repeat"`

**Modifier Patterns** (wrap another pattern):
- `Optional` - match or skip (0 or 1), type = `"optional"`
- `Not` - negative lookahead (fails if child matches), type = `"not"`
- `TakeUntil` - consume all text until terminator matches, type = `"take-until"`
- `Reference` - lazy name-based lookup (enables recursion), type = `"reference"`
- `Context` - scoped resolution for references, type = `"context"`
- `RightAssociated` - marks infix pattern as right-associative, type = `"right-associated"`

### Parsing Flow

1. **Input**: Text string to parse
2. **Cursor creation**: `new Cursor(text)` - tracks position, grapheme-aware
3. **Pattern.parse(cursor)**: Recursive descent
   - Leaf patterns compare text at cursor position, create leaf `Node`
   - Composite patterns orchestrate children, create parent `Node` with child nodes
   - On failure: returns `null`, records error on cursor
   - On success: returns `Node`, advances cursor
4. **Full match check**: `execPattern()` verifies the entire input was consumed
5. **Result**: `ParseResult { ast: Node | null, cursor: Cursor }`

### Expression Pattern (Pratt Parsing)

The `Expression` pattern handles operator precedence automatically. When the grammar defines an options pattern where some alternatives reference the pattern itself (recursive), it becomes an `Expression` instead of `Options`.

Patterns are auto-classified:
- **Atoms**: No self-reference (e.g., `integer`, `group`)
- **Prefix**: Self-reference only at end (e.g., `unary-operator + expr`)
- **Postfix**: Self-reference only at start (e.g., `expr + postfix-operator`)
- **Infix/Binary**: Self-reference at both ends (e.g., `expr + operator + expr`)

Precedence is determined by declaration order (first = highest precedence). Association defaults to left; use `right` keyword or `RightAssociated` wrapper for right-associativity.

### Grammar System

The `Grammar` class parses `.cpat` grammar definition strings into `Pattern` objects. The grammar syntax itself is bootstrapped - it's defined using the same Pattern classes it produces.

**Flow**:
1. Grammar text is parsed by the internal `grammar` pattern (self-hosted)
2. The resulting AST is walked to build `Pattern` objects
3. Each named pattern is wrapped in a `Context` for reference resolution
4. Returns `Record<string, Pattern>` - all named patterns accessible by name

### Context and Reference Resolution

When a grammar pattern references another pattern by name, it creates a `Reference`. At parse time, `Reference` walks up the pattern tree to find a `Context` that contains the target pattern. `Context` wraps every top-level grammar pattern and holds all sibling patterns for resolution.

This enables:
- Forward references (use a pattern before defining it)
- Recursive patterns (a pattern that references itself)
- Imported patterns (resolved at grammar parse time)

### AST Node

The `Node` class is the output of all parsing. It forms a tree structure:

```typescript
Node {
  type: string       // Pattern type that created it ("literal", "regex", "sequence", etc.)
  name: string       // Pattern name (user-defined in grammar)
  value: string      // Matched text (computed from children for composite nodes)
  startIndex: number // 0-based start position in input
  endIndex: number   // 0-based exclusive end position
  children: Node[]   // Child nodes (empty for leaf nodes)
  parent: Node       // Parent reference
}
```

Key methods: `find()`, `findAll()`, `walkUp()`, `walkDown()`, `transform()`, `flatten()`, `compact()`, `remove()`, `clone()`, `toCycleFreeObject()`, `toJson()`.

### Two APIs for Grammar Definition

**1. Programmatic API** - Build patterns directly with classes:
```typescript
const name = new Literal("name", "John");
const pattern = new Sequence("greeting", [new Literal("hi", "Hello "), name]);
const result = pattern.exec("Hello John");
```

**2. Grammar String API** - Define patterns declaratively:
```typescript
// Via Grammar class
const patterns = Grammar.parseString(`
  name = "John"
  greeting = "Hello " + name
`);
const result = patterns["greeting"].exec("Hello John");

// Via tagged template literal (kebab-case names become camelCase)
const { greeting } = patterns`
  name = "John"
  greeting = "Hello " + name
`;
const result = greeting.exec("Hello John");
```

### Import System

Grammars support importing patterns from other `.cpat` files:
```
import { pattern-name } from "path/to/file.cpat"
import { old-name as new-name } from "file.cpat"
import { pattern } from "file.cpat" with params { key = value }
```

Import resolution is user-provided via `resolveImport` / `resolveImportSync` callbacks.

### Parameterized Grammars

Grammars can accept parameters, allowing pattern injection:
```
use params { custom-divider }
items = (item, custom-divider)+
```

Parameters are passed via the `params` option or through `with params` blocks in import statements.

### Decorators

Patterns can be decorated in grammar files:
```
@tokens([" ", "\t"])
whitespace = /\s+/
```

The `@tokens` decorator is built-in. Custom decorators are supported via the `decorators` option.

### Intellisense

Every pattern implements `getTokens()`, `getNextTokens()`, `getPatterns()`, and `getNextPatterns()`. The `AutoComplete` class uses these to provide context-aware suggestions at any position in a partial parse.
