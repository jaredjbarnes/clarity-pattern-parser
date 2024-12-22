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

    test("Simple Markup", ()=>{
        const {openTag} = patterns`
        tag-name = /[a-zA-Z_-]+[a-zA-Z0-9_-]*/
        space = /\\s+/
        open-tag = ("<" + tag-name + space? + ">")
        `;

        debugger;
        const result = openTag.exec("<div>", true);
        expect(result?.ast?.value).toBe("<div>");
    });
});