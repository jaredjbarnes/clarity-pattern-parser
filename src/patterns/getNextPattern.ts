import { Pattern } from "./Pattern";

export function getNextPattern(pattern: Pattern): Pattern | null {
    const parent = pattern.parent;

    if (parent == null) {
        return null;
    }

    const patternIndex = parent.children.indexOf(pattern);
    const nextPattern = parent.children[patternIndex + 1] || null;

    if (nextPattern == null) {
        return parent.getNextPattern();
    }

    return nextPattern;
}