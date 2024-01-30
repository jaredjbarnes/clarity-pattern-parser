import { Node } from "../ast/Node";
import { And } from "./And";
import { Cursor } from "./Cursor";
import { findPattern } from "./findPattern";
import { Literal } from "./Literal";
import { Or } from "./Or";
import { Pattern } from "./Pattern";
import { Reference } from "./Reference";
import { Regex } from "./Regex";
import { Repeat } from "./Repeat";

function createValuePattern() {
    const number = new Regex("number", "\\d+");
    number.setTokens(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]);

    const openBracket = new Literal("open-bracket", "[");
    const closeBracket = new Literal("close-bracket", "]");
    const divider = new Regex("divider", "\\s*,\\s+");
    divider.setTokens([", "]);

    const valueRef = new Reference("value");
    const values = new Repeat("values", valueRef, divider);
    const array = new And("array", [openBracket, values, closeBracket]);
    const value = new Or("value", [number, array]);

    return value;
}

describe("Reference", () => {
    test("One Deep Successful Parse", () => {
        const value = createValuePattern();
        const cursor = new Cursor("[1, 2]");
        const result = value.parse(cursor);

        const expected = new Node("and", "array", 0, 5, [
            new Node("literal", "open-bracket", 0, 0, [], "["),
            new Node("repeat", "values", 1, 4, [
                new Node("regex", "number", 1, 1, [], "1"),
                new Node("regex", "divider", 2, 3, [], ", "),
                new Node("regex", "number", 4, 4, [], "2")
            ]),
            new Node("literal", "close-bracket", 5, 5, [], "]"),
        ])

        expect(result).toEqual(expected);
    });

    test("No Reference Pattern", () => {
        const ref = new Reference("bad-reference");

        expect(() => {
            ref.parse(new Cursor("text"))
        }).toThrowError()
    });

    test("Get Tokens", () => {
        const value = createValuePattern();
        const ref = findPattern(value, (p) => p.type === "reference");
        const tokens = ref?.getTokens();
        const expected = [
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "0",
            "["
        ];

        expect(tokens).toEqual(expected);
    });

    test("Get Tokens After With No Parent", () => {
        const ref = new Reference("bad-reference");
        const tokens = ref.getTokensAfter(new Literal("bogus", "bogus"))

        expect(tokens).toEqual([]);
    });

    test("Properties", () => {
        const ref = new Reference("ref");

        expect(ref.type).toBe("reference");
        expect(ref.name).toBe("ref");
        expect(ref.isOptional).toBeFalsy();
        expect(ref.parent).toBe(null)
        expect(ref.children).toEqual([])
    });

    test("Exec", () => {
        const value = createValuePattern();
        const reference = findPattern(value, p => p.type === "reference") as Reference
        const { ast: result } = reference.exec("B");
        expect(result).toBeNull()
    });

    test("Test With Match", () => {
        const value = createValuePattern();
        const reference = findPattern(value, p => p.type === "reference") as Reference
        const result = reference.test("[1]");
        expect(result).toBeTruthy()
    });

    test("Test No Match", () => {
        const value = createValuePattern();
        const reference = findPattern(value, p => p.type === "reference") as Reference
        const result = reference.test("B");
        expect(result).toBeFalsy()
    });

    test("Find Pattern", () => {
        const value = createValuePattern();
        const reference = value.findPattern(p => p.type === "reference") as Pattern;

        const pattern = reference?.findPattern(p => p.name === "Nada");

        expect(pattern).toBe(null);
    });


    test("Get Next Tokens", () => {
        const value = createValuePattern();
        const reference = value.findPattern(p => p.type === "reference") as Pattern;
        const tokens = reference.getNextTokens();

        expect(tokens).toEqual([", ", "]"]);
    });

    test("Get Next Tokens With Null Parent", () => {
        const reference = new Reference("ref-name");
        const tokens = reference.getNextTokens();

        expect(tokens).toEqual([])
    });

    test("Get Tokens After", () => {
        const value = createValuePattern();
        const reference = value.findPattern(p => p.type === "reference") as Pattern;
        const tokens = reference.getTokensAfter(new Literal("bogus", "Bogus"));

        expect(tokens).toEqual([", ", "]"]);
    });

    test("Get Tokens After With Null Parent", () => {
        const reference = new Reference("ref-name");
        const tokens = reference.getTokensAfter(new Literal("bogus", "Bogus"));

        expect(tokens).toEqual([])
    });

    test("Get Patterns", () => {
        const value = createValuePattern();
        const ref = findPattern(value, (p) => p.type === "reference");
        const patterns = ref?.getPatterns() || [];

        expect(patterns.length).toBe(2);
        expect(patterns[0].name).toBe("number");
        expect(patterns[1].name).toBe("open-bracket");
    });

    test("Get Patterns After", () => {
        const value = createValuePattern();
        const reference = value.findPattern(p => p.type === "reference") as Pattern;
        const patterns = reference.getPatternsAfter(new Literal("bogus", "Bogus"));

        expect(patterns.length).toEqual(2);
        expect(patterns[0].type).toEqual("regex");
        expect(patterns[0].name).toEqual("divider");
        expect(patterns[1].type).toEqual("literal");
        expect(patterns[1].name).toEqual("close-bracket");
    });

    test("Get Patterns After With Null Parent", () => {
        const reference = new Reference("ref-name");
        const patterns = reference.getPatternsAfter(new Literal("bogus", "Bogus"));

        expect(patterns).toEqual([])
    });

    test("Get Next Patterns", () => {
        const value = createValuePattern();
        const reference = value.findPattern(p => p.type === "reference") as Pattern;
        const patterns = reference.getNextPatterns();

        expect(patterns.length).toEqual(2);
        expect(patterns[0].type).toEqual("regex");
        expect(patterns[0].name).toEqual("divider");
        expect(patterns[1].type).toEqual("literal");
        expect(patterns[1].name).toEqual("close-bracket");
    });

    test("Get Next Patterns With Null Parent", () => {
        const reference = new Reference("ref-name");
        const patterns = reference.getNextPatterns();

        expect(patterns).toEqual([])
    });

});