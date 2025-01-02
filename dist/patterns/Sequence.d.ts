import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";
import { Node } from "../ast/Node";
export declare class Sequence implements Pattern {
    private _id;
    private _type;
    private _name;
    private _parent;
    private _children;
    private _nodes;
    private _firstIndex;
    get id(): string;
    get type(): string;
    get name(): string;
    get parent(): Pattern | null;
    set parent(pattern: Pattern | null);
    get children(): Pattern[];
    constructor(name: string, sequence: Pattern[]);
    private _assignChildrenToParent;
    test(text: string): boolean;
    exec(text: string, record?: boolean): {
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
    find(predicate: (p: Pattern) => boolean): Pattern | null;
    clone(name?: string): Pattern;
    isEqual(pattern: Sequence): boolean;
}