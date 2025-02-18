import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";
export declare class Expression implements Pattern {
    private _id;
    private _type;
    private _name;
    private _originalName;
    private _parent;
    private _firstIndex;
    private _originalPatterns;
    private _patterns;
    private _atomPatterns;
    private _prefixPatterns;
    private _prefixNames;
    private _postfixPatterns;
    private _postfixNames;
    private _binaryPatterns;
    private _binaryNames;
    private _associationMap;
    private _precedenceMap;
    private _shouldStopParsing;
    private _precedenceTree;
    private _hasOrganized;
    get id(): string;
    get type(): string;
    get name(): string;
    get parent(): Pattern | null;
    set parent(pattern: Pattern | null);
    get children(): Pattern[];
    get prefixPatterns(): readonly Pattern[];
    get atomPatterns(): readonly Pattern[];
    get postfixPatterns(): readonly Pattern[];
    get binaryPatterns(): readonly Pattern[];
    get originalPatterns(): readonly Pattern[];
    get startedOnIndex(): number;
    constructor(name: string, patterns: Pattern[]);
    private _organizePatterns;
    private _extractName;
    private _isPrefix;
    private _extractPrefix;
    private _isAtom;
    private _isPostfix;
    private _extractPostfix;
    private _isBinary;
    private _extractBinary;
    private _unwrapAssociationIfNecessary;
    private _referenceCount;
    private _isRecursiveReference;
    build(): void;
    parse(cursor: Cursor): Node | null;
    private _tryToParse;
    private _tryToMatchPrefix;
    private _tryToMatchAtom;
    private _tryToMatchPostfix;
    private _tryToMatchBinary;
    test(text: string, record?: boolean): boolean;
    exec(text: string, record?: boolean): ParseResult;
    getTokens(): string[];
    getTokensAfter(childReference: Pattern): string[];
    getNextTokens(): string[];
    getPatterns(): Pattern[];
    getPatternsAfter(childReference: Pattern): Pattern[];
    getNextPatterns(): Pattern[];
    find(predicate: (p: Pattern) => boolean): Pattern | null;
    clone(name?: string): Pattern;
    isEqual(pattern: Expression): boolean;
}
