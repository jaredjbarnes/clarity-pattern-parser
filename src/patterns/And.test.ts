import { Cursor } from "..";
import { And } from "./And";
import { Literal } from "./Literal";
import { Node } from "../ast/Node"

describe("And", () => {
    test("No Patterns.", () => {
        expect(() => {
            new And("empty", [])
        }).toThrowError()
    });

    test("One Pattern Match Successful.", () => {
        const sequence = new And("sequence", [new Literal("a", "A")]);
        const cursor = new Cursor("A");
        const result = sequence.parse(cursor);
        const expected = new Node("and", "sequence", 0, 0, [
            new Node("literal", "a", 0, 0, [], "A")
        ], "A");

        expect(result).toEqual(expected);
        expect(cursor.furthestError).toBe(null);
        expect(cursor.index).toBe(0);
    });

    test("One Pattern Match Fails.", () => {
        const sequence = new And("sequence", [new Literal("a", "A")]);
        const cursor = new Cursor("V");
        const result = sequence.parse(cursor);

        expect(result).toEqual(null);
        expect(cursor.error?.index).toBe(0)
        expect(cursor.index).toBe(0);
    });

    test("Two Pattern Match Successful.", () => {
        const sequence = new And("sequence", [
            new Literal("a", "A"),
            new Literal("b", "B")
        ]);
        const cursor = new Cursor("AB");
        const result = sequence.parse(cursor);
        const expected = new Node("and", "sequence", 0, 1, [
            new Node("literal", "a", 0, 0, [], "A"),
            new Node("literal", "b", 1, 1, [], "B")
        ], "AB");

        expect(result).toEqual(expected);
        expect(cursor.error).toBe(null)
        expect(cursor.index).toBe(1);
    });

    test("Two Pattern Match Fails.", () => {
        const sequence = new And("sequence", [
            new Literal("a", "A"),
            new Literal("b", "B")
        ]);
        const cursor = new Cursor("AC");
        const result = sequence.parse(cursor);

        expect(result).toEqual(null);
        expect(cursor.error?.index).toBe(1);
        expect(cursor.index).toBe(0);
    });

    test("Optional One Pattern Match Fails.", () => {
        const sequence = new And("sequence", [new Literal("a", "A")], true);
        const cursor = new Cursor("V");
        const result = sequence.parse(cursor);

        expect(result).toEqual(null);
        expect(cursor.index).toBe(0);
    });
});