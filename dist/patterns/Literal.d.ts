import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";
export declare class Literal implements Pattern {
    private _type;
    private _name;
    private _parent;
    private _isOptional;
    private _literal;
    private _runes;
    private _firstIndex;
    private _lastIndex;
    private _endIndex;
    get type(): string;
    get name(): string;
    get parent(): Pattern | null;
    set parent(pattern: Pattern | null);
    get children(): Pattern[];
    get isOptional(): boolean;
    constructor(name: string, value: string, isOptional?: boolean);
    test(text: string): boolean;
    exec(text: string): {
        ast: Node | null;
        cursor: Cursor;
    };
    parse(cursor: Cursor): Node | null;
    private _tryToParse;
    private _createNode;
    clone(name?: string, isOptional?: boolean): Pattern;
    getTokens(): string[];
    getTokensAfter(_lastMatched: Pattern): string[];
    getNextTokens(): string[];
    getPatterns(): Pattern[];
    getPatternsAfter(): Pattern[];
    getNextPatterns(): Pattern[];
    find(_predicate: (p: Pattern) => boolean): Pattern | null;
}
