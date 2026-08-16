import type { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import type { Cursor } from "./Cursor";
import type { ParseResult } from "./ParseResult";
import type { Pattern } from "./Pattern";
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
/**
 * Facade that picks the bounded or unbounded implementation. It reports the
 * chosen implementation's `type`, so its id keeps the "repeat-" prefix while
 * `type` is "finite-repeat" or "infinite-repeat".
 */
export declare class Repeat extends BasePattern {
    private _repeatPattern;
    private _pattern;
    private _options;
    get min(): number;
    get max(): number;
    get startedOnIndex(): number;
    get pattern(): Pattern;
    get options(): InternalRepeatOptions;
    constructor(name: string, pattern: Pattern, options?: RepeatOptions);
    parse(cursor: Cursor): Node | null;
    exec(text: string, record?: boolean): ParseResult;
    test(text: string, record?: boolean): boolean;
    clone(name?: string): Repeat;
    getTokens(): string[];
    getTokensAfter(_childReference: Pattern): string[];
    getPatterns(): Pattern[];
    getPatternsAfter(_childReference: Pattern): Pattern[];
    find(predicate: (p: Pattern) => boolean): Pattern | null;
}
export {};
