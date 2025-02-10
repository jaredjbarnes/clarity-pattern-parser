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

    slice(start: number, end?: number) {
        return new Query(this._context.slice(start, end));
    }

    // Modifiers
    append() { }

    prepend() { }

    after() { }

    before() { }


    // Refiners
    filter(selector: string) { }

    find(selector: string) { }

    not(selector: string) { }

    parent() { }

    parents(selector: string) { }


    // Pop query stack
    end() {
        if (this._prevQuery) {
            return this._prevQuery;
        }
        return this;
    }

}