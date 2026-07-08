import { Association, PrecedenceTree } from "./PrecedenceTree";
import { Node } from "../ast/Node";

describe("Precedence Tree", () => {
    test("add Binary", () => {
        const tree = new PrecedenceTree({
            mul: 0,
            add: 1,
            bool: 2
        }, {});

        tree.addAtom(Node.createValueNode("literal", "a", "a"));
        tree.addBinary("add", Node.createValueNode("literal", "+", "+"));
        tree.addAtom(Node.createValueNode("literal", "b", "b"));
        tree.addBinary("mul", Node.createValueNode("literal", "*", "*"));
        tree.addAtom(Node.createValueNode("literal", "c", "c"));
        tree.addBinary("bool", Node.createValueNode("literal", "||", "||"));
        tree.addAtom(Node.createValueNode("literal", "d", "d"));
        tree.addBinary("add", Node.createValueNode("literal", "+", "+"));
        tree.addAtom(Node.createValueNode("literal", "e", "e"));

        const result = tree.commit();
        const expected = Node.createNode("expression", "bool", [
            Node.createNode("expression", "add", [
                Node.createValueNode("literal", "a", "a"),
                Node.createValueNode("literal", "+", "+"),
                Node.createNode("expression", "mul", [
                    Node.createValueNode("literal", "b", "b"),
                    Node.createValueNode("literal", "*", "*"),
                    Node.createValueNode("literal", "c", "c"),
                ]),
            ]),
            Node.createValueNode("literal", "||", "||"),
            Node.createNode("expression", "add", [
                Node.createValueNode("literal", "d", "d"),
                Node.createValueNode("literal", "+", "+"),
                Node.createValueNode("literal", "e", "e"),
            ]),
        ]);


        expect(result?.toString()).toBe("a+b*c||d+e");
        expect(result?.isEqual(expected)).toBe(true);
    });

    test("add Prefix", () => {
        const tree = new PrecedenceTree();

        tree.addPrefix("negate", Node.createValueNode("literal", "!", "!"));
        tree.addPrefix("increment", Node.createValueNode("literal", "++", "++"));
        tree.addPrefix("plus", Node.createValueNode("literal", "+", "+"));
        tree.addAtom(Node.createValueNode("literal", "a", "a"));

        let result = tree.commit();
        const expected = Node.createNode("expression", "negate", [
            Node.createValueNode("literal", "!", "!"),
            Node.createNode("expression", "increment", [
                Node.createValueNode("literal", "++", "++"),
                Node.createNode("expression", "plus", [
                    Node.createValueNode("literal", "+", "+"),
                    Node.createValueNode("literal", "a", "a"),
                ]),
            ]),
        ]);

        expect(result?.toString()).toBe("!+++a");
        expect(result?.isEqual(expected)).toBe(true);
    });

    test("add Postfix", () => {
        const tree = new PrecedenceTree();

        tree.addPostfix("decrement", Node.createValueNode("literal", "--", "--"));
        tree.addPostfix("increment", Node.createValueNode("literal", "++", "++"));
        tree.addAtom(Node.createValueNode("literal", "a", "a"));

        const expected = Node.createNode("expression", "increment", [
            Node.createNode("expression", "decrement", [
                Node.createValueNode("literal", "a", "a"),
                Node.createValueNode("literal", "--", "--"),
            ]),
            Node.createValueNode("literal", "++", "++"),
        ]);

        const result = tree.commit();
        expect(result?.toString()).toBe("a--++");
        expect(result?.isEqual(expected)).toBe(true);
    });

    test("all", () => {
        const tree = new PrecedenceTree({
            mul: 0,
            add: 1,
            bool: 2
        }, {});

        tree.addPrefix("negate", Node.createValueNode("literal", "!", "!"));
        tree.addPostfix("increment", Node.createValueNode("literal", "++", "++"));
        tree.addAtom(Node.createValueNode("literal", "a", "a"));
        tree.addBinary("mul", Node.createValueNode("literal", "*", "*"));
        tree.addAtom(Node.createValueNode("literal", "b", "b"));
        tree.addBinary("add", Node.createValueNode("literal", "+", "+"));
        tree.addAtom(Node.createValueNode("literal", "c", "c"));

        const result = tree.commit();
        const expected = Node.createNode("expression", "add", [
            Node.createNode("expression", "mul", [
                Node.createNode("expression", "increment", [
                    Node.createNode("expression", "negate", [
                        Node.createValueNode("literal", "!", "!"),
                        Node.createValueNode("literal", "a", "a"),
                    ]),
                    Node.createValueNode("literal", "++", "++"),
                ]),
                Node.createValueNode("literal", "*", "*"),
                Node.createValueNode("literal", "b", "b"),
            ]),
            Node.createValueNode("literal", "+", "+"),
            Node.createValueNode("literal", "c", "c"),
        ]);

        expect(result?.toString()).toBe("!a++*b+c");
        expect(result?.isEqual(expected)).toBe(true);
    });

    test("Incomplete", () => {
        const tree = new PrecedenceTree({
            mul: 0,
            add: 1,
            bool: 2
        }, {});

        tree.addPrefix("negate", Node.createValueNode("literal", "!", "!"));
        tree.addPostfix("increment", Node.createValueNode("literal", "++", "++"));
        tree.addAtom(Node.createValueNode("literal", "a", "a"));
        tree.addBinary("mul", Node.createValueNode("literal", "*", "*"));
        tree.addAtom(Node.createValueNode("literal", "b", "b"));
        tree.addBinary("add", Node.createValueNode("literal", "+", "+"));
        tree.addAtom(Node.createValueNode("literal", "c", "c"));
        tree.addBinary("mul", Node.createValueNode("literal", "*", "*"));

        const result = tree.commit();
        const expected = Node.createNode("expression", "add", [
            Node.createNode("expression", "mul", [
                Node.createNode("expression", "increment", [
                    Node.createNode("expression", "negate", [
                        Node.createValueNode("literal", "!", "!"),
                        Node.createValueNode("literal", "a", "a"),
                    ]),
                    Node.createValueNode("literal", "++", "++"),
                ]),
                Node.createValueNode("literal", "*", "*"),
                Node.createValueNode("literal", "b", "b"),
            ]),
            Node.createValueNode("literal", "+", "+"),
            Node.createValueNode("literal", "c", "c"),
        ]);

        expect(result?.toString()).toBe("!a++*b+c");
        expect(result?.isEqual(expected)).toBe(true);
    });

    test("add Partial Binary With Lower Precedence", () => {
        const tree = new PrecedenceTree({
            mul: 0,
            add: 1,
            bool: 2
        }, {});

        tree.addAtom(Node.createValueNode("literal", "a", "a"));
        tree.addBinary("add", Node.createValueNode("literal", "+", "+"));
        tree.addAtom(Node.createValueNode("literal", "b", "b"));
        tree.addBinary("mul", Node.createValueNode("literal", "*", "*"));
        tree.addAtom(Node.createValueNode("literal", "c", "c"));
        tree.addBinary("bool", Node.createValueNode("literal", "||", "||"));

        const result = tree.commit();
        const expected = Node.createNode("expression", "add", [
            Node.createValueNode("literal", "a", "a"),
            Node.createValueNode("literal", "+", "+"),
            Node.createNode("expression", "mul", [
                Node.createValueNode("literal", "b", "b"),
                Node.createValueNode("literal", "*", "*"),
                Node.createValueNode("literal", "c", "c"),
            ]),
        ]);


        expect(result?.toString()).toBe("a+b*c");
        expect(result?.isEqual(expected)).toBe(true);
    });

    test("add Partial Binary With Equal Precedence", () => {
        const tree = new PrecedenceTree({
            mul: 0,
            add: 1,
            bool: 2
        }, {});

        tree.addAtom(Node.createValueNode("literal", "a", "a"));
        tree.addBinary("add", Node.createValueNode("literal", "+", "+"));
        tree.addAtom(Node.createValueNode("literal", "b", "b"));
        tree.addBinary("mul", Node.createValueNode("literal", "*", "*"));
        tree.addAtom(Node.createValueNode("literal", "c", "c"));
        tree.addBinary("mul", Node.createValueNode("literal", "*", "*"));

        const result = tree.commit();
        const expected = Node.createNode("expression", "add", [
            Node.createValueNode("literal", "a", "a"),
            Node.createValueNode("literal", "+", "+"),
            Node.createNode("expression", "mul", [
                Node.createValueNode("literal", "b", "b"),
                Node.createValueNode("literal", "*", "*"),
                Node.createValueNode("literal", "c", "c"),
            ]),
        ]);

        expect(result?.toString()).toBe("a+b*c");
        expect(result?.isEqual(expected)).toBe(true);
    });

    test("add Partial Binary With Equal Precedence And Right Associated", () => {
        const tree = new PrecedenceTree({
            mul: 0,
            add: 1,
            bool: 2
        }, { mul: Association.right });

        tree.addAtom(Node.createValueNode("literal", "a", "a"));
        tree.addBinary("add", Node.createValueNode("literal", "+", "+"));
        tree.addAtom(Node.createValueNode("literal", "b", "b"));
        tree.addBinary("mul", Node.createValueNode("literal", "*", "*"));
        tree.addAtom(Node.createValueNode("literal", "c", "c"));
        tree.addBinary("mul", Node.createValueNode("literal", "*", "*"));

        const result = tree.commit();
        const expected = Node.createNode("expression", "add", [
            Node.createValueNode("literal", "a", "a"),
            Node.createValueNode("literal", "+", "+"),
            Node.createNode("expression", "mul", [
                Node.createValueNode("literal", "b", "b"),
                Node.createValueNode("literal", "*", "*"),
                Node.createValueNode("literal", "c", "c"),
            ]),
        ]);

        expect(result?.toString()).toBe("a+b*c");
        expect(result?.isEqual(expected)).toBe(true);
    });

    test("mul Partial Binary With Greater Precedence", () => {
        const tree = new PrecedenceTree({
            mul: 0,
            add: 1,
            bool: 2
        }, {});

        tree.addAtom(Node.createValueNode("literal", "a", "a"));
        tree.addBinary("add", Node.createValueNode("literal", "+", "+"));
        tree.addAtom(Node.createValueNode("literal", "b", "b"));
        tree.addBinary("mul", Node.createValueNode("literal", "*", "*"));


        const result = tree.commit();
        const expected = Node.createNode("expression", "add", [
            Node.createValueNode("literal", "a", "a"),
            Node.createValueNode("literal", "+", "+"),
            Node.createValueNode("literal", "b", "b"),
        ]);

        expect(result?.toString()).toBe("a+b");
        expect(result?.isEqual(expected)).toBe(true);
    });

    test("addBinary without an atom throws", () => {
        const tree = new PrecedenceTree();

        expect(() => {
            tree.addBinary("add", Node.createValueNode("literal", "+", "+"));
        }).toThrow("Cannot add a binary without an atom node.");
    });

    test("Single binary without trailing atom reverts to atom", () => {
        const tree = new PrecedenceTree();

        tree.addAtom(Node.createValueNode("literal", "a", "a"));
        tree.addBinary("add", Node.createValueNode("literal", "+", "+"));
        // No trailing atom -- commit should revert the binary
        const result = tree.commit();

        expect(result?.toString()).toBe("a");
    });

    test("right-associated operator nests right even when a tighter operator sits between two of them", () => {
        // Regression: `a as b + c as d` with `add` tighter than `as`, and `as`
        // right-associated. `b + c` binds first (add is tighter), leaving two
        // equal-precedence right-associated `as` operators around it:
        //   a  as  (b + c)  as  d
        // Right association MUST nest to the right — `a as ((b+c) as d)` — so
        // the outer `as`'s left operand is the bare atom `a`. The bug produced
        // the LEFT-nested `(a as (b+c)) as d`, because when the second `as`
        // climbed ancestors it did not stop on an equal-precedence
        // right-associated ancestor.
        const tree = new PrecedenceTree(
            { add: 0, as: 1 },
            { as: Association.right }
        );

        tree.addAtom(Node.createValueNode("literal", "a", "a"));
        tree.addBinary("as", Node.createValueNode("literal", "as", "as"));
        tree.addAtom(Node.createValueNode("literal", "b", "b"));
        tree.addBinary("add", Node.createValueNode("literal", "+", "+"));
        tree.addAtom(Node.createValueNode("literal", "c", "c"));
        tree.addBinary("as", Node.createValueNode("literal", "as", "as"));
        tree.addAtom(Node.createValueNode("literal", "d", "d"));

        const result = tree.commit();

        // Flat text is identical for both nestings, so it can't catch the bug.
        expect(result?.toString()).toBe("aasb+casd");

        // Structure is what matters: the outer node is `as`, its LEFT operand
        // is the bare atom `a`, and its body (last child) is the inner `as`.
        expect(result?.name).toBe("as");
        expect(result?.children[0].name).toBe("a");
        expect(result?.children[result.children.length - 1].name).toBe("as");

        // And the inner `as`'s left operand is the `(b + c)` sub-expression.
        const inner = result?.children[result.children.length - 1];
        expect(inner?.children[0].name).toBe("add");
        expect(inner?.children[inner.children.length - 1].name).toBe("d");
    });
});