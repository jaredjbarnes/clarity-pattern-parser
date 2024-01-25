import { Cursor } from "./Cursor";
import { And } from "./And";
import { Literal } from "./Literal";
import { Node } from "../ast/Node"

describe("And", () => {
    test("No Patterns", () => {
        expect(() => {
            new And("empty", [])
        }).toThrowError()
    });

    test("One Pattern Match Successful", () => {
        const sequence = new And("sequence", [new Literal("a", "A")]);
        const cursor = new Cursor("A");
        const result = sequence.parse(cursor);
        const expected = new Node("and", "sequence", 0, 0, [
            new Node("literal", "a", 0, 0, [], "A")
        ]);

        expect(result).toEqual(expected);
        expect(cursor.furthestError).toBe(null);
        expect(cursor.index).toBe(0);
    });

    test("One Pattern Match Fails", () => {
        const sequence = new And("sequence", [new Literal("a", "A")]);
        const cursor = new Cursor("V");
        const result = sequence.parse(cursor);

        expect(result).toEqual(null);
        expect(cursor.error?.index).toBe(0)
        expect(cursor.index).toBe(0);
    });

    test("Two Pattern Match Successful", () => {
        const sequence = new And("sequence", [
            new Literal("a", "A"),
            new Literal("b", "B")
        ]);
        const cursor = new Cursor("AB");
        const result = sequence.parse(cursor);
        const expected = new Node("and", "sequence", 0, 1, [
            new Node("literal", "a", 0, 0, [], "A"),
            new Node("literal", "b", 1, 1, [], "B")
        ]);

        expect(result).toEqual(expected);
        expect(cursor.error).toBe(null)
        expect(cursor.index).toBe(1);
    });

    test("Two Pattern Match Fails", () => {
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

    test("One Pattern Match Fails (Optional)", () => {
        const sequence = new And("sequence", [new Literal("a", "A")], true);
        const cursor = new Cursor("V");
        const result = sequence.parse(cursor);

        expect(result).toEqual(null);
        expect(cursor.error).toBe(null)
        expect(cursor.index).toBe(0);
    });

    test("Trailing Optional Child Patterns", () => {
        const sequence = new And("sequence", [
            new Literal("a", "A"),
            new Literal("b", "B", true)
        ]);
        const cursor = new Cursor("AD");
        const result = sequence.parse(cursor);
        const expected = new Node("and", "sequence", 0, 0, [
            new Node("literal", "a", 0, 0, [], "A")
        ]);

        expect(result).toEqual(expected);
        expect(cursor.error).toBe(null)
        expect(cursor.index).toBe(0);
    });

    test("Trailing Optional Child Patterns With No More Text", () => {
        const sequence = new And("sequence", [
            new Literal("a", "A"),
            new Literal("b", "B", true)
        ]);
        const cursor = new Cursor("A");
        const result = sequence.parse(cursor);
        const expected = new Node("and", "sequence", 0, 0, [
            new Node("literal", "a", 0, 0, [], "A")
        ]);

        expect(result).toEqual(expected);
        expect(cursor.error).toBe(null)
        expect(cursor.index).toBe(0);
    });

    test("Incomplete Parse (Optional)", () => {
        const sequence = new And("sequence", [
            new Literal("a", "A"),
            new Literal("b", "B")
        ], true);
        const cursor = new Cursor("A");
        const result = sequence.parse(cursor);

        expect(result).toEqual(null);
        expect(cursor.error).toBe(null)
        expect(cursor.index).toBe(0);
    });

    test("Optional Child Pattern With More Patterns", () => {
        const sequence = new And("sequence", [
            new Literal("a", "A", true),
            new Literal("b", "B"),
            new Literal("c", "C")
        ], true);
        const cursor = new Cursor("BC");
        const result = sequence.parse(cursor);
        const expected = new Node("and", "sequence", 0, 1, [
            new Node("literal", "b", 0, 0, [], "B"),
            new Node("literal", "c", 1, 1, [], "C"),
        ]);

        expect(result).toEqual(expected);
        expect(cursor.error).toBe(null)
        expect(cursor.index).toBe(1);
    });

    test("Nothing Matched", () => {
        const sequence = new And("sequence", [
            new Literal("a", "A"),
        ], true);
        const cursor = new Cursor("BC");
        const result = sequence.parse(cursor);

        expect(result).toEqual(null);
        expect(cursor.error).toBe(null)
        expect(cursor.index).toBe(0);
    });

    test("No Matches On Optional Child Patterns", () => {
        const sequence = new And("sequence", [
            new Literal("a", "A", true),
            new Literal("b", "B", true),
        ], true);
        const cursor = new Cursor("XYZ");
        const result = sequence.parse(cursor);

        expect(result).toEqual(null);
        expect(cursor.error).toBe(null)
        expect(cursor.index).toBe(0);
    });

    test("Properties", () => {
        const a = new Literal("a", "A", true)
        const sequence = new And("sequence", [
            a,
        ], true);

        expect(sequence.type).toBe("and");
        expect(sequence.name).toBe("sequence");
        expect(sequence.parent).toBe(null);
        expect(sequence.isOptional).toBe(true);
        expect(sequence.children[0].type).toBe("literal");
        expect(sequence.children[0].name).toBe("a");
    });

    test("Exec", () => {
        const sequence = new And("sequence", [new Literal("a", "A")]);

        const { ast: result, cursor } = sequence.exec("A");
        const expected = new Node("and", "sequence", 0, 0, [
            new Node("literal", "a", 0, 0, undefined, "A")
        ]);

        expect(result).toEqual(expected)
        expect(cursor).not.toBeNull();
    });

    test("Test With Match", () => {
        const sequence = new And("sequence", [new Literal("a", "A")]);
        const hasMatch = sequence.test("A");

        expect(hasMatch).toBeTruthy();
    });

    test("Test With No Match", () => {
        const sequence = new And("sequence", [new Literal("a", "A")]);
        const hasMatch = sequence.test("B");

        expect(hasMatch).toBeFalsy();
    });

    test("Set Parent", () => {
        const a = new Literal("a", "A", true)
        const sequence = new And("sequence", [
            a,
        ], true);
        const parent = new And("parent", [sequence]);

        expect(parent.type).toBe("and");
        expect(parent.children[0].type).toBe("and");
    });

    test("Get Tokens", () => {
        const sequence = new And("sequence", [
            new Literal("a", "A", true),
            new Literal("b", "B"),
        ], true);
        const tokens = sequence.getTokens()
        const expected = ["A", "B"];

        expect(tokens).toEqual(expected);
    });

    test("Get Tokens After", () => {
        const sequence = new And("sequence", [
            new Literal("a", "A"),
            new Literal("b", "B", true),
            new Literal("c", "C"),
        ], true);

        const tokens = sequence.getTokensAfter(sequence.children[0])
        const expected = ["B", "C"];

        expect(tokens).toEqual(expected);
    });

    test("Get Tokens After With Invalid Pattern", () => {
        const sequence = new And("sequence", [
            new Literal("a", "A"),
            new Literal("b", "B", true),
            new Literal("c", "C"),
        ], true);

        const tokens = sequence.getTokensAfter(new Literal("not-child", "not-child"))

        expect(tokens).toEqual([]);
    });

    test("Get Tokens After With Last Child", () => {
        const sequence = new And("sequence", [
            new Literal("a", "A"),
        ], true);
        const parent = new And("parent", [sequence, new Literal("b", "B")]);


        const tokens = parent.children[0].getTokensAfter(parent.children[0].children[0])

        expect(tokens).toEqual(["B"]);
    });

    test("Get Tokens After With Last Optional Child", () => {
        const sequence = new And("sequence", [
            new Literal("a", "A"),
            new Literal("b", "B", true),
        ], true);
        const parent = new And("parent", [sequence, new Literal("c", "C")]);

        const tokens = parent.children[0].getTokensAfter(parent.children[0].children[0])

        expect(tokens).toEqual(["B", "C"]);
    });

    test("Get Next Tokens", () => {
        const sequence = new And("sequence", [new Literal("a", "A")]);
        const parent = new And("parent", [sequence, new Literal("b", "B")]);

        const sequenceClone = parent.findPattern(p => p.name === "sequence");
        const tokens = sequenceClone?.getNextTokens() || [];

        expect(tokens[0]).toBe("B");
    });

    test("Get Next Tokens With Null Parent", () => {
        const sequence = new And("sequence", [new Literal("a", "A")]);
        const tokens = sequence.getNextTokens();

        expect(tokens.length).toBe(0);
    });

    test("Get Next Patterns", () => {
        const sequence = new And("sequence", [new Literal("a", "A")]);
        const parent = new And("parent", [sequence, new Literal("b", "B")]);

        const sequenceClone = parent.findPattern(p => p.name === "sequence");
        const nextPatterns = sequenceClone?.getNextPatterns() || [];
        const b = parent.findPattern(p => p.name === "b")

        expect(nextPatterns[0]).toBe(b);
    });

    test("Get Next Patterns With Null Parent", () => {
        const sequence = new And("sequence", [new Literal("a", "A")]);
        const nextPatterns = sequence.getNextPatterns()

        expect(nextPatterns.length).toBe(0);
    });

});
