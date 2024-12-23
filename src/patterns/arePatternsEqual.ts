import { Literal } from "./Literal";
import { Pattern } from "./Pattern";

export function arePatternsEqual(a?: Pattern | null, b?: Pattern | null): boolean {
    if (a === b) {
        return true;
    } else if (a == null || b == null) {
        return false;
    }

    return a.isEqual(b);
}