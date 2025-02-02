import { Node } from "../ast/Node";

export enum Association {
    left = 0,
    right,
}

export class PrecedenceTree {
    private _prefixPlaceholder: Node;
    private _prefixNode: Node | null;
    private _postfixPlaceholder: Node;
    private _postfixNode: Node | null;
    private _binaryPlaceholder: Node;
    private _binaryNode: Node | null;
    private _atomNode: Node | null;
    private _orphanedAtom: Node | null;
    private _precedenceMap: Record<string, number>;
    private _associationMap: Record<string, Association>;

    constructor(precedenceMap: Record<string, number> = {}, associationMap: Record<string, Association> = {}) {
        this._prefixPlaceholder = Node.createNode("placeholder", "prefix-placeholder");
        this._prefixNode = null;
        this._postfixPlaceholder = Node.createNode("placeholder", "postfix-placeholder");
        this._postfixNode = null;
        this._binaryPlaceholder = Node.createNode("placeholder", "binary-placeholder");
        this._atomNode = null;
        this._binaryNode = null;
        this._orphanedAtom = null;
        this._precedenceMap = precedenceMap;
        this._associationMap = associationMap;
    }

    addPrefix(name: string, ...prefix: Node[]) {
        const lastPrefixNode = this._prefixNode;

        if (lastPrefixNode == null) {
            const node = Node.createNode("expression", name, [...prefix]);
            this._prefixNode = node;
            this._prefixNode.append(this._prefixPlaceholder);
            return;
        }

        const node = Node.createNode("expression", name, [...prefix]);
        this._prefixPlaceholder.replaceWith(node);
        node.append(this._prefixPlaceholder);

        this._prefixNode = node;
    }

    addPostfix(name: string, ...postfix: Node[]) {
        const lastPostfixNode = this._postfixNode;

        if (lastPostfixNode == null) {
            const node = Node.createNode("expression", name, [this._postfixPlaceholder, ...postfix]);
            this._postfixNode = node;
            return;
        }

        const node = Node.createNode("expression", name, [lastPostfixNode, ...postfix]);
        this._postfixNode = node;
    }

    addBinary(name: string, ...delimiterNode: Node[]) {
        const lastBinaryNode = this._binaryNode;
        const lastPrecendece = this._getPrecedenceFromNode(this._binaryNode);
        const precedence = this._getPrecedence(name);
        const association = this._associationMap[name];
        const lastAtomNode = this._compileAtomNode();

        if (lastAtomNode == null) {
            throw new Error("Cannot add a binary without an atom node.");
        }

        this._binaryPlaceholder.remove();
        this._orphanedAtom = lastAtomNode;

        if (lastBinaryNode == null) {
            const node = Node.createNode("expression", name, [lastAtomNode, ...delimiterNode, this._binaryPlaceholder]);

            this._binaryNode = node;
            return;
        }

        if (precedence === lastPrecendece && association === Association.right) {
            const node = Node.createNode("expression", name, [lastAtomNode, ...delimiterNode, this._binaryPlaceholder]);

            lastBinaryNode.appendChild(node);

            this._binaryNode = node;
        } else if (precedence === lastPrecendece) {
            const node = Node.createNode("expression", name, []);

            lastBinaryNode.replaceWith(node);
            lastBinaryNode.appendChild(lastAtomNode);

            node.append(lastBinaryNode, ...delimiterNode, this._binaryPlaceholder);
            this._binaryNode = node;
        } else if (precedence > lastPrecendece) {
            let ancestor = lastBinaryNode.parent;
            let root = lastBinaryNode;

            while (ancestor != null) {
                const nodePrecedence = this._precedenceMap[ancestor.name];

                if (nodePrecedence > precedence) {
                    break;
                }
                root = ancestor;
                ancestor = ancestor.parent;
            }

            lastBinaryNode.appendChild(lastAtomNode);

            const node = Node.createNode("expression", name, []);
            root.replaceWith(node);
            node.append(root, ...delimiterNode, this._binaryPlaceholder);

            this._binaryNode = node;


        } else {
            const node = Node.createNode("expression", name, [lastAtomNode, ...delimiterNode, this._binaryPlaceholder]);
            lastBinaryNode.appendChild(node);

            this._binaryNode = node;
        }

    }

    private _getPrecedenceFromNode(node: Node | null) {
        if (node == null) {
            return 0;
        }

        return this._getPrecedence(node.name);
    }

    private _getPrecedence(name: string) {
        if (this._precedenceMap[name] != null) {
            return this._precedenceMap[name];
        }

        return 0;
    }

    private _compileAtomNode() {
        let node = this._atomNode;

        if (this._prefixNode != null && this._atomNode != null) {
            node = this._prefixNode;
            this._prefixPlaceholder.replaceWith(this._atomNode);
        }

        if (this._postfixNode != null && node != null) {
            this._postfixPlaceholder.replaceWith(node);
            node = this._postfixNode;
        }

        this._prefixNode = null;
        this._atomNode = null;
        this._postfixNode = null;

        if (node == null) {
            return null;
        }

        return node.findRoot();
    }

    addAtom(node: Node) {
        this._atomNode = node;
    }

    commit() {
        if (this._binaryNode == null) {
            return this._compileAtomNode();
        }

        const atomNode = this._compileAtomNode();

        if (atomNode == null) {
            let root = this._binaryPlaceholder.findRoot();
            this._binaryPlaceholder.parent?.replaceWith(this._orphanedAtom as Node);
            return root;
        } else {
            this._binaryPlaceholder.replaceWith(atomNode);
            return this._binaryNode.findRoot();
        }

    }

}