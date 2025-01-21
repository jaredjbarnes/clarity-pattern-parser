import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";
import { ParseResult } from "./ParseResult";
export declare class Reference implements Pattern {
    private _id;
    private _type;
    private _name;
    private _parent;
    private _cachedPattern;
    private _pattern;
    private _children;
    get id(): string;
    get type(): string;
    get name(): string;
    get parent(): Pattern | null;
    set parent(pattern: Pattern | null);
    get children(): Pattern[];
    constructor(name: string);
    test(text: string): boolean;
    exec(text: string, record?: boolean): ParseResult;
    parse(cursor: Cursor): Node | null;
    private _getPatternSafely;
    private _findPattern;
    private _isValidPattern;
    private _getRoot;
    getTokens(): string[];
    getTokensAfter(_lastMatched: Pattern): string[];
    getNextTokens(): string[];
    getPatterns(): Pattern[];
    getPatternsAfter(_childReference: Pattern): Pattern[];
    getNextPatterns(): Pattern[];
    find(_predicate: (p: Pattern) => boolean): Pattern | null;
    clone(name?: string): Pattern;
    isEqual(pattern: Reference): boolean;
}
