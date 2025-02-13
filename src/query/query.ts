import { Node } from "../ast/Node";
import { Selector } from "./selector";

export class Query {
    private _context: Node[];
    private _prevQuery: Query | null;

    constructor(context: Node[], prevQuery: Query | null = null) {
        this._context = context;
        this._prevQuery = prevQuery;
    }

    toArray() {
        return this._context.slice();
    }

    // Modifiers
    append(visitor: (node: Node) => Node) {
        this._context.forEach(n => {
            const parent = n.parent;

            if (parent == null) {
                return;
            }
            const newNode = visitor(n);
            n.appendChild(newNode);
        });

        return this;
    }

    prepend(visitor: (node: Node) => Node) {
        this._context.forEach(n => {
            const parent = n.parent;

            if (parent == null) {
                return;
            }
            const newNode = visitor(n);
            n.insertBefore(newNode, n.children[0]);
        });

        return this;
    }

    after(visitor: (node: Node) => Node) {
        this._context.forEach(n => {
            const parent = n.parent;

            if (parent == null) {
                return;
            }
            const index = parent.findChildIndex(n);
            const newNode = visitor(n);

            parent.spliceChildren(index + 1, 0, newNode);
        });

        return this;
    }

    before(visitor: (node: Node) => Node) {
        this._context.forEach(n => {
            const parent = n.parent;

            if (parent == null) {
                return;
            }
            const index = parent.findChildIndex(n);
            const newNode = visitor(n);

            parent.spliceChildren(index, 0, newNode);
        });

        return this;
    }

    replaceWith(visitor: (node: Node) => Node) {
        this._context.forEach(n => {
            const newNode = visitor(n);
            n.replaceWith(newNode);
        });

        return this;
    }

    compact() {
        this._context.forEach(n => {
            n.compact();
        });

        return this;
    }

    setValue(value: string) {
        this.replaceWith((n) => {
            return Node.createValueNode(n.type, n.name, value);
        });

        return this;
    }

    normalize() {
        const first = this._context[0];

        if (first != null) {
            first.findRoot().normalize();
        }
    }

    remove() {
        this._context.forEach(n => {
            n.remove();
        });

        return this;
    }

    // Filters from the currently matched nodes
    slice(start: number, end?: number) {
        return new Query(this._context.slice(start, end));
    }

    filter(selectorString: string) {
        const selector = new Selector(selectorString);
        const newContext = selector.filter(this._context);

        return new Query(newContext, this);
    }

    // Selects out of all descedants of currently matched nodes
    find(selectorString: string) {
        const selector = new Selector(selectorString);
        const newContext = selector.find(this._context);

        return new Query(newContext, this);
    }

    // Remove nodes from the set of matched nodes.
    not(selectorString: string) {
        const selector = new Selector(selectorString);
        const newContext = selector.not(this._context);

        return new Query(newContext, this);
    }

    // Select the parent of currently matched nodes
    parent() {
        const parents = this._context.map(n => n.parent);
        const result = new Set<Node>();
        parents.forEach((n) => {
            if (n != null) {
                result.add(n);
            }
        });

        return new Query(Array.from(result), this);
    }

    // Select the ancestors of currently matched nodes
    parents(selectorString: string) {
        const selector = new Selector(selectorString);
        const newContext = selector.parents(this._context);

        const result = new Set<Node>();
        newContext.forEach((n) => {
            if (n != null) {
                result.add(n);
            }
        });

        return new Query(Array.from(result), this);
    }

    first() {
        return new Query(this._context.slice(0, 1), this);
    }

    last() {
        return new Query(this._context.slice(-1), this);
    }

    // Pop query stack
    end() {
        if (this._prevQuery) {
            return this._prevQuery;
        }
        return this;
    }

    length() {
        return this._context.length;
    }

}

export function $(root: Node, selector?: string) {
    if (selector == null) {
        return new Query([root]);
    } else {
        return new Query([root]).find(selector);
    }

}
