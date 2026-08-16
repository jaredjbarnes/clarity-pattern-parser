import { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import type { Cursor } from "./Cursor";
import type { Pattern } from "./Pattern";
export declare class Literal extends BasePattern {
    private _token;
    private _lastIndex;
    get token(): string;
    constructor(name: string, value: string);
    parse(cursor: Cursor): Node | null;
    private _tryToParse;
    private _createNode;
    clone(name?: string): Pattern;
    getTokens(): string[];
    getTokensAfter(_lastMatched: Pattern): string[];
    getPatterns(): Pattern[];
    getPatternsAfter(): Pattern[];
    find(_predicate: (p: Pattern) => boolean): Pattern | null;
    isEqual(pattern: Literal): boolean;
}
