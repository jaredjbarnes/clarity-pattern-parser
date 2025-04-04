import { Pattern } from "../patterns/Pattern";
export type Decorator = (pattern: Pattern, arg?: string | boolean | number | null | Record<string, any> | any[]) => void;
export interface GrammarFile {
    resource: string;
    expression: string;
}
export interface GrammarOptions {
    resolveImport?: (resource: string, originResource: string | null) => Promise<GrammarFile>;
    originResource?: string | null;
    params?: Pattern[];
    decorators?: Record<string, Decorator>;
}
export declare class Grammar {
    private _params;
    private _originResource?;
    private _resolveImport;
    private _parseContext;
    constructor(options?: GrammarOptions);
    import(path: string): Promise<Record<string, Pattern>>;
    parse(expression: string): Promise<Record<string, Pattern>>;
    parseString(expression: string): Record<string, Pattern>;
    private _buildPatternRecord;
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
    private _isRecursive;
    private _isRecursivePattern;
    private _buildPattern;
    private _saveSequence;
    private _buildSequence;
    private _saveRepeat;
    private _buildRepeat;
    private _saveTakeUntil;
    private _buildTakeUntil;
    private _saveConfigurableAnonymous;
    private _buildComplexAnonymousPattern;
    private _resolveImports;
    private processImport;
    private processUseParams;
    private _applyDecorators;
    private _getParams;
    private _getPattern;
    private _saveAlias;
    static parse(expression: string, options?: GrammarOptions): Promise<Record<string, Pattern>>;
    static import(path: string, options?: GrammarOptions): Promise<Record<string, Pattern>>;
    static parseString(expression: string, options?: GrammarOptions): Record<string, Pattern>;
}
