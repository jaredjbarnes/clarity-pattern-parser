import { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import type { Cursor } from "./Cursor";
import type { Pattern } from "./Pattern";
export interface InfiniteRepeatOptions {
    divider?: Pattern;
    min?: number;
    trimDivider?: boolean;
}
export declare class InfiniteRepeat extends BasePattern {
    private _pattern;
    private _divider;
    private _nodes;
    private _min;
    private _trimDivider;
    private _patterns;
    get min(): number;
    constructor(name: string, pattern: Pattern, options?: InfiniteRepeatOptions);
    parse(cursor: Cursor): Node | null;
    private _meetsMin;
    private _tryToParse;
    private _createNode;
    private _getLastValidNode;
    getTokens(): string[];
    getTokensAfter(childReference: Pattern): string[];
    getPatterns(): Pattern[];
    getPatternsAfter(childReference: Pattern): Pattern[];
    clone(name?: string): Pattern;
}
