import { patterns } from "./patterns";

describe("Complex Grammar Tests", () => {
    test("Nested", () => {
        const { expression } = patterns`
                integer = /[0-9]+/
                variable = /[A-Za-z][A-Za-z0-9]*/
                space = /\\s+/
                or-expression = expression + space? + "||" + space? + expression
                mult-expression = expression + space? + "*" + space? + expression 
                expression = or-expression | mult-expression | integer | variable
            `;
        const result = expression.exec("a * b || c");
        expect(result.ast?.toString()).toBe("a * b || c");
    });
});