/**
 * TypeScript Grammar for Clarity Pattern Parser
 *
 * A comprehensive parser for the TypeScript language, handling:
 * - Expressions with full operator precedence (Pratt parsing)
 * - Type expressions (unions, intersections, conditionals, mapped, etc.)
 * - All statement types (if, for, while, switch, try, etc.)
 * - Declarations (function, class, interface, type alias, enum, namespace)
 * - Module system (import/export)
 * - Generics, decorators, destructuring, template literals
 *
 * Known limitations:
 * - JSX/TSX is not supported
 * - Automatic Semicolon Insertion (ASI) is approximated (semicolons are optional)
 * - Some edge cases with generic type arguments vs comparison operators
 * - `declare global {}` augmentation not fully supported
 * - Overloaded function signatures not fully supported
 */

import { Grammar } from "../../grammar/Grammar";
import { Pattern } from "../../patterns/Pattern";

export const typescriptGrammar = `

# ===================================================
# TYPESCRIPT GRAMMAR
# ===================================================

# ---------------------------------------------------
# SECTION 1: Whitespace & Comments
# ---------------------------------------------------
_ = /(?:[ \\t\\n\\r\\f\\v]+|\\/\\/[^\\n]*(?:\\n|$)|\\/\\*[\\s\\S]*?\\*\\/)+/
ws = _?
semi = ws + ";"

# ---------------------------------------------------
# SECTION 2: Identifiers & Keywords
# ---------------------------------------------------
reserved = /(?:break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|false|finally|for|function|if|import|in|instanceof|let|new|null|return|super|switch|this|throw|true|try|typeof|var|void|while|with|yield|async|await|undefined)(?![a-zA-Z0-9_$])/
identifier-name = /[a-zA-Z_$][a-zA-Z0-9_$]*/
identifier = !reserved + identifier-name

# ---------------------------------------------------
# SECTION 3: Literals
# ---------------------------------------------------

# Numeric literals: decimal, hex, octal, binary, bigint, separators
number-literal = /(?:0[xX][\\da-fA-F][\\da-fA-F_]*|0[oO][0-7][0-7_]*|0[bB][01][01_]*|(?:(?:0|[1-9][\\d_]*)(?:\\.[\\d_]*)?|\\.[\\d][\\d_]*)(?:[eE][+-]?[\\d][\\d_]*)?)n?/

# String literals
single-string = /'(?:[^'\\\\]|\\\\.)*'/
double-string = /"(?:[^"\\\\]|\\\\.)*"/
string-literal = single-string | double-string

# Template literals
template-chars = /(?:[^\`$\\\\]|\\\\.|\\$(?!\\{))+/
template-span = "\${" + ws + expr + ws + "}"
template-literal = "\`" + template-chars? + (template-span + template-chars?)* + "\`"

# Regular expression literals
regex-literal = /\\/(?![*\\/])(?:[^\\/\\\\\\[\\n]|\\\\.|\\[(?:[^\\]\\\\]|\\\\.)*\\])+\\/[dgimsuy]*/

# Keyword literals
true-literal = /true(?![a-zA-Z0-9_$])/
false-literal = /false(?![a-zA-Z0-9_$])/
null-literal = /null(?![a-zA-Z0-9_$])/
undefined-literal = /undefined(?![a-zA-Z0-9_$])/
this-literal = /this(?![a-zA-Z0-9_$])/
super-literal = /super(?![a-zA-Z0-9_$])/

# ---------------------------------------------------
# SECTION 4: Property Names
# ---------------------------------------------------
computed-property-name = "[" + ws + expr + ws + "]"
property-name = identifier-name | string-literal | number-literal | computed-property-name

# ---------------------------------------------------
# SECTION 5: Type Parameters & Annotations
# ---------------------------------------------------
type-variance = ("in" | "out") + _
type-constraint = "extends" + _ + type-expr
type-default = "=" + ws + type-expr
type-param = ("const" + _)? + type-variance? + identifier + (ws + type-constraint)? + (ws + type-default)?
type-params = "<" + ws + (type-param, ws + "," + ws)+ + ws + ">"
type-args = (type-expr, ws + "," + ws)+
type-annotation = ":" + ws + type-expr

# ---------------------------------------------------
# SECTION 6: Parameters & Destructuring
# ---------------------------------------------------

# Binding patterns (destructuring)
array-binding-element = ("..." + ws)? + (identifier | binding-pattern) + (ws + type-annotation)? + (ws + "=" + ws + expr)?
comma-sep = ws + "," + ws
trailing-comma = ws + ","
array-pattern = "[" + ws + (array-binding-element, comma-sep)* + trailing-comma? + ws + "]"

object-binding-prop = ("..." + ws + identifier) | (property-name + ws + ":" + ws + (identifier | binding-pattern) + (ws + type-annotation)? + (ws + "=" + ws + expr)?) | (identifier + (ws + type-annotation)? + (ws + "=" + ws + expr)?)
object-pattern = "{" + ws + (object-binding-prop, comma-sep)* + trailing-comma? + ws + "}"

binding-pattern = array-pattern | object-pattern

# Function parameters
rest-param = "..." + ws + (identifier | binding-pattern) + (ws + type-annotation)?
param = (identifier | binding-pattern) + ws + "?"? + (ws + type-annotation)? + (ws + "=" + ws + expr)?
param-list = (param | rest-param, comma-sep)+ + trailing-comma?

# Constructor parameters (with access modifiers)
access-modifier = /(?:public|private|protected)(?![a-zA-Z0-9_$])/
constructor-param = (access-modifier + _)? + ("readonly" + _)? + (identifier | binding-pattern) + ws + "?"? + (ws + type-annotation)? + (ws + "=" + ws + expr)?
constructor-param-list = (constructor-param | rest-param, comma-sep)+ + trailing-comma?

# ---------------------------------------------------
# SECTION 7: Type Expressions
# ---------------------------------------------------

# Primitive types
any-type = /any(?![a-zA-Z0-9_$])/
unknown-type = /unknown(?![a-zA-Z0-9_$])/
never-type = /never(?![a-zA-Z0-9_$])/
void-type = /void(?![a-zA-Z0-9_$])/
string-type = /string(?![a-zA-Z0-9_$])/
number-type = /number(?![a-zA-Z0-9_$])/
boolean-type = /boolean(?![a-zA-Z0-9_$])/
symbol-type = /symbol(?![a-zA-Z0-9_$])/
bigint-type = /bigint(?![a-zA-Z0-9_$])/
object-type-keyword = /object(?![a-zA-Z0-9_$])/
primitive-type = any-type | unknown-type | never-type | void-type | string-type | number-type | boolean-type | symbol-type | bigint-type | object-type-keyword | undefined-literal | null-literal

# Type reference: SomeType or Qualified.Name with optional generics
qualified-type-name = (identifier-name, ".")+
type-reference = qualified-type-name + (ws + "<" + ws + type-args + ws + ">")?

# Literal types
literal-type = string-literal | number-literal | true-literal | false-literal

# Typeof type (uses value-level qualified name)
qualified-name = (identifier-name, ".")+
typeof-type = "typeof" + _ + qualified-name

# Infer type
infer-type = "infer" + _ + identifier + (_ + "extends" + _ + type-expr)?

# This type
this-type = /this(?![a-zA-Z0-9_$])/

# Parenthesized type
paren-type = "(" + ws + type-expr + ws + ")"

# Tuple type
tuple-label = identifier + ws + "?"? + ws + ":" + ws
tuple-element = ("..." + ws)? + tuple-label? + type-expr + (ws + "?")?
tuple-type = "[" + ws + (tuple-element, comma-sep)* + trailing-comma? + ws + "]"

# Object type literal
readonly-mod = "readonly" + _
type-property-sig = readonly-mod? + property-name + ws + "?"? + ws + ":" + ws + type-expr
type-method-sig = property-name + ws + "?"? + ws + type-params? + ws + "(" + ws + param-list? + ws + ")" + ws + ":" + ws + type-expr
type-index-sig = readonly-mod? + "[" + ws + identifier + ws + ":" + ws + type-expr + ws + "]" + ws + ":" + ws + type-expr
type-call-sig = type-params? + ws + "(" + ws + param-list? + ws + ")" + ws + ":" + ws + type-expr
type-construct-sig = "new" + ws + type-params? + ws + "(" + ws + param-list? + ws + ")" + ws + ":" + ws + type-expr
type-member = type-construct-sig | type-call-sig | type-index-sig | type-method-sig | type-property-sig
type-member-sep = ws + (";" | ",") + ws
type-member-list = (type-member, type-member-sep)* + (ws + (";" | ","))?
object-type-literal = "{" + ws + type-member-list? + ws + "}"

# Mapped type: { [K in keyof T as NewK]+?: V }
mapped-readonly-mod = ("+" | "-")? + "readonly" + _
mapped-optional-mod = ("+" | "-")? + "?"
mapped-type = "{" + ws + mapped-readonly-mod? + "[" + ws + identifier + _ + "in" + _ + type-expr + (_ + "as" + _ + type-expr)? + ws + "]" + ws + mapped-optional-mod? + ws + ":" + ws + type-expr + ws + semi? + ws + "}"

# Template literal type
template-type-chars = /(?:[^\`$\\\\]|\\\\.|\\$(?!\\{))+/
template-type-span = "\${" + ws + type-expr + ws + "}"
template-literal-type = "\`" + template-type-chars? + (template-type-span + template-type-chars?)* + "\`"

# Function type: (params) => ReturnType
# Uses function-return alias to avoid being classified as prefix
function-return = type-expr
function-type = type-params? + ws + "(" + ws + param-list? + ws + ")" + ws + "=>" + ws + function-return
constructor-type = "new" + ws + type-params? + ws + "(" + ws + param-list? + ws + ")" + ws + "=>" + ws + function-return

# --- Type Expression (auto-converts to Expression pattern) ---
# Precedence order: first listed = highest binding power

# Postfix types
array-type-postfix = type-expr + "[" + ws + "]"
type-expr-inner = type-expr
indexed-access-postfix = type-expr + "[" + ws + type-expr-inner + ws + "]"

# Prefix types
keyof-type-prefix = "keyof" + _ + type-expr
readonly-type-prefix = "readonly" + _ + type-expr
unique-type-prefix = "unique" + _ + type-expr

# Infix types
intersection-type = type-expr + ws + "&" + ws + type-expr
union-type = type-expr + ws + "|" + ws + type-expr

# Conditional type (right-associative, lowest precedence infix)
conditional-type = type-expr + _ + "extends" + _ + type-expr + ws + "?" + ws + type-expr + ws + ":" + ws + type-expr

# The type expression pattern
type-expr = array-type-postfix | indexed-access-postfix | keyof-type-prefix | readonly-type-prefix | unique-type-prefix | intersection-type | union-type | conditional-type right | function-type | constructor-type | mapped-type | object-type-literal | tuple-type | template-literal-type | paren-type | literal-type | primitive-type | typeof-type | infer-type | this-type | type-reference

# ---------------------------------------------------
# SECTION 8: Value Expressions
# ---------------------------------------------------

# Argument list for function calls
arg = ("..." + ws)? + expr
arg-list = (arg, comma-sep)+ + trailing-comma?

# Arrow function
arrow-params = identifier | "(" + ws + param-list? + ws + ")"
arrow-body = block | expr
arrow-function = ("async" + _)? + type-params? + ws + arrow-params + (ws + type-annotation)? + ws + "=>" + ws + arrow-body

# Function expression
function-expr = ("async" + _)? + "function" + ws + ("*" + ws)? + identifier? + ws + type-params? + ws + "(" + ws + param-list? + ws + ")" + (ws + type-annotation)? + ws + block

# Class expression (anonymous allowed)
class-expr = ("abstract" + _)? + "class" + (_ + identifier)? + (ws + type-params)? + (ws + extends-clause)? + (ws + implements-clause)? + ws + class-body

# New expression
new-expr = "new" + _ + expr + ws + "(" + ws + arg-list? + ws + ")"
new-no-args = "new" + _ + expr

# Dynamic import
dynamic-import = "import" + ws + "(" + ws + expr + ws + ")"

# Parenthesized expression
paren-expr = "(" + ws + expr + ws + ")"

# Array literal
array-element = ("..." + ws)? + expr
array-literal = "[" + ws + (array-element, comma-sep)* + trailing-comma? + ws + "]"

# Object literal
shorthand-property = identifier
spread-property = "..." + ws + expr
property-assignment = property-name + ws + ":" + ws + expr
method-definition = ("async" + _)? + ("*" + ws)? + property-name + ws + type-params? + ws + "(" + ws + param-list? + ws + ")" + (ws + type-annotation)? + ws + block
getter-definition = "get" + _ + property-name + ws + "(" + ws + ")" + (ws + type-annotation)? + ws + block
setter-definition = "set" + _ + property-name + ws + "(" + ws + param + ws + ")" + ws + block
object-property = getter-definition | setter-definition | method-definition | spread-property | property-assignment | shorthand-property
object-literal = "{" + ws + (object-property, comma-sep)* + trailing-comma? + ws + "}"

# --- Expression Pattern (auto-converts to Expression) ---
# Precedence order: first listed = highest binding power

# Postfix operators
member-access = expr + ws + "." + ws + identifier-name
optional-chain = expr + "?." + identifier-name
expr-inner = expr
computed-access = expr + "[" + ws + expr-inner + ws + "]"
optional-computed = expr + "?.[" + ws + expr-inner + ws + "]"
generic-call = expr + ws + "<" + ws + type-args + ws + ">" + ws + "(" + ws + arg-list? + ws + ")"
call-expr = expr + ws + "(" + ws + arg-list? + ws + ")"
optional-call = expr + "?.(" + ws + arg-list? + ws + ")"
tagged-template = expr + ws + template-literal
non-null-assert = expr + /!(?!=)/
postfix-increment = expr + "++"
postfix-decrement = expr + "--"
as-const-expr = expr + _ + "as" + _ + "const"
as-expr = expr + _ + "as" + _ + type-expr
satisfies-expr = expr + _ + "satisfies" + _ + type-expr

# Prefix operators
prefix-increment = "++" + ws + expr
prefix-decrement = "--" + ws + expr
unary-plus = "+" + ws + expr
unary-minus = "-" + ws + expr
logical-not = /!(?!=)/ + ws + expr
bitwise-not = "~" + ws + expr
typeof-expr = "typeof" + _ + expr
void-expr = "void" + _ + expr
delete-expr = "delete" + _ + expr
await-expr = "await" + _ + expr

# Infix operators (highest to lowest precedence)
# Regex negative lookahead prevents matching prefixes of compound operators
exp-expr = expr + ws + /\\*\\*(?!=)/ + ws + expr
mul-div-mod = expr + ws + /\\*(?![*=])|\\/(?!=)|%(?!=)/ + ws + expr
add-sub = expr + ws + /\\+(?![+=])|-(?![-=])/ + ws + expr
shift-expr = expr + ws + />>>(?!=)|>>(?![>=])|<<(?!=)/ + ws + expr
relational-expr = expr + _ + (/instanceof(?![a-zA-Z0-9_$])/ | /in(?![a-zA-Z0-9_$])/ | "<=" | ">=" | /<(?![<=])/ | />(?![>=])/) + _ + expr
equality-expr = expr + ws + /===|!==|==(?!=)|!=(?!=)/ + ws + expr
bitwise-and = expr + ws + /&(?![&=])/ + ws + expr
bitwise-xor = expr + ws + /\\^(?!=)/ + ws + expr
bitwise-or = expr + ws + /\\|(?![|=])/ + ws + expr
logical-and = expr + ws + /&&(?!=)/ + ws + expr
logical-or = expr + ws + /\\|\\|(?!=)/ + ws + expr
nullish-coalesce = expr + ws + /\\?\\?(?!=)/ + ws + expr
ternary-expr = expr + ws + /\\?(?!\\?|\\.)/ + ws + expr + ws + ":" + ws + expr
assignment-expr = expr + ws + (">>>=" | ">>=" | "<<=" | "**=" | "&&=" | "||=" | "??=" | "+=" | "-=" | "*=" | "/=" | "%=" | "&=" | "|=" | "^=" | "=") + ws + expr

# The value expression pattern
expr = member-access | optional-chain | computed-access | optional-computed | generic-call | call-expr | optional-call | tagged-template | non-null-assert | postfix-increment | postfix-decrement | as-const-expr | as-expr | satisfies-expr | prefix-increment | prefix-decrement | unary-plus | unary-minus | logical-not | bitwise-not | typeof-expr | void-expr | delete-expr | await-expr | exp-expr right | mul-div-mod | add-sub | shift-expr | relational-expr | equality-expr | bitwise-and | bitwise-xor | bitwise-or | logical-and | logical-or | nullish-coalesce | ternary-expr right | assignment-expr right | arrow-function | function-expr | class-expr | new-expr | new-no-args | dynamic-import | paren-expr | array-literal | object-literal | template-literal | regex-literal | number-literal | string-literal | true-literal | false-literal | null-literal | undefined-literal | this-literal | super-literal | identifier

# ---------------------------------------------------
# SECTION 9: Statements
# ---------------------------------------------------

# Block
block = "{" + ws + statement-list? + ws + "}"

# Variable declaration
var-keyword = /(?:let|const|var|using)(?![a-zA-Z0-9_$])/
definite-assign = ws + "!"
variable-declarator = (identifier | binding-pattern) + definite-assign? + (ws + type-annotation)? + (ws + "=" + ws + expr)?
variable-declaration = var-keyword + _ + (variable-declarator, ws + "," + ws)+ + semi?

# Expression statement
expression-statement = expr + semi?

# If statement
if-statement = "if" + ws + "(" + ws + expr + ws + ")" + ws + statement + (ws + "else" + ws + statement)?

# For statement
for-var-decl = var-keyword + _ + (variable-declarator, comma-sep)+
for-init = for-var-decl | expr
for-statement = "for" + ws + "(" + ws + for-init? + ws + ";" + ws + expr? + ws + ";" + ws + expr? + ws + ")" + ws + statement

# For-in statement
for-binding = (var-keyword + _)? + (identifier | binding-pattern)
for-in-statement = "for" + ws + "(" + ws + for-binding + _ + "in" + _ + expr + ws + ")" + ws + statement

# For-of statement
for-of-statement = "for" + ws + ("await" + _)? + "(" + ws + for-binding + _ + "of" + _ + expr + ws + ")" + ws + statement

# While statement
while-statement = "while" + ws + "(" + ws + expr + ws + ")" + ws + statement

# Do-while statement
do-while-statement = "do" + ws + statement + ws + "while" + ws + "(" + ws + expr + ws + ")" + semi?

# Switch statement
case-clause = "case" + _ + expr + ws + ":" + (ws + statement-list)?
default-clause = "default" + ws + ":" + (ws + statement-list)?
switch-clause = case-clause | default-clause
switch-statement = "switch" + ws + "(" + ws + expr + ws + ")" + ws + "{" + ws + (switch-clause, ws)* + ws + "}"

# Try-catch-finally
catch-binding = "(" + ws + (identifier | binding-pattern) + (ws + type-annotation)? + ws + ")"
catch-clause = "catch" + ws + catch-binding? + ws + block
finally-clause = "finally" + ws + block
try-statement = "try" + ws + block + (ws + catch-clause)? + (ws + finally-clause)?

# Return statement
return-statement = "return" + (_ + expr)? + semi?

# Throw statement
throw-statement = "throw" + _ + expr + semi?

# Break and continue
break-statement = "break" + (_ + identifier)? + semi?
continue-statement = "continue" + (_ + identifier)? + semi?

# Labeled statement
labeled-statement = identifier + ws + ":" + ws + statement

# Debugger statement
debugger-statement = "debugger" + semi?

# Empty statement
empty-statement = ";"

# ---------------------------------------------------
# SECTION 10: Declarations
# ---------------------------------------------------

# Decorators
decorator = "@" + ws + expr
decorator-list = (decorator, ws)+

# Function declaration
function-declaration = ("async" + _)? + "function" + ws + ("*" + ws)? + identifier + ws + type-params? + ws + "(" + ws + param-list? + ws + ")" + (ws + type-annotation)? + ws + block

# Class declaration
class-member-modifier = access-modifier | /(?:static|abstract|override|readonly|accessor|declare)(?![a-zA-Z0-9_$])/
class-modifiers = (class-member-modifier, _)*

class-property = class-modifiers + ws + property-name + ws + "?"? + ws + "!"? + (ws + type-annotation)? + (ws + "=" + ws + expr)? + semi?
class-method = class-modifiers + ws + ("async" + _)? + ("*" + ws)? + property-name + ws + type-params? + ws + "(" + ws + param-list? + ws + ")" + (ws + type-annotation)? + (ws + block | semi)?
class-constructor = class-modifiers + ws + "constructor" + ws + "(" + ws + constructor-param-list? + ws + ")" + ws + block
class-getter = class-modifiers + ws + "get" + _ + property-name + ws + "(" + ws + ")" + (ws + type-annotation)? + ws + block
class-setter = class-modifiers + ws + "set" + _ + property-name + ws + "(" + ws + param + ws + ")" + ws + block
class-index-sig = class-modifiers + ws + "[" + ws + identifier + ws + ":" + ws + type-expr + ws + "]" + ws + ":" + ws + type-expr + semi?
class-static-block = "static" + ws + block

class-member = decorator-list? + ws + (class-static-block | class-constructor | class-getter | class-setter | class-method | class-index-sig | class-property)
class-body = "{" + ws + (class-member, ws)* + ws + "}"

extends-clause = "extends" + _ + type-expr
implements-clause = "implements" + _ + (type-expr, ws + "," + ws)+
class-declaration = decorator-list? + ws + ("abstract" + _)? + "class" + _ + identifier + (ws + type-params)? + (ws + extends-clause)? + (ws + implements-clause)? + ws + class-body

# Interface declaration
interface-extends = "extends" + _ + (type-expr, ws + "," + ws)+
interface-body = "{" + ws + type-member-list? + ws + "}"
interface-declaration = "interface" + _ + identifier + (ws + type-params)? + (ws + interface-extends)? + ws + interface-body

# Type alias
type-alias = "type" + _ + identifier + (ws + type-params)? + ws + "=" + ws + type-expr + semi?

# Enum declaration
enum-member-init = "=" + ws + expr
enum-member = property-name + (ws + enum-member-init)?
enum-body = "{" + ws + (enum-member, comma-sep)* + trailing-comma? + ws + "}"
enum-declaration = ("const" + _)? + "enum" + _ + identifier + ws + enum-body

# Namespace / module declaration
namespace-body = "{" + ws + statement-list? + ws + "}"
namespace-declaration = ("namespace" | "module") + _ + (identifier | string-literal) + ws + namespace-body

# Ambient declarations
declare-declaration = "declare" + _ + (variable-declaration | function-declaration | class-declaration | interface-declaration | type-alias | enum-declaration | namespace-declaration)

# ---------------------------------------------------
# SECTION 11: Module System (Import / Export)
# ---------------------------------------------------

# Import
import-specifier = (identifier-name + _ + "as" + _)? + identifier
named-imports = "{" + ws + (import-specifier, comma-sep)* + trailing-comma? + ws + "}"
namespace-import = "*" + _ + "as" + _ + identifier
default-and-named = identifier + ws + "," + ws + (named-imports | namespace-import)
import-clause = default-and-named | namespace-import | named-imports | identifier
from-clause = "from" + _ + string-literal
import-attr-entry = identifier-name + ws + ":" + ws + string-literal
import-attributes = ("with" | "assert") + ws + "{" + ws + (import-attr-entry, comma-sep)+ + trailing-comma? + ws + "}"
import-declaration = "import" + _ + ("type" + _)? + import-clause + _ + from-clause + (ws + import-attributes)? + semi?
import-side-effect = "import" + _ + string-literal + semi?

# Export
export-specifier = (identifier-name + _ + "as" + _)? + identifier-name
named-exports = "{" + ws + (export-specifier, comma-sep)* + trailing-comma? + ws + "}"
export-named = "export" + _ + ("type" + _)? + named-exports + (_ + from-clause)? + semi?
export-default-expr = "export" + _ + "default" + _ + expr + semi?
export-default-decl = "export" + _ + "default" + _ + (function-declaration | class-declaration)
export-declaration = "export" + _ + (variable-declaration | function-declaration | class-declaration | interface-declaration | type-alias | enum-declaration | namespace-declaration)
export-all = "export" + _ + ("type" + _)? + "*" + (_ + "as" + _ + identifier-name)? + _ + from-clause + semi?
export-equals = "export" + ws + "=" + ws + expr + semi?

# ---------------------------------------------------
# SECTION 12: Statements & Program
# ---------------------------------------------------

# Statement: union of all statement types
# Order matters: more specific patterns first, expression-statement last
statement = import-declaration | import-side-effect | export-all | export-named | export-default-decl | export-default-expr | export-declaration | export-equals | declare-declaration | decorator-list + ws + (class-declaration | function-declaration) | function-declaration | class-declaration | interface-declaration | type-alias | enum-declaration | namespace-declaration | variable-declaration | if-statement | for-of-statement | for-in-statement | for-statement | while-statement | do-while-statement | switch-statement | try-statement | return-statement | throw-statement | break-statement | continue-statement | labeled-statement | block | debugger-statement | empty-statement | expression-statement

# Statement list
statement-list = (statement, ws)+

# Program (top-level)
program = ws + statement-list? + ws

`;

/**
 * Parse the TypeScript grammar and return all pattern definitions.
 */
export function createTypeScriptPatterns(): Record<string, Pattern> {
  return Grammar.parseString(typescriptGrammar);
}

/**
 * Get a specific pattern by name from the TypeScript grammar.
 */
export function getPattern(name: string): Pattern {
  const patterns = createTypeScriptPatterns();
  const pattern = patterns[name];
  if (!pattern) {
    throw new Error(`Pattern "${name}" not found in TypeScript grammar`);
  }
  return pattern;
}

/**
 * Parse TypeScript source code and return the AST.
 */
export function parseTypeScript(source: string) {
  const patterns = createTypeScriptPatterns();
  const program = patterns["program"];
  return program.exec(source);
}
