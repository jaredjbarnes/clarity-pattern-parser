import { Sequence } from "../patterns/Sequence";
import { Literal } from "../patterns/Literal";
import { Not } from "../patterns/Not";
import { Options } from "../patterns/Options";
import { Pattern } from "../patterns/Pattern";
import { Reference } from "../patterns/Reference";
import { Regex } from "../patterns/Regex";
import { Repeat } from "../patterns/Repeat";
import { Grammar } from "./Grammar";
import { Optional } from "../patterns/Optional";
import { Context } from "../patterns/Context";
import { patterns } from "./patterns";

describe("Grammar", () => {
    test("Literal", () => {
        const expression = `
            name = "John"
        `;

        const patterns = Grammar.parseString(expression);
        const namePattern = patterns["name"];
        const name = new Literal("name", "John");
        const expected = new Context("name", name);

        expect(namePattern.isEqual(expected)).toBeTruthy();
    });

    test("Literal With Escaped Characters", () => {
        const expression = `
            chars = "\\n\\r\\t\\b\\f\\v\\0\\x00\\u0000\\"\\\\"
        `;
        const patterns = Grammar.parseString(expression);
        const namePattern = patterns["chars"];
        const chars = new Literal("chars", "\n\r\t\b\f\v\0\x00\u0000\"\\");
        const expected = new Context('chars', chars);

        expect(namePattern.isEqual(expected)).toBeTruthy();
    });

    test("Literal With Escaped Quotes", () => {
        const expression = `
            content = "With Con\\"tent"
        `;
        const patterns = Grammar.parseString(expression);
        const namePattern = patterns["content"];
        const content = new Literal("content", "With Con\"tent");
        const expected = new Context(`content`, content);

        expect(namePattern.isEqual(expected)).toBeTruthy();
    });

    test("Regex", () => {
        const expression = `
            name = /\\w/
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns["name"];
        const name = new Regex("name", "\\w");
        const expected = new Context(`name`, name);

        expect(pattern.isEqual(expected)).toBeTruthy();
    });

    test("Or", () => {
        const expression = `
            john = "John"
            jane = "Jane"
            names = john | jane
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns["names"];
        const john = new Literal("john", "John");
        const jane = new Literal("jane", "Jane");
        const names = new Options("names", [john, jane], true);
        const expected = new Context("names", names, [john, jane]);

        expect(pattern.isEqual(expected)).toBeTruthy();
    });

    test("And", () => {
        const expression = `
            space = " "
            first-name = /\\w/
            last-name = /\\w/
            full-name = first-name + space + last-name
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns["full-name"];
        const space = new Literal("space", " ");
        const firstName = new Regex("first-name", "\\w");
        const lastName = new Regex("last-name", "\\w");
        const fullName = new Sequence("full-name", [firstName, space, lastName]);
        const expected = new Context("full-name", fullName, [space, firstName, lastName]);

        expect(pattern.isEqual(expected)).toBeTruthy();
    });

    test("And With Optional Pattern", () => {
        const expression = `
            space = " "
            first-name = /\\w/
            last-name = /\\w/
            middle-name = /\\w/
            middle-name-with-space = middle-name + space
            full-name = first-name + space + middle-name-with-space? + last-name
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns["full-name"];
        const space = new Literal("space", " ");
        const firstName = new Regex("first-name", "\\w");
        const lastName = new Regex("last-name", "\\w");
        const middleName = new Regex("middle-name", "\\w");
        const middleNameWithSpace = new Sequence("middle-name-with-space", [middleName, space]);
        const optionalMiddleNameWithSpace = new Optional("optional-middle-name-with-space", middleNameWithSpace);
        const fullName = new Sequence("full-name", [firstName, space, optionalMiddleNameWithSpace, lastName]);
        const expected = new Context("full-name", fullName, [space, firstName, lastName, middleName, middleNameWithSpace]);

        expect(pattern.isEqual(expected)).toBeTruthy();
    });

    test("And With Not Pattern", () => {
        const expression = `
            space = " "
            first-name = /\\w/
            last-name = /\\w/
            middle-name = /\\w/
            jack = "Jack"
            middle-name-with-space = middle-name + space
            full-name = !jack + first-name + space + middle-name-with-space? + last-name
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns["full-name"];
        const space = new Literal("space", " ");
        const firstName = new Regex("first-name", "\\w");
        const lastName = new Regex("last-name", "\\w");
        const middleName = new Regex("middle-name", "\\w");
        const jack = new Literal("jack", "Jack");
        const middleNameWithSpace = new Sequence("middle-name-with-space", [middleName, space]);
        const optionalMiddleNameWithSpace = new Optional("optional-middle-name-with-space", middleNameWithSpace);
        const fullName = new Sequence("full-name", [new Not("not-jack", jack), firstName, space, optionalMiddleNameWithSpace, lastName]);
        const expected = new Context("full-name", fullName, [space, firstName, lastName, middleName, jack, middleNameWithSpace]);

        expect(pattern.isEqual(expected)).toBeTruthy();
    });

    test("Repeat", () => {
        const expression = `
            digit = /\\d/
            digits = (digit)+
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns["digits"];
        const digit = new Regex("digit", "\\d");
        const digits = new Repeat("digits", digit);
        const expected = new Context("digits", digits, [digit]);

        expect(pattern.isEqual(expected)).toBeTruthy();
    });

    test("Repeat Zero Or More", () => {
        const expression = `
            digit = /\\d/
            digits = (digit)*
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns["digits"];
        const digit = new Regex("digit", "\\d");
        const digits = new Optional("optional-digits", new Repeat("digits", digit, { min: 0 }));

        const expected = new Context("optional-digits", digits, [digit]);
debugger;
        expect(pattern.isEqual(expected)).toBeTruthy();
    });

    test("Repeat Lower Limit", () => {
        const expression = `
            digit = /\\d+/
            digits = (digit){1,}
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns["digits"];
        const digit = new Regex("digit", "\\d+");
        const digits = new Repeat("digits", digit, { min: 1 });
        const expected = new Context("digits", digits, [digit]);

        expect(pattern.isEqual(expected)).toBeTruthy();
    });

    test("Repeat Bounded", () => {
        const expression = `
            digit = /\\d+/
            digits = (digit){1,3}
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns["digits"];
        const digit = new Regex("digit", "\\d+");
        const digits = new Repeat("digits", digit, { min: 1, max: 3 });
        const expected = new Context("digits", digits, [digit]);

        expect(pattern.isEqual(expected)).toBeTruthy();
    });

    test("Repeat Upper Limit", () => {
        const expression = `
            digit = /\\d+/
            digits = (digit){,3}
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns["digits"];
        const digit = new Regex("digit", "\\d+");
        const digits = new Repeat("digits", digit, { min: 0, max: 3 });
        const expected = new Context("digits", digits, [digit]);

        expect(pattern.isEqual(expected)).toBeTruthy();
    });

    test("Repeat Exact", () => {
        const expression = `
            digit = /\\d+/
            digits = (digit){3}
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns["digits"];
        const digit = new Regex("digit", "\\d+");
        const digits = new Repeat("digits", digit, { min: 3, max: 3 });
        const expected = new Context("digits", digits, [digit]);

        expect(pattern.isEqual(expected)).toBeTruthy();
    });

    test("Repeat Divider", () => {
        const expression = `
            digit = /\\d+/
            comma = ","
            digits = (digit, comma){3}
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns["digits"];
        const digit = new Regex("digit", "\\d+");
        const comma = new Literal("comma", ",");
        const digits = new Repeat("digits", digit, { divider: comma, min: 3, max: 3 });
        const expected = new Context("digits", digits, [digit, comma]);

        expect(pattern.isEqual(expected)).toBeTruthy();
    });

    test("Repeat Divider With Trim Divider", () => {
        const expression = `
            digit = /\\d+/
            comma = ","
            digits = (digit, comma trim)+
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns["digits"];
        const digit = new Regex("digit", "\\d+");
        const comma = new Literal("comma", ",");
        const digits = new Repeat("digits", digit, { divider: comma, min: 1, trimDivider: true });
        const expected = new Context("digits", digits, [digit, comma]);

        expect(pattern.isEqual(expected)).toBeTruthy();
    });

    test("Repeat Divider With Trim Divider And Bounds", () => {
        const expression = `
            digit = /\\d+/
            comma = ","
            digits = (digit, comma trim){3, 3}
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns["digits"];
        const digit = new Regex("digit", "\\d+");
        const divider = new Literal("comma", ",");
        const digits = new Repeat("digits", digit, { divider, min: 3, max: 3, trimDivider: true });
        const expected = new Context("digits", digits, [digit, divider]);

        expect(pattern.isEqual(expected)).toBeTruthy();
    });

    test("Reference", () => {
        const expression = `
            digit = /\\d+/
            divider = /\\s*,\\s*/
            open-bracket = "["
            close-bracket = "]"
            spaces = /\\s+/
            items = digit | array
            array-items = (items, divider trim)*
            array = open-bracket + spaces? + array-items + spaces? + close-bracket
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns["array"] as Pattern;

        let text = "[1, []]";
        let result = pattern.exec(text, true);

        expect(result.ast?.value).toEqual("[1, []]");
    });

    test("Alias", () => {
        const expression = `
            name = /regex/
            alias = name
        `;

        const patterns = Grammar.parseString(expression);

        const name = patterns["name"];
        const expectedName = new Regex("name", "regex");

        const alias = patterns["alias"];

        const expectedAlias = new Regex("alias", "regex");

        const contextualAlias = new Context("alias", expectedAlias, [expectedName]);
        const contextualName = new Context("name", expectedName, [expectedAlias]);

        expect(name.isEqual(contextualName)).toBeTruthy();
        expect(alias.isEqual(contextualAlias)).toBeTruthy();
    });

    test("Bad Grammar At Beginning", () => {

        expect(() => {
            const expression = `//`;
            Grammar.parseString(expression);
        }).toThrow();

    });

    test("Bad Grammar Further In", () => {

        expect(() => {
            const expression = `name = /\\w/
                age = /()
            `;
            Grammar.parseString(expression);
        }).toThrow();

    });

    test("Import", async () => {
        const importExpression = `first-name = "John"`;
        const expression = `
        import { first-name } from "some/path/to/file.cpat"
        last-name = "Doe"
        space = " "
        full-name = first-name + space + last-name
        `;
        function resolveImport(resource: string) {
            expect(resource).toBe("some/path/to/file.cpat");
            return Promise.resolve({ expression: importExpression, resource });
        }

        const patterns = await Grammar.parse(expression, { resolveImport });
        const fullname = patterns["full-name"] as Pattern;
        const result = fullname.exec("John Doe");

        expect(result?.ast?.value).toBe("John Doe");
    });

    test("Imports", async () => {
        const importExpression = `first-name = "John"`;
        const spaceExpression = `space = " "`;

        const pathMap: Record<string, string> = {
            "space.cpat": spaceExpression,
            "first-name.cpat": importExpression
        };

        const expression = `
        import { first-name } from "first-name.cpat"
        import { space } from "space.cpat"
        last-name = "Doe"
        full-name = first-name + space + last-name
        `;
        function resolveImport(resource: string) {
            return Promise.resolve({ expression: pathMap[resource], resource });
        }

        const patterns = await Grammar.parse(expression, { resolveImport });
        const fullname = patterns["full-name"] as Pattern;
        const result = fullname.exec("John Doe");
        expect(result?.ast?.value).toBe("John Doe");
    });

    test("Imports with Params", async () => {
        const importExpression = `first-name = "John"`;
        const spaceExpression = `
        use params { custom-space }
        space = custom-space
        `;
        const expression = `
        import { first-name } from "first-name.cpat"
        import { space } from "space.cpat" with params {
          custom-space = "  "
        }
        last-name = "Doe"
        full-name = first-name + space + last-name
        `;

        const pathMap: Record<string, string> = {
            "space.cpat": spaceExpression,
            "first-name.cpat": importExpression
        };

        function resolveImport(resource: string) {
            return Promise.resolve({ expression: pathMap[resource], resource });
        }

        const patterns = await Grammar.parse(expression, { resolveImport });
        const fullname = patterns["full-name"] as Pattern;
        const result = fullname.exec("John  Doe");
        expect(result?.ast?.value).toBe("John  Doe");
    });

    test("Export Name", async () => {
        const expression = `
        import { use-this } from "resource1"
        import {name} from "resource2" with params {
           use-this   
        }

        name
        `;

        const resource1 = `
        use-this = "Use This"
        `;

        const resource2 = `
        use params {
            use-this
        }
        name = use-this
        `;

        const pathMap: Record<string, string> = {
            "resource1": resource1,
            "resource2": resource2
        };

        function resolveImport(resource: string) {
            return Promise.resolve({ expression: pathMap[resource], resource });
        }
        const patterns = await Grammar.parse(expression, { resolveImport });
        const pattern = patterns["name"] as Literal;

        const result = pattern.exec("Use This");

        expect(result.ast?.value).toBe("Use This");
    });

    test("Import Alias", async () => {
        const expression = `
        import { value as alias } from "resource1"
        import { export-value } from "resource2" with params {
            param = alias
        }
        name = export-value
        `;

        const resource1 = `
        value = "Value"
        `;

        const resource2 = `
        use params {
            param
        }
        export-value = param
        `;

        const pathMap: Record<string, string> = {
            "resource1": resource1,
            "resource2": resource2
        };

        function resolveImport(resource: string) {
            return Promise.resolve({ expression: pathMap[resource], resource });
        }
        const patterns = await Grammar.parse(expression, { resolveImport });
        const pattern = patterns["name"] as Literal;

        const result = pattern.exec("Value");
        expect(result.ast?.value).toBe("Value");
    });

    test("Anonymous Patterns", () => {
        const expression = `
            complex-expression = !"NOT_THIS" + "Text"? + /regex/ + ("Text" <|> /regex/ <|> (pattern)+) + (pattern | pattern)
        `;

        const patterns = Grammar.parseString(expression);
        const expected = new Context("complex-expression", new Sequence("complex-expression", [
            new Not("not-NOT_THIS", new Literal("NOT_THIS", "NOT_THIS")),
            new Optional("Text", new Literal("Text", "Text")),
            new Regex("regex", "regex"),
            new Options("anonymous", [
                new Literal("Text", "Text"),
                new Regex("regex", "regex"),
                new Repeat("anonymous", new Reference("pattern")),
            ],
                true
            ),
            new Options("anonymous", [
                new Reference("pattern"),
                new Reference("pattern")
            ])
        ]));

        expect(patterns["complex-expression"].isEqual(expected)).toBeTruthy();
    });

    test("Grammar With Spaces", () => {
        const expression = `
        john = "John"
            
        jane = "Jane"
        `;
        const patterns = Grammar.parseString(expression);
        expect(patterns.john).not.toBeNull();
        expect(patterns.jane).not.toBeNull();
    });

    test("Grammar Import", async () => {
        const importExpression = `first-name = "John"`;
        const spaceExpression = `
        use params { custom-space }
        space = custom-space
        `;
        const expression = `
        use params {
          custom-space
        }
        import { first-name } from "first-name.cpat"
        import { space } from "space.cpat" with params {
          custom-space = custom-space
        }
        last-name = "Doe"
        full-name = first-name + space + last-name
        `;

        const pathMap: Record<string, string> = {
            "space.cpat": spaceExpression,
            "first-name.cpat": importExpression,
            "root.cpat": expression
        };

        function resolveImport(resource: string) {
            return Promise.resolve({ expression: pathMap[resource], resource });
        }

        const patterns = await Grammar.import("root.cpat", { resolveImport, params: [new Literal("custom-space", "  ")] });
        const fullname = patterns["full-name"] as Pattern;
        const result = fullname.exec("John  Doe");
        expect(result?.ast?.value).toBe("John  Doe");
    });

    test("Expression Pattern", () => {
        const { expression } = patterns`
            variables = "a" | "b" | "c"
            ternary = expression + " ? " + expression + " : " + expression
            expression = ternary | variables

            bad-ternary = bad-expression + " ? " + bad-expression + " : " + bad-expression
            bad-expression = bad-ternary | bad-ternary
        `;
        let result = expression.exec("a ? b : c");
        expect(result).toBe(result);
    });

    test("Expression Pattern With Right Association", () => {
        const { expression } = patterns`
            variables = "a" | "b" | "c" | "d" | "e"
            ternary = expression + " ? " + expression + " : " + expression
            expression = ternary right | variables
        `;
        let result = expression.exec("a ? b : c ? d : e");
        debugger;
        expect(result).toBe(result);
    });

});