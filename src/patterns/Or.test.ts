import { Cursor } from "./Cursor";
import { Node } from "../ast/Node";
import { Literal } from "./Literal";
import { Or } from "./Or";
import { And } from "./And";
import { Pattern } from "./Pattern";

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
        const expected = new Node("literal", "a", 0, 0, [], "A")

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
        let expected = new Node("literal", "a", 0, 0, [], "A")

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

    test("Get Tokens", () => {
        const aOrB = new Or("a-b", [new Literal("a", "A"), new Literal("b", "B")]);
        const tokens = aOrB.getTokens();
        const expected = ["A", "B"];

        expect(tokens).toEqual(expected);
    });

    test("Get Tokens After", () => {
        const a = new Or("a", [new Literal("a", "A")]);
        const parent = new And("parent", [a, new Literal("b", "B")]);
        const tokens = parent.children[0].getTokensAfter(parent.children[0].children[0]);
        const expected = ["B"];

        expect(tokens).toEqual(expected);
    });

    test("Get Tokens After Without A Parent", () => {
        const a = new Or("a", [new Literal("a", "A")]);
        const tokens = a.getTokensAfter(a.children[0]);
        const expected: string[] = [];

        expect(tokens).toEqual(expected);
    });

    test("Properties", () => {
        const a = new Or("a", [new Literal("a", "A")]);

        expect(a.type).toBe("or");
        expect(a.name).toBe("a");
        expect(a.isOptional).toBeFalsy();
        expect(a.parent).toBeNull();
        expect(a.children[0].name).toBe("a");
    });

    test("Exec", () => {
        const a = new Or("a", [new Literal("a", "A")]);
        const { ast: result } = a.exec("B");
        expect(result).toBeNull();
    });

    test("Test No Match", () => {
        const a = new Or("a", [new Literal("a", "A")]);
        const result = a.test("B");
        expect(result).toBeFalsy();
    });

    test("Test With Match", () => {
        const a = new Or("a", [new Literal("a", "A")]);
        const result = a.test("A");
        expect(result).toBeTruthy();
    });

    test("Get Next Tokens", () => {
        const sequence = new And("sequence", [
            new Or("a-or-b", [
                new Literal("a", "A"),
                new Literal("b", "B")
            ]),
            new Literal("c", "C")
        ]);

        const orClone = sequence.find(p => p.name === "a-or-b") as Pattern;
        const tokens = orClone.getNextTokens();

        expect(tokens.length).toBe(1);
        expect(tokens[0]).toBe("C");
    });

    test("Get Next Tokens With Null Parent", () => {
        const or = new Or("a-or-b", [
            new Literal("a", "A"),
            new Literal("b", "B")
        ])

        const tokens = or.getNextTokens();
        expect(tokens.length).toBe(0);
    });


    test("Get Tokens After", () => {
        const sequence = new And("sequence", [
            new Or("a-or-b", [
                new Literal("a", "A"),
                new Literal("b", "B")
            ]),
            new Literal("c", "C")
        ]);

        const aClone = sequence.find(p => p.name === "a") as Pattern;
        const orClone = sequence.find(p => p.name === "a-or-b") as Pattern;
        const tokens = orClone.getTokensAfter(aClone);

        expect(tokens.length).toBe(1);
        expect(tokens[0]).toBe("C");
    });

    test("Get Patterns", () => {
        const aOrB = new Or("a-b", [new Literal("a", "A"), new Literal("b", "B")]);
        const patterns = aOrB.getPatterns();
        const expected = [
            aOrB.find(p => p.name === "a"),
            aOrB.find(p => p.name === "b")
        ];

        expect(patterns).toEqual(expected);
    });

    test("Get Patterns After", () => {
        const sequence = new And("sequence", [
            new Or("a-or-b", [
                new Literal("a", "A"),
                new Literal("b", "B")
            ]),
            new Literal("c", "C")
        ]);

        const aClone = sequence.find(p => p.name === "a") as Pattern;
        const orClone = sequence.find(p => p.name === "a-or-b") as Pattern;
        const patterns = orClone.getPatternsAfter(aClone);

        expect(patterns.length).toBe(1);
        expect(patterns[0].name).toBe("c");
    });

    test("Get Patterns After With Null Parent", () => {
        const or = new Or("a-or-b", [
            new Literal("a", "A"),
            new Literal("b", "B")
        ])
        const aClone = or.find(p => p.name === "a") as Pattern;
        const patterns = or.getPatternsAfter(aClone);

        expect(patterns.length).toBe(0);
    });

    test("Get Next Patterns", () => {
        const sequence = new And("sequence", [
            new Or("a-or-b", [
                new Literal("a", "A"),
                new Literal("b", "B")
            ]),
            new Literal("c", "C")
        ]);

        const orClone = sequence.find(p => p.name === "a-or-b") as Pattern;
        const patterns = orClone.getNextPatterns();

        expect(patterns.length).toBe(1);
        expect(patterns[0].name).toBe("c");
    });

    test("Get Next Patterns With Null Parent", () => {
        const or = new Or("a-or-b", [
            new Literal("a", "A"),
            new Literal("b", "B")
        ])
        const patterns = or.getNextPatterns();

        expect(patterns.length).toBe(0);
    });

    test("Greedy With Match Last", () => {
        const john = new Literal("john", "John");
        const doe = new Literal("doe", "Doe");
        const jane = new Literal("jane", "Jane");
        const smith = new Literal("smith", "Smith");
        const space = new Literal("space", " ");

        const firstName = new Or("first-name", [john, jane], false, true);
        const lastName = new Or("last-name", [doe, smith], false, true);
        const johnJohnson = new Literal("john-johnson", "John Johnson");
        const fullName = new And("full-name", [firstName, space, lastName]);
        const names = new Or("names", [fullName, johnJohnson], false, true);

        const result = names.exec("John Johnson");
        expect(result.ast?.value).toBe("John Johnson");
    });

    test("Greedy With Match First", () => {
        const john = new Literal("john", "John");
        const doe = new Literal("doe", "Doe");
        const jane = new Literal("jane", "Jane");
        const smith = new Literal("smith", "Smith");
        const space = new Literal("space", " ");

        const firstName = new Or("first-name", [john, jane], false, true);
        const lastName = new Or("last-name", [doe, smith], false, true);
        const johnJohnson = new Literal("john-johnson", "John Johnson");
        const fullName = new And("full-name", [firstName, space, lastName]);
        const names = new Or("names", [johnJohnson, fullName], false, true);

        const result = names.exec("John Johnson");
        expect(result.ast?.value).toBe("John Johnson");
    });

    test("Greedy With Match In Middle", () => {
        const john = new Literal("john", "John");
        const doe = new Literal("doe", "Doe");
        const jane = new Literal("jane", "Jane");
        const smith = new Literal("smith", "Smith");
        const space = new Literal("space", " ");

        const firstName = new Or("first-name", [john, jane], false, true);
        const lastName = new Or("last-name", [doe, smith], false, true);
        const johnJohnson = new Literal("john-johnson", "John Johnson");
        const johnStockton = new Literal("john-stockton", "John Stockton");
        const fullName = new And("full-name", [firstName, space, lastName]);
        const names = new Or("names", [johnStockton, johnJohnson, fullName], false, true);

        const result = names.exec("John Johnson");
        expect(result.ast?.value).toBe("John Johnson");
    });
});