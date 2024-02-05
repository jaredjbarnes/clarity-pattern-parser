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
            `\nliteral = "Literal"\n` +
            `\n` +
            ` \n` +
            `#comment    \n` +
            `regex = /\\s+,\\s+/\n` +
            `\t\n` +
            `and = !literal & regex? & literal\n` +
            `or = literal | regex\n\n` +
            `repeat = literal*\n` +
            `optionalRepeat = literal* regex\n` +
            `repeat = literal+ regex\n` +
            `repeat-bounds = literal{2,3} regex\n` +
            `optional-repeat-upper-bounds = literal{,3} regex\n` +
            `repeat-lower-bounds = literal{2,} regex\n` +
            `repeat-exactly = literal{2} regex\n` +
            `optional-repeat-pattern = literal? regex\n\n` +
            `trim-repeat-pattern = literal? regex -t`;

        const result = grammar.exec(text);
        result.ast?.
            findAll(n => n.name === "spaces" || n.name === "optional-spaces" || n.name === "new-line" || n.name === "whitespace").
            forEach(n => n.remove())
    });
});