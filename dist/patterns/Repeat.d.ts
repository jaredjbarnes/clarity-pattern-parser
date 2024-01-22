import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";
export declare class Repeat implements Pattern {
    private _type;
    private _name;
    private _parent;
    private _children;
    private _pattern;
    private _divider;
    private _isOptional;
    private _nodes;
    private _firstIndex;
    private _shouldReduceAst;
    get type(): string;
    get name(): string;
    get parent(): Pattern | null;
    set parent(pattern: Pattern | null);
    get children(): Pattern[];
    get isOptional(): boolean;
    constructor(name: string, pattern: Pattern, divider?: Pattern, isOptional?: boolean);
    private _assignChildrenToParent;
    parseText(text: string): {
        ast: Node | null;
        cursor: Cursor;
    };
    parse(cursor: Cursor): Node | null;
    private tryToParse;
    private createNode;
    private getLastValidNode;
    enableAstReduction(): void;
    disableAstReduction(): void;
    getTokens(): string[];
    getNextTokens(lastMatched: Pattern): string[];
    getNextPattern(): Pattern | null;
    findPattern(isMatch: (p: Pattern) => boolean): Pattern | null;
    clone(name?: string, isOptional?: boolean): Pattern;
}
