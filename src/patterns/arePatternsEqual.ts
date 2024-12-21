import { Pattern } from "./Pattern";

export function arePatternsEqual(a?: Pattern | null, b?: Pattern | null): boolean {
    if (a === b) {
        return true;
    } else if (a == null || b == null) {
        return false;
    }

    return a.type === b.type &&
        a.name === b.name &&
        a.isOptional === b.isOptional &&
        a.children.every((c, index) => arePatternsEqual(c, b.children[index]));

}