import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";
export declare class Context implements Pattern {
    private _id;
    private _type;
    private _name;
    private _parent;
    private _children;
    private _pattern;
    private _patterns;
    shouldCompactAst: boolean;
    get id(): string;
    get type(): string;
    get name(): string;
    get parent(): Pattern | null;
    set parent(pattern: Pattern | null);
    get children(): Pattern[];
    get startedOnIndex(): number;
    getPatternWithinContext(name: string): Pattern | null;
    getPatternsWithinContext(): {
        [x: string]: Pattern;
    };
    constructor(name: string, pattern: Pattern, context?: Pattern[]);
    parse(cursor: Cursor): Node | null;
    exec(text: string, record?: boolean | undefined): ParseResult;
    test(text: string, record?: boolean | undefined): boolean;
    clone(name?: string): Pattern;
    getTokens(): string[];
    getTokensAfter(_childReference: Pattern): string[];
    getNextTokens(): string[];
    getPatterns(): Pattern[];
    getPatternsAfter(_childReference: Pattern): Pattern[];
    getNextPatterns(): Pattern[];
    find(predicate: (pattern: Pattern) => boolean): Pattern | null;
    isEqual(pattern: Pattern): boolean;
}
