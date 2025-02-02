import { PrecedenceTree } from "./PrecedenceTree";
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

        let result = tree.commit();

        expect(true).toBe(true);
    });

    test("add Prefix", () => {
        const tree = new PrecedenceTree();

        tree.addPrefix("negate", Node.createValueNode("literal", "!", "!"));
        tree.addPrefix("increment", Node.createValueNode("literal", "++", "++"));
        tree.addPrefix("plus", Node.createValueNode("literal", "+", "+"));
        tree.addAtom(Node.createValueNode("literal", "a", "a"));

        let result = tree.commit();
        expect(true).toBe(true);
    });

    test("add Postfix", () => {
        const tree = new PrecedenceTree();

        tree.addPostfix("decrement", Node.createValueNode("literal", "--", "--"));
        tree.addPostfix("increment", Node.createValueNode("literal", "++", "++"));
        tree.addAtom(Node.createValueNode("literal", "a", "a"));

        let result = tree.commit();
        expect(true).toBe(true);
    });

    test("all", () => {
        const tree = new PrecedenceTree({
            mul: 0,
            add: 1,
            bool: 2
        }, {});

        tree.addPrefix("negate", Node.createValueNode("literal", "!", "!"));
        tree.addPostfix("negate", Node.createValueNode("literal", "++", "++"));
        tree.addAtom(Node.createValueNode("literal", "a", "a"));
        tree.addBinary("mul", Node.createValueNode("literal", "*", "*"));
        tree.addAtom(Node.createValueNode("literal", "b", "b"));
        tree.addBinary("add", Node.createValueNode("literal", "+", "+"));
        tree.addAtom(Node.createValueNode("literal", "c", "c"));

        let result = tree.commit();
        expect(true).toBe(true);
    });

    test("Incomplete", () => {
        const tree = new PrecedenceTree({
            mul: 0,
            add: 1,
            bool: 2
        }, {});

        tree.addPrefix("negate", Node.createValueNode("literal", "!", "!"));
        tree.addPostfix("negate", Node.createValueNode("literal", "++", "++"));
        tree.addAtom(Node.createValueNode("literal", "a", "a"));
        tree.addBinary("mul", Node.createValueNode("literal", "*", "*"));
        tree.addAtom(Node.createValueNode("literal", "b", "b"));
        tree.addBinary("add", Node.createValueNode("literal", "+", "+"));
        tree.addAtom(Node.createValueNode("literal", "c", "c"));
        tree.addBinary("mul", Node.createValueNode("literal", "*", "*"));

        let result = tree.commit();
        expect(true).toBe(true);
    });
});