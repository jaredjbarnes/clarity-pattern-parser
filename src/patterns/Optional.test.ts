import { Literal } from "./Literal";
import { Not } from "./Not";
import { Optional } from "./Optional";
import { Pattern } from "./Pattern";
import { Sequence } from "./Sequence";

describe("Optional", () => {
    test("Match", () => {
        const text = new Literal("text", "Text");
        const optional = new Optional("optional-text", text);
        const result = optional.exec("Text");

        expect(result?.ast?.value).toBe("Text");
        expect(result.cursor.index).toBe(3);
    });

    test("No Match", () => {
        const text = new Literal("text", "Text");
        const optional = new Optional("optional-text", text);
        const result = optional.exec("Bad Text");

        expect(result.ast).toBe(null);
        expect(result.cursor.index).toBe(0);
    });

    test("Test Match", () => {
        const text = new Literal("text", "Text");
        const optional = new Optional("optional-text", text);
        const result = optional.test("Text");

        expect(result).toBeTruthy();
    });

    test("Test No Match", () => {
        const text = new Literal("text", "Text");
        const optional = new Optional("optional-text", text);
        const result = optional.test("Bad Text");

        expect(result).toBeTruthy();
    });

    test("Clone", () => {
        const a = new Literal("a", "A");
        const optionalA = new Optional("optional-a", a);
        const clone = optionalA.clone();

        expect(clone.name).toBe("optional-a");
        expect(clone).not.toBe(optionalA);
    });

    test("Tokens", () => {
        const a = new Literal("a", "A");
        const optionalA = new Optional("optional-a", a);
        const tokens = optionalA.getTokens();
        const nextTokens = optionalA.getTokensAfter(new Literal("bogus", "bogus"));
        const emptyArray: string[] = [];

        expect(tokens).toEqual(["A"]);
        expect(nextTokens).toEqual(emptyArray);
    });

    test("Properties", () => {
        const a = new Literal("a", "A");
        const optionalA = new Optional("optional-a", a);

        expect(optionalA.type).toBe("optional");
        expect(optionalA.name).toBe("optional-a");
        expect(optionalA.parent).toBeNull();
        expect(optionalA.children[0].name).toBe("a");
    });

    test("Get Next Tokens", () => {
        const optionalAboutUs = new Optional("optional-about-us", new Literal("about-us", "About Us"));
        const sequence = new Sequence("sequence", [optionalAboutUs, new Literal("about-them", "About Them")]);

        const cloneOptionalAboutUs = sequence.find(p => p.name === "optional-about-us") as Pattern;
        const nextTokens = cloneOptionalAboutUs.getNextTokens() || [];

        expect(nextTokens[0]).toBe("About Them");
    });

    test("Get Next Tokens With No Parent", () => {
        const optionalAboutUs = new Optional("optional-about-us", new Literal("about-us", "About Us"));
        const nextTokens = optionalAboutUs.getNextTokens() || [];

        expect(nextTokens.length).toBe(0);
    });

    test("Get Tokens", () => {
        const optionalAboutUs = new Optional("optional-about-us", new Literal("about-us", "About Us"));
        const sequence = new Sequence("sequence", [optionalAboutUs, new Literal("about-them", "About Them")]);

        const cloneAboutUs = sequence.find(p => p.name === "optional-about-us") as Pattern;
        const nextTokens = cloneAboutUs.getTokens() || [];

        expect(nextTokens[0]).toBe("About Us");
    });

    test("Get Tokens After", () => {
        const optionalAboutUs = new Optional("optional-about-us", new Literal("about-us", "About Us"));
        const sequence = new Sequence("sequence", [optionalAboutUs, new Literal("about-them", "About Them")]);
        const optionalAboutUsClone = sequence.find(p => p.name === "optional-about-us") as Pattern;
        const aboutUsClone = sequence.find(p => p.name === "about-us") as Pattern;
        const nextTokens = optionalAboutUsClone.getTokensAfter(aboutUsClone) || [];

        expect(nextTokens[0]).toBe("About Them");
    });

    test("Find Pattern", () => {
        const optionalAboutUs = new Optional("optional-about-us", new Literal("about-us", "About Us"));
        const child = optionalAboutUs.find(p => p.name === "about-us");

        expect(child).not.toBeNull();
    });

    test("Get Patterns", () => {
        const optionalAboutUs = new Optional("optional-about-us", new Literal("about-us", "About Us"));
        const sequence = new Sequence("sequence", [optionalAboutUs, new Literal("about-them", "About Them")]);

        const cloneNotAboutUs = sequence.find(p => p.name === "optional-about-us") as Pattern;
        const nextPatterns = cloneNotAboutUs.getPatterns();
        const expected = [sequence.find(p => p.name === "about-us")];

        expect(nextPatterns).toEqual(expected);
    });

    test("Get Next Patterns", () => {
        const optionalAboutUs = new Optional("optional-about-us", new Literal("about-us", "About Us"));
        const sequence = new Sequence("sequence", [optionalAboutUs, new Literal("about-them", "About Them")]);

        const cloneNotAboutUs = sequence.find(p => p.name === "optional-about-us") as Pattern;
        const patterns = cloneNotAboutUs.getNextPatterns() || [];

        expect(patterns.length).toBe(1);
        expect(patterns[0].name).toBe("about-them");
    });

    test("Get Next Patterns With No Parent", () => {
        const optionalAboutUs = new Optional("optional-about-us", new Literal("about-us", "About Us"));
        const patterns = optionalAboutUs.getNextPatterns() || [];

        expect(patterns.length).toBe(0);
    });

    test("Get Patterns After", () => {
        const optionalAboutUs = new Optional("optional-about-us", new Literal("about-us", "About Us"));
        const sequence = new Sequence("sequence", [optionalAboutUs, new Literal("about-them", "About Them")]);
        const optionalAboutUsClone = sequence.find(p => p.name === "optional-about-us") as Pattern;
        const aboutUsClone = sequence.find(p => p.name === "about-us") as Pattern;
        const patterns = optionalAboutUsClone.getPatternsAfter(aboutUsClone) || [];

        expect(patterns.length).toBe(1);
        expect(patterns[0].name).toBe("about-them");
    });

    test("Get Patterns After With Null Parent", () => {
        const optionalAboutUs = new Optional("optional-about-us", new Literal("about-us", "About Us"));
        const aboutUsClone = optionalAboutUs.find(p => p.name === "about-us") as Pattern;
        const patterns = optionalAboutUs.getPatternsAfter(aboutUsClone) || [];

        expect(patterns.length).toBe(0);
    });

});