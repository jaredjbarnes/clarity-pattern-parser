import { Cursor, Repeat } from "..";
import { Node } from "../ast/Node";
import { And } from "./And";
import { findPattern } from "./findPattern";
import { Literal } from "./Literal";
import { Or } from "./Or";
import { Reference } from "./Reference";
import { Regex } from "./Regex";

function createValuePattern() {
    const number = new Regex("number", "\\d+");
    const openBracket = new Literal("open-bracket", "[");
    const closeBracket = new Literal("close-bracket", "]");
    const divider = new Regex("divider", "\\s*,\\s+");
    const valueRef = new Reference("value");
    const values = new Repeat("values", valueRef, divider);
    const array = new And("array", [openBracket, values, closeBracket]);
    const value = new Or("value", [number, array]);

    number.setTokens(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]);
    divider.setTokens([", "])

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
        const expected = ["["];

        expect(tokens).toEqual(expected);
    });

    test("Get Next Tokens", () => {
        const value = createValuePattern();
        const ref = findPattern(value, (p) => p.type === "reference");

        // The value passed to getNextTokens doesn't matter.
        // I just needed it to be a pattern.
        const tokens = ref?.getNextTokens(value);
        const expected = ["]"];

        expect(tokens).toEqual(expected);
    });

    test("Get Next Tokens With No Parent", () => {
        const ref = new Reference("bad-reference");
        const tokens = ref.getNextTokens(new Literal("bogus", "bogus"))

        expect(tokens).toEqual([]);
    });

    test("Get Next Pattern", () => {
        const ref = new Reference("ref");
        const nextPattern = ref.getNextPattern();

        expect(nextPattern).toBeNull()
    });

    test("Properties", () => {
        const ref = new Reference("ref");

        expect(ref.type).toBe("reference");
        expect(ref.name).toBe("ref");
        expect(ref.isOptional).toBeFalsy();
        expect(ref.parent).toBe(null)
        expect(ref.children).toEqual([])
    });

    test("Parse Text", () => {
        const value = createValuePattern();
        const reference = findPattern(value, p => p.type === "reference") as Reference
        const { ast: result } = reference.parseText("B");
        expect(result).toBeNull()
    });
});