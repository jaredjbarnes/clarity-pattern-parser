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

    test("Set Parent", () => {
        const a = new Literal("a", "A", true)
        const sequence = new And("sequence", [
            a,
        ], true);
        const parent = new And("parent", [sequence]);

        expect(parent.type).toBe("and");
        expect(parent.children[0].type).toBe("and");
    });

    test("Reduce Ast", () => {
        const sequence = new And("sequence", [
            new Literal("a", "A"),
        ], true);
        sequence.enableAstReduction();

        const cursor = new Cursor("A");
        let result = sequence.parse(cursor);
        let expected = new Node("and", "sequence", 0, 0, [], "A");

        expect(result).toEqual(expected);
        expect(cursor.error).toBe(null)
        expect(cursor.index).toBe(0);

        sequence.disableAstReduction()

        cursor.moveTo(0)
        result = sequence.parse(cursor);
        expected = new Node("and", "sequence", 0, 0, [
            new Node("literal", "a", 0, 0, [], "A"),
        ]);

        expect(result).toEqual(expected);
        expect(cursor.error).toBe(null)
        expect(cursor.index).toBe(0);
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

    test("Get Next Tokens", () => {
        const sequence = new And("sequence", [
            new Literal("a", "A"),
            new Literal("b", "B", true),
            new Literal("c", "C"),
        ], true);

        const tokens = sequence.getNextTokens(sequence.children[0])
        const expected = ["B", "C"];

        expect(tokens).toEqual(expected);
    });

    test("Get Next Tokens With Invalid Pattern", () => {
        const sequence = new And("sequence", [
            new Literal("a", "A"),
            new Literal("b", "B", true),
            new Literal("c", "C"),
        ], true);

        const tokens = sequence.getNextTokens(new Literal("not-child", "not-child"))

        expect(tokens).toEqual([]);
    });

    test("Get Next Tokens With Last Child", () => {
        const sequence = new And("sequence", [
            new Literal("a", "A"),
        ], true);
        const parent = new And("parent", [sequence, new Literal("b", "B")]);


        const tokens = parent.children[0].getNextTokens(parent.children[0].children[0])

        expect(tokens).toEqual(["B"]);
    });

    test("Get Next Tokens With Last Optional Child", () => {
        const sequence = new And("sequence", [
            new Literal("a", "A"),
            new Literal("b", "B", true),
        ], true);
        const parent = new And("parent", [sequence, new Literal("c", "C")]);


        const tokens = parent.children[0].getNextTokens(parent.children[0].children[0])

        expect(tokens).toEqual(["B", "C"]);
    });

    test("Parse Text", () => {
        const sequence = new And("sequence", [new Literal("a", "A")]);
        sequence.enableAstReduction();

        const { ast: result, cursor } = sequence.parseText("A");
        const expected = new Node("and", "sequence", 0, 0, [], "A");

        expect(result).toEqual(expected)
        expect(cursor).not.toBeNull();
    });

    test("Get Next Pattern", () => {
        const sequence = new And("sequence", [
            new Literal("a", "A"),
            new Literal("b", "B", true),
        ]);
        const parent = new And("parent", [sequence, new Literal("c", "C")]);
        const nextPattern = parent.children[0].getNextPattern()

        expect(nextPattern?.name).toBe("c");
    });
});
