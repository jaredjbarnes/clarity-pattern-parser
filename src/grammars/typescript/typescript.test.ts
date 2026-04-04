import { Grammar } from "../../grammar/Grammar";
import { Pattern } from "../../patterns/Pattern";
import { typescriptGrammar } from "./typescript";

let patterns: Record<string, Pattern>;

beforeAll(() => {
  patterns = Grammar.parseString(typescriptGrammar);
});

function parse(patternName: string, input: string) {
  const pattern = patterns[patternName];
  if (!pattern) {
    throw new Error(`Pattern "${patternName}" not found`);
  }
  return pattern.exec(input);
}

function expectParse(patternName: string, input: string) {
  const result = parse(patternName, input);
  expect(result.ast).not.toBeNull();
  expect(result.ast?.value).toBe(input);
}

function getAst(patternName: string, input: string) {
  const result = parse(patternName, input);
  expect(result.ast).not.toBeNull();
  expect(result.ast?.value).toBe(input);
  return result.ast!;
}

function expectFail(patternName: string, input: string) {
  const result = parse(patternName, input);
  expect(result.ast).toBeNull();
}

// =====================================================
// SECTION 1: Literals
// =====================================================

describe("Number Literals", () => {
  test("integer", () => expectParse("number-literal", "42"));
  test("float", () => expectParse("number-literal", "3.14"));
  test("leading dot", () => expectParse("number-literal", ".5"));
  test("scientific", () => expectParse("number-literal", "1.2e10"));
  test("scientific negative", () => expectParse("number-literal", "1e-3"));
  test("hex", () => expectParse("number-literal", "0xFF"));
  test("octal", () => expectParse("number-literal", "0o77"));
  test("binary", () => expectParse("number-literal", "0b1010"));
  test("bigint", () => expectParse("number-literal", "100n"));
  test("separator", () => expectParse("number-literal", "1_000_000"));
});

describe("String Literals", () => {
  test("double-quoted", () => expectParse("string-literal", '"hello"'));
  test("single-quoted", () => expectParse("string-literal", "'world'"));
  test("escape sequences", () => expectParse("string-literal", '"line\\n"'));
  test("empty", () => expectParse("string-literal", '""'));
});

describe("Template Literals", () => {
  test("simple", () => expectParse("template-literal", "`hello`"));
  test("with interpolation", () => expectParse("template-literal", "`hello ${name}`"));
  test("multiple spans", () => expectParse("template-literal", "`${a} and ${b}`"));
  test("nested expression", () => expectParse("template-literal", "`${a + b}`"));
});

describe("Regex Literals", () => {
  test("simple", () => expectParse("regex-literal", "/abc/"));
  test("with flags", () => expectParse("regex-literal", "/abc/gi"));
  test("with character class", () => expectParse("regex-literal", "/[a-z]+/"));
  test("with escape", () => expectParse("regex-literal", "/\\d+/"));
});

describe("Keyword Literals", () => {
  test("true", () => expectParse("true-literal", "true"));
  test("false", () => expectParse("false-literal", "false"));
  test("null", () => expectParse("null-literal", "null"));
  test("undefined", () => expectParse("undefined-literal", "undefined"));
  test("this", () => expectParse("this-literal", "this"));
});

// =====================================================
// SECTION 2: Identifiers
// =====================================================

describe("Identifiers", () => {
  test("simple", () => expectParse("identifier", "foo"));
  test("with underscore", () => expectParse("identifier", "_private"));
  test("with dollar", () => expectParse("identifier", "$element"));
  test("camelCase", () => expectParse("identifier", "myVariable"));
  test("rejects reserved words", () => expectFail("identifier", "class"));
  test("rejects if", () => expectFail("identifier", "if"));
  test("allows contextual keywords", () => expectParse("identifier", "type"));
  test("allows 'as'", () => expectParse("identifier", "as"));
  test("allows 'from'", () => expectParse("identifier", "from"));
});

// =====================================================
// SECTION 3: Type Expressions
// =====================================================

