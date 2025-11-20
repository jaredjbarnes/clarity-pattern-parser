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
    /**
     * Suggestions may share the same text but differ in their suggestionSequence.
     * By default, duplicates are removed and only the first instance is kept.
     * Disabling deduplication allows all distinct instances to be returned together.
     */
    disableDedupe?: boolean;
}
export declare class AutoComplete {
    private _pattern;
    private _options;
    private _cursor;
    private _text;
    constructor(pattern: Pattern, options?: AutoCompleteOptions);
    suggestFor(text: string): Suggestion;
    suggestForWithCursor(cursor: Cursor): Suggestion;
    private getFurthestPosition;
    private _getAllSuggestionsOptions;
    private _createSuggestionOptionsFromErrors;
    private _createSuggestionOptionsFromMatch;
    /**
     * Compares suggestions with provided text and removes completed sub-sequences and preceding text
     * - IE. **currentText:** *abc*, **sequence:** *[{ab}{cd}{ef}*
     *   - refines to {d}{ef}
     */
    private _trimSuggestionsByExistingText;
    /** Removed segments already accounted for in the existing text.
   * ie. sequence pattern segments ≈ [{look}, {an example}, {phrase}]
   * fullText = "look an"
   * remove {look} segment as its already been completed by the existing text.
  */
    private _filterCompletedSubSegments;
    private _getCompositeSuggestionsForPattern;
    private _getCustomTokens;
    private _deDupeCompositeSuggestions;
    private _createSuggestions;
    private _createSuggestionOption;
    static suggestFor(text: string, pattern: Pattern, options?: AutoCompleteOptions): Suggestion;
    static suggestForWithCursor(cursor: Cursor, pattern: Pattern, options?: AutoCompleteOptions): Suggestion;
}
