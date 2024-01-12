import { Cursor, Repeat } from "..";
import { Node } from "../ast/Node";
import { And } from "./And";
import { Literal } from "./Literal";
import { Or } from "./Or";
import { Reference } from "./Reference";
import { Regex } from "./Regex";

function createValuePattern() {
    const number = new Regex("number", "\\d+");
    const openBracket = new Literal("open-bracket", "[");
    const closeBracket = new Literal("close-bracket", "]");
    const divider = new Regex("divider", "\\s*,\\s+");
    const valueRef = new Reference("value");
    const values = new Repeat("values", valueRef, divider);
    const array = new And("array", [openBracket, values, closeBracket]);
    const value = new Or("value", [number, array]);
    return value;
}

describe("Reference", () => {
    test("One Deep Successful Parse", () => {
        const value = createValuePattern();
        const cursor = new Cursor("[1, 2]");
        const result = value.parse(cursor);

        const expected = new Node("or", "value", 0, 5, [
            new Node("and", "array", 0, 5, [
                new Node("literal", "open-bracket", 0, 0, [], "["),
                new Node("repeat", "values", 1, 4, [
                    new Node("or", "value", 1, 1, [
                        new Node("regex", "number", 1, 1, [], "1")
                    ], "1"),
                    new Node("regex", "divider", 2, 3, [], ", "),
                    new Node("or", "value", 4, 4, [
                        new Node("regex", "number", 4, 4, [], "2"),
                    ], "2"),
                ], "1, 2"),
                new Node("literal", "close-bracket", 5, 5, [], "]"),
            ], "[1, 2]")
        ], "[1, 2]");

        expect(result).toEqual(expected);
    });
});