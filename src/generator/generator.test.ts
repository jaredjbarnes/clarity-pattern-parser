import { patterns } from "../grammar/patterns";
import { Generator } from "./generator";
import { TypescriptVisitor } from "./typescriptVisitor";

describe("generator", () => {
    test("Every Pattern", () => {
        const { expression } = patterns`
            john = "John"
            names = john | "Jane"
            space = /\\s+/
            comma = /\\s*,\\s*/
            item = names | array
            items = (item, comma)+
            array = "[" + space? + items? + space? + "]"
            prefix-expression = "pre" + expression
            postfix-expression = expression + "post"
            infix-expression = expression + " and " + expression
            expression = prefix-expression | postfix-expression | infix-expression | item
            take-until = ? -> | "</script"
        `;

        const visitor = new TypescriptVisitor();
        const result = new Generator(visitor).generate(expression);
        expect(result).toBe(result);

    });
});

