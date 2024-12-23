import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";
import { ParseResult } from "./ParseResult";
export interface InfiniteRepeatOptions {
    divider?: Pattern;
    min?: number;
    trimDivider?: boolean;
}
export declare class InfiniteRepeat implements Pattern {
    private _id;
    private _type;
    private _name;
    private _parent;
    private _children;
    private _pattern;
    private _divider;
    private _nodes;
    private _firstIndex;
    private _min;
    private _trimDivider;
    get id(): string;
    get type(): string;
    get name(): string;
    get parent(): Pattern | null;
    set parent(pattern: Pattern | null);
    get children(): Pattern[];
    get isOptional(): boolean;
    get min(): number;
    constructor(name: string, pattern: Pattern, options?: InfiniteRepeatOptions);
    private _assignChildrenToParent;
    test(text: string): boolean;
    exec(text: string, record?: boolean): ParseResult;
    parse(cursor: Cursor): Node | null;
    private _meetsMin;
    private _tryToParse;
    private _createNode;
    private _getLastValidNode;
    getTokens(): string[];
    getTokensAfter(childReference: Pattern): string[];
    getNextTokens(): string[];
    getPatterns(): Pattern[];
    getPatternsAfter(childReference: Pattern): Pattern[];
    getNextPatterns(): Pattern[];
    find(predicate: (p: Pattern) => boolean): Pattern | null;
    clone(name?: string, isOptional?: boolean): Pattern;
    isEqual(pattern: InfiniteRepeat): boolean;
}
