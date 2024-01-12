import { Cursor } from "./Cursor";
import { Node } from "../ast/Node";
import { Literal } from "./Literal";
import { Or } from "./Or";

describe("Or", () => {
    test("Empty Options", () => {
        expect(() => {
            new Or("bad", []);
        }).toThrowError();
    });

    test("One Option Successful", () => {
        const a = new Or("a", [new Literal("a", "A")]);
        const cursor = new Cursor("A");
        const result = a.parse(cursor);
        const expected = new Node("or", "a", 0, 0, [
            new Node("literal", "a", 0, 0, [], "A")
        ], "A");

        expect(result).toEqual(expected);
    });

    test("One Option Failed", () => {
        const a = new Or("a", [new Literal("a", "A")]);
        const cursor = new Cursor("B");
        const result = a.parse(cursor);

        expect(result).toEqual(null);
        expect(cursor.index).toBe(0);
        expect(cursor.hasError).toBeTruthy();
    });

    test("Two Option", () => {
        const a = new Or("a-b", [new Literal("a", "A"), new Literal("b", "B")]);
        const cursor = new Cursor("AB");
        let result = a.parse(cursor);
        let expected = new Node("or", "a-b", 0, 0, [
            new Node("literal", "a", 0, 0, [], "A")
        ], "A");

        expect(result).toEqual(expected);

        cursor.next();

        result = a.parse(cursor);
        expected = new Node("or", "a-b", 0, 0, [
            new Node("literal", "b", 0, 0, [], "B")
        ], "B");
    });

    test("Failed (Optional)", () => {
        const a = new Or("a", [new Literal("a", "A")], true);
        const cursor = new Cursor("B");
        const result = a.parse(cursor);

        expect(result).toBeNull();
        expect(cursor.hasError).toBeFalsy();
    });

    test("Ast Reduction", () => {
        const a = new Or("a", [new Literal("a", "A")], true);
        const cursor = new Cursor("A");
        a.enableAstReduction();

        let result = a.parse(cursor);
        let expected = new Node("or", "a", 0, 0, [], "A");

        expect(result).toEqual(expected);

        a.disableAstReduction();

        result = a.parse(cursor);
        expected = new Node("or", "a", 0, 0, [
            new Node("literal", "a", 0, 0, [], "A")
        ], "A");

        expect(result).toEqual(expected);
    });
});