import { Cursor } from "./Cursor";
import { Regex } from "./Regex";
import { Node } from "../ast/Node"
import { And } from "./And";
import { Literal } from "./Literal";

describe("Regex", () => {
    test("Empty String", () => {
        expect(() => new Regex("empty", "")).toThrowError()
    });

    test("Starts With ^", () => {
        expect(() => new Regex("carrot", "^")).toThrowError()
    });

    test("Ends With $", () => {
        expect(() => new Regex("money", ".$")).toThrowError()
    });

    test("Successful Parse", () => {
        const number = new Regex("number", "\\d");
        const cursor = new Cursor("1");
        const result = number.parse(cursor);
        const expected = new Node("regex", "number", 0, 0, [], "1");

        expect(result).toEqual(expected);
        expect(cursor.hasError).toBeFalsy()
    })

    test("Failed Parse", () => {
        const number = new Regex("number", "\\d");
        const cursor = new Cursor("F");
        const result = number.parse(cursor);

        expect(result).toBeNull();
        expect(cursor.hasError).toBeTruthy()
    });


    test("Get Tokens", () => {
        const a = new Regex("a", "A");

        a.setTokens(["A"]);

        const tokens = a.getTokens();
        const expectedTokens = ["A"];

        expect(tokens).toEqual(expectedTokens);
    });

    test("Get Tokens After", () => {
        const regex = new Regex("a", "A");
        const tokens = regex.getTokensAfter(new Literal("bogus", "bogus"));
        const expected: string[] = [];

        expect(tokens).toEqual(expected)
    });

    test("Properties", () => {
        const regex = new Regex("a", "A");

        expect(regex.type).toBe("regex");
        expect(regex.name).toBe("a");
        expect(regex.parent).toBeNull();
        expect(regex.children).toEqual([]);
    });

    test("Exec", () => {
        const regex = new Regex("a", "A");
        const { ast: result } = regex.exec("B");
        expect(result).toBeNull();
    });
});