describe("Primitive Types", () => {
  test("string", () => expectParse("type-expr", "string"));
  test("number", () => expectParse("type-expr", "number"));
  test("boolean", () => expectParse("type-expr", "boolean"));
  test("void", () => expectParse("type-expr", "void"));
  test("never", () => expectParse("type-expr", "never"));
  test("any", () => expectParse("type-expr", "any"));
  test("unknown", () => expectParse("type-expr", "unknown"));
  test("null", () => expectParse("type-expr", "null"));
  test("undefined", () => expectParse("type-expr", "undefined"));
  test("symbol", () => expectParse("type-expr", "symbol"));
  test("bigint", () => expectParse("type-expr", "bigint"));
  test("object", () => expectParse("type-expr", "object"));
});

describe("Type References", () => {
  test("simple", () => expectParse("type-expr", "Foo"));
  test("qualified", () => expectParse("type-expr", "A.B.C"));
  test("generic", () => expectParse("type-expr", "Array<string>"));
  test("multiple generics", () => expectParse("type-expr", "Map<string, number>"));
  test("nested generics", () => expectParse("type-expr", "Promise<Array<string>>"));
});

describe("Literal Types", () => {
  test("string literal type", () => expectParse("type-expr", '"hello"'));
  test("number literal type", () => expectParse("type-expr", "42"));
  test("true type", () => expectParse("type-expr", "true"));
  test("false type", () => expectParse("type-expr", "false"));
});

describe("Union & Intersection Types", () => {
  test("union", () => expectParse("type-expr", "string | number"));
  test("triple union", () => expectParse("type-expr", "string | number | boolean"));
  test("intersection", () => expectParse("type-expr", "A & B"));
  test("intersection binds tighter", () => {
    const ast = getAst("type-expr", "A & B | C");
    // A & B should bind tighter than |
    expect(ast.name).toBe("union-type");
  });
});

describe("Array Types", () => {
  test("simple array", () => expectParse("type-expr", "string[]"));
  test("nested array", () => expectParse("type-expr", "number[][]"));
});

describe("Tuple Types", () => {
  test("simple tuple", () => expectParse("type-expr", "[string, number]"));
  test("optional element", () => expectParse("type-expr", "[string, number?]"));
  test("rest element", () => expectParse("type-expr", "[string, ...number[]]"));
  test("labeled", () => expectParse("type-expr", "[x: string, y: number]"));
  test("empty tuple", () => expectParse("type-expr", "[]"));
});

describe("Object Type Literals", () => {
  test("simple", () => expectParse("type-expr", "{ x: number; y: string }"));
  test("optional property", () => expectParse("type-expr", "{ x?: number }"));
  test("readonly property", () => expectParse("type-expr", "{ readonly x: number }"));
  test("index signature", () => expectParse("type-expr", "{ [key: string]: number }"));
  test("empty", () => expectParse("type-expr", "{}"));
});

describe("Function Types", () => {
  test("simple", () => expectParse("type-expr", "() => void"));
  test("with params", () => expectParse("type-expr", "(x: string) => number"));
  test("generic function type", () => expectParse("type-expr", "<T>(x: T) => T"));
  test("return type is union", () => expectParse("type-expr", "() => string | undefined"));
});

describe("Conditional Types", () => {
  test("simple", () => expectParse("type-expr", "T extends string ? true : false"));
  test("with union checked type", () => expectParse("type-expr", "A | B extends C ? D : E"));
});

describe("Keyof & Typeof Types", () => {
  test("keyof", () => expectParse("type-expr", "keyof T"));
  test("typeof", () => expectParse("type-expr", "typeof x"));
  test("typeof qualified", () => expectParse("type-expr", "typeof x.y.z"));
  test("keyof typeof", () => expectParse("type-expr", "keyof typeof x"));
});

describe("Mapped Types", () => {
  test("simple mapped", () => expectParse("type-expr", "{ [K in keyof T]: T[K] }"));
  test("with optional modifier", () => expectParse("type-expr", "{ [K in keyof T]?: T[K] }"));
  test("with readonly modifier", () => expectParse("type-expr", "{ readonly [K in keyof T]: T[K] }"));
  test("with as clause", () => expectParse("type-expr", "{ [K in keyof T as string]: T[K] }"));
});

describe("Indexed Access Types", () => {
  test("simple", () => expectParse("type-expr", "T[K]"));
  test("nested", () => expectParse("type-expr", 'T["key"]'));
});

describe("Infer Types", () => {
  test("simple infer", () => expectParse("type-expr", "infer T"));
  test("constrained infer", () => expectParse("type-expr", "infer T extends string"));
});

