import { Cursor } from "./Cursor";
import { Regex } from "./Regex";
import { Node } from "../ast/Node"
import { And } from "./And";
import { Literal } from "./Literal";
import { Pattern } from "./Pattern";

describe("Regex", () => {
    test("Empty String", () => {
        expect(() => new Regex("empty", "")).toThrowError()
    });

    test("Starts With ^", () => {
        expect(() => new Regex("carrot", "^")).toThrowError()
    });

    test("Ends With $", () => {
        expect(() => new Regex("money", ".$")).toThrowError()
    });

    test("Successful Parse", () => {
        const number = new Regex("number", "\\d");
        const cursor = new Cursor("1");
        const result = number.parse(cursor);
        const expected = new Node("regex", "number", 0, 0, [], "1");

        expect(result).toEqual(expected);
        expect(cursor.hasError).toBeFalsy()
    })

    test("Failed Parse", () => {
        const number = new Regex("number", "\\d");
        const cursor = new Cursor("F");
        const result = number.parse(cursor);

        expect(result).toBeNull();
        expect(cursor.hasError).toBeTruthy()
    });


    test("Get Tokens", () => {
        const a = new Regex("a", "A");

        a.setTokens(["A"]);

        const tokens = a.getTokens();
        const expectedTokens = ["A"];

        expect(tokens).toEqual(expectedTokens);
    });

    test("Get Tokens After", () => {
        const regex = new Regex("a", "A");
        const tokens = regex.getTokensAfter(new Literal("bogus", "bogus"));
        const expected: string[] = [];

        expect(tokens).toEqual(expected)
    });

    test("Properties", () => {
        const regex = new Regex("a", "A");

        expect(regex.type).toBe("regex");
        expect(regex.name).toBe("a");
        expect(regex.parent).toBeNull();
        expect(regex.children).toEqual([]);
    });

    test("Exec", () => {
        const regex = new Regex("a", "A");
        const { ast: result } = regex.exec("B");
        expect(result).toBeNull();
    });

    test("Test With Match", () => {
        const regex = new Regex("a", "A");
        const result = regex.test("A");
        expect(result).toBeTruthy();
    });

    test("Test With No Match", () => {
        const regex = new Regex("a", "A");
        const result = regex.test("B");
        expect(result).toBeFalsy();
    });

    test("Get Next Tokens", () => {
        const parent = new And("parent", [new Regex("a", "A"), new Literal("b", "B")]);
        const aClone = parent.findPattern(p => p.name === "a") as Pattern;
        const tokens = aClone.getNextTokens();

        expect(tokens).toEqual(["B"]);
    });

    test("Get Next Tokens With Null Parent", () => {
        const a = new Regex("a", "A")
        const tokens = a.getNextTokens();

        expect(tokens).toEqual([]);
    });

    test("Get Patterns After", () => {
        const a = new Regex("a", "A")
        const patterns = a.getPatternsAfter(new Literal("bogus", "bogus"));

        expect(patterns).toEqual([]);
    });

    test("Find Pattern", () => {
        const a = new Regex("a", "A")
        const pattern = a.findPattern(p => p.name === "other");

        expect(pattern).toBeNull();
    });

    test("Get Next Patterns", () => {
        const parent = new And("parent", [new Regex("a", "A"), new Literal("b", "B")]);
        const aClone = parent.findPattern(p => p.name === "a") as Pattern;
        const bClone = parent.findPattern(p => p.name === "b") as Pattern;
        const patterns = aClone.getNextPatterns();

        expect(patterns.length).toBe(1);
        expect(patterns[0]).toBe(bClone);
    });

    test("Get Next Patterns With Null Parent", () => {
        const a = new Regex("a", "A")
        const patterns = a.getNextPatterns();

        expect(patterns).toEqual([])
    });

});