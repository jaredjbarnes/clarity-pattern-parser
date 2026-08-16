import type { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import type { Cursor } from "./Cursor";
import type { Pattern } from "./Pattern";
export declare class Expression extends BasePattern {
    private _originalName;
    private _cachedParent;
    private _originalPatterns;
    private _atomPatterns;
    private _prefixPatterns;
    private _prefixNames;
    private _postfixPatterns;
    private _postfixNames;
    private _infixPatterns;
    private _infixNames;
    private _associationMap;
    private _precedenceMap;
    private _shouldStopParsing;
    private _precedenceTree;
    private _hasOrganized;
    private _atomsIdToAncestorsMap;
    get prefixPatterns(): readonly Pattern[];
    get atomPatterns(): readonly Pattern[];
    get postfixPatterns(): readonly Pattern[];
    get infixPatterns(): readonly Pattern[];
    get binaryPatterns(): readonly Pattern[];
    get originalPatterns(): readonly Pattern[];
    constructor(name: string, patterns: Pattern[]);
    private _organizePatterns;
    private _cacheAncestors;
    build(): void;
    parse(cursor: Cursor): Node | null;
    private _tryToParse;
    private _tryToMatchPrefix;
    private _tryToMatchAtom;
    private _isBeyondRecursiveAllowance;
    private _tryToMatchPostfix;
    private _tryToMatchBinary;
    getTokens(): string[];
    getTokensAfter(childReference: Pattern): string[];
    getPatterns(): Pattern[];
    getPatternsAfter(childReference: Pattern): Pattern[];
    /** What may start an expression: a prefix operator, or an atom. */
    private _selectLeading;
    /**
     * `getTokensAfter` and `getPatternsAfter` ask the same question and differ
     * only in what they project out of the answer, so they share this.
     */
    private _selectAfter;
    clone(name?: string): Pattern;
}
