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
        expect(result?.toCycleFreeObject()).toEqual(expected.toCycleFreeObject());
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
        expect(result?.toCycleFreeObject()).toEqual(expected.toCycleFreeObject());
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
        expect(result?.toCycleFreeObject()).toEqual(expected.toCycleFreeObject());
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
        expect(result?.toCycleFreeObject()).toEqual(expected.toCycleFreeObject());
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
        expect(result?.toCycleFreeObject()).toEqual(expected.toCycleFreeObject());
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
        expect(result?.toCycleFreeObject()).toEqual(expected.toCycleFreeObject());
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
        expect(result?.toCycleFreeObject()).toEqual(expected.toCycleFreeObject());
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
        expect(result?.toCycleFreeObject()).toEqual(expected.toCycleFreeObject());
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
        expect(result?.toCycleFreeObject()).toEqual(expected.toCycleFreeObject());
    });
});