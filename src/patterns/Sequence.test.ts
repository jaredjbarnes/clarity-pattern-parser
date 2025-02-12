import { Cursor } from "./Cursor";
import { Sequence } from "./Sequence";
import { Literal } from "./Literal";
import { Node } from "../ast/Node";
import { Optional } from "./Optional";
import { Pattern } from "./Pattern";

describe("Sequence", () => {
    test("No Patterns", () => {
        expect(() => {
            new Sequence("empty", []);
        }).toThrowError();
    });

    test("One Pattern Match Successful", () => {
        const sequence = new Sequence("sequence", [new Literal("a", "A")]);
        const cursor = new Cursor("A");
        const result = sequence.parse(cursor);
        const expected = new Node("sequence", "sequence", 0, 0, [
            new Node("literal", "a", 0, 0, [], "A")
        ]);

        expect(result).toEqual(expected);
        expect(cursor.furthestError).toBe(null);
        expect(cursor.index).toBe(0);
    });

    test("One Pattern Match Fails", () => {
        const sequence = new Sequence("sequence", [new Literal("a", "A")]);
        const cursor = new Cursor("V");
        const result = sequence.parse(cursor);

        expect(result).toEqual(null);
        expect(cursor.error?.startIndex).toBe(0);
        expect(cursor.error?.lastIndex).toBe(0);
        expect(cursor.index).toBe(0);
    });

    test("Two Pattern Match Successful", () => {
        const sequence = new Sequence("sequence", [
            new Literal("a", "A"),
            new Literal("b", "B")
        ]);
        const cursor = new Cursor("AB");
        const result = sequence.parse(cursor);
        const expected = new Node("sequence", "sequence", 0, 1, [
            new Node("literal", "a", 0, 0, [], "A"),
            new Node("literal", "b", 1, 1, [], "B")
        ]);

        expect(result).toEqual(expected);
        expect(cursor.error).toBe(null)
        expect(cursor.index).toBe(1);
    });

    test("Two Pattern Match Fails", () => {
        const sequence = new Sequence("sequence", [
            new Literal("a", "A"),
            new Literal("b", "B")
        ]);
        const cursor = new Cursor("AC");
        const result = sequence.parse(cursor);

        expect(result).toEqual(null);
        expect(cursor.error?.startIndex).toBe(1);
        expect(cursor.error?.lastIndex).toBe(1);
        expect(cursor.index).toBe(0);
    });

    test("One Pattern Match Fails (Optional)", () => {
        const sequence = new Optional("optional-sequence", new Sequence("sequence", [new Literal("a", "A")]));
        const cursor = new Cursor("V");
        const result = sequence.parse(cursor);

        expect(result).toEqual(null);
        expect(cursor.error).toBe(null);
        expect(cursor.index).toBe(0);
    });

    test("Trailing Optional Child Patterns", () => {
        const sequence = new Sequence("sequence", [
            new Literal("a", "A"),
            new Optional("b", new Literal("b", "B"))
        ]);
        const cursor = new Cursor("AD");
        const result = sequence.parse(cursor);
        const expected = new Node("sequence", "sequence", 0, 0, [
            new Node("literal", "a", 0, 0, [], "A")
        ]);

        expect(result).toEqual(expected);
        expect(cursor.error).toBe(null);
        expect(cursor.index).toBe(0);
    });

    test("Trailing Optional Child Patterns With No More Text", () => {
        const sequence = new Sequence("sequence", [
            new Literal("a", "A"),
            new Optional("b", new Literal("b", "B"))
        ]);
        const cursor = new Cursor("A");
        const result = sequence.parse(cursor);
        const expected = new Node("sequence", "sequence", 0, 0, [
            new Node("literal", "a", 0, 0, [], "A")
        ]);

        expect(result).toEqual(expected);
        expect(cursor.error).toBe(null)
        expect(cursor.index).toBe(0);
    });

    test("Incomplete Parse (Optional)", () => {
        const sequence = new Optional("optional-sequence", new Sequence("sequence", [
            new Literal("a", "A"),
            new Literal("b", "B")
        ]));
        const cursor = new Cursor("A");
        const result = sequence.parse(cursor);

        expect(result).toEqual(null);
        expect(cursor.error).toBe(null);
        expect(cursor.index).toBe(0);
    });

    test("Optional Child Pattern With More Patterns", () => {
        const sequence = new Optional("optional-sequence", new Sequence("sequence", [
            new Optional("a", new Literal("a", "A")),
            new Literal("b", "B"),
            new Literal("c", "C")
        ]));
        const cursor = new Cursor("BC");
        const result = sequence.parse(cursor);
        const expected = new Node("sequence", "sequence", 0, 1, [
            new Node("literal", "b", 0, 0, [], "B"),
            new Node("literal", "c", 1, 1, [], "C"),
        ]);

        expect(result).toEqual(expected);
        expect(cursor.error).toBe(null)
        expect(cursor.index).toBe(1);
    });

    test("Nothing Matched", () => {
        const sequence = new Optional("optional-sequence", new Sequence("sequence", [
            new Literal("a", "A"),
        ]));
        const cursor = new Cursor("BC");
        const result = sequence.parse(cursor);

        expect(result).toEqual(null);
        expect(cursor.error).toBe(null);
        expect(cursor.index).toBe(0);
    });

    test("No Matches On Optional Child Patterns", () => {
        const sequence = new Optional("optional-sequence", new Sequence("sequence", [
            new Optional("a", new Literal("a", "A")),
            new Optional("b", new Literal("b", "B")),
        ]));
        const cursor = new Cursor("XYZ");
        const result = sequence.parse(cursor);

        expect(result).toEqual(null);
        expect(cursor.error).toBe(null);
        expect(cursor.index).toBe(0);
    });

    test("Properties", () => {
        const a = new Literal("a", "A");
        const sequence = new Sequence("sequence", [
            a,
        ]);

        expect(sequence.type).toBe("sequence");
        expect(sequence.name).toBe("sequence");
        expect(sequence.parent).toBe(null);
        expect(sequence.children[0].type).toBe("literal");
        expect(sequence.children[0].name).toBe("a");
    });

    test("Exec", () => {
        const sequence = new Sequence("sequence", [new Literal("a", "A")]);

        const { ast: result, cursor } = sequence.exec("A");
        const expected = new Node("sequence", "sequence", 0, 0, [
            new Node("literal", "a", 0, 0, undefined, "A")
        ]);

        expect(result).toEqual(expected)
        expect(cursor).not.toBeNull();
    });

    test("Test With Match", () => {
        const sequence = new Sequence("sequence", [new Literal("a", "A")]);
        const hasMatch = sequence.test("A");

        expect(hasMatch).toBeTruthy();
    });

    test("Test With No Match", () => {
        const sequence = new Sequence("sequence", [new Literal("a", "A")]);
        const hasMatch = sequence.test("B");

        expect(hasMatch).toBeFalsy();
    });

    test("Set Parent", () => {
        const a = new Optional("a", new Literal("a", "A"));
        const sequence = new Sequence("sequence", [
            a,
        ]);
        const parent = new Sequence("parent", [sequence]);

        expect(parent.type).toBe("sequence");
        expect(parent.children[0].type).toBe("sequence");
    });

    test("Get Tokens", () => {
        const sequence = new Sequence("sequence", [
            new Optional("a", new Literal("a", "A")),
            new Literal("b", "B"),
        ]);
        const tokens = sequence.getTokens();
        const expected = ["A", "B"];

        expect(tokens).toEqual(expected);
    });

    test("Get Tokens After", () => {
        const sequence = new Sequence("sequence", [
            new Literal("a", "A"),
            new Optional("b", new Literal("b", "B")),
            new Literal("c", "C"),
        ]);

        const tokens = sequence.getTokensAfter(sequence.children[0]);
        const expected = ["B", "C"];

        expect(tokens).toEqual(expected);
    });

    test("Get Tokens After With Invalid Pattern", () => {
        const sequence = new Sequence("sequence", [
            new Literal("a", "A"),
            new Optional("b", new Literal("b", "B")),
            new Literal("c", "C"),
        ]);

        const tokens = sequence.getTokensAfter(new Literal("not-child", "not-child"));

        expect(tokens).toEqual([]);
    });

    test("Get Tokens After With Last Child", () => {
        const sequence = new Sequence("sequence", [
            new Literal("a", "A"),
        ]);
        const parent = new Sequence("parent", [sequence, new Literal("b", "B")]);


        const tokens = parent.children[0].getTokensAfter(parent.children[0].children[0])

        expect(tokens).toEqual(["B"]);
    });

    test("Get Tokens After With Last Optional Child", () => {
        const sequence = new Sequence("sequence", [
            new Literal("a", "A"),
            new Optional("b", new Literal("b", "B")),
        ]);
        const parent = new Sequence("parent", [sequence, new Literal("c", "C")]);

        const tokens = parent.children[0].getTokensAfter(parent.children[0].children[0])

        expect(tokens).toEqual(["B", "C"]);
    });

    test("Get Next Tokens", () => {
        const sequence = new Sequence("sequence", [new Literal("a", "A")]);
        const parent = new Sequence("parent", [sequence, new Literal("b", "B")]);

        const sequenceClone = parent.find(p => p.name === "sequence");
        const tokens = sequenceClone?.getNextTokens() || [];

        expect(tokens[0]).toBe("B");
    });

    test("Get Next Tokens With Null Parent", () => {
        const sequence = new Sequence("sequence", [new Literal("a", "A")]);
        const tokens = sequence.getNextTokens();

        expect(tokens.length).toBe(0);
    });

    test("Get Patterns", () => {
        const sequence = new Sequence("sequence", [
            new Optional("a", new Literal("a", "A")),
            new Literal("b", "B"),
        ]);
        const tokens = sequence.getPatterns();
        const a = sequence.find(p => p.name === "a");
        const b = sequence.find(p => p.name === "b");
        const expected = [a, b]

        expect(tokens).toEqual(expected);
    });

    test("Get Next Patterns", () => {
        const sequence = new Sequence("sequence", [new Literal("a", "A")]);
        const parent = new Sequence("parent", [sequence, new Literal("b", "B")]);

        const sequenceClone = parent.find(p => p.name === "sequence");
        const nextPatterns = sequenceClone?.getNextPatterns() || [];
        const b = parent.find(p => p.name === "b") as Pattern;

        expect(nextPatterns[0].isEqual(b)).toBeTruthy();
    });

    test("Get Next Patterns With Null Parent", () => {
        const sequence = new Sequence("sequence", [new Literal("a", "A")]);
        const nextPatterns = sequence.getNextPatterns()

        expect(nextPatterns.length).toBe(0);
    });

    test("All Patterns are Optional", () => {
        const sequence = new Sequence("sequence", [
            new Optional("optional-a", new Literal("a", "A")),
            new Optional("optional-b", new Literal("b", "B"))
        ]);
        const result = sequence.exec("");

        expect(result.ast).toBe(null);
        expect(result.cursor.hasError).toBeFalsy();
    });

});
