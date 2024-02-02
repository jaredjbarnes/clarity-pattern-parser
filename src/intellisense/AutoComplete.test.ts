import { And } from "../patterns/And";
import { findPattern } from "../patterns/findPattern";
import { Literal } from "../patterns/Literal";
import { Or } from "../patterns/Or";
import { Regex } from "../patterns/Regex";
import { Repeat } from "../patterns/Repeat";
import { AutoComplete, AutoCompleteOptions } from "./AutoComplete";

describe("AutoComplete", () => {
    test("No Text", () => {
        const name = new Literal("name", "Name");
        const autoComplete = new AutoComplete(name);
        let result = autoComplete.suggestFor("");

        expect(result.options[0].text).toBe("Name");
        expect(result.options[0].startIndex).toBe(0);
        expect(result.errorAtIndex).toBe(0);
        expect(result.isComplete).toBeFalsy();
    });

    test("Full Pattern Match", () => {
        const john = new Literal("john", "John");
        const space = new Literal("space", " ");
        const doe = new Literal("doe", "Doe");
        const smith = new Literal("smith", "Smith");
        const name = new And("name", [john, space, new Or("last-name", [smith, doe])]);

        const autoComplete = new AutoComplete(name);
        const result = autoComplete.suggestFor("John Doe");

        expect(result.ast?.value).toBe("John Doe");
        expect(result.options.length).toBe(0);
        expect(result.errorAtIndex).toBeNull();
        expect(result.isComplete).toBeTruthy();
        expect(result.cursor).not.toBeNull();
    });

    test("More Than One Option", () => {
        const john = new Literal("john", "John");
        const space = new Literal("space", " ");
        const doe = new Literal("doe", "Doe");
        const smith = new Literal("smith", "Smith");
        const name = new And("name", [john, space, new Or("last-name", [smith, doe])]);

        const text = "John "
        const autoComplete = new AutoComplete(name);
        const result = autoComplete.suggestFor(text);
        const expectedOptions = [{
            text: "Doe",
            startIndex: 5
        }, {
            text: "Smith",
            startIndex: 5
        }];

        expect(result.ast).toBeNull();
        expect(result.options).toEqual(expectedOptions);
        expect(result.errorAtIndex).toBe(text.length)
        expect(result.isComplete).toBeFalsy();
        expect(result.cursor).not.toBeNull();
    });

    test("Full Pattern Match With Root Repeat", () => {
        const john = new Literal("john", "John");
        const space = new Literal("space", " ");
        const doe = new Literal("doe", "Doe");
        const smith = new Literal("smith", "Smith");
        const name = new And("name", [john, space, new Or("last-name", [smith, doe])]);
        const divider = new Regex("divider", "\\s+,\\s+");

        divider.setTokens([", "])

        const text = "John Doe";
        const autoComplete = new AutoComplete(new Repeat("last-names", name, {divider}));
        const result = autoComplete.suggestFor(text);
        const expectedOptions = [{
            text: ", ",
            startIndex: 8
        }];

        expect(result.ast?.value).toBe(text);
        expect(result.options).toEqual(expectedOptions);
        expect(result.errorAtIndex).toBeNull()
        expect(result.isComplete).toBeTruthy();
        expect(result.cursor).not.toBeNull();
    });

    test("Partial", () => {
        const name = new Literal("name", "Name");
        const autoComplete = new AutoComplete(name);
        const result = autoComplete.suggestFor("Na");
        const expectedOptions = [{
            text: "me",
            startIndex: 2
        }];

        expect(result.ast).toBeNull();
        expect(result.options).toEqual(expectedOptions);
        expect(result.errorAtIndex).toBe(2);
        expect(result.isComplete).toBeFalsy();
        expect(result.cursor).not.toBeNull();
    });

    test("Partial Match With Bad Characters", () => {
        const name = new Literal("name", "Name");
        const autoComplete = new AutoComplete(name);
        const result = autoComplete.suggestFor("Ni");

        const expectedOptions = [{
            text: "ame",
            startIndex: 1
        }];

        expect(result.ast).toBeNull();
        expect(result.options).toEqual(expectedOptions);
        expect(result.errorAtIndex).toBe(1);
        expect(result.isComplete).toBeFalsy();
        expect(result.cursor).not.toBeNull();
    });

    test("Complete", () => {
        const name = new Literal("name", "Name");
        const autoComplete = new AutoComplete(name);
        const text = "Name"
        const result = autoComplete.suggestFor(text);

        expect(result.ast?.value).toBe(text);
        expect(result.options).toEqual([]);
        expect(result.errorAtIndex).toBeNull();
        expect(result.isComplete).toBeTruthy();
        expect(result.cursor).not.toBeNull();
    });

    test("Options AutoComplete on Composing Pattern", () => {
        const autoCompleteOptions: AutoCompleteOptions = {
            greedyPatternNames: ["space"],
            customTokens: {
                "last-name": ["Sparrow"]
            }
        };

        const jack = new Literal("jack", "Jack");
        const john = new Literal("john", "John");
        const space = new Literal("space", " ");
        const doe = new Literal("doe", "Doe");
        const smith = new Literal("smith", "Smith");
        const firstName = new Or("first-name", [jack, john]);
        const lastName = new Or("last-name", [doe, smith]);
        const fullName = new And("full-name", [firstName, space, lastName]);

        const text = "Jack";
        const autoComplete = new AutoComplete(fullName, autoCompleteOptions);
        const { options, ast, errorAtIndex } = autoComplete.suggestFor(text);

        const expectedOptions = [
            { text: " Doe", startIndex: 4 },
            { text: " Smith", startIndex: 4 },
            { text: " Sparrow", startIndex: 4 },
        ];

        const results = expectedOptions.map(o => text.slice(0, o.startIndex) + o.text);
        const expectedResults = [
            "Jack Doe",
            "Jack Smith",
            "Jack Sparrow",
        ]

        expect(ast).toBeNull();
        expect(errorAtIndex).toBe(4);
        expect(options).toEqual(expectedOptions);
        expect(results).toEqual(expectedResults);

    });

    test("Options AutoComplete On Leaf Pattern", () => {
        const autoCompleteOptions: AutoCompleteOptions = {
            greedyPatternNames: ["space"],
            customTokens: {
                "space": ["  "]
            }
        };

        const jack = new Literal("jack", "Jack");
        const john = new Literal("john", "John");
        const space = new Literal("space", " ");
        const doe = new Literal("doe", "Doe");
        const smith = new Literal("smith", "Smith");
        const firstName = new Or("first-name", [jack, john]);
        const lastName = new Or("last-name", [doe, smith]);
        const fullName = new And("full-name", [firstName, space, lastName]);

        const text = "Jack";
        const autoComplete = new AutoComplete(fullName, autoCompleteOptions);
        const { options, ast, errorAtIndex } = autoComplete.suggestFor(text);
        const expectedOptions = [
            { text: "  Doe", startIndex: 4 },
            { text: "  Smith", startIndex: 4 },
            { text: " Doe", startIndex: 4 },
            { text: " Smith", startIndex: 4 },
        ];

        const results = expectedOptions.map(o => text.slice(0, o.startIndex) + o.text);
        const expectedResults = [
            "Jack  Doe",
            "Jack  Smith",
            "Jack Doe",
            "Jack Smith",
        ]

        expect(ast).toBeNull();
        expect(errorAtIndex).toBe(4);
        expect(options).toEqual(expectedOptions);
        expect(results).toEqual(expectedResults)

    });

});