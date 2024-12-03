import { Cursor } from "../patterns/Cursor";
import { Pattern } from "../patterns/Pattern";
import { Suggestion } from "./Suggestion";
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
export declare class AutoComplete {
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
