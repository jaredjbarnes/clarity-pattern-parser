import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";
import { Node } from "../ast/Node";
import { ParseResult } from "./ParseResult";
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
    get startedOnIndex(): number;
    constructor(name: string, sequence: Pattern[]);
    private _assignChildrenToParent;
    test(text: string, record?: boolean): boolean;
    exec(text: string, record?: boolean): ParseResult;
    parse(cursor: Cursor): Node | null;
    private tryToParse;
    private getLastValidNode;
    private _isBeyondRecursiveAllowance;
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
