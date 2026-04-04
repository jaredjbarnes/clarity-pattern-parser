export interface GrammarFile {
    resource: string;
    expression: string;
}
import { Pattern } from "../patterns/Pattern";
export type Decorator = (pattern: Pattern, arg?: string | boolean | number | null | Record<string, any> | any[]) => void;
export interface GrammarOptions {
    resolveImport?: (resource: string, originResource: string | null) => Promise<GrammarFile>;
    resolveImportSync?: (resource: string, originResource: string | null) => GrammarFile;
    originResource?: string | null;
    params?: Pattern[];
    decorators?: Record<string, Decorator>;
}
export declare class Grammar {
    private _options;
    private _parseContext;
    private _params;
    private _originResource?;
    private _resolveImport;
    private _resolveImportSync;
    constructor(options?: GrammarOptions);
    import(path: string): Promise<Record<string, Pattern>>;
    parse(expression: string): Promise<Record<string, Pattern>>;
    parseString(expression: string): Record<string, Pattern>;
    static parse(expression: string, options?: GrammarOptions): Promise<Record<string, Pattern>>;
    static import(path: string, options?: GrammarOptions): Promise<Record<string, Pattern>>;
    static parseString(expression: string, options?: GrammarOptions): Record<string, Pattern>;
    private _tryToParse;
    private _flattenExpressionsRecursive;
    private _unwrapNode;
    private _buildPatternRecord;
    private _buildPatterns;
    private _buildPattern;
    private _buildLiteral;
    private _buildRegex;
    private _buildSequence;
    private _extractBlockDelimiterValue;
    private _buildOptions;
    private _buildGreedyOptions;
    private _buildRepeat;
    private _buildPatternGroup;
    private _buildNot;
    private _buildOptional;
    private _buildRightAssociation;
    private _buildTakeUntil;
    private _resolveStringValue;
    private _getPattern;
    private _isRecursive;
    private _isRecursivePattern;
    private _applyDecorators;
    private _resolveImports;
    private _resolveImportsSync;
    private _processImportSync;
    private _processImport;
    private _processImportNames;
    private _getWithParams;
    private _processUseParams;
}
