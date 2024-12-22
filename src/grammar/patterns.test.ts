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
        const {body} = patterns`
        tag-name = /[a-zA-Z_-]+[a-zA-Z0-9_-]*/
        space = /\\s+/
        opening-tag = "<" + tag-name + space? + ">"
        closing-tag = "</" + tag-name + space? + ">"
        child = space? + element + space?
        children = (child)*
        element = opening-tag + children + closing-tag
        body = space? + element + space?
        `;

        debugger;
        const result = body.exec(`
        <div>
            <div></div>
            <div></div>    
        </div>
        `, true);
        result && result.ast && result.ast.findAll(n=>n.name.includes("space")).forEach(n=>n.remove());
        expect(result?.ast?.value).toBe("<div></div>");
    });
});