describe("Parenthesized Types", () => {
  test("simple", () => expectParse("type-expr", "(string)"));
  test("union in parens", () => expectParse("type-expr", "(string | number)"));
  test("function in parens", () => expectParse("type-expr", "(() => void)"));
});

describe("Type Parameters", () => {
  test("simple", () => expectParse("type-params", "<T>"));
  test("multiple", () => expectParse("type-params", "<T, U>"));
  test("with constraint", () => expectParse("type-params", "<T extends string>"));
  test("with default", () => expectParse("type-params", "<T = string>"));
  test("complex", () => expectParse("type-params", "<T extends object, U = T>"));
});

// =====================================================
// SECTION 4: Value Expressions
// =====================================================

describe("Primary Expressions", () => {
  test("identifier", () => expectParse("expr", "foo"));
  test("number", () => expectParse("expr", "42"));
  test("string", () => expectParse("expr", '"hello"'));
  test("true", () => expectParse("expr", "true"));
  test("false", () => expectParse("expr", "false"));
  test("null", () => expectParse("expr", "null"));
  test("undefined", () => expectParse("expr", "undefined"));
  test("this", () => expectParse("expr", "this"));
  test("template literal", () => expectParse("expr", "`hello ${x}`"));
  test("regex", () => expectParse("expr", "/test/g"));
  test("parenthesized", () => expectParse("expr", "(x)"));
});

describe("Array Expressions", () => {
  test("empty", () => expectParse("expr", "[]"));
  test("simple", () => expectParse("expr", "[1, 2, 3]"));
  test("trailing comma", () => expectParse("expr", "[1, 2,]"));
  test("spread", () => expectParse("expr", "[...arr]"));
  test("mixed", () => expectParse("expr", "[1, ...arr, 3]"));
});

describe("Object Expressions", () => {
  test("empty", () => expectParse("expr", "{}"));
  test("properties", () => expectParse("expr", "{ a: 1, b: 2 }"));
  test("shorthand", () => expectParse("expr", "{ x, y }"));
  test("computed", () => expectParse("expr", "{ [key]: value }"));
  test("spread", () => expectParse("expr", "{ ...other }"));
  test("method", () => expectParse("expr", "{ foo() { } }"));
  test("getter", () => expectParse("expr", "{ get x() { return 1 } }"));
  test("setter", () => expectParse("expr", "{ set x(v) { } }"));
  test("trailing comma", () => expectParse("expr", "{ a: 1, }"));
});

describe("Member Access", () => {
  test("dot access", () => expectParse("expr", "a.b"));
  test("chained", () => expectParse("expr", "a.b.c"));
  test("optional chain", () => expectParse("expr", "a?.b"));
  test("computed", () => expectParse("expr", "a[0]"));
  test("optional computed", () => expectParse("expr", "a?.[0]"));
});

describe("Call Expressions", () => {
  test("simple call", () => expectParse("expr", "foo()"));
  test("with args", () => expectParse("expr", "foo(a, b)"));
  test("chained", () => expectParse("expr", "foo()()"));
  test("method call", () => expectParse("expr", "obj.method()"));
  test("optional call", () => expectParse("expr", "foo?.()"));
  test("generic call", () => expectParse("expr", "foo<string>(x)"));
});

describe("Arithmetic Operators", () => {
  test("addition", () => expectParse("expr", "a + b"));
  test("subtraction", () => expectParse("expr", "a - b"));
  test("multiplication", () => expectParse("expr", "a * b"));
  test("division", () => expectParse("expr", "a / b"));
  test("modulo", () => expectParse("expr", "a % b"));
  test("exponentiation", () => expectParse("expr", "a ** b"));
});

describe("Operator Precedence", () => {
  test("mul before add", () => {
    const ast = getAst("expr", "a + b * c");
    // Should parse as a + (b * c)
    expect(ast.name).toBe("add-sub");
  });
  test("parentheses override", () => {
    const ast = getAst("expr", "(a + b) * c");
    expect(ast.name).toBe("mul-div-mod");
  });
  test("complex precedence", () => expectParse("expr", "a + b * c - d / e"));
});

describe("Comparison Operators", () => {
  test("less than", () => expectParse("expr", "a < b"));
  test("greater than", () => expectParse("expr", "a > b"));
  test("less equal", () => expectParse("expr", "a <= b"));
  test("greater equal", () => expectParse("expr", "a >= b"));
  test("strict equal", () => expectParse("expr", "a === b"));
  test("strict not equal", () => expectParse("expr", "a !== b"));
  test("instanceof", () => expectParse("expr", "a instanceof B"));
  test("in", () => expectParse("expr", "a in b"));
});

