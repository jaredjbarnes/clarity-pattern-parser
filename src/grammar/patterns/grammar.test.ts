import { grammar } from "./grammar";

describe("Grammer", () => {
    test("Single Line", () => {
        const result = grammar.exec(`literal = "Literal"`);
        expect(result.ast?.value).toBe(`literal = "Literal"`);
    });

    test("Multiple Lines", () => {
        const text =
            `literal = "Literal"\n` +
            `regex = /\\s+,\\s+/`;

        const result = grammar.exec(text);
    });

    test("All Patterns", () => {
        const text =
            `literal = "Literal"\n` +
            `\n` +
            ` \n` +
            `#comment    \n` +
            `regex = /\\s+,\\s+/\n` +
            `\t\n` +
            `and = !literal & regex? & literal\n` +
            `or = literal | regex\n` +
            `optionalRepeat = literal* regex\n` +
            `repeat = literal+ regex\n` +
            `repeatBounds = literal{2,3} regex\n` +
            `optionalRepeatUpperBounds = literal{,3} regex\n` +
            `repeatLowerBounds = literal{2,} regex\n` +
            `repeatExactly = literal{2} regex`;

        const result = grammar.exec(text);
        result.ast?.
            findAll(n => n.name === "spaces" || n.name === "optional-spaces" || n.name === "new-line" || n.name === "whitespace").
            forEach(n => n.remove())
    });
});