import Node from "./ast/Node";
import Pattern from "./patterns/Pattern";
export interface Token {
    startIndex: number;
    values: string[];
}
export interface SuggestionError {
    startIndex: number;
    endIndex: number;
    text: string;
}
export interface SuggestionMatch {
    startIndex: number;
    endIndex: number;
    text: string;
}
export interface SuggestionResult {
    pattern: Pattern | null;
    astNode: Node | null;
    match: SuggestionMatch | null;
    error: SuggestionError | null;
    options: Token;
    isComplete: boolean;
    parseStack: Node[];
}
export default class TextSuggester {
    private cursor;
    private result;
    private text;
    private match;
    private error;
    private patternMatch;
    private matchedText;
    private rootPattern;
    private tokens;
    private options;
    private parseStack;
    suggest(text: string, pattern: Pattern): SuggestionResult;
    private reset;
    private parse;
    private saveParseStack;
    private saveMatchedText;
    private saveMatch;
    private saveError;
    private saveNextToken;
    private saveOptions;
    static suggest(text: string, pattern: Pattern): SuggestionResult;
}
