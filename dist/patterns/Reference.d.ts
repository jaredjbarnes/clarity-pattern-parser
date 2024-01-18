import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";
export declare class Reference implements Pattern {
    private _type;
    private _name;
    private _parent;
    private _isOptional;
    private _pattern;
    private _children;
    get type(): string;
    get name(): string;
    get isOptional(): boolean;
    get parent(): Pattern | null;
    set parent(pattern: Pattern | null);
    get children(): Pattern[];
    constructor(name: string, isOptional?: boolean);
    parseText(text: string): {
        ast: Node | null;
        cursor: Cursor;
    };
    parse(cursor: Cursor): Node | null;
    clone(name?: string, isOptional?: boolean): Pattern;
    getTokens(): string[];
    getNextTokens(_lastMatched: Pattern): string[];
    private _getPatternSafely;
    private _findPattern;
    private _getRoot;
}
