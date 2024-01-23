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
        expect(parent.value).toBe("BA")
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
        expect(parent.value).toBe("AB")
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
        expect(parent.value).toBe("AB")
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
        expect(parent.value).toBe("BA")
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
        expect(parent.value).toBe("B")
        expect(parent.children[0]).toBe(b);
        expect(a.parent).toBeNull();
        expect(b.parent).toBe(parent);
        expect(a.value).toBe("A");
        expect(b.value).toBe("B");
    });

    test("Next Sibling", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        new Node("parent", "parent", 0, 0, [a, b]);

        const nextSibling = a.nextSibling()

        expect(nextSibling).toBe(b);
    });

    test("Next Sibling (No Parent)", () => {
        const a = new Node("a", "a", 0, 0, [], "A");

        const nextSibling = a.nextSibling()
        expect(nextSibling).toBeNull;
    });

    test("Next Sibling (Last Child)", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        new Node("parent", "parent", 0, 0, [a, b]);

        const nextSibling = b.nextSibling()
        expect(nextSibling).toBeNull;
    });

    test("Previous Sibling", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        new Node("parent", "parent", 0, 0, [a, b]);

        const previousSibling = b.previousSibling()

        expect(previousSibling).toBe(a);
    });

    test("Previous Sibling (No Parent)", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const previousSibling = a.previousSibling()
        expect(previousSibling).toBeNull();
    });

    test("Previous Sibling (First Child)", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        new Node("parent", "parent", 0, 0, [a, b]);

        const previousSibling = a.previousSibling()
        expect(previousSibling).toBeNull;
    });

    test("Find", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        const parent = new Node("parent", "parent", 0, 0, [a, b]);

        const result = parent.find(n => n.name === "a");

        expect(result).toBe(a)
    });

    test("Walk Down", () => {
        const result: Node[] = [];
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        const parent = new Node("parent", "parent", 0, 0, [a, b]);

        parent.walkDown((n) => {
            result.push(n)
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
            result.push(n)
        });

        const expected = [a, b, parent];

        expect(result).toEqual(expected);
    });

    test("Clone", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        const parent = new Node("parent", "parent", 0, 0, [a, b]);
        const clone = parent.clone();

        expect(clone).toEqual(parent)
    });

    test("Turn Into JSON", () => {
        const a = new Node("a", "a", 0, 0, [], "A");
        const b = new Node("b", "b", 0, 0, [], "B");
        const parent = new Node("parent", "parent", 0, 0, [a, b]);
        const result = parent.toJson();
        const expected = JSON.stringify({
            type: "parent",
            name: "parent",
            value: "AB",
            firstIndex: 0,
            lastIndex: 0,
            startIndex: 0,
            endIndex: 1,
            children: [{
                type: "a",
                name: "a",
                value: "A",
                firstIndex: 0,
                lastIndex: 0,
                startIndex: 0,
                endIndex: 1,
                children: [],
            }, {
                type: "b",
                name: "b",
                value: "B",
                firstIndex: 0,
                lastIndex: 0,
                startIndex: 0,
                endIndex: 1,
                children: [],
            }],
        });

        expect(result).toEqual(expected)
    });

});