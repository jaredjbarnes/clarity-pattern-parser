export default class Visitor {
    constructor(root = null, selectedNodes = []) {
        this.root = root;
        this.selectedNodes = selectedNodes;
    }
    flatten() {
        this.selectedNodes.forEach((node) => {
            if (node.isComposite) {
                const children = [];
                Visitor.walkUp(node, (descendant) => {
                    if (!descendant.isComposite) {
                        children.push(descendant);
                    }
                });
                node.children = children;
            }
        });
        return this;
    }
    remove() {
        if (this.root == null) {
            return this;
        }
        this.recursiveRemove(this.root);
        return this;
    }
    recursiveRemove(node) {
        const nodesToRemove = this.selectedNodes;
        if (node.isComposite && Array.isArray(node.children)) {
            for (let x = 0; x < node.children.length; x++) {
                if (nodesToRemove.indexOf(node.children[x]) > -1) {
                    node.children.splice(x, 1);
                    x--;
                }
                else {
                    this.recursiveRemove(node.children[x]);
                }
            }
        }
    }
    wrap(callback) {
        const visitor = new Visitor(this.root);
        visitor.selectRoot().transform((node) => {
            if (this.selectedNodes.includes(node)) {
                return callback(node);
            }
            return node;
        });
        return this;
    }
    unwrap() {
        if (this.root == null) {
            return this;
        }
        Visitor.walkDown(this.root, (node, stack) => {
            if (this.selectedNodes.includes(node)) {
                const parent = stack[stack.length - 1];
                const grandParent = stack[stack.length - 2];
                if (parent != null && grandParent != null) {
                    const index = grandParent.children.indexOf(parent);
                    if (index > -1) {
                        grandParent.children.splice(index, 1, ...parent.children);
                    }
                }
            }
        });
        return this;
    }
    prepend(callback) {
        if (this.root == null) {
            return this;
        }
        Visitor.walkUp(this.root, (node, stack) => {
            if (this.selectedNodes.includes(node)) {
                const parent = stack[stack.length - 1];
                if (parent != null) {
                    const index = parent.children.indexOf(node);
                    if (index > -1) {
                        parent.children.splice(index, 0, callback(node));
                    }
                }
            }
        });
        return this;
    }
    append(callback) {
        if (this.root == null) {
            return this;
        }
        Visitor.walkDown(this.root, (node, stack) => {
            if (this.selectedNodes.includes(node)) {
                const parent = stack[stack.length - 1];
                if (parent != null) {
                    const index = parent.children.indexOf(node);
                    if (index > -1) {
                        parent.children.splice(index + 1, 0, callback(node));
                    }
                }
            }
        });
        return this;
    }
    transform(callback) {
        this.selectedNodes.forEach((node) => {
            return this.recursiveTransform(node, callback);
        });
        return this;
    }
    recursiveTransform(node, callback) {
        if (node.isComposite && Array.isArray(node.children)) {
            const length = node.children.length;
            for (let x = 0; x < length; x++) {
                node.children[x] = this.recursiveTransform(node.children[x], callback);
            }
        }
        return callback(node);
    }
    selectAll() {
        return this.select((n) => true);
    }
    selectNode(node) {
        return new Visitor(this.root, [...this.selectedNodes, node]);
    }
    deselectNode(node) {
        const visitor = new Visitor(this.root, this.selectedNodes.slice());
        return visitor.filter((n) => n !== node);
    }
    select(callback) {
        if (this.root == null) {
            return this;
        }
        const node = this.root;
        const selectedNodes = [];
        if (node.isComposite) {
            Visitor.walkDown(node, (descendant) => {
                if (callback(descendant)) {
                    selectedNodes.push(descendant);
                }
            });
        }
        return new Visitor(this.root, selectedNodes);
    }
    forEach(callback) {
        this.selectedNodes.forEach(callback);
        return this;
    }
    filter(callback) {
        return new Visitor(this.root, this.selectedNodes.filter(callback));
    }
    map(callback) {
        return new Visitor(this.root, this.selectedNodes.map(callback));
    }
    selectRoot() {
        if (this.root == null) {
            return this;
        }
        return new Visitor(this.root, [this.root]);
    }
    first() {
        return this.get(0);
    }
    last() {
        return this.get(this.selectedNodes.length - 1);
    }
    get(index) {
        const node = this.selectedNodes[index];
        if (node == null) {
            throw new Error(`Couldn't find node at index: ${index}, out of ${this.selectedNodes.length}.`);
        }
        return new Visitor(node, []);
    }
    clear() {
        this.selectedNodes = [];
        return this;
    }
    setRoot(root) {
        this.root = root;
        return this;
    }
    static select(root, callback) {
        if (callback != null) {
            return new Visitor(root).select(callback);
        }
        else {
            return new Visitor(root);
        }
    }
    static walkUp(node, callback, ancestors = []) {
        ancestors.push(node);
        if (node.isComposite && Array.isArray(node.children)) {
            const children = node.children.slice();
            children.forEach((c) => this.walkUp(c, callback, ancestors));
        }
        ancestors.pop();
        callback(node, ancestors);
        return this;
    }
    static walkDown(node, callback, ancestors = []) {
        callback(node, ancestors);
        ancestors.push(node);
        if (node.isComposite && Array.isArray(node.children)) {
            const children = node.children.slice();
            children.forEach((c) => this.walkDown(c, callback, ancestors));
        }
        ancestors.pop();
        return this;
    }
}
//# sourceMappingURL=Visitor.js.map