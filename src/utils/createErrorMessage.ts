import { Cursor } from "../patterns/Cursor";
import { Pattern } from "../patterns/Pattern";

export function createErrorMessage(rootPattern: Pattern, cursor: Cursor) {
    const leafMatches = cursor.leafMatches;
    let nextTokens = leafMatches.map(m => m.pattern?.getNextTokens()).flat().reduce<string[]>((acc, t) => {
        if (t != null && !acc.includes(t)) {
            acc.push(t);
        }
        return acc;
    }, []);

    let lastIndex = 0;

    if (leafMatches.length > 0) {
        lastIndex = leafMatches[0].node?.lastIndex || 0;
    } else {
        nextTokens = rootPattern.getTokens();
    }

    const text = cursor.text;
    const beforeError = text.slice(Math.max(lastIndex - 5, 0), lastIndex + 1);
    const afterError = text.slice(lastIndex + 1, lastIndex + 6);

    return `[Parse Error] Found:"${beforeError + afterError}". Expected: ${nextTokens.map(t => `"${beforeError + t}"`).join(" or ")}.`;
}