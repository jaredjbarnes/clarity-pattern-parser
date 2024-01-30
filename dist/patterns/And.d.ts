import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";
import { Node } from "../ast/Node";
export declare class And implements Pattern {
    private _type;
    private _name;
    private _parent;
    private _children;
    private _isOptional;
    private _nodes;
    private _firstIndex;
    get type(): string;
    get name(): string;
    get parent(): Pattern | null;
    set parent(pattern: Pattern | null);
    get children(): Pattern[];
    get isOptional(): boolean;
    constructor(name: string, sequence: Pattern[], isOptional?: boolean);
    private _assignChildrenToParent;
    test(text: string): boolean;
    exec(text: string): {
        ast: Node | null;
        cursor: Cursor;
    };
    parse(cursor: Cursor): Node | null;
    private tryToParse;
    private getLastValidNode;
    private areRemainingPatternsOptional;
    private createNode;
    getTokens(): string[];
    getTokensAfter(childReference: Pattern): string[];
    getNextTokens(): string[];
    getPatterns(): Pattern[];
    getPatternsAfter(childReference: Pattern): Pattern[];
    getNextPatterns(): Pattern[];
    findPattern(predicate: (p: Pattern) => boolean): Pattern | null;
    clone(name?: string, isOptional?: boolean): Pattern;
}
