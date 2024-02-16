import { Pattern } from "../patterns/Pattern";
export declare class Grammar {
    private _parseContext;
    private _autoComplete;
    constructor();
    parse(expression: string): Map<string, Pattern>;
    private _tryToParse;
    private _cleanAst;
    private _buildPatterns;
    private _buildLiteral;
    private _buildRegex;
    private _buildOr;
    private _getPattern;
    private _buildAnd;
    private _buildRepeat;
    private _buildAlias;
    static parse(expression: string): Map<string, Pattern>;
}
