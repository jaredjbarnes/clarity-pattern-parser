import type { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import type { Cursor } from "./Cursor";
import type { ParseResult } from "./ParseResult";
import type { Pattern } from "./Pattern";
export declare class RightAssociated extends BasePattern {
    get startedOnIndex(): number;
    constructor(pattern: Pattern);
    parse(cursor: Cursor): Node | null;
    exec(text: string, record?: boolean | undefined): ParseResult;
    test(text: string, record?: boolean | undefined): boolean;
    clone(_name?: string | undefined): Pattern;
    getTokens(): string[];
    getTokensAfter(_childReference: Pattern): string[];
    getPatterns(): Pattern[];
    getPatternsAfter(_childReference: Pattern): Pattern[];
    find(predicate: (pattern: Pattern) => boolean): Pattern | null;
}
