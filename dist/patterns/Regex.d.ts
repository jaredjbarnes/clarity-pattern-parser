import { Node } from "../ast/Node";
import { Pattern } from "./Pattern";
import { Cursor } from "./Cursor";
import { ParseResult } from "./ParseResult";
export declare class Regex implements Pattern {
    private _id;
    private _type;
    private _name;
    private _parent;
    private _originalRegexString;
    private _regex;
    private _node;
    private _cursor;
    private _firstIndex;
    private _substring;
    private _tokens;
    shouldCompactAst: boolean;
    get id(): string;
    get type(): string;
    get name(): string;
    get regex(): string;
    get parent(): Pattern | null;
    set parent(pattern: Pattern | null);
    get children(): Pattern[];
    get startedOnIndex(): number;
    constructor(name: string, regex: string);
    private assertArguments;
    test(text: string): boolean;
    exec(text: string, record?: boolean): ParseResult;
    parse(cursor: Cursor): Node | null;
    private resetState;
    private tryToParse;
    private processResult;
    private processError;
    clone(name?: string): Regex;
    getTokens(): string[];
    getTokensAfter(_childReference: Pattern): string[];
    getNextTokens(): string[];
    getPatterns(): Pattern[];
    getPatternsAfter(_childReference: Pattern): Pattern[];
    getNextPatterns(): Pattern[];
    find(_predicate: (p: Pattern) => boolean): Pattern | null;
    setTokens(tokens: string[]): void;
    isEqual(pattern: Regex): boolean;
}
