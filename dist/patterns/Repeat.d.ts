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
interface InternalRepeatOptions {
    min: number;
    max: number;
    divider?: Pattern;
}
export declare class Repeat implements Pattern {
    private _id;
    private _repeatPattern;
    private _parent;
    private _pattern;
    private _options;
    private _children;
    get id(): string;
    get type(): string;
    get name(): string;
    get parent(): Pattern | null;
    set parent(value: Pattern | null);
    get children(): Pattern[];
    get min(): number;
    get max(): number;
    get startedOnIndex(): number;
    get pattern(): Pattern;
    get options(): InternalRepeatOptions;
    constructor(name: string, pattern: Pattern, options?: RepeatOptions);
    parse(cursor: Cursor): Node | null;
    exec(text: string): ParseResult;
    test(text: string): boolean;
    clone(name?: string): Repeat;
    getTokens(): string[];
    getTokensAfter(_childReference: Pattern): string[];
    getNextTokens(): string[];
    getPatterns(): Pattern[];
    getPatternsAfter(_childReference: Pattern): Pattern[];
    getNextPatterns(): Pattern[];
    find(predicate: (p: Pattern) => boolean): Pattern | null;
    isEqual(pattern: Repeat): boolean;
}
export {};
