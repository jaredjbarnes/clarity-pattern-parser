import { FiniteRepeat } from "./FiniteRepeat";
import { Cursor } from "./Cursor";
import { Regex } from "./Regex";
import { Node } from "../ast/Node";

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
        const numbers = new FiniteRepeat("numbers", new Regex("number", "\\d"), 3, { min: 2 });

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
    });

    test("Bounds Are Equal With Divider", () => {
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


});