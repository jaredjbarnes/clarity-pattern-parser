import { GrammarFile } from "../../grammar/Grammar";
import { Pattern } from "../../patterns/Pattern";
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
    private _resolveImportSync;
    constructor(options: GrammarOptions);
    private _resolveImportsSync;
    private _processImportSync;
    private _getWithParams;
    private _processUseParams;
    private _tryToParse;
    private _flattenExpressions;
    private _unwrapNode;
}
