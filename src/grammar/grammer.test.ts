import { grammar } from "./grammar";

describe("Grammer", () => {
    test("Single Line", () => {
        const result = grammar.exec(`literal = "Literal"`);
        expect(result.ast?.value).toBe("literal = Literal");
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
            `regex = /\\s+,\\s+/\n` +
            `and = !literal & regex? & literal\n` +
            `or = literal | regex\n` +
            `repeatOptional = literal* regex\n` +
            `repeat = literal+ regex`;

        const result = grammar.exec(text);
    });
});