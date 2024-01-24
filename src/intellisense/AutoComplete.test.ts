import { And } from "../patterns/And";
import { findPattern } from "../patterns/findPattern";
import { Literal } from "../patterns/Literal";
import { Or } from "../patterns/Or";
import { AutoComplete } from "./AutoComplete";

describe("AutoComplete", () => {
    test("No Text", () => {
        const name = new Literal("name", "Name");
        const autoComplete = new AutoComplete(name);
        let result = autoComplete.suggest("");

        expect(result.options[0].text).toBe("Name");
        expect(result.options[0].startIndex).toBe(0);
        //expect(result.nextPatterns).toBe(name);
        expect(result.isComplete).toBeFalsy();
    });

    test("Full Pattern Match", () => {
        const john = new Literal("john", "John");
        const space = new Literal("space", " ");
        const doe = new Literal("doe", "Doe");
        const smith = new Literal("smith", "Smith");

        space.enableContextualTokenAggregation();

        const name = new And("name", [john, space, new Or("last-name", [smith, doe])]);

        const autoComplete = new AutoComplete(name);
        let result = autoComplete.suggest("John");

        expect(result.options.length).toBe(2);
        //expect(result.nextPatterns).toBe(findPattern(name, p=>p.name === "space"));
        expect(result.options[0].text).toBe(" Doe");
        expect(result.options[0].startIndex).toBe(4);
        expect(result.options[1].text).toBe(" Smith");
        expect(result.options[1].startIndex).toBe(4);
        expect(result.isComplete).toBeFalsy();
    });

    test("Partial", () => {
        const name = new Literal("name", "Name");
        const autoComplete = new AutoComplete(name);
        let result = autoComplete.suggest("Na");

        expect(result.options[0].text).toBe("me");
        expect(result.options[0].startIndex).toBe(2);
        //expect(result.nextPattern).toBe(name);
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
        //expect(result.nextPattern).toBe(null);
        expect(result.isComplete).toBeTruthy();
    });
});