describe("Logical Operators", () => {
  test("and", () => expectParse("expr", "a && b"));
  test("or", () => expectParse("expr", "a || b"));
  test("nullish coalescing", () => expectParse("expr", "a ?? b"));
  test("not", () => expectParse("expr", "!a"));
});

describe("Bitwise Operators", () => {
  test("and", () => expectParse("expr", "a & b"));
  test("or", () => expectParse("expr", "a | b"));
  test("xor", () => expectParse("expr", "a ^ b"));
  test("not", () => expectParse("expr", "~a"));
  test("left shift", () => expectParse("expr", "a << b"));
  test("right shift", () => expectParse("expr", "a >> b"));
  test("unsigned right shift", () => expectParse("expr", "a >>> b"));
});

describe("Assignment Operators", () => {
  test("assign", () => expectParse("expr", "a = b"));
  test("add assign", () => expectParse("expr", "a += b"));
  test("sub assign", () => expectParse("expr", "a -= b"));
  test("mul assign", () => expectParse("expr", "a *= b"));
  test("div assign", () => expectParse("expr", "a /= b"));
  test("mod assign", () => expectParse("expr", "a %= b"));
  test("and assign", () => expectParse("expr", "a &&= b"));
  test("or assign", () => expectParse("expr", "a ||= b"));
  test("nullish assign", () => expectParse("expr", "a ??= b"));
});

describe("Unary Operators", () => {
  test("prefix increment", () => expectParse("expr", "++a"));
  test("prefix decrement", () => expectParse("expr", "--a"));
  test("postfix increment", () => expectParse("expr", "a++"));
  test("postfix decrement", () => expectParse("expr", "a--"));
  test("unary plus", () => expectParse("expr", "+a"));
  test("unary minus", () => expectParse("expr", "-a"));
  test("typeof", () => expectParse("expr", "typeof x"));
  test("void", () => expectParse("expr", "void 0"));
  test("delete", () => expectParse("expr", "delete obj.prop"));
  test("await", () => expectParse("expr", "await promise"));
});

describe("Ternary Operator", () => {
  test("simple", () => expectParse("expr", "a ? b : c"));
  test("nested (right-associative)", () => expectParse("expr", "a ? b : c ? d : e"));
  test("with complex operands", () => expectParse("expr", "x > 0 ? x : -x"));
});

describe("Arrow Functions", () => {
  test("single param no parens", () => expectParse("expr", "x => x"));
  test("single param with parens", () => expectParse("expr", "(x) => x"));
  test("multiple params", () => expectParse("expr", "(x, y) => x + y"));
  test("no params", () => expectParse("expr", "() => 42"));
  test("block body", () => expectParse("expr", "() => { return 1 }"));
  test("typed params", () => expectParse("expr", "(x: number) => x"));
  test("return type", () => expectParse("expr", "(x: number): number => x"));
  test("async", () => expectParse("expr", "async () => await fetch()"));
  test("generic", () => expectParse("expr", "<T>(x: T) => x"));
});

describe("Function Expressions", () => {
  test("anonymous", () => expectParse("expr", "function() { }"));
  test("named", () => expectParse("expr", "function foo() { }"));
  test("async", () => expectParse("expr", "async function() { }"));
  test("generator", () => expectParse("expr", "function*() { }"));
  test("with params", () => expectParse("expr", "function(a, b) { return a + b }"));
  test("typed", () => expectParse("expr", "function(x: number): number { return x }"));
});

describe("New Expressions", () => {
  test("simple", () => expectParse("expr", "new Foo()"));
  test("with args", () => expectParse("expr", "new Foo(1, 2)"));
  test("member new", () => expectParse("expr", "new a.b.Foo()"));
});

describe("Type Assertions", () => {
  test("as expression", () => expectParse("expr", "x as string"));
  test("as const", () => expectParse("expr", "x as const"));
  test("satisfies", () => expectParse("expr", "x satisfies Type"));
  test("non-null assertion", () => expectParse("expr", "x!"));
});

describe("Dynamic Import", () => {
  test("simple", () => expectParse("expr", 'import("module")'));
});

// =====================================================
// SECTION 5: Statements
// =====================================================

