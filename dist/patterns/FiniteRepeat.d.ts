import { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import type { Cursor } from "./Cursor";
import type { Pattern } from "./Pattern";
export interface FiniteRepeatOptions {
    divider?: Pattern;
    min?: number;
    max?: number;
    trimDivider?: boolean;
}
export declare class FiniteRepeat extends BasePattern {
    private _hasDivider;
    private _min;
    private _max;
    private _trimDivider;
    get min(): number;
    get max(): number;
    constructor(name: string, pattern: Pattern, options?: FiniteRepeatOptions);
    parse(cursor: Cursor): Node | null;
    clone(name?: string): Pattern;
    getTokens(): string[];
    getTokensAfter(childReference: Pattern): string[];
    getPatterns(): Pattern[];
    getPatternsAfter(childReference: Pattern): Pattern[];
}
