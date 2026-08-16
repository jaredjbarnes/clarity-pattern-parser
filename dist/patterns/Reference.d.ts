import type { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import type { Cursor } from "./Cursor";
import type { Pattern } from "./Pattern";
export declare class Reference extends BasePattern {
    private _referencePatternName;
    private _cachedPattern;
    private _pattern;
    private _cachedAncestors;
    private _recursiveAncestors;
    constructor(name: string, referencePatternName?: string);
    parse(cursor: Cursor): Node | null;
    private _cacheAncestors;
    private _isBeyondRecursiveAllowance;
    getReferencePatternSafely(): Pattern;
    private _findPattern;
    private _isValidPattern;
    private _getRoot;
    getTokens(): string[];
    getTokensAfter(_lastMatched: Pattern): string[];
    getPatterns(): Pattern[];
    getPatternsAfter(_childReference: Pattern): Pattern[];
    find(_predicate: (p: Pattern) => boolean): Pattern | null;
    clone(name?: string): Pattern;
    isEqual(pattern: Reference): boolean;
}
