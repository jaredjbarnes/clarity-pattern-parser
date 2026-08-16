import type { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import type { Cursor } from "./Cursor";
import type { ParseResult } from "./ParseResult";
import type { Pattern } from "./Pattern";
export declare class Context extends BasePattern {
    private _referencePatternName;
    private _patterns;
    get startedOnIndex(): number;
    private get _pattern();
    constructor(name: string, pattern: Pattern, context?: Pattern[]);
    getPatternWithinContext(name: string): Pattern | null;
    getPatternsWithinContext(): {
        [x: string]: Pattern;
    };
    parse(cursor: Cursor): Node | null;
    exec(text: string, record?: boolean | undefined): ParseResult;
    test(text: string, record?: boolean | undefined): boolean;
    clone(name?: string): Pattern;
    getTokens(): string[];
    getTokensAfter(_childReference: Pattern): string[];
    getPatterns(): Pattern[];
    getPatternsAfter(_childReference: Pattern): Pattern[];
    find(predicate: (pattern: Pattern) => boolean): Pattern | null;
}
