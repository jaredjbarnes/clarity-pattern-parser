import { Node } from "../ast/Node";
import { $ } from "./query";

function createNodeTree() {
    const node = Node.createNode("node", "root", [
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
    node.normalize();
    return node;
}

describe("Query", () => {
    test("Construct", () => {
        const root = createNodeTree();

        const children = $(root, "child");
        const result = children.toArray().map(n => n.value).join(",");

        expect(result).toBe("1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24");
    });

    test("First", () => {
        const root = createNodeTree();

        const children = $(root, "child").first();
        const result = children.toArray().map(n => n.value).join(",");

        expect(result).toBe("1");
    });

    test("Last", () => {
        const root = createNodeTree();

        const children = $(root, "child").last();
        const result = children.toArray().map(n => n.value).join(",");

        expect(result).toBe("24");
    });

    test("Parent", () => {
        const root = createNodeTree();

        const children = $(root, "child").parent();
        const result = children.toArray();

        expect(result.length).toBe(6);
        expect(result.map(n => n.value).join(",")).toBe("1234,5678,9101112,13141516,17181920,21222324");
    });

    test("Parents", () => {
        const root = createNodeTree();

        const children = $(root, "child").parents("grand-parent parent[value='1234']");
        const result = children.toArray();

        expect(result.length).toBe(1);
        expect(result.map(n => n.value).join(",")).toBe("1234");
    });

    test("Filter", () => {
        const root = createNodeTree();

        const children = $(root, "parent").filter("grand-parent parent[value='1234']");
        const result = children.toArray();

        expect(result.length).toBe(1);
        expect(result.map(n => n.value).join(",")).toBe("1234");
    });

    test("Not", () => {
        const root = createNodeTree();

        const children = $(root, "parent").not("grand-parent parent[value='1234']");
        const result = children.toArray();

        expect(result.length).toBe(5);
        expect(result.map(n => n.value).join(",")).toBe("5678,9101112,13141516,17181920,21222324");
    });

    test("First Before", () => {
        const root = createNodeTree();

        $(root, "child").first().before(() => Node.createValueNode("node", "adopted-child", "0"));

        const adoptedChild = root.find(n => n.name === "adopted-child");
        const firstChild = root.find(n => n.value === "1");
        expect(adoptedChild?.nextSibling()).toBe(firstChild);
    });

    test("Last After", () => {
        const root = createNodeTree();

        $(root, "child").last().after(() => Node.createValueNode("node", "adopted-child", "25"));

        const adoptedChild = root.find(n => n.name === "adopted-child");
        const lastChild = root.find(n => n.value === "24");
        expect(adoptedChild?.previousSibling()).toBe(lastChild);
    });

    test("Append", () => {
        const root = createNodeTree();

        const parents = $(root, "parent").append((n) => {
            const lastChild = n.children[n.children.length - 1];
            const value = Number(lastChild.value) + 1;
            return Node.createValueNode("node", "adopted-child", String(value));
        }).toArray();

        const haveFiveChildren = parents.every(n => n.children.length === 5);
        expect(haveFiveChildren).toBeTruthy();
        expect(parents.map(n => n.toString()).join(",")).toBe("12345,56789,910111213,1314151617,1718192021,2122232425");
    });

    test("Prepend", () => {
        const root = createNodeTree();

        const parents = $(root, "parent").prepend((n) => {
            const firstChild = n.children[0];
            const value = Number(firstChild.value) - 1;
            return Node.createValueNode("node", "adopted-child", String(value));
        }).toArray();

        const haveFiveChildren = parents.every(n => n.children.length === 5);
        expect(haveFiveChildren).toBeTruthy();
        expect(parents.map(n => n.toString()).join(",")).toBe("01234,45678,89101112,1213141516,1617181920,2021222324");
    });

    test("ReplaceWith", () => {
        const root = createNodeTree();

        $(root, "child").replaceWith(() => Node.createValueNode("node", "child", "b"));

        expect(root.toString()).toBe("bbbbbbbbbbbbbbbbbbbbbbbb");
    });

});