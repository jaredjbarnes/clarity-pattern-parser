import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";
export declare class Or implements Pattern {
    private _type;
    private _name;
    private _parent;
    private _children;
    private _isOptional;
    private _firstIndex;
    get type(): string;
    get name(): string;
    get parent(): Pattern | null;
    set parent(pattern: Pattern | null);
    get children(): Pattern[];
    get isOptional(): boolean;
    constructor(name: string, options: Pattern[], isOptional?: boolean);
    private _assignChildrenToParent;
    parseText(text: string): {
        ast: Node | null;
        cursor: Cursor;
    };
    parse(cursor: Cursor): Node | null;
    private _tryToParse;
    getTokens(): string[];
    getNextTokens(_lastMatched: Pattern): string[];
    getNextPattern(): Pattern | null;
    findPattern(predicate: (p: Pattern) => boolean): Pattern | null;
    clone(name?: string, isOptional?: boolean): Pattern;
}
