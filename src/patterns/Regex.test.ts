import { Cursor } from "./Cursor";
import { Regex } from "./Regex";
import { Node } from "../ast/Node"
import { And } from "./And";
import { Literal } from "..";

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

    test("Failed Parse", ()=>{
        const number = new Regex("number", "\\d");
        const cursor = new Cursor("F");
        const result = number.parse(cursor);

        expect(result).toBeNull();
        expect(cursor.hasError).toBeTruthy()
    });


    test("Get Tokens", () => {
        const parent = new And("parent", [
            new Regex("a", "A"),
            new Regex("b", "B")
        ]);

        const a = parent.children[0] as Regex;
        const b = parent.children[1] as Regex;

        a.setTokens(["A"]);
        b.setTokens(["B"]);

        let tokens = a.getTokens();
        let expectedTokens = ["A"];

        expect(tokens).toEqual(expectedTokens);

        a.enableContextualTokenAggregation();

        tokens = a.getTokens();
        expectedTokens = ["AB"];

        expect(tokens).toEqual(expectedTokens);

        a.disableContextualTokenAggregation();

        tokens = a.getTokens();
        expectedTokens = ["A"];

        expect(tokens).toEqual(expectedTokens);
    });

    test("Get Next Tokens", () => {
        const regex = new Regex("a", "A");
        const tokens = regex.getNextTokens(new Literal("bogus", "bogus"));
        const expected: string[] = [];

        expect(tokens).toEqual(expected)
    });

    test("Properties", ()=>{
        const regex = new Regex("a", "A");

        expect(regex.type).toBe("regex");
        expect(regex.name).toBe("a");
        expect(regex.parent).toBeNull();
        expect(regex.children).toEqual([]);
    });
});