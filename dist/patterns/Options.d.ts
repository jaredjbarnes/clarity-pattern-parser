import type { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import type { Cursor } from "./Cursor";
import type { Pattern } from "./Pattern";
export declare class Options extends BasePattern {
    private _isGreedy;
    constructor(name: string, options: Pattern[], isGreedy?: boolean);
    parse(cursor: Cursor): Node | null;
    private _tryToParse;
    getTokens(): string[];
    getTokensAfter(_childReference: Pattern): string[];
    getPatterns(): Pattern[];
    getPatternsAfter(_childReference: Pattern): Pattern[];
    clone(name?: string): Pattern;
}
