import { patterns } from "./patterns";

describe("Patterns String Template Literal", () => {
    test("Baseline", () => {
        const { fullName } = patterns`
        first-name = "John"
        last-name = "Doe"
        space = /\\s+/
        full-name = first-name + space + last-name
        `;

        const result = fullName.exec("John Doe");
        expect(result?.ast?.value).toBe("John Doe");
    });

    test("Simple Markup", () => {
        const { body } = patterns`
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
        result && result.ast && result.ast.findAll(n => n.name.includes("space")).forEach(n => n.remove());
        expect(result?.ast?.value).toBe("<div><div></div><div></div></div>");
    });

    test("Expression Pattern", () => {
        const { expr } = patterns`
        integer = /\\d+/
        operator = "+" | "-" | "*" | "/"
        unary-operator = "+" | "-"
        postfix-operator = "++" | "--"
        binary-expr = expr + operator + expr
        unary-expr = unary-operator + expr
        postfix-expr = expr + postfix-operator
        expr = postfix-expr | unary-expr | binary-expr | integer
        `;

        const result = expr.exec("-10++");
        const ast = result?.ast;

        expect(ast?.name).toBe("unary-expr");

        expect(ast?.children[0].type).toBe("literal");
        expect(ast?.children[0].name).toBe("-");
        expect(ast?.children[0].value).toBe("-");

        expect(ast?.children[1].type).toBe("expression");
        expect(ast?.children[1].name).toBe("postfix-expr");
        expect(ast?.children[1].value).toBe("10++");

        expect(ast?.children[1].children[0].type).toBe("regex");
        expect(ast?.children[1].children[0].name).toBe("integer");
        expect(ast?.children[1].children[0].value).toBe("10");

        expect(ast?.children[1].children[1].type).toBe("literal");
        expect(ast?.children[1].children[1].name).toBe("++");
        expect(ast?.children[1].children[1].value).toBe("++");

        expect(result?.ast?.value).toBe("-10++");
    });
});