describe("Variable Declarations", () => {
  test("let", () => expectParse("statement", "let x = 1"));
  test("const", () => expectParse("statement", "const y = 2"));
  test("var", () => expectParse("statement", "var z = 3"));
  test("with type", () => expectParse("statement", "let x: number = 1"));
  test("multiple", () => expectParse("statement", "let a = 1, b = 2"));
  test("destructure array", () => expectParse("statement", "const [a, b] = arr"));
  test("destructure object", () => expectParse("statement", "const { x, y } = obj"));
  test("with semicolon", () => expectParse("statement", "let x = 1;"));
  test("using", () => expectParse("statement", "using handle = getHandle()"));
});

describe("If Statements", () => {
  test("simple if", () => expectParse("statement", "if (x) foo()"));
  test("if-else", () => expectParse("statement", "if (x) foo(); else bar()"));
  test("if with block", () => expectParse("statement", "if (x) { foo() }"));
  test("if-else if-else", () =>
    expectParse("statement", "if (a) x(); else if (b) y(); else z()"));
});

describe("For Statements", () => {
  test("classic for", () => expectParse("statement", "for (let i = 0; i < 10; i++) { }"));
  test("for-in", () => expectParse("statement", "for (const key in obj) { }"));
  test("for-of", () => expectParse("statement", "for (const item of arr) { }"));
  test("for-await-of", () => expectParse("statement", "for await (const item of stream) { }"));
  test("for with empty clauses", () => expectParse("statement", "for (;;) { }"));
});

describe("While Statements", () => {
  test("while", () => expectParse("statement", "while (true) { }"));
  test("do-while", () => expectParse("statement", "do { } while (true)"));
});

describe("Switch Statements", () => {
  test("simple switch", () =>
    expectParse("statement", "switch (x) { case 1: break; default: break }"));
  test("multiple cases", () =>
    expectParse("statement", "switch (x) { case 1: a(); case 2: b(); default: c() }"));
});

describe("Try-Catch-Finally", () => {
  test("try-catch", () => expectParse("statement", "try { } catch (e) { }"));
  test("try-finally", () => expectParse("statement", "try { } finally { }"));
  test("try-catch-finally", () =>
    expectParse("statement", "try { } catch (e) { } finally { }"));
  test("catch without binding", () => expectParse("statement", "try { } catch { }"));
  test("typed catch", () =>
    expectParse("statement", "try { } catch (e: unknown) { }"));
});

describe("Jump Statements", () => {
  test("return", () => expectParse("statement", "return"));
  test("return value", () => expectParse("statement", "return x"));
  test("throw", () => expectParse("statement", "throw new Error()"));
  test("break", () => expectParse("statement", "break"));
  test("break label", () => expectParse("statement", "break outer"));
  test("continue", () => expectParse("statement", "continue"));
  test("continue label", () => expectParse("statement", "continue loop"));
});

describe("Other Statements", () => {
  test("block", () => expectParse("statement", "{ let x = 1 }"));
  test("empty", () => expectParse("statement", ";"));
  test("debugger", () => expectParse("statement", "debugger"));
  test("labeled", () => expectParse("statement", "loop: while (true) { }"));
  test("expression statement", () => expectParse("statement", "foo()"));
});

// =====================================================
// SECTION 6: Declarations
// =====================================================

describe("Function Declarations", () => {
  test("simple", () => expectParse("statement", "function foo() { }"));
  test("with params", () =>
    expectParse("statement", "function add(a: number, b: number): number { return a + b }"));
  test("async", () => expectParse("statement", "async function fetch() { }"));
  test("generator", () => expectParse("statement", "function* gen() { }"));
  test("generic", () =>
    expectParse("statement", "function identity<T>(x: T): T { return x }"));
  test("rest param", () =>
    expectParse("statement", "function foo(...args: string[]) { }"));
  test("default param", () =>
    expectParse("statement", "function foo(x = 10) { }"));
  test("optional param", () =>
    expectParse("statement", "function foo(x?: number) { }"));
});

