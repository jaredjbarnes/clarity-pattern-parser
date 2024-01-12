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
        const parent = new And("parent", [
            new Literal("a", "A"),
            new Literal("b", "B")
        ]);

        const a = parent.children[0] as Literal;
        const b = parent.children[1];

        let tokens = a.getTokens();
        let expectedTokens = ["A"];

        expect(tokens).toEqual(expectedTokens);

        a.enableContextualTokenAggregation();

        tokens = a.getTokens();
        expectedTokens = ["AB"];

        expect(tokens).toEqual(expectedTokens);

        a.disableContextualTokenAggregation();

        tokens = a.getTokens();
        expectedTokens = ["A"];

        expect(tokens).toEqual(expectedTokens);
    });

    test("Get Next Tokens", () => {
        const literal = new Literal("a", "A");
        const tokens = literal.getNextTokens(new Literal("bogus", "bogus"));
        const expected: string[] = [];

        expect(tokens).toEqual(expected)
    });

    test("Properties", ()=>{
        const literal = new Literal("a", "A");

        expect(literal.type).toBe("literal");
        expect(literal.name).toBe("a");
        expect(literal.parent).toBeNull();
        expect(literal.children).toEqual([]);
    });
});