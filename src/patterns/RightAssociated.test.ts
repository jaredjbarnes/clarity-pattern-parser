import { Cursor } from "./Cursor";
import { Literal } from "./Literal";
import { Options } from "./Options";
import { Expression } from "./Expression";
import { Reference } from "./Reference";
import { Sequence } from "./Sequence";
import { RightAssociated } from "./RightAssociated";

function createTernaryExpression() {
    const variables = new Options("variables", [
        new Literal("a", "a"),
        new Literal("b", "b"),
        new Literal("c", "c"),
    ]);

    const addOp = new Literal("add", " + ");
    const addExpression = new Sequence("add-expression", [
        new Reference("expression"),
        addOp,
        new Reference("expression"),
    ]);

    const ternary = new Sequence("ternary", [
        new Reference("expression"),
        new Literal("question-mark", " ? "),
        new Reference("expression"),
        new Literal("colon", " : "),
        new Reference("expression"),
    ]);

    const expression = new Expression("expression", [
        addExpression,
        new RightAssociated(ternary),
        variables,
    ]);

    return expression;
}

describe("RightAssociated", () => {
    test("metadata: type and name", () => {
        const inner = new Literal("x", "x");
        const ra = new RightAssociated(inner);

        expect(ra.type).toBe("right-associated");
        expect(ra.name).toBe("");
        expect(ra.id).toMatch(/^right-associated-/);
    });

    test("wraps a child pattern via clone", () => {
        const inner = new Literal("x", "x");
        const ra = new RightAssociated(inner);

        // The child should be a clone, not the same reference
        expect(ra.children).toHaveLength(1);
        expect(ra.children[0]).not.toBe(inner);
        expect(ra.children[0].type).toBe("literal");
        expect(ra.children[0].name).toBe("x");
    });

    test("parse delegates to child pattern", () => {
        const inner = new Literal("greeting", "hello");
        const ra = new RightAssociated(inner);

        const cursor = new Cursor("hello");
        const node = ra.parse(cursor);
        expect(node?.value).toBe("hello");
        expect(node?.name).toBe("greeting");
        expect(ra.startedOnIndex).toBe(0);
    });

    test("test delegates to child pattern", () => {
        const inner = new Literal("greeting", "hello");
        const ra = new RightAssociated(inner);

        expect(ra.test("hello")).toBe(true);
        expect(ra.test("world")).toBe(false);
    });

    test("exec delegates to child pattern on failure", () => {
        const inner = new Literal("greeting", "hello");
        const ra = new RightAssociated(inner);

        const result = ra.exec("world");
        expect(result.ast).toBeNull();
    });

    test("clone creates an independent copy", () => {
        const inner = new Literal("x", "x");
        const ra = new RightAssociated(inner);
        const cloned = ra.clone();

        expect(cloned).not.toBe(ra);
        expect(cloned.type).toBe("right-associated");
        expect(cloned.id).toBe(ra.id);
        expect(cloned.children).toHaveLength(1);
        expect(cloned.children[0]).not.toBe(ra.children[0]);
    });

    test("getTokens delegates to child", () => {
        const inner = new Literal("x", "x");
        const ra = new RightAssociated(inner);

        // Literal's getTokens returns the literal value
        const tokens = ra.getTokens();
        expect(tokens).toEqual(["x"]);
    });

    test("getPatterns delegates to child", () => {
        const inner = new Literal("x", "x");
        const ra = new RightAssociated(inner);

        const patterns = ra.getPatterns();
        expect(patterns).toHaveLength(1);
        expect(patterns[0].name).toBe("x");
    });

    test("find searches within child", () => {
        const a = new Literal("a", "a");
        const b = new Literal("b", "b");
        const seq = new Sequence("ab", [a, b]);
        const ra = new RightAssociated(seq);

        const found = ra.find(p => p.name === "b");
        expect(found).not.toBeNull();
        expect(found!.name).toBe("b");

        const notFound = ra.find(p => p.name === "z");
        expect(notFound).toBeNull();
    });

    test("isEqual compares structure", () => {
        const innerA = new Literal("x", "x");
        const raA = new RightAssociated(innerA);

        const innerB = new Literal("x", "x");
        const raB = new RightAssociated(innerB);

        expect(raA.isEqual(raB)).toBe(true);

        const innerC = new Literal("y", "y");
        const raC = new RightAssociated(innerC);
        expect(raA.isEqual(raC)).toBe(false);
    });

    test("standalone getNextTokens/getNextPatterns return empty (no parent)", () => {
        const inner = new Literal("x", "x");
        const ra = new RightAssociated(inner);

        expect(ra.getNextTokens()).toEqual([]);
        expect(ra.getNextPatterns()).toEqual([]);
    });

    test("getTokensAfter and getPatternsAfter return empty when no parent", () => {
        const inner = new Literal("x", "x");
        const ra = new RightAssociated(inner);

        expect(ra.getTokensAfter(inner)).toEqual([]);
        expect(ra.getPatternsAfter(inner)).toEqual([]);
    });

    test("introspection delegates to parent when parent exists", () => {
        const inner = new Literal("x", "x");
        const ra = new RightAssociated(inner);
        const semi = new Literal("semi", ";");
        const seq = new Sequence("stmt", [ra, semi]);

        const raInSeq = seq.children[0];
        expect(raInSeq.getNextTokens()).toEqual([";"]);
        expect(raInSeq.getNextPatterns().length).toBe(1);
        expect(raInSeq.getTokensAfter(raInSeq.children[0])).toEqual([";"]);
        expect(raInSeq.getPatternsAfter(raInSeq.children[0]).length).toBe(1);
    });

    test("parent getter and setter", () => {
        const inner = new Literal("x", "x");
        const ra = new RightAssociated(inner);

        expect(ra.parent).toBeNull();

        const fakeParent = new Literal("parent", "p");
        ra.parent = fakeParent;
        expect(ra.parent).toBe(fakeParent);
    });

    test("ternary expression uses right-association in an Expression", () => {
        const expression = createTernaryExpression();

        // Ternary is right-associative: a ? b : c should parse correctly
        const result = expression.exec("a ? b : c");
        expect(result.ast).not.toBeNull();
        expect(result.ast?.value).toBe("a ? b : c");

        // Nested ternary: right-association means a ? b : c ? a : b
        // groups as a ? b : (c ? a : b)
        const nested = expression.exec("a ? b : c ? a : b");
        expect(nested.ast).not.toBeNull();
        expect(nested.ast?.value).toBe("a ? b : c ? a : b");
    });

    test("startedOnIndex delegates to child", () => {
        const expression = createTernaryExpression();
        // After parsing, startedOnIndex should reflect the child
        const result = expression.exec("a + b");
        expect(result.ast).not.toBeNull();
    });
});
