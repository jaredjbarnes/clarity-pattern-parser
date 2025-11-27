import { Node } from "./Node";

describe("Node", () => {
    test("Create", () => {
        const node = new Node("type", "name", 0, 0, [], "value");

        expect(node.type).toBe("type");
        expect(node.name).toBe("name");
        expect(node.value).toBe("value");
        expect(node.firstIndex).toBe(0);
        expect(node.lastIndex).toBe(0);
        expect(node.startIndex).toBe(0);
        expect(node.endIndex).toBe(1);
        expect(node.parent).toBeNull();
        expect(node.children.length).toBe(0);
    });

    test("Properties", () => {
        const child = new Node("child", "child", 0, 0, undefined, "Content");
        const parent = new Node("parent", "parent", 0, 0, [
            child,
        ]);

        expect(parent.hasChildren).toBeTruthy();
        expect(child.parent).toBe(parent);
        expect(parent.children[0]).toBe(child);
        expect(child.type).toBe("child");
        expect(parent.value).toBe("Content");
        expect(child.value).toBe("Content");
        expect(child.name).toBe("child");
        expect(child.firstIndex).toBe(0);
        expect(child.lastIndex).toBe(0);
        expect(child.startIndex).toBe(0);
        expect(child.endIndex).toBe(1);
    });

    test("Create Tree", () => {
        const child = new Node("child", "child", 0, 0, [], "Child");
        const parent = new Node("parent", "parent", 0, 0, [child]);

        expect(parent.value).toBe(child.value);
    });

    test("Remove Child", () => {
        const child = new Node("child", "child", 0, 0, [], "Child");
        const parent = new Node("parent", "parent", 0, 0, [child]);

        parent.removeChild(child);

        expect(parent.children.length).toBe(0);
        expect(child.parent).toBeNull();
        expect(parent.value).toBe("");
        expect(child.value).toBe("Child");
    });

    test("Remove all Child", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        const parent = new Node("parent", "parent", 0, 0, [a, b], "Fallback Value");

        expect(parent.children.length).toBe(2);
        expect(a.parent).toBe(parent);
        expect(b.parent).toBe(parent);
        expect(parent.value).toBe("AB");
        expect(a.value).toBe("A");
        expect(b.value).toBe("B");

        parent.removeAllChildren();

        expect(parent.children.length).toBe(0);
        expect(a.parent).toBeNull();
        expect(b.parent).toBeNull();
        expect(parent.value).toBe("Fallback Value");
        expect(a.value).toBe("A");
        expect(b.value).toBe("B");
    });

    test("Replace Child", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        const parent = new Node("parent", "parent", 0, 0, [a]);

        parent.replaceChild(b, a);

        expect(parent.children.length).toBe(1);
        expect(a.parent).toBeNull();
        expect(b.parent).toBe(parent);
        expect(a.value).toBe("A");
        expect(b.value).toBe("B");
    });

    test("Insert Child", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        const parent = new Node("parent", "parent", 0, 0, [a]);

        expect(parent.value).toBe("A");

        parent.insertBefore(b, a);

        expect(parent.children.length).toBe(2);
        expect(parent.value).toBe("BA");
        expect(parent.children[0]).toBe(b);
        expect(parent.children[1]).toBe(a);
        expect(a.parent).toBe(parent);
        expect(b.parent).toBe(parent);
        expect(a.value).toBe("A");
        expect(b.value).toBe("B");
    });

    test("Insert Child With Null Reference", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        const parent = new Node("parent", "parent", 0, 0, [a]);

        expect(parent.value).toBe("A");

        parent.insertBefore(b, null);

        expect(parent.children.length).toBe(2);
        expect(parent.value).toBe("AB");
        expect(parent.children[0]).toBe(a);
        expect(parent.children[1]).toBe(b);
        expect(a.parent).toBe(parent);
        expect(b.parent).toBe(parent);
        expect(a.value).toBe("A");
        expect(b.value).toBe("B");
    });

    test("Append Child", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        const parent = new Node("parent", "parent", 0, 0, [a]);

        expect(parent.value).toBe("A");

        parent.appendChild(b);

        expect(parent.children.length).toBe(2);
        expect(parent.value).toBe("AB");
        expect(parent.children[0]).toBe(a);
        expect(parent.children[1]).toBe(b);
        expect(a.parent).toBe(parent);
        expect(b.parent).toBe(parent);
        expect(a.value).toBe("A");
        expect(b.value).toBe("B");
    });

    test("Splice Children", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        const parent = new Node("parent", "parent", 0, 0, [a]);

        expect(parent.value).toBe("A");

        parent.spliceChildren(0, 0, b);

        expect(parent.children.length).toBe(2);
        expect(parent.value).toBe("BA");
        expect(parent.children[0]).toBe(b);
        expect(parent.children[1]).toBe(a);
        expect(a.parent).toBe(parent);
        expect(b.parent).toBe(parent);
        expect(a.value).toBe("A");
        expect(b.value).toBe("B");
    });

    test("Splice Children (Replace)", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        const parent = new Node("parent", "parent", 0, 0, [a]);

        expect(parent.value).toBe("A");

        parent.spliceChildren(0, 1, b);

        expect(parent.children.length).toBe(1);
        expect(parent.value).toBe("B");
        expect(parent.children[0]).toBe(b);
        expect(a.parent).toBeNull();
        expect(b.parent).toBe(parent);
        expect(a.value).toBe("A");
        expect(b.value).toBe("B");
    });

    test("Remove", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        const parent = new Node("parent", "parent", 0, 0, [a, b]);

        parent.find(p => p.name === "b")?.remove();

        expect(parent.children.length).toBe(1);
        expect(parent.value).toBe("A");
        expect(parent.children[0]).toBe(a);
        expect(a.parent).toBe(parent);
        expect(b.parent).toBeNull();
        expect(a.value).toBe("A");
    });

    test("Next Sibling", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        new Node("parent", "parent", 0, 0, [a, b]);

        const nextSibling = a.nextSibling();

        expect(nextSibling).toBe(b);
    });

    test("Next Sibling (No Parent)", () => {
        const a = new Node("a", "a", 0, 0, [], "A");

        const nextSibling = a.nextSibling();
        expect(nextSibling).toBeNull;
    });

    test("Next Sibling (Last Child)", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        new Node("parent", "parent", 0, 0, [a, b]);

        const nextSibling = b.nextSibling();
        expect(nextSibling).toBeNull;
    });

    test("Previous Sibling", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        new Node("parent", "parent", 0, 0, [a, b]);

        const previousSibling = b.previousSibling();

        expect(previousSibling).toBe(a);
    });

    test("Previous Sibling (No Parent)", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const previousSibling = a.previousSibling();
        expect(previousSibling).toBeNull();
    });

    test("Previous Sibling (First Child)", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        new Node("parent", "parent", 0, 0, [a, b]);

        const previousSibling = a.previousSibling();
        expect(previousSibling).toBeNull;
    });

    test("Find", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        const parent = new Node("parent", "parent", 0, 0, [a, b]);

        const result = parent.find(n => n.name === "a");

        expect(result).toBe(a);
    });

    test("Walk Down", () => {
        const result: Node[] = [];
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        const parent = new Node("parent", "parent", 0, 0, [a, b]);

        parent.walkDown((n) => {
            result.push(n);
        });

        const expected = [parent, a, b];

        expect(result).toEqual(expected);
    });

    test("Walk Up", () => {
        const result: Node[] = [];
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        const parent = new Node("parent", "parent", 0, 0, [a, b]);

        parent.walkUp((n) => {
            result.push(n);
        });

        const expected = [a, b, parent];

        expect(result).toEqual(expected);
    });

    test("Clone", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        const parent = new Node("parent", "parent", 0, 0, [a, b]);
        const clone = parent.clone();

        expect(clone.isEqual(parent)).toBeTruthy();
    });

    test("Turn Into JSON", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        const parent = new Node("parent", "parent", 0, 0, [a, b]);
        const result = parent.toJson();
        const expected = JSON.stringify({
            id: parent.id,
            type: "parent",
            name: "parent",
            value: "AB",
            startIndex: 0,
            endIndex: 1,
            children: [{
                id: parent.children[0].id,
                type: "a",
                name: "a",
                value: "A",
                startIndex: 0,
                endIndex: 1,
                children: [],
            }, {
                id: parent.children[1].id,
                type: "b",
                name: "b",
                value: "B",
                startIndex: 0,
                endIndex: 1,
                children: [],
            }],
        });

        expect(result).toEqual(expected);
    });

    test("Compact", () => {
        const parent = new Node("parent", "parent", 0, 6, [
            new Node("child", "child", 0, 6, undefined, "Content")
        ]);

        parent.compact();

        expect(parent.hasChildren).toBeFalsy();
        expect(parent.value).toBe("Content");
    });

    test("Flatten", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 1, 1, [], "B");
        const c = new Node("c", "c", 2, 2, [], "C");

        const parent = new Node("parent", "parent", 0, 1, [
            a,
            b,
        ]);

        const grandParent = new Node("grand-parent", "grand-parent", 0, 2, [
            parent,
            c,
        ]);

        const nodes = grandParent.flatten();
        const expected = [a, b, c];

        expect(nodes).toEqual(expected);
    });

    test("Find Ancester", () => {
        const child = new Node("child", "child", 0, 0, []);
        const parent = new Node("parent", "parent", 0, 0, [child]);
        const grandParent = new Node("grand-parent", "grand-parent", 0, 0, [parent]);
        const result = child.findAncestor(p => p.name === "grand-parent");

        expect(result).toBe(grandParent);
    });

    test("Find Ancester Without Parent", () => {
        const child = new Node("child", "child", 0, 0, []);
        const result = child.findAncestor(p => p.name === "parent");
        expect(result).toBeNull();
    });

    test("Normalize values and index", () => {
        const firstChild = new Node("literal", "first", 0, 0, [], "first");
        const secondChild = new Node("literal", "second", 0, 0, [], "second");
        const parent = new Node("literal", "parent", 0, 0);

        parent.appendChild(firstChild);
        parent.appendChild(secondChild);

        parent.normalize();

        expect(parent.startIndex).toBe(0);
        expect(parent.firstIndex).toBe(0);
        expect(parent.lastIndex).toBe(10);
        expect(parent.endIndex).toBe(11);
    });

    test("Normalize values and index deep", () => {
        const firstChild = new Node("literal", "first", 0, 0, [], "first");
        const secondChild = new Node("literal", "second", 0, 0, [], "second");
        const grandChild = new Node("literal", "three", 0, 0, [], "three");
        const parent = new Node("literal", "parent", 0, 0);

        parent.appendChild(firstChild);
        parent.appendChild(secondChild);

        parent.normalize();

        secondChild.appendChild(grandChild);
        parent.normalize();

        expect(parent.startIndex).toBe(0);
        expect(parent.firstIndex).toBe(0);
        expect(parent.lastIndex).toBe(9);
        expect(parent.endIndex).toBe(10);
    });

    test("Normalize values with no values", () => {
        const node = new Node("literal", "node", 0, 0, [], "");
        node.normalize();

        expect(node.startIndex).toBe(0);
        expect(node.firstIndex).toBe(0);
        expect(node.lastIndex).toBe(0);
        expect(node.endIndex).toBe(1);
    });

    test("ReplaceWith", () => {
        const parent = new Node("node", "parent", 0, 0, [
            new Node("node", "first", 0, 0, [], "first"),
            new Node("node", "second", 0, 0, [], "second"),
        ]);

        const first = parent.find(n => n.name === "first") as Node;
        const newNode = new Node("node", "new", 0, 0, [], "new");
        first.replaceWith(newNode);

        const result = parent.find(n => n.name === "new") as Node;

        expect(result).toBe(newNode);
        expect(first.parent).toBeNull();
        expect(result.parent).toBe(parent);

    });

    test("Transform", () => {
        const node = Node.createNode("family", "grandparent", [
            Node.createNode("family", "parent", [
                Node.createValueNode("family", "child", "John"),
                Node.createValueNode("family", "child", "Jane"),
                Node.createValueNode("family", "child", "Jack")
            ]),
            Node.createValueNode("family", "aunt", "aunt")
        ]);

        const result = node.transform({
            "child": (node: Node) => {
                return Node.createValueNode("family", "adopted-child", node.value);
            },
            "parent": (node) => {
                return Node.createNode("family", "adopted-parent", node.children.slice());
            },
            "grandparent": (node) => {
                return Node.createNode("family", "adopted-grandparent", node.children.slice());
            }
        });

        const expected = Node.createNode("family", "adopted-grandparent", [
            Node.createNode("family", "adopted-parent", [
                Node.createValueNode("family", "adopted-child", "John"),
                Node.createValueNode("family", "adopted-child", "Jane"),
                Node.createValueNode("family", "adopted-child", "Jack")
            ]),
            Node.createValueNode("family", "aunt", "aunt")
        ]);

        expect(result.isEqual(expected)).toBeTruthy();
    });

    test("Find All", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        const a2 = a.clone();
        const parent = new Node("parent", "parent", 0, 0, [a, b, a2]);

        const result = parent.findAll(n => n.name === "a");
        expect(result).toEqual([a, a2]);
    });

    test("Breadth First Early Exit", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        const a2 = a.clone();
        const parent = new Node("parent", "parent", 0, 0, [a, b, a2]);

        let count = 0;
        parent.walkBreadthFirst(n => {
            count++;
            if (n.name === "a") {
                return false;
            }
            return true;
        });

        expect(count).toBe(2);
    });

    test("Find All (Breadth First)", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        const a2 = a.clone();
        const parent = new Node("parent", "parent", 0, 0, [a, b, a2]);

        const result = parent.findAll(n => n.name === "a", true);
        expect(result).toEqual([a, a2]);
    });

});