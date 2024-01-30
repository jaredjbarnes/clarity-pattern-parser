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
        let result = autoComplete.suggest("");

        expect(result.options[0].text).toBe("Name");
        expect(result.options[0].startIndex).toBe(0);
        expect(result.nextPatterns[0]).toBe(name);
        expect(result.isComplete).toBeFalsy();
    });

    test("Full Pattern Match", () => {
        const john = new Literal("john", "John");
        const space = new Literal("space", " ");
        const doe = new Literal("doe", "Doe");
        const smith = new Literal("smith", "Smith");
        const name = new And("name", [john, space, new Or("last-name", [smith, doe])]);

        const autoComplete = new AutoComplete(name);
        const result = autoComplete.suggest("John Doe");

        expect(result.ast?.value).toBe("John Doe");
        expect(result.options.length).toBe(0);
        expect(result.nextPatterns.length).toBe(0);
        expect(result.isComplete).toBeTruthy();
        expect(result.cursor).not.toBeNull();
    });

    test("More Than One Option", () => {
        const john = new Literal("john", "John");
        const space = new Literal("space", " ");
        const doe = new Literal("doe", "Doe");
        const smith = new Literal("smith", "Smith");
        const name = new And("name", [john, space, new Or("last-name", [smith, doe])]);

        const autoComplete = new AutoComplete(name);
        const result = autoComplete.suggest("John ");

        expect(result.ast).toBeNull();
        expect(result.options.length).toBe(2);
        expect(result.nextPatterns.length).toBe(1);
        expect(result.nextPatterns[0].type).toBe("or");
        expect(result.nextPatterns[0].name).toBe("last-name");
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

        const autoComplete = new AutoComplete(new Repeat("last-names", name, divider));
        const result = autoComplete.suggest("John Doe");

        expect(result.ast?.value).toBe("John Doe");
        expect(result.options.length).toBe(1);
        expect(result.nextPatterns.length).toBe(result.options.length);
        expect(result.isComplete).toBeTruthy();
        expect(result.cursor).not.toBeNull();
    });

    test("Partial", () => {
        const name = new Literal("name", "Name");
        const autoComplete = new AutoComplete(name);
        let result = autoComplete.suggest("Na");

        expect(result.options[0].text).toBe("me");
        expect(result.options[0].startIndex).toBe(2);
        expect(result.nextPatterns[0]).toBe(name);
        expect(result.isComplete).toBeFalsy();
    });

    test("Partial Match With Bad Characters", () => {
        const name = new Literal("name", "Name");
        const autoComplete = new AutoComplete(name);
        let result = autoComplete.suggest("Ni");

        expect(result.options[0].text).toBe("ame");
        expect(result.options[0].startIndex).toBe(1);
        //expect(result.nextPattern).toBe(name);
        expect(result.isComplete).toBeFalsy();
    });

    test("Complete", () => {
        const name = new Literal("name", "Name");
        const autoComplete = new AutoComplete(name);
        let result = autoComplete.suggest("Name");

        expect(result.options.length).toBe(0);
        expect(result.nextPatterns.length).toBe(0);
        expect(result.isComplete).toBeTruthy();
    });

    test("Options AutoComplete on Composing Pattern", ()=>{
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
        const { options, ast, nextPatterns } = autoComplete.suggest(text);
        const expectedOptions = [
            {text: " Doe", startIndex: 4},
            {text: " Smith", startIndex: 4},
            {text: " Sparrow", startIndex: 4},
        ];

        const results = expectedOptions.map(o=>text.slice(0, o.startIndex) + o.text);
        const expectedResults = [
            "Jack Doe",
            "Jack Smith",
            "Jack Sparrow",
        ]

        expect(options).toEqual(expectedOptions);
        expect(ast).toBeNull();
        expect(nextPatterns.length).toBe(1);
        expect(nextPatterns[0].name).toBe("space");
        expect(results).toEqual(expectedResults)

    });

    test("Options AutoComplete On Leaf Pattern", ()=>{
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
        const { options, ast, nextPatterns } = autoComplete.suggest(text);
        const expectedOptions = [
            {text: "  Doe", startIndex: 4},
            {text: "  Smith", startIndex: 4},
            {text: " Doe", startIndex: 4},
            {text: " Smith", startIndex: 4},
        ];

        const results = expectedOptions.map(o=>text.slice(0, o.startIndex) + o.text);
        const expectedResults = [
            "Jack  Doe",
            "Jack  Smith",
            "Jack Doe",
            "Jack Smith",
        ]

        expect(options).toEqual(expectedOptions);
        expect(ast).toBeNull();
        expect(nextPatterns.length).toBe(1);
        expect(nextPatterns[0].name).toBe("space");
        expect(results).toEqual(expectedResults)

    });

});