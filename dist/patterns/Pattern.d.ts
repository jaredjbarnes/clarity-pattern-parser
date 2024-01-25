import { Cursor } from "./Cursor";
import { Node } from "../ast/Node";
import { ParseResult } from "./ParseResult";
export interface Pattern {
    type: string;
    name: string;
    parent: Pattern | null;
    children: Pattern[];
    isOptional: boolean;
    parse(cursor: Cursor): Node | null;
    exec(text: string): ParseResult;
    test(text: string): boolean;
    clone(name?: string, isOptional?: boolean): Pattern;
    getTokens(): string[];
    getTokensAfter(childReference: Pattern): string[];
    getPatternsAfter(childReference: Pattern): Pattern[];
    getNextPatterns(): Pattern[];
    getNextTokens(): string[];
    findPattern(predicate: (p: Pattern) => boolean): Pattern | null;
}
