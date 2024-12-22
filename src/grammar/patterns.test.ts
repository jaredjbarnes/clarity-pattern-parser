import { patterns } from "./patterns";

describe("Patterns String Template Literal", ()=>{
    test("Baseline", ()=>{
        const {fullName} = patterns`
        first-name = "John"
        last-name = "Doe"
        space = /\\s+/
        full-name = first-name + space + last-name
        `;

        const result = fullName.exec("John Doe");
        expect(result?.ast?.value).toBe("John Doe");
    });
});