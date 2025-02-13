import { Node } from "../ast/Node";
export declare class Query {
    private _context;
    private _prevQuery;
    constructor(context: Node[], prevQuery?: Query | null);
    toArray(): Node[];
    append(visitor: (node: Node) => Node): this;
    prepend(visitor: (node: Node) => Node): this;
    after(visitor: (node: Node) => Node): this;
    before(visitor: (node: Node) => Node): this;
    replaceWith(visitor: (node: Node) => Node): this;
    compact(): this;
    setValue(value: string): this;
    normalize(): void;
    remove(): this;
    slice(start: number, end?: number): Query;
    filter(selectorString: string): Query;
    find(selectorString: string): Query;
    not(selectorString: string): Query;
    parent(): Query;
    parents(selectorString: string): Query;
    first(): Query;
    last(): Query;
    end(): Query;
    length(): number;
}
export declare function $(root: Node, selector?: string): Query;
