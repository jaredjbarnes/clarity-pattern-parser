import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";
export declare class ExpressionPattern implements Pattern {
    private _id;
    private _type;
    private _name;
    private _parent;
    private _firstIndex;
    private _originalPatterns;
    private _patterns;
    private _unaryPatterns;
    private _binaryPatterns;
    private _recursivePatterns;
    private _recursiveNames;
    private _endsInRecursion;
    private _binaryAssociation;
    private _precedenceMap;
    private _binaryNames;
    shouldCompactAst: boolean;
    get id(): string;
    get type(): string;
    get name(): string;
    get parent(): Pattern | null;
    set parent(pattern: Pattern | null);
    get children(): Pattern[];
    get unaryPatterns(): readonly Pattern[];
    get binaryPatterns(): readonly Pattern[];
    get recursivePatterns(): readonly Pattern[];
    constructor(name: string, patterns: Pattern[]);
    private _organizePatterns;
    private _isBinary;
    private _isBinaryPattern;
    private _extractDelimiter;
    private _extractName;
    private _isRecursive;
    private _isRecursivePattern;
    private _extractRecursiveTail;
    private _endsWithRecursion;
    parse(cursor: Cursor): Node | null;
    private _tryToParse;
    test(text: string): boolean;
    exec(text: string, record?: boolean): ParseResult;
    getTokens(): string[];
    getTokensAfter(childReference: Pattern): string[];
    getNextTokens(): string[];
    getPatterns(): Pattern[];
    getPatternsAfter(childReference: Pattern): Pattern[];
    getNextPatterns(): Pattern[];
    find(predicate: (p: Pattern) => boolean): Pattern | null;
    clone(name?: string): Pattern;
    isEqual(pattern: ExpressionPattern): boolean;
}
