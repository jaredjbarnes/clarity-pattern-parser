import { Node } from "../ast/Node";
import { Sequence } from "./Sequence";
import { arePatternsEqual } from "./arePatternsEqual";
import { Cursor } from "./Cursor";
import { InfiniteRepeat } from "./InfiniteRepeat";
import { Literal } from "./Literal";
import { Pattern } from "./Pattern";
import { Regex } from "./Regex";
import { Repeat } from "./Repeat";

// To Check all behavior look at FiniteRepeat and InfiniteRepeat.
describe("Repeat", () => {
    test("Finite Repeat Without Min", () => {
        const number = new Regex("number", "\\d");
        const finiteRepeat = new Repeat("numbers", number, { max: 2 });

        let cursor = new Cursor("f");
        let result = finiteRepeat.parse(cursor);
        let expected: Node | null = null;

        expect(result).toBe(expected);
        expect(cursor.hasError).toBeTruthy();

        cursor = new Cursor("1");
        result = finiteRepeat.parse(cursor);
        expected = new Node("finite-repeat", "numbers", 0, 0, [
            new Node("regex", "number", 0, 0, [], "1")
        ]);

        expect(result?.toJson()).toEqual(expected.toJson());
        expect(cursor.hasError).toBeFalsy();

        cursor = new Cursor("12");
        result = finiteRepeat.parse(cursor);
        expected = new Node("finite-repeat", "numbers", 0, 1, [
            new Node("regex", "number", 0, 0, [], "1"),
            new Node("regex", "number", 1, 1, [], "2")
        ]);

        expect(result?.toJson()).toEqual(expected.toJson());
        expect(cursor.hasError).toBeFalsy();

        cursor = new Cursor("123");
        result = finiteRepeat.parse(cursor);
        expected = new Node("finite-repeat", "numbers", 0, 1, [
            new Node("regex", "number", 0, 0, [], "1"),
            new Node("regex", "number", 1, 1, [], "2")
        ]);

        expect(result?.toJson()).toEqual(expected.toJson());
        expect(cursor.hasError).toBeFalsy();
        expect(cursor.index).toBe(1);
    });

    test("Finite Repeat With Min", () => {
        const number = new Regex("number", "\\d");
        const finiteRepeat = new Repeat("numbers", number, { max: 2, min: 2 });

        let cursor = new Cursor("f");
        let result = finiteRepeat.parse(cursor);
        let expected: Node | null = null;

        expect(result).toBe(expected);
        expect(cursor.hasError).toBeTruthy();

        cursor = new Cursor("1");
        result = finiteRepeat.parse(cursor);
        expected = null;

        expect(result).toEqual(expected);
        expect(cursor.hasError).toBeTruthy();

        cursor = new Cursor("12");
        result = finiteRepeat.parse(cursor);
        expected = new Node("finite-repeat", "numbers", 0, 1, [
            new Node("regex", "number", 0, 0, [], "1"),
            new Node("regex", "number", 1, 1, [], "2")
        ]);

        expect(result?.toJson()).toEqual(expected.toJson());
        expect(cursor.hasError).toBeFalsy();

        cursor = new Cursor("123");
        result = finiteRepeat.parse(cursor);
        expected = new Node("finite-repeat", "numbers", 0, 1, [
            new Node("regex", "number", 0, 0, [], "1"),
            new Node("regex", "number", 1, 1, [], "2")
        ]);

        expect(result?.toJson()).toEqual(expected.toJson());
        expect(cursor.hasError).toBeFalsy();
        expect(cursor.index).toBe(1);
    });

    test("Finite Repeat Get Tokens", () => {
        const number = new Literal("number", "1");
        const repeat = new Repeat("numbers", number);
        const numberClone = repeat.find(p => p.name === "number") as Pattern;

        let tokens = repeat.getTokens();
        let expected = ["1"];

        expect(tokens).toEqual(expected);

        tokens = repeat.getNextTokens();
        expected = [];

        expect(tokens).toEqual(expected);

        tokens = repeat.getTokensAfter(numberClone);
        expected = [];

        expect(tokens).toEqual(expected);
    });

    test("Get Tokens After", () => {
        const number = new Literal("number", "1");
        const repeat = new Repeat("numbers", number);
        const parent = new Sequence("parent", [repeat, new Literal("b", "B")]);
        const numberClone = parent.find(p => p.name === "number") as Pattern;
        const repeatClone = parent.children[0];

        let tokens = repeatClone.getTokensAfter(numberClone);
        let expected = ["B"];

        expect(tokens).toEqual(expected);
    });

    test("Get Next Tokens", () => {
        const number = new Literal("number", "1");
        const repeat = new Repeat("numbers", number);
        const parent = new Sequence("parent", [repeat, new Literal("b", "B")]);
        const repeatClone = parent.children[0];

        let tokens = repeatClone.getNextTokens();
        let expected = ["B"];

        expect(tokens).toEqual(expected);
    });

    test("Get Next Patterns", () => {
        const number = new Literal("number", "1");
        const repeat = new Repeat("numbers", number);
        const parent = new Sequence("parent", [repeat, new Literal("b", "B")]);
        const repeatClone = parent.children[0];
        const bClone = parent.find(p => p.name === "b") as Pattern;

        let patterns = repeatClone.getNextPatterns();
        let expected = [bClone];

        expect(patterns).toEqual(expected);
    });

    test("Repeat Get Patterns", () => {
        const number = new Literal("number", "1");
        const repeat = new Repeat("numbers", number);
        const numberClone = repeat.find(p => p.name === "number") as Pattern;

        let patterns = repeat.getPatterns();
        let expected = [numberClone];

        expect(patterns).toEqual(expected);

        patterns = repeat.getNextPatterns();
        expected = [];

        expect(patterns).toEqual(expected);

        patterns = repeat.getPatternsAfter(numberClone);
        expected = [];

        expect(patterns).toEqual(expected);
    });

    test("Repeat Properties", () => {
        const number = new Literal("number", "1");
        const repeat = new Repeat("numbers", number);

        expect(repeat.type).toBe("infinite-repeat");
        expect(repeat.name).toBe("numbers");
        expect(repeat.parent).toBeNull();
    });

    test("test", () => {
        const number = new Literal("number", "1");
        const repeat = new Repeat("numbers", number);
        let result = repeat.test("1");
        let expected = true;

        expect(result).toBe(expected);

        result = repeat.test("g");
        expected = false;

        expect(result).toBe(expected);
    });

    test("Repeat Clone", () => {
        const number = new Literal("number", "1");
        const repeat = new Repeat("numbers", number);

        let repeatClone = repeat.clone();
        let expected = new Repeat("numbers", number);

        expect(arePatternsEqual(repeatClone, expected)).toBeTruthy();

        repeatClone = repeat.clone("new-name");
        expected = new Repeat("new-name", number);

        expect(arePatternsEqual(repeatClone, expected)).toBeTruthy();
    });
});