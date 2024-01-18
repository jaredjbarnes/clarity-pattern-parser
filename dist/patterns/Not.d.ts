import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";
export declare class Not implements Pattern {
    private _type;
    private _name;
    private _parent;
    private _children;
    get type(): string;
    get name(): string;
    get isOptional(): boolean;
    get parent(): Pattern | null;
    set parent(pattern: Pattern | null);
    get children(): Pattern[];
    constructor(name: string, pattern: Pattern);
    parseText(text: string): {
        ast: Node | null;
        cursor: Cursor;
    };
    parse(cursor: Cursor): Node | null;
    clone(name?: string): Pattern;
    getTokens(): string[];
    getNextTokens(_lastMatched: Pattern): string[];
}
