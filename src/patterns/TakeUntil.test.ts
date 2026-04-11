import { Cursor } from "./Cursor";
import { Literal } from "./Literal";
import { Options } from "./Options";
import { Sequence } from "./Sequence";
import { TakeUntil } from "./TakeUntil";

describe("TakeUntil", () => {
    test("Take With No End", () => {
        const takeUntilScript = new TakeUntil(
            "script-content",
            new Literal("close-script-tag", "</script")
        );

        const result = takeUntilScript.exec("function(){}");

        expect(result.ast?.value).toBe("function(){}");
    });

    test("Take Until Terminating Match", () => {
        const takeUntilScript = new TakeUntil(
            "script-content",
            new Literal("close-script-tag", "</script")
        );
        const cursor = new Cursor("function(){}function(){}</script");
        const result = takeUntilScript.parse(cursor);

        expect(result?.value).toBe("function(){}function(){}");
        expect(cursor.index).toBe(23);
    });

    test("Take Until Terminating Complex Match", () => {
        const takeUntilScript = new TakeUntil(
            "script-content",
            new Options("end-tags", [
                new Literal("close-script-tag", "</script"),
                new Literal("close-style-tag", "</style")
            ])
        );
        let cursor = new Cursor("function(){}function(){}</script");
        let result = takeUntilScript.parse(cursor);

        expect(result?.value).toBe("function(){}function(){}");
        expect(cursor.index).toBe(23);

        cursor = new Cursor("function(){}function(){}</style");
        result = takeUntilScript.parse(cursor);

        expect(result?.value).toBe("function(){}function(){}");
        expect(cursor.index).toBe(23);
    });

    test("Error", () => {
        const takeUntilScript = new TakeUntil(
            "script-content",
            new Literal("close-script-tag", "</script")
        );
        const cursor = new Cursor("</script");
        const result = takeUntilScript.parse(cursor);

        expect(result).toBeNull();
        expect(cursor.index).toBe(0);
    });

    test("test() returns true when content exists before terminator", () => {
        const takeUntil = new TakeUntil(
            "body",
            new Literal("end", "</end")
        );

        expect(takeUntil.test("some content")).toBe(true);
        expect(takeUntil.test("content</end")).toBe(false);
    });

    test("test() returns false when terminator is at start", () => {
        const takeUntil = new TakeUntil(
            "body",
            new Literal("end", "</end")
        );

        expect(takeUntil.test("</end")).toBe(false);
    });

    test("id and type accessors", () => {
        const takeUntil = new TakeUntil(
            "content",
            new Literal("end", ";")
        );

        expect(takeUntil.type).toBe("take-until");
        expect(takeUntil.name).toBe("content");
        expect(takeUntil.id).toBeDefined();
    });

    test("parent getter and setter", () => {
        const takeUntil = new TakeUntil(
            "content",
            new Literal("end", ";")
        );

        expect(takeUntil.parent).toBeNull();

        const fakeParent = new Literal("parent", "p");
        takeUntil.parent = fakeParent;
        expect(takeUntil.parent).toBe(fakeParent);
    });

    test("clone creates independent copy with same name", () => {
        const takeUntil = new TakeUntil(
            "script-content",
            new Literal("close", "</script")
        );

        const cloned = takeUntil.clone();
        expect(cloned).not.toBe(takeUntil);
        expect(cloned.name).toBe("script-content");
        expect(cloned.type).toBe("take-until");
        expect(cloned.id).toBe(takeUntil.id);

        // Cloned should work independently
        const result = cloned.exec("var x = 1;");
        expect(result.ast?.value).toBe("var x = 1;");
    });

    test("clone with a new name", () => {
        const takeUntil = new TakeUntil(
            "script-content",
            new Literal("close", "</script")
        );

        const cloned = takeUntil.clone("style-content");
        expect(cloned.name).toBe("style-content");
    });

    test("setTokens and getTokens for intellisense", () => {
        const takeUntil = new TakeUntil(
            "body",
            new Literal("end", "</end")
        );

        expect(takeUntil.getTokens()).toEqual([]);

        takeUntil.setTokens(["<div>", "<span>", "<p>"]);
        expect(takeUntil.getTokens()).toEqual(["<div>", "<span>", "<p>"]);
    });

    test("isEqual compares two TakeUntil patterns", () => {
        const a = new TakeUntil("body", new Literal("end", "</end"));
        const b = new TakeUntil("body", new Literal("end", "</end"));

        expect(a.isEqual(b)).toBe(true);

        const c = new TakeUntil("body", new Literal("end", "</other"));
        expect(a.isEqual(c)).toBe(false);
    });

    test("getPatterns returns self", () => {
        const takeUntil = new TakeUntil(
            "body",
            new Literal("end", ";")
        );

        const patterns = takeUntil.getPatterns();
        expect(patterns).toHaveLength(1);
        expect(patterns[0]).toBe(takeUntil);
    });

    test("find always returns null (leaf-like pattern)", () => {
        const takeUntil = new TakeUntil(
            "body",
            new Literal("end", ";")
        );

        const result = takeUntil.find(p => p.name === "body");
        expect(result).toBeNull();
    });

    test("standalone introspection methods return empty (no parent)", () => {
        const takeUntil = new TakeUntil(
            "body",
            new Literal("end", ";")
        );

        expect(takeUntil.getTokensAfter(takeUntil)).toEqual([]);
        expect(takeUntil.getNextTokens()).toEqual([]);
        expect(takeUntil.getPatternsAfter(takeUntil)).toEqual([]);
        expect(takeUntil.getNextPatterns()).toEqual([]);
    });

    test("introspection delegates to parent when in a sequence", () => {
        const takeUntil = new TakeUntil("body", new Literal("end", ";"));
        const close = new Literal("close", "</tag>");
        const seq = new Sequence("element", [takeUntil, close]);

        const tuInSeq = seq.children[0];
        expect(tuInSeq.getNextTokens()).toEqual(["</tag>"]);
        expect(tuInSeq.getNextPatterns().length).toBe(1);
    });
});