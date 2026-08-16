import { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import type { Cursor } from "./Cursor";
import type { Pattern } from "./Pattern";
export declare class TakeUntil extends BasePattern {
    private _tokens;
    private get _terminatingPattern();
    constructor(name: string, terminatingPattern: Pattern);
    parse(cursor: Cursor): Node | null;
    clone(name?: string): Pattern;
    getTokens(): string[];
    getTokensAfter(_childReference: Pattern): string[];
    getPatterns(): Pattern[];
    getPatternsAfter(_childReference: Pattern): Pattern[];
    find(_predicate: (p: Pattern) => boolean): Pattern | null;
    setTokens(tokens: string[]): void;
}
