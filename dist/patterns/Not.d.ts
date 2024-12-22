import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";
export declare class Not implements Pattern {
    private _id;
    private _type;
    private _name;
    private _parent;
    private _children;
    get id(): string;
    get type(): string;
    get name(): string;
    get parent(): Pattern | null;
    set parent(pattern: Pattern | null);
    get children(): Pattern[];
    get isOptional(): boolean;
    constructor(name: string, pattern: Pattern);
    test(text: string): boolean;
    exec(text: string, record?: boolean): ParseResult;
    parse(cursor: Cursor): Node | null;
    clone(name?: string): Pattern;
    getTokens(): string[];
    getTokensAfter(_childReference: Pattern): string[];
    getNextTokens(): string[];
    getPatterns(): Pattern[];
    getPatternsAfter(_childReference: Pattern): Pattern[];
    getNextPatterns(): Pattern[];
    find(predicate: (p: Pattern) => boolean): Pattern | null;
}
