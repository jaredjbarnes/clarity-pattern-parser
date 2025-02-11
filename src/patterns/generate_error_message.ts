import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";

export function generateErrorMessage(pattern: Pattern, cursor: Cursor) {
    const furthestMatch = cursor.leafMatch;

    if (furthestMatch == null || furthestMatch.node == null || furthestMatch.pattern == null) {
        const suggestions = cleanSuggestions(pattern.getTokens()).join(", ");
        return `Error at line 1, column 1. Hint: ${suggestions}`;
    }

    const endIndex = furthestMatch.node.endIndex;

    if (endIndex === 0) {
        const suggestions = cleanSuggestions(pattern.getTokens()).join(", ");
        return `Error at line 1, column 1. Hint: ${suggestions}`;
    }

    const lastPattern = furthestMatch.pattern as Pattern;
    const suggestions = cleanSuggestions(lastPattern.getTokens());
    const strUpToError = cursor.getChars(0, endIndex);
    const lines = strUpToError.split("\n");
    const lastLine = lines[lines.length - 1];
    const line = lines.length;
    const column = lastLine.length;

    return `Error at line ${line}, column ${column}. Hint: ${suggestions}`;

}

function cleanSuggestions(suggestions: string[]) {
    return suggestions.map(s => s.trim()).filter(s => s.length > 0);
}