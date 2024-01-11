import { Pattern } from "./Pattern";

export function findPattern(pattern: Pattern | null, predicate: (pattern: Pattern) => boolean): Pattern | null {
    if (pattern === null) {
        return null;
    }

    let children: Pattern[] = [];

    if (pattern.type === "reference") {
        children = [];
    } else {
        children = pattern.children;
    }

    for (const child of children) {
        const result = findPattern(child, predicate);

        if (result !== null) {
            return result;
        }
    }

    if (predicate(pattern)) {
        return pattern;
    } else {
        return null;
    }
}
