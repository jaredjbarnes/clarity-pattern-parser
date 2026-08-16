import type { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import type { Cursor } from "./Cursor";
import type { Pattern } from "./Pattern";
export declare class Not extends BasePattern {
    get startedOnIndex(): number;
    constructor(name: string, pattern: Pattern);
    parse(cursor: Cursor): Node | null;
    clone(name?: string): Pattern;
    /**
     * A negative lookahead consumes nothing, so what it "expects" is whatever
     * comes after it — never its own child, which by definition must not match.
     */
    getTokens(): string[];
    getTokensAfter(_childReference: Pattern): string[];
    getPatterns(): Pattern[];
    getPatternsAfter(_childReference: Pattern): Pattern[];
}
