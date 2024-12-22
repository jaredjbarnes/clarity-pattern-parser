import { Pattern } from "../patterns/Pattern";
export interface GrammarFile {
    resource: string;
    expression: string;
}
export interface GrammarOptions {
    resolveImport?: (resource: string, originResource: string | null) => Promise<GrammarFile>;
    originResource?: string | null;
    params?: Pattern[];
}
export declare class Grammar {
    private _params;
    private _originResource?;
    private _resolveImport;
    private _parseContext;
    private _autoComplete;
    constructor(options?: GrammarOptions);
    import(path: string): Promise<Map<string, Pattern>>;
    parse(expression: string): Promise<Map<string, Pattern>>;
    parseString(expression: string): Map<string, Pattern>;
    private _tryToParse;
    private _hasImports;
    private _buildPatterns;
    private _saveLiteral;
    private _buildLiteral;
    private _resolveStringValue;
    private _saveRegex;
    private _buildRegex;
    private _saveOr;
    private _buildOr;
    private _buildPattern;
    private _saveAnd;
    private _buildAnd;
    private _saveRepeat;
    private _buildRepeat;
    private _saveConfigurableAnonymous;
    private _buildComplexAnonymousPattern;
    private _resolveImports;
    private _getParams;
    private _getPattern;
    private _saveAlias;
    static parse(expression: string, options?: GrammarOptions): Promise<Map<string, Pattern>>;
    static import(path: string, options?: GrammarOptions): Promise<Map<string, Pattern>>;
    static parseString(expression: string, options?: GrammarOptions): Map<string, Pattern>;
}
