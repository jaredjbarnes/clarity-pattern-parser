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

    forEach() { }
    every() { }
    some() { }

    // Modifiers
    append() { }

    prepend() { }

    after() { }

    before() { }

    replace() { }

    // Refiners

    // Filters from the currently matched nodes
    filter(selector: string) { }

    // Selects out of all descedants of currently matched nodes
    find(selector: string) { }

    // Remove nodes from the set of matched nodes.
    not(selector: string) { }

    // Select the parent of currently matched nodes
    parent() { }

    // Select the ancestors of currently matched nodes
    parents(selector: string) { }

    first(){
        
    }

    // Pop query stack
    end() {
        if (this._prevQuery) {
            return this._prevQuery;
        }
        return this;
    }

}
