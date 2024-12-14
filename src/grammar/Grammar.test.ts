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

        const patterns = Grammar.parse(expression);
        const namePattern = patterns.get("name");
        const expected = new Literal("name", "John");

        expect(namePattern).toEqual(expected);
    });

    test("Regex", () => {
        const expression = `
            name = /\\w/
        `;

        const patterns = Grammar.parse(expression);
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

        const patterns = Grammar.parse(expression);
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

        const patterns = Grammar.parse(expression);
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

        const patterns = Grammar.parse(expression);
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

        const patterns = Grammar.parse(expression);
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

        const patterns = Grammar.parse(expression);
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

        const patterns = Grammar.parse(expression);
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

        const patterns = Grammar.parse(expression);
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

        const patterns = Grammar.parse(expression);
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

        const patterns = Grammar.parse(expression);
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

        const patterns = Grammar.parse(expression);
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

        const patterns = Grammar.parse(expression);
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

        const patterns = Grammar.parse(expression);
        const pattern = patterns.get("digits");
        const digit = new Regex("digit", "\\d+");
        const divider = new Literal("comma", ",");
        const digits = new Repeat("digits", digit, { divider, min: 3, max: 3, trimDivider: true });

        expect(pattern).toEqual(digits);
    });

    test("Repeat Divider With Optional Pattern", () => {
        const expression = `
            digit = /\\d+/
            comma = ","
            digits = (digit?, comma)+
        `;

        const patterns = Grammar.parse(expression);
        const pattern = patterns.get("digits") as Pattern;
        const digit = new Regex("digit", "\\d+", true);
        const comma = new Literal("comma", ",");
        const digits = new Repeat("digits", digit, { divider: comma });

        expect(pattern).toEqual(digits)
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

        const patterns = Grammar.parse(expression);
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

        const patterns = Grammar.parse(expression);
        
        const name = patterns.get("name");
        const expectedName = new Regex("name", "regex");

        const alias = patterns.get("alias");
        const expectedAlias = new Regex("alias", "regex");

        expect(name).toEqual(expectedName);
        expect(alias).toEqual(expectedAlias);
    });

    test("Bad Grammar At Beginning", () => {

        expect(() => {
            const expression = `Just Junk`;
            Grammar.parse(expression);
        }).toThrowError("[Parse Error] Found: 'Just Junk', expected: ' ='.");

    });

    test("Bad Grammar Further In", () => {

        expect(() => {
            const expression = `name = /\\w/
                age = /()
            `;
            Grammar.parse(expression);
        }).toThrowError("[Parse Error] Found: '    age = /()\n      ', expected: '    age = !' or '    age = (' or '    age = [Pattern Name]' or '    age = [Regular Expression]' or '    age = [String]'.")

    });
});