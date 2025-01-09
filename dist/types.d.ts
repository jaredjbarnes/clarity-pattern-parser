declare module "ast/Node" {
    export interface CycleFreeNode {
        type: string;
        name: string;
        startIndex: number;
        endIndex: number;
        value: string;
        children: CycleFreeNode[];
    }
    export class Node {
        private _type;
        private _name;
        private _firstIndex;
        private _lastIndex;
        private _parent;
        private _children;
        private _value;
        get type(): string;
        get name(): string;
        get firstIndex(): number;
        get lastIndex(): number;
        get startIndex(): number;
        get endIndex(): number;
        get parent(): Node | null;
        get children(): readonly Node[];
        get hasChildren(): boolean;
        get value(): string;
        constructor(type: string, name: string, firstIndex: number, lastIndex: number, children?: Node[], value?: string);
        removeChild(node: Node): void;
        removeAllChildren(): void;
        replaceChild(newNode: Node, referenceNode: Node): void;
        replaceWith(newNode: Node): void;
        insertBefore(newNode: Node, referenceNode: Node | null): void;
        appendChild(newNode: Node): void;
        append(...nodes: Node[]): void;
        spliceChildren(index: number, deleteCount: number, ...items: Node[]): Node[];
        nextSibling(): Node | null;
        previousSibling(): Node | null;
        find(predicate: (node: Node) => boolean): Node | null;
        findAll(predicate: (node: Node) => boolean): Node[];
        findAncester(predicate: (node: Node) => boolean): Node | null;
        walkUp(callback: (node: Node) => void): void;
        walkDown(callback: (node: Node) => void): void;
        transform(visitors: Record<string, (node: Node) => Node>): Node;
        flatten(): Node[];
        reduce(): void;
        remove(): void;
        clone(): Node;
        normalize(startIndex?: number): number;
        toString(): string;
        toCycleFreeObject(): CycleFreeNode;
        toJson(space?: number): string;
        static createValueNode(name: string, value: string): Node;
        static createNode(name: string, children: Node[]): Node;
    }
}
declare module "patterns/ParseResult" {
    import { Node } from "ast/Node";
    import { Cursor } from "patterns/Cursor";
    export interface ParseResult {
        ast: Node | null;
        cursor: Cursor;
    }
}
declare module "patterns/Pattern" {
    import { Cursor } from "patterns/Cursor";
    import { Node } from "ast/Node";
    import { ParseResult } from "patterns/ParseResult";
    export interface Pattern {
        id: string;
        type: string;
        name: string;
        parent: Pattern | null;
        children: Pattern[];
        parse(cursor: Cursor): Node | null;
        exec(text: string, record?: boolean): ParseResult;
        test(text: string, record?: boolean): boolean;
        clone(name?: string): Pattern;
        getTokens(): string[];
        getTokensAfter(childReference: Pattern): string[];
        getNextTokens(): string[];
        getPatterns(): Pattern[];
        getPatternsAfter(childReference: Pattern): Pattern[];
        getNextPatterns(): Pattern[];
        find(predicate: (p: Pattern) => boolean): Pattern | null;
        isEqual(pattern: Pattern): boolean;
    }
}
declare module "patterns/ParseError" {
    import { Pattern } from "patterns/Pattern";
    export class ParseError {
        startIndex: number;
        endIndex: number;
        pattern: Pattern;
        constructor(startIndex: number, endIndex: number, pattern: Pattern);
    }
}
declare module "patterns/CursorHistory" {
    import { Node } from "ast/Node";
    import { ParseError } from "patterns/ParseError";
    import { Pattern } from "patterns/Pattern";
    export interface Trace {
        pattern: Pattern;
        cursorIndex: number;
    }
    export interface Match {
        pattern: Pattern | null;
        node: Node | null;
    }
    export class CursorHistory {
        private _isRecording;
        private _leafMatches;
        private _furthestError;
        private _currentError;
        private _rootMatch;
        private _patterns;
        private _nodes;
        private _errors;
        private _trace;
        get isRecording(): boolean;
        get rootMatch(): Match;
        get leafMatch(): Match;
        get leafMatches(): Match[];
        get furthestError(): ParseError | null;
        get errors(): ParseError[];
        get error(): ParseError | null;
        get nodes(): Node[];
        get patterns(): Pattern[];
        get trace(): Trace[];
        recordMatch(pattern: Pattern, node: Node): void;
        recordErrorAt(firstIndex: number, lastIndex: number, pattern: Pattern): void;
        startRecording(): void;
        stopRecording(): void;
        resolveError(): void;
        pushStackTrace(trace: Trace): void;
    }
}
declare module "patterns/Cursor" {
    import { Node } from "ast/Node";
    import { Match } from "patterns/CursorHistory";
    import { ParseError } from "patterns/ParseError";
    import { Pattern } from "patterns/Pattern";
    export class Cursor {
        private _text;
        private _index;
        private _length;
        private _history;
        private _stackTrace;
        get text(): string;
        get isOnFirst(): boolean;
        get isOnLast(): boolean;
        get isRecording(): boolean;
        get rootMatch(): Match;
        get allMatchedNodes(): Node[];
        get allMatchedPatterns(): Pattern[];
        get leafMatch(): Match;
        get leafMatches(): Match[];
        get furthestError(): ParseError | null;
        get error(): ParseError | null;
        get errors(): ParseError[];
        get index(): number;
        get length(): number;
        get hasError(): boolean;
        get currentChar(): string;
        constructor(text: string);
        hasNext(): boolean;
        next(): void;
        hasPrevious(): boolean;
        previous(): void;
        moveTo(position: number): void;
        moveToFirstChar(): void;
        moveToLastChar(): void;
        getLastIndex(): number;
        getChars(first: number, last: number): string;
        recordMatch(pattern: Pattern, node: Node): void;
        recordErrorAt(firstIndex: number, lastIndex: number, onPattern: Pattern): void;
        resolveError(): void;
        startRecording(): void;
        stopRecording(): void;
        startParseWith(pattern: Pattern): void;
        endParse(): void;
        audit(): string[];
        private _buildPatternContext;
    }
}
declare module "patterns/Literal" {
    import { Node } from "ast/Node";
    import { Cursor } from "patterns/Cursor";
    import { ParseResult } from "patterns/ParseResult";
    import { Pattern } from "patterns/Pattern";
    export class Literal implements Pattern {
        private _id;
        private _type;
        private _name;
        private _parent;
        private _text;
        private _runes;
        private _firstIndex;
        private _lastIndex;
        private _endIndex;
        get id(): string;
        get type(): string;
        get name(): string;
        get value(): string;
        get parent(): Pattern | null;
        set parent(pattern: Pattern | null);
        get children(): Pattern[];
        constructor(name: string, value: string);
        test(text: string): boolean;
        exec(text: string, record?: boolean): ParseResult;
        parse(cursor: Cursor): Node | null;
        private _tryToParse;
        private _createNode;
        clone(name?: string): Pattern;
        getTokens(): string[];
        getTokensAfter(_lastMatched: Pattern): string[];
        getNextTokens(): string[];
        getPatterns(): Pattern[];
        getPatternsAfter(): Pattern[];
        getNextPatterns(): Pattern[];
        find(_predicate: (p: Pattern) => boolean): Pattern | null;
        isEqual(pattern: Literal): boolean;
    }
}
declare module "patterns/Regex" {
    import { Node } from "ast/Node";
    import { Pattern } from "patterns/Pattern";
    import { Cursor } from "patterns/Cursor";
    import { ParseResult } from "patterns/ParseResult";
    export class Regex implements Pattern {
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
        get id(): string;
        get type(): string;
        get name(): string;
        get value(): string;
        get parent(): Pattern | null;
        set parent(pattern: Pattern | null);
        get children(): Pattern[];
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
}
declare module "patterns/findPattern" {
    import { Pattern } from "patterns/Pattern";
    export function findPattern(pattern: Pattern, predicate: (pattern: Pattern) => boolean): Pattern | null;
}
declare module "patterns/Reference" {
    import { Node } from "ast/Node";
    import { Cursor } from "patterns/Cursor";
    import { Pattern } from "patterns/Pattern";
    import { ParseResult } from "patterns/ParseResult";
    export class Reference implements Pattern {
        private _id;
        private _type;
        private _name;
        private _parent;
        private _pattern;
        private _children;
        get id(): string;
        get type(): string;
        get name(): string;
        get parent(): Pattern | null;
        set parent(pattern: Pattern | null);
        get children(): Pattern[];
        constructor(name: string);
        test(text: string): boolean;
        exec(text: string, record?: boolean): ParseResult;
        parse(cursor: Cursor): Node | null;
        private _getPatternSafely;
        private _findPattern;
        private _getRoot;
        getTokens(): string[];
        getTokensAfter(_lastMatched: Pattern): string[];
        getNextTokens(): string[];
        getPatterns(): Pattern[];
        getPatternsAfter(_childReference: Pattern): Pattern[];
        getNextPatterns(): Pattern[];
        find(_predicate: (p: Pattern) => boolean): Pattern | null;
        clone(name?: string): Pattern;
        isEqual(pattern: Reference): boolean;
    }
}
declare module "patterns/clonePatterns" {
    import { Pattern } from "patterns/Pattern";
    export function clonePatterns(patterns: Pattern[]): Pattern[];
}
declare module "patterns/Options" {
    import { Node } from "ast/Node";
    import { Cursor } from "patterns/Cursor";
    import { Pattern } from "patterns/Pattern";
    import { ParseResult } from "patterns/ParseResult";
    export class Options implements Pattern {
        private _id;
        private _type;
        private _name;
        private _parent;
        private _children;
        private _isGreedy;
        private _firstIndex;
        get id(): string;
        get type(): string;
        get name(): string;
        get parent(): Pattern | null;
        set parent(pattern: Pattern | null);
        get children(): Pattern[];
        constructor(name: string, options: Pattern[], isGreedy?: boolean);
        private _assignChildrenToParent;
        test(text: string): boolean;
        exec(text: string, record?: boolean): ParseResult;
        parse(cursor: Cursor): Node | null;
        private _tryToParse;
        getTokens(): string[];
        getTokensAfter(_childReference: Pattern): string[];
        getNextTokens(): string[];
        getPatterns(): Pattern[];
        getPatternsAfter(_childReference: Pattern): Pattern[];
        getNextPatterns(): Pattern[];
        find(predicate: (p: Pattern) => boolean): Pattern | null;
        clone(name?: string): Pattern;
        isEqual(pattern: Options): boolean;
    }
}
declare module "patterns/FiniteRepeat" {
    import { Node } from "ast/Node";
    import { Cursor } from "patterns/Cursor";
    import { ParseResult } from "patterns/ParseResult";
    import { Pattern } from "patterns/Pattern";
    export interface FiniteRepeatOptions {
        divider?: Pattern;
        min?: number;
        max?: number;
        trimDivider?: boolean;
    }
    export class FiniteRepeat implements Pattern {
        private _id;
        private _type;
        private _name;
        private _parent;
        private _children;
        private _hasDivider;
        private _min;
        private _max;
        private _trimDivider;
        get id(): string;
        get type(): string;
        get name(): string;
        get parent(): Pattern | null;
        set parent(value: Pattern | null);
        get children(): Pattern[];
        get min(): number;
        get max(): number;
        constructor(name: string, pattern: Pattern, options?: FiniteRepeatOptions);
        parse(cursor: Cursor): Node | null;
        test(text: string): boolean;
        exec(text: string, record?: boolean): ParseResult;
        clone(name?: string): Pattern;
        getTokens(): string[];
        getTokensAfter(childReference: Pattern): string[];
        getNextTokens(): string[];
        getPatterns(): Pattern[];
        getPatternsAfter(childReference: Pattern): Pattern[];
        getNextPatterns(): Pattern[];
        find(predicate: (p: Pattern) => boolean): Pattern | null;
        isEqual(pattern: FiniteRepeat): boolean;
    }
}
declare module "patterns/InfiniteRepeat" {
    import { Node } from "ast/Node";
    import { Cursor } from "patterns/Cursor";
    import { Pattern } from "patterns/Pattern";
    import { ParseResult } from "patterns/ParseResult";
    export interface InfiniteRepeatOptions {
        divider?: Pattern;
        min?: number;
        trimDivider?: boolean;
    }
    export class InfiniteRepeat implements Pattern {
        private _id;
        private _type;
        private _name;
        private _parent;
        private _children;
        private _pattern;
        private _divider;
        private _nodes;
        private _firstIndex;
        private _min;
        private _trimDivider;
        get id(): string;
        get type(): string;
        get name(): string;
        get parent(): Pattern | null;
        set parent(pattern: Pattern | null);
        get children(): Pattern[];
        get min(): number;
        constructor(name: string, pattern: Pattern, options?: InfiniteRepeatOptions);
        private _assignChildrenToParent;
        test(text: string): boolean;
        exec(text: string, record?: boolean): ParseResult;
        parse(cursor: Cursor): Node | null;
        private _meetsMin;
        private _tryToParse;
        private _createNode;
        private _getLastValidNode;
        getTokens(): string[];
        getTokensAfter(childReference: Pattern): string[];
        getNextTokens(): string[];
        getPatterns(): Pattern[];
        getPatternsAfter(childReference: Pattern): Pattern[];
        getNextPatterns(): Pattern[];
        find(predicate: (p: Pattern) => boolean): Pattern | null;
        clone(name?: string): Pattern;
        isEqual(pattern: InfiniteRepeat): boolean;
    }
}
declare module "patterns/Repeat" {
    import { Node } from "ast/Node";
    import { Cursor } from "patterns/Cursor";
    import { ParseResult } from "patterns/ParseResult";
    import { Pattern } from "patterns/Pattern";
    export interface RepeatOptions {
        min?: number;
        max?: number;
        divider?: Pattern;
        trimDivider?: boolean;
    }
    export class Repeat implements Pattern {
        private _id;
        private _repeatPattern;
        private _parent;
        private _pattern;
        private _options;
        private _children;
        get id(): string;
        get type(): string;
        get name(): string;
        get parent(): Pattern | null;
        set parent(value: Pattern | null);
        get children(): Pattern[];
        get min(): any;
        get max(): any;
        constructor(name: string, pattern: Pattern, options?: RepeatOptions);
        parse(cursor: Cursor): Node | null;
        exec(text: string): ParseResult;
        test(text: string): boolean;
        clone(name?: string): Repeat;
        getTokens(): string[];
        getTokensAfter(_childReference: Pattern): string[];
        getNextTokens(): string[];
        getPatterns(): Pattern[];
        getPatternsAfter(_childReference: Pattern): Pattern[];
        getNextPatterns(): Pattern[];
        find(predicate: (p: Pattern) => boolean): Pattern | null;
        isEqual(pattern: Repeat): boolean;
    }
}
declare module "grammar/patterns/comment" {
    import { Regex } from "patterns/Regex";
    export const comment: Regex;
}
declare module "patterns/filterOutNull" {
    import { Node } from "ast/Node";
    export function filterOutNull(nodes: (Node | null)[]): Node[];
}
declare module "patterns/Sequence" {
    import { Cursor } from "patterns/Cursor";
    import { Pattern } from "patterns/Pattern";
    import { Node } from "ast/Node";
    export class Sequence implements Pattern {
        private _id;
        private _type;
        private _name;
        private _parent;
        private _children;
        private _nodes;
        private _firstIndex;
        get id(): string;
        get type(): string;
        get name(): string;
        get parent(): Pattern | null;
        set parent(pattern: Pattern | null);
        get children(): Pattern[];
        constructor(name: string, sequence: Pattern[]);
        private _assignChildrenToParent;
        test(text: string): boolean;
        exec(text: string, record?: boolean): {
            ast: Node | null;
            cursor: Cursor;
        };
        parse(cursor: Cursor): Node | null;
        private tryToParse;
        private getLastValidNode;
        private areRemainingPatternsOptional;
        private createNode;
        getTokens(): string[];
        getTokensAfter(childReference: Pattern): string[];
        getNextTokens(): string[];
        getPatterns(): Pattern[];
        getPatternsAfter(childReference: Pattern): Pattern[];
        getNextPatterns(): Pattern[];
        find(predicate: (p: Pattern) => boolean): Pattern | null;
        clone(name?: string): Pattern;
        isEqual(pattern: Sequence): boolean;
    }
}
declare module "grammar/patterns/literal" {
    import { Regex } from "patterns/Regex";
    export const literal: Regex;
}
declare module "grammar/patterns/spaces" {
    import { Regex } from "patterns/Regex";
    import { Repeat } from "patterns/Repeat";
    export const tabs: Regex;
    export const spaces: Regex;
    export const newLine: Regex;
    export const lineSpaces: Repeat;
    export const allSpaces: Regex;
}
declare module "grammar/patterns/name" {
    import { Regex } from "patterns/Regex";
    export const name: Regex;
}
declare module "grammar/patterns/regexLiteral" {
    import { Regex } from "patterns/Regex";
    export const regexLiteral: Regex;
}
declare module "grammar/patterns/literals" {
    import { Options } from "patterns/Options";
    export const anonymousLiterals: Options;
    export const anonymousWrappedLiterals: Options;
}
declare module "patterns/Optional" {
    import { Node } from "ast/Node";
    import { Cursor } from "patterns/Cursor";
    import { ParseResult } from "patterns/ParseResult";
    import { Pattern } from "patterns/Pattern";
    export class Optional implements Pattern {
        private _id;
        private _type;
        private _name;
        private _parent;
        private _children;
        get id(): string;
        get type(): string;
        get name(): string;
        get parent(): Pattern | null;
        set parent(pattern: Pattern | null);
        get children(): Pattern[];
        constructor(name: string, pattern: Pattern);
        test(text: string): boolean;
        exec(text: string, record?: boolean): ParseResult;
        parse(cursor: Cursor): Node | null;
        clone(name?: string): Pattern;
        getTokens(): string[];
        getTokensAfter(_childReference: Pattern): string[];
        getNextTokens(): string[];
        getPatterns(): Pattern[];
        getPatternsAfter(_childReference: Pattern): Pattern[];
        getNextPatterns(): Pattern[];
        find(predicate: (p: Pattern) => boolean): Pattern | null;
        isEqual(pattern: Optional): boolean;
    }
}
declare module "grammar/patterns/anonymousPattern" {
    import { Options } from "patterns/Options";
    export const anonymousPattern: Options;
}
declare module "grammar/patterns/repeatLiteral" {
    import { Sequence } from "patterns/Sequence";
    export const repeatLiteral: Sequence;
}
declare module "grammar/patterns/sequenceLiteral" {
    import { Repeat } from "patterns/Repeat";
    import { Sequence } from "patterns/Sequence";
    export const pattern: Sequence;
    export const sequenceLiteral: Repeat;
}
declare module "grammar/patterns/optionsLiteral" {
    import { Repeat } from "patterns/Repeat";
    export const optionsLiteral: Repeat;
}
declare module "grammar/patterns/pattern" {
    import { Options } from "patterns/Options";
    export const pattern: Options;
}
declare module "grammar/patterns/statement" {
    import { Options } from "patterns/Options";
    export const statement: Options;
}
declare module "grammar/patterns/body" {
    import { Optional } from "patterns/Optional";
    export const body: Optional;
}
declare module "grammar/patterns/import" {
    import { Options } from "patterns/Options";
    export const importStatement: Options;
}
declare module "grammar/patterns/grammar" {
    import { Sequence } from "patterns/Sequence";
    export const grammar: Sequence;
}
declare module "patterns/Not" {
    import { Node } from "ast/Node";
    import { Cursor } from "patterns/Cursor";
    import { ParseResult } from "patterns/ParseResult";
    import { Pattern } from "patterns/Pattern";
    export class Not implements Pattern {
        private _id;
        private _type;
        private _name;
        private _parent;
        private _children;
        get id(): string;
        get type(): string;
        get name(): string;
        get parent(): Pattern | null;
        set parent(pattern: Pattern | null);
        get children(): Pattern[];
        get isOptional(): boolean;
        constructor(name: string, pattern: Pattern);
        test(text: string): boolean;
        exec(text: string, record?: boolean): ParseResult;
        parse(cursor: Cursor): Node | null;
        clone(name?: string): Pattern;
        getTokens(): string[];
        getTokensAfter(_childReference: Pattern): string[];
        getNextTokens(): string[];
        getPatterns(): Pattern[];
        getPatternsAfter(_childReference: Pattern): Pattern[];
        getNextPatterns(): Pattern[];
        find(predicate: (p: Pattern) => boolean): Pattern | null;
        isEqual(pattern: Not): boolean;
    }
}
declare module "intellisense/SuggestionOption" {
    export interface SuggestionOption {
        text: string;
        startIndex: number;
    }
}
declare module "intellisense/Suggestion" {
    import { Node } from "ast/Node";
    import { ParseError } from "index";
    import { Cursor } from "patterns/Cursor";
    import { SuggestionOption } from "intellisense/SuggestionOption";
    export interface Suggestion {
        isComplete: boolean;
        options: SuggestionOption[];
        error: ParseError | null;
        errorAtIndex: number | null;
        cursor: Cursor;
        ast: Node | null;
    }
}
declare module "intellisense/AutoComplete" {
    import { Cursor } from "patterns/Cursor";
    import { Pattern } from "patterns/Pattern";
    import { Suggestion } from "intellisense/Suggestion";
    export interface AutoCompleteOptions {
        /**
         * Allows for certain patterns to combine their tokens with the next tokens.
         * Be very careful, this can explode to infinity pretty quick. Usually useful
         * for dividers and spaces.
         */
        greedyPatternNames?: string[];
        /**
         * Allows for custom suggestions for patterns. The key is the name of the pattern
         * and the string array are the tokens suggested for that pattern.
         */
        customTokens?: Record<string, string[]>;
    }
    export class AutoComplete {
        private _pattern;
        private _options;
        private _cursor;
        private _text;
        constructor(pattern: Pattern, options?: AutoCompleteOptions);
        suggestForWithCursor(cursor: Cursor): Suggestion;
        suggestFor(text: string): Suggestion;
        private _getAllOptions;
        private _getOptionsFromErrors;
        private _createSuggestionsFromRoot;
        private _createSuggestionsFromMatch;
        private _getTokensForPattern;
        private _getAugmentedTokens;
        private _createSuggestions;
        private _createSuggestion;
        static suggestFor(text: string, pattern: Pattern, options?: AutoCompleteOptions): Suggestion;
        static suggestForWithCursor(cursor: Cursor, pattern: Pattern, options?: AutoCompleteOptions): Suggestion;
    }
}
declare module "grammar/Grammar" {
    import { Pattern } from "patterns/Pattern";
    export interface GrammarFile {
        resource: string;
        expression: string;
    }
    export interface GrammarOptions {
        resolveImport?: (resource: string, originResource: string | null) => Promise<GrammarFile>;
        originResource?: string | null;
        params?: Pattern[];
    }
    export class Grammar {
        private _params;
        private _originResource?;
        private _resolveImport;
        private _parseContext;
        private _autoComplete;
        constructor(options?: GrammarOptions);
        import(path: string): Promise<Record<string, Pattern>>;
        parse(expression: string): Promise<Record<string, Pattern>>;
        parseString(expression: string): Record<string, Pattern>;
        private _tryToParse;
        private _hasImports;
        private _buildPatterns;
        private _saveLiteral;
        private _buildLiteral;
        private _resolveStringValue;
        private _saveRegex;
        private _buildRegex;
        private _saveOptions;
        private _buildOptions;
        private _buildPattern;
        private _saveSequence;
        private _buildSequence;
        private _saveRepeat;
        private _buildRepeat;
        private _saveConfigurableAnonymous;
        private _buildComplexAnonymousPattern;
        private _resolveImports;
        private _getParams;
        private _getPattern;
        private _saveAlias;
        static parse(expression: string, options?: GrammarOptions): Promise<Record<string, Pattern>>;
        static import(path: string, options?: GrammarOptions): Promise<Record<string, Pattern>>;
        static parseString(expression: string, options?: GrammarOptions): Record<string, Pattern>;
    }
}
declare module "patterns/arePatternsEqual" {
    import { Pattern } from "patterns/Pattern";
    export function arePatternsEqual(a?: Pattern | null, b?: Pattern | null): boolean;
}
declare module "grammar/patterns" {
    import { Pattern } from "patterns/Pattern";
    export function patterns(strings: TemplateStringsArray, ...values: any): Record<string, Pattern>;
}
declare module "index" {
    import { Node } from "ast/Node";
    import { Grammar } from "grammar/Grammar";
    import { Suggestion } from "intellisense/Suggestion";
    import { SuggestionOption } from "intellisense/SuggestionOption";
    import { AutoComplete, AutoCompleteOptions } from "intellisense/AutoComplete";
    import { Cursor } from "patterns/Cursor";
    import { Regex } from "patterns/Regex";
    import { Sequence } from "patterns/Sequence";
    import { Literal } from "patterns/Literal";
    import { Not } from "patterns/Not";
    import { Options } from "patterns/Options";
    import { Optional } from "patterns/Optional";
    import { Repeat } from "patterns/Repeat";
    import { ParseError } from "patterns/ParseError";
    import { Pattern } from "patterns/Pattern";
    import { Reference } from "patterns/Reference";
    import { CursorHistory, Match } from "patterns/CursorHistory";
    import { ParseResult } from "patterns/ParseResult";
    import { grammar } from "grammar/patterns/grammar";
    import { arePatternsEqual } from "patterns/arePatternsEqual";
    import { patterns } from "grammar/patterns";
    export { Node, Grammar, AutoComplete, AutoCompleteOptions, Suggestion, SuggestionOption, Sequence, Cursor, CursorHistory, Match, Literal, Not, Options, Optional, ParseError, ParseResult, Pattern, Reference, Regex, Repeat, grammar, arePatternsEqual, patterns, };
}
