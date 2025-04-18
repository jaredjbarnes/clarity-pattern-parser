import { Node } from "../ast/Node";
import { Sequence } from "./Sequence";
import { Cursor } from "./Cursor";
import { findPattern } from "./findPattern";
import { Literal } from "./Literal";
import { Pattern } from "./Pattern";
import { Regex } from "./Regex";
import { InfiniteRepeat } from "./InfiniteRepeat";
import { Optional } from "./Optional";

describe("InfiniteRepeat", () => {
    test("Successful Parse", () => {
        const digit = new Regex("digit", "\\d");
        const integer = new InfiniteRepeat("number", digit);
        const cursor = new Cursor("337");
        const result = integer.parse(cursor);
        const expected = new Node("infinite-repeat", "number", 0, 2, [
            new Node("regex", "digit", 0, 0, [], "3"),
            new Node("regex", "digit", 1, 1, [], "3"),
            new Node("regex", "digit", 2, 2, [], "7"),
        ]);

        expect(result?.isEqual(expected)).toBeTruthy();
        expect(cursor.hasError).toBeFalsy();
    });

    test("Bounds", () => {
        const digit = new Regex("digit", "\\d");
        const integer = new InfiniteRepeat("number", digit, { min: 2 });

        let cursor = new Cursor("3");
        let result = integer.parse(cursor);
        let expected: Node | null = null;

        expect(result).toBeNull();
        expect(cursor.hasError).toBeTruthy();

        cursor = new Cursor("33");
        result = integer.parse(cursor);
        expected = new Node("infinite-repeat", "number", 0, 1, [
            new Node("regex", "digit", 0, 0, [], "3"),
            new Node("regex", "digit", 1, 1, [], "3")
        ]);

        expect(result?.isEqual(expected)).toBeTruthy();
        expect(cursor.hasError).toBeFalsy();
    });

    test("Failed Parse", () => {
        const digit = new Regex("digit", "\\d");
        const integer = new InfiniteRepeat("number", digit);
        const cursor = new Cursor("John");
        const result = integer.parse(cursor);

        expect(result).toBeNull();
        expect(cursor.hasError).toBeTruthy();
    });

    test("Successful Parse With Divider", () => {
        const digit = new Regex("digit", "\\d");
        const divider = new Literal("divider", ",");
        const integer = new InfiniteRepeat("number", digit, { divider });
        const cursor = new Cursor("3,3,7");
        const result = integer.parse(cursor);
        const expected = new Node("infinite-repeat", "number", 0, 4, [
            new Node("regex", "digit", 0, 0, [], "3"),
            new Node("literal", "divider", 1, 1, [], ","),
            new Node("regex", "digit", 2, 2, [], "3"),
            new Node("literal", "divider", 3, 3, [], ","),
            new Node("regex", "digit", 4, 4, [], "7"),
        ]);

        expect(result?.isEqual(expected)).toBeTruthy();
        expect(cursor.hasError).toBeFalsy();
    });

    test("Successful Parse Text Ends With Divider", () => {
        const digit = new Regex("digit", "\\d");
        const divider = new Literal("divider", ",");
        const integer = new InfiniteRepeat("number", digit, { divider, trimDivider: true });
        const cursor = new Cursor("3,3,7,");
        const result = integer.parse(cursor);
        const expected = new Node("infinite-repeat", "number", 0, 4, [
            new Node("regex", "digit", 0, 0, [], "3"),
            new Node("literal", "divider", 1, 1, [], ","),
            new Node("regex", "digit", 2, 2, [], "3"),
            new Node("literal", "divider", 3, 3, [], ","),
            new Node("regex", "digit", 4, 4, [], "7"),
        ]);

        expect(result?.isEqual(expected)).toBeTruthy();
        expect(cursor.hasError).toBeFalsy();
    });

    test("Successful Parse Trailing Comma", () => {
        const digit = new Regex("digit", "\\d");
        const divider = new Literal("divider", ",");
        const integer = new InfiniteRepeat("number", digit, { divider, trimDivider: true });
        const cursor = new Cursor("3,3,7,t");
        const result = integer.parse(cursor);
        const expected = new Node("infinite-repeat", "number", 0, 4, [
            new Node("regex", "digit", 0, 0, [], "3"),
            new Node("literal", "divider", 1, 1, [], ","),
            new Node("regex", "digit", 2, 2, [], "3"),
            new Node("literal", "divider", 3, 3, [], ","),
            new Node("regex", "digit", 4, 4, [], "7"),
        ]);

        expect(result?.isEqual(expected)).toBeTruthy();
        expect(cursor.hasError).toBeFalsy();
    });

    test("Failed (Optional)", () => {
        const digit = new Optional("optional-digit", new Regex("digit", "\\d"));
        const integer = new InfiniteRepeat("number", digit, { min: 0 });
        const cursor = new Cursor("John");
        const result = integer.parse(cursor);

        expect(result).toBeNull();
        expect(cursor.hasError).toBeFalsy();
    });

    test("Get Tokens", () => {
        const a = new Literal("a", "A");
        const manyA = new InfiniteRepeat("number", a);
        const tokens = manyA.getTokens();
        const expected = ["A"];

        expect(tokens).toEqual(expected);
    });

    test("Get Tokens After With Bogus Pattern", () => {
        const a = new Literal("a", "A");
        const manyA = new InfiniteRepeat("many-a", a);
        const tokens = manyA.getTokensAfter(new Literal("bogus", "bogus"));
        const expected: string[] = [];

        expect(tokens).toEqual(expected);
    });

    test("Get Tokens After With Divider", () => {
        const a = new Literal("a", "A");
        const b = new Literal("b", "B");
        const divider = new Literal("divider", ",");
        const manyA = new InfiniteRepeat("many-a", a, { divider });
        const parent = new Sequence("parent", [manyA, b]);

        const clonedManyA = findPattern(parent, p => p.name === "many-a");
        let tokens = clonedManyA?.getTokensAfter(clonedManyA.children[0]);
        let expected = [",", "B"];

        expect(tokens).toEqual(expected);

        tokens = clonedManyA?.getTokensAfter(clonedManyA.children[1]);
        expected = ["A"];

        expect(tokens).toEqual(expected);
    });

    test("Get Tokens After Without Divider", () => {
        const a = new Literal("a", "A");
        const b = new Literal("b", "B");
        const manyA = new InfiniteRepeat("many-a", a);
        const parent = new Sequence("parent", [manyA, b]);

        const clonedManyA = findPattern(parent, p => p.name === "many-a");
        const tokens = clonedManyA?.getTokensAfter(clonedManyA.children[0]);
        const expected = ["A", "B"];

        expect(tokens).toEqual(expected);
    });

    test("Properties", () => {
        const integer = new InfiniteRepeat("integer", new Regex("digit", "\\d"));

        expect(integer.type).toBe("infinite-repeat");
        expect(integer.name).toBe("integer");
        expect(integer.min).toBe(1);
        expect(integer.parent).toBeNull();
        expect(integer.children[0].name).toBe("digit");
    });

    test("Exec", () => {
        const integer = new InfiniteRepeat("integer", new Regex("digit", "\\d"));
        const { ast: result } = integer.exec("B");
        expect(result).toBeNull();
    });

    test("Test With Match", () => {
        const integer = new InfiniteRepeat("integer", new Regex("digit", "\\d"));
        const result = integer.test("1");
        expect(result).toBeTruthy();
    });

    test("Test With No Match", () => {
        const integer = new InfiniteRepeat("integer", new Regex("digit", "\\d"));
        const result = integer.test("b");
        expect(result).toBeFalsy();
    });

    test("Get Next Tokens", () => {
        const integer = new InfiniteRepeat("integer", new Regex("digit", "\\d"));
        const parent = new Sequence("parent", [integer, new Literal("pow", "!")]);
        const integerClone = parent.find(p => p.name === "integer") as Pattern;
        const tokens = integerClone.getNextTokens();

        expect(tokens).toEqual(["!"]);
    });

    test("Get Next Tokens With Null Parents", () => {
        const integer = new InfiniteRepeat("integer", new Regex("digit", "\\d"));
        const tokens = integer.getNextTokens();

        expect(tokens.length).toBe(0);
    });

    test("Find Pattern", () => {
        const integer = new InfiniteRepeat("integer", new Regex("digit", "\\d"));
        const digitClone = integer.find(p => p.name === "digit") as Pattern;

        expect(digitClone).not.toBeNull();
    });

    test("Get Patterns", () => {
        const a = new Literal("a", "A");
        const manyA = new InfiniteRepeat("number", a);
        const patterns = manyA.getPatterns();
        const expected = [manyA.find(p => p.name === "a")];

        expect(patterns).toEqual(expected);
    });

    test("Get Next Patterns", () => {
        const integer = new InfiniteRepeat("integer", new Regex("digit", "\\d"));
        const parent = new Sequence("parent", [integer, new Literal("pow", "!")]);
        const integerClone = parent.find(p => p.name === "integer") as Pattern;
        const powClone = parent.find(p => p.name === "pow") as Pattern;
        const patterns = integerClone.getNextPatterns();

        expect(patterns.length).toBe(1);
        expect(patterns[0]).toBe(powClone);
    });

    test("Get Next Patterns With Null Parents", () => {
        const integer = new InfiniteRepeat("integer", new Regex("digit", "\\d"));
        const patterns = integer.getNextPatterns();

        expect(patterns.length).toBe(0);
    });

    test("Clone With Custom Overrides", () => {
        const numbers = new InfiniteRepeat("numbers", new Regex("number", "\\d"), { min: 3, divider: new Literal("divider", "divider"), trimDivider: true });
        let clone = numbers.clone();
        let expected = new InfiniteRepeat("numbers", new Regex("number", "\\d"), { min: 3, divider: new Literal("divider", "divider"), trimDivider: true });

        expect(clone.isEqual(expected)).toBeTruthy();
    });

    test("No Results, min is 0", () => {
        const numbers = new InfiniteRepeat("numbers", new Regex("number", "\\d"), { divider: new Literal(",", ","), min: 0 });
        const result = numbers.exec("j");
        expect(result.ast).toBeNull();
        expect(result.cursor.index).toBe(0);
        expect(result.cursor.hasError).toBeTruthy();
    });

    test("Trim Trailing Complex Delimiter Pattern", () => {
        const numbers = new InfiniteRepeat("numbers", new Regex("number", "\\d"), { divider: new Sequence("comma", [new Literal(",", ","), new Literal("space", " ")]), trimDivider: true });
        const result = numbers.parse(new Cursor("1, 2,"));
        expect(result?.value).toBe("1, 2");
    });


});