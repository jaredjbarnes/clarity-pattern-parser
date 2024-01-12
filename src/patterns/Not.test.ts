import { Cursor } from "./Cursor";
import { Literal } from "./Literal";
import { Not } from "./Not";

describe("Not", () => {
    test("Parse Successfully", () => {
        const a = new Literal("a", "A");
        const notA = new Not(a);
        const cursor = new Cursor("B");
        const result = notA.parse(cursor);

        expect(result).toBeNull();
        expect(cursor.hasError).toBeFalsy();
    });

    test("Parse Failed", () => {
        const a = new Literal("a", "A");
        const notA = new Not(a);
        const cursor = new Cursor("A");
        const result = notA.parse(cursor);

        expect(result).toBeNull();
        expect(cursor.hasError).toBeTruthy();
    });

    test("Clone", () => {
        const a = new Literal("a", "A");
        const notA = new Not(a);
        const clone = notA.clone();

        expect(clone.name).toBe("not-a");
        expect(clone).not.toBe(notA)
    });

    test("Tokens", () => {
        const a = new Literal("a", "A");
        const notA = new Not(a);
        const tokens = notA.getTokens();
        const nextTokens = notA.getNextTokens(new Literal("bogus", "bogus"))
        const emptyArray: string[] = [];

        expect(tokens).toEqual(emptyArray);
        expect(nextTokens).toEqual(emptyArray);
    });

    test("Properties", () => {
        const a = new Literal("a", "A");
        const notA = new Not(a);

        expect(notA.type).toBe("not");
        expect(notA.name).toBe("not-a");
        expect(notA.parent).toBeNull();
        expect(notA.children[0].name).toBe("a");
        expect(notA.isOptional).toBeFalsy();
    });

    test("Not A Not", ()=>{
        const a = new Literal("a", "A");
        const notA = new Not(a);
        const notnotA = new Not(notA);

        const cursor = new Cursor("A");
        const result = notnotA.parse(cursor);

        expect(result).toBeNull();
        expect(cursor.hasError).toBeFalsy();
    });

    test("Parse Text", ()=>{
        const a = new Literal("a", "A");
        const notA = new Not(a);
        const { ast: result } = notA.parseText("A");

        expect(result).toBeNull();
    });
});