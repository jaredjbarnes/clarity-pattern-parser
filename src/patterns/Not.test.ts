import { Sequence } from "./Sequence";
import { Cursor } from "./Cursor";
import { Literal } from "./Literal";
import { Not } from "./Not";
import { Pattern } from "./Pattern";

describe("Not", () => {
    test("Parse Successfully", () => {
        const a = new Literal("a", "A");
        const notA = new Not("not-a", a);
        const cursor = new Cursor("B");
        const result = notA.parse(cursor);

        expect(result).toBeNull();
        expect(cursor.hasError).toBeFalsy();
    });

    test("Parse Failed", () => {
        const a = new Literal("a", "A");
        const notA = new Not("not-a", a);
        const cursor = new Cursor("A");
        const result = notA.parse(cursor);

        expect(result).toBeNull();
        expect(cursor.hasError).toBeTruthy();
    });

    test("Clone", () => {
        const a = new Literal("a", "A");
        const notA = new Not("not-a", a);
        const clone = notA.clone();

        expect(clone.name).toBe("not-a");
        expect(clone).not.toBe(notA)
    });

    test("Tokens", () => {
        const a = new Literal("a", "A");
        const notA = new Not("not-a", a);
        const tokens = notA.getTokens();
        const nextTokens = notA.getTokensAfter(new Literal("bogus", "bogus"))
        const emptyArray: string[] = [];

        expect(tokens).toEqual(emptyArray);
        expect(nextTokens).toEqual(emptyArray);
    });

    test("Properties", () => {
        const a = new Literal("a", "A");
        const notA = new Not("not-a", a);

        expect(notA.type).toBe("not");
        expect(notA.name).toBe("not-a");
        expect(notA.parent).toBeNull();
        expect(notA.children[0].name).toBe("a");
        expect(notA.isOptional).toBeFalsy();
    });

    test("Not A Not", () => {
        const a = new Literal("a", "A");
        const notA = new Not("not-a", a);
        const notnotA = new Not("not-not-a", notA);

        const cursor = new Cursor("A");
        const result = notnotA.parse(cursor);

        expect(result).toBeNull();
        expect(cursor.hasError).toBeFalsy();
    });

    test("Exec", () => {
        const a = new Literal("a", "A");
        const notA = new Not("not-a", a);
        const { ast: result } = notA.exec("A");

        expect(result).toBeNull();
    });

    test("Test", () => {
        const a = new Literal("a", "A");
        const notA = new Not("not-a", a);
        const result = notA.test("A");

        expect(result).toBeFalsy();
    });

    test("Get Next Tokens", () => {
        const notAboutUs = new Not("not-about-us", new Literal("about-us", "About Us"));
        const sequence = new Sequence("sequence", [notAboutUs, new Literal("about-them", "About Them")]);

        const cloneNotAboutUs = sequence.find(p => p.name === "not-about-us") as Pattern;
        const nextTokens = cloneNotAboutUs.getNextTokens() || [];

        expect(nextTokens[0]).toBe("About Them");
    });

    test("Get Next Tokens With No Parent", () => {
        const notAboutUs = new Not("not-about-us", new Literal("about-us", "About Us"));
        const nextTokens = notAboutUs.getNextTokens() || [];

        expect(nextTokens.length).toBe(0);
    });

    test("Get Tokens", () => {
        const notAboutUs = new Not("not-about-us", new Literal("about-us", "About Us"));
        const sequence = new Sequence("sequence", [notAboutUs, new Literal("about-them", "About Them")]);

        const cloneNotAboutUs = sequence.find(p => p.name === "not-about-us") as Pattern;
        const nextTokens = cloneNotAboutUs.getTokens() || [];

        expect(nextTokens[0]).toBe("About Them");
    });

    test("Get Tokens After", () => {
        const notAboutUs = new Not("not-about-us", new Literal("about-us", "About Us"));
        const sequence = new Sequence("sequence", [notAboutUs, new Literal("about-them", "About Them")]);
        const notAboutUsClone = sequence.find(p => p.name === "not-about-us") as Pattern;
        const aboutUsClone = sequence.find(p => p.name === "about-us") as Pattern;
        const nextTokens = notAboutUsClone.getTokensAfter(aboutUsClone) || [];

        expect(nextTokens[0]).toBe("About Them");
    });

    test("Find Pattern", () => {
        const notAboutUs = new Not("not-about-us", new Literal("about-us", "About Us"));
        const child = notAboutUs.find(p => p.name === "about-us")

        expect(child).not.toBeNull();
    });

    test("Get Patterns", () => {
        const notAboutUs = new Not("not-about-us", new Literal("about-us", "About Us"));
        const sequence = new Sequence("sequence", [notAboutUs, new Literal("about-them", "About Them")]);

        const cloneNotAboutUs = sequence.find(p => p.name === "not-about-us") as Pattern;
        const nextPatterns = cloneNotAboutUs.getPatterns();
        const expected = [sequence.find(p=>p.name === "about-them")];

        expect(nextPatterns).toEqual(expected);
    });

    test("Get Next Patterns", () => {
        const notAboutUs = new Not("not-about-us", new Literal("about-us", "About Us"));
        const sequence = new Sequence("sequence", [notAboutUs, new Literal("about-them", "About Them")]);

        const cloneNotAboutUs = sequence.find(p => p.name === "not-about-us") as Pattern;
        const patterns = cloneNotAboutUs.getNextPatterns() || [];

        expect(patterns.length).toBe(1);
        expect(patterns[0].name).toBe("about-them");
    });

    test("Get Next Patterns With No Parent", () => {
        const notAboutUs = new Not("not-about-us", new Literal("about-us", "About Us"));
        const patterns = notAboutUs.getNextPatterns() || [];

        expect(patterns.length).toBe(0);
    });

    test("Get Patterns After", () => {
        const notAboutUs = new Not("not-about-us", new Literal("about-us", "About Us"));
        const sequence = new Sequence("sequence", [notAboutUs, new Literal("about-them", "About Them")]);
        const notAboutUsClone = sequence.find(p => p.name === "not-about-us") as Pattern;
        const aboutUsClone = sequence.find(p => p.name === "about-us") as Pattern;
        const patterns = notAboutUsClone.getPatternsAfter(aboutUsClone) || [];

        expect(patterns.length).toBe(1);
        expect(patterns[0].name).toBe("about-them");
    });

    test("Get Patterns After With Null Parent", () => {
        const notAboutUs = new Not("not-about-us", new Literal("about-us", "About Us"));
        const aboutUsClone = notAboutUs.find(p => p.name === "about-us") as Pattern;
        const patterns = notAboutUs.getPatternsAfter(aboutUsClone) || [];

        expect(patterns.length).toBe(0);
    });

});