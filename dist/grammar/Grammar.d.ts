import { Pattern } from "../patterns/Pattern";
export interface GrammarMeta {
    url?: string;
}
export interface GrammarOptions {
    resolveImport?: (path: string, basePath: string | null) => Promise<string>;
    meta?: GrammarMeta | null;
}
export declare class Grammar {
    private _meta;
    private _resolveImport;
    private _parseContext;
    private _autoComplete;
    constructor(options?: GrammarOptions);
    import(path: string): Promise<Map<string, Pattern>>;
    parse(expression: string): Promise<Map<string, Pattern>>;
    parseString(expression: string): Map<string, Pattern>;
    private _tryToParse;
    private _hasImports;
    private _cleanAst;
    private _buildPatterns;
    private _resolveImports;
    private _buildLiteral;
    private _buildRegex;
    private _buildOr;
    private _getPattern;
    private _buildAnd;
    private _buildRepeat;
    private _buildAlias;
    static parse(expression: string, options?: GrammarOptions): Promise<Map<string, Pattern>>;
    static import(path: string, options?: GrammarOptions): Promise<Map<string, Pattern>>;
    static parseString(expression: string): Map<string, Pattern>;
}
