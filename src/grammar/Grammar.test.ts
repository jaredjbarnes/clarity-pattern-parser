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
import { createPatternsTemplate, patterns } from "./patterns";
import { Expression } from "../patterns/Expression";
import { Cursor } from "../patterns/Cursor";

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

    test("Default Params Resolves to Default Value", async () => {
        const expression = `
        use params {
            value = default-value
        }

        default-value = "DefaultValue"
        alias = value
        `;

        function resolveImport(_: string) {
            return Promise.reject(new Error("No Import"));
        }

        const patterns = await Grammar.parse(expression, { resolveImport });
        const pattern = patterns["alias"] as Literal;

        const result = pattern.exec("DefaultValue");
        expect(result.ast?.value).toBe("DefaultValue");
    });

    test("Default Params Resolves to params imported", async () => {
        const expression = `
        use params {
            value = default-value
        }

        default-value = "DefaultValue"
        alias = value
        `;

        function resolveImport(_: string) {
            return Promise.reject(new Error("No Import"));
        }

        const patterns = await Grammar.parse(expression, { resolveImport, params: [new Literal("value", "Value")] });
        const pattern = patterns["alias"] as Literal;

        const result = pattern.exec("Value");
        expect(result.ast?.value).toBe("Value");
    });

    test("Default Params Resolves to imported default value", async () => {
        const expression = `
        import { my-value as default-value } from "resource1"
        use params {
            value = default-value
        }

        default-value = "DefaultValue"
        alias = value
        `;

        const resource1 = `
            my-value = "MyValue"
        `;


        const pathMap: Record<string, string> = {
            "resource1": resource1,
        };

        function resolveImport(resource: string) {
            return Promise.resolve({ expression: pathMap[resource], resource });
        }

        const patterns = await Grammar.parse(expression, { resolveImport });
        const pattern = patterns["alias"] as Literal;

        const result = pattern.exec("MyValue");
        expect(result.ast?.value).toBe("MyValue");
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
            new Expression("anonymous", [
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

    test("Decorators", () => {
        const { spaces } = patterns`
            @tokens([" "])
            spaces = /\\s+/
        `;

        expect(spaces.getTokens()).toEqual([" "]);
    });

    test("Decorators No Args", () => {
        const { spaces } = patterns`
            @tokens()
            spaces = /\\s+/
        `;

        expect(spaces.getTokens()).toEqual([]);
    });

    test("Decorators Bad Args", () => {
        const { spaces } = patterns`
            @tokens("Bad")
            spaces = /\\s+/
        `;

        expect(spaces.getTokens()).toEqual([]);
    });

    test("Decorators Bad Decorator", () => {
        const { spaces } = patterns`
            @bad-decorator()
            spaces = /\\s+/
        `;

        expect(spaces.getTokens()).toEqual([]);
    });

    test("Decorators On Multiple Patterns", () => {
        const { spaces, digits } = patterns`
            @tokens([" "])
            spaces = /\\s+/

            @tokens(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"])
            digits = /\\d+/
        `;

        expect(spaces.getTokens()).toEqual([" "]);
        expect(digits.getTokens()).toEqual(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    });

    test("Decorators On Multiple Patterns And Comments", () => {
        const { spaces, digits } = patterns`
            #Comment
            @tokens([" "])
            spaces = /\\s+/

            #Comment
            @tokens(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"])
            #Comment
            digits = /\\d+/
        `;

        expect(spaces.getTokens()).toEqual([" "]);
        expect(digits.getTokens()).toEqual(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    });

    test("Custom Named Decorator", () => {
        const allRecordedPatterns: string[] = [];
        const patterns = createPatternsTemplate({
            decorators: {
                record: (pattern) => {
                    allRecordedPatterns.push(pattern.name);
                }
            }
        });

        patterns`
            @record
            spaces = /\\s+/

            @record
            digits = /\\d+/
        `;

        expect(allRecordedPatterns).toEqual(["spaces", "digits"]);
    });

    test("Decorator With Empty Object Literal", () => {
        patterns`
            @method({})
            spaces = /\\s+/
        `;
    });

    test("Decorator With Object Literal", () => {
        patterns`
            @method({"prop": 2})
            spaces = /\\s+/
        `;
    });

    test("Take Until", () => {
        const { scriptText } = patterns`
            script-text = ?->| "</script"
        `;
        const result = scriptText.parse(new Cursor("function(){}</script"));

        expect(result?.value).toBe("function(){}");
    });

    test("Import Sync", () => {
        function resolveImportSync(path: string, importer: string | null) {
            return {
                expression: pathMap[path],
                resource: path,
            }
        }

        const rootExpression = `
        import { name } from "first-name.cpat"
        full-name = name
        `;

        const firstNameExpression = `
        import { last-name } from "last-name.cpat"
        first-name = "John"
        name = first-name + " " +  last-name
        `;

        const lastNameExpression = `
        last-name = "Doe"
        `;

        const pathMap: Record<string, string> = {
            "first-name.cpat": firstNameExpression,
            "last-name.cpat": lastNameExpression,
        };

        const patterns = Grammar.parseString(rootExpression, {
            resolveImportSync: resolveImportSync,
            originResource: "/root.cpat",
        });

        expect(patterns["full-name"]).not.toBeNull();
        const result = patterns["full-name"].exec("John Doe");
        expect(result?.ast?.value).toBe("John Doe");
    });

    // --- Greedy vs Non-Greedy Options ---

    test("greedy options picks longest match", () => {
        const { greeting } = patterns`
            hi = "hi"
            hiya = "hiya"
            greeting = hi <|> hiya
        `;
        expect(greeting.exec("hiya").ast?.value).toBe("hiya");
    });

    test("non-greedy options picks first match", () => {
        const { greeting } = patterns`
            hi = "hi"
            hiya = "hiya"
            greeting = hi | hiya
        `;
        expect(greeting.exec("hi").ast?.value).toBe("hi");
    });

    // --- Default Params ---

    test("default param resolves to locally defined pattern when no param supplied", () => {
        const p = Grammar.parseString(`
            use params { value = default-value }
            default-value = "DefaultValue"
            alias = value
        `);
        expect(p["alias"].exec("DefaultValue").ast?.value).toBe("DefaultValue");
    });

    test("default param is overridden when param is supplied", () => {
        const p = Grammar.parseString(`
            use params { value = default-value }
            default-value = "DefaultValue"
            alias = value
        `, { params: [new Literal("value", "Supplied")] });
        expect(p["alias"].exec("Supplied").ast?.value).toBe("Supplied");
    });

    test("default param resolves to imported pattern", async () => {
        const p = await Grammar.parse(`
            import { my-value as default-value } from "r1"
            use params { value = default-value }
            alias = value
        `, {
            resolveImport: () => Promise.resolve({ expression: `my-value = "MyValue"`, resource: "r1" })
        });
        expect(p["alias"].exec("MyValue").ast?.value).toBe("MyValue");
    });

    test("use params without default declares param available from options", () => {
        const p = Grammar.parseString(`
            use params { value }
            alias = value
        `, { params: [new Literal("value", "Provided")] });
        expect(p["alias"].exec("Provided").ast?.value).toBe("Provided");
    });

    // --- Expression Precedence ---

    test("expression respects declaration-order precedence for arithmetic", () => {
        const { expr } = patterns`
            number = /\\d+/
            mul-expr = expr + " * " + expr
            add-expr = expr + " + " + expr
            expr = mul-expr | add-expr | number
        `;
        const result = expr.exec("1 + 2 * 3");
        expect(result.ast?.value).toBe("1 + 2 * 3");
        expect(result.ast!.value).toContain("+");
    });

    test("expression handles prefix operator", () => {
        const { expr } = patterns`
            number = /\\d+/
            neg = "-" + expr
            expr = neg | number
        `;
        expect(expr.exec("-42").ast?.value).toBe("-42");
    });

    test("expression handles postfix operator", () => {
        const { expr } = patterns`
            number = /\\d+/
            factorial = expr + "!"
            expr = factorial | number
        `;
        expect(expr.exec("5!").ast?.value).toBe("5!");
    });

    // --- Forward References ---

    test("forward reference resolves pattern defined later", () => {
        const p = Grammar.parseString(`
            greeting = "Hello " + name
            name = /\\w+/
        `);
        expect(p["greeting"].exec("Hello World").ast?.value).toBe("Hello World");
    });

    // --- Import Errors ---

    test("duplicate import name throws", async () => {
        await expect(Grammar.parse(`
            import { value } from "r1"
            import { value } from "r2"
        `, {
            resolveImport: (r) => Promise.resolve({ expression: `value = "A"`, resource: r })
        })).rejects.toThrow("already used");
    });

    test("importing nonexistent pattern throws", async () => {
        await expect(Grammar.parse(`
            import { nonexistent } from "r1"
        `, {
            resolveImport: () => Promise.resolve({ expression: `value = "A"`, resource: "r1" })
        })).rejects.toThrow("Couldn't find pattern");
    });

    // --- Nested Groups ---

    test("nested parenthesized groups unwrap correctly", () => {
        const p = Grammar.parseString(`
            word = "hello"
            inner = ((word))
        `);
        expect(p["inner"].exec("hello").ast?.value).toBe("hello");
    });

    // --- Alias Chain ---

    test("alias chain resolves through multiple levels", () => {
        const p = Grammar.parseString(`
            original = "value"
            alias1 = original
            alias2 = alias1
        `);
        expect(p["alias2"].exec("value").ast?.value).toBe("value");
    });

    // --- Multiple Decorators ---

    test("multiple decorators applied to same pattern", () => {
        let callOrder: string[] = [];
        const customPatterns = createPatternsTemplate({
            decorators: {
                first: (pattern) => { callOrder.push("first:" + pattern.name); },
                second: (pattern) => { callOrder.push("second:" + pattern.name); }
            }
        });
        customPatterns`
            @first
            @second
            name = /\\w+/
        `;
        expect(callOrder).toContain("first:name");
        expect(callOrder).toContain("second:name");
    });

    // --- Decorator JSON Arg Types ---

    test("decorator receives number argument", () => {
        let received: any;
        const cp = createPatternsTemplate({ decorators: { config: (_p, arg) => { received = arg; } } });
        cp`@config(42)\nname = /\\w+/`;
        expect(received).toBe(42);
    });

    test("decorator receives nested array argument", () => {
        let received: any;
        const cp = createPatternsTemplate({ decorators: { config: (_p, arg) => { received = arg; } } });
        cp`@config([1, 2, [3]])\nname = /\\w+/`;
        expect(received).toEqual([1, 2, [3]]);
    });

    test("decorator receives null argument", () => {
        let received: any = "not-null";
        const cp = createPatternsTemplate({ decorators: { config: (_p, arg) => { received = arg; } } });
        cp`@config(null)\nname = /\\w+/`;
        expect(received).toBeNull();
    });

    test("decorator receives string argument", () => {
        let received: any;
        const cp = createPatternsTemplate({ decorators: { config: (_p, arg) => { received = arg; } } });
        cp`@config("hello")\nname = /\\w+/`;
        expect(received).toBe("hello");
    });

    // --- Patterns Template ---

    test("patterns template converts kebab-case to camelCase", () => {
        const result = patterns`my-long-name = "hello"`;
        expect(result["myLongName"]).toBeDefined();
        expect(result["myLongName"].exec("hello").ast?.value).toBe("hello");
    });

    // --- Edge Case Grammars ---

    test("empty grammar throws", () => {
        expect(() => Grammar.parseString("")).toThrow("[Invalid Grammar]");
    });

    test("grammar with only comments produces no patterns", () => {
        const p = Grammar.parseString("# just a comment");
        expect(Object.keys(p)).toHaveLength(0);
    });

    test("grammar with syntax version and no patterns", () => {
        const p = Grammar.parseString("syntax 1.0");
        expect(Object.keys(p)).toHaveLength(0);
    });

    // --- Inline Anonymous Patterns ---

    test("repeat with inline literal pattern", () => {
        const p = Grammar.parseString(`items = ("item")+`);
        expect(p["items"].exec("itemitemitem").ast?.value).toBe("itemitemitem");
    });

    test("repeat with inline regex pattern", () => {
        const p = Grammar.parseString(`digits = (/\\d/)+`);
        expect(p["digits"].exec("123").ast?.value).toBe("123");
    });

    test("inline literals use their value as the pattern name", () => {
        const p = Grammar.parseString(`greeting = "Hello" + " " + /\\w+/`);
        const ast = p["greeting"].exec("Hello World").ast!;
        expect(ast.children[0].name).toBe("Hello");
        expect(ast.children[1].name).toBe(" ");
        expect(ast.children[2].name).toBe("\\w+");
    });

    // --- Flattening ---

    test("five-way sequence flattens correctly", () => {
        const p = Grammar.parseString(`result = "a" + "b" + "c" + "d" + "e"`);
        expect(p["result"].exec("abcde").ast?.value).toBe("abcde");
    });

    test("four-way options all reachable", () => {
        const p = Grammar.parseString(`letter = "a" | "b" | "c" | "d"`);
        expect(p["letter"].exec("a").ast?.value).toBe("a");
        expect(p["letter"].exec("d").ast?.value).toBe("d");
    });

    test("mixed greedy options flatten correctly", () => {
        const p = Grammar.parseString(`item = "ab" <|> "abc" <|> "a"`);
        expect(p["item"].exec("abc").ast?.value).toBe("abc");
    });

    // --- Complex Composition ---

    test("sequence mixing references, optionals, nots, and inline patterns", () => {
        const p = Grammar.parseString(`
            keyword = "let"
            ws = /\\s+/
            ident = /[a-z]+/
            eq = "="
            digit = /\\d+/
            let-stmt = keyword + ws + !digit + ident + ws? + eq + ws? + digit
        `);
        expect(p["let-stmt"].exec("let x=42").ast?.value).toBe("let x=42");
        expect(p["let-stmt"].exec("let 9=42").ast).toBeNull();
    });

    test("recursive list with nested expressions", () => {
        const p = Grammar.parseString(`
            digit = /\\d+/
            comma = ", "
            open = "("
            close = ")"
            item = digit | list
            items = (item, comma trim)+
            list = open + items + close
        `);
        expect(p["list"].exec("(1, (2, 3), 4)").ast?.value).toBe("(1, (2, 3), 4)");
    });

    // --- AST Structure ---

    test("sequence children reflect pattern names in AST", () => {
        const { fullName } = patterns`
            first = /[A-Z][a-z]+/
            space = " "
            last = /[A-Z][a-z]+/
            full-name = first + space + last
        `;
        const ast = fullName.exec("John Doe").ast!;
        expect(ast.children.length).toBe(3);
        expect(ast.children[0].name).toBe("first");
        expect(ast.children[0].value).toBe("John");
        expect(ast.children[2].name).toBe("last");
        expect(ast.children[2].value).toBe("Doe");
    });

    test("repeat AST contains repeated children", () => {
        const { digits } = patterns`
            digit = /\\d/
            digits = (digit)+
        `;
        const ast = digits.exec("123").ast!;
        expect(ast.children.length).toBe(3);
        expect(ast.children[0].value).toBe("1");
        expect(ast.children[1].value).toBe("2");
        expect(ast.children[2].value).toBe("3");
    });

    test("options AST returns winning alternative directly", () => {
        const { choice } = patterns`
            a = "aaa"
            b = "bbb"
            choice = a | b
        `;
        const ast = choice.exec("bbb").ast!;
        expect(ast.name).toBe("b");
        expect(ast.value).toBe("bbb");
    });

    test("expression AST wraps in expression node", () => {
        const { expr } = patterns`
            num = /\\d+/
            add = expr + " + " + expr
            expr = add | num
        `;
        expect(expr.exec("1 + 2").ast!.type).toBe("expression");
    });

    // --- Multiple Names in One Import ---

    test("import multiple patterns from same resource", async () => {
        const p = await Grammar.parse(`
            import { first, last } from "names.cpat"
            full = first + " " + last
        `, {
            resolveImport: () => Promise.resolve({
                expression: `first = "John"\nlast = "Doe"`,
                resource: "names.cpat"
            })
        });
        expect(p["full"].exec("John Doe").ast?.value).toBe("John Doe");
    });

    test("import multiple patterns with alias from same resource", async () => {
        const p = await Grammar.parse(`
            import { first, last as surname } from "names.cpat"
            full = first + " " + surname
        `, {
            resolveImport: () => Promise.resolve({
                expression: `first = "John"\nlast = "Doe"`,
                resource: "names.cpat"
            })
        });
        expect(p["full"].exec("John Doe").ast?.value).toBe("John Doe");
    });

    // --- Repeat with Inline Complex Pattern ---

    test("repeat with inline sequence as repeated item", () => {
        const p = Grammar.parseString(`
            pairs = ("(" + /\\w+/ + ")")+
        `);
        expect(p["pairs"].exec("(a)(b)(c)").ast?.value).toBe("(a)(b)(c)");
    });

    test("repeat with inline options as repeated item", () => {
        const p = Grammar.parseString(`
            bits = ("0" | "1")+
        `);
        expect(p["bits"].exec("1010").ast?.value).toBe("1010");
    });

    // --- TakeUntil with Regex Terminator ---

    test("take until with regex terminator", () => {
        const { content } = patterns`
            content = ?->| /[<]/
        `;
        const result = content.parse(new Cursor("hello world<"));
        expect(result?.value).toBe("hello world");
    });

    // --- Inline Not and Optional with Literals ---

    test("inline not with literal in sequence", () => {
        const p = Grammar.parseString(`
            word = /\\w+/
            not-hello = !"hello" + word
        `);
        expect(p["not-hello"].exec("world").ast?.value).toBe("world");
        expect(p["not-hello"].exec("hello").ast).toBeNull();
    });

    test("inline optional with literal in sequence", () => {
        const p = Grammar.parseString(`
            greeting = "hello" + " world"?
        `);
        expect(p["greeting"].exec("hello world").ast?.value).toBe("hello world");
        expect(p["greeting"].exec("hello").ast?.value).toBe("hello");
    });

    // --- Syntax Version Combined with Patterns ---

    test("syntax version followed by patterns parses correctly", () => {
        const p = Grammar.parseString(`
            syntax 1.0
            name = "hello"
        `);
        expect(p["name"].exec("hello").ast?.value).toBe("hello");
    });

    // --- Empty String Literal ---

    test("empty string literal throws", () => {
        expect(() => Grammar.parseString(`empty = ""`)).toThrow("Value Cannot be empty");
    });

    // --- Block Pattern ---

    test("Block with empty content", () => {
        const p = Grammar.parseString(`
            braces = ["{"] + ["}"]
        `);
        const result = p["braces"].exec("{}");
        expect(result.ast).not.toBeNull();
        expect(result.ast!.type).toBe("block");
    });

    test("Block with content pattern", () => {
        const p = Grammar.parseString(`
            content = /[^{}]+/
            braces = ["{"] + content + ["}"]
        `);
        const result = p["braces"].exec("{hello}");
        expect(result.ast).not.toBeNull();
        expect(result.ast!.value).toBe("{hello}");
    });

    test("Block with multiple content patterns", () => {
        const p = Grammar.parseString(`
            key = /[a-z]+/
            value = /[a-z]+/
            pair = ["{"] + key + ":" + value + ["}"]
        `);
        const result = p["pair"].exec("{foo:bar}");
        expect(result.ast).not.toBeNull();
        expect(result.ast!.value).toBe("{foo:bar}");
    });

    test("Block handles nesting", () => {
        const p = Grammar.parseString(`
            braces = ["{"] + ["}"]
        `);
        const cursor = new Cursor("{ { } }");
        const ctx = p["braces"] as Context;
        const result = ctx.find(p => p.type === "block")!.parse(cursor);
        expect(result).not.toBeNull();
        expect(result!.firstIndex).toBe(0);
        expect(result!.lastIndex).toBe(6);
    });

    test("Block with inline literal content", () => {
        const p = Grammar.parseString(`
            parens = ["("] + /[^()]+/ + [")"]
        `);
        const result = p["parens"].exec("(hello)");
        expect(result.ast).not.toBeNull();
        expect(result.ast!.value).toBe("(hello)");
    });

});