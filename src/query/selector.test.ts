import { Node } from "../ast/Node";
import { Selector } from "./selector";

function createNodeTree() {
    return Node.createNode("node", "root", [
        Node.createNode("node", "grand-parent", [
            Node.createNode("node", "parent", [
                Node.createValueNode("node", 'child', "1"),
                Node.createValueNode("node", 'child', "2"),
                Node.createValueNode("node", 'child', "3"),
                Node.createValueNode("node", 'child', "4"),
            ]),
            Node.createNode("node", "parent", [
                Node.createValueNode("node", 'child', "5"),
                Node.createValueNode("node", 'child', "6"),
                Node.createValueNode("node", 'child', "7"),
                Node.createValueNode("node", 'child', "8"),
            ]),
            Node.createNode("node", "parent", [
                Node.createValueNode("node", 'child', "9"),
                Node.createValueNode("node", 'child', "10"),
                Node.createValueNode("node", 'child', "11"),
                Node.createValueNode("node", 'child', "12"),
            ])
        ]),
        Node.createNode("node", "grand-parent", [
            Node.createNode("node", "parent", [
                Node.createValueNode("node", 'child', "13"),
                Node.createValueNode("node", 'child', "14"),
                Node.createValueNode("node", 'child', "15"),
                Node.createValueNode("node", 'child', "16"),
            ]),
            Node.createNode("node", "parent", [
                Node.createValueNode("node", 'child', "17"),
                Node.createValueNode("node", 'child', "18"),
                Node.createValueNode("node", 'child', "19"),
                Node.createValueNode("node", 'child', "20"),
            ]),
            Node.createNode("node", "parent", [
                Node.createValueNode("node", 'child', "21"),
                Node.createValueNode("node", 'child', "22"),
                Node.createValueNode("node", 'child', "23"),
                Node.createValueNode("node", 'child', "24"),
            ])
        ])
    ]);
}

describe("Selector", () => {

    test("Node Selector", () => {
        const tree = createNodeTree();

        const selector = new Selector("child");
        const result = selector.executeOn([tree]);

        expect(result.length).toBe(24);
        expect(result.map(n => n.toString()).join(",")).toEqual("1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24");
    });

    test("Descendant Selector", () => {
        const tree = createNodeTree();

        const selector = new Selector("grand-parent child");
        const result = selector.executeOn([tree]);

        expect(result.length).toBe(24);
        expect(result.map(n => n.toString()).join(",")).toEqual("1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24");
    });

    test("Descendant Selector Miss", () => {
        const tree = createNodeTree();

        const selector = new Selector("grand-parent not-a-node");
        const result = selector.executeOn([tree]);

        expect(result.length).toBe(0);
        expect(result.map(n => n.toString()).join(",")).toEqual("");
    });

    test("Direct Child", () => {
        const tree = createNodeTree();

        const selector = new Selector("grand-parent > parent");
        const result = selector.executeOn([tree]);

        expect(result.length).toBe(6);
        expect(result.map(n => n.toString()).join(",")).toEqual("1234,5678,9101112,13141516,17181920,21222324");
    });

    test("More Than One Direct Child", () => {
        const tree = createNodeTree();

        const selector = new Selector("grand-parent > parent > child");
        const result = selector.executeOn([tree]);

        expect(result.length).toBe(24);
        expect(result.map(n => n.toString()).join(",")).toEqual("1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24");
    });

    test("Direct Child With Attribute", () => {
        const tree = createNodeTree();

        const selector = new Selector("grand-parent > parent > child[value='4']");
        const result = selector.executeOn([tree]);

        expect(result.length).toBe(1);
        expect(result.map(n => n.toString()).join(",")).toEqual("4");
    });
});