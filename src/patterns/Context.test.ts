import { patterns } from "../grammar/patterns";
import { Context } from "./Context";
import { Literal } from "./Literal";
import { Reference } from "./Reference";
import { Sequence } from "./Sequence";
import { Regex } from "./Regex";

describe("Context", () => {
    test("Basic", () => {
        const john = new Literal("john", "John");
        const space = new Literal("space", " ");
        const jane = new Literal("jane", "Jane");
        const spaceReference = new Reference("space");

        const names = new Sequence("names", [john, spaceReference, jane]);
        const context = new Context("context", names, [space, names]);

        const { ast } = context.exec("John Jane");

        expect(ast?.toString()).toBe("John Jane");
    });

    test("With Grammar", ()=>{
        const {names} = patterns`
            names = john + space + jane
            john = "John"
            jane = "Jane"
            space = " "
        `;

        const { ast } = names.exec("John Jane");

        expect(ast?.toString()).toBe("John Jane");
    });

    test("test() returns boolean match through context", () => {
        const john = new Literal("john", "John");
        const space = new Literal("space", " ");
        const jane = new Literal("jane", "Jane");
        const spaceReference = new Reference("space");

        const names = new Sequence("names", [john, spaceReference, jane]);
        const context = new Context("context", names, [space]);

        expect(context.test("John Jane")).toBe(true);
        expect(context.test("John Bob")).toBe(false);
    });

    test("getPatternsWithinContext lists sibling patterns", () => {
        const john = new Literal("john", "John");
        const space = new Literal("space", " ");
        const jane = new Literal("jane", "Jane");
        const spaceReference = new Reference("space");

        const names = new Sequence("names", [john, spaceReference, jane]);
        const context = new Context("context", names, [space, jane]);

        const available = context.getPatternsWithinContext();
        expect(available["space"]).toBeDefined();
        expect(available["space"].name).toBe("space");
        expect(available["jane"]).toBeDefined();
        expect(available["jane"].name).toBe("jane");
    });

    test("getPatternsWithinContext returns a copy (not internal state)", () => {
        const space = new Literal("space", " ");
        const inner = new Literal("x", "x");
        const context = new Context("ctx", inner, [space]);

        const a = context.getPatternsWithinContext();
        const b = context.getPatternsWithinContext();
        expect(a).not.toBe(b);
        expect(a).toEqual(b);
    });

    test("isEqual compares two contexts with same structure", () => {
        const inner = new Literal("x", "x");
        const a = new Context("ctx", inner);
        const b = new Context("ctx", inner);

        expect(a.isEqual(b)).toBe(true);

        const c = new Context("ctx", new Literal("y", "y"));
        expect(a.isEqual(c)).toBe(false);
    });

    test("find locates a pattern within the context's child", () => {
        const john = new Literal("john", "John");
        const jane = new Literal("jane", "Jane");
        const names = new Sequence("names", [john, jane]);
        const context = new Context("ctx", names);

        const found = context.find(p => p.name === "jane");
        expect(found).not.toBeNull();
        expect(found!.name).toBe("jane");

        const notFound = context.find(p => p.name === "bob");
        expect(notFound).toBeNull();
    });

    test("standalone introspection methods return empty (no parent)", () => {
        const inner = new Literal("x", "x");
        const context = new Context("ctx", inner);

        expect(context.getTokensAfter(inner)).toEqual([]);
        expect(context.getNextTokens()).toEqual([]);
        expect(context.getPatternsAfter(inner)).toEqual([]);
        expect(context.getNextPatterns()).toEqual([]);
    });

    test("introspection delegates to parent when embedded in sequence", () => {
        const inner = new Regex("word", "[a-z]+");
        const context = new Context("ctx", inner);
        const semi = new Literal("semi", ";");
        const seq = new Sequence("stmt", [context, semi]);

        const ctxInSeq = seq.children[0];
        expect(ctxInSeq.getNextTokens()).toEqual([";"]);
        expect(ctxInSeq.getNextPatterns().length).toBe(1);
        // getTokensAfter/getPatternsAfter delegate with child reference
        const child = ctxInSeq.children[0];
        expect(ctxInSeq.getTokensAfter(child)).toEqual([";"]);
        expect(ctxInSeq.getPatternsAfter(child).length).toBe(1);
    });

    test("getTokens delegates to inner pattern", () => {
        const inner = new Literal("hello", "hello");
        const context = new Context("ctx", inner);

        expect(context.getTokens()).toEqual(["hello"]);
    });

    test("getPatterns delegates to inner pattern", () => {
        const inner = new Literal("x", "x");
        const context = new Context("ctx", inner);

        const patterns = context.getPatterns();
        expect(patterns).toHaveLength(1);
        expect(patterns[0].name).toBe("x");
    });

});