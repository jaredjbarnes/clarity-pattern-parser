import { FiniteRepeat } from "./FiniteRepeat";
import { Cursor } from "./Cursor";
import { Regex } from "./Regex";
import { Node } from "../ast/Node";
import { Literal } from "./Literal";
import { And } from "./And";

describe("BoundedRepeat", () => {
    test("Bounds Without Divider", () => {
        const numbers = new FiniteRepeat("numbers", new Regex("number", "\\d"), 3, {
            min: 2
        });

        let cursor = new Cursor("1");
        let result = numbers.parse(cursor);
        let expected: Node | null = null;
        expect(result).toBeNull();
        expect(cursor.hasError).toBeTruthy();

        cursor = new Cursor("12");
        result = numbers.parse(cursor);
        expected = new Node("finite-repeat", "numbers", 0, 1, [
            new Node("regex", "number", 0, 0, [], "1"),
            new Node("regex", "number", 1, 1, [], "2"),
        ]);

        expect(result).toEqual(expected);
        expect(cursor.hasError).toBeFalsy();

        cursor = new Cursor("123");
        result = numbers.parse(cursor);
        expected = new Node("finite-repeat", "numbers", 0, 2, [
            new Node("regex", "number", 0, 0, [], "1"),
            new Node("regex", "number", 1, 1, [], "2"),
            new Node("regex", "number", 2, 2, [], "3"),
        ]);

        expect(result).toEqual(expected);
        expect(cursor.hasError).toBeFalsy();

        cursor = new Cursor("1234");
        result = numbers.parse(cursor);
        expected = new Node("finite-repeat", "numbers", 0, 2, [
            new Node("regex", "number", 0, 0, [], "1"),
            new Node("regex", "number", 1, 1, [], "2"),
            new Node("regex", "number", 2, 2, [], "3"),
        ]);

        expect(result).toEqual(expected);
        expect(cursor.hasError).toBeFalsy();
        expect(cursor.index).toBe(2);

        cursor = new Cursor("12f");
        result = numbers.parse(cursor);
        expected = new Node("finite-repeat", "numbers", 0, 1, [
            new Node("regex", "number", 0, 0, [], "1"),
            new Node("regex", "number", 1, 1, [], "2"),
        ]);

        expect(result).toEqual(expected);
        expect(cursor.hasError).toBeFalsy();
    });

    test("Bounds Are Equal Without Divider", () => {
        const numbers = new FiniteRepeat("numbers", new Regex("number", "\\d"), 3, { min: 3 });

        let cursor = new Cursor("1");
        let result = numbers.parse(cursor);
        let expected: Node | null = null;
        expect(result).toBeNull();
        expect(cursor.hasError).toBeTruthy();

        cursor = new Cursor("12");
        result = numbers.parse(cursor);
        expected = null;

        expect(result).toBeNull();
        expect(cursor.hasError).toBeTruthy();

        cursor = new Cursor("123");
        result = numbers.parse(cursor);
        expected = new Node("finite-repeat", "numbers", 0, 2, [
            new Node("regex", "number", 0, 0, [], "1"),
            new Node("regex", "number", 1, 1, [], "2"),
            new Node("regex", "number", 2, 2, [], "3"),
        ]);

        expect(result).toEqual(expected);
        expect(cursor.hasError).toBeFalsy();

        cursor = new Cursor("1234");
        result = numbers.parse(cursor);
        expected = new Node("finite-repeat", "numbers", 0, 2, [
            new Node("regex", "number", 0, 0, [], "1"),
            new Node("regex", "number", 1, 1, [], "2"),
            new Node("regex", "number", 2, 2, [], "3"),
        ]);

        expect(result).toEqual(expected);
        expect(cursor.hasError).toBeFalsy();
        expect(cursor.index).toBe(2);

    });

    test("Bounds With Divider", () => {
        const divider = new Literal("comma", ",");
        const numbers = new FiniteRepeat("numbers", new Regex("number", "\\d"), 3, { divider, min: 2 });

        let cursor = new Cursor("1,");
        let result = numbers.parse(cursor);
        let expected: Node | null = null;
        expect(result).toBeNull();
        expect(cursor.hasError).toBeTruthy();

        cursor = new Cursor("1,2");
        result = numbers.parse(cursor);
        expected = new Node("finite-repeat", "numbers", 0, 2, [
            new Node("regex", "number", 0, 0, [], "1"),
            new Node("literal", "comma", 1, 1, [], ","),
            new Node("regex", "number", 2, 2, [], "2"),
        ]);

        expect(result).toEqual(expected);
        expect(cursor.hasError).toBeFalsy();

        cursor = new Cursor("1,2,3,");
        result = numbers.parse(cursor);
        expected = new Node("finite-repeat", "numbers", 0, 4, [
            new Node("regex", "number", 0, 0, [], "1"),
            new Node("literal", "comma", 1, 1, [], ","),
            new Node("regex", "number", 2, 2, [], "2"),
            new Node("literal", "comma", 3, 3, [], ","),
            new Node("regex", "number", 4, 4, [], "3"),
        ]);

        expect(result).toEqual(expected);
        expect(cursor.hasError).toBeFalsy();

        cursor = new Cursor("1,2,3,4");
        result = numbers.parse(cursor);
        expected = new Node("finite-repeat", "numbers", 0, 4, [
            new Node("regex", "number", 0, 0, [], "1"),
            new Node("literal", "comma", 1, 1, [], ","),
            new Node("regex", "number", 2, 2, [], "2"),
            new Node("literal", "comma", 3, 3, [], ","),
            new Node("regex", "number", 4, 4, [], "3"),
        ]);

        expect(result).toEqual(expected);
        expect(cursor.hasError).toBeFalsy();
    });

    test("Bounds Are Equal With Divider", () => {
        const divider = new Literal("comma", ",");
        const numbers = new FiniteRepeat("numbers", new Regex("number", "\\d"), 3, { divider, min: 3 });

        let cursor = new Cursor("1,");
        let result = numbers.parse(cursor);
        let expected: Node | null = null;
        expect(result).toBeNull();
        expect(cursor.hasError).toBeTruthy();

        cursor = new Cursor("1,2");
        result = numbers.parse(cursor);
        expected = null;

        expect(result).toEqual(expected);
        expect(cursor.hasError).toBeTruthy();

        cursor = new Cursor("1,2,3,");
        result = numbers.parse(cursor);
        expected = new Node("finite-repeat", "numbers", 0, 4, [
            new Node("regex", "number", 0, 0, [], "1"),
            new Node("literal", "comma", 1, 1, [], ","),
            new Node("regex", "number", 2, 2, [], "2"),
            new Node("literal", "comma", 3, 3, [], ","),
            new Node("regex", "number", 4, 4, [], "3"),
        ]);

        expect(result).toEqual(expected);
        expect(cursor.hasError).toBeFalsy();

        cursor = new Cursor("1,2,3,4");
        result = numbers.parse(cursor);
        expected = new Node("finite-repeat", "numbers", 0, 4, [
            new Node("regex", "number", 0, 0, [], "1"),
            new Node("literal", "comma", 1, 1, [], ","),
            new Node("regex", "number", 2, 2, [], "2"),
            new Node("literal", "comma", 3, 3, [], ","),
            new Node("regex", "number", 4, 4, [], "3"),
        ]);

        expect(result).toEqual(expected);
        expect(cursor.hasError).toBeFalsy();
    });

    test("Test", () => {
        const numbers = new FiniteRepeat("numbers", new Regex("number", "\\d"), 3);
        const result = numbers.test("1");

        expect(result).toBeTruthy();
    });

    test("Exec", () => {
        const numbers = new FiniteRepeat("numbers", new Regex("number", "\\d"), 3);
        const result = numbers.exec("1");

        expect(result.ast).not.toBeNull();
        expect(result.cursor.hasError).toBeFalsy();
    });

    test("Fail", () => {
        const numbers = new FiniteRepeat("numbers", new Regex("number", "\\d"), 3);
        const result = numbers.exec("f");

        expect(result.ast).toBeNull();
        expect(result.cursor.hasError).toBeTruthy();
    });

    test("Optional", () => {
        const numbers = new FiniteRepeat("numbers", new Regex("number", "\\d"), 3, { min: 0 });
        const result = numbers.exec("f");

        expect(result.ast).toBeNull();
        expect(result.cursor.hasError).toBeFalsy();
    });

    test("Optional With Multiple Matches But Still Below Min", () => {
        const numbers = new FiniteRepeat("numbers", new Regex("number", "\\d"), 3, { min: 0 });
        const result = numbers.exec("12f");

        expect(result.ast).toBeNull();
        expect(result.cursor.hasError).toBeFalsy();
    });

    test("Properties", () => {
        const numbers = new FiniteRepeat("numbers", new Regex("number", "\\d"), 3, { min: 0 });

        expect(numbers.type).toBe("finite-repeat");
        expect(numbers.name).toBe("numbers");
        expect(numbers.parent).toBeNull();
        expect(numbers.children.length).toBe(3);
        expect(numbers.min).toBe(0);
        expect(numbers.max).toBe(3);
        expect(numbers.isOptional).toBeTruthy();
    });

    test("Clone", () => {
        const numbers = new FiniteRepeat("numbers", new Regex("number", "\\d"), 3, { min: 0 });
        const clone = numbers.clone() as FiniteRepeat;

        expect(clone.type).toBe(numbers.type);
        expect(clone.name).toBe(numbers.name);
        expect(clone.parent).toBeNull();
        expect(clone.children.length).toBe(numbers.children.length);
        expect(clone.min).toBe(numbers.min);
        expect(clone.max).toBe(numbers.max);
        expect(clone.isOptional).toBe(numbers.isOptional);
    });

    test("Clone With Custom Overrides", () => {
        const numbers = new FiniteRepeat("numbers", new Regex("number", "\\d"), 3, { min: 0 });
        const clone = numbers.clone("clone-numbers", false) as FiniteRepeat;

        expect(clone.type).toBe(numbers.type);
        expect(clone.name).toBe("clone-numbers");
        expect(clone.parent).toBeNull();
        expect(clone.children.length).toBe(numbers.children.length);
        expect(clone.min).toBe(1);
        expect(clone.max).toBe(3);
        expect(clone.isOptional).toBe(false);
    });

    test("Get Tokens", () => {
        const numbers = new FiniteRepeat(
            "numbers",
            new Literal("one", "1"),
            3,
            {
                divider: new Literal("comma", ","),
                min: 0
            });

        const tokens = numbers.getTokens();

        expect(tokens).toEqual(["1"]);
    });

    test("Get Tokens After Without Parent", () => {
        const numbers = new FiniteRepeat(
            "numbers",
            new Literal("one", "1"),
            2,
            {
                divider: new Literal("comma", ","),
                min: 0
            });

        let child = numbers.children[0];
        let tokens = numbers.getTokensAfter(child);

        expect(tokens).toEqual([","]);

        child = numbers.children[2];
        tokens = numbers.getTokensAfter(child);

        expect(tokens).toEqual([]);

        child = numbers.children[3];
        tokens = numbers.getTokensAfter(child);

        expect(tokens).toEqual([]);

    });

    test("Get Tokens After With Parent", () => {
        const numbers = new FiniteRepeat(
            "numbers",
            new Literal("one", "1"),
            2,
            {
                divider: new Literal("comma", ","),
                min: 0
            });

        const parent = new And("parent", [numbers, new Literal("b", "B")]);
        const numbersClone = parent.children[0];
        let child = numbersClone.children[0];
        let tokens = numbersClone.getTokensAfter(child);

        expect(tokens).toEqual([","]);

        child = numbersClone.children[2];
        tokens = numbersClone.getTokensAfter(child);

        expect(tokens).toEqual(["B"]);

        child = numbersClone.children[3];
        tokens = numbersClone.getTokensAfter(child);

        expect(tokens).toEqual([]);

    });

    test("Get Next Tokens", () => {
        const numbers = new FiniteRepeat(
            "numbers",
            new Literal("one", "1"),
            2,
            {
                divider: new Literal("comma", ","),
                min: 0
            });

        const parent = new And("parent", [numbers, new Literal("b", "B")]);
        const numbersClone = parent.children[0];
        const tokens = numbersClone.getNextTokens();


        expect(tokens).toEqual(["B"])
    });

    test("Get Next Tokens Without Parent", () => {
        const numbers = new FiniteRepeat(
            "numbers",
            new Literal("one", "1"),
            2,
            {
                divider: new Literal("comma", ","),
                min: 0
            });

        const tokens = numbers.getNextTokens();


        expect(tokens).toEqual([])
    });

    test("Get Patterns", () => {
        const numbers = new FiniteRepeat(
            "numbers",
            new Literal("one", "1"),
            2,
            {
                divider: new Literal("comma", ","),
                min: 0
            });

        const patterns = numbers.getPatterns();

        expect(patterns).toEqual([numbers.children[0]])
    });

});