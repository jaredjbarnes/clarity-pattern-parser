import { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import type { Cursor } from "./Cursor";
import type { Pattern } from "./Pattern";
export declare class Sequence extends BasePattern {
    private _nodes;
    constructor(name: string, sequence: Pattern[]);
    parse(cursor: Cursor): Node | null;
    private _tryToParse;
    private _getLastValidNode;
    private _areAllPatternsOptional;
    private _areRemainingPatternsOptional;
    private _createNode;
    getTokens(): string[];
    getTokensAfter(childReference: Pattern): string[];
    getPatterns(): Pattern[];
    getPatternsAfter(childReference: Pattern): Pattern[];
    clone(name?: string): Pattern;
}