describe("Class Declarations", () => {
  test("empty class", () => expectParse("statement", "class Foo { }"));
  test("with property", () =>
    expectParse("statement", "class Foo { x: number }"));
  test("with method", () =>
    expectParse("statement", "class Foo { bar() { } }"));
  test("with constructor", () =>
    expectParse("statement", "class Foo { constructor(x: number) { } }"));
  test("extends", () =>
    expectParse("statement", "class Bar extends Foo { }"));
  test("implements", () =>
    expectParse("statement", "class Bar implements IFoo { }"));
  test("generic class", () =>
    expectParse("statement", "class Box<T> { value: T }"));
  test("access modifiers", () =>
    expectParse("statement", "class Foo { public x: number; private y: string; protected z: boolean }"));
  test("static members", () =>
    expectParse("statement", "class Foo { static count: number; static create() { } }"));
  test("abstract class", () =>
    expectParse("statement", "abstract class Shape { abstract area(): number }"));
  test("getter/setter", () =>
    expectParse("statement", "class Foo { get x() { return 1 } set x(v) { } }"));
  test("readonly property", () =>
    expectParse("statement", "class Foo { readonly x: number }"));
  test("parameter property", () =>
    expectParse("statement", "class Foo { constructor(public readonly name: string) { } }"));
  test("static block", () =>
    expectParse("statement", "class Foo { static { init() } }"));
  test("optional property", () =>
    expectParse("statement", "class Foo { x?: number }"));
  test("definite assignment", () =>
    expectParse("statement", "class Foo { x!: number }"));
});

describe("Interface Declarations", () => {
  test("empty", () => expectParse("statement", "interface Foo { }"));
  test("with properties", () =>
    expectParse("statement", "interface Foo { x: number; y: string }"));
  test("optional properties", () =>
    expectParse("statement", "interface Foo { x?: number }"));
  test("readonly", () =>
    expectParse("statement", "interface Foo { readonly x: number }"));
  test("methods", () =>
    expectParse("statement", "interface Foo { bar(x: number): string }"));
  test("extends", () =>
    expectParse("statement", "interface Bar extends Foo { }"));
  test("extends multiple", () =>
    expectParse("statement", "interface Bar extends Foo, Baz { }"));
  test("generic", () =>
    expectParse("statement", "interface Box<T> { value: T }"));
  test("index signature", () =>
    expectParse("statement", "interface Dict { [key: string]: number }"));
  test("call signature", () =>
    expectParse("statement", "interface Callable { (x: string): number }"));
});

describe("Type Aliases", () => {
  test("simple", () => expectParse("statement", "type Name = string"));
  test("union", () => expectParse("statement", "type StringOrNumber = string | number"));
  test("generic", () => expectParse("statement", "type Box<T> = { value: T }"));
  test("conditional", () =>
    expectParse("statement", "type IsString<T> = T extends string ? true : false"));
  test("mapped", () =>
    expectParse("statement", "type Readonly<T> = { readonly [K in keyof T]: T[K] }"));
  test("template literal", () =>
    expectParse("statement", "type Greeting = `hello ${string}`"));
});

describe("Enum Declarations", () => {
  test("simple", () => expectParse("statement", "enum Color { Red, Green, Blue }"));
  test("with values", () =>
    expectParse("statement", 'enum Direction { Up = "UP", Down = "DOWN" }'));
  test("const enum", () =>
    expectParse("statement", "const enum Flags { A = 1, B = 2, C = 4 }"));
  test("computed value", () =>
    expectParse("statement", "enum Foo { A = 1 + 2 }"));
});

describe("Namespace Declarations", () => {
  test("namespace", () =>
    expectParse("statement", "namespace MyLib { }"));
  test("module", () =>
    expectParse("statement", 'module "my-module" { }'));
  test("nested namespace", () =>
    expectParse("statement", "namespace Outer { namespace Inner { } }"));
});

describe("Declare Statements", () => {
  test("declare var", () => expectParse("statement", "declare var x: number"));
  test("declare function", () =>
    expectParse("statement", "declare function foo(): void { }"));
  test("declare class", () =>
    expectParse("statement", "declare class Foo { }"));
  test("declare namespace", () =>
    expectParse("statement", "declare namespace MyLib { }"));
  test("declare enum", () =>
    expectParse("statement", "declare enum Color { Red, Green, Blue }"));
});

describe("Decorators", () => {
  test("class decorator", () =>
    expectParse("statement", "@Component class Foo { }"));
  test("decorator with args", () =>
    expectParse("statement", '@Component({ selector: "app" }) class Foo { }'));
  test("multiple decorators", () =>
    expectParse("statement", "@A @B class Foo { }"));
  test("member decorator", () =>
    expectParse("statement", "class Foo { @Log method() { } }"));
});

