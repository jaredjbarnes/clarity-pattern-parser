import { Pattern } from "../patterns/Pattern";
/**
 * A CompositeSuggestion associated with a index to start at when inserting into existing text.
 */
export interface SuggestionOption extends CompositeSuggestion {
    startIndex: number;
}
/**
 * Represents a composed suggestion, derived from potential next tokens defined by the pattern, and configured auto complete options
 * text: represents the full composed text of the suggestion; a concatenated string of relevant suggestion segments.
 */
export interface CompositeSuggestion {
    text: string;
    suggestionSequence: SuggestionSegment[];
}
/** A segment of a parent composite suggestion and a reference to the pattern that this segment token was derived from. */
export interface SuggestionSegment {
    text: string;
    pattern: Pattern;
}
