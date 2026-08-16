import { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import type { Cursor } from "./Cursor";
import type { Literal } from "./Literal";
import type { Pattern } from "./Pattern";
export declare class Block extends BasePattern {
    private _openPattern;
    private _contentPattern;
    private _closePattern;
    private _literalOpen;
    private _literalClose;
    constructor(name: string, openPattern: Literal, contentPattern: Pattern | null, closePattern: Literal);
    parse(cursor: Cursor): Node | null;
    private _scanForMatchingClose;
    private _parseContent;
    getTokens(): string[];
    getTokensAfter(childReference: Pattern): string[];
    getPatterns(): Pattern[];
    getPatternsAfter(childReference: Pattern): Pattern[];
    clone(name?: string): Pattern;
}
