import { statement } from "./statement";

describe("Statement pattern", () => {
    test("inline", () => {
        const expression = 'name = pattern1 + pattern';
        const result = statement.exec(expression, true);
        expect(result).toBe(result);
    });
});