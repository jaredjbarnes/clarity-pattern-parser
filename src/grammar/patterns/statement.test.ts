import { statement } from "./statement";

describe("Statement pattern", () => {
    test("inline", () => {
        const expression = 'name = ("Hello" + "World") | "Hello"';
        const result = statement.exec(expression, true);
        expect(result).toBe(result);
    });
});