// =====================================================
// SECTION 7: Module System
// =====================================================

describe("Import Declarations", () => {
  test("default import", () =>
    expectParse("statement", 'import foo from "module"'));
  test("named import", () =>
    expectParse("statement", 'import { foo } from "module"'));
  test("multiple named", () =>
    expectParse("statement", 'import { foo, bar } from "module"'));
  test("aliased import", () =>
    expectParse("statement", 'import { foo as bar } from "module"'));
  test("namespace import", () =>
    expectParse("statement", 'import * as mod from "module"'));
  test("default and named", () =>
    expectParse("statement", 'import React, { useState } from "react"'));
  test("side-effect import", () =>
    expectParse("statement", 'import "polyfill"'));
  test("type import", () =>
    expectParse("statement", 'import type { Foo } from "module"'));
  test("with semicolon", () =>
    expectParse("statement", 'import { x } from "y";'));
});

describe("Export Declarations", () => {
  test("export variable", () =>
    expectParse("statement", "export const x = 1"));
  test("export function", () =>
    expectParse("statement", "export function foo() { }"));
  test("export class", () =>
    expectParse("statement", "export class Foo { }"));
  test("export interface", () =>
    expectParse("statement", "export interface Foo { }"));
  test("export type", () =>
    expectParse("statement", "export type Foo = string"));
  test("export enum", () =>
    expectParse("statement", "export enum Color { Red }"));
  test("export default expression", () =>
    expectParse("statement", "export default 42"));
  test("export default function", () =>
    expectParse("statement", "export default function foo() { }"));
  test("export default class", () =>
    expectParse("statement", "export default class Foo { }"));
  test("named exports", () =>
    expectParse("statement", "export { foo, bar }"));
  test("re-export", () =>
    expectParse("statement", 'export { foo } from "module"'));
  test("export all", () =>
    expectParse("statement", 'export * from "module"'));
  test("export all as", () =>
    expectParse("statement", 'export * as utils from "module"'));
  test("export type", () =>
    expectParse("statement", 'export type { Foo } from "module"'));
});

// =====================================================
// SECTION 8: Program (Multi-statement)
// =====================================================

describe("Program", () => {
  test("empty program", () => {
    // Empty program: pattern matches but value might be empty
    const result = parse("program", "");
    // Empty string may not produce an AST node since ws matches nothing
    // and statement-list? is optional - this is OK
    expect(result.ast === null || result.ast.value === "").toBeTruthy();
  });

  test("single statement", () => expectParse("program", "const x = 1"));

  test("multiple statements", () =>
    expectParse("program", `let x = 1
let y = 2`));

  test("realistic program", () =>
    expectParse("program", `import { Component } from "react"

interface Props {
  name: string;
  age?: number
}

class App extends Component {
  render() { return null }
}`));

  test("function with generics", () =>
    expectParse("program", `function identity<T>(arg: T): T {
  return arg
}

const result = identity<string>("hello")`));

  test("async/await", () =>
    expectParse("program", `async function fetchData() {
  const response = await fetch("url")
  return response
}`));

  test("destructuring and spread", () =>
    expectParse("program", `const { a, b, ...rest } = obj
const [first, ...remaining] = arr`));

  test("enum and type alias", () =>
    expectParse("program", `enum Status {
  Active,
  Inactive
}

type UserStatus = Status.Active | Status.Inactive`));

  test("complex type operations", () =>
    expectParse("program", `type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T`));
});

// =====================================================
// SECTION 9: Edge Cases & Complex Patterns
// =====================================================

describe("Edge Cases", () => {
  test("chained member access and calls", () =>
    expectParse("expr", "a.b().c[0].d"));

  test("nested ternary", () =>
    expectParse("expr", "a ? b ? c : d : e"));

  test("arrow in assignment", () =>
    expectParse("expr", "x = () => y"));

  test("complex expression", () =>
    expectParse("expr", "a + b * c > d && e || f"));

  test("type assertion chain", () =>
    expectParse("expr", "x as any as string"));

  test("optional chaining mixed", () =>
    expectParse("expr", "a?.b.c?.d"));

  test("tagged template", () =>
    expectParse("expr", "html`<div>${x}</div>`"));

  test("new with member access", () =>
    expectParse("expr", "new a.B()"));
});
