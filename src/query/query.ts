import { Node } from "../ast/Node";
import { Selector } from "./selector";

export class Query {
    private _context: Node[];
    private _prevQuery: Query | null;

    constructor(context: Node[], selector?: string, prevQuery: Query | null = null) {
        this._context = context;
        this._prevQuery = prevQuery;

        if (selector != null) {
            this.find(selector);
        }
    }
    // Actions
    slice(start: number, end?: number) {
        return new Query(this._context.slice(start, end));
    }

    forEach(callback: (n: Node) => void) {
        this._context.forEach(callback);
        return this;
    }

    every(predicate: (n: Node) => boolean) {
        return this._context.every(predicate);
    }

    some(predicate: (n: Node) => boolean) {
        return this._context.every(predicate);
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

    remove() {
        this._context.forEach(n => {
            n.remove();
        });

        return this;
    }

    // Refiners

    // Filters from the currently matched nodes
    filter(selectorString: string) {
        const selector = new Selector(selectorString);
        const newContext = selector.filter(this._context);

        return new Query(newContext, undefined, this);
    }

    // Selects out of all descedants of currently matched nodes
    find(selectorString: string) {
        const selector = new Selector(selectorString);
        const newContext = selector.find(this._context);

        return new Query(newContext, undefined, this);
    }

    // Remove nodes from the set of matched nodes.
    not(selectorString: string) {
        const selector = new Selector(selectorString);
        const newContext = selector.not(this._context);

        return new Query(newContext, undefined, this);
    }

    // Select the parent of currently matched nodes
    parent() {
        const parents = this._context.map(n => n.parent);
        const notNullParents = parents.filter(n => n != null) as Node[];

        return new Query(notNullParents, undefined, this);
    }

    // Select the ancestors of currently matched nodes
    parents(selectorString: string) {
        const selector = new Selector(selectorString);
        const newContext = selector.parents(this._context);

        return new Query(newContext, undefined, this);
    }

    first() {
        return new Query(this._context.slice(0, 1), undefined, this);
    }

    last() {
        return new Query(this._context.slice(-1), undefined, this);
    }

    // Pop query stack
    end() {
        if (this._prevQuery) {
            return this._prevQuery;
        }
        return this;
    }

}
