import { patterns } from "../grammar/patterns";
import { Generator } from "./generator";

describe("generator", () => {
    test("Every Pattern", () => {
        const { expression } = patterns`
            names = "John" | "Jane"
            space = /\\s+/
            comma = /\\s*,\\s*/
            item = names | array
            items = (item, comma)+
            array = "[" + space? + items? + space? + "]"
            and-expression = expression + " and " + expression
            expression = and-expression | names
        `;

        const result = new Generator().generate(expression);
        expect(result).toBe(result);

    });
});

