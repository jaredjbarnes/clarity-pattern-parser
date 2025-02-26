import { FiniteRepeat } from "./FiniteRepeat";
import { Cursor } from "./Cursor";
import { Regex } from "./Regex";
import { Node } from "../ast/Node";
import { Literal } from "./Literal";
import { Sequence } from "./Sequence";
import { Optional } from "./Optional";

describe("BoundedRepeat", () => {
    test("Bounds Without Divider", () => {
        const numbers = new FiniteRepeat("numbers", new Regex("number", "\\d"), {
            min: 2,
            max: 3
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

        expect(result?.isEqual(expected)).toBeTruthy();
        expect(cursor.hasError).toBeFalsy();

        cursor = new Cursor("123");
        result = numbers.parse(cursor);
        expected = new Node("finite-repeat", "numbers", 0, 2, [
            new Node("regex", "number", 0, 0, [], "1"),
            new Node("regex", "number", 1, 1, [], "2"),
            new Node("regex", "number", 2, 2, [], "3"),
        ]);

        expect(result?.isEqual(expected)).toBeTruthy();
        expect(cursor.hasError).toBeFalsy();

        cursor = new Cursor("1234");
        result = numbers.parse(cursor);
        expected = new Node("finite-repeat", "numbers", 0, 2, [
            new Node("regex", "number", 0, 0, [], "1"),
            new Node("regex", "number", 1, 1, [], "2"),
            new Node("regex", "number", 2, 2, [], "3"),
        ]);

        expect(result?.isEqual(expected)).toBeTruthy();
        expect(cursor.hasError).toBeFalsy();
        expect(cursor.index).toBe(2);

        cursor = new Cursor("12f");
        result = numbers.parse(cursor);
        expected = new Node("finite-repeat", "numbers", 0, 1, [
            new Node("regex", "number", 0, 0, [], "1"),
            new Node("regex", "number", 1, 1, [], "2"),
        ]);

        expect(result?.isEqual(expected)).toBeTruthy();
        expect(cursor.hasError).toBeFalsy();
    });

    test("Bounds Are Equal Without Divider", () => {
        const numbers = new FiniteRepeat("numbers", new Regex("number", "\\d"), { min: 3, max: 3 });

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

        expect(result?.isEqual(expected)).toBeTruthy();
        expect(cursor.hasError).toBeFalsy();

        cursor = new Cursor("1234");
        result = numbers.parse(cursor);
        expected = new Node("finite-repeat", "numbers", 0, 2, [
            new Node("regex", "number", 0, 0, [], "1"),
            new Node("regex", "number", 1, 1, [], "2"),
            new Node("regex", "number", 2, 2, [], "3"),
        ]);

        expect(result?.isEqual(expected)).toBeTruthy();
        expect(cursor.hasError).toBeFalsy();
        expect(cursor.index).toBe(2);

    });

    test("Bounds With Divider", () => {
        const divider = new Literal("comma", ",");
        const numbers = new FiniteRepeat("numbers", new Regex("number", "\\d"), { divider, min: 2, max: 3, trimDivider: true });

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

        expect(result?.isEqual(expected)).toBeTruthy();
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

        expect(result?.isEqual(expected)).toBeTruthy();
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

        expect(result?.isEqual(expected)).toBeTruthy();
        expect(cursor.hasError).toBeFalsy();
    });

    test("Optional Repeating Pattern", () => {
        const digit = new Optional("optional-digit", new Regex("digit", "\\d+"));
        const divider = new Regex("divider", "\\s");
        const integer = new FiniteRepeat("number", digit, { divider, max: 4 });
        const cursor = new Cursor(
            "\n" +
            "3\n" +
            "\n" +
            "\n"
        );
        const result = integer.parse(cursor);
        const expected = new Node("finite-repeat", "number", 0, 4, [
            new Node("regex", "divider", 0, 0, [], "\n"),
            new Node("regex", "digit", 1, 1, [], "3"),
            new Node("regex", "divider", 2, 2, [], "\n"),
            new Node("regex", "divider", 3, 3, [], "\n"),
            new Node("regex", "divider", 4, 4, [], "\n"),
        ]);

        expect(result?.isEqual(expected)).toBeTruthy();
        expect(cursor.hasError).toBeFalsy();
    });

    test("Bounds Are Equal With Divider", () => {
        const divider = new Literal("comma", ",");
        const numbers = new FiniteRepeat("numbers", new Regex("number", "\\d"), { divider, min: 3, max: 3, trimDivider: true });

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

        expect(result?.isEqual(expected)).toBeTruthy();
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

        expect(result?.isEqual(expected)).toBeTruthy();
        expect(cursor.hasError).toBeFalsy();
    });

    test("Test", () => {
        const numbers = new FiniteRepeat("numbers", new Regex("number", "\\d"), { max: 3 });
        const result = numbers.test("1");

        expect(result).toBeTruthy();
    });

    test("Exec", () => {
        const numbers = new FiniteRepeat("numbers", new Regex("number", "\\d"), { max: 3 });
        const result = numbers.exec("1");

        expect(result.ast).not.toBeNull();
        expect(result.cursor.hasError).toBeFalsy();
    });

    test("Fail", () => {
        const numbers = new FiniteRepeat("numbers", new Regex("number", "\\d"), { max: 3 });
        const result = numbers.exec("f");

        expect(result.ast).toBeNull();
        expect(result.cursor.hasError).toBeTruthy();
    });

    test("Optional", () => {
        const numbers = new FiniteRepeat("numbers", new Optional("optional-number", new Regex("number", "\\d")), { min: 0, max: 3 });
        const result = numbers.exec("f");

        expect(result.ast).toBeNull();
        expect(result.cursor.hasError).toBeTruthy();
    });

    test("Optional With Multiple Matches But Still Below Min", () => {
        const numbers = new FiniteRepeat("numbers", new Regex("number", "\\d"), { min: 0, max: 3 });
        const result = numbers.exec("12f");

        expect(result.ast).toBeNull();
        expect(result.cursor.hasError).toBeTruthy();
    });

    test("Properties", () => {
        const numbers = new FiniteRepeat("numbers", new Regex("number", "\\d"), { min: 1, max: 3 });

        expect(numbers.type).toBe("finite-repeat");
        expect(numbers.name).toBe("numbers");
        expect(numbers.parent).toBeNull();
        expect(numbers.children.length).toBe(3);
        expect(numbers.min).toBe(1);
        expect(numbers.max).toBe(3);
    });

    test("Clone", () => {
        const numbers = new FiniteRepeat("numbers", new Regex("number", "\\d"), { min: 0, max: 3 });
        const clone = numbers.clone() as FiniteRepeat;

        expect(clone.type).toBe(numbers.type);
        expect(clone.name).toBe(numbers.name);
        expect(clone.parent).toBeNull();
        expect(clone.children.length).toBe(numbers.children.length);
        expect(clone.min).toBe(numbers.min);
        expect(clone.max).toBe(numbers.max);
    });

    test("Clone With Custom Overrides", () => {
        const numbers = new FiniteRepeat("numbers", new Regex("number", "\\d"), { min: 0, max: 3 });
        let clone = numbers.clone();
        let expected = new FiniteRepeat("numbers", new Regex("number", "\\d"), { min: 0, max: 3 });

        expect(clone.isEqual(expected)).toBeTruthy();

        clone = numbers.clone("cloned-numbers");
        expected = new FiniteRepeat("cloned-numbers", new Regex("number", "\\d"), { min: 0, max: 3 });

        expect(clone.isEqual(expected)).toBeTruthy();

        clone = numbers.clone("cloned-numbers");
        expected = new FiniteRepeat("cloned-numbers", new Regex("number", "\\d"), { min: 0, max: 3 });

        expect(clone.isEqual(expected)).toBeTruthy();

        clone = numbers.clone("cloned-numbers");
        expected = new FiniteRepeat("cloned-numbers", new Regex("number", "\\d"), { min: 0, max: 3 });

        expect(clone.isEqual(expected)).toBeTruthy();
    });

    test("Get Tokens", () => {
        const numbers = new FiniteRepeat(
            "numbers",
            new Literal("one", "1"),
            {
                divider: new Literal("comma", ","),
                min: 0,
                max: 3
            });

        const tokens = numbers.getTokens();

        expect(tokens).toEqual(["1"]);
    });

    test("Get Tokens After Without Parent", () => {
        const numbers = new FiniteRepeat(
            "numbers",
            new Literal("one", "1"),
            {
                divider: new Literal("comma", ","),
                min: 0,
                max: 2,
                trimDivider: true
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
            {
                divider: new Literal("comma", ","),
                trimDivider: true,
                min: 0,
                max: 2
            });

        const parent = new Sequence("parent", [numbers, new Literal("b", "B")]);
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
            {
                divider: new Literal("comma", ","),
                min: 0,
                max: 2
            }
        );

        const parent = new Sequence("parent", [numbers, new Literal("b", "B")]);
        const numbersClone = parent.children[0];
        const tokens = numbersClone.getNextTokens();


        expect(tokens).toEqual(["B"]);
    });

    test("Get Next Tokens Without Parent", () => {
        const numbers = new FiniteRepeat(
            "numbers",
            new Literal("one", "1"),
            {
                divider: new Literal("comma", ","),
                min: 0,
                max: 2
            }
        );

        const tokens = numbers.getNextTokens();


        expect(tokens).toEqual([]);
    });

    test("Get Patterns", () => {
        const numbers = new FiniteRepeat(
            "numbers",
            new Literal("one", "1"),
            {
                divider: new Literal("comma", ","),
                min: 0,
                max: 2
            }
        );

        const patterns = numbers.getPatterns();

        expect(patterns).toEqual([numbers.children[0]]);
    });

    test("Get Next Patterns Without Parent", () => {
        const numbers = new FiniteRepeat(
            "numbers",
            new Literal("one", "1"),
            {
                divider: new Literal("comma", ","),
                min: 0,
                max: 2
            }
        );

        const patterns = numbers.getNextPatterns();

        expect(patterns).toEqual([]);
    });

    test("Get Next Patterns With Parent", () => {
        const numbers = new FiniteRepeat(
            "numbers",
            new Literal("one", "1"),
            {
                divider: new Literal("comma", ","),
                min: 0,
                max: 2
            }
        );

        const parent = new Sequence("parent", [numbers, new Literal("b", "B")]);
        const numbersClone = parent.children[0];

        const patterns = numbersClone.getNextPatterns();

        expect(patterns).toEqual([parent.children[1]]);
    });

    test("Find Pattern", () => {
        const numbers = new FiniteRepeat(
            "numbers",
            new Literal("one", "1"),
            {
                divider: new Literal("comma", ","),
                min: 0,
                max: 2
            }
        );

        const comma = numbers.find(p => p.name === "comma");
        expect(comma).toBe(numbers.children[1]);
    });

    test("Trim Trailing Complex Delimiter Pattern", () => {
        const numbers = new FiniteRepeat("numbers", new Regex("number", "\\d"), { divider: new Sequence("comma", [new Literal(",", ","), new Literal("space", " ")]), trimDivider: true, max: 3 });
        const result = numbers.parse(new Cursor("1, 2,"));
        expect(result?.value).toBe("1, 2");
    });

});