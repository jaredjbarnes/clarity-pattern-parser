import { Node } from "../ast/Node";
import { And } from "./And";
import { Cursor } from "./Cursor";
import { Literal } from "./Literal"

describe("Literal", () => {
    test("Empty Value", () => {
        expect(() => {
            new Literal("empty", "")
        }).toThrowError()
    });

    test("Successful Parse", () => {
        const literal = new Literal("greeting", "Hello World!");

        const cursor = new Cursor("Hello World!");
        const result = literal.parse(cursor);
        const expected = new Node("literal", "greeting", 0, 11, [], "Hello World!");

        expect(result).toEqual(expected);
        expect(cursor.index).toBe(11);
        expect(cursor.error).toBeNull();
        expect(cursor.leafMatch.node).toEqual(expected)
        expect(cursor.leafMatch.pattern).toBe(literal)
        expect(cursor.rootMatch.node).toEqual(expected)
        expect(cursor.rootMatch.pattern).toBe(literal)
    });

    test("Failed Parse", () => {
        const literal = new Literal("greeting", "Hello World!");

        const cursor = new Cursor("Hello Saturn!");
        const result = literal.parse(cursor);

        expect(result).toEqual(null);
        expect(cursor.index).toBe(6);
        expect(cursor.error?.index).toBe(6);
        expect(cursor.error?.pattern).toBe(literal)
    });

    test("Failed Parse Because End Of Text", () => {
        const literal = new Literal("greeting", "Hello World!");

        const cursor = new Cursor("Hello World");
        const result = literal.parse(cursor);

        expect(result).toEqual(null);
        expect(cursor.index).toBe(10);
        expect(cursor.error?.index).toBe(10);
        expect(cursor.error?.pattern).toBe(literal)
    });

    test("Failed Parse (Optional)", () => {
        const literal = new Literal("greeting", "Hello World!", true);

        const cursor = new Cursor("Hello Saturn!");
        const result = literal.parse(cursor);

        expect(result).toEqual(null);
        expect(cursor.index).toBe(0);
        expect(cursor.error).toBeNull();
    });

    test("Clone", () => {
        const literal = new Literal("greeting", "Hello World!");
        const clone = literal.clone();

        expect(clone.name).toBe("greeting");
        expect(clone).not.toBe(literal);
    });

    test("Get Tokens", () => {
        const a = new Literal("a", "A");

        const tokens = a.getTokens();
        const expectedTokens = ["A"];

        expect(tokens).toEqual(expectedTokens);
    });

    test("Get Tokens After", () => {
        const literal = new Literal("a", "A");
        const tokens = literal.getTokensAfter(new Literal("bogus", "bogus"));
        const expected: string[] = [];

        expect(tokens).toEqual(expected)
    });

    test("Properties", () => {
        const literal = new Literal("a", "A");

        expect(literal.type).toBe("literal");
        expect(literal.name).toBe("a");
        expect(literal.parent).toBeNull();
        expect(literal.children).toEqual([]);
    });

    test("Exec", () => {
        const literal = new Literal("a", "A");
        const { ast: result } = literal.exec("B");
        expect(result).toBeNull()
    });

    test("Test With No Match", () => {
        const literal = new Literal("a", "A");
        const isMatch = literal.test("B");

        expect(isMatch).toBeFalsy();
    });

    test("Test With Match", () => {
        const literal = new Literal("a", "A");
        const isMatch = literal.test("A");

        expect(isMatch).toBeTruthy();
    });

    test("Get Next Tokens", () => {
        const sequence = new And("sequence", [new Literal("a", "A")]);
        const parent = new And("parent", [sequence, new Literal("b", "B")]);

        const a = parent.find(p => p.name === "a");
        const tokens = a?.getNextTokens() || [];

        expect(tokens[0]).toBe("B");
    });

    test("Get Next Tokens With Null Parent", () => {
        const a = new Literal("a", "A");
        const tokens = a.getNextTokens();

        expect(tokens.length).toBe(0);
    });

    test("Get Patterns", () => {
        const a = new Literal("a", "A");

        const tokens = a.getPatterns();
        const expectedTokens = [a];

        expect(tokens).toEqual(expectedTokens);
    });

    test("Get Next Patterns", () => {
        const sequence = new And("sequence", [new Literal("a", "A")]);
        const parent = new And("parent", [sequence, new Literal("b", "B")]);

        const a = parent.find(p => p.name === "a");
        const nextPatterns = a?.getNextPatterns() || [];
        const b = parent.find(p => p.name === "b")

        expect(nextPatterns[0]).toBe(b);
    });

    test("Get Next Patterns With Null Parent", () => {
        const a = new Literal("a", "A");
        const nextPatterns = a.getNextPatterns();

        expect(nextPatterns.length).toBe(0);
    });

    test("Get Patterns After", () => {
        const a = new Literal("a", "A");
        const patterns = a.getPatternsAfter();

        expect(patterns.length).toBe(0);
    });

    test("Find Pattern", () => {
        const a = new Literal("a", "A");
        const pattern = a.find(p => p.name === "nada");

        expect(pattern).toBeNull();
    });
});