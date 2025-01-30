import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";
export interface FiniteRepeatOptions {
    divider?: Pattern;
    min?: number;
    max?: number;
    trimDivider?: boolean;
}
export declare class FiniteRepeat implements Pattern {
    private _id;
    private _type;
    private _name;
    private _parent;
    private _children;
    private _hasDivider;
    private _min;
    private _max;
    private _trimDivider;
    shouldCompactAst: boolean;
    get id(): string;
    get type(): string;
    get name(): string;
    get parent(): Pattern | null;
    set parent(value: Pattern | null);
    get children(): Pattern[];
    get min(): number;
    get max(): number;
    constructor(name: string, pattern: Pattern, options?: FiniteRepeatOptions);
    parse(cursor: Cursor): Node | null;
    test(text: string): boolean;
    exec(text: string, record?: boolean): ParseResult;
    clone(name?: string): Pattern;
    getTokens(): string[];
    getTokensAfter(childReference: Pattern): string[];
    getNextTokens(): string[];
    getPatterns(): Pattern[];
    getPatternsAfter(childReference: Pattern): Pattern[];
    getNextPatterns(): Pattern[];
    find(predicate: (p: Pattern) => boolean): Pattern | null;
    isEqual(pattern: FiniteRepeat): boolean;
}
