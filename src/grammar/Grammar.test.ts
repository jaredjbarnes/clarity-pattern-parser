import { And } from "../patterns/And";
import { Literal } from "../patterns/Literal";
import { Not } from "../patterns/Not";
import { Or } from "../patterns/Or";
import { Pattern } from "../patterns/Pattern";
import { Regex } from "../patterns/Regex";
import { Repeat } from "../patterns/Repeat";
import { Grammar } from "./Grammar";

describe("Grammar", () => {
    test("Literal", () => {
        const expression = `
            name = "John"
        `;

        const patterns = Grammar.parseString(expression);
        const namePattern = patterns.get("name");
        const expected = new Literal("name", "John");

        expect(namePattern).toEqual(expected);
    });

    test("Literal With Escaped Characters", () => {
        const expression = `
            chars = "\\n\\r\\t\\b\\f\\v\\0\\x00\\u0000\\"\\\\"
        `;
        const patterns = Grammar.parseString(expression);
        const namePattern = patterns.get("chars");
        const expected = new Literal("chars", "\n\r\t\b\f\v\0\x00\u0000\"\\");

        expect(namePattern).toEqual(expected);
    });

    test("Literal With Escaped Quotes", () => {
        const expression = `
            content = "With Con\\"tent"
        `;
        const patterns = Grammar.parseString(expression);
        const namePattern = patterns.get("content");
        const expected = new Literal("content", "With Con\"tent");

        expect(namePattern).toEqual(expected);
    });

    test("Regex", () => {
        const expression = `
            name = /\\w/
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns.get("name");
        const name = new Regex("name", "\\w");

        expect(pattern).toEqual(name);
    });

    test("Or", () => {
        const expression = `
            john = "John"
            jane = "Jane"
            names = john | jane
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns.get("names");
        const john = new Literal("john", "John");
        const jane = new Literal("jane", "Jane");
        const names = new Or("names", [john, jane], false, true);

        expect(pattern).toEqual(names);
    });

    test("And", () => {
        const expression = `
            space = " "
            first-name = /\\w/
            last-name = /\\w/
            full-name = first-name & space & last-name
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns.get("full-name");
        const space = new Literal("space", " ");
        const firstName = new Regex("first-name", "\\w");
        const lastName = new Regex("last-name", "\\w");
        const fullName = new And("full-name", [firstName, space, lastName]);

        expect(pattern).toEqual(fullName);
    });

    test("And With Optional Pattern", () => {
        const expression = `
            space = " "
            first-name = /\\w/
            last-name = /\\w/
            middle-name = /\\w/
            middle-name-with-space = middle-name & space
            full-name = first-name & space & middle-name-with-space? & last-name
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns.get("full-name");
        const space = new Literal("space", " ");
        const firstName = new Regex("first-name", "\\w");
        const lastName = new Regex("last-name", "\\w");
        const middleName = new Regex("middle-name", "\\w");
        const middleNameWithSpace = new And("middle-name-with-space", [middleName, space], true);
        const fullName = new And("full-name", [firstName, space, middleNameWithSpace, lastName]);

        expect(pattern).toEqual(fullName);
    });

    test("And With Not Pattern", () => {
        const expression = `
            space = " "
            first-name = /\\w/
            last-name = /\\w/
            middle-name = /\\w/
            jack = "Jack"
            middle-name-with-space = middle-name & space
            full-name = !jack & first-name & space & middle-name-with-space? & last-name
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns.get("full-name");
        const space = new Literal("space", " ");
        const firstName = new Regex("first-name", "\\w");
        const lastName = new Regex("last-name", "\\w");
        const middleName = new Regex("middle-name", "\\w");
        const jack = new Literal("jack", "Jack");
        const notJack = new Not("not-jack", jack);
        const middleNameWithSpace = new And("middle-name-with-space", [middleName, space], true);
        const fullName = new And("full-name", [notJack, firstName, space, middleNameWithSpace, lastName]);

        expect(pattern).toEqual(fullName);
    });

    test("Repeat", () => {
        const expression = `
            digit = /\\d/
            digits = (digit)+
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns.get("digits");
        const digit = new Regex("digit", "\\d");
        const digits = new Repeat("digits", digit);

        expect(pattern).toEqual(digits);
    });

    test("Repeat Zero Or More", () => {
        const expression = `
            digit = /\\d/
            digits = (digit)*
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns.get("digits");
        const digit = new Regex("digit", "\\d");
        const digits = new Repeat("digits", digit, { min: 0 });

        expect(pattern).toEqual(digits);
    });

    test("Repeat Lower Limit", () => {
        const expression = `
            digit = /\\d+/
            digits = (digit){1,}
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns.get("digits");
        const digit = new Regex("digit", "\\d+");
        const digits = new Repeat("digits", digit, { min: 1 });

        expect(pattern).toEqual(digits);
    });

    test("Repeat Bounded", () => {
        const expression = `
            digit = /\\d+/
            digits = (digit){1,3}
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns.get("digits");
        const digit = new Regex("digit", "\\d+");
        const digits = new Repeat("digits", digit, { min: 1, max: 3 });

        expect(pattern).toEqual(digits);
    });

    test("Repeat Upper Limit", () => {
        const expression = `
            digit = /\\d+/
            digits = (digit){,3}
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns.get("digits");
        const digit = new Regex("digit", "\\d+");
        const digits = new Repeat("digits", digit, { min: 0, max: 3 });

        expect(pattern).toEqual(digits);
    });

    test("Repeat Exact", () => {
        const expression = `
            digit = /\\d+/
            digits = (digit){3}
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns.get("digits");
        const digit = new Regex("digit", "\\d+");
        const digits = new Repeat("digits", digit, { min: 3, max: 3 });

        expect(pattern).toEqual(digits);
    });

    test("Repeat Divider", () => {
        const expression = `
            digit = /\\d+/
            comma = ","
            digits = (digit, comma){3}
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns.get("digits");
        const digit = new Regex("digit", "\\d+");
        const divider = new Literal("comma", ",");
        const digits = new Repeat("digits", digit, { divider, min: 3, max: 3 });

        expect(pattern).toEqual(digits);
    });

    test("Repeat Divider With Trim Divider", () => {
        const expression = `
            digit = /\\d+/
            comma = ","
            digits = (digit, comma){3} -t
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns.get("digits");
        const digit = new Regex("digit", "\\d+");
        const divider = new Literal("comma", ",");
        const digits = new Repeat("digits", digit, { divider, min: 3, max: 3, trimDivider: true });

        expect(pattern).toEqual(digits);
    });

    test("Reference", () => {
        const expression = `
            digit = /\\d+/
            divider = /\\s*,\\s*/
            open-bracket = "["
            close-bracket = "]"
            spaces = /\\s+/
            items = digit | array
            array-items = (items, divider)* -t
            array = open-bracket & spaces? & array-items? & spaces? & close-bracket
        `;

        const patterns = Grammar.parseString(expression);
        const pattern = patterns.get("array") as Pattern;

        let text = "[1, []]";
        let result = pattern.exec(text);

        expect(result.ast?.value).toEqual("[1, []]");
    });

    test("Alias", () => {
        const expression = `
            name = /regex/
            alias = name
        `;

        const patterns = Grammar.parseString(expression);

        const name = patterns.get("name");
        const expectedName = new Regex("name", "regex");

        const alias = patterns.get("alias");
        const expectedAlias = new Regex("alias", "regex");

        expect(name).toEqual(expectedName);
        expect(alias).toEqual(expectedAlias);
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
        }).toThrowError("[Parse Error] Found: '    age = /()\n      ', expected: '    age = !' or '    age = (' or '    age = [Pattern Name]' or '    age = [Regular Expression]' or '    age = [String]'.");

    });

    test("Import", async () => {
        const importExpression = `first-name = "John"`;
        const expression = `
        import { first-name } from "some/path/to/file.cpat"
        last-name = "Doe"
        space = " "
        full-name = first-name & space & last-name
        `;
        function resolveImport(resource: string) {
            expect(resource).toBe("some/path/to/file.cpat");
            return Promise.resolve({ expression: importExpression, resource });
        }

        const patterns = await Grammar.parse(expression, { resolveImport });
        const fullname = patterns.get("full-name") as Pattern;
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
        full-name = first-name & space & last-name
        `;
        function resolveImport(resource: string) {
            return Promise.resolve({ expression: pathMap[resource], resource });
        }

        const patterns = await Grammar.parse(expression, { resolveImport });
        const fullname = patterns.get("full-name") as Pattern;
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
        import { space } from "space.cpat" with params { custom-space = "  " }
        last-name = "Doe"
        full-name = first-name & space & last-name
        `;

        const pathMap: Record<string, string> = {
            "space.cpat": spaceExpression,
            "first-name.cpat": importExpression
        };

        function resolveImport(resource: string) {
            return Promise.resolve({ expression: pathMap[resource], resource });
        }

        const patterns = await Grammar.parse(expression, { resolveImport });
        const fullname = patterns.get("full-name") as Pattern;
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
        const pattern = patterns.get("name") as Literal;

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
        const pattern = patterns.get("name") as Literal;

        const result = pattern.exec("Value");
        expect(result.ast?.value).toBe("Value");
    });
});