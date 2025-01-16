import { Cursor } from "./Cursor";
import { Node } from "../ast/Node";
import { Literal } from "./Literal";
import { Options } from "./Options";
import { Sequence } from "./Sequence";
import { Pattern } from "./Pattern";
import { Optional } from "./Optional";
import { Regex } from "./Regex";
import { Reference } from "./Reference";

describe("Options", () => {
    test("Empty Options", () => {
        expect(() => {
            new Options("bad", []);
        }).toThrowError();
    });

    test("One Option Successful", () => {
        const a = new Options("a", [new Literal("a", "A")]);
        const cursor = new Cursor("A");
        const result = a.parse(cursor);
        const expected = new Node("literal", "a", 0, 0, [], "A")

        expect(result).toEqual(expected);
    });

    test("One Option Failed", () => {
        const a = new Options("a", [new Literal("a", "A")]);
        const cursor = new Cursor("B");
        const result = a.parse(cursor);

        expect(result).toEqual(null);
        expect(cursor.index).toBe(0);
        expect(cursor.hasError).toBeTruthy();
    });

    test("Two Option", () => {
        const a = new Options("a-b", [new Literal("a", "A"), new Literal("b", "B")]);
        const cursor = new Cursor("AB");
        let result = a.parse(cursor);
        let expected = new Node("literal", "a", 0, 0, [], "A")

        expect(result).toEqual(expected);

        cursor.next();

        result = a.parse(cursor);
        expected = new Node("options", "a-b", 0, 0, [
            new Node("literal", "b", 0, 0, [], "B")
        ], "B");
    });

    test("Get Tokens", () => {
        const aOrB = new Options("a-b", [new Literal("a", "A"), new Literal("b", "B")]);
        const tokens = aOrB.getTokens();
        const expected = ["A", "B"];

        expect(tokens).toEqual(expected);
    });

    test("Get Tokens After", () => {
        const a = new Options("a", [new Literal("a", "A")]);
        const parent = new Sequence("parent", [a, new Literal("b", "B")]);
        const tokens = parent.children[0].getTokensAfter(parent.children[0].children[0]);
        const expected = ["B"];

        expect(tokens).toEqual(expected);
    });

    test("Get Tokens After Without A Parent", () => {
        const a = new Options("a", [new Literal("a", "A")]);
        const tokens = a.getTokensAfter(a.children[0]);
        const expected: string[] = [];

        expect(tokens).toEqual(expected);
    });

    test("Properties", () => {
        const a = new Options("a", [new Literal("a", "A")]);

        expect(a.type).toBe("options");
        expect(a.name).toBe("a");
        expect(a.parent).toBeNull();
        expect(a.children[0].name).toBe("a");
    });

    test("Exec", () => {
        const a = new Options("a", [new Literal("a", "A")]);
        const { ast: result } = a.exec("B");
        expect(result).toBeNull();
    });

    test("Test No Match", () => {
        const a = new Options("a", [new Literal("a", "A")]);
        const result = a.test("B");
        expect(result).toBeFalsy();
    });

    test("Test With Match", () => {
        const a = new Options("a", [new Literal("a", "A")]);
        const result = a.test("A");
        expect(result).toBeTruthy();
    });

    test("Get Next Tokens", () => {
        const sequence = new Sequence("sequence", [
            new Options("a-or-b", [
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
        const or = new Options("a-or-b", [
            new Literal("a", "A"),
            new Literal("b", "B")
        ])

        const tokens = or.getNextTokens();
        expect(tokens.length).toBe(0);
    });


    test("Get Tokens After", () => {
        const sequence = new Sequence("sequence", [
            new Options("a-or-b", [
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
        const aOrB = new Options("a-b", [new Literal("a", "A"), new Literal("b", "B")]);
        const patterns = aOrB.getPatterns();
        const expected = [
            aOrB.find(p => p.name === "a"),
            aOrB.find(p => p.name === "b")
        ];

        expect(patterns).toEqual(expected);
    });

    test("Get Patterns After", () => {
        const sequence = new Sequence("sequence", [
            new Options("a-or-b", [
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
        const or = new Options("a-or-b", [
            new Literal("a", "A"),
            new Literal("b", "B")
        ])
        const aClone = or.find(p => p.name === "a") as Pattern;
        const patterns = or.getPatternsAfter(aClone);

        expect(patterns.length).toBe(0);
    });

    test("Get Next Patterns", () => {
        const sequence = new Sequence("sequence", [
            new Options("a-or-b", [
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
        const or = new Options("a-or-b", [
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

        const firstName = new Options("first-name", [john, jane], true);
        const lastName = new Options("last-name", [doe, smith], true);
        const johnJohnson = new Literal("john-johnson", "John Johnson");
        const fullName = new Sequence("full-name", [firstName, space, lastName]);
        const names = new Options("names", [fullName, johnJohnson], true);

        const result = names.exec("John Johnson");
        expect(result.ast?.value).toBe("John Johnson");
    });

    test("Greedy With Match First", () => {
        const john = new Literal("john", "John");
        const doe = new Literal("doe", "Doe");
        const jane = new Literal("jane", "Jane");
        const smith = new Literal("smith", "Smith");
        const space = new Literal("space", " ");

        const firstName = new Options("first-name", [john, jane], true);
        const lastName = new Options("last-name", [doe, smith], true);
        const johnJohnson = new Literal("john-johnson", "John Johnson");
        const fullName = new Sequence("full-name", [firstName, space, lastName]);
        const names = new Options("names", [johnJohnson, fullName], true);

        const result = names.exec("John Johnson");
        expect(result.ast?.value).toBe("John Johnson");
    });

    test("Greedy With Match In Middle", () => {
        const john = new Literal("john", "John");
        const doe = new Literal("doe", "Doe");
        const jane = new Literal("jane", "Jane");
        const smith = new Literal("smith", "Smith");
        const space = new Literal("space", " ");

        const firstName = new Options("first-name", [john, jane], true);
        const lastName = new Options("last-name", [doe, smith], true);
        const johnJohnson = new Literal("john-johnson", "John Johnson");
        const johnStockton = new Literal("john-stockton", "John Stockton");
        const fullName = new Sequence("full-name", [firstName, space, lastName]);
        const names = new Options("names", [johnStockton, johnJohnson, fullName], true);

        const result = names.exec("John Johnson");
        expect(result.ast?.value).toBe("John Johnson");
    });

    // This doesn't make sense, but every pattern needs to handle a null result with no error.
    test("Optional option", () => {
        const john = new Optional("optional-john", new Literal("john", "John"));
        const jane = new Literal("jane", "Jane");

        const firstName = new Options("first-name", [john, jane], true);

        const result = firstName.exec("Jane");
        expect(result.ast?.value).toBe("Jane");
    });

    test("Cyclical Error Recorvery", () => {
        const john = new Literal("john", "John");
        const jane = new Literal("jane", "Jane");
        const names = new Options("names", [john, jane]);
        const questionMark = new Literal("?", "?");
        const colon = new Literal(":", ":");
        const space = new Regex("space", "\\s+");
        const expressionReference = new Reference("expression");
        const ternary = new Sequence("ternary", [expressionReference, space, questionMark, space, expressionReference, space, colon, space, expressionReference]);
        const expression = new Options("expression", [names, ternary], true);

        let result = expression.exec("John");
        expect(result.ast?.toString()).toBe("John");

        result = expression.exec("John ? Jane : John");
        expect(result.ast?.toString()).toBe("John ? Jane : John");

        result = expression.exec("John ? John ? Jane : John ? Jane : John : John");
        expect(result.ast?.toString()).toBe("John ? John ? Jane : John ? Jane : John : John");
    });

    test("Deeper Cyclical Error Recorvery", () => {
        const john = new Literal("john", "John");
        const expressionReference = new Reference("expression");

        const johns = new Sequence("johns", [john, expressionReference]);
        const expression = new Options("expression", [
            john,
            johns,
        ], true);

        let result = expression.exec("John");
        expect(result.ast?.toString()).toBe("John");

        result = expression.exec("JohnJohnJohnJohnJohn");
        expect(result.ast?.toString()).toBe("JohnJohnJohnJohnJohn");
    });
});