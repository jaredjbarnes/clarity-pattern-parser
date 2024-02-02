import { Node } from "../ast/Node";
import { And } from "./And";
import { Cursor } from "./Cursor";
import { findPattern } from "./findPattern";
import { Literal } from "./Literal";
import { Pattern } from "./Pattern";
import { Regex } from "./Regex";
import { Repeat } from "./Repeat";

describe("Repeat", () => {
    test("Successful Parse", () => {
        const digit = new Regex("digit", "\\d");
        const integer = new Repeat("number", digit);
        const cursor = new Cursor("337");
        const result = integer.parse(cursor);
        const expected = new Node("repeat", "number", 0, 2, [
            new Node("regex", "digit", 0, 0, [], "3"),
            new Node("regex", "digit", 1, 1, [], "3"),
            new Node("regex", "digit", 2, 2, [], "7"),
        ]);

        expect(result).toEqual(expected)
        expect(cursor.hasError).toBeFalsy()
    });

    test("Failed Parse", () => {
        const digit = new Regex("digit", "\\d");
        const integer = new Repeat("number", digit);
        const cursor = new Cursor("John");
        const result = integer.parse(cursor);

        expect(result).toBeNull()
        expect(cursor.hasError).toBeTruthy()
    });

    test("Successful Parse With Divider", () => {
        const digit = new Regex("digit", "\\d");
        const divider = new Literal("divider", ",");
        const integer = new Repeat("number", digit, divider);
        const cursor = new Cursor("3,3,7");
        const result = integer.parse(cursor);
        const expected = new Node("repeat", "number", 0, 4, [
            new Node("regex", "digit", 0, 0, [], "3"),
            new Node("literal", "divider", 1, 1, [], ","),
            new Node("regex", "digit", 2, 2, [], "3"),
            new Node("literal", "divider", 3, 3, [], ","),
            new Node("regex", "digit", 4, 4, [], "7"),
        ]);

        expect(result).toEqual(expected)
        expect(cursor.hasError).toBeFalsy()
    });

    test("Successful Parse Text Ends With Divider", () => {
        const digit = new Regex("digit", "\\d");
        const divider = new Literal("divider", ",");
        const integer = new Repeat("number", digit, divider);
        const cursor = new Cursor("3,3,7,");
        const result = integer.parse(cursor);
        const expected = new Node("repeat", "number", 0, 4, [
            new Node("regex", "digit", 0, 0, [], "3"),
            new Node("literal", "divider", 1, 1, [], ","),
            new Node("regex", "digit", 2, 2, [], "3"),
            new Node("literal", "divider", 3, 3, [], ","),
            new Node("regex", "digit", 4, 4, [], "7"),
        ]);

        expect(result).toEqual(expected)
        expect(cursor.hasError).toBeFalsy()
    });

    test("Successful Parse Trailing Comma", () => {
        const digit = new Regex("digit", "\\d");
        const divider = new Literal("divider", ",");
        const integer = new Repeat("number", digit, divider);
        const cursor = new Cursor("3,3,7,t");
        const result = integer.parse(cursor);
        const expected = new Node("repeat", "number", 0, 4, [
            new Node("regex", "digit", 0, 0, [], "3"),
            new Node("literal", "divider", 1, 1, [], ","),
            new Node("regex", "digit", 2, 2, [], "3"),
            new Node("literal", "divider", 3, 3, [], ","),
            new Node("regex", "digit", 4, 4, [], "7"),
        ]);

        expect(result).toEqual(expected)
        expect(cursor.hasError).toBeFalsy()
    });

    test("Bounds", () => {
        const integer = new Repeat("integer", new Regex("digit", "\\d"), undefined, false, 2, 3);
        let result = integer.exec("1");
        expect(result.ast).toBeNull();

        result = integer.exec("12");

        let expected = new Node("repeat", "integer", 0, 1, [
            new Node("regex", "digit", 0, 0, [], "1"),
            new Node("regex", "digit", 1, 1, [], "2"),
        ]);

        expect(result.ast).toEqual(expected);

        result = integer.exec("123");
        expected = new Node("repeat", "integer", 0, 2, [
            new Node("regex", "digit", 0, 0, [], "1"),
            new Node("regex", "digit", 1, 1, [], "2"),
            new Node("regex", "digit", 2, 2, [], "3"),
        ])

        expect(result.ast).toEqual(expected);


        const cursor = new Cursor("1234");
        const ast = integer.parse(cursor);
        expected = new Node("repeat", "integer", 0, 2, [
            new Node("regex", "digit", 0, 0, [], "1"),
            new Node("regex", "digit", 1, 1, [], "2"),
            new Node("regex", "digit", 2, 2, [], "3"),
        ])

        expect(ast).toEqual(expected);
        expect(result.cursor.index).toBe(2);

    });

    test("Bounds With Divider", () => {
        const integer = new Repeat(
            "integer",
            new Regex("digit", "\\d"),
            new Regex("comma", ","),
            false,
            2,
            3
        );

        let result = integer.exec("1");
        expect(result.ast).toBeNull();

        result = integer.exec("1,2");

        let expected = new Node("repeat", "integer", 0, 2, [
            new Node("regex", "digit", 0, 0, [], "1"),
            new Node("regex", "comma", 1, 1, [], ","),
            new Node("regex", "digit", 2, 2, [], "2"),
        ]);

        expect(result.ast).toEqual(expected);

        result = integer.exec("1,2,3");
        expected = new Node("repeat", "integer", 0, 4, [
            new Node("regex", "digit", 0, 0, [], "1"),
            new Node("regex", "comma", 1, 1, [], ","),
            new Node("regex", "digit", 2, 2, [], "2"),
            new Node("regex", "comma", 3, 3, [], ","),
            new Node("regex", "digit", 4, 4, [], "3"),
        ])

        expect(result.ast).toEqual(expected);


        const cursor = new Cursor("1,2,3,4");
        const ast = integer.parse(cursor);
        expected = new Node("repeat", "integer", 0, 4, [
            new Node("regex", "digit", 0, 0, [], "1"),
            new Node("regex", "comma", 1, 1, [], ","),
            new Node("regex", "digit", 2, 2, [], "2"),
            new Node("regex", "comma", 3, 3, [], ","),
            new Node("regex", "digit", 4, 4, [], "3"),
        ]);

        expect(ast).toEqual(expected);
        expect(result.cursor.index).toBe(4);

    });

    test("Failed (Optional)", () => {
        const digit = new Regex("digit", "\\d");
        const integer = new Repeat("number", digit, undefined, true);
        const cursor = new Cursor("John");
        const result = integer.parse(cursor);

        expect(result).toBeNull()
        expect(cursor.hasError).toBeFalsy()
    });

    test("Get Tokens", () => {
        const a = new Literal("a", "A");
        const manyA = new Repeat("number", a);
        const tokens = manyA.getTokens();
        const expected = ["A"];

        expect(tokens).toEqual(expected)
    });

    test("Get Tokens After With Bogus Pattern", () => {
        const a = new Literal("a", "A");
        const manyA = new Repeat("many-a", a);
        const tokens = manyA.getTokensAfter(new Literal("bogus", "bogus"));
        const expected: string[] = [];

        expect(tokens).toEqual(expected)
    });

    test("Get Tokens After With Divider", () => {
        const a = new Literal("a", "A");
        const b = new Literal("b", "B");
        const divider = new Literal("divider", ",");
        const manyA = new Repeat("many-a", a, divider);
        const parent = new And("parent", [manyA, b]);

        const clonedManyA = findPattern(parent, p => p.name == "many-a");
        let tokens = clonedManyA?.getTokensAfter(clonedManyA.children[0]);
        let expected = [",", "B"];

        expect(tokens).toEqual(expected)

        tokens = clonedManyA?.getTokensAfter(clonedManyA.children[1]);
        expected = ["A"];

        expect(tokens).toEqual(expected)
    });

    test("Get Tokens After Without Divider", () => {
        const a = new Literal("a", "A");
        const b = new Literal("b", "B");
        const manyA = new Repeat("many-a", a);
        const parent = new And("parent", [manyA, b]);

        const clonedManyA = findPattern(parent, p => p.name == "many-a");
        const tokens = clonedManyA?.getTokensAfter(clonedManyA.children[0]);
        const expected = ["A", "B"];

        expect(tokens).toEqual(expected)
    });

    test("Properties", () => {
        const integer = new Repeat("integer", new Regex("digit", "\\d"));

        expect(integer.type).toBe("repeat");
        expect(integer.name).toBe("integer");
        expect(integer.isOptional).toBeFalsy()
        expect(integer.parent).toBeNull();
        expect(integer.children[0].name).toBe("digit");
    });

    test("Exec", () => {
        const integer = new Repeat("integer", new Regex("digit", "\\d"));
        const { ast: result } = integer.exec("B");
        expect(result).toBeNull()
    });

    test("Test With Match", () => {
        const integer = new Repeat("integer", new Regex("digit", "\\d"));
        const result = integer.test("1");
        expect(result).toBeTruthy()
    });

    test("Test With No Match", () => {
        const integer = new Repeat("integer", new Regex("digit", "\\d"));
        const result = integer.test("b");
        expect(result).toBeFalsy()
    });

    test("Get Next Tokens", () => {
        const integer = new Repeat("integer", new Regex("digit", "\\d"));
        const parent = new And("parent", [integer, new Literal("pow", "!")]);
        const integerClone = parent.findPattern(p => p.name === "integer") as Pattern;
        const tokens = integerClone.getNextTokens();

        expect(tokens).toEqual(["!"])
    });

    test("Get Next Tokens With Null Parents", () => {
        const integer = new Repeat("integer", new Regex("digit", "\\d"));
        const tokens = integer.getNextTokens();

        expect(tokens.length).toBe(0);
    });

    test("Find Pattern", () => {
        const integer = new Repeat("integer", new Regex("digit", "\\d"));
        const digitClone = integer.findPattern(p => p.name === "digit") as Pattern;

        expect(digitClone).not.toBeNull();
    });

    test("Get Patterns", () => {
        const a = new Literal("a", "A");
        const manyA = new Repeat("number", a);
        const patterns = manyA.getPatterns();
        const expected = [manyA.findPattern(p => p.name === "a")];

        expect(patterns).toEqual(expected)
    });

    test("Get Next Patterns", () => {
        const integer = new Repeat("integer", new Regex("digit", "\\d"));
        const parent = new And("parent", [integer, new Literal("pow", "!")]);
        const integerClone = parent.findPattern(p => p.name === "integer") as Pattern;
        const powClone = parent.findPattern(p => p.name === "pow") as Pattern;
        const patterns = integerClone.getNextPatterns();

        expect(patterns.length).toBe(1);
        expect(patterns[0]).toBe(powClone);
    });

    test("Get Next Patterns With Null Parents", () => {
        const integer = new Repeat("integer", new Regex("digit", "\\d"));
        const patterns = integer.getNextPatterns();

        expect(patterns.length).toBe(0);
    });
});