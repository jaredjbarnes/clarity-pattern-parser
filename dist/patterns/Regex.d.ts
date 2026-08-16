import { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import type { Cursor } from "./Cursor";
import type { Pattern } from "./Pattern";
export declare class Regex extends BasePattern {
    private _originalRegexString;
    private _regex;
    private _node;
    private _substring;
    private _tokens;
    get regex(): string;
    constructor(name: string, regex: string);
    private _assertArguments;
    parse(cursor: Cursor): Node | null;
    private _resetState;
    private _tryToParse;
    private _processResult;
    private _processError;
    clone(name?: string): Regex;
    getTokens(): string[];
    getTokensAfter(_childReference: Pattern): string[];
    getPatterns(): Pattern[];
    getPatternsAfter(_childReference: Pattern): Pattern[];
    find(_predicate: (p: Pattern) => boolean): Pattern | null;
    setTokens(tokens: string[]): void;
    isEqual(pattern: Regex): boolean;
}
