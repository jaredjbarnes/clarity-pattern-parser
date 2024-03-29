import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";
export interface RepeatOptions {
    min?: number;
    max?: number;
    divider?: Pattern;
    trimDivider?: boolean;
}
export declare class Repeat implements Pattern {
    private _repeatPattern;
    private _parent;
    private _pattern;
    private _options;
    private _children;
    get type(): string;
    get name(): string;
    get parent(): Pattern | null;
    set parent(value: Pattern | null);
    get children(): Pattern[];
    get isOptional(): boolean;
    constructor(name: string, pattern: Pattern, options?: RepeatOptions);
    parse(cursor: Cursor): Node | null;
    exec(text: string): ParseResult;
    test(text: string): boolean;
    clone(name?: string, isOptional?: boolean): Repeat;
    getTokens(): string[];
    getTokensAfter(_childReference: Pattern): string[];
    getNextTokens(): string[];
    getPatterns(): Pattern[];
    getPatternsAfter(_childReference: Pattern): Pattern[];
    getNextPatterns(): Pattern[];
    find(predicate: (p: Pattern) => boolean): Pattern | null;
}
