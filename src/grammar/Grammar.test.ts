import { Grammar } from "./Grammar";

describe("Grammar", () => {
    test("Parse", () => {
        const grammar = new Grammar();
        const result = grammar.parse(`
        literal = "Literal"
        literal2 = "Literal-2"
        `);

        expect(result).not.toBeNull();